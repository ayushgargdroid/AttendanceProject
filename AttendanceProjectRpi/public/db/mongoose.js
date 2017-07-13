const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
var netUri = 'mongodb://heroku_80b0cnq8:backlgiv27tocq46rgfgs737b8@ds151662.mlab.com:51662/heroku_80b0cnq8';
var options = { server: { socketOptions: { keepAlive: 5000, connectTimeoutMS: 5000},auto_reconnect: false}, 
                replset: { socketOptions: { keepAlive: 5000, connectTimeoutMS : 5000 } } };

var conn = mongoose.createConnection('mongodb://localhost:27017/Clinic',options);
mongoose.connect(netUri,options).then(()=>{

}).catch((e)=>{
    console.log('Error from hoe');
});

mongoose.connection.on('disconnected',()=>{
    console.log('Disconnected');
    // mongoose.disconnect();
    setTimeout(()=>{
        mongoose.connect(netUri,options);
    },10000);
});

// conn.on('disconnected',()=>{
    
// })

mongoose.connection.on('error',()=>{
    console.log('Error');
});

conn.on('error',()=>{
    console.log('Local DB: '+err);
})

conn.on('connected',()=>{
    console.log('Connected to local db');
})

mongoose.connection.once('connected', function() {
	console.log("Connected to database");
});

module.exports = {
    mongoose,
    conn
};