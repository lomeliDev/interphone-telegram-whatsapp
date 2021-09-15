const container = require("./api/container");
const application = container.resolve("app");
const Whatsapp = container.resolve("WhatsappController");
const Telegram = container.resolve("TelegramController");

application.start()
    .then(async () => {
        await Whatsapp.start();
        await Telegram.start();
    })
    .catch(err => {
        console.log(err);
        process.exit();
    });