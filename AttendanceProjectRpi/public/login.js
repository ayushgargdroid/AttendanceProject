const _ = require('lodash');
const SerialPort = require('serialport');
const mongoose = require('mongoose');
var {ipcRenderer} = require('electron');
var {Mongoose,conn} = require(__dirname+'/public/db/mongoose.js');
var {Employee} = require(__dirname+'/public/db/employee.js');
var {EmployeeLocal} = require(__dirname+'/public/db/employee-local.js');
var collector = '';
var emp = ['Please select something'];
var ids = [];

$('#sel1').click(()=>{
    console.log($('#sel1').val());
})

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
    collector = '';
    for(var j=0;j<emp.length;j++){
        collector = collector + `<option value="${j}">${emp[j]}</option>`
    }
    $('#sel1').html(collector);
}

ipcRenderer.on('async-reply',(event,args)=>{
    employees = args;
    console.log(employees);
    _.forEach(employees,function(emp1){
        if(emp1.verified){
            emp.push(emp1.name);
            ids.push(emp1._id);    
        }
    })
    populateSelect();
});

$(document).on('change','#sel1',(e) => {
    var t = $('#sel1').val();
    selected = mongoose.Types.ObjectId(ids[t-1]);
    EmployeeLocal.find({_id: selected},(err,employee)=>{
        if(err){
            return console.log(err);
        }
        console.log(employee);
        var current = new Date();
        var month = current.getMonth();
        var day = current.getDate();
        var hours = current.getHours();
        var minutes = current.getMinutes();
        var live1  = employee[0].live;
        console.log(live1[month][day-1][0]);
        if(live1[month][day-1][0].length === 0){
            live1[month][day-1][0].push(hours+':'+minutes);
            $('#message').html('Employee successfully logged in!');
        }
        else if(live1[month][day-1][0].length > live1[month][day-1][1].length){
            live1[month][day-1][1].push(hours+':'+minutes);
            $('#message').html('Employee successfully logged out!');
        }
        else if(live1[month][day-1][0].length === live1[month][day-1][1].length){
            live1[month][day-1][0].push(hours+':'+minutes);
            $('#message').html('Employee successfully logged in!');
        }
        employee[0].live = live1;
        if(mongoose.connection._readyState==1){
            Employee.find({_id: selected},(err,employeeGlobal)=>{
                if(err){
                    return console.log('Could not save to net');
                }
                employeeGlobal[0].live = live1;
                employeeGlobal[0].markModified('live');
                employeeGlobal[0].save().then(()=>{
                    console.log('Updated to the net');
                },(err)=>{
                    console.log('Could not save to net');
                })
            });
        }
        employee[0].markModified('live');
        employee[0].save().then((docs)=>{
            console.log('Successfully updated.');
            $('#myModalLabel').html(t);
            $('#myModal').modal();
        });
    });
    $('#close-button').click(() => {
        _.remove(emp,(name) => {
            return name === t;
        });
        populateSelect();
    });
});
$(document).ready(()=>{
    ipcRenderer.send('async',2);
})