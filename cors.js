const cors = require('cors');
const express = require('express');

//white list the sources
const whiteList = [ "http://localhost:3000" ];

// set Origin header as source e.g. "http://localhost:3000/" 
let corsOptionsDelegate = function (req, callback) {
    let corsOptions;
    console.log("Origin : ", req.header('Origin'));
    if (whiteList.includes(req.header('Origin'))) {
        console.log("Yes origin accepted");
        corsOptions = { origin: true };
    }
    else {
        console.log("Origin not accepted");
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

// set Origin header as source e.g. "http://localhost:3000/" 
// Use the following middleware function to verify cors
function checkCorsValidity (req, res, next) {
    let myorigin = req.header('Origin');
    if (myorigin.lastIndexOf('/') === (myorigin.length-1)) {
        myorigin = myorigin.slice(0,myorigin.length-1);
    }
    console.log("Origin : ", myorigin);
    if (whiteList.includes(myorigin)) {
        console.log("Yes origin accepted");
        next();
    }
    else {
        console.log("Origin not accepted");
        let err = new Error("This source is not recognized!");
        err.status = 403;
        next(err);
    }
    // callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
exports.checkCorsValidity = checkCorsValidity;