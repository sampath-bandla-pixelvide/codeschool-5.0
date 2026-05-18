$(document).ready(function () {
  let params = new URLSearchParams(window.location.search);
  let subjectId = params.get("subject_id");

  let user = JSON.parse(localStorage.getItem("user"));
  let questions = [];
  let currentIndex = 0;
  let attemptId = null;

  if (!subjectId) {
    Swal.fire("Error", "Subject not selected", "error");
    return;
  }

  $("#subjectIdText").text(subjectId);

  startAttempt();

  function startAttempt() {
    $.ajax({
      type: "POST",
      url: "api/start_attempt.php",
      data: {
        user_id: user.id,
        subject_id: subjectId,
      },
      dataType: "json",

      success: function (response) {
        if (response.status) {
          attemptId = response.data.attempt_id;
          loadQuestions();
        } else {
          Swal.fire("Error", response.message, "error");
        }
      },
    });
  }

  function loadQuestions() {
    $.ajax({
      type: "GET",
      url: "api/get_subject_questions.php",
      data: {
        subject_id: subjectId,
      },
      dataType: "json",

      success: function (response) {
        if (response.status) {
          questions = response.data;

          if (questions.length === 0) {
            $("#quizBox").html(`
              <p class="text-muted">No questions available for this subject.</p>
            `);
            return;
          }

          showQuestion();
        }
      },
    });
  }

  function showQuestion() {
    let q = questions[currentIndex];

    $("#quizBox").html(`
      <h5 class="fw-bold mb-3">
        Question ${currentIndex + 1} of ${questions.length}
      </h5>

      <h4 class="mb-4">${q.question}</h4>

      <div class="form-check mb-2">
        <input class="form-check-input" type="radio" name="answer" value="A" id="a">
        <label class="form-check-label" for="a">${q.option_a}</label>
      </div>

      <div class="form-check mb-2">
        <input class="form-check-input" type="radio" name="answer" value="B" id="b">
        <label class="form-check-label" for="b">${q.option_b}</label>
      </div>

      <div class="form-check mb-2">
        <input class="form-check-input" type="radio" name="answer" value="C" id="c">
        <label class="form-check-label" for="c">${q.option_c}</label>
      </div>

      <div class="form-check mb-4">
        <input class="form-check-input" type="radio" name="answer" value="D" id="d">
        <label class="form-check-label" for="d">${q.option_d}</label>
      </div>

      <button class="btn btn-primary" id="submitAnswerBtn">
        Submit Answer
      </button>
    `);
  }

  $(document).on("click", "#submitAnswerBtn", function () {
    let selectedAnswer = $("input[name='answer']:checked").val();

    if (!selectedAnswer) {
      Swal.fire("Warning", "Please select an answer", "warning");
      return;
    }

    if (!questions[currentIndex]) {
      Swal.fire("Error", "Question not found", "error");
      return;
    }

    let q = questions[currentIndex];

    $("#submitAnswerBtn").prop("disabled", true).text("Submitting...");

    $.ajax({
      type: "POST",
      url: "api/submit_answer.php",
      data: {
        attempt_id: attemptId,
        question_id: q.id,
        selected_answer: selectedAnswer,
      },
      dataType: "json",

      success: function (response) {
        if (response.status) {
          currentIndex++;

          if (currentIndex < questions.length) {
            showQuestion();
          } else {
            finishQuiz();
          }
        } else {
          Swal.fire("Error", response.message, "error");
          $("#submitAnswerBtn").prop("disabled", false).text("Submit Answer");
        }
      },

      error: function () {
        Swal.fire("Error", "Server error", "error");
        $("#submitAnswerBtn").prop("disabled", false).text("Submit Answer");
      },
    });
  });

  function finishQuiz() {
    $.ajax({
      type: "POST",
      url: "api/finish_quiz.php",
      data: {
        attempt_id: attemptId,
      },
      dataType: "json",

      success: function (response) {
        if (response.status) {
          Swal.fire("Completed", response.message, "success");

          setTimeout(() => {
            window.location.href = "result.html?attempt_id=" + attemptId;
          }, 1200);
        }
      },
    });
  }
});
