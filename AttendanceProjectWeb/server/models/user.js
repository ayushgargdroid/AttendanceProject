const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        minlength: 5,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not an email'
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
    },
    designation: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    lastin: {
        type: Date
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]    
});

UserSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();
    
    user.tokens.push({access,token});
    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function(token){
    console.log('asfihals');
    var user = this;
    
    return user.update({
        $pull: {
            tokens: {
                token: token
            }
        }
    });
};

var User = mongoose.model('User',UserSchema);

module.exports = {User};