const _ = require('lodash');
const nodemailer = require('nodemailer');
var {ipcRenderer,remote} = require('electron');
var main = remote.require(__dirname+'/index.js');
var SerialPort = require('serialport');

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
        pass: 'donotopen1511'
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
        port.close()
        ipcRenderer.send('async',1)
    },3000);
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
    },1500);
})
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
inputPin();
openConn();
port.on('data' ,function (data) {
    if(data.toString != '-'){
        openUp2();
    }
    port.close((err) => {
        if(err){
            return console.log(err);
        }
    })
});