'use strict'

const fs = require('fs');
const raspberryPiCamera = require('raspberry-pi-camera-native');

class StreamController {

    constructor({ config, Log }) {
        this._config = config;
        this._log = Log;
        this.pathPhoto = __dirname + '/../../data/camera.jpg';
        this.pathVideo = __dirname + '/../../data/camera.mp4';
        this.cameraOptions = {
            width: 1280,
            height: 720,
            fps: 16,
            encoding: 'JPEG',
            quality: 75
        };
        this.isOpen = false;
        this.frame = {
            date: Date.now(),
            frame: null
        };
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                raspberryPiCamera.start(this.cameraOptions);
                const self = this;
                raspberryPiCamera.on('frame', (frame) => {
                    try {
                        self.frame = {
                            date: Date.now() + (1000 * 2),
                            frame: frame
                        };
                    } catch (error) {
                        self._log.error(error.message);
                    }
                });
                this._log.log("The camera was initialized");
                this.isOpen = true;
            } catch (error) {
                this._log.error(error.message);
            }
            resolve();
        });
    }

    getLastFrame() {
        if (this.frame.date >= Date.now()) {
            return this.frame.frame;
        } else {
            return null;
        }
    }

    stream(req, res) {
        this._log.log('Accepting connection: ' + req.hostname);

        let isReady = true;
        const self = this;

        let frameHandler = (frameData) => {
            try {
                if (!self.isOpen) {
                    return;
                }
                if (!isReady) {
                    return;
                }

                isReady = false;

                res.write(`--myboundary\nContent-Type: image/jpg\nContent-length: ${frameData.length}\n\n`);

                res.write(frameData, function () {
                    isReady = true;
                });
            } catch (error) {
                this._log.log('Unable to send frame: ' + error.message);
            }
        }

        let frameEmitter = raspberryPiCamera.on('frame', frameHandler);

        req.on('close', () => {
            frameEmitter.removeListener('frame', frameHandler);
            this._log.log('Connection terminated: ' + req.hostname);
        });

    }

}

module.exports = StreamController;