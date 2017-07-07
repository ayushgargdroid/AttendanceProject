var SerialPort = require('serialport');

var port = new SerialPort('/dev/ttyACM0', {
    baudRate: 9600,
});

port.on('open', () => {
    setTimeout(() => {
        port.write('a',(err) => {
            if(err){
                return console.log(err);
            }
            console.log('Message written');
        });
    },2000);
    
});

port.on('data' ,function (data) {
    console.log(data.toString);
});