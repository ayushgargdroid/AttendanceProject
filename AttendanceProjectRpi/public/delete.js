const _ = require('lodash');
const SerialPort = require('serialport');
const mongoose = require('mongoose');
var {ipcRenderer,remote} = require('electron');
var main = remote.require(__dirname+'/index.js');
var {Mongoose,conn} = require(__dirname+'/public/db/mongoose.js');
var {Employee} = require(__dirname+'/public/db/employee.js');
var {EmployeeLocal} = require(__dirname+'/public/db/employee-local.js');
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
    console.log('Got reply from main process. Now populating');
    populateSelect();
});
var populateSelect = () => {
    for(var j=0;j<emp.length;j++){
        collector = collector + `<option value="${j}">${emp[j]}</option>`
    }
    $('#sel1').html(collector);
    collector = '';
}

$('#go').click(()=>{
    $('#myModal').modal('hide');
    t = $('#sel1').val(); 
    selected = mongoose.Types.ObjectId(ids[t-1]);
    if(!port.isOpen()){
        openConn();
    }
    setTimeout(()=>{
        sendData(`${vid1[t-1]}c`);
        sendData(`${vid2[t-1]}c`);
    },1500);
});

$('#sel1').click(()=>{
    t = $('#sel1').val(); 
    if(t!=previousItem){
        if(t==0){
            return;
        }
        $('#modal1-body').html('Are you sure, you want to delete '+emp[t]);
        $('#myModal').modal();
        console.log($('#sel1').val());
        selected = mongoose.Types.ObjectId(ids[t-1]);
        previousItem = t;    
    }
});

port.on('data',(data)=>{
    var msg = _.toNumber(data.toString());
    if(msg==1){
        z = z+1;
        if(z==2){
            EmployeeLocal.find({_id: selected}).remove(()=>{
                console.log('Deleted from local db');  
                port.close();
                if(mongoose.connection._readyState==1){
                    console.log('Net is connected. Attempting to delete from net.')
                    Employee.find({_id:selected}).remove(()=>{
                        console.log('Deleted from net');  
                    })
                }
                $('#myModalLabel2').html(emp[t]);
                $('#myModal2').modal();
                $('#close-button').click(() => {
                    _.remove(emp,(inte) => {
                        return inte === emp[t];
                    });
                    ipcRenderer.send('async',2);
                })
            },(err)=>{
                console.log(err);
            });
            z = 0;
        }
    }
    else{
        console.log('Could not delete');
    }
});

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