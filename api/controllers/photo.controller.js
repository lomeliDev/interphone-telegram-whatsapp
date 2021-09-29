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

    fetchESP32(timeout, path) {
        try {
            setTimeout(() => {
                fetch(`http://${this._config.HOST_CAMERA}/${path}`).then(res => res).then(json => { });
            }, timeout);
        } catch (error) { }
    }

    captureESP32(callback, arg_1, arg_2, arg_3) {

        this.fetchESP32(0, 'on');
        this.fetchESP32(700, 'jpg-resume');
        this.fetchESP32(1500, 'jpg-resume');
        this.fetchESP32(2500, 'jpg-resume');
        this.fetchESP32(4000, 'off');

        setTimeout(() => {
            fetch(`http://${this._config.HOST_CAMERA}/jpg`).then(async (res) => {
                if (res.status === 200) {
                    return res.buffer()
                } else {
                    throw new Error("an error occurred")
                }

            }).then(data => {
                try {
                    fs.writeFile(this.pathPhoto, data, (err) => {
                        if (err) {
                            callback(this.pathPhoto, arg_1, arg_2, false);
                        } else {
                            callback(this.pathPhoto, arg_1, arg_2, true);
                        }
                    })
                } catch (error) {
                    callback(this.pathPhoto, arg_1, arg_2, false);
                }
            }).catch((error) => {
                console.log("error");
                console.log(error);
                callback(this.pathPhoto, arg_1, arg_2, false);
            })
        }, 5500);

    }

    capture(callback, arg_1, arg_2, arg_3) {
        if (this._config.CAMERA !== "NONE") {
            try {
                fs.unlinkSync(this.pathPhoto);
            } catch (error) { }
            setTimeout(() => {
                if (this._config.CAMERA === "ESP32") {
                    this.captureESP32(callback, arg_1, arg_2, arg_3);
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