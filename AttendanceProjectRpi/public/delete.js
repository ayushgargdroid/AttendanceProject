const _ = require('lodash');
const SerialPort = require('serialport');
var {Mongoose} = require(__dirname+'/public/db/mongoose.js');
var {Employee} = require(__dirname+'/public/db/employee.js');
var {User} = require(__dirname+'/public/db/user.js');
var collector = '';
var emp = ['Please select something'];

var port = new SerialPort('/dev/ttyACM0', {
    baudRate: 9600,
    autoOpen: false,
    parser: SerialPort.parsers.readline('\r\n')
});
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

var populateSelect = () => {
    for(var i=0;i<emp.length;i++){
        collector = collector + `<option value="${emp[i]}">${emp[i]}</option>`
    }
    $('#sel1').html(collector);
    collector = '';
}

Employee.find({} ,(err,emps)=>{
    if(err){
        return console.log(err);
    }
    _.forEach(emps,function(emp1){
        emp.push(emp1.name);
    })
    populateSelect();
});

$(document).on('change','#sel1',(e) => {
    var t = $('#sel1').val();
    setTimeout(()=>{
        sendData(`{id}c`);
    },1500);
    $('#myModalLabel').html(t);
    $('#myModal').modal();
    $('#close-button').click(() => {
        _.remove(emp,(name) => {
            return name === t;
        });
        populateSelect();
    })
})