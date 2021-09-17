'use strict'

//https://github.com/tomatpasser/gpio-buttons

const Gpio = require('onoff').Gpio;

class ButtonsController {

    constructor({ config, Log, TelegramController, WhatsappController, PhotoController }) {
        this._config = config;
        this._log = Log;
        this.call = null;
        this.lastCall = 0;
        this.door = null;
        this.lastDoor = 0;
        this.garage = null;
        this.lastGarage = 0;
        this._tg = TelegramController;
        this._whats = WhatsappController;
        this._photo = PhotoController;
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                this.call = new Gpio(2, 'in', 'rising', { debounceTimeout: 10 });
                this.door = new Gpio(3, 'in', 'rising', { debounceTimeout: 10 });
                this.garage = new Gpio(4, 'in', 'rising', { debounceTimeout: 10 });
                this.actionCall();
                this.actionDoor();
                this.actionGarage();
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

    actionDoor() {
        this.door.watch(async (err, value) => {
            if (Date.now() > this.lastDoor || this.lastDoor == 0) {
                this.lastDoor = Date.now() + (1000 * 5);
                this._tg.sendMessage("🚪");
                this._whats.sendMessage("🚪");
            }
        });
    }

    actionGarage() {
        this.garage.watch(async (err, value) => {
            if (Date.now() > this.lastGarage || this.lastGarage == 0) {
                this.lastGarage = Date.now() + (1000 * 5);
                this._tg.sendMessage("🚗");
                this._whats.sendMessage("🚗");
            }
        });
    }

    sendPhotoCallback(path, arg_1, arg_2, arg_3) {
        if (arg_3 === true) {
            arg_1._tg.sendPhoto(path);
            arg_1._whats.sendPhoto(path);
        } else {
            arg_1._tg.sendMessage("Image capture failed");
            arg_1._whats.sendMessage("Image capture failed");
        }
    }

}

module.exports = ButtonsController;