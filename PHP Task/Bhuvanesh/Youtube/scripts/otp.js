$(document).ready(function(){

let temp_token = localStorage.getItem('temp_token');
let user = [];

$.ajax({
    type : 'POST',
    dataType : 'json',
    url : "./api/php-scripts/check-tempToken.php",
    data : {
        temp_token: temp_token
    },
    success:function(res){
        console.log(res);

        if(res.status){
            user = res.data;
            
        } else {
            
           Swal.fire("Error", res.message, "error").then(() => {
              window.location.href = "./index.html";
            });
       
        }
    },
    error:function(err){
        console.log(err.responseText);
    }
});


let time = 30;
let countdown;
function startTimer() {
  const timerEl = $("#timer");
  const resendBtn = $("#getOtp");
  clearInterval(countdown);
  time = 30;
  resendBtn.addClass("disabled");

  countdown = setInterval(() => {
    timerEl.text(`Resend available in ${time}s`);
    time--;

    if (time <= 0) {
      clearInterval(countdown);
      timerEl.text("");
      resendBtn.removeClass("disabled");
    }
  }, 1000);
}
startTimer();

function  getOtp(temp_token){
    $.ajax({
        type : 'POST',
    dataType : 'json',
    url : "./api/php-scripts/getOtp.php",
    data : {
        temp_token,
    },
    success:function(res){
        if(!res.status){
            Swal.fire("waring", res.message, "warning");
            if((res.message === 'DatabaseError! Try again Later'  || (res.message === 'Session Expired! Try again Later'))){
           Swal.fire("Error", res.message, "error").then(() => {
              window.location.href = "./index.html";
            });
          }
        }
        else{
            console.log(res.data.otp);
             
        }
    },
    error:function(err){
        console.log(err.responseText);
    }
    })
}
 $( "#getOtp").on("click", function (e) {
    e.preventDefault();
    if ($(this).hasClass("disabled")) {
      return;
    }
    startTimer();
    getOtp(temp_token)
  });

$("#verify").on("click",function(){
    let otp =$("#otp").val();
    if (!otp) {
        Swal.fire("Error", "Please enter OTP", "warning");
        return;
    }
    $.ajax({
         type : 'POST',
    dataType : 'json',
    url : "./api/php-scripts/otp.php",
    data : {
        otp
    },
    success:function(res){
        if(!res.status){
            Swal.fire("warning", res.message, "warning")
        }
        else{
            Swal.fire("verified", res.message, "success").then(() => {
                localStorage.removeItem("temp_token");
                localStorage.setItem('token',res.data);
              window.location.href = "./index.html";
            });
        }
    },error:function(err){
        console.log(err.responseText);
    }

    })
    
})
})