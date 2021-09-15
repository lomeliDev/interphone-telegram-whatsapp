'use strict'

const Gpio = require('onoff').Gpio;

class ButtonsController {

    constructor({ config, Log, TelegramController, WhatsappController, PhotoController }) {
        this._config = config;
        this._log = Log;
        this.call = null;
        this.lastCall = 0;
        this._tg = TelegramController;
        this._whats = WhatsappController;
        this._photo = PhotoController;
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                this.call = new Gpio(21, 'in', 'rising', { debounceTimeout: 10 });
                this.actionCall();
            } catch (error) {
                this._log.error(error.message);
            }
            resolve();
        });
    }

    actionCall() {
        this.call.watch(async (err, value) => {
            if (Date.now() > this.lastCall || this.lastCall == 0) {
                this.lastCall = Date.now() + (1000 * 10);
                this._tg.sendMessage("Ring 🛎️");
                this._whats.sendMessage("Ring 🛎️");
                this._photo.capture(this.sendPhotoCallback, this, null, null);
            }
        });
    }

    sendPhotoCallback(path, arg_1, arg_2, arg_3) {
        arg_1._tg.sendPhoto(path);
        arg_1._whats.sendPhoto(path);
    }

}

module.exports = ButtonsController;