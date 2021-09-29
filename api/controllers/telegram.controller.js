'use strict'

const fs = require('fs');
const { Telegraf } = require('telegraf');
const Downloader = require('nodejs-file-downloader');
const shellExec = require('shell-exec');
const fetch = require('node-fetch');

class TelegramController {

    constructor({ config, Log, PhotoController, VideoController, RelaysController, pjsuaController, GatewayController }) {
        this._config = config;
        this._log = Log;
        this._photo = PhotoController;
        this._video = VideoController;
        this._relays = RelaysController;
        this._pjsua = pjsuaController;
        this._gateway = GatewayController;
        this.client = null;
        this.lastReceived = 0;
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
        if (Date.now() > this.lastReceived || this.lastReceived == 0) {
            ctx.reply(body);
            this._relays.openDoor();
        }
    }

    async openGarage(ctx, body) {
        if (Date.now() > this.lastReceived || this.lastReceived == 0) {
            ctx.reply(body);
            this._relays.openGarage();
        }
    }

    async onLight(ctx, body) {
        if (Date.now() > this.lastReceived || this.lastReceived == 0) {
            ctx.reply(body);
            this._relays.onLight();
            this._gateway.onLight();
        }
    }

    async offLight(ctx, body) {
        if (Date.now() > this.lastReceived || this.lastReceived == 0) {
            ctx.reply(body);
            this._relays.offLight();
            this._gateway.offLight();
        }
    }

    async onAlarm(ctx, body) {
        if (Date.now() > this.lastReceived || this.lastReceived == 0) {
            ctx.reply(body);
            this._relays.onAlarm();
            this._gateway.onAlarm();
        }
    }

    async offAlarm(ctx, body) {
        if (Date.now() > this.lastReceived || this.lastReceived == 0) {
            ctx.reply(body);
            this._relays.offAlarm();
            this._gateway.offAlarm();
        }
    }

    async call(ctx, body) {
        if (Date.now() > this.lastReceived || this.lastReceived == 0) {
            ctx.reply(body);
            if (ctx.message.from.id + '' === this._config.ADMIN_USER_TELEGRAM_1) {
                this._pjsua.call(this._config.SIP_NUMBER_ADMIN_1);
            } else if (ctx.message.from.id + '' === this._config.ADMIN_USER_TELEGRAM_2) {
                this._pjsua.call(this._config.SIP_NUMBER_ADMIN_2);
            } else if (ctx.message.from.id + '' === this._config.ADMIN_USER_TELEGRAM_3) {
                this._pjsua.call(this._config.SIP_NUMBER_ADMIN_3);
            }
        }
    }

    async ringall(ctx, body) {
        if (Date.now() > this.lastReceived || this.lastReceived == 0) {
            ctx.reply(body);
            this._pjsua.call(this._config.SIP_QUEUE);
        }
    }

    async picture(ctx, body) {
        if (Date.now() > this.lastReceived || this.lastReceived == 0) {
            ctx.reply(body);
            this._photo.capture(this.sendPhotoCallback, ctx, null, null);
            if (this._config.RELAY_PHOTO_STATUS === 'true' || this._config.RELAY_PHOTO_STATUS === true) {
                this._relays.onLight();
                setTimeout(() => {
                    this._relays.offLight();
                }, this._config.RELAY_PHOTO_TIME);
            }
        }
    }

    sendPhotoCallback(path, arg_1, arg_2, arg_3) {
        if (arg_3 === true) {
            try {
                arg_1.replyWithPhoto({
                    source: fs.createReadStream(path)
                });
            } catch (error) { }
        } else {
            arg_1.reply("Image capture failed");
        }
    }

    async video(ctx, body) {
        if (Date.now() > this.lastReceived || this.lastReceived == 0) {
            ctx.reply(body);
            this._video.capture(this.sendVideoCallback, ctx, null, null);
            if (this._config.RELAY_VIDEO_STATUS === 'true' || this._config.RELAY_VIDEO_STATUS === true) {
                this._relays.onLight();
                setTimeout(() => {
                    this._relays.offLight();
                }, this._config.RELAY_VIDEO_TIME);
            }
        }
    }

    sendVideoCallback(path, arg_1, arg_2, arg_3) {
        if (arg_3 === true) {
            try {
                arg_1.replyWithVideo({
                    source: fs.createReadStream(path)
                });
            } catch (error) { }
        } else {
            arg_1.reply("Video capture failed");
        }
    }

