function loadPage(page) {
  $("#app").load("public/" + page + ".html", function () {

    // load page-specific JS
    $.getScript("js/" + page + ".js");

  });
}

// default
$(document).ready(function () {
  let token = localStorage.getItem("token");

  if (token) {
    // loadPage("dashboard"); 
    window.location.href="public/dashboard.html"  
  } else {
    loadPage("login");       
  }
});