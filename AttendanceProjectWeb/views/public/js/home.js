$(document).ready(function(){
    $(".button-collapse").sideNav();
    $.getJSON('/employees-list', function(data){
        $('input.autocomplete').autocomplete({
            data,
            limit: 40,
            onAutocomplete: function(val){
                console.log(val);
            },
            minLength: 1
        });
    });
})