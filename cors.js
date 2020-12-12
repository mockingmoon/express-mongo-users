const cors = require('cors');
const express = require('express');

//white list the sources
const whiteList = [ "http://localhost:3000/" ];

// set Origin header as source e.g. "http://localhost:3000/" 
let corsOptionsDelegate = function (req, callback) {
    let corsOptions;
    console.log("Origin : ", req.header('Origin'));
    if (whiteList.includes(req.header('Origin'))) {
        corsOptions = { origin: true };
    }
    else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);