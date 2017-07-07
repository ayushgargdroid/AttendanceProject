var SerialPort = require('serialport');

var port = new SerialPort('ACM0', {
    baudRate: 9600,
    parser: SerialPort.parsers.readline('\n')
});

port.on('open', () => {
    port.write('a',(err) => {
        if(err){
            return console.log(err);
        }
        console.log('Message written');
    });;
});

port.on('data' ,(data) => {
    console.log(data);
})