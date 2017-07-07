const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const _ = require('lodash');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;

var {Mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Employee} = require('./models/employee');

hbs.registerPartials(__dirname + '/../views/partials');
var app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

app.set('view engine','hbs');

app.use(express.static(__dirname+'/../views/public'));

var getID = (token) => {
    var decoded = jwt.verify(token,'abc123');
    _id = decoded._id;
    _id = mongoose.Types.ObjectId(_id);
    return _id;
}

var authenticate = (req,res,next) => {
    if(_.isEmpty(req.cookies)){
        res.status(401).redirect('/signin');
    }
    else{
        var token = req.cookies.login;
        var _id = getID(token);
        User.find({_id}, (err,user) => {
            if(err){
                res.status(401).redirect('/');
            }
            next();
        });
    }
}

app.get('/signin',(req,res) => {
    res.render('index.hbs');
});

app.post('/signin',(req,res)=>{
    var loginAttempt = _.pick(req.body,['email','password']);
    User.find({email: loginAttempt.email}, (err, user) => {
        try{
            bcrypt.compare(loginAttempt.password, user[0].password, (errc, resq) => {
                if(resq == true){
                    user[0].generateAuthToken().then((token) => {
                        res.cookie('login', token).redirect('/');
                    });
                }
                else{
                    res.render('index.hbs',{
                        validatorpwd: 'invalid',
                        validatoremail: ''
                    });
                }
            });
        }
        catch(e){
            res.render('index.hbs',{
                validatorpwd: '',
                validatoremail: 'invalid'
            });
        }    
    });
});

app.post('/checkpass', authenticate, (req,res) => {
    token = req.cookies.login;
    password = req.body.pass;
    _id = getID(token);
    User.find({_id}, (err,user) => {
        if(err == undefined){
            bcrypt.compare(password,user[0].password, (err,resq) => {
                if(resq == true){
                    res.status(200).send();
                }
                else{
                    res.status(406).send();
                }
            });
        }
    }).catch((e) => {
                res.status(400).send();    
    });
});

app.get('/',authenticate,(req,res) => {
    res.render('home.hbs');
});

app.get('/current-status',authenticate,(req,res) => {
    res.render('current-status.hbs');
});

app.get('/employees-list',authenticate,(req,res) => {
    var data = {};
    var empName = [];
    Employee.find({},function(err,emps){
        emps.forEach(function(emp){
            var t = emp.name+' ('+emp.email+')';
            data[t] = '';
        });
        res.send(data);
    });
});

app.get('/signup',(req,res) => {
    res.render('signup.hbs');
});

app.post('/signup',(req,res) => {
    var newUser = _.pick(req.body,['email','password','designation']);
    
    bcrypt.genSalt(10, (err,salt) => {
        bcrypt.hash(newUser.password, salt, (err,hash) => {
            newUser.password = hash;
            var user = new User(newUser);
            user.save().then((user) => {
                res.status(200).render('signup-success',{
                        message: 'Admin has been added successfuly.'
                    });
            }).catch((e) => {
                if(e.errors){
                    res.status(400).render('signup-success',{
                        message: 'Invalid Email.'
                    });
                }
                if(JSON.stringify(e).includes('duplicate')){
                    res.status(400).render('signup-success',{
                        message: 'Email ID already exists.'
                    });
                }
                else{
                    res.status(400).send(e);
                }

            });
        })
    });
});

app.get('/update',authenticate, (req,res) => {
    res.render('update.hbs');
})

