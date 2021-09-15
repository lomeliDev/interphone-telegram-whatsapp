const { asClass, createContainer, asFunction, asValue } = require("awilix");

const container = createContainer();

// app start
const StartUp = require("./startup");
const Server = require("./server");
const config = require("../config/environments");

// utils
const Log = require("./utils/Log");

// routes
const Routes = require("../api/routes");
const WhatsappRoutes = require("../api/routes/whatsapp.routes");

// controllers
const {
    WhatsappController,
    TelegramController,
    ButtonsController,
} = require("../api/controllers");

container
    .register({
        app: asClass(StartUp).singleton(),
        router: asFunction(Routes).singleton(),
        server: asClass(Server).singleton(),
        config: asValue(config),
        Log: asClass(Log).singleton(),
    })
    .register({
        WhatsappController: asClass(WhatsappController).singleton(),
        WhatsappRoutes: asFunction(WhatsappRoutes).singleton(),
    })
    .register({
        TelegramController: asClass(TelegramController).singleton(),
    })
    .register({
        ButtonsController: asClass(ButtonsController).singleton(),
    })

module.exports = container;
