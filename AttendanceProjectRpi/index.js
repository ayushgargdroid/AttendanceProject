//const _ = require('lodash');
//const express = require('express');
//const bodyParser = require('body-parser');
//const hbs = require('hbs');
//
//var app = express();
//const port = process.env.PORT || 3000;
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({
//  extended: true
//})); 
//
//app.set('view engine','hbs');
//
//app.use(express.static(__dirname + '/public'));
//
//app.get('/', (req,res) => {
//    res.render('index.hbs',{
//        name:'Ayush Garg'
//    });
//});
//
//app.listen(port, () => {
//    console.log(`Server is up at ${port}`);
//});

const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const url = require('url')

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
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
});

exports.pong = () => {
    console.log('das');
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'admin.html'),
        protocol: 'file:',
        slashes: true
    }))
}