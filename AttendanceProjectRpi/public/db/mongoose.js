const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://heroku_80b0cnq8:backlgiv27tocq46rgfgs737b8@ds151662.mlab.com:51662/heroku_80b0cnq8');

mongoose.connection.once('connected', function() {
	console.log("Connected to database")
});

module.exports = {
    mongoose
};