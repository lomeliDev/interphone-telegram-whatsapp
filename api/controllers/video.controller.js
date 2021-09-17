'use strict'

const fs = require('fs');

class VideoController {

    constructor({ config, Log, WssController }) {
        this._config = config;
        this._log = Log;
        this._wss = WssController;
        this.pathVideo = __dirname + '/../../data/camera.mp4';
    }

    start() {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    capture(callback, arg_1, arg_2, arg_3) {
        if (this._config.CAMERA !== "none") {
            try {
                fs.unlinkSync(this.pathVideo);
            } catch (error) { }
            const result = this._wss.startVideo();
            setTimeout(() => {
                callback(this.pathVideo, arg_1, arg_2, result);
            }, 35000);
        }
    }

}

module.exports = VideoController;