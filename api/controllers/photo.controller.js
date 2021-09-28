'use strict'

const fs = require('fs');
const shellExec = require('shell-exec');
const fetch = require('node-fetch');

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
        if (this._config.CAMERA !== "NONE") {
            try {
                fs.unlinkSync(this.pathPhoto);
            } catch (error) { }
            setTimeout(() => {
                if (this._config.CAMERA === "ESP32") {
                    fetch(`http://${this._config.HOST_CAMERA}/on`).then(res => res).then(json => { });
                    const streamUrl = `http://${this._config.HOST_CAMERA}/mjpeg/1`;
                    shellExec(`ffmpeg -f mjpeg -r 6 -ss 00:00:00 -i "${streamUrl}" -s 640x480 -vframes 1 -q:v 2 -y ${this.pathPhoto}`);
                    setTimeout(() => {
                        fetch(`http://${this._config.HOST_CAMERA}/off`).then(res => res).then(json => { });
                        try {
                            callback(this.pathPhoto, arg_1, arg_2, true);
                        } catch (error) {
                            callback(this.pathPhoto, arg_1, arg_2, false);
                        }
                    }, 13000);
                } else {
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
                }
            }, 3000);
        }
    }

}

module.exports = PhotoController;