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
        if (response.status) {
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
        } else {
          localStorage.removeItem("token");

          window.location.href = "index.html";
        }
      },
    });
  }

  $("#addOptionBtn").click(function () {
    let count = $(".option-field").length + 1;

    $("#optionsContainer").append(`

      <input
        type="text"
        class="form-control option-input option-field"
        placeholder="Option ${count}"
      />

    `);
  });

  $("#createPollForm").submit(function (e) {
    e.preventDefault();

    let question = $("#question").val().trim();

    let start_time = $("#start_time").val();

    let end_time = $("#end_time").val();

    let options = [];

    $(".option-field").each(function () {
      let value = $(this).val().trim();

      if (value !== "") {
        options.push(value);
      }
    });

    $("small").text("");

    if (question === "") {
      $("#questionErr").text("Question required");

      return;
    }

    if (start_time === "") {
      $("#startErr").text("Start time required");

      return;
    }

    if (end_time === "") {
      $("#endErr").text("End time required");

      return;
    }

    if (new Date(end_time) <= new Date(start_time)) {
      $("#endErr").text("End time must be greater");

      return;
    }

    if (options.length < 2) {
      Swal.fire({
        icon: "error",
        title: "Minimum 2 options required",
      });

      return;
    }

    $.ajax({
      url: "api/create_poll.php",

      method: "POST",

      headers: {
        Authorization: token,
      },

      dataType: "json",

      data: {
        question: question,
        start_time: start_time,
        end_time: end_time,
        options: options,
      },

      success: function (response) {
        if (response.status) {
          Swal.fire({
            icon: "success",
            title: response.message,
          });

          $("#createPollForm")[0].reset();

          loadPolls();
        } else {
          Swal.fire({
            icon: "error",
            title: response.message,
          });
        }
      },

      error: function (err) {
        console.log(err);
      },
    });
  });

  function loadPolls() {
    $.ajax({
      url: "api/get_polls.php",

      method: "GET",

      headers: {
        Authorization: token,
      },

      dataType: "json",

      success: function (response) {
        $("#pollList").html("");

        if (response.status) {
          let polls = response.data;

          polls.forEach(function (poll) {
            let badge = poll.status === "open" ? "badge-open" : "badge-closed";

            let card = `

              <div class="col-md-6">

                <div class="card poll-card">

                  <div class="card-body">

                    <div class="d-flex justify-content-between">

                      <h5>${poll.question}</h5>

                      <span class="badge ${badge} pt-2">
                        ${poll.status}
                      </span>

                    </div>

                    <p class="mt-2">
                      Start:
                      ${poll.start_time}
                    </p>

                    <p>
                      End:
                      ${poll.end_time}
                    </p>

                    <button
                      class="btn btn-danger btn-sm deletePollBtn"
                      data-id="${poll.id}"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            `;

            $("#pollList").append(card);
          });
        }
      },
    });
  }

  $(document).on("click", ".deletePollBtn", function () {
    let poll_id = $(this).data("id");

    Swal.fire({
      title: "Delete Poll?",

      icon: "warning",

      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: "api/delete_poll.php",

          method: "POST",

          headers: {
            Authorization: token,
          },

          dataType: "json",

          data: {
            poll_id: poll_id,
          },

          success: function (response) {
            if (response.status) {
              Swal.fire({
                icon: "success",
                title: response.message,
              });

              loadPolls();
            }
          },
        });
      }
    });
  });

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

  $("#logoutBtn").click(function () {
    logout();
  });

  $("#logoutDropdown").click(function () {
    logout();
  });


  loadAdmin();
  loadPolls();
});
