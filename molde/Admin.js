const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
const Admin = new Schema({
    email: String,
    passWord: String,
    name: String,
    image:String,
    date : String,
    role: { type: String, enum: ['admin', 'user'], default: 'user' }
  });

  Admin.pre('save', function (next) {
    var user = this;
    if (this.isModified('passWord') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.passWord, salt, null, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.passWord = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

Admin.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.passWord, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

module.exports = mongoose.model("Admin",Admin);