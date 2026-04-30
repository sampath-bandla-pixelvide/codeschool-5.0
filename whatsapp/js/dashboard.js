$(document).ready(function(){
    loadConversations();
    loadProfilePanel() 
})
$(document).ready(function () {
  let token = localStorage.getItem("token");

  if (!token) {
        window.location.href="/../index.html"  
  }
});
let searchTimer;

$("#chatSearch").on("input", function () {

  clearTimeout(searchTimer);

  let value = $(this).val().trim();

  searchTimer = setTimeout(() => {
    loadConversations(value); // pass search
  }, 300);

});

