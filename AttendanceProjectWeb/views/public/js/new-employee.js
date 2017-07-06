$(document).ready(function(){
    var a1,a2,a3;
    $(".button-collapse").sideNav();
    $("select").material_select();
    $("#name").keydown(function(){
        if($(this).val().length >= 4){
            a1 = true;
        }
    });
    $("#designation").keydown(function(){
        if($(this).val().length >= 4){
            a2 = true;
        }
    });
    $("#shifts").change(function(){
        if(a1 == true && a2 == true){
            $("#submit").removeClass('disabled');
        }
    })
});