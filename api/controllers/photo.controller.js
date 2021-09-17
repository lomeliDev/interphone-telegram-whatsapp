'use strict'

const fs = require('fs');

class PhotoController {

    constructor({ config, Log, WssController }) {
        this._config = config;
        this._log = Log;
        this._wss = WssController;
        this.pathPhoto = __dirname + '/../../data/camera.jpg';
    }

    start() {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    capture(callback, arg_1, arg_2, arg_3) {
        if (this._config.CAMERA !== "none") {
            try {
                fs.unlinkSync(this.pathPhoto);
            } catch (error) { }
            const result = this._wss.startPhoto();
            setTimeout(() => {
                callback(this.pathPhoto, arg_1, arg_2, result);
            }, 6000);
        }
    }

}

module.exports = PhotoController;