const express = require('express');
const router = express.Router();
var { actor } = require('./main');
require('dotenv').config();

router.post("/aliexpress/products", async (req, res, next) => {
    try {
        actor(req.body.startUrls);
        return res.status(200).json({
            message: "ok"
        });
    } catch (e) {
        return res.status(500).json({
            message: e.message
        });
    }
});

module.exports = router;