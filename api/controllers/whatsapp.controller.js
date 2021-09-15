'use strict'

const fs = require('fs');
const { Client } = require('whatsapp-web.js');
const shellExec = require('shell-exec');

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
            if (this._config.PUPPETEER_WHATSAPP === true || this._config.PUPPETEER_WHATSAPP === 'true') {
                this.client = new Client({ puppeteer: { headless: true, executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions'] }, session: this.sessionData });
            } else {
                this.client = new Client({ session: this.sessionData });
            }

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
                if (this._config.WHATSAPP === true || this._config.WHATSAPP === 'true') {
                    this._log.log("WhatsApp service started");
                    this.Connection();
                }
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

    async openDoor(from, body) {
        console.log("openDoor");
        this.client.sendMessage(from, body);
    }

    async openGarage(from, body) {
        console.log("openGarage");
        this.client.sendMessage(from, body);
    }

    async onAlarm(from, body) {
        console.log("onAlarm");
        this.client.sendMessage(from, body);
    }

    async offAlarm(from, body) {
        console.log("offAlarm");
        this.client.sendMessage(from, body);
    }

    async call(from, body) {
        console.log("call");
        this.client.sendMessage(from, body);
    }

    async picture(from, body) {
        console.log("picture");
        this.client.sendMessage(from, body);
    }

    async video(from, body) {
        console.log("video");
        this.client.sendMessage(from, body);
    }

    app() {
        try {
            if (this.auth) {
                this._log.log("Ready to interact with whatsapp");
                if (this._config.WELCOME_STATUS_WHATSAPP === true || this._config.WELCOME_STATUS_WHATSAPP === 'true') {
                    this.welcome();
                }
                const c = this._config;
                this.client.on('message', async (msg) => {
                    if (msg.from.indexOf(c.ADMIN_NUMBER_1) >= 0 || msg.from.indexOf(c.ADMIN_NUMBER_2) >= 0 || msg.from.indexOf(c.ADMIN_NUMBER_3) >= 0) {
                        if (!msg.hasMedia) {
                            if (msg.body === '🚪') {
                                this.openDoor(msg.from, msg.body);
                            } else if (msg.body === '🚗') {
                                this.openGarage(msg.from, msg.body);
                            } else if (msg.body === '🔔') {
                                this.onAlarm(msg.from, msg.body);
                            } else if (msg.body === '🔕') {
                                this.offAlarm(msg.from, msg.body);
                            } else if (msg.body === '📞') {
                                this.call(msg.from, msg.body);
                            } else if (msg.body === '📷') {
                                this.picture(msg.from, msg.body);
                            } else if (msg.body === '🎥') {
                                this.video(msg.from, msg.body);
                            }
                        } else {
                            if (msg.type === 'ptt') {
                                const attachmentData = await msg.downloadMedia();
                                const pathFileVoice = __dirname + '/../../data/voice.ogg';
                                const _this = this;
                                fs.writeFile(pathFileVoice, attachmentData.data, 'base64', function (err) {
                                    if (err != null) {
                                        this._log.log(err);
                                    } else {
                                        _this.client.sendMessage(msg.from, '🎵');
                                        if (_this._config.AUDIO_AUTOPLAY_WHATSAPP === true || _this._config.AUDIO_AUTOPLAY_WHATSAPP === 'true') {
                                            shellExec('omxplayer -o local --vol 500 ' + pathFileVoice);
                                        }
                                    }
                                });
                            }
                        }
                    }
                });
            } else {
                this._log.log("You're not online");
            }
        } catch (error) {
            this._log.error(error.message);
        }
    }

}

module.exports = WhatsappController;