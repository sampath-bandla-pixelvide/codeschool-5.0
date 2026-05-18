$(document).ready(function () {
  let token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  function loadAdmin() {
    $.ajax({
      url: "api/get_user.php",
      method: "GET",
      headers: {
        Authorization: token,
      },
      dataType: "json",
      success: function (response) {
        if (!response.status) {
          localStorage.removeItem("token");
          window.location.href = "index.html";
          return;
        }

        let user = response.data;

        if (user.role !== "admin") {
          Swal.fire({
            icon: "error",
            title: "Access Denied",
            text: "Admins only",
          });

          localStorage.removeItem("token");

          setTimeout(() => {
            window.location.href = "index.html";
          }, 1500);

          return;
        }

        let fullName = user.first_name + " " + user.last_name;

        $("#adminName").text(fullName);
        $("#adminNameDropdown").text(fullName);
        $("#adminEmail").text(user.email);
        $("#adminRole").text(user.role);
        $("#adminAvatar").text(user.first_name.charAt(0).toUpperCase());
      },
    });
  }

  function loadResults() {
    $.ajax({
      url: "api/get_public_polls.php",
      method: "GET",
      dataType: "json",
      success: function (res) {
        $("#adminPollList").html("");

        if (!res.status) return;

        res.data.forEach((poll) => {
          let optionsHtml = "";

          poll.options.forEach((opt) => {
            optionsHtml += `
              <div class="mb-3">

                <div class="d-flex justify-content-between">
                  <strong>${opt.option_text}</strong>
                  <span>${opt.votes} votes (${opt.percentage}%)</span>
                </div>

                <div class="progress">
                  <div class="progress-bar bg-success"
                    style="width:${opt.percentage}%">
                  </div>
                </div>

              </div>
            `;
          });

          $("#adminPollList").append(`

            <div class="col-md-6 mb-4">

              <div class="card rounded-4">

                <div class="card-body">

                  <div class="d-flex justify-content-between">
                    <h5>${poll.question}</h5>
                    <span class="badge ${poll.poll_status === "open" ? "bg-success" : "bg-danger"}">
                      ${poll.poll_status}
                    </span>
                  </div>

                  <p class="text-muted mt-2">
                    Total Votes: ${poll.total_votes}
                  </p>

                  ${optionsHtml}

                </div>

              </div>

            </div>

          `);
        });
      },
    });
  }


  function logout() {
    $.ajax({
      url: "api/logout.php",
      method: "POST",
      headers: {
        Authorization: token,
      },
      success: function () {
        localStorage.removeItem("token");
        window.location.href = "index.html";
      },
    });
  }

  $("#logoutBtn").click(logout);
  $("#logoutDropdown").click(logout);


  loadAdmin();
  loadResults();

});
