'use strict'

const express = require('express');
const WebSocket = require('ws');
const app = express();

class WssController {

    constructor({ config, Log }) {
        this._config = config;
        this._log = Log;
        this.wsServer = null
        this.connectedClients = [];
        this.connectedCamera = null;
        this.KEY_STREAMING = config.KEY_STREAMING;
        this.KEY_READ_STREAMING = config.KEY_READ_STREAMING;
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                this.wsServer = new WebSocket.Server({ port: this._config.PORT_STREAMING }, () => this._log.log(`WS server streaming is listening at ws://0.0.0.0:${this._config.PORT_STREAMING}`));

                this.wsServer.on('connection', (ws, req) => {

                    this._log.log('Connected device');

                    ws.on('message', data => {
                        try {
                            if (data === 'SET_STREAM|' + this.KEY_STREAMING) {
                                this.connectedCamera = ws;
                            } else if (data === 'READ_STREAM|' + this.KEY_READ_STREAMING) {
                                this.connectedClients.push(ws);
                                if (this.connectedCamera !== null) {
                                    this.connectedCamera.send('START_STREAM');
                                }
                            } else if (data.indexOf('SEND_STREAM') >= 0) {
                                data = data.replace('SEND_STREAM', '');
                                this.connectedClients.forEach((ws, i) => {
                                    if (ws.readyState === ws.OPEN) {
                                        ws.send(data);
                                    } else {
                                        this.connectedClients.splice(i, 1);
                                    }
                                });
                            }
                        } catch (error) {
                            this._log.error(error.message);
                        }
                    });

                });

                this.checkConnections();

            } catch (error) {
                this._log.error(error.message);
            }
            resolve();
        });
    }

    checkConnections() {
        try {
            if (this.connectedCamera !== null) {
                if (this.connectedCamera.readyState !== ws.OPEN) {
                    this.connectedCamera = null;
                }
            }
            this.connectedClients.forEach((ws, i) => {
                if (ws.readyState !== ws.OPEN) {
                    this.connectedClients.splice(i, 1);
                }
            });
            if (this.connectedClients.length === 0 && this.connectedCamera !== null) {
                this.connectedCamera.send('STOP_STREAM');
            }
        } catch (error) {
            this._log.error(error.message);
        }
        setTimeout(() => {
            this.checkConnections();
        }, 3000);
    }

}

module.exports = WssController;