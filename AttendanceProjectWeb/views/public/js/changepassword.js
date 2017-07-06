$(document).ready(function(){
    var p1,p2,old;
    $(".button-collapse").sideNav();
    $("#password1").keydown(function() {
        $.ajax({
            url: '/checkpass',
            method: 'post',
            data: {
                pass: $("#password").val()
            },
            statusCode: {
                200: () => {
                    $("#password").removeClass('invalid');
                    $("#password").addClass('valid');
                    old = true;
                },
                406: () => {
                    $("#password").removeClass('valid');
                    $("#password").addClass('invalid');
                    old = false;
                }
            }
        });
    })
    $("#password1").keyup(function() {
        p1 = $(this).val();
    });
    $("#password2").keyup(function() {
        p2 = $(this).val();
        if(p1!==p2){
            $("#password1").removeClass('valid');
            $("#password2").removeClass('valid');
            $("#password1").addClass('invalid');
            $("#password2").addClass('invalid');
        }
        else{
            $("#password1").removeClass('invalid');
            $("#password1").addClass('valid');
            $("#password2").removeClass('invalid');
            $("#password2").addClass('valid');
            if(old){
                $("#submit-button").removeClass('disabled');
            }
        }
    });
});