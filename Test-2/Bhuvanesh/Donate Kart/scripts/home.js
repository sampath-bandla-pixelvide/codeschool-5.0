$(document).ready(function(){
    const token = localStorage.getItem("token");
    if(token){
        validateToken();
    }
    
    $(document).on("click", ".logoutBtn", function () {
        logout();
    });
});

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
let user = {}
function validateToken() {
  $.ajax({
    type: "GET",
    headers: setHeader(),
    url: "./api/php-scripts/validateToken.php",
    dataType: "json",
    success: function (res) {
      if (!res.status) {
        Swal.fire("Error", res.message, "warning").then(() => {
          logout();
          return;
        });
      }
      if(res.data.isAdmin){
        window.location.replace("./adminDashboard.html")
      }
      console.log(res.data)
      user = res.data
      
    },
    error: function (err) {
      console.error(err);
      logout();
    },
  });
}

$(document).on("click", "#profileIcon", function (e) {
  console.log("clicked");
  e.stopPropagation();

  let card = $("#profileCard");

  if (card.length) {
    card.toggleClass("show");
    return;
  }
  if (!user || !user.first_name) {
    console.log("User not loaded yet");
    return;
  }
  profile(user)

});
function profile(user) {
  $("#profileCard").remove();
  let html = `
    <div id="profileCard"
         class="card shadow position-absolute end-0"
         style="width: 230px; z-index: 1000; margin-top:30px;">
      <div class="card-body p-3">
        <h6 class="card-title">Profile</h6>
        <p class="text-muted mb-0 small fs-6 italic">Name: ${user.first_name}</p>
        <p class="text-muted small mb-2 fs-6 italic">Email: ${user.email}</p>
        <button class="btn btn-danger logoutBtn w-100 btn-sm">
          Sign out <i class="bi bi-box-arrow-in-right"></i>
        </button>
      </div>
    </div>`;

  $("#profileWrapper").append(html);
  setTimeout(() => {
    $("#profileCard").addClass("show");
  }, 10);
}

$(document).click(function () {
  $("#profileCard").remove();
});
function campaignCards(){
    $.ajax({
    type: "GET",
    url: "./api/php-scripts/getCampaigns.php",
    dataType: "json",
    success: function (res) {
      if (!res.status) {
        $("#carsouselContainer").html(`<div class="alert alert-warning">${res.message}</div>`);
        return;
      }
      
      let html = '<div class="row g-4">';
      res.data.forEach(campaign => {
          let progress = 0;
          if(campaign.target_amount > 0) {
              progress = Math.min(100, Math.round((campaign.total_donations / campaign.target_amount) * 100));
          }
          html += `
          <div class="col-md-6 col-lg-4">
              <div class="card h-100 shadow-sm border-0">
                  <div class="card-body">
                      <h5 class="card-title text-primary">${campaign.title}</h5>
                      <p class="card-text text-muted small text-truncate">${campaign.description}</p>
                      
                      <div class="mt-3">
                          <div class="d-flex justify-content-between small mb-1">
                              <span>Raised: $${campaign.total_donations}</span>
                              <span>Target: $${campaign.target_amount}</span>
                          </div>
                          <div class="progress" style="height: 10px;">
                              <div class="progress-bar bg-success" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                          </div>
                      </div>
                  </div>
                  <div class="card-footer bg-white border-0 text-center pb-3">
                      <a href="campaignDetails.html?id=${campaign.id}" class="btn btn-outline-primary w-100">View Details & Donate</a>
                  </div>
              </div>
          </div>`;
      });
      html += '</div>';
      $("#carsouselContainer").html(html);
    },
    error: function (err) {
      console.error(err);
      $("#carsouselContainer").html(`<div class="alert alert-danger">Failed to load campaigns.</div>`);
    }
    });
}

$(document).ready(function() {
    campaignCards();
});





















function setHeader() {
  return { Authentication: localStorage.getItem("token") };
}