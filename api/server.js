const express = require('express');

class Server {

    constructor({ config, router, Log }) {
        this._config = config;
        this._log = Log;
        this._express = express();
        this._express.use(router);
    }

    start() {
        return new Promise((resolve, reject) => {
            const http = this._express.listen(this._config.PORT_API, () => {
                const { port } = http.address();
                this._log.log(`Application running on port ${port} with the single worker ${process.pid}`)
                resolve();
            });
        });
    }

}

module.exports = Server;