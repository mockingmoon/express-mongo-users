const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        default: " "
    },
    lastName: {
        type: String,
        required: true,
        default: " "
    },
    email: {
        type: String
    },
    admin: {
        type : Boolean,
        default : false
    }
}, {
    timestamps : true
});

UserSchema.plugin(passportLocalMongoose);

const Users = mongoose.model('User', UserSchema);

module.exports = Users;