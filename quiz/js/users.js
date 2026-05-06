let currentTime=null
//  users 
$(document).on("click", ".start-quiz", function () {

  const quizId = $(this).data("id");
  const title = $(this).data("title");
  
  // store globally 
  currentQuizId = quizId;
  currentQuizTitle = title;
  currentTime = $(this).data("duration");

  loadView("quiz-screen");

});
function loadAttemptList(params = {}) {

  $.ajax({
    url: "/api/attempts/getQuizzes.php",
    method: "GET",
    data:params,
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    success: function (res) {

      if (!res.status) {
        $("#quizList").html(`<div class="text-danger">Failed to load</div>`);
        return;
      }

      const cards = res.data.map(q => `
        <div class="col-md-4 mb-3">
          <div class="card shadow-sm h-100">

            <div class="card-body">
              <h5 class="fw-bold">${q.title}</h5>
              <p class="text-muted small">${q.subject_name}</p>

              <div class="small mb-2" id="quizTime">
                ⏱ ${q.duration_minutes}  ${Number(q.duration_minutes) === 1 ? 'minute' : 'minutes'}
              </div>

              ${
                q.attempted
                ? `<button class="btn btn-secondary w-100" disabled>
                    
                Already Attempted
                   </button>`
                : `<button class="btn btn-primary w-100 start-quiz"
                     data-id="${q.id}"
                     data-title="${q.title}"
                     data-duration="${q.duration_minutes}">
                     Start Quiz
                   </button>`
              }
            </div>

          </div>
        </div>
      `).join("");

      $("#quizList").html(cards || `
        <div class="text-muted text-center">No quizzes available</div>
      `);

    }
  });

}

let quizQuestions = [];
let userAnswers = {};
let quizTimer = null;
let timeLeft = 0;

function loadQuizScreen() {
  
  userAnswers = {};
  currentQuestionIndex = 0;
  clearInterval(quizTimer);

  $("#quizTitle").text(currentQuizTitle);

  $.ajax({
    url: "/api/questions/getQuestions.php",
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: { quiz_id: currentQuizId },
    success: function (res) {

      if (!res.status) return;

      quizQuestions = res.data;

      // renderQuiz();
      renderSingleQuestion();
      startTimer(currentTime*60); 
    }
  });

}
function renderSingleQuestion() {

  const q = quizQuestions[currentQuestionIndex];

  const options = q.options.map((opt, index) => {

    const checked = userAnswers[q.id] == opt.id ? "checked" : "";

    return `
      <div class="form-check">
        <input class="form-check-input answer-option"
          type="radio"
          name="q_${q.id}"
          value="${opt.id}"
          data-qid="${q.id}"
          ${checked}>
        <label class="form-check-label">
          ${opt.option_text}
        </label>
      </div>
    `;
  }).join("");

  const html = `
    <div class="card shadow-sm">
      <div class="card-body">

        <div class="fw-bold mb-2">
          Question ${currentQuestionIndex + 1} of ${quizQuestions.length}
        </div>

        <div class="mb-3">
          ${q.question_text}
        </div>

        ${options}

        <div class="d-flex justify-content-between mt-4">

          <button class="btn btn-primary" id="prevBtn"
            ${currentQuestionIndex === 0 ? "disabled" : ""}>
            Previous
          </button>

          ${
            currentQuestionIndex === quizQuestions.length - 1
            ? `<button class="btn btn-success" id="submitQuizBtn">Submit</button>`
            : `<button class="btn btn-primary" id="nextBtn">Next</button>`
          }

        </div>

      </div>
    </div>
  `;

  $("#quizContainer").html(html);
}

// function renderQuiz() {
//   const html = quizQuestions.map((q, i) => {
//     const options = q.options.map((opt, index) => `
//       <div class="form-check">
//         <input class="form-check-input answer-option"
//           type="radio"
//           name="q_${q.id}"
//           value="${opt.id}"
//           data-qid="${q.id}">
//         <label class="form-check-label">
//           ${opt.option_text}
//         </label>
//       </div>
//     `).join("");

//     return `
//       <div class="card mb-3 shadow-sm">
//         <div class="card-body">
//           <div class="fw-bold mb-2">
//             Q${i + 1}. ${q.question_text}
//           </div>
//           ${options}
//         </div>
//       </div>
//     `;

//   }).join("");

//   $("#quizContainer").html(html);
// }
$(document).on("click", "#nextBtn", function () {

  if (currentQuestionIndex < quizQuestions.length - 1) {
    currentQuestionIndex++;
    renderSingleQuestion();
  }

});
$(document).on("click", "#prevBtn", function () {

  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderSingleQuestion();
  }

});

$(document).on("change", ".answer-option", function () {

  const qid = $(this).data("qid");
  const optionId = $(this).val();
  userAnswers[qid] = optionId;

});

function startTimer(seconds) {

  timeLeft = seconds;

  quizTimer = setInterval(function () {

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    $("#timer").text(
      `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    );

    if (timeLeft <= 0) {
      clearInterval(quizTimer);
      submitQuiz();
    }

    timeLeft--;

  }, 1000);

}

$(document).on("click", "#backBtn", function () {
  clearInterval(quizTimer);
  loadView("attempt-list");
});

$(document).on("click", "#submitQuizBtn", function () {
  submitQuiz();
});

function submitQuiz() {

  clearInterval(quizTimer);

  // if (Object.keys(userAnswers).length === 0) {
  //   alert("Please answer at least one question");
  //   return;
  // }

//   $("#submitQuizBtn").prop("disabled", true);

  $.ajax({
    url: "/api/attempts/submitAttempt.php",
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: {
      quiz_id: currentQuizId,
      answers: JSON.stringify(userAnswers)
    },
    success: function (res) {

      if (!res.status) {
        alert(res.message || "Submission failed");
        return;
      }

      $("#mainContent").html(`
        <div class="text-center py-5">
          <h3 class="text-success">Quiz Completed 🎉</h3>
          <p>Your Score: ${res.data.score} / ${res.data.total}</p>
          <button class="btn btn-primary mt-3" onclick="loadView('user-home')">
            Go to Dashboard
          </button>
        </div>
      `);

    },
    error: function () {
      alert("Server error");
    }
  });

}