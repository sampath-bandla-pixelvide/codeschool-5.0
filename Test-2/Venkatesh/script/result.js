$(document).ready(function () {
  let params = new URLSearchParams(window.location.search);
  let attemptId = params.get("attempt_id");

  if (!attemptId) {
    Swal.fire("Error", "Attempt id missing", "error");
    return;
  }

  $.ajax({
    type: "GET",
    url: "api/get_result.php",
    data: {
      attempt_id: attemptId,
    },
    dataType: "json",

    success: function (response) {
      if (response.status) {
        let attempt = response.data.attempt;
        let wrongAnswers = response.data.wrong_answers;

        $("#scoreText").text(attempt.score + " / " + attempt.total_questions);

        $("#timeTakenText").text(
          "Time Taken: " + attempt.time_taken_seconds + " seconds",
        );

        if (wrongAnswers.length === 0) {
          $("#wrongAnswersBox").html(`
            <div class="alert alert-success mb-0">
              Excellent! No wrong answers.
            </div>
          `);
        } else {
          let html = "";

          $.each(wrongAnswers, function (index, item) {
            html += `
              <div class="border rounded-4 p-3 mb-3">
                <h6 class="fw-bold">
                  ${index + 1}. ${item.question}
                </h6>

                <p class="mb-1 text-danger">
                  Your Answer: ${item.selected_answer}
                </p>

                <p class="mb-0 text-success">
                  Correct Answer: ${item.correct_answer}
                </p>
              </div>
            `;
          });

          $("#wrongAnswersBox").html(html);
        }
      } else {
        Swal.fire("Error", response.message, "error");
      }
    },

    error: function () {
      Swal.fire("Error", "Server error", "error");
    },
  });
});
