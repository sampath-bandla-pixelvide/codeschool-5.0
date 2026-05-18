let appointments = [];

const userToken = localStorage.getItem("token");

if (!userToken) {
  localStorage.removeItem("token");

  window.location.replace("./index.html");
}

function setHeader() {

    return {

        Authorization:
            "Bearer " +
            localStorage.getItem(
                "token"
            )

    };

}

function logout() {
  $.ajax({
    type: "GET",

    headers: setHeader(),

    url: "../api/logout.php",

    dataType: "json",

    success: function () {
      localStorage.removeItem("token");

      window.location.replace("./index.html");
    },

    error: function () {
      localStorage.removeItem("token");

      window.location.replace("./index.html");
    },
  });
}

function validateToken() {
  $.ajax({
    type: "GET",

    headers: setHeader(),

    url: "../api/validateToken.php",

    dataType: "json",

    success: function (response) {
      console.log(response);

      if (!response.status) {
        alert(response.message);

        logout();

        return;
      }

      const firstName = response.data.first_name;

      $("#userNameText").text(firstName);

      $("#userProfileCircle").text(firstName.charAt(0).toUpperCase());
    },

    error: function (err) {
      console.log(err.responseText);

      alert("Something went wrong!");
    },
  });
}

function scrollToBookingCard() {
  const bookingCard = document.getElementById("bookingCard");

  if (bookingCard) {
    bookingCard.scrollIntoView({
      behavior: "smooth",

      block: "start",
    });
  }
}

function updateQueueUI() {
  $.ajax({
    type: "GET",

    headers: setHeader(),

    url: "./api/getWaitingCount.php",

    dataType: "json",

    success: function (response) {
      console.log(response);

      if (!response.status) {
        return;
      }

      const waitingCount = response.data.waiting_count;

      $("#waitingCount").text(waitingCount);

      if (waitingCount > 0) {
        $("#queueMessage").text(`${waitingCount} people waiting in queue`);
      } else {
        $("#queueMessage").text("No one in queue");
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

      $("#currentTokenNumber").text(response.data.waiting);

      if (response.data.called > 0) {
        $("#servingText").text(
          `${response.data.called}   patient currently being served`,
        );
      } else {
        $("#servingText").text("Welcome! Please book your token below.");
      }
    },

    error: function (err) {
      console.log(err.responseText);
    },
  });
}

$(document).ready(function () {
  validateToken();

  updateQueueUI();

  getQueueStatus();

  setInterval(function () {
    getQueueStatus();
  }, 3000);

  $("#bookBtn").on("click", function () {
    scrollToBookingCard();
  });

  $("#heroBookBtn").on("click", function () {
    scrollToBookingCard();
  });

  $("#generateTokenBtn").on("click", function () {
    const fullName = $("#fullNameInput").val().trim();

    const mobile = $("#mobileInput").val().trim();

    const purpose = $("#purposeSelect").val();

    $.ajax({
      type: "POST",

      headers: setHeader(),

      url: "/api/validations/bookAppointment.php",

      dataType: "json",

      data: {
        full_name: fullName,

        mobile_number: mobile,

        purpose: purpose,
      },

      success: function (response) {
        console.log(response);

        if (!response.status) {
          alert(response.message);

          return;
        }

        alert(response.message);

        $("#currentTokenNumber").text(response.token_number);

        $("#servingText").text(`Your token number is ${response.token_number}`);

        getQueueStatus();

        $("#fullNameInput").val("");

        $("#mobileInput").val("");

        $("#purposeSelect").prop("selectedIndex", 0);
      },

      error: function (err) {
        console.log(err.responseText);
        alert("Something went wrong!");
      },
    });
  });
  $("#userProfileWrapper").on("click", function () {
    $("#profileSidebar").addClass("activeSidebar");

    $("#sidebarOverlay").addClass("activeOverlay");
  });

  $("#closeSidebarBtn, #sidebarOverlay").on("click", function () {
    $("#profileSidebar").removeClass("activeSidebar");

    $("#sidebarOverlay").removeClass("activeOverlay");
  });

  $("#logoutBtn").on("click", function () {
    localStorage.removeItem("token");

    window.location.href = "./index.html";
  });
  $("#saveProfileBtn").on("click", function () {
    $.ajax({
      type: "POST",

      headers: setHeader(),

      url: "./api/updateProfile.php",

      dataType: "json",

      data: {
        full_name: $("#editNameInput").val(),

        email: $("#editEmailInput").val(),

        phone_number: $("#editPhoneInput").val(),
      },

      success: function (response) {
        console.log(response);

        alert(response.message);

        if (response.status) {
          $("#profileSidebar").removeClass("activeSidebar");

          $("#sidebarOverlay").removeClass("activeOverlay");
        }
      },

      error: function (err) {
        console.log(err.responseText);
      },
    });
  });
});
