'use strict'

const fs = require('fs');
const { Telegraf } = require('telegraf');
const Downloader = require('nodejs-file-downloader');
const shellExec = require('shell-exec');
const PiCamera = require('pi-camera');
const NodeWebcam = require('node-webcam');

class TelegramController {

    constructor({ config, Log }) {
        this._config = config;
        this._log = Log;
        this.client = null;
        this.camera = null;
        this.pathPhoto = __dirname + '/../../data/camera.jpg';
    }

    Connection() {
        try {
            this.client = new Telegraf(this._config.API_TELEGRAM);
            this.app();
            this.client.launch();
        } catch (error) {
            this._log.error(error.message);
        }
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                if (this._config.TELEGRAM === true || this._config.TELEGRAM === 'true') {
                    this._log.log("Telegram service started");
                    this.Connection();
                    process.once('SIGINT', () => this.client.stop('SIGINT'));
                    process.once('SIGTERM', () => this.client.stop('SIGTERM'));

                    if (this._config.CAMERA === "native") {
                        this.camera = new PiCamera({
                            mode: 'photo',
                            output: this.pathPhoto,
                            width: 640,
                            height: 480,
                            nopreview: true,
                        });
                    }

                    if (this._config.CAMERA === "webcam") {
                        this.camera = NodeWebcam.create({
                            width: 640,
                            height: 480,
                            delay: 0,
                            quality: 100,
                            output: "jpeg",
                            device: false,
                            callbackReturn: "location",
                            verbose: false
                        });
                    }
                }
            } catch (error) {
                this._log.error(error.message);
            }
            resolve();
        });
    }

    welcome() {
        try {
            if (this._config.ADMIN_USER_TELEGRAM_1 !== undefined && this._config.ADMIN_USER_TELEGRAM_1 !== "") {
                this.client.telegram.sendMessage(this._config.ADMIN_USER_TELEGRAM_1, 'Telegram is listening');
            }

            if (this._config.ADMIN_USER_TELEGRAM_2 !== undefined && this._config.ADMIN_USER_TELEGRAM_2 !== "") {
                if (this._config.ADMIN_USER_TELEGRAM_1 !== this._config.ADMIN_USER_TELEGRAM_2) {
                    this.client.telegram.sendMessage(this._config.ADMIN_USER_TELEGRAM_2, 'Telegram is listening');
                }
            }

            if (this._config.ADMIN_USER_TELEGRAM_3 !== undefined && this._config.ADMIN_USER_TELEGRAM_3 !== "") {
                if (this._config.ADMIN_USER_TELEGRAM_1 !== this._config.ADMIN_USER_TELEGRAM_3 && this._config.ADMIN_USER_TELEGRAM_2 !== this._config.ADMIN_USER_TELEGRAM_3) {
                    this.client.telegram.sendMessage(this._config.ADMIN_USER_TELEGRAM_3, 'Telegram is listening');
                }
            }
        } catch (error) {
            this._log.error(error.message);
        }
    }

    async openDoor(ctx, body) {
        console.log("openDoor");
        ctx.reply(body);
    }

    async openGarage(ctx, body) {
        console.log("openGarage");
        ctx.reply(body);
    }

    async onAlarm(ctx, body) {
        console.log("onAlarm");
        ctx.reply(body);
    }

    async offAlarm(ctx, body) {
        console.log("offAlarm");
        ctx.reply(body);
    }

    async call(ctx, body) {
        console.log("call");
        ctx.reply(body);
    }

    async picture(ctx, body) {
        ctx.reply(body);
        if (this._config.CAMERA === "native") {
            try {
                fs.unlinkSync(this.pathPhoto);
            } catch (error) { }
            this.camera.snap().then((result) => {
                console.log(result);
            }).catch((error) => {
                console.log("error", error);
            });
        }
        if (this._config.CAMERA === "webcam") {
            try {
                fs.unlinkSync(this.pathPhoto);
            } catch (error) { }
            setTimeout(() => {
                this.camera.capture(this.pathPhoto, (err, data) => {
                    ctx.replyWithPhoto({
                        source: fs.createReadStream(data)
                    });
                });
            }, 500);
        }
    }

    async video(ctx, body) {
        console.log("video");
        ctx.reply(body);
    }

    app() {
        try {
            this._log.log("Ready to interact with telegram");
            if (this._config.WELCOME_STATUS_TELEGRAM === true || this._config.WELCOME_STATUS_TELEGRAM === 'true') {
                this.welcome();
            }
            this.client.start((ctx) => ctx.reply('Welcome'));
            this.client.hears('user', (ctx) => ctx.reply(ctx.message.from.id));
            this.client.hears('🚪', (ctx) => this.openDoor(ctx, '🚪'));
            this.client.hears('🚗', (ctx) => this.openGarage(ctx, '🚗'));
            this.client.hears('🔔', (ctx) => this.onAlarm(ctx, '🔔'));
            this.client.hears('🔕', (ctx) => this.offAlarm(ctx, '🔕'));
            this.client.hears('📞', (ctx) => this.call(ctx, '📞'));
            this.client.hears('📷', (ctx) => this.picture(ctx, '📷'));
            this.client.hears('🎥', (ctx) => this.video(ctx, '🎥'));
            this.client.on('voice', (ctx) => {
                ctx.telegram.getFileLink(ctx.message.voice.file_id).then(async (url) => {
                    const downloader = new Downloader({
                        url: url.href,
                        directory: __dirname + '/../../data/',
                        fileName: 'voice.oga',
                        cloneFiles: false
                    })
                    try {
                        await downloader.download();
                        ctx.reply('🎵');
                        if (this._config.AUDIO_AUTOPLAY_TELEGRAM === true || this._config.AUDIO_AUTOPLAY_TELEGRAM === 'true') {
                            const pathFileVoice = __dirname + '/../../data/voice.oga';
                            shellExec('omxplayer -o local --vol 500 ' + pathFileVoice);
                        }
                    } catch (error) {
                        console.log(error);
                        ctx.reply('*** error 2 ***');
                    }
                }).catch((err) => {
                    ctx.reply('*** error ***');
                })
            });
        } catch (error) {
            this._log.error(error.message);
        }
    }

    sendMessage(message) {
        try {
            if (this._config.TELEGRAM === true || this._config.TELEGRAM === 'true') {
                if (this._config.ADMIN_USER_TELEGRAM_1 !== undefined && this._config.ADMIN_USER_TELEGRAM_1 !== "") {
                    this.client.telegram.sendMessage(this._config.ADMIN_USER_TELEGRAM_1, message);
                }

                if (this._config.ADMIN_USER_TELEGRAM_2 !== undefined && this._config.ADMIN_USER_TELEGRAM_2 !== "") {
                    if (this._config.ADMIN_USER_TELEGRAM_1 !== this._config.ADMIN_USER_TELEGRAM_2) {
                        this.client.telegram.sendMessage(this._config.ADMIN_USER_TELEGRAM_2, message);
                    }
                }

                if (this._config.ADMIN_USER_TELEGRAM_3 !== undefined && this._config.ADMIN_USER_TELEGRAM_3 !== "") {
                    if (this._config.ADMIN_USER_TELEGRAM_1 !== this._config.ADMIN_USER_TELEGRAM_3 && this._config.ADMIN_USER_TELEGRAM_2 !== this._config.ADMIN_USER_TELEGRAM_3) {
                        this.client.telegram.sendMessage(this._config.ADMIN_USER_TELEGRAM_3, message);
                    }
                }
            }
        } catch (error) {
            this._log.error(error.message);
        }
    }

    sendPhoto(path) {
        try {
            if (this._config.TELEGRAM === true || this._config.TELEGRAM === 'true') {
                if (this._config.ADMIN_USER_TELEGRAM_1 !== undefined && this._config.ADMIN_USER_TELEGRAM_1 !== "") {
                    this.client.telegram.sendPhoto(this._config.ADMIN_USER_TELEGRAM_1, { source: fs.createReadStream(path) });
                }

                if (this._config.ADMIN_USER_TELEGRAM_2 !== undefined && this._config.ADMIN_USER_TELEGRAM_2 !== "") {
                    if (this._config.ADMIN_USER_TELEGRAM_1 !== this._config.ADMIN_USER_TELEGRAM_2) {
                        this.client.telegram.sendPhoto(this._config.ADMIN_USER_TELEGRAM_2, { source: fs.createReadStream(path) });
                    }
                }

                if (this._config.ADMIN_USER_TELEGRAM_3 !== undefined && this._config.ADMIN_USER_TELEGRAM_3 !== "") {
                    if (this._config.ADMIN_USER_TELEGRAM_1 !== this._config.ADMIN_USER_TELEGRAM_3 && this._config.ADMIN_USER_TELEGRAM_2 !== this._config.ADMIN_USER_TELEGRAM_3) {
                        this.client.telegram.sendPhoto(this._config.ADMIN_USER_TELEGRAM_3, { source: fs.createReadStream(path) });
                    }
                }
            }
        } catch (error) {
            this._log.error(error.message);
        }
    }

}

module.exports = TelegramController;