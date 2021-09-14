const express = require("express");
const { Router } = require("express");
const cors = require("cors");
const compression = require("compression");
const expressPublicIp = require('express-public-ip');
const expressip = require('express-ip');
const useragent = require('express-useragent');
const fileUpload = require('express-fileupload');

module.exports = function ({ WhatsappRoutes }) {
    const router = Router();
    const apiRoute = Router();

    apiRoute.use(cors())
    apiRoute.use(compression())
    apiRoute.use(express.json({ limit: '50mb' }))
    apiRoute.use(express.urlencoded({ extended: false, limit: '50mb' }))
    apiRoute.use(expressPublicIp())
    apiRoute.use(expressip().getIpInfoMiddleware)
    apiRoute.use(useragent.express())
    apiRoute.use(fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/'
    }));

    apiRoute.use(function (req, res, next) {
        res.setHeader('X-Powered-By', 'Interfon-Whatsapp');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin , X-Requested-With , Content-Type , Accept , Access-Control-Allow-Request-Method');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT , DELETE');
        res.setHeader('Allow', 'GET, POST, OPTIONS, PUT , DELETE');
        next();
    });

    apiRoute.use("/whatsapp", WhatsappRoutes);
    router.use("/api", apiRoute);

    return router;
};