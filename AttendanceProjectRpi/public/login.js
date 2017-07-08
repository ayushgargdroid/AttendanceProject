const _ = require('lodash');
const SerialPort = require('serialport');
var {ipcRenderer} = require('electron');
var {Mongoose} = require(__dirname+'/public/db/mongoose.js');
var {Employee} = require(__dirname+'/public/db/employee.js');
var {User} = require(__dirname+'/public/db/user.js');
var collector = '';
var emp = ['Please select something'];
var ids = [];

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

$(document).on('change','#sel1',(e) => {
    var t = $('#sel1').val();
    selected = mongoose.Types.ObjectId(ids[t-1]);
    Employee.find({_id: selected},(employee)=>{
        var current = new Date();
        var month = current.getMonth();
        var day = current.getDate();
        var hours = current.getHours();
        var minutes = current.getMinutes();
        if(employee.live[month-1][day-1][0].length === 0){
            employee.live[month-1][day-1][0].push(hours+':'+minutes);
            $('#message').html('Employee successfully logged in!');
        }
        else if(employee.live[month-1][day-1][0].length > employee.live[month-1][day-1][1].length){
            employee.live[month-1][day-1][1].push(hours+':'+minutes);
            $('#message').html('Employee successfully logged out!');
        }
        else if(employee.live[month-1][day-1][0].length === employee.live[month-1][day-1][1].length){
            employee.live[month-1][day-1][0].push(hours+':'+minutes);
            $('#message').html('Employee successfully logged in!');
        }
        Employee.save().then(()=>{
            console.log('Successfully updated.');
            $('#myModalLabel').html(t);
            $('#myModal').modal();
        })
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