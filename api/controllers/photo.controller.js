'use strict'

const fs = require('fs');

class PhotoController {

    constructor({ config, Log, StreamController }) {
        this._config = config;
        this._log = Log;
        this._stream = StreamController;
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
            setTimeout(() => {
                const result = this._stream.getLastFrame();
                if (result !== null) {
                    try {
                        fs.writeFile(this.pathPhoto, result, (err) => {
                            if (err) {
                                callback(this.pathPhoto, arg_1, arg_2, false);
                            } else {
                                callback(this.pathPhoto, arg_1, arg_2, true);
                            }
                        })
                    } catch (error) {
                        callback(this.pathPhoto, arg_1, arg_2, false);
                    }
                } else {
                    callback(this.pathPhoto, arg_1, arg_2, false);
                }
            }, 3000);
        }
    }

}

module.exports = PhotoController;