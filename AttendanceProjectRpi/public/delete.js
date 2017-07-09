const _ = require('lodash');
const SerialPort = require('serialport');
const mongoose = require('mongoose');
var {ipcRenderer,remote} = require('electron');
var main = remote.require(__dirname+'/index.js');
var {Mongoose} = require(__dirname+'/public/db/mongoose.js');
var {Employee} = require(__dirname+'/public/db/employee.js');
var collector = '';
var emp = ['Please select something'];
var ids = [];
var vid1 = [];
var vid2 = [];
var selected;
var z = 0;
var t;
var previousItem;

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
openConn();
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
        if(emp1.verified==true){
            emp.push(emp1.name);
            ids.push(emp1._id); 
            vid1.push(emp1.id1);
            vid2.push(emp1.id2);
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

$('#sel1').click(()=>{
    console.log($('#sel1').val());
    t = $('#sel1').val();
    if(t!=previousItem){
        if(t==0){
            return;
        }
        selected = mongoose.Types.ObjectId(ids[t-1]);
        if(!port.isOpen()){
            openConn();
        }
        setTimeout(()=>{
            sendData(`${vid1[t-1]}c`);
            sendData(`${vid2[t-1]}c`);
        },1500);
        previousItem = t;    
    }
});

port.on('data',(data)=>{
    var msg = _.toNumber(data.toString());
    if(msg==1){
        z = z+1;
        if(z==2){
            Employee.find({_id: selected},(err,employee)=>{
            if(err){
                return console.log(err);
            }
            var id1 = employee[0].id1;
            var id2 = employee[0].id2;
            employee[0].verified = false;
            employee[0].id1 = '';
            employee[0].id2 = '';
            employee[0].save().then(()=>{
                console.log('Deleted '+employee[0].name);  
                port.close();
                main.getData();
                $('#myModalLabel').html(emp[t]);
                $('#myModal').modal();
                $('#close-button').click(() => {
                    _.remove(emp,(inte) => {
                        return inte === emp[t];
                    });
                    ipcRenderer.send('async',2);
//                    populateSelect();
                });
            })
            });
            z = 0;
        }
    }
    else{
        console.log(data.toString());
    }
});

//$(document).on('change','#sel1',(e) => {
//    var t = $('#sel1').val();
//    selected = mongoose.Types.ObjectId(ids[t-1]);
//    var selectedEmployee = _.find(employees,(employee)=>{
//        if(ids[selected-1]==employee._id){
//            return true;
//        }
//        return false;
//    });
//    Employee.find({_id: selected},(err,employee)=>{
//        if(err){
//            return console.log(err);
//        }
//        var id1 = employee[0].id1;
//        var id2 = employee[0].id2;
//        setTimeout(()=>{
//            sendData(`${id1}c`);
//            sendData(`${id2}c`);
//        },500);
//        employee[0].verified = false;
//        employee[0].id1 = '';
//        employee[0].id2 = '';
//        employee[0].save().then(()=>{
//            console.log('Deleted '+employee[0].name);  
//            port.close();
//        })
//    });
//    $('#myModalLabel').html(t);
//    $('#myModal').modal();
//    $('#close-button').click(() => {
//        _.remove(emp,(name) => {
//            return name === t;
//        });
//        populateSelect();
//    })
//});
$(document).ready(()=>{
    ipcRenderer.send('async',2);
})