const adminToken = localStorage.getItem("token");

if (!adminToken) {
  window.location.replace("./index.html");
}

let currentPage = 1;

const limit = 5;

function setHeader() {
  return {
    Authentication: localStorage.getItem("token"),
  };
}

function validateAdminToken() {
  $.ajax({
    type: "GET",
    headers: setHeader(),
    url: "./api/validateToken.php",
    dataType: "json",

    success: function (response) {
      console.log(response);

      if (!response.status) {
        localStorage.removeItem("token");
        window.location.replace("./index.html");
        return;
      }

      const firstName = response.data.first_name;

      $("#adminNameText").text(firstName);

      $("#adminProfileCircle").text(firstName.charAt(0).toUpperCase());
    },

    error: function (err) {
      console.log(err.responseText);
    },
  });
}

function getStatusButton(status) {
  if (status === "Waiting") {
    return `
            <button class="waitingBtn">
                Waiting
            </button>
        `;
  }

  if (status === "Called") {
    return `
            <button class="calledBtn">
                Called
            </button>
        `;
  }

  if (status === "Completed") {
    return `
            <button class="doneBtn">
                Completed
            </button>
        `;
  }

  return `
        <button class="cancelBtn">
            Cancelled
        </button>
    `;
}

function getAppointments(page = 1) {
  $.ajax({
    type: "GET",

    headers: setHeader(),

    url: "./api/getAppointments.php",

    dataType: "json",

    data: {
      page: page,
    },

    success: function (response) {
      console.log(response);

      if (!response.status) {
        return;
      }

      $("#tokenList").html("");

      response.data.forEach(function (appointment, index) {
        $("#tokenList").append(`
                    <div class="tokenCard">

                        <div class="tokenLeft">

                            <div class="tokenNumber">
                                ${(currentPage - 1) * limit + index + 1}
                            </div>

                            <div class="tokenDetails">

                                <div class="tokenName">
                                    ${appointment.full_name}
                                </div>

                            </div>

                        </div>

                        <div class="tokenActions">

                            ${getStatusButton(appointment.status)}

                        </div>

                    </div>
                `);
      });

      const totalPages = Math.ceil(response.total_count / limit);

      $("#currentPageText").text(`Page ${currentPage}`);

      if (currentPage <= 1) {
        $("#prevPageBtn").prop("disabled", true);
      } else {
        $("#prevPageBtn").prop("disabled", false);
      }

      if (currentPage >= totalPages) {
        $("#nextPageBtn").prop("disabled", true);
      } else {
        $("#nextPageBtn").prop("disabled", false);
      }
    },

    error: function (err) {
      console.log(err.responseText);
    },
  });
}

function getQueueStatus() {
  $.ajax({
    type: "GET",

    headers: setHeader(),

    url: "./api/getQueueStatus.php",

    dataType: "json",

    success: function (response) {
      console.log(response);

      if (!response.status) {
        return;
      }

      $("#waitingCount").text(response.data.waiting);

      $("#calledCount").text(response.data.called);

      $("#completedCount").text(response.data.completed);

      $("#cancelledCount").text(response.data.cancelled);

      $("#queueMessage").text(
        `${response.data.waiting} people waiting in queue`,
      );
    },

    error: function (err) {
      console.log(err.responseText);
    },
  });
}

function loadBookings() {
  $.ajax({
    type: "GET",

    headers: setHeader(),

    url: "./api/getWaitingAppointments.php",

    dataType: "json",

    success: function (response) {
      $("#bookingsList").html("");

      response.data.forEach(function (appointment, index) {
        $("#bookingsList").append(`
                    <div class="tokenCard mb-3">

                        <div class="tokenLeft">

                            <div class="tokenNumber">
                                ${index + 1}
                            </div>

                            <div class="tokenDetails">

                                <div class="tokenName">
                                    ${appointment.full_name}
                                </div>

                                <div class="tokenInfo">
                                    ${appointment.purpose}
                                </div>

                            </div>

                        </div>

                        <div class="tokenActions">

                            ${getStatusButton(appointment.status)}

                            ${
                              appointment.status === "Waiting"
                                ? `
                                        <button
                                            class="cancelAppointmentBtn cancelBtn"
                                            data-id="${appointment.id}"
                                        >
                                            Cancel
                                        </button>
                                      `
                                : ``
                            }

                        </div>

                    </div>
                `);
      });
    },

    error: function (err) {
      console.log(err.responseText);
    },
  });
}

$(document).ready(function () {
  validateAdminToken();

  getAppointments();

  getQueueStatus();

  $("#nextPageBtn").on("click", function () {
    currentPage++;

    getAppointments(currentPage);
  });

  $("#prevPageBtn").on("click", function () {
    if (currentPage > 1) {
      currentPage--;

      getAppointments(currentPage);
    }
  });

  $("#bookingBtn").on("click", function () {
    $("#dashboardSection").hide();

    $("#queueSection").hide();

    $("#bookingsSection").show();

    $("#dashboardBtn").removeClass("activeNavBtn");

    $("#bookingBtn").addClass("activeNavBtn");

    loadBookings();
  });

  $("#dashboardBtn").on("click", function () {
    $("#dashboardSection").show();

    $("#queueSection").show();

    $("#bookingsSection").hide();

    $("#bookingBtn").removeClass("activeNavBtn");

    $("#dashboardBtn").addClass("activeNavBtn");
  });

  $("#callNextBtn").on("click", function () {
    $.ajax({
      type: "POST",

      headers: setHeader(),

      url: "./api/callNextAppointment.php",

      dataType: "json",

      success: function () {
        loadBookings();

        getQueueStatus();
      },
    });
  });

  $(document).on("click", ".cancelAppointmentBtn", function () {
    const appointmentId = $(this).data("id");

    $.ajax({
      type: "POST",

      headers: setHeader(),

      url: "./api/updateAppointmentStatus.php",

      dataType: "json",

      data: {
        appointment_id: appointmentId,
        status: "Cancelled",
      },

      success: function (response) {
        console.log(response);

        loadBookings();

        getQueueStatus();

        getAppointments(currentPage);
      },

      error: function (err) {
        console.log(err.responseText);
      },
    });
  });
});
