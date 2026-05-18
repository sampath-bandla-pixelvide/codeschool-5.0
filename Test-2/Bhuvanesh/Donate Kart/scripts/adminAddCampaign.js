$(document).ready(function(){
      validateToken()
    const token = localStorage.getItem("token");
    console.log(token);
    if(!token){
        logout();
    }
    $(document).on("click", ".logoutBtn", function () {
        logout();
    });
})


function validateToken() {
  $.ajax({
    type: "GET",
    headers: setHeader(),
    url: "./api/php-scripts/adminToken.php",
    dataType: "json",
    success: function (res) {
      if (!res.status) {
        Swal.fire("Error", res.message, "warning").then(() => {
          logout();
          return;
        });
      }
      if(res.data.isAdmin){

      }
      else{
        logout();
      }
    },
    error: function (err) {
      console.error(err);
      logout();
    },
  });
}

function logout() {
  $.ajax({
    type: "GET",
    headers: setHeader(),
    url: "./api/php-scripts/logout.php",
    dataType: "json",
    success: function (res) {
      if (res) {
        localStorage.removeItem("token");
        window.location.replace("./index.html");
      }
    },
    error: function (err) {
      localStorage.removeItem("token");
      window.location.replace("./index.html");
    },
  });
}

function setHeader() {
  return { Authentication: localStorage.getItem("token") };
}

$(document).ready(function() {
    $("#addCampaignForm").on("submit", function(e) {
        e.preventDefault();
        
        const data = {
            title: $("#campaignTitle").val(),
            target_amount: $("#campaignTarget").val(),
            description: $("#campaignDescription").val()
        };
        
        $("#submitCampaignBtn").prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...');
        
        $.ajax({
            type: "POST",
            headers: setHeader(),
            url: "./api/php-scripts/addCampaign.php",
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "json",
            success: function(res) {
                if (res.status) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: res.message,
                    }).then(() => {
                        window.location.replace("adminDashboard.html");
                    });
                } else {
                    Swal.fire("Error", res.message, "error");
                    $("#submitCampaignBtn").prop("disabled", false).html('<i class="bi bi-plus-circle me-2"></i>Create Campaign');
                }
            },
            error: function(err) {
                console.error(err);
                Swal.fire("Error", "Failed to create campaign", "error");
                $("#submitCampaignBtn").prop("disabled", false).html('<i class="bi bi-plus-circle me-2"></i>Create Campaign');
            }
        });
    });
});
