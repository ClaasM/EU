/**
 * Created by Claas on 24.08.2015.
 */
var express = require('express');
var request = require('request');
var router = express.Router();

router.route('/*')
    .get(function (req, res) {
        request.get(
            'https://api.facebook.com/method/links.getStats?format=json&urls=' + req.query.url,
            function (error, response, body) {
                if (!error && body) {
                    var obj = JSON.parse(body);
                    if(obj[0]){
                        res.send(obj[0].share_count + "");
                    } else {
                        res.send("-3");
                    }
                } else {
                    res.send("-2"); //TODO auf 0 ändern
                }
            });
    });

module.exports = router;