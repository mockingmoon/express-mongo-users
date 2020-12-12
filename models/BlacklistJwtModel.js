const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BlacklistSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    createTime: {
        type: Date,
        required: true,
        default: new Date()
    }
});

async function deleteOlderTokens(expiresInSec) {
    /**
     * Delete those tokens which were created "expiresInSec" seconds ago
     * This is to remove old and redundant data of expired tokens
     */
    try {
        //Check parameter
        if (!expiresInSec || isNaN(expiresInSec) || expiresInSec<=0) {
            let err = new Error("Please pass a valid number for- expires in seconds>0!");
            throw err;
        }
        let rightNow = new Date();
        let olderTokens = await Blacklist.deleteMany({ createTime: { $lt: new Date(rightNow.getTime()-expiresInSec*1000) }});
        if (olderTokens) {
            return {status:1,deleted:olderTokens}
        }
        else {
            return {status:0,deleted:false}
        }
    }
    catch (err) {
        console.log(err);
        return {status:0,deleted:false}
    }
}

const Blacklist = mongoose.model('BlacklistJwt', BlacklistSchema);

module.exports = {
    Blacklist,
    deleteOlderTokens
};