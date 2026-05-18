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
          loadCampaigns();
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

function loadCampaigns() {
    $.ajax({
        type: "GET",
        headers: setHeader(),
        url: "./api/php-scripts/getAdminCampaigns.php",
        dataType: "json",
        success: function (res) {
            if (!res.status) {
                $("#adminContent").html(`<div class="alert alert-warning">${res.message}</div>`);
                return;
            }
            
            let html = `
            <div class="d-flex justify-content-between align-items-center mb-4 mt-4">
                <h2>Manage Campaigns</h2>
                <a href="adminaddCampaign.html" class="btn btn-primary"><i class="bi bi-plus-circle me-2"></i>Add Campaign</a>
            </div>
            <div class="table-responsive">
                <table class="table table-hover shadow-sm bg-white rounded">
                    <thead class="table-light">
                        <tr>
                            <th>Title</th>
                            <th>Target</th>
                            <th>Raised</th>
                            <th>Status</th>
                            <th>Created Date</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            if (res.data && res.data.length > 0) {
                res.data.forEach(campaign => {
                    let progress = 0;
                    if (campaign.target_amount > 0) {
                        progress = Math.round((campaign.total_donations / campaign.target_amount) * 100);
                    }
                    html += `
                        <tr>
                            <td class="fw-bold">${campaign.title}</td>
                            <td>$${campaign.target_amount}</td>
                            <td>
                                $${campaign.total_donations} 
                                <span class="badge ${progress >= 100 ? 'bg-success' : 'bg-primary'} ms-1">${progress}%</span>
                            </td>
                            <td><span class="badge bg-success">Active</span></td>
                            <td>${new Date(campaign.created_at).toLocaleDateString()}</td>
                        </tr>
                    `;
                });
            } else {
                html += `<tr><td colspan="5" class="text-center py-4">No campaigns found. Create one!</td></tr>`;
            }
            
            html += `
                    </tbody>
                </table>
            </div>`;
            
            if ($("#adminContent").length === 0) {
                $(".container-fluid").append('<div class="container" id="adminContent"></div>');
            }
            $("#adminContent").html(html);
        },
        error: function (err) {
            console.error(err);
            if ($("#adminContent").length === 0) {
                $(".container-fluid").append('<div class="container" id="adminContent"></div>');
            }
            $("#adminContent").html(`<div class="alert alert-danger">Failed to load campaigns.</div>`);
        }
    });
}
