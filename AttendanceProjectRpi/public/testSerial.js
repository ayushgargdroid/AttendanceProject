var SerialPort = require('serialport');

var port = new SerialPort('/dev/ttyACM0', {
    baudRate: 9600,
    autoOpen: false
});

var msg = '';
var incoming = '';
var isNew = false;

//port.on('open', () => {
//    console.log('Port opened.');
//    setTimeout(() => {
//        port.write('a',(err) => {
//            if(err){
//                return console.log(err);
//            }
//            console.log('Message written');
//        });
//    },2000);
//    
//});

var openConn = () => {
    port.open((err) => {
        if(err){
            return console.log(err);
        }
        console.log('Port opened');
    });
}

var sendData = (data) => {
    if(port.isOpen()){
        console.log('Port checked for opening');
        console.log(data);
        port.write(data,(err) => {
            if(err){
                return console.log(err);
            }
            console.log(data + ' sent.');
        });
    }
}

port.on('data' ,function (data) {
    incoming = data.toString();
    isNew = true;
});

var recieveData = () => {
    if(isNew){
       msg = incoming;
       isNew = false;
       incoming = '';
       return msg;
    }
}
       
var closeConn = () => {
    port.close((err) => {
        if(err){
            return console.log(err);
        }
        console.log('Closed connection');
    })
}    
      
module.exports = {
    openConn,
    closeConn,
    recieveData,
    sendData
}
