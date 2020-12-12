//MODULE IMPORTS
const express = require('express');
const morgan = require('morgan'); //Logger
const path = require('path');
const mongoose = require('mongoose');
const dbconfig = require('./dbconfig'); //Database config
const cookieParser = require('cookie-parser');
const session = require('express-session');

//ROUTER IMPORTS
const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');

//PASSPORT FOR AUTHENTICATION
const passport = require('passport');

let app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended:false }));

app.use(session({
    name : 'session-id',
    secret : '12345-67890-11346-44003-24354',
    saveUninitialized : false,
    resave : false
}));

app.use(passport.initialize());
app.use(passport.session());

//PATHS ROUTER
app.use('/',indexRouter);
app.use('/users',userRouter);

app.use(express.static(__dirname + '/public'));

//CONNECT TO MONGODB
const url = dbconfig.mongoUrl;
const connect = mongoose.connect(url, { useNewUrlParser:true , useUnifiedTopology:true });

connect.then(() => {
    console.log('Connected to mongoDB server correctly.');
}, (err) => console.log(err));

//ERROR HANDLER
app.use(function (err, req, res, next) {
    if (err) {
        let status = 500;
        if (err.status >= 400 || err.status < 600) {
            status = err.status;
        }
        res.status(status).send(`Something went wrong. Description of error: ${err.message} .`);
    }
    else {
        next();
    }
});

module.exports = app;