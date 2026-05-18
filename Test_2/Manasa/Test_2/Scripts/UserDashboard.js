let selectedItemId = null;
$(document).ready(function () {
  let user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "Login.html";
    return;
  }

  $("#welcomeUser").text("Welcome, " + user.name);

  let firstLetter = user.name.charAt(0).toUpperCase();
  $("#profileLetter").text(firstLetter);

  $("#logoutBtn").click(function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "Login.html";
  });

  $("#addItemBtn").click(function () {
    window.location.href = "AddItem.html";
  });

  $("#profileName").text(user.name);

  $("#viewProfile").click(function () {
    $("#name").val(user.name);
    $("#email").val(user.email);
    $("#phone").val(user.phone);

    let modal = new bootstrap.Modal(document.getElementById("profileModal"));
    modal.show();
  });

  $("#updateProfileBtn").click(function () {
    let user = JSON.parse(localStorage.getItem("user"));

    let updatedData = {
      id: user.id,
      name: $("#name").val(),
      phone: $("#phone").val(),
      currentPassword: $("#currentPassword").val(),
      newPassword: $("#newPassword").val(),
      confirmPassword: $("#confirmPassword").val(),
    };

    if (updatedData.name.length < 3) {
      alert("Name must be at least 3 characters");
      return;
    }

    if (updatedData.newPassword !== "") {
      if (updatedData.newPassword.length < 6) {
        alert("Password must be minimum 6 characters");
        return;
      }

      if (updatedData.newPassword !== updatedData.confirmPassword) {
        alert("Passwords do not match");
        return;
      }
    }

    $.ajax({
      url: "api/updateProfile.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(updatedData),

      success: function (res) {
        res = typeof res === "string" ? JSON.parse(res) : res;

        if (res.status === "success") {
          user.name = updatedData.name;
          user.phone = updatedData.phone;

          localStorage.setItem("user", JSON.stringify(user));

          $("#profileLetter").text(user.name.charAt(0).toUpperCase());
          $("#welcomeUser").text("Welcome, " + user.name);
          $("#profileName").text(user.name);

          alert(res.message);

          bootstrap.Modal.getInstance(
            document.getElementById("profileModal"),
          ).hide();
        } else {
          alert(res.message);
        }
      },
    });
  });

  function loadItems() {
    let user = JSON.parse(localStorage.getItem("user"));

    $.ajax({
      url: "api/getItems.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ role: user.role }),

      success: function (res) {
        res = typeof res === "string" ? JSON.parse(res) : res;

        if (res.status === "success") {
          displayItems(res.items);
        }
      },
    });
  }
  function displayItems(items) {
    let html = "";

    items.forEach((item) => {
      let image =
        item.images.length > 0
          ? item.images[0].image_path
          : "https://via.placeholder.com/300";

      html += `
<div class="col-md-4 mb-4">
  <div class="card shadow-sm h-100">

    <img src="${image}" class="card-img-top"
         style="height:200px;object-fit:cover;">

    <div class="card-body">

      <h5>${item.title}</h5>

      <p class="text-muted">${item.category}</p>

      <p><i class="bi bi-geo-alt"></i> ${item.location}</p>

      <span class="badge bg-${item.item_type === "lost" ? "danger" : "success"}">
        ${item.item_type.toUpperCase()}
      </span>

      ${
        !item.is_claimed
          ? `<button class="btn btn-primary mt-3 w-100"
             onclick="openClaimModal(${item.id})">
             Claim
           </button>`
          : `<button class="btn btn-secondary mt-3 w-100" disabled>
             Claimed
           </button>`
      }

    </div>
  </div>
</div>
`;
    });

    $("#itemsContainer").html(html);
  }
  loadItems();

  $("#submitClaimBtn").click(function () {
    let message = $("#claimReason").val().trim();

    if (message === "") {
      alert("Enter claim reason");
      return;
    }

    let user = JSON.parse(localStorage.getItem("user"));

    $.ajax({
      url: "api/submitClaim.php",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        item_id: selectedItemId,
        claimer_id: user.id,
        message: message,
      }),

      success: function (res) {
        res = typeof res === "string" ? JSON.parse(res) : res;

        if (res.status === "success") {
          alert(res.message);

          $("#claimReason").val("");

          bootstrap.Modal.getInstance(
            document.getElementById("claimModal"),
          ).hide();

          loadItems();
        } else {
          alert(res.message);
        }
      },
    });
  });

  $("#viewClaimsBtn").click(function () {

    let user = JSON.parse(localStorage.getItem("user"));

    $.ajax({
        url: "api/getMyClaims.php",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            owner_id: user.id
        }),

        success: function(res){

            res = typeof res === "string"
                ? JSON.parse(res)
                : res;

            let html = "";

            res.claims.forEach(claim => {

                html += `
                    <div class="border p-3 mb-3">
                        <h5>${claim.name}</h5>
                        <p>${claim.message}</p>
                        <p>Status: ${claim.status}</p>

                        ${
                          claim.status === "pending"
                          ? `
                          <button class="btn btn-success"
                             onclick="approveClaim(${claim.id})">
                             Approve
                          </button>

                          <button class="btn btn-danger"
                             onclick="rejectClaim(${claim.id})">
                             Reject
                          </button>
                          `
                          : ""
                        }
                    </div>
                `;
            });

            $("#claimsContainer").html(html);

            new bootstrap.Modal(
                document.getElementById("claimsModal")
            ).show();
        }
    });

});
function approveClaim(id){

    $.ajax({
        url:"api/updateClaimStatus.php",
        type:"POST",
        contentType:"application/json",
        data: JSON.stringify({
            claim_id:id,
            status:"approved"
        }),

        success:function(res){
            res = typeof res==="string"
                ? JSON.parse(res)
                : res;

            alert(res.message);
            location.reload();
        }
    });
}

function rejectClaim(id){

    $.ajax({
        url:"api/updateClaimStatus.php",
        type:"POST",
        contentType:"application/json",
        data: JSON.stringify({
            claim_id:id,
            status:"rejected"
        }),

        success:function(res){
            res = typeof res==="string"
                ? JSON.parse(res)
                : res;

            alert(res.message);
            location.reload();
        }
    });
}
});

function openClaimModal(id) {
  selectedItemId = id;

  let modal = new bootstrap.Modal(document.getElementById("claimModal"));

  modal.show();
}
