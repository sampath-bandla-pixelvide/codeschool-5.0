$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const campaignId = urlParams.get('id');
    
    if (!campaignId) {
        window.location.replace("home.html");
        return;
    }
    
    loadCampaignDetails(campaignId);
    
    $("#donationForm").on("submit", function(e) {
        e.preventDefault();
        
        const data = {
            campaign_id: $("#donateCampaignId").val(),
            donor_name: $("#donorName").val(),
            mobile: $("#donorMobile").val(),
            amount: $("#donationAmount").val(),
            payment_method: $("input[name='paymentMethod']:checked").val(),
            payment_id: $("#paymentId").val()
        };
        
        $("#donateSubmitBtn").prop("disabled", true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...');
        
        $.ajax({
            type: "POST",
            url: "./api/php-scripts/submitDonation.php",
            data: JSON.stringify(data),
            contentType: "application/json",
            dataType: "json",
            success: function(res) {
                if (res.status) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Thank You!',
                        text: res.message,
                        confirmButtonColor: '#198754'
                    }).then(() => {
                        $("#donationModal").modal('hide');
                        $("#donationForm")[0].reset();
                        loadCampaignDetails(campaignId);
                    });
                } else {
                    Swal.fire("Error", res.message, "error");
                }
            },
            error: function(err) {
                console.error(err);
                Swal.fire("Error", "Failed to process donation", "error");
            },
            complete: function() {
                $("#donateSubmitBtn").prop("disabled", false).html('<i class="bi bi-heart-fill me-2"></i>Donate Now');
            }
        });
    });
});

function loadCampaignDetails(id) {
    $.ajax({
        type: "GET",
        url: `./api/php-scripts/getCampaignDetails.php?id=${id}`,
        dataType: "json",
        success: function(res) {
            if (!res.status) {
                $("#campaignDetailsContainer").html(`<div class="alert alert-danger">${res.message}</div>`);
                return;
            }
            
            const campaign = res.data;
            let progress = 0;
            if (campaign.target_amount > 0) {
                progress = Math.min(100, Math.round((campaign.total_donations / campaign.target_amount) * 100));
            }
            
            let html = `
            <div class="row g-4">
                <div class="col-lg-8">
                    <div class="card border-0 shadow-sm rounded-3 h-100">
                        <div class="card-body p-5">
                            <h2 class="card-title fw-bold text-primary mb-3">${campaign.title}</h2>
                            <p class="text-muted mb-4"><i class="bi bi-calendar3 me-2"></i>Created on ${new Date(campaign.created_at).toLocaleDateString()}</p>
                            
                            <h5 class="fw-bold mb-3">About this campaign</h5>
                            <p class="card-text fs-5" style="white-space: pre-line;">${campaign.description}</p>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-4">
                    <div class="card border-0 shadow-sm rounded-3 mb-4">
                        <div class="card-body p-4">
                            <h3 class="fw-bold text-success mb-0">$${campaign.total_donations}</h3>
                            <p class="text-muted">raised of $${campaign.target_amount} target</p>
                            
                            <div class="progress mb-4" style="height: 15px; border-radius: 10px;">
                                <div class="progress-bar progress-bar-striped progress-bar-animated bg-success" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            
                            <button class="btn btn-success btn-lg w-100 fw-bold shadow" onclick="openDonateModal(${campaign.id})">
                                Donate Now
                            </button>
                        </div>
                    </div>
                    
                    <div class="card border-0 shadow-sm rounded-3">
                        <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
                            <h5 class="fw-bold"><i class="bi bi-list-stars me-2 text-warning"></i>Recent Donations</h5>
                        </div>
                        <div class="card-body p-0">
                            <ul class="list-group list-group-flush" style="max-height: 400px; overflow-y: auto;">
            `;
            
            if (campaign.donations && campaign.donations.length > 0) {
                campaign.donations.forEach(d => {
                    html += `
                                <li class="list-group-item p-3">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="d-flex align-items-center">
                                            <div class="bg-light rounded-circle p-2 me-3">
                                                <i class="bi bi-person text-secondary fs-5"></i>
                                            </div>
                                            <div>
                                                <h6 class="mb-0 fw-bold">${d.donor_name}</h6>
                                                <small class="text-muted">${timeAgo(new Date(d.donated_at))}</small>
                                            </div>
                                        </div>
                                        <span class="badge bg-success rounded-pill fs-6">$${d.amount}</span>
                                    </div>
                                </li>
                    `;
                });
            } else {
                html += `
                                <li class="list-group-item p-4 text-center text-muted">
                                    Be the first to donate!
                                </li>
                `;
            }
            
            html += `
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            `;
            
            $("#campaignDetailsContainer").html(html);
        },
        error: function(err) {
            console.error(err);
            $("#campaignDetailsContainer").html(`<div class="alert alert-danger">Failed to load campaign details.</div>`);
        }
    });
}

function openDonateModal(campaignId) {
    $("#donateCampaignId").val(campaignId);
    $("#donationForm")[0].reset();
    $("#donationModal").modal('show');
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return Math.floor(seconds) + " secs ago";
}
