var SerialPort = require('serialport');
var port = new SerialPort('/dev/ttyACM0',{
    baudRate: 9600,
    parser: SerialPort.parsers.readline('\n')
});
 
port.on('open', function() {
  port.write('b', function(err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('message written');
  });
});

port.on('data',(data) => {
    console.log(data.toString());
})