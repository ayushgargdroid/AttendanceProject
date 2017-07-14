const _ = require('lodash');
const SerialPort = require('serialport');
const mongoose = require('mongoose');
var {ipcRenderer,remote} = require('electron');
var main = remote.require(__dirname+'/index.js');
var {Mongoose,conn} = require(__dirname+'/public/db/mongoose.js');
var {Employee} = require(__dirname+'/public/db/employee.js');
var {EmployeeLocal} = require(__dirname+'/public/db/employee-local.js');
var collector = '';
var emp = ['Please select from below'];
var ids = [];
var employees = [];
var selected;

var port = new SerialPort('/dev/ttyACM0', {
    baudRate: 9600,
    autoOpen: false,
    parser: SerialPort.parsers.readline('\r\n')
});

ipcRenderer.on('async-reply',(event,args)=>{
    console.log('received');
    employees = args;
    _.forEach(employees,function(emp1){
        if(emp1.verified==false){
            emp.push(emp1.name);
            ids.push(emp1._id);    
        }
    })
    populateSelect();
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
var i=0;
var id1,id2;

var populateSelect = () => {
    for(var j=0;j<emp.length;j++){
        collector = collector + `<option value="${j}">${emp[j]}</option>`
    }
    $('#sel1').html(collector);
    collector = '';
}

$('#sel1').click(()=>{
    console.log($('#sel1').val());
    var t = $('#sel1').val();
    if(t==0){
        return;
    }
    if(!port.isOpen()){
        openConn();
    }
    selected = t;
    setTimeout(()=>{
        sendData('b');
    },1500);
    $('#myModalLabel').html(emp[t]);
    $('#myModal').modal();
    $('#close-button').click(() => {
        _.remove(emp,(inte) => {
            return inte === emp[t];
        });
        console.log(emp);
        populateSelect();
    });
});

port.on('data',(data) => {
    var msg = data.toString();
    if(msg === 'Remove finger'){
        i = i + 1;
        if(i<=3){
            $(`#to${i}`).css('display','block');
        }
        else if(i<=6){
            $(`#fo${i-3}`).css('display','block');
        }
    }
    if(Number.isInteger(_.toNumber(msg))){
        if(i<=3){
            id1 = msg;
            sendData('b');
        }
        else{
            id2 = msg;
            i = 0;
            _id = mongoose.Types.ObjectId(ids[selected-1]);
            EmployeeLocal.find({_id},(err,emps) => {
                if(err){
                    console.log(err);
                }
                else{
                    if(mongoose.connection._readyState==1){
                        Employee.find({_id},(err,employees)=>{
                            employee = employees[0];
                            employee.id1 = id1;
                            employee.id2 = id2;
                            employee.verified = true;
                            emps[0].id1 = id1;
                            emps[0].id2 = id2;
                            emps[0].verified = true;
                            emps[0].save().then((doc)=>{
                                ipcRenderer.send('async',2);
                                console.log('Saved'+id1+' '+id2+' to local db');
                                port.close();
                                setTimeout(()=>{
                                    populateSelect();
                                },1000);
                                employee.save().then(()=>{
                                    console.log('Saved'+id1+' '+id2+' to global db');
                                },(err)=>{
                                    console.log('Could not store online');
                                });
                            });
                        })
                    }  
                }
            })
        }
    }
    if(msg.includes('error') || msg == '-'){
        if(i<=3){
            port.close();
            $('#myModal').modal('hide');
            for(;i>0;i--){
                $(`#to${i}`).css('display','none');
            }
        }
        else{
            sendData(`${id1}c`);
            $('#myModal').modal('hide');
            for(;i>3;i--){
                $(`#fo${i}`).css('display','none');
            }
            for(;i>0;i--){
                $(`#to${i}`).css('display','none');
            }
            port.close();
        }
        console.log('error: '+msg);
    }
    console.log('Incoming: '+msg);
});
openConn();
$(document).ready(()=>{
    ipcRenderer.send('async',2);
});
$('#signout').click(()=>{
    console.log('Calling index');
    ipcRenderer.send('async',1);
});
$('#add').click(()=>{
    console.log('Calling add');
    ipcRenderer.send('async',3);
});
$('#delete').click(()=>{
    console.log('Calling delete');
    ipcRenderer.send('async',4);
});
$('#login').click(()=>{
    console.log('Calling login');
    ipcRenderer.send('async',5);
});