'use strict'

const fs = require('fs');
const { Client, MessageMedia } = require('whatsapp-web.js');
const shellExec = require('shell-exec');
const fetch = require('node-fetch');

class WhatsappController {

    constructor({ config, Log, PhotoController, VideoController, RelaysController, pjsuaController, GatewayController }) {
        this._config = config;
        this._log = Log;
        this._photo = PhotoController;
        this._video = VideoController;
        this._relays = RelaysController;
        this._pjsua = pjsuaController;
        this._gateway = GatewayController;
        this.SESSION_FILE_PATH = __dirname + '/../../data/session.json';
        this.auth = false;
        this.sessionData = null;
        this.lastReceived = 0;
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
            if (this._config.ADMIN_NUMBER_1 !== undefined && this._config.ADMIN_NUMBER_1 !== "") {
                this.client.sendMessage(this._config.ADMIN_NUMBER_1 + "@c.us", "WhatsApp is listening");
            }

            if (this._config.ADMIN_NUMBER_2 !== undefined && this._config.ADMIN_NUMBER_2 !== "") {
                if (this._config.ADMIN_NUMBER_1 !== this._config.ADMIN_NUMBER_2) {
                    this.client.sendMessage(this._config.ADMIN_NUMBER_2 + "@c.us", "WhatsApp is listening");
                }
            }

            if (this._config.ADMIN_NUMBER_3 !== undefined && this._config.ADMIN_NUMBER_3 !== "") {
                if (this._config.ADMIN_NUMBER_1 !== this._config.ADMIN_NUMBER_3 && this._config.ADMIN_NUMBER_2 !== this._config.ADMIN_NUMBER_3) {
                    this.client.sendMessage(this._config.ADMIN_NUMBER_3 + "@c.us", "WhatsApp is listening");
                }
            }
        } catch (error) {
            this._log.error(error.message);
        }
    }

    async openDoor(from, body) {
        this.client.sendMessage(from, body);
        this._relays.openDoor();
    }

    async openGarage(from, body) {
        this.client.sendMessage(from, body);
        this._relays.openGarage();
    }

    async onLight(from, body) {
        this.client.sendMessage(from, body);
        this._relays.onLight();
        this._gateway.onLight();
    }

    async offLight(from, body) {
        this.client.sendMessage(from, body);
        this._relays.offLight();
        this._gateway.offLight();
    }

    async onAlarm(from, body) {
        this.client.sendMessage(from, body);
        this._relays.onAlarm();
        this._gateway.onAlarm();
    }

    async offAlarm(from, body) {
        this.client.sendMessage(from, body);
        this._relays.offAlarm();
        this._gateway.offAlarm();
    }

    async call(from, body) {
        this.client.sendMessage(from, body);
        if (from.indexOf(this._config.ADMIN_NUMBER_1) >= 0) {
            this._pjsua.call(this._config.SIP_NUMBER_ADMIN_1);
        } else if (from.indexOf(this._config.ADMIN_NUMBER_2) >= 0) {
            this._pjsua.call(this._config.SIP_NUMBER_ADMIN_2);
        } else if (from.indexOf(this._config.ADMIN_NUMBER_3) >= 0) {
            this._pjsua.call(this._config.SIP_NUMBER_ADMIN_3);
        }
    }

    async ringall(from, body) {
        this.client.sendMessage(from, body);
        this._pjsua.call(this._config.SIP_QUEUE);
    }

    async picture(from, body) {
        this.client.sendMessage(from, body);
        this._photo.capture(this.sendPhotoCallback, from, this, null);
        if (this._config.RELAY_PHOTO_STATUS === 'true' || this._config.RELAY_PHOTO_STATUS === true) {
            this._relays.onLight();
            setTimeout(() => {
                this._relays.offLight();
            }, this._config.RELAY_PHOTO_TIME);
        }
    }

    sendPhotoCallback(path, arg_1, arg_2, arg_3) {
        if (arg_3 === true) {
            try {
                const media = MessageMedia.fromFilePath(path);
                arg_2.client.sendMessage(arg_1, media);
            } catch (error) { }
        } else {
            arg_2.client.sendMessage(arg_1, "Image capture failed");
        }
    }

    async video(from, body) {
        this.client.sendMessage(from, body);
        this._video.capture(this.sendVideoCallback, from, this, null);
        if (this._config.RELAY_VIDEO_STATUS === 'true' || this._config.RELAY_VIDEO_STATUS === true) {
            this._relays.onLight();
            setTimeout(() => {
                this._relays.offLight();
            }, this._config.RELAY_VIDEO_TIME);
        }
    }

    sendVideoCallback(path, arg_1, arg_2, arg_3) {
        if (arg_3 === true) {
            try {
                const media = MessageMedia.fromFilePath(path);
                arg_2.client.sendMessage(arg_1, media);
            } catch (error) { }
        } else {
            arg_2.client.sendMessage(arg_1, "Video capture failed");
        }
    }

    fetchESP32(timeout, path) {
        try {
            setTimeout(() => {
                fetch(`http://${this._config.HOST_CAMERA}/${path}`).then(res => res).then(json => { });
            }, timeout);
        } catch (error) { }
    }

    async esp32(from, body) {
        this.client.sendMessage(from, body);
        this.fetchESP32(0, 'reboot');
    }

    async pjsua(from, body) {
        this.client.sendMessage(from, body);
        this._pjsua.close();
        setTimeout(async () => {
            await this._pjsua.run();
        }, 5000);
    }

    async hangup(from, body) {
        this.client.sendMessage(from, body);
        this._pjsua.HangUp();
    }

    async command(from, command) {
        const result = await shellExec(command);
        this.client.sendMessage(from, result.stdout);
    }

    async redirect(from) {
        let urlRedirect = `${this._config.URL_HOST}/`;
        try {
            if (this._config.CAMERA === "ESP32") {
                urlRedirect = `${this._config.URL_HOST}/http://${this._config.HOST_CAMERA}/mjpeg/1`;
            } else if (this._config.CAMERA === "NATIVE") {
                urlRedirect = `${this._config.URL_HOST}/http://127.0.0.1:${this._config.PORT_API}/stream/stream.mjpg`;
            }
        } catch (error) {
            urlRedirect = `${this._config.URL_HOST}/`;
        }
        this.client.sendMessage(from, urlRedirect);
    }

    app() {
        try {
            if (this.auth) {
                this._log.log("Ready to interact with whatsapp");
                if (this._config.WELCOME_STATUS_WHATSAPP === true || this._config.WELCOME_STATUS_WHATSAPP === 'true') {
                    this.welcome();
                }
                this.lastReceived = Date.now() + (1000 * 5);
                const c = this._config;
                this.client.on('message', async (msg) => {
                    if (msg.from.indexOf(c.ADMIN_NUMBER_1) >= 0 || msg.from.indexOf(c.ADMIN_NUMBER_2) >= 0 || msg.from.indexOf(c.ADMIN_NUMBER_3) >= 0) {
                        if (Date.now() > this.lastReceived || this.lastReceived == 0) {
                            if (!msg.hasMedia) {
                                if (msg.body === '????') {
                                    this.openDoor(msg.from, msg.body);
                                } else if (msg.body === '????') {
                                    this.openGarage(msg.from, msg.body);
                                } else if (msg.body === '????') {
                                    this.onAlarm(msg.from, msg.body);
                                } else if (msg.body === '????') {
                                    this.offAlarm(msg.from, msg.body);
                                } else if (msg.body === '????') {
                                    this.call(msg.from, msg.body);
                                } else if (msg.body === '???????') {
                                    this.ringall(msg.from, msg.body);
                                } else if (msg.body === '????') {
                                    this.picture(msg.from, msg.body);
                                } else if (msg.body === '????') {
                                    this.video(msg.from, msg.body);
                                } else if (msg.body === '???') {
                                    this.onLight(msg.from, msg.body);
                                } else if (msg.body === '???') {
                                    this.offLight(msg.from, msg.body);
                                } else if (msg.body === 'esp32') {
                                    this.esp32(msg.from, msg.body);
                                } else if (msg.body === 'pjsua') {
                                    this.pjsua(msg.from, msg.body);
                                } else if (msg.body === 'hangup') {
                                    this.hangup(msg.from, msg.body);
                                } else if (msg.body === 'free') {
                                    this.command(msg.from, "free -h");
                                } else if (msg.body === 'df') {
                                    this.command(msg.from, "df -h");
                                } else if (msg.body === 'top') {
                                    this.command(msg.from, "top -b -n 1");
                                } else if (msg.body === 'reboot') {
                                    this.command(msg.from, "sudo reboot");
                                } else if (msg.body === 'redirect') {
                                    this.redirect(msg.from);
                                }
                            } else {
                                if (msg.type === 'ptt') {
                                    const attachmentData = await msg.downloadMedia();
                                    const pathFileVoice = __dirname + '/../../data/voice.ogg';
                                    try {
                                        fs.unlinkSync(pathFileVoice);
                                    } catch (error) { }
                                    const _this = this;
                                    fs.writeFile(pathFileVoice, attachmentData.data, 'base64', function (err) {
                                        if (err != null) {
                                            this._log.log(err);
                                        } else {
                                            _this.client.sendMessage(msg.from, '????');
                                            if (_this._config.AUDIO_AUTOPLAY_WHATSAPP === true || _this._config.AUDIO_AUTOPLAY_WHATSAPP === 'true') {
                                                shellExec(`screen -S audio -d -m ffplay -i ${pathFileVoice} -autoexit -nodisp`);
                                                //shellExec(`screen -S audio -d -m omxplayer -o ${_this._config.AUDIO_DEVICE_ID_SOUND_CARD} --vol 900 ${pathFileVoice}`);
                                            }
                                        }
                                    });
                                }
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

    sendMessage(message) {
        try {
            if (this._config.WHATSAPP === true || this._config.WHATSAPP === 'true') {
                if (this.auth) {
                    if (this._config.ADMIN_NUMBER_1 !== undefined && this._config.ADMIN_NUMBER_1 !== "") {
                        this.client.sendMessage(this._config.ADMIN_NUMBER_1 + "@c.us", message);
                    }

                    if (this._config.ADMIN_NUMBER_2 !== undefined && this._config.ADMIN_NUMBER_2 !== "") {
                        if (this._config.ADMIN_NUMBER_1 !== this._config.ADMIN_NUMBER_2) {
                            this.client.sendMessage(this._config.ADMIN_NUMBER_2 + "@c.us", message);
                        }
                    }

                    if (this._config.ADMIN_NUMBER_3 !== undefined && this._config.ADMIN_NUMBER_3 !== "") {
                        if (this._config.ADMIN_NUMBER_1 !== this._config.ADMIN_NUMBER_3 && this._config.ADMIN_NUMBER_2 !== this._config.ADMIN_NUMBER_3) {
                            this.client.sendMessage(this._config.ADMIN_NUMBER_3 + "@c.us", message);
                        }
                    }
                }
            }
        } catch (error) {
            this._log.error(error.message);
        }
    }

    sendPhoto(path) {
        try {
            if (this._config.WHATSAPP === true || this._config.WHATSAPP === 'true') {
                if (this.auth) {
                    const media = MessageMedia.fromFilePath(path);

                    if (this._config.ADMIN_NUMBER_1 !== undefined && this._config.ADMIN_NUMBER_1 !== "") {
                        this.client.sendMessage(this._config.ADMIN_NUMBER_1 + "@c.us", media);
                    }

                    if (this._config.ADMIN_NUMBER_2 !== undefined && this._config.ADMIN_NUMBER_2 !== "") {
                        if (this._config.ADMIN_NUMBER_1 !== this._config.ADMIN_NUMBER_2) {
                            this.client.sendMessage(this._config.ADMIN_NUMBER_2 + "@c.us", media);
                        }
                    }

                    if (this._config.ADMIN_NUMBER_3 !== undefined && this._config.ADMIN_NUMBER_3 !== "") {
                        if (this._config.ADMIN_NUMBER_1 !== this._config.ADMIN_NUMBER_3 && this._config.ADMIN_NUMBER_2 !== this._config.ADMIN_NUMBER_3) {
                            this.client.sendMessage(this._config.ADMIN_NUMBER_3 + "@c.us", media);
                        }
                    }
                }
            }
        } catch (error) {
            this._log.error(error.message);
        }
    }

}

module.exports = WhatsappController;