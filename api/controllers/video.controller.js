'use strict'

const fs = require('fs');
const shellExec = require('shell-exec');

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
        if (this._config.CAMERA !== "NONE") {
            try {
                fs.unlinkSync(this.pathVideo);
            } catch (error) { }
            setTimeout(() => {
                try {
                    shellExec(`ffmpeg -f mjpeg -r 16 -i "http://127.0.0.1:${this._config.PORT_API}/stream/stream.mjpg" -b:v 4000k -c:v libx264 -crf 19 -r 8 -s 640x480 -to 00:00:15 -y ${this.pathVideo}`);
                    setTimeout(() => {
                        callback(this.pathVideo, arg_1, arg_2, true);
                    }, 25000);
                } catch (e) {
                    callback(this.pathVideo, arg_1, arg_2, result);
                }
            }, 3000);
        }
    }

}

module.exports = VideoController;