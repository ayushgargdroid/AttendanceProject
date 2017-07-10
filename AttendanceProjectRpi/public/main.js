const _ = require('lodash');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
var {Mongoose} = require(__dirname+'/public/db/mongoose.js');
var {Employee} = require(__dirname+'/public/db/employee.js');
var {ipcRenderer,remote} = require('electron');
var main = remote.require(__dirname+'/index.js');
var SerialPort = require('serialport');
var employees = [];

var port = new SerialPort('/dev/ttyACM0', {
    baudRate: 9600,
    autoOpen: false
});

var loginAttemptUp = false;
var correctPin = "0000";
var loginPin = "";
var slideUpObj = {
    start : 0,
    end : 0,
    element : "",
    element2 : "",
    diff : 0,
    fps : 0,
    followup : null,
    initiate : function(){
        setTimeout(function(){     
        //console.log(slideUpObj.start);
        $(slideUpObj.element).css("margin-top",slideUpObj.start.toString()+"px");
        if(slideUpObj.element2!=""){
          $(slideUpObj.element2).css("margin-top",(slideUpObj.start+slideUpObj.diff).toString()+"px");  
        }
        slideUpObj.start-=slideUpObj.fps;
        if(slideUpObj.start>slideUpObj.end){
            slideUpObj.initiate();
        }                          
        else{
                if(slideUpObj.followup != null){    
                    if(slideUpObj.followup.initiate == null){
                        slideUpObj.start = slideUpObj.followup.start;
                        slideUpObj.end = slideUpObj.followup.end;
                        slideUpObj.element2 = slideUpObj.followup.element2;
                        slideUpObj.diff = slideUpObj.followup.diff;
                        slideUpObj.element = slideUpObj.followup.element;
                        slideUpObj.fps = slideUpObj.followup.fps;
                        slideUpObj.followup = slideUpObj;
                    }
                    slideUpObj.followup.initiate();
                    slideUpObj.followup = null;
                }
        } 
        },1);
    }
}
var slideDownObj = {
    start : 0,
    end : 0,
    element : "",
    fps : 0,
    followup : null,
    initiate : function(){    
        setTimeout(function(){                                     $(slideDownObj.element).css("margin-top",slideDownObj.start.toString()+"px");
        slideDownObj.start+=slideDownObj.fps;
        if(slideDownObj.start<=slideDownObj.end)
            slideDownObj.initiate();
        else{
            if(slideDownObj.followup != null)
                slideDownObj.followup.initiate();
        }
        },1);
    }
}
var slideDataObj = {
    start : 0,
    end : 0,
    element : "",
    fps : 0,
    followup : null,
    initiate : null,
    element2 : "",
    diff : 0
}

let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'ayushgargdroid@gmail.com',
        pass: ''
    }
});

//6am IST 7th July - 1499387400
//86400 ms - 1 day
//8:40 am - 1499397001144
//9:40 am - 1499400601188

