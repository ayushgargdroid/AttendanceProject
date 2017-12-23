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

exports.getData = (callback)=>{
    employees = [];
    console.log('Is net connected: '+mongoose.connection._readyState);
    if(mongoose.connection._readyState==1){
        var today = new Date();
        console.log('Net is connected');
        employees = [];
        Employee.find({},(err,employeesGlobal)=>{
            if(err){
                return console.log('Disconnected from online db: '+err);
            }
            employeesGlobal.forEach((employee)=>{
                EmployeeLocal.find({email: employee.email},(err,localEmployees)=>{
                    if(err){
                        return console.log('Disconnected from local db: '+err);
                    }
                    if(localEmployees.length==0){
                        var timestamp = employee._id.toString().substring(0,8);
                        date = new Date( parseInt( timestamp, 16 ) * 1000 );
                        if(date.getDate() == today.getDate()){
                            console.log('A new employee would be added to the local db');
                            var tEmployee = _.pick(employee,['name','email','assigned','mobile','designation','live','haveWorked','late','offs','shifts','verified','id1','id2']);
                            tEmployee._id = employee._id.toString();
                            var localEmployee = new EmployeeLocal(tEmployee);
                            localEmployee.save().then(()=>{
                                console.log('Stored to local DB '+employee.name);
                                var empData = _.pick(localEmployee,['name','_id','id1','id2','verified']);
                                empData._id = localEmployee._id.toString();
                                employees.push(empData);
                            },(err)=>{
                                console.log(err);
                            });
                        }
                        else{
                            console.log('An employee deleted from the local db is present in global db '+employee.name);
                        }
                    }
                    else{
                        console.log('Data for '+employee.name+' was found in local db');
                        var localEmployee = localEmployees[0];
                        if(employee.live[today.getMonth()][today.getDate()-2][1].length == localEmployee.live[today.getMonth()][today.getDate()-2][1].length && employee.live[today.getMonth()][today.getDate()-2][0].length == localEmployee.live[today.getMonth()][today.getDate()-2][0].length){
                            console.log('No diff');
                            var empData = _.pick(employee,['name','_id','id1','id2','verified']);
                            empData._id = employee._id.toString();
                            employees.push(empData);
                            return;
                        }
                        localEmployee.live = employee.live;
                        localEmployee.markModified('live');
                        localEmployee.save().then(()=>{
                            console.log('Stored to local DB live for '+localEmployee.name);
                            var empData = _.pick(localEmployee,['name','_id','id1','id2','verified']);
                            empData._id = localEmployee._id.toString();
                            employees.push(empData);
                        },(err)=>{
                            console.log(err);
                        });
                    }
                })
            })
        })
    }
    else{
        EmployeeLocal.find({} ,(err,emps)=>{
            if(err){
                return console.log(err);
            }
            console.log('Net was not connected so accessing local db');
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
}

var backup = (callback)=>{
    employees = [];
    EmployeeLocal.find({} ,(err,emps)=>{
        if(err){
            return console.log(err);
        }
        console.log('BACKUP Net was not connected so accessing local db');
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
    setTimeout(()=>{
        exports.getData();
    },5000);
    setTimeout(()=>{
        createWindow();
    },10000);
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
//   win.webContents.openDevTools()

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
    if(arg==1){
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }))
    }
    else if(arg==2){
        exports.getData();
        setTimeout(()=>{
            console.log(mongoose.connection._readyState);
            console.log('Sending employees');
            console.log(employees);
            if(employees.length == 0){
                backup(sendData);
            }
            else{
                event.sender.send('async-reply',employees);
            }
        },3000);
    }
    else if(arg==3){
        console.log('Recieved for add');
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'admin.html'),
            protocol: 'file:',
            slashes: true
        }))
    }
    else if(arg==4){
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'delete.html'),
            protocol: 'file:',
            slashes: true
        }))
    }
    else if(arg==5){
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'login.html'),
            protocol: 'file:',
            slashes: true
        }))
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