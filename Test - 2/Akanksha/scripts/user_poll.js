$(document).ready(function () {
  let token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  function loadUser() {
    $.ajax({
      url: "api/get_user.php",
      method: "GET",
      headers: { Authorization: token },
      dataType: "json",
      success: function (response) {
        if (!response.status) {
          localStorage.removeItem("token");
          window.location.href = "index.html";
          return;
        }

        let user = response.data;

        if (user.role !== "user") {
          Swal.fire("Access Denied", "Users only", "error");
          localStorage.removeItem("token");
          window.location.href = "index.html";
          return;
        }

        $("#userName").text(user.first_name + " " + user.last_name);
        $("#userEmail").text(user.email);
        $("#userRole").text(user.role);
        $("#userAvatar").text(user.first_name.charAt(0).toUpperCase());
      },
    });
  }

  function loadPolls() {
    $.ajax({
      url: "api/get_public_polls.php",
      method: "GET",
      dataType: "json",
      success: function (res) {
        $("#pollList").html("");

        if (!res.status) return;

        let polls = res.data;

        let total = polls.length;
        let active = 0;
        let closed = 0;

        polls.forEach((poll) => {
          if (poll.poll_status === "open") active++;
          if (poll.poll_status === "closed") closed++;

          let badgeClass =
            poll.poll_status === "true" ? "badge-open" : "badge-closed";

          let optionsHtml = "";

          poll.options.forEach((opt) => {
            let isSelected = poll.user_selected_option == opt.id;

            optionsHtml += `
              <div class="option-box voteBtn ${isSelected ? "selected-option" : ""}"
                   data-option="${opt.id}"
                   data-poll="${poll.id}"
                   data-status="${poll.poll_status}">

                <div class="d-flex justify-content-between">
                  <small>
                    ${opt.option_text}
                    ${isSelected ? "✔ Your vote" : ""}
                  </small>
                  <small>${opt.percentage}%</small>
                </div>

                <div class="progress">
                  <div class="progress-bar"
                    style="width:${opt.percentage}%">
                  </div>
                </div>

              </div>
            `;
          });

          $("#pollList").append(`
            <div class="col-md-6 mb-4">
              <div class="card poll-card">
                <div class="card-body">

                  <div class="d-flex justify-content-between">
                    <h5>${poll.question}</h5>
                    <span class="badge ${badgeClass}">
                      ${poll.poll_status}
                    </span>
                  </div>

                  <p class="poll-time mt-2">
                    Total Votes: ${poll.total_votes}
                  </p>

                  ${optionsHtml}

                </div>
              </div>
            </div>
          `);
        });

        $("#totalPolls").text(total);
        $("#activePolls").text(active);
        $("#closedPolls").text(closed);
      },
    });
  }

  $(document).on("click", ".voteBtn", function () {
    let option_id = $(this).data("option");
    let poll_id = $(this).data("poll");
    let status = $(this).data("status");

    if (status !== "open") {
      Swal.fire("Poll Closed", "", "error");
      return;
    }

    $.ajax({
      url: "api/vote_poll.php",
      method: "POST",
      dataType: "json",
      data: {
        poll_id,
        option_id,
      },
      success: function (res) {
        if (res.status) {
          Swal.fire("Success", res.message, "success");
          loadPolls(); // refresh results
        } else {
          Swal.fire("Error", res.message, "error");
        }
      },
    });
  });

  function logout() {
    $.ajax({
      url: "api/logout.php",
      method: "POST",
      headers: { Authorization: token },
      success: function () {
        localStorage.removeItem("token");
        window.location.href = "index.html";
      },
    });
  }

  $("#logoutDropdown").click(logout);

  loadUser();
  loadPolls();
});
