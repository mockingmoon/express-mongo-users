let express = require('express');

let indexRouter = express.Router();

indexRouter.route('/')
.get((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','text/html');
    res.end('<h1>Hi and welcome to my express app!</h1>');
});

module.exports = indexRouter;