if(Date.now() == 1499396498545){
    console.log('Hola');
    correctPin = _.toString(_.random(0,9999));
    let mailOptions = {
        from: 'Ayush Garg <ayushgargdroid@gmail.com>',
        to: 'ayush.garg1@learner.manipal.edu',
        subject: 'Hello World',
        text: "Security Guard's Code",
        html: `<h1>${correctPin}</h1>`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}
ipcRenderer.on('async-reply',(event,arg)=>{
    employees = arg;
})
var openConn = () => {
    if(!port.isOpen()){
        port.open((err) => {
            if(err){
                return console.log(err);
            }
            console.log('Port opened');
        });   
    }
}
var sendData = (data) => {
    var timeout = 0;
    if(!port.isOpen()){
        openConn();
        timeout = 3000;
    }
    setTimeout(()=>{
        console.log('Port checked for opening');
        console.log(data);
        port.write(data,(err) => {
            if(err){
                return console.log(err);
            }
            console.log(data + ' sent.');
        });
    },timeout);
}
function startedTyping(){
    $("#login-pin-form").addClass("has-error");
    $("#failiure").html('<span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden="true"></span>');
}
function openUp1(){    
    toSuccess = Date.now();
    updateTime();
    $("#login-pin-form").addClass("has-success");
    $("#failiure").html('');
    $("#success").html('<span class="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>');
    main.pong();
}
function openUp2(){
    toSuccess = Date.now();
    updateTime();
    $("#login-pin-form").addClass("has-success");
    $("#failiure").html('');
    $("#success").html('<span class="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>');
    slideUpObj.start = 0;
    slideUpObj.end = -485;
    slideUpObj.fps = 5;
    slideUpObj.element = "#placeholder-screen";
    slideUpObj.followup = null;
    slideUpObj.initiate();
    setTimeout(() => {
        console.log('yolo');
        $('#main-placeholder-logo').css("margin-top","170px")
        slideDownObj.start = -485;
        slideDownObj.end = 0;
        slideDownObj.fps = 5;
        slideDownObj.element = "#placeholder-screen";
        slideDownObj.followup = null;
        slideDownObj.initiate();
        port.close((err) => {
            if(err){
                return console.log(err);
            }
        })
        setTimeout(()=>{
            ipcRenderer.send('async',1);    
        },1000);
    },5000);
}

function updateTime(){
    var currentTime = new Date();
    var currentTimeBar = 0;
    currentTimeBar = (currentTime.getHours() * 46)+(currentTime.getMinutes()*42/60);
    console.log(currentTimeBar);
    $("#current-time").css('top',currentTimeBar+'px');
    var t = setTimeout(function(){
        updateTime();
    },60000);
}

$("#login-pin").swipe({
    tap:function(event,target){
        if(port.isOpen()){
            sendData('d');
            setTimeout(()=>{
                port.close();
            },500);
        }
        if(loginAttemptUp==false){
            $("#keyboard-layout").removeClass('hidden');
            slideUpObj.start = 480;
            slideUpObj.end = 310;
            slideUpObj.fps = 4;
            slideUpObj.element = "#keyboard-layout";
            slideDataObj.start = 170;
            slideDataObj.end = 50;
            slideDataObj.fps = 4;
            slideDataObj.element = "#main-placeholder-logo";
            slideDataObj.followup = null;
            slideDataObj.initiate = null;
            slideDataObj.element2 = "#keyboard-layout";
            slideDataObj.diff = 150;
            slideUpObj.followup = slideDataObj;
            slideUpObj.initiate();
            loginAttemptUp = true;
        }
}});
$('.finger').click(()=>{
    setTimeout(() => {
        sendData('a');
    },500);
});
var inputPin = function(){
    $("#key0").swipe({
        tap:function(event,target){
            if(loginPin=="")
                startedTyping();
            $("#login-pin").attr("value",$("#login-pin").attr("value")+"0");
            loginPin += "0";
            if(loginPin==correctPin){
                openUp1();
                port.close((err) => {
                if(err){
                        return console.log(err);
                    }
                })
            }
        }
    });
    $("#key1").swipe({
        tap:function(event,target){
            if(loginPin=="")
                startedTyping();
            $("#login-pin").attr("value",$("#login-pin").attr("value")+"1");
            loginPin += "1";
            if(loginPin==correctPin){
                openUp();
            }
        }
    });
    $("#key2").swipe({
        tap:function(event,target){
            if(loginPin=="")
                startedTyping();
            $("#login-pin").attr("value",$("#login-pin").attr("value")+"2");
            loginPin += "2";
            if(loginPin==correctPin){
                openUp();
            }
        }
    });
    $("#key3").swipe({
        tap:function(event,target){
            if(loginPin=="")
                startedTyping();
            $("#login-pin").attr("value",$("#login-pin").attr("value")+"3");
            loginPin += "3";
            if(loginPin==correctPin){
                openUp();
            }
        }
    });
    $("#key4").swipe({
        tap:function(event,target){
            if(loginPin=="")
                startedTyping();
            $("#login-pin").attr("value",$("#login-pin").attr("value")+"4");
            loginPin += "4";
            if(loginPin==correctPin){
                openUp();
            }
        }
    });
    $("#key5").swipe({
        tap:function(event,target){
            if(loginPin=="")
                startedTyping();
            $("#login-pin").attr("value",$("#login-pin").attr("value")+"5");
            loginPin += "5";
            if(loginPin==correctPin){
                openUp();
            }
        }
    });
    $("#key6").swipe({
        tap:function(event,target){
            if(loginPin=="")
                startedTyping();
            $("#login-pin").attr("value",$("#login-pin").attr("value")+"6");
            loginPin += "6";
            if(loginPin==correctPin){
                openUp();
            }
        }
    });
    $("#key7").swipe({
        tap:function(event,target){
            if(loginPin=="")
                startedTyping();
            $("#login-pin").attr("value",$("#login-pin").attr("value")+"7");
            loginPin += "7";
            if(loginPin==correctPin){
                openUp();
            }
        }
    });
    $("#key8").swipe({
        tap:function(event,target){
            if(loginPin=="")
                startedTyping();
            $("#login-pin").attr("value",$("#login-pin").attr("value")+"8");
            loginPin += "8";
            if(loginPin==correctPin){
                openUp();
            }
        }
    });
    $("#key9").swipe({
        tap:function(event,target){
            if(loginPin=="")
                startedTyping();
            $("#login-pin").attr("value",$("#login-pin").attr("value")+"9");
            loginPin += "9";
            if(loginPin==correctPin){
                openUp();
            }
        }
    });
    $("#key10").swipe({
        tap:function(event,target){
            $("#login-pin").attr("value",$("#login-pin").attr("value").substring(0,loginPin.length-1));
            loginPin = loginPin.substring(0,loginPin.length-1);
        }
    });
}
port.on('data' ,function (data) {
    var msg = data.toString();
    var t = _.toNumber(data);
    if(Number.isInteger(t)){
        t = t.toString();
        _.find(employees,(employee)=>{
            if(employee.id1 == t || employee.id2 == t){
                _id = mongoose.Types.ObjectId(employee._id);
                Employee.find({_id},(err,employee)=>{
                    if(err){
                        return console.log(err);
                    }
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
                    employee[0].markModified('live');
                    employee[0].save().then((docs)=>{
                    console.log('---');
                    console.log('month '+month);
                    console.log('day '+day);
                    console.log('hours '+hours);
                    console.log('minutes '+minutes);
                    console.log(employee[0].live[month][day-1][0]);
                    console.log(employee[0].live[month][day-1][1]);
                    console.log('Successfully updated.');
                    openUp2();
                    return true;  
                });
                });
            }
            return false;
        });
    }
});
$(document).ready(()=>{
    ipcRenderer.send('async',2);
});
inputPin();
openConn();