const _ = require('lodash');
const SerialPort = require('serialport');

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
var i=0;
var id1,id2;
openConn();
$(document).on('change','#sel1',(e) => {
    var t = $('#sel1').val();
    setTimeout(()=>{
        sendData('b');
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

var collector = '';
var emp = ['Please select something','Ayush','Tanish','Sharma','Gupta'];

var populateSelect = () => {
    for(var i=0;i<emp.length;i++){
        collector = collector + `<option value="${emp[i]}">${emp[i]}</option>`
    }
    $('#sel1').html(collector);
    collector = '';
}
$(document).ready(() => {
    populateSelect();
})

port.on('data',(data) => {
    var msg = data.toString();
    if(msg === 'Remove finger'){
        i = i + 1;
        console.log(i);
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
            port.close();
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
})