    async command(ctx, command) {
        const result = await shellExec(command);
        ctx.reply((result.stdout));
    }

    fetchESP32(timeout, path) {
        try {
            setTimeout(() => {
                fetch(`http://${this._config.HOST_CAMERA}/${path}`).then(res => res).then(json => { });
            }, timeout);
        } catch (error) { }
    }

    async esp32(ctx, body) {
        if (Date.now() > this.lastReceived || this.lastReceived == 0) {
            ctx.reply(body);
            this.fetchESP32(0, 'reboot');
        }
    }

    async pjsua(ctx, body) {
        if (Date.now() > this.lastReceived || this.lastReceived == 0) {
            ctx.reply(body);
            this._pjsua.close();
            setTimeout(async () => {
                await this._pjsua.run();
            }, 5000);
        }
    }

    async hangup(ctx, body) {
        if (Date.now() > this.lastReceived || this.lastReceived == 0) {
            ctx.reply(body);
            this._pjsua.HangUp();
        }
    }

    async redirect(ctx) {
        if (Date.now() > this.lastReceived || this.lastReceived == 0) {
            let urlRedirect = `${this._config.URL_HOST}:${this._config.PORT_PROXY}/`;
            try {
                if (this._config.CAMERA === "ESP32") {
                    urlRedirect = `${this._config.URL_HOST}:${this._config.PORT_PROXY}/http://${this._config.HOST_CAMERA}/mjpeg/1`;
                } else if (this._config.CAMERA === "NATIVE") {
                    urlRedirect = `${this._config.URL_HOST}:${this._config.PORT_PROXY}/http://127.0.0.1:${this._config.PORT_API}/stream/stream.mjpg`;
                }
            } catch (error) {
                urlRedirect = `${this._config.URL_HOST}:${this._config.PORT_PROXY}/`;
            }
            ctx.reply(urlRedirect);
        }
    }

    async help(ctx) {
        if (Date.now() > this.lastReceived || this.lastReceived == 0) {
            const helpTextES = 'user - Regresa el ID del usuario\n' +
                'free - Memoria ram\n' +
                'df - Detalle de la SD card\n' +
                'reboot - Reinicio de la raspberry\n' +
                'esp32 - Reinicia el ESP32-CAM\n' +
                'pjsua - Reincia el softhphone\n' +
                'hangup - Cuelga la llamada actual\n' +
                'redirect - URL del stream\n\n' +
                '🚪 - Abre la puerta\n' +
                '🚗 - Abre el porton del garage\n' +
                '🔔 - Enciende la alarma\n' +
                '🔕 - Apaga la alarma\n' +
                '📞 - Te llama solamente a ti el asterisk\n' +
                '🛎️ - Llama a todos el asterisk\n' +
                '📷 - Toma una foto\n' +
                '🎥 - Toma un video\n' +
                '✅ - Enciende el flash\n' +
                '❎ - Apaga el flash\n' +
                '📵 - Cuelga la llamada actual\n';

            const helpTextEN = 'user - Returns the user ID\n' +
                'free - Memory ram\n' +
                'df - SD card detail\n' +
                'reboot - Restart the raspberry\n' +
                'esp32 - Restart the ESP32-CAM\n' +
                'pjsua - Restart the softphone\n' +
                'hangup - Hang up the current call\n' +
                'redirect - Stream url\n\n' +
                '🚪 - Open the door\n' +
                '🚗 - Open the garage door\n' +
                '🔔 - Turn on the alarm\n' +
                '🔕 - Turn off the alarm\n' +
                '📞 - The asterisk only calls you\n' +
                '🛎️ - Call everyone the asterisk\n' +
                '📷 - Take a photo\n' +
                '🎥 - Take a video\n' +
                '✅ - Turn on the flash\n' +
                '❎ - Turn off the flash\n' +
                '📵 - Hang up the current call';

            ctx.reply(this._config.TELEGRAM_MENU_LANG === "en" ? helpTextEN : helpTextES);
        }
    }

