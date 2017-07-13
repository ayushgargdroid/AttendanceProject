const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const _ = require('lodash');
const mongoose = require('mongoose');

var {Mongoose,conn} = require(__dirname+'/public/db/mongoose.js');
var {Employee} = require(__dirname+'/public/db/employee.js');
var {EmployeeLocal} = require(__dirname+'/public/db/employee-local.js');
var employees = [];
var mainEvent;

mongoose.connection.on('disconnected',()=>{
    console.log('sojaosjd');
})

exports.getData = (callback)=>{
    employees = [];
    
    console.log('Is net connected: '+mongoose.connection._readyState);
    if(mongoose.connection._readyState==1){
        console.log('inn');
        var local = [];
        Employee.find({},(err,employees)=>{
            if(err){
                return console.log('Disconnected from online db: '+err);
            }
            employees.forEach((employee)=>{
                EmployeeLocal.find({email: employee.email},(err,localEmployees)=>{
                    if(err){
                        return console.log('Disconnected from local db: '+err);
                    }
                    console.log('Local Employees: '+localEmployees.length);
                    if(localEmployees.length==0){
                        var tEmployee = _.pick(employee,['name','email','assigned','mobile','designation','live','haveWorked','late','offs','shifts','verified','id1','id2']);
                        tEmployee._id = employee._id.toString();
                        console.log(typeof tEmployee._id);
                        console.log(tEmployee._id);
                        var localEmployee = new EmployeeLocal(tEmployee);
                        localEmployee.save().then(()=>{
                            console.log('Stored to local DB');
                            EmployeeLocal.find({} ,(err,emps)=>{
                                employees = [];
                                console.log('inn where 1');
                                if(err){
                                    return console.log(err);
                                }
                                _.forEach(emps,function(emp){
                                    var empData = _.pick(emp,['name','_id','id1','id2','verified']);
                                    empData._id = emp._id.toString();
                                    employees.push(empData);
                                });
                                console.log('Added employee');
                                if(!callback){
                                    
                                }
                                else{
                                    callback();
                                }
                            });
                        },(err)=>{
                            console.log(err);
                        });
                    }
                    else{
                        console.log('in else: '+employee.name);
                        var localEmployee = localEmployees[0];
                        var today = new Date();
                        if(employee.live[today.getMonth()][today.getDate()-2][1].length == localEmployee.live[today.getMonth()][today.getDate()-2][1].length && employee.live[today.getMonth()][today.getDate()-2][0].length == localEmployee.live[today.getMonth()][today.getDate()-2][0].length){
                            console.log('No diff');
                            return;
                        }
                        localEmployee.live = employee.live;
                        localEmployee.markModified('live');
                        localEmployee.save().then(()=>{
                            console.log('Stored to local DB live');
                            EmployeeLocal.find({} ,(err,emps)=>{
                                employees = [];
                                console.log('inn where');
                                if(err){
                                    return console.log(err);
                                }
                                _.forEach(emps,function(emp){
                                    var empData = _.pick(emp,['name','_id','id1','id2','verified']);
                                    empData._id = emp._id.toString();
                                    employees.push(empData);
                                });
                                console.log(employees);
                                if(!callback){
                                    
                                }
                                else{
                                    callback();
                                }
                            });
                        },(err)=>{
                            console.log(err);
                        });
                    }
                })
            })
        })
    }
    EmployeeLocal.find({} ,(err,emps)=>{
        if(err){
            return console.log(err);
        }
        _.forEach(emps,function(emp){
            var empData = _.pick(emp,['name','_id','id1','id2','verified']);
            empData._id = emp._id.toString();
            employees.push(empData);
        });
        if(!callback){
            
        }
        else{
            callback();
        }
    });
}

conn.on('connected',()=>{
    console.log('Connected');
    setTimeout(()=>{
        exports.getData(createWindow);
    },5000);
    // exports.getData(createWindow);
});

var sendData = () =>{
    mainEvent.sender.send('async-reply',employees);
};

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 800, height: 495, fullscreen: true})

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//setTimeout(()=>{
//    app.on('ready', createWindow);
//},2000);


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('async', (event, arg) => { 
    mainEvent = event; 
    console.log(arg);
    if(arg==1){
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }))
    }
    else if(arg==2){
        console.log('Sending employees');
        exports.getData(sendData);
    }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
});

exports.pong = () => {
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'admin.html'),
        protocol: 'file:',
        slashes: true
    }))
}