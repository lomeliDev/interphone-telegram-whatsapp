const { asClass, createContainer, asFunction, asValue } = require("awilix");

const container = createContainer();

// app start
const StartUp = require("./startup");
const Server = require("./server");
const config = require("../config/environments");

// routes
const Routes = require("../api/routes");

container
    .register({
        app: asClass(StartUp).singleton(),
        router: asFunction(Routes).singleton(),
        server: asClass(Server).singleton(),
        config: asValue(config),
    })

module.exports = container;
