'use strict'

const fs = require('fs');
const { Client } = require('whatsapp-web.js');

class WhatsappController {

    constructor({ config, Log }) {
        this._config = config;
        this._log = Log;
        this.SESSION_FILE_PATH = __dirname + '/../../data/session.json';
        this.auth = false;
        this.sessionData = null;
        this.qr = "";
        if (fs.existsSync(this.SESSION_FILE_PATH)) {
            this.sessionData = require(this.SESSION_FILE_PATH);
        }
    }

    status(req, res) {
        try {
            res.status(200).send({ status: 200, message: 'Status', payload: { auth: this.auth } });
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    generateQR(req, res) {
        try {
            res.status(200).send({ status: 200, message: 'Scan the code with whatsapp', payload: { qr: this.qr } });
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    logout(req, res) {
        try {
            this.auth = false;
            try {
                this.client.logout();
            } catch (error) { }
            try {
                fs.unlinkSync(this.SESSION_FILE_PATH);
            } catch (error) { }
            res.status(200).send({ status: 200, message: 'logout OK', payload: {} });
            setTimeout(() => {
                process.exit();
            }, 1500);
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    Connection() {
        try {
            this.client = new Client({ session: this.sessionData });

            this.client.on('ready', () => {
                this._log.log('Client is ready!');
                this.auth = true;
                this.app();
            });

            this.client.on('disconnected', () => {
                this._log.log('Client is disconnected!');
                this.auth = false;
            });

            this.client.on('auth_failure', () => {
                this._log.log('Client is auth failure!');
                this.auth = false;
                try {
                    this.client.logout();
                } catch (error) { }
                try {
                    fs.unlinkSync(this.SESSION_FILE_PATH);
                } catch (error) { }
            });

            this.client.on('change_state', (status) => {
                this._log.log('Client is change state!');
                this._log.log(status);
            });

            this.client.on('authenticated', (session) => {
                this._log.log('Client is authenticated!');
                if (this.sessionData === null) {
                    this.sessionData = session;
                    console.log(this.sessionData);
                    fs.writeFile(this.SESSION_FILE_PATH, JSON.stringify(session), (err) => {
                        if (err) {
                            this._log.error(err);
                        }
                        process.exit();
                    });
                }
                this.sessionData = session;
            });

            setTimeout(() => {
                if (!this.auth) {
                    this.client.on('qr', qr => {
                        this._log.log(qr);
                        this.qr = qr;
                    });
                }
            }, 5000);

            this.client.initialize();
        } catch (error) {
            this._log.error(error.message);
        }
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                this.Connection();
            } catch (error) {
                this._log.error(error.message);
            }
            resolve();
        });
    }

    welcome() {
        try {
            this.client.sendMessage(this._config.ADMIN_NUMBER_1 + "@c.us", "WhatsApp is listening");

            if (this._config.ADMIN_NUMBER_1 !== this._config.ADMIN_NUMBER_2) {
                this.client.sendMessage(this._config.ADMIN_NUMBER_2 + "@c.us", "WhatsApp is listening");
            }

            if (this._config.ADMIN_NUMBER_1 !== this._config.ADMIN_NUMBER_3 && this._config.ADMIN_NUMBER_2 !== this._config.ADMIN_NUMBER_3) {
                this.client.sendMessage(this._config.ADMIN_NUMBER_3 + "@c.us", "WhatsApp is listening");
            }
        } catch (error) {
            this._log.error(error.message);
        }
    }

    app() {
        try {
            if (this.auth) {
                this._log.log("Ready to interact with whatsapp");
                this.welcome();

            } else {
                this._log.log("You're not online");
            }
        } catch (error) {
            this._log.error(error.message);
        }
    }

}

module.exports = WhatsappController;