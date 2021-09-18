const express = require("express");
const { Router } = require("express");
const cors = require("cors");
const compression = require("compression");

module.exports = function ({ WhatsappRoutes, StreamRoutes }) {
    const router = Router();
    const apiRoute = Router();

    apiRoute.use(cors())
    apiRoute.use(compression())
    apiRoute.use(express.json({ limit: '50mb' }))
    apiRoute.use(express.urlencoded({ extended: false, limit: '50mb' }))

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
    apiRoute.use("/stream", StreamRoutes);
    router.use("/api", apiRoute);

    return router;
};