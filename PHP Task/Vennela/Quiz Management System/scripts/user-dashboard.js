let subjectsData = [];
let questions = [];
let currentIndex = 0;
let quizFinished = false;
let selectedOption = null;
let userAnswers = {};
let currentQuizId = null;
let timeLeft = 0;
let timerInterval;
$(document).ready(function () {
  // const role = localStorage.getItem("userRole");
  // if (role !== "user") {
  //   window.location.href = "dashboard.html";
  //   return;
  // }
  $("#userName").text(localStorage.getItem("userName") || "User");
  $("#sidebarContainer").load("dashboard.html .sidebar", function () {
    $("#logoutBtn").click(function () {
      localStorage.clear();
      window.location.href = "index.html";
    });
    $(".nav-link").removeClass("active");
    $('[data-page="dashboard"]').addClass("active");
  });

  $("#dashboardSection").removeClass("d-none");
  $("#quizMainSection").addClass("d-none");
  loadAttemptedQuizzes();
  loadSubjects();
});
$(document).on("click", ".nav-link", function () {
  const page = $(this).data("page");
  $(".nav-link").removeClass("active");
  $(this).addClass("active");
  if (page === "dashboard") {
    $("#dashboardSection").removeClass("d-none");
    $("#quizMainSection").addClass("d-none");
    loadAttemptedQuizzes();
  } else if (page === "quizzes") {
    $("#dashboardSection").addClass("d-none");
    $("#quizMainSection").removeClass("d-none");
  }
});

function loadSubjects() {
  $.ajax({
    url: "api/userSubjects.php",
    type: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    dataType: "json",
    success: function (data) {
      if (!Array.isArray(data)) {
        if (data.data && Array.isArray(data.data)) {
          data = data.data;
        } else {
          $("#subjectContainer").html(
            "<p class='text-danger'>Error loading subjects</p>",
          );
          return;
        }
      }
      subjectsData = data;
      let html = "";
      data.forEach((s) => {
        html += `
          <div class="col-md-4">
            <div class="subject-card p-3"
                 data-id="${s.subject_id}"
                 data-name="${s.subject}">
              <h5>${s.subject}</h5>
              <p>${(s.quizzes || []).length} Quizzes</p>
            </div>
          </div>
        `;
      });
      $("#subjectContainer").html(html);
    },
  });
}

$(document).on("click", ".subject-card", function () {
  const subjectId = $(this).data("id");
  const subjectName = $(this).data("name");
  $("#selectedSubjectTitle").text(subjectName + " Quizzes");
  $("#quizSection").removeClass("d-none");
  const subject = subjectsData.find((s) => s.subject_id == subjectId);
  let html = "";
  if (subject && subject.quizzes.length > 0) {
    subject.quizzes.forEach((q) => {
      html += `
  <div class="col-md-4">
    <div class="quiz-card p-3 h-100 d-flex flex-column">
      <h5>${q.title}</h5>
      <p>${q.marks} Questions</p>
      <div class="mt-auto d-flex justify-content-between align-items-center">
        <small>
          <i class="bi bi-clock"></i> 
          ${formatTime((q.question_count || q.marks) * 30)}
        </small>
         ${
           q.attempted
             ? `<button class="start-btn btn btn-secondary btn-sm" disabled>
               Completed
             </button>`
             : `<button class="start-btn btn btn-success btn-sm"
               data-id="${q.id}"
               data-title="${q.title}">
               Start
             </button>`
         }
      </div>
    </div>
  </div>
`;
    });
  } else {
    html = `<p>No quizzes available</p>`;
  }
  $("#quizContainer").html(html);
});

$(document).on("click", ".start-btn", function () {
  let quizId = $(this).data("id");
  let title = $(this).data("title");
  currentQuizId = quizId;
  userAnswers = {};
  quizFinished = false;
  questions = [];
  currentIndex = 0;
  $("#questionText").html("<span class='text-warning'>Loading...</span>");
  $("#optionsList").html("");
  $("#progressBar").css("width", "0%");
  $("#qNumber").text("0");
  $("#totalQ").text("0");
  $("#quizTitle").text(title);
  clearInterval(timerInterval);
  loadQuestions(quizId);
});
function loadQuestions(quizId) {
  $.ajax({
    url: "api/getQuestions.php",
    type: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: { quiz_id: quizId },
    success: function (data) {
      console.log("res:", data);
      if (!Array.isArray(data)) {
        //array of questions
        if (data.data && Array.isArray(data.data)) {
          data = data.data;
        } else {
          console.error("Invalid questions format", data);
          return;
        }
      }
      questions = data;
      currentIndex = 0;
      $("#totalQ").text(questions.length);
      timeLeft = questions.length * 30;
      startTimer();
      let modal = new bootstrap.Modal(document.getElementById("quizModal"));
      modal.show();
      showQuestion();
    },
  });
}

