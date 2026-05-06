$(document).ready(function () {
  window.goToSignup = function () {
    window.location.href = "signup.html";
  };

  $("#continueBtn").click(function () {
    let input = $("#loginInput");
    let label = $("#loginInput").next("label");
    let error = $("#loginError");

    let value = input.val().trim();

    input.removeClass("input-error");
    label.removeClass("label-error");
    error.text("");

    if (value === "") {
      error.text(
        "You'll need to enter a username,email or mobile number to continue.",
      );
      input.addClass("input-error");
      label.addClass("label-error");
      return;
    }
  });

  $("#loginInput").on("input", function () {
    $(this).removeClass("input-error");
    $("#loginInput").next("label").removeClass("label-error");
    $("#loginError").text("");
  });
});
