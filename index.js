const container = require("./api/container");
const application = container.resolve("app");
const Whatsapp = container.resolve("WhatsappController");
const Telegram = container.resolve("TelegramController");
const Buttons = container.resolve("ButtonsController");

application.start()
    .then(async () => {
        await Whatsapp.start();
        await Telegram.start();
        await Buttons.start();
    })
    .catch(err => {
        console.log(err);
        process.exit();
    });