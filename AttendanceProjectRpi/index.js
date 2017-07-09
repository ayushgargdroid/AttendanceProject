const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const _ = require('lodash');

var {Mongoose} = require(__dirname+'/public/db/mongoose.js');
var {Employee} = require(__dirname+'/public/db/employee.js');
var employees = [];

exports.getData = (callback)=>{
    employees = [];
    Employee.find({} ,(err,emps)=>{
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
}
exports.getData(createWindow);
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
        event.sender.send('async-reply',employees);
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