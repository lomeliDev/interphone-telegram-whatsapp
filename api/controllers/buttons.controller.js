'use strict'

const fs = require('fs');
const Gpio = require('onoff').Gpio;
const PiCamera = require('pi-camera');
const NodeWebcam = require('node-webcam');

class ButtonsController {

    constructor({ config, Log, TelegramController, WhatsappController }) {
        this._config = config;
        this._log = Log;
        this.call = null;
        this.lastCall = 0;
        this._tg = TelegramController;
        this._whats = WhatsappController;
        this.camera = null;
        this.pathPhoto = __dirname + '/../../data/camera.jpg';
    }

    start() {
        return new Promise((resolve, reject) => {
            try {

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
                            this._tg.sendPhoto(data);
                            this._whats.sendPhoto(data);
                        });
                    }, 500);
                }
                this._tg.sendMessage("Ring 🛎️");
                this._whats.sendMessage("Ring 🛎️");
            }
        });
    }

}

module.exports = ButtonsController;