    app() {
        try {
            this._log.log("Ready to interact with telegram");
            if (this._config.WELCOME_STATUS_TELEGRAM === true || this._config.WELCOME_STATUS_TELEGRAM === 'true') {
                this.welcome();
            }
            this.lastReceived = Date.now() + (1000 * 5);
            this.client.start((ctx) => ctx.reply('Welcome'));
            this.client.hears('user', (ctx) => ctx.reply(ctx.message.from.id));
            this.client.hears('🚪', (ctx) => this.openDoor(ctx, '🚪'));
            this.client.hears('🚗', (ctx) => this.openGarage(ctx, '🚗'));
            this.client.hears('🔔', (ctx) => this.onAlarm(ctx, '🔔'));
            this.client.hears('🔕', (ctx) => this.offAlarm(ctx, '🔕'));
            this.client.hears('📞', (ctx) => this.call(ctx, '📞'));
            this.client.hears('🛎️', (ctx) => this.ringall(ctx, '🛎️'));
            this.client.hears('📷', (ctx) => this.picture(ctx, '📷'));
            this.client.hears('🎥', (ctx) => this.video(ctx, '🎥'));
            this.client.hears('✅', (ctx) => this.onLight(ctx, '✅'));
            this.client.hears('❎', (ctx) => this.offLight(ctx, '❎'));
            this.client.hears('free', (ctx) => this.command(ctx, 'free -h'));
            this.client.hears('df', (ctx) => this.command(ctx, 'df -h'));
            this.client.hears('top', (ctx) => this.command(ctx, 'top -b -n 1'));
            this.client.hears('reboot', (ctx) => this.command(ctx, 'sudo reboot'));
            this.client.hears('esp32', (ctx) => this.esp32(ctx, 'esp32'));
            this.client.hears('pjsua', (ctx) => this.pjsua(ctx, 'pjsua'));
            this.client.hears('hangup', (ctx) => this.hangup(ctx, 'hangup'));
            this.client.hears('redirect', (ctx) => this.redirect(ctx));
            this.client.command('help', (ctx) => this.help(ctx));
            this.client.command('user', (ctx) => ctx.reply(ctx.message.from.id));
            this.client.command('free', (ctx) => this.command(ctx, 'free -h'));
            this.client.command('df', (ctx) => this.command(ctx, 'df -h'));
            this.client.command('top', (ctx) => this.command(ctx, 'top -b -n 1'));
            this.client.command('reboot', (ctx) => this.command(ctx, 'sudo reboot'));
            this.client.command('esp32', (ctx) => this.esp32(ctx, 'esp32'));
            this.client.command('pjsua', (ctx) => this.pjsua(ctx, 'pjsua'));
            this.client.command('hangup', (ctx) => this.hangup(ctx, 'hangup'));
            this.client.command('redirect', (ctx) => this.redirect(ctx));
            this.client.command('🚪', (ctx) => this.openDoor(ctx, '🚪'));
            this.client.command('🚗', (ctx) => this.openGarage(ctx, '🚗'));
            this.client.command('🔔', (ctx) => this.onAlarm(ctx, '🔔'));
            this.client.command('🔕', (ctx) => this.offAlarm(ctx, '🔕'));
            this.client.command('📞', (ctx) => this.call(ctx, '📞'));
            this.client.command('🛎️', (ctx) => this.ringall(ctx, '🛎️'));
            this.client.command('📷', (ctx) => this.picture(ctx, '📷'));
            this.client.command('🎥', (ctx) => this.video(ctx, '🎥'));
            this.client.command('✅', (ctx) => this.onLight(ctx, '✅'));
            this.client.command('❎', (ctx) => this.offLight(ctx, '❎'));
            this.client.command('📵', (ctx) => this.hangup(ctx, '📵'));
            this.client.on('voice', (ctx) => {
                try {
                    fs.unlinkSync(pathFileVoice);
                } catch (error) { }
                ctx.telegram.getFileLink(ctx.message.voice.file_id).then(async (url) => {
                    const downloader = new Downloader({
                        url: url.href,
                        directory: __dirname + '/../../data/',
                        fileName: 'voice.ogg',
                        cloneFiles: false
                    })
                    try {
                        await downloader.download();
                        ctx.reply('🎵');
                        if (this._config.AUDIO_AUTOPLAY_TELEGRAM === true || this._config.AUDIO_AUTOPLAY_TELEGRAM === 'true') {
                            const pathFileVoice = __dirname + '/../../data/voice.ogg';
                            shellExec(`screen -S audio -d -m ffplay -i ${pathFileVoice} -autoexit -nodisp`);
                            //shellExec(`omxplayer -o ${this._config.AUDIO_DEVICE_ID_SOUND_CARD} --vol 900 ${pathFileVoice}`);
                        }
                    } catch (error) {
                        ctx.reply('*** error ***');
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