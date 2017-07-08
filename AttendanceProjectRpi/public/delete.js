const _ = require('lodash');
const SerialPort = require('serialport');
var {ipcRenderer} = require('electron');
var {Mongoose} = require(__dirname+'/public/db/mongoose.js');
var {Employee} = require(__dirname+'/public/db/employee.js');
var {User} = require(__dirname+'/public/db/user.js');
var collector = '';
var emp = ['Please select something'];
var ids = [];
var selected;

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
ipcRenderer.on('async-reply',(event,args)=>{
    employees = args;
    _.forEach(employees,function(emp1){
        if(emp1.verified){
            emp.push(emp1.name);
            ids.push(emp1._id);    
        }
    })
    populateSelect();
});
var populateSelect = () => {
    for(var j=0;j<emp.length;j++){
        collector = collector + `<option value="${j}">${emp[j]}</option>`
    }
    $('#sel1').html(collector);
    collector = '';
}

//Employee.find({} ,(err,emps)=>{
//    if(err){
//        return console.log(err);
//    }
//    _.forEach(emps,function(emp1){
//        emp.push(emp1.name);
//    })
//    populateSelect();
//});

$(document).on('change','#sel1',(e) => {
    var t = $('#sel1').val();
    selected = t;
    var selectedEmployee = _.find(employees,(employee)=>{
        if(ids[selected-1]==employee._id){
            return true;
        }
        return false;
    });
    setTimeout(()=>{
        sendData(`{selectedEmployee.id1}c`);
        sendData(`{selectedEmployee.id2}c`);
    },1500);
    Employee.find({_id: selectedEmployee._id},(err,employee)=>{
        if(err){
            return console.log(err);
        }
        employee[0].verified = false;
        employee[0].id1 = '';
        employee[0].id2 = '';
        console.log('Deleted '+employee[0].name);
    });
    $('#myModalLabel').html(t);
    $('#myModal').modal();
    $('#close-button').click(() => {
        _.remove(emp,(name) => {
            return name === t;
        });
        populateSelect();
    })
});
$(document).ready(()=>{
    ipcRenderer.send('async',2);
});
console.log('yoda');