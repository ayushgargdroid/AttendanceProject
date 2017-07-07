const _ = require('lodash');

$(document).on('change','#sel1',(e) => {
    var t = $('#sel1').val();
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
