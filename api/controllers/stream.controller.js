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
            quality: 7
        };
        this.frameEmitterEvent = null;
        this.frame = {
            date: Date.now(),
            frame: null
        };
        this.isReady = true;
    }

    start() {
        return new Promise((resolve, reject) => {
            try {
                raspberryPiCamera.start(this.cameraOptions);
                this.frameEmitterEvent = raspberryPiCamera.on('frame', this.frameHandler);
                this._log.log("The camera was initialized");
            } catch (error) {
                this._log.error(error.message);
            }
            resolve();
        });
    }

    frameHandler(frame) {
        try {
            this.frame = {
                date: Date.now(),
                frame: frame
            };
            console.log("frame");
        } catch (error) {
            this._log.error(error.message);
        }
    }

    getLastFrame() {
        if (this.frame.date >= Date.now() + (1000 * 2)) {
            return this.frame.frame;
        } else {
            return null;
        }
    }

    stream(req, res) {
        res.writeHead(200, {
            'Cache-Control': 'no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0',
            Pragma: 'no-cache',
            Connection: 'close',
            'Content-Type': 'multipart/x-mixed-replace; boundary=--myboundary'
        });
        //this.isReady = true;

        try {
            const frameData = this.getLastFrame();
            if (frameData !== null) {
                res.write(`--myboundary\nContent-Type: image/jpg\nContent-length: ${frameData.length}\n\n`);
                res.write(frameData, function(){
                    //isReady = true;
                });
            } else {
                res.write(`--myboundary\nContent-Type: image/jpg\nContent-length: ${0}\n\n`);
                res.write("", function(){
                    //isReady = true;
                });
            }
        } catch (error) {
            res.write(`--myboundary\nContent-Type: image/jpg\nContent-length: ${0}\n\n`);

            res.write("", function(){
                //isReady = true;
            });

        }
    }

}

module.exports = StreamController;