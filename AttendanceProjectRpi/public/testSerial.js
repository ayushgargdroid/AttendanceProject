var SerialPort = require('serialport');

var port = new SerialPort('/dev/ttyACM0', {
    baudRate: 9600,
    parser: SerialPort.parsers.readline('\n')
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

port.on('data' ,(data) => {
    console.log(data);
})