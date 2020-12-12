const express = require('express');
const Users = require('../models/userModel');
const {Blacklist} = require('../models/BlacklistJwtModel');

const authenticate = require('../authenticate');
const passport = require('passport');
const cors = require('../cors');

let userRouter = express.Router();
userRouter.use(express.json());

userRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
.get(cors.corsWithOptions, authenticate.checkJwtValidity, authenticate.verifyUser, authenticate.verifyAdmin, async (req, res, next) => {
    // LIST ALL USERS
    try {
        let user = await Users.find({});
        if (user) {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(user);
        }
        else {
            res.statusCode = 404;
            res.send("No users found!");
        }
    }
    catch (err) {
        console.log(err);
        res.statusCode = 500;
        res.send(err);
    }
});

//UPDATE PROFILE
userRouter.route('/updateProfile')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200) })
.put(cors.corsWithOptions, authenticate.checkJwtValidity, authenticate.verifyUser, async (req, res, next) => {
    /**
     * Updates user profile
     * Takes username as req.user.username
     * Takes the values that need to be updated
     */
    try {
        let updateJson={}, updated=null;
        let username = req.user.username;
        if (req.body.firstName) {
            updateJson.firstName = req.body.firstName;
        }
        if (req.body.lastName) {
            updateJson.lastName = req.body.lastName;
        }
        if (JSON.stringify(updateJson).length>2) {
            updated = await Users.findOneAndUpdate({ username: username }, { $set: updateJson }, { new: true, useFindAndModify: false });
            if (updated) {
                return res.status(200).send({ status:1, updated:true, data:updated });
            }
            else {
                let err = new Error(`No users for username=${username} found.`);
                err.status = 403;
                throw err;
            }
        }
        else {
            let err = new Error("Please pass at least one parameter to update!");
            err.status = 500;
            throw err;
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ status:0, updated:false, message: err.message });
    }
});

userRouter.post('/login', authenticate.checkLoggedIn, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.log(err);
            next(err);
        }
        else if (!user) {
            res.statusCode = 401;
            res.setHeader("Content-Type","application/json");
            res.json({status:0,message:info,login:"Login was not successful!"});
        }
        else {
            req.logIn(user, (err) => {
                if (err) {
                    console.log(err);
                    res.statusCode = 500;
                    res.setHeader("Content-Type","application/json");
                    res.json({status:0,message:err.message,login:"Login was not successful due to internal error!"});
                }
                else {
                    let token = authenticate.getToken({_id:req.user._id});
                    req.headers["auth_token"] = token;
                    res.statusCode = 200;
                    res.setHeader("Content-Type","application/json");
                    res.json({status:1,token:token,login:"Login successful!"});
                }
            })
        }
    }) (req, res, next);
});

userRouter.post('/signup', authenticate.checkLoggedIn,  (req, res, next) => {
    if (req.body.username && req.body.password) {
        Users.register(new Users({ username: req.body.username }), req.body.password, (err, user) => {
            if (err) {
                console.log(err);
                res.statusCode = 500;
                res.setHeader('Content-Type','application/json');
                res.json({status:0,err:err.message});
            }
            else {
                if (req.body.firstName) {
                    user.firstName = req.body.firstName;
                }
                if (req.body.lastName) {
                    user.lastName = req.body.lastName;
                }
                user.save((err, user) => {
                    if (err) {
                        console.log(err);
                        res.statusCode = 500;
                        res.setHeader('Content-Type','application/json');
                        res.json({status:0,err:err.message});
                    }
                    else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type','application/json');
                        res.json({status:1,registered:true,user:user});
                    }
                });
            }
        });
    }
});

userRouter.get('/logout', authenticate.checkJwtValidity, authenticate.verifyUser, async (req, res, next) => {
    //MAKE SURE TO DELETE THE auth_token header
    if (req.session) {
        let invalidate = await Blacklist.create({ token: req.headers['auth_token'] })
        req.session.destroy();
        delete req.headers['auth_token'];
        res.clearCookie('session-id');
        res.redirect('/');
    }
    else {
        let err = new Error("You are not logged in!");
        err.status = 403;
        next(err);
    }
});

userRouter.delete('/deleteAccount', authenticate.checkJwtValidity, authenticate.verifyUser, async (req, res, next) => {
    // TO DELETE A USER ACCOUNT I.E. FROM DATABASE
    try {
        let deleted, username, invalidate;
        console.log(req.user);
        username = req.user.username;
        if (!username) {
            let err = new Error("Please pass a valid username!");
            err.status = 401;
            throw err;
        }
        deleted = await Users.deleteOne({ username: username });
        if (deleted) {
            if (req.session) {
                invalidate = await Blacklist.create({ token: req.headers['auth_token'] })
                req.session.destroy();
                delete req.headers['auth_token'];
                res.clearCookie('session-id');
            }
            return res.status(200).send({ status:1, deleted:deleted, message:"Your account and all its data has been deleted!" });
        }
        else {
            let err = new Error("We could not delete your data! Please try again after some time!");
            err.status = 500;
            throw err;
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).send({ status:0, deleted:false, message:err.message });
    }
});

module.exports = userRouter;