app.post('/update',authenticate, (req,res) => {
    var name = req.body.name;
    var days = req.body.days;
    var email = name.substring(name.indexOf('(') + 1,name.indexOf(')'));
    var updCome = {};
    var updGo = {};
    if(_.includes(days,'funday')){
        days.pop(_.indexOf(days,'funday'));
        for(var i=0;i<days.length;i++){
            updCome[days[i]] = [];
            updGo[days[i]] = [];
        }
    }
    else{
        for(var i=0;i<days.length;i++){
            updCome[days[i]] = [];
            updGo[days[i]] = [];
        }
        shifts = _.toNumber(req.body.shifts);
        for(var i=1;i<=shifts;i++){
            var s = req.body[`s${i}-hrs-s`]+':'+req.body[`s${i}-min-s`];
            var e = req.body[`s${i}-hrs-e`]+':'+req.body[`s${i}-min-e`];
            for(var j=0;j<days.length;j++){
                updCome[days[j]].push(s);
                updGo[days[j]].push(e);
            }
        }
        var t = updCome[days[0]];
        var k = updGo[days[0]];
        for(var i=0;i<shifts-1;i++){
            if(!(t[i+1].localeCompare(k[i])>0 && t[i].localeCompare(k[i])<0)){
                res.status(400).render('update-success.hbs',{
                    message: "Invalid input. Kindly try again."
                });
            }
        }
    }
    Employee.find({email},(err,users) => {
        try{
            user = users[0];
            for(var i=0;i<days.length;i++){
                var t = [];
                t.push(updCome[days[i]]);
                t.push(updGo[days[i]]);
                user.assigned[days[i]] = t;
            }
            user.save().then(() => {
                res.render('update-success.hbs',{
                    message: 'Employee Slots have been update successfuly. If something has been entered incorrectly, kindly refill the form at the earlist.'
                });
            })
        }
        catch(e){
            res.status(400).render('update-success.hbs',{
                message: "Something went wrong. Please try again!"
            });
        }
    })
})

app.get('/new-employee',authenticate,(req,res) => {
    res.render('new-employee.hbs');
})

app.post('/new-employee',authenticate,(req,res) => {
    var newEmp = _.pick(req.body,['name','mobile','designation','shifts','verified','email']);
    newEmp.shifts = _.toNumber(newEmp.shifts);
    newEmp.verified = false;
    
    var employee = new Employee(newEmp);
    employee.save().then((employee) => {
        return employee.setupDB();
    }).then((tes) => {
        res.render('new-employee-success.hbs', {
            message: 'Employee has been added. Kindly proceed to the Fingerprint Scanner and Update Info for staff'
        });
    }).catch((e) => {
        if(e.errors){
            res.status(400).render('new-employee-success.hbs', {
                message: 'Wrong Email ID'
            });
        }
        if(JSON.stringify(e).includes('duplicate')){
            res.status(400).render('new-employee-success.hbs', {
                message: 'Employee already exists!'
            });
        }
        else{
            res.status(400).render('new-employee-success.hbs', {
                message: 'Could not add the Employee. Please try again!'
            });
        }
    });
});

app.get('/test2',authenticate,(req,res) => {
    console.log(req.cookies);
});

app.get('/changepassword',authenticate,(req,res) => {
    res.render('changepassword');
});

app.post('/changepassword',authenticate,(req,res) => {
    var token = req.cookies.login;
    var password = req.body.new;
    var _id = getID(token);
    bcrypt.genSalt(10, (err,salt) => {
        bcrypt.hash(password, salt, (err,hash) => {
            password = hash;
            User.find({_id}, (err,user) => {
                if(err == undefined){
                    user[0].password = password;
                    user[0].save().then((user) => {
                        res.redirect('/');
                    }).catch((e) => {
                        res.status(400).send();
                    });
                }
            });
        })
    });
});

app.get('/apply', (req,res) => {
    res.render('apply.hbs');
});

app.get('/signout',authenticate,(req,res) => {
    var token = req.cookies.login
    var _id = getID(token);
    User.find({_id}, (err,user) => {
        if(err == undefined){
            user[0].removeToken(token).then(() => {
                res.clearCookie('login');
                res.status(200).redirect('/');
            }).catch((e) => {
                res.status(400).send();    
            });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is up at ${port}`);
});