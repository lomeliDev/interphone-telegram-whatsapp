'use strict'

const fs = require('fs');
const WebSocket = require('ws');

class WssController {

    constructor({ config, Log }) {
        this._config = config;
        this._log = Log;
        this.wsServer = null
        this.connectedClients = [];
        this.connectedCamera = null;
        this.KEY_STREAMING = config.KEY_STREAMING;
        this.KEY_READ_STREAMING = config.KEY_READ_STREAMING;
        this.pathPhoto = __dirname + '/../../data/camera.jpg';
        this.pathVideo = __dirname + '/../../data/camera.avi';
    }

    startPhoto() {
        try {
            fs.unlinkSync(this.pathPhoto);
        } catch (error) { }
        if (this.connectedCamera !== null) {
            this.connectedCamera.send('START_PHOTO');
            return true;
        } else {
            return false;
        }
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                this.wsServer = new WebSocket.Server({ port: this._config.PORT_STREAMING }, () => this._log.log(`WS server streaming is listening at ws://0.0.0.0:${this._config.PORT_STREAMING}`));

                this.wsServer.on('connection', (ws, req) => {

                    ws.on('message', data => {
                        try {
                            if (data === 'SET_STREAM|' + this.KEY_STREAMING) {
                                this.connectedCamera = ws;
                                this._log.log('Connected stream');
                            } else if (data === 'READ_STREAM|' + this.KEY_READ_STREAMING) {
                                this.connectedClients.push(ws);
                                this._log.log('Connected device');
                                if (this.connectedCamera !== null) {
                                    this.connectedCamera.send('START_STREAM');
                                }
                            } else if (data === 'STOP_STREAM|' + this.KEY_READ_STREAMING) {
                                if (this.connectedCamera !== null) {
                                    this.connectedCamera.send('STOP_STREAM');
                                }
                            } else if (data === 'START_PHOTO|' + this.KEY_READ_STREAMING) {
                                try {
                                    fs.unlinkSync(this.pathPhoto);
                                } catch (error) { }
                                if (this.connectedCamera !== null) {
                                    this.connectedCamera.send('START_PHOTO');
                                }
                            } else if (data === 'START_VIDEO|' + this.KEY_READ_STREAMING) {
                                try {
                                    fs.unlinkSync(this.pathVideo);
                                } catch (error) { }
                                if (this.connectedCamera !== null) {
                                    this.connectedCamera.send('START_VIDEO');
                                }
                            } else if (this.connectedCamera === ws && data.substring(0, 4) === '/9j/') {
                                this.connectedClients.forEach((ws, i) => {
                                    if (ws.readyState === ws.OPEN) {
                                        ws.send(data);
                                    } else {
                                        this.connectedClients.splice(i, 1);
                                        this._log.log('Disconnected device');
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
                if (this.connectedCamera.readyState !== this.connectedCamera.OPEN) {
                    this.connectedCamera = null;
                    this._log.log('Disconnected stream');
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
        }, 300000);
    }

}

module.exports = WssController;