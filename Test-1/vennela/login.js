$(document).ready(function(){

$("#loginForm").submit(function(e){

e.preventDefault();

let username=$("#username").val().trim();
let password=$("#password").val().trim();

$("#userError").text("");
$("#passError").text("");

if(username===""){
$("#userError").text("Enter username");
return;
}
if(password===""){
$("#passError").text("Enter password");
return;
}
$.ajax({
url:"https://dummyjson.com/auth/login",
type:"POST",
data:JSON.stringify({
username:username,
password:password
}),
contentType:"application/json",
success:function(response){
console.log(response);
if(response.accessToken){
localStorage.setItem("user",JSON.stringify(response));
window.location.href="home.html";
}
else{
$("#passError").text("Login failed");

}

},

error:function(xhr){
$("#passError").text("Invalid username or password");

}
});

});

});