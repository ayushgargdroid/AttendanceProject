const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');

var app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

app.set('view engine','hbs');

app.use(express.static(__dirname + '/public'));

app.get('/', (req,res) => {
    res.render('index.hbs',{
        name:'Ayush Garg'
    });
});

app.listen(port, () => {
    console.log(`Server is up at ${port}`);
});