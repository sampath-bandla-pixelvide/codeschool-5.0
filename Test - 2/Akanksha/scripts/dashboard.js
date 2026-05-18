$(document).ready(function () {
  let token = localStorage.getItem("token");

  if (!token) {
    return;
  }

  function loadUser() {
    $.ajax({
      url: "api/get_user.php",

      method: "GET",

      headers: {
        Authorization: token,
      },

      dataType: "json",

      success: function (response) {
        if (response.status) {
          let user = response.data;

          if (user.role !== "user") {
            Swal.fire({
              icon: "error",
              title: "Access Denied",
              text: "users only",
            });

            localStorage.removeItem("token");

            setTimeout(() => {
              window.location.href = "index.html";
            }, 1500);

            return;
          }

          let fullName = user.first_name + " " + user.last_name;

          $("#userName").text(fullName);

          $("#userNameDropdown").text(fullName);

          $("#userEmail").text(user.email);

          $("#userRole").text(user.role);

          $("#userAvatar").text(user.first_name.charAt(0).toUpperCase());
        } else {
          localStorage.removeItem("token");

          window.location.href = "index.html";
        }
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
            poll.status === "true" ? "badge-open" : "badge-closed";

          let optionsHtml = "";

          poll.options.forEach((opt) => {
            optionsHtml += `
    <div class="mb-2 option-box"
         data-option="${opt.id}"
         data-poll="${poll.id}"
         data-status="${poll.poll_status}">

      <div class="d-flex justify-content-between">
        <small>${opt.option_text}</small>
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
                    <span class="badge ${badgeClass} pt-2 pb-0">
  ${poll.poll_status ? "Opened" : "Closed"}
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

    console.log("clicked:", option_id, poll_id, status);

    if (status !== "open") {
      Swal.fire({
        icon: "error",
        title: "Poll Closed",
      });
      return;
    }

    $.ajax({
      url: "api/vote_poll.php",
      method: "POST",
      dataType: "json",
      data: {
        poll_id: poll_id,
        option_id: option_id,
      },
      success: function (res) {
        if (res.status) {
          Swal.fire({
            icon: "success",
            title: res.message,
          });

          loadPolls();
        } else {
          Swal.fire({
            icon: "error",
            title: res.message,
          });
        }
      },
    });
  });

  loadUser();
  loadPolls();

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

  $("#logoutDropdown").click(function () {
    logout();
  });
});
