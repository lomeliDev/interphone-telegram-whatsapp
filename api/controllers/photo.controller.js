'use strict'

const fs = require('fs');
const PiCamera = require('pi-camera');
const NodeWebcam = require('node-webcam');

class PhotoController {

    constructor({ config, Log }) {
        this._config = config;
        this._log = Log;
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
            } catch (error) {
                this._log.error(error.message);
            }
            resolve();
        });
    }

    capture(callback, arg_1, arg_2, arg_3) {
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
                    callback(data, arg_1, arg_2, arg_3);
                });
            }, 500);
        }
    }

}

module.exports = PhotoController;