function showQuestion() {
  let q = questions[currentIndex];
  $("#qNumber").text(currentIndex + 1);
  $("#questionText").text(q.question_text);
  let html = "";
  q.options.forEach((opt, i) => {
    html += `
      <div class="option p-2 border mt-2" data-id="${opt.id}">
        ${String.fromCharCode(65 + i)}. ${opt.text}
      </div>
    `;
  });
  $("#optionsList").html(html);
  selectedOption = null;
  $("#submitAnswer").prop("disabled", true);
}

$(document).on("click", ".option", function () {
  $(".option").removeClass("active");
  $(this).addClass("active");

  selectedOption = $(this).data("id");
  $("#submitAnswer").prop("disabled", false);
});

$(document).on("click", "#submitAnswer", function () {
  if (!selectedOption) {
    alert("Please select an option");
    return;
  }
  let q = questions[currentIndex];
  userAnswers[q.question_id || q.id] = selectedOption;
  selectedOption = null;
  if (currentIndex === questions.length - 1) {
    console.log("Submitting quiz");
    finishQuiz();
  } else {
    currentIndex++;
    showQuestion();
  }
});

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    let min = Math.floor(timeLeft / 60);
    let sec = timeLeft % 60;
    $("#timer").text(
      `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`, //timeformat
    );
    timeLeft--;
    if (timeLeft < 0) {
      clearInterval(timerInterval);
      if (!quizFinished) {
        finishQuiz();
      }
    }
  }, 1000);
}
function finishQuiz() {
  if (quizFinished) return;
  quizFinished = true;
  $("#submitAnswer").prop("disabled", true);
  clearInterval(timerInterval);
  $.ajax({
    url: "api/submitQuiz.php",
    type: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    dataType: "json",
    data: {
      quiz_id: currentQuizId,
      answers: JSON.stringify(userAnswers),
    },
    success: function (res) {
      console.log("result:", res);
      if (!res.status) {
        alert(res.message || "Something went wrong");
        return;
      }
      showResult(res.score, res.total);
    },
  });
}

function showResult(score, total) {
  $("#finalScore").text(`${score}/${total}`);
  let detailsHtml = "";
  questions.forEach((q) => {
    let selected = userAnswers[q.question_id];
    let correctOption = q.options.find((o) => o.is_correct);
    if (!correctOption) return;
    if (selected == correctOption.id) {
      detailsHtml += `
        <div class="result-item text-success mb-2">
          <i class="bi bi-check2"></i> ${q.question_text}
        </div>
      `;
    } else {
      detailsHtml += `
        <div class="result-item text-danger mb-2">
          <i class="bi bi-x-lg"></i> ${q.question_text}
          <div class="small text-light">
            Correct: ${correctOption.text}
          </div>
        </div>
      `;
    }
  });
  $("#resultDetails").html(detailsHtml);
  let quizModal = bootstrap.Modal.getInstance(
    document.getElementById("quizModal"),
  );
  if (quizModal) quizModal.hide();
  let resultModal = new bootstrap.Modal(document.getElementById("resultModal"));
  resultModal.show();
}

function loadAttemptedQuizzes() {
  $.ajax({
    url: "api/attemptedQuizzes.php",
    type: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    dataType: "json",
    success: function (res) {
      console.log("result:", res);
      if (res.status === false) {
        console.error(res.message);
        return;
      }
      $("#quizCount").text(res.total || 0);
      $("#attemptedCount").text(res.completed || 0);
      $("#avgScore").text((res.avg || 0) + "%");

      let html = "";
      if (Array.isArray(res.attempts) && res.attempts.length > 0) {
        res.attempts.forEach((a) => {
          html += `
            <tr>
              <td>${a.title}</td>
              <td>${a.score}/${a.total}</td>
              <td>${a.subject || "-"}</td>
              <td>${new Date(a.created_at).toLocaleDateString()}</td>
            </tr>
          `;
        });
      } else {
        html = `
          <tr>
            <td colspan="4" class="text-center text-muted">
              No attempts yet
            </td>
          </tr>
        `;
      }
      $("#attemptedTable").html(html);
    },
    error: function (err) {
      console.log("Stats Error:", err.responseText);
    },
  });
}
