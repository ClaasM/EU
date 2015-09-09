/**
 * Created by Claas on 24.08.2015.
 */
var express = require('express');
var nodemailer = require('nodemailer');

var router = express.Router();


var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'petereckberger@gmail.com',
        pass: 'hozayoce'
    }
});


router.route('*')
    .post(function (req, res) {
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: req.body.sender, // sender address
            to: 'claasmeiners@googlemail.com', // list of receivers
            subject: 'Feedback on CalculateTheWorld', // Subject line
            text: req.body.text + '\n Email: ' + (req.body.sender || 'not entered'), // plaintext body
            html: '' // html body
        };
        transporter.sendMail(mailOptions);
        res.send("Email sent");
    });


module.exports = router;