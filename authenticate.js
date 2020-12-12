const jwt = require('jsonwebtoken');
const passport = require('passport');
const config = require('./dbconfig');
const Users = require('./models/userModel');
const {Blacklist, deleteOlderTokens} = require('./models/BlacklistJwtModel');

const LocalStrategy = require('passport-local').Strategy;
const local = passport.use(new LocalStrategy(Users.authenticate()));
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

const expiresInSec = 3600; //JWT expires in 3600 seconds i.e. 1 hour
const getToken = function (user) {
    return jwt.sign(user, config.secretKey, { expiresIn:expiresInSec });
};

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const opts = {
    jwtFromRequest : ExtractJwt.fromHeader("auth_token"),
    secretOrKey : config.secretKey
};
// Pass JWT in header under the name "auth_token"

const jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    console.log('JWT PAYLOAD: ',jwt_payload);
    Users.findOne({_id:jwt_payload._id}, (err, user) => {
        if (err) {
            console.log(err);
            return done(err, false);
        }
        if (user) {
            console.log("Success!");
            return done(null, user);
        }
        else {
            console.log("No user found!");
            return done(null, false);
        }
    });
}));

const verifyUser = passport.authenticate('jwt', { session: false });

const verifyAdmin = function (req, res, next) {
    if (req.user.admin) {
        next();
    }
    else {
        let err = new Error("You are not authorized for this action!");
        err.status = 403;
        next(err);
    }
};

const checkJwtValidity = async function (req, res, next) {
    // Check whether JWT is valid i.e. whether it is not black listed
    try {
        let token = req.headers["auth_token"];
        let found = await Blacklist.findOne({ token: token });
        let delOldTokens = await deleteOlderTokens(expiresInSec);
        console.log(delOldTokens);
        if (found) {
            let err = new Error("JWT invalid!");
            err.status = 403;
            next(err);
        }
        else {
            next();
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
};

const checkLoggedIn = async function (req, res, next) {
    // Check whether someone is already logged in before sign up/log in
    try {
        let token = req.headers["auth_token"];
        let isValid = jwt.verify(token, config.secretKey);
        let isBlacklisted;
        if (isValid) {
            isBlacklisted = await Blacklist.findOne({ token: token });
            if (!isBlacklisted) {
                let err = new Error("Please log out before proceeding!");
                err.status = 403;
                next(err);
            }
        }
        next();
    }
    catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            console.log("Token expired, proceed to login. . .");
            next();
        }
        else {
            console.log(err);
            next(err);
        }
    }
};

module.exports = {
    local,
    jwtPassport,
    getToken,
    verifyUser,
    verifyAdmin,
    checkJwtValidity,
    checkLoggedIn
};