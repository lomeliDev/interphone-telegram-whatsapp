'use strict'

const shellExec = require('shell-exec');

class pjsuaController {

    constructor({ config, Log }) {
        this._config = config;
        this._log = Log;
    }

    start() {
        return new Promise((resolve, reject) => {
            shellExec('pgrep pjsua | xargs kill');
            setTimeout(() => {
                shellExec(`screen -S interfon -d -m ${this._config.PATH_PJSUA} --config-file ${this._config.PATH_PJSUA_CONFIG}`);
            }, 400);
            setTimeout(() => {
                shellExec(`screen -S interfon -X stuff 'V^M'`);
            }, 700);
            setTimeout(() => {
                shellExec(`screen -S interfon -X stuff '5^M'`);
            }, 800);
            setTimeout(() => {
                shellExec(`screen -S interfon -X stuff '4^M'`);
            }, 900);
            resolve();
        });
    }

    async run() {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await shellExec('pgrep pjsua');
                if (result && result.code && result.code === 1 && result.stdout === '') {
                    shellExec('pgrep pjsua | xargs kill');
                    setTimeout(() => {
                        shellExec(`screen -S interfon -d -m ${this._config.PATH_PJSUA} --config-file ${this._config.PATH_PJSUA_CONFIG}`);
                    }, 400);
                    setTimeout(() => {
                        shellExec(`screen -S interfon -X stuff 'V^M'`);
                    }, 600);
                    setTimeout(() => {
                        shellExec(`screen -S interfon -X stuff '5^M'`);
                    }, 700);
                    setTimeout(() => {
                        shellExec(`screen -S interfon -X stuff '4^M'`);
                    }, 800);
                    setTimeout(() => {
                        resolve();
                    }, 900);
                } else {
                    resolve();
                }
            } catch (error) {
                resolve();
            }
        });
    }

    async call(sipNumber) {
        await this.run();
        setTimeout(() => {
            shellExec(`screen -S interfon -X stuff '\\015^M'`);
            shellExec(`screen -S interfon -X stuff '\\015^M'`);
            shellExec(`screen -S interfon -X stuff 'm^M'`);
        }, 100);
        setTimeout(() => {
            shellExec(`screen -S interfon -X stuff '${sipNumber}^M'`);
        }, 500);
        setTimeout(() => {
            shellExec(`screen -S interfon -X stuff 'h^M'`);
        }, this._config.TIMEOUT_PJSUA);
    }

    HangUp() {
        shellExec(`screen -S interfon -X stuff 'h^M'`);
    }

    close() {
        shellExec(`screen -S interfon -X stuff 'h^M'`);
        shellExec(`screen -S interfon -X stuff 'q^M'`);
        shellExec('pgrep pjsua | xargs kill');
    }

    async callAll(req, res) {
        try {
            this.call(this._config.SIP_QUEUE);
            res.status(200).send({ status: 200, message: 'callAll OK', payload: {} });
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    HangUpApi(req, res) {
        try {
            this.HangUp();
            res.status(200).send({ status: 200, message: 'HangUp OK', payload: {} });
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    closepApi(req, res) {
        try {
            this.close();
            res.status(200).send({ status: 200, message: 'close OK', payload: {} });
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

    async reloadApi(req, res) {
        try {
            this.close();
            setTimeout(async() => {
                await this.run();    
            }, 5000);
            res.status(200).send({ status: 200, message: 'reload OK', payload: {} });
        } catch (error) {
            res.status(422).send({ status: 422, message: error.message || 'An unexpected error occurred', payload: {} });
        }
    }

}

module.exports = pjsuaController;