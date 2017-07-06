$(document).ready(function(){
    var a1;
    $(".button-collapse").sideNav();
    $("select").material_select();
    $.getJSON('/employees-list', function(data){
        $('input.autocomplete').autocomplete({
            data,
            limit: 40,
            onAutocomplete: function(val){
                console.log(val);
                a1 = true;
            },
            minLength: 1
        });
    });
    $("#shifts").change(function(){
        $("#funday").prop("disabled","true");
        var n = $("#shifts").val();
        var fin = ``;
        console.log(n);
        for(var i=1;i<=n;i++){
            var t = $("#slots").html();
            var str = `<li>
                                      <div class="collapsible-header"><i class="material-icons">view_day</i>Slot ${i}</div>
                                      <div class="collapsible-body">
                                          <span>
                                              <div class="row no-margin-bottom">
                                                  <div class="col s6">
                                                      Log In Time
                                                  </div>
                                                  <div class="col s6">
                                                      Log Out Time
                                                  </div>
                                              </div>
                                              <div class="row">
                                                  <div class="input-field col s3">
                                                      <select name="s${i}-hrs-s" id="s${i}-hrs-s">
                                                          <option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option>
                                                      </select>
                                                  </div>
                                                  <div class="input-field col s3">
                                                      <select name="s${i}-min-s" id="s${i}-min-s">
                                                          <option value="0">00</option><option value="15">15</option><option value="30">30</option><option value="45">45</option>
                                                      </select>
                                                  </div>
                                                  <div class="input-field col s3">
                                                      <select name="s${i}-hrs-e" id="s${i}-hrs-e">
                                                          <option value="6">06</option><option value="7">07</option><option value="8">08</option><option value="9">09</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option>
                                                      </select>
                                                  </div>
                                                  <div class="input-field col s3">
                                                      <select name="s${i}-min-e" id="s${i}-min-e">
                                                          <option value="0">00</option><option value="15">15</option><option value="30">30</option><option value="45">45</option>
                                                      </select>
                                                  </div>
                                              </div>
                                          </span>
                                      </div>
                                </li>`;
            $("#slots").html(t+str);
            console.log('done');
        }
        $("#slots").fadeIn("slow", () => {
            console.log('adsdbas');
        });
        $("select").material_select();
        console.log(a1);
        if(a1){
            $("#submit").removeClass('disabled');
        }
    });
    $("#funday").click(() => {
        if(a1){
            $("#submit").removeClass('disabled');
        }
    });
    
})