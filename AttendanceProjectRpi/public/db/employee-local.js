const {conn} = require('./mongoose.js');
const mongoose = require('mongoose');
const validator = require('validator');

var EmployeeSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.ObjectId,
        auto: false
    },
    name: {
        type: String,
        required: true,
        minlength: 3,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        minlength: 5,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not an email'
        }
    },
    mobile: {
        type: String,
        required: true,
        minlength: 10,
        trim: true,
    },
    designation: {
        type: String,
        required: true,
        minlength: 3,
        trim: true,
    },
    live: [],
    haveWorked: [],
    late: [],
    offs: [],
    assigned: {
        Monday:[],
        Tuesday:[],
        Wednesday:[],
        Thursday:[],
        Friday:[],
        Saturday:[],
        Sunday:[]
    },
    shifts: {
        type: Number,
        required: true
    },
    verified: {
        type: Boolean,
        required: true
    },
    id1: {
        type: String
    },
    id2: {
        type: String
    },
    doable: {
        type: Number
    }
},{
    _id:false
});

var checkLeap = (yr) => {
    if(yr % 400 === 0){
        return true;
    }
    else if(yr % 100 === 0){
        return false;
    }
    else if(yr % 4 === 0){
        return true;
    }
}

EmployeeSchema.methods.setupDB = function(){
    var employee = this;
    var today = new Date();
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var daysFeb = 28;
    if(today.getMonth()<=1){
        if(checkLeap(today.getFullYear())){
            daysFeb = 29;
        }
    }
    else{
        if(checkLeap(today.getFullYear() + 1)){
            daysFeb = 29;
        }
    }
    for(var i=0;i<12;i++){
        employee.offs.push([]);
        employee.late.push([]);
        employee.live.push([]);
        employee.haveWorked.push([]);
    }
    for(var i=0; i<12 ; i++){
        var nod = (i%2)?30:31;
        if(i===1){
            nod = daysFeb;
        }
        for(var j=0;j<nod;j++){
            employee.offs[i].push([]);
            employee.late[i].push([]);
            employee.haveWorked[i].push([]);
            employee.live[i].push([]);
            employee.live[i][j].push([]);
            employee.live[i][j].push([]);
        }
    }
//    employee.months[0].January.a.in.push('a');
    return employee.save();
}

var EmployeeLocal = conn.model('EmployeeLocal',EmployeeSchema);

module.exports = {EmployeeLocal};