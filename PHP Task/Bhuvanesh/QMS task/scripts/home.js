$(document).ready(function () {
  let token = localStorage.getItem("token");
  let currentSubject = null;
  let currentQuizId = null;
  let quizDuration = 0;
  let timerInterval;
  let user = null;

  if (!token) {
    localStorage.removeItem("token");
    window.location.replace("./index.html");
  }

    $.ajax({
    url: "./api/php-scripts/authToken.php",
    type: "POST",
    headers: { Authorization: "Bearer " + token },
    dataType: "json",
    success: function (res) {
      if (res.status) {
        
      } else {
      localStorage.removeItem("token");
    window.location = "index.html";
      }
    },
    error: function(err){
       localStorage.removeItem("token");
    window.location = "index.html";
    }
  });


  $(".header").load("./header.html", function () {
    loadUser();
    loadSubjects();
    loadLastAttempt();
  });

  function loadSubjects() {
    $.ajax({
      type: "GET",
      url: "./api/php-scripts/userSubjects.php",
      dataType: "json",
      headers: { Authorization: "Bearer " + token },
      success: function (res) {
        if (res.status) {
          displaySubjects(res.data);
        }else{
           localStorage.removeItem("token");
        window.location.replace("./index.html");
        }
      },
      error: function (err) {
        Swal.fire("error", "token error", "error");
        localStorage.removeItem("token");
        window.location.replace("./index.html");
      },
    });
  }

  $(document).on("click", ".logoutBtn", function () {
    let token = localStorage.getItem("token");

    Swal.fire({
      title: "Logout?",
      text: "You will be signed out",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: "./api/php-scripts/logout.php",
          type: "POST",
          headers: {
            Authorization: "Bearer " + token,
          },
          dataType: "json",

          success: function (res) {
            if (res.status) {
              localStorage.removeItem("token");

              Swal.fire("Success", res.message, "success").then(() => {
                window.location.replace("./index.html");
              });
            } else {
              Swal.fire("Error", res.message, "error");
            }
          },

          error: function () {
            Swal.fire("Error", "Logout failed!", "error");
          },
        });
      }
    });
  });
  function loadUser() {
    $.ajax({
      type: "POST",
      url: "./api/php-scripts/user.php",
      dataType: "json",
      headers: { Authorization: "Bearer " + token },
      success: function (res) {
        if (res.status) {
          user = res.data;
          console.log(res.data);
        }
      },
      error: function () {
        localStorage.removeItem("token");
        window.location.replace("./index.html");
      },
    });
  }
  function displaySubjects(subjects) {
    let html = "";

    subjects.forEach((sub) => {
      html += `
        <li>
          <a class="dropdown-item" data-subject="${sub.id}" href="#">
            <i class="bi bi-book me-2"></i>${sub.name}
          </a>
        </li>`;
    });

    $(".dropdown-menu").html(html);
  }

  $(document).on("click", "#profileIcon", function (e) {
    e.stopPropagation();

    let card = $("#profileCard");

    if (card.length) {
      card.toggleClass("show");
      return;
    }

    if (!user) {
      console.log("User not loaded yet");
      return;
    }

    createProfileCard(user);
  });

  function createProfileCard(user) {
    $("#profileCard").remove();

    let html = `
    <div id="profileCard"
         class="card shadow position-absolute"
         style="top:60px; right:10px; width:220px; z-index:1050;">
      <div class="card-body p-3">

        <h6 class="fw-bold mb-2">
          <i class="bi bi-person-circle"></i> Profile
        </h6>

        <p class="mb-1 small text-muted">
          <i class="bi bi-person"></i> ${user.name}
        </p>

        <p class="mb-2 small text-muted">
          <i class="bi bi-envelope"></i> ${user.email}
        </p>

        <button class="btn btn-danger w-100 btn-sm logoutBtn">
          <i class="bi bi-box-arrow-right"></i> Logout
        </button>

      </div>
    </div>
  `;

    $("body").append(html);

    setTimeout(() => {
      $("#profileCard").addClass("show");
    }, 10);
  }

  $(document).on("click", function () {
    $("#profileCard").removeClass("show");
  });

  $(document).on("click", "#profileCard", function (e) {
    e.stopPropagation();
  });
  $(document).on("click", ".dropdown-item", function (e) {
    e.preventDefault();

    currentSubject = $(this).data("subject");

    $("#lastAttempt").empty();
    loadQuizzes(currentSubject);
  });

  function loadQuizzes(subjectId) {
    $.ajax({
      type: "POST",
      url: "./api/php-scripts/quizzes.php",
      dataType: "json",
      headers: { Authorization: "Bearer " + token },
      data: { subject: subjectId },
      success: function (res) {
        if (res.status) {
          displayQuizzes(res.data);
        } else {
          $(".mainContainer").html(
            `<div class="text-center p-3">${res.message}</div>`,
          );
        }
      },
      error: function () {
        Swal.fire("Error", "Server not responding. Try again later.", "error");
      },
    });
  }
  function displayQuizzes(quizzes) {
    let container = $(".mainContainer");
    container.empty();

    quizzes.forEach((q) => {
      container.append(`
        <div class="card shadow-sm p-3 mb-3 quiz-card" data-id="${q.id}">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h5 class="fw-bold">${q.title}</h5>
              <p class="mb-1"><i class="bi bi-clock"></i> ${q.duration_minutes} mins</p>
              <p class="mb-1"><i class="bi bi-award"></i> ${q.total_marks} marks</p>

            
              <div class="quiz-result mt-2"></div>
            </div>

            <button class="btn btn-primary startQuiz"
              data-id="${q.id}"
              data-duration="${q.duration_minutes}">
              <i class="bi bi-play-fill"></i> Start
            </button>
          </div>
        </div>
      `);
    });
  }

  $(document).on("click", ".startQuiz", function () {
    currentQuizId = $(this).data("id");
    quizDuration = parseInt($(this).data("duration")) * 60;

    let startedAt = new Date().toISOString();
    $("#quizModal").attr("data-started-at", startedAt);

    Swal.fire({
      title: "Start Quiz",
      text: "Duration: " + quizDuration / 60 + " mins",
      icon: "question",
      showCancelButton: true,
    }).then((res) => {
      if (res.isConfirmed) {
        loadQuizQuestions(currentQuizId);
        $("#quizModal")
          .modal({ backdrop: "static", keyboard: false })
          .modal("show");
        startTimer();
      }
    });
  });

  let quizData = [];
let currentIndex = 0;
let answers = {};

function loadQuizQuestions(id) {
  $.ajax({
    type: "POST",
    url: "./api/php-scripts/getQuizQuestions.php",
    dataType: "json",
    headers: { Authorization: "Bearer " + token },
    data: { quiz_id: id },
    success: function (res) {

      let grouped = {};

      res.data.forEach((row) => {
        if (!grouped[row.question_id]) {
          grouped[row.question_id] = {
            id: row.question_id,
            text: row.question_text,
            options: [],
          };
        }
        grouped[row.question_id].options.push(row);
      });

      quizData = Object.values(grouped);
      currentIndex = 0;
      answers = {};

      renderQuestion();
    },
    error: function () {
      Swal.fire("Error", "Server not responding. Try again later.", "error");
    },
  });
}

function renderQuestion() {
  let q = quizData[currentIndex];

  let html = `
    <div class="mb-3">
      <b>Q${currentIndex + 1}. ${q.text}</b>
    </div>
  `;

q.options.forEach((opt) => {
  html += `
    <div>
      <input type="radio" name="question${q.id}"
        value="${opt.option_id}"
        data-question="${q.id}">
      ${opt.option_text}
    </div>
  `;
});

  
 if (currentIndex !== quizData.length - 1) {
  html += `
    <button id="nextBtn" class="btn btn-primary mt-3">Next</button>
  `;
} else {
  html += `
    <button id="finishBtn" class="btn btn-success mt-3">Finish</button>
  `;
}


  $("#quizBody").html(html);
}

$(document).on("click", "#nextBtn", function () {
  let qid = quizData[currentIndex].id;
  let selected = $(`input[name='question${qid}']:checked`).val();

  if (!selected) {
    Swal.fire("Warning", "Please select an option!", "warning");
    return;
  }

  answers[qid] = selected;
  currentIndex++;

  if (currentIndex < quizData.length) {
    renderQuestion();
  } else {
    console.log("Final Answers:", answers);
    Swal.fire("Done", "Quiz submitted successfully!", "success");
  }
});
$(document).on("click", "#finishBtn", function () {
  let qid = quizData[currentIndex].id;
  let selected = $(`input[name='question${qid}']:checked`).val();

  if (!selected) {
    Swal.fire("Warning", "Please select an option!", "warning");
    return;
  }

  answers[qid] = selected;
  console.log("Final Answers:", answers);
  submitQuiz(); 
});



  function startTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      let m = Math.floor(quizDuration / 60);
      let s = quizDuration % 60;

      $("#timer").text(`${m}:${s < 10 ? "0" : ""}${s}`);

      if (quizDuration <= 0) {
        clearInterval(timerInterval);
        autoSubmitQuiz();
      } else quizDuration--;
    }, 1000);
  }


function submitQuiz() {
  
  let answersArray = Object.entries(answers).map(([qid, oid]) => ({
    question_id: parseInt(qid),
    option_id: parseInt(oid),
  }));

  if (!answersArray.length) {
    Swal.fire("Warning", "Answer at least one question", "warning");
    return;
  }

  let startedAt = $("#quizModal").attr("data-started-at");

  $.ajax({
    type: "POST",
    url: "./api/php-scripts/submitQuiz.php",
    contentType: "application/json",
    dataType: "json",
    headers: { Authorization: "Bearer " + token },
    data: JSON.stringify({
      quiz_id: currentQuizId,
      answers: answersArray,
      started_at: startedAt,
    }),
    success: function (res) {
      if (!res.status) {
        Swal.fire("Error", res.message, "error");
        return;
      }

      let data = res.data;
      Swal.fire("Success", "Quiz submitted", "success");
      $("#quizModal").modal("hide");

      let card = $(`.quiz-card[data-id="${data.quiz_id}"]`);
      card.find(".quiz-result").html(`
        <div class="alert alert-success p-2 mt-2">
          <div><b>Score:</b> ${data.obtained_marks}/${data.total_marks}</div>
          <div><b>Attempts:</b> ${data.attempts_count}</div>
        </div>
      `);

      card.find(".startQuiz")
        .removeClass("btn-primary")
        .addClass("btn-outline-primary")
        .html(`<i class="bi bi-arrow-repeat"></i> Re-attempt`);

      loadLastAttempt();
    },
    error: function (err) {
      console.log(err.responseText);
      Swal.fire("Error", "Submission failed", "error");
    },
  });
}



  function autoSubmitQuiz() {
    Swal.fire("Time Up", "Auto submitting...", "info");
    submitQuiz();
  }

  function loadLastAttempt() {
    if (currentSubject) return;

    $.ajax({
      type: "GET",
      url: "./api/php-scripts/lastAttempt.php",
      dataType: "json",
      headers: { Authorization: "Bearer " + token },
      success: function (res) {
        if (res.status && res.data) {
          $("#lastAttempt").html(`
            <div class="card p-3 shadow mb-3">
              <h5>${res.data.quiz_title}</h5>
              <p>Score: ${res.data.score}/${res.data.total_marks}</p>
              <button class="btn btn-outline-primary startQuiz"
                data-id="${res.data.quiz_id}"
                data-duration="${res.data.duration_minutes}">
                Re-attempt
              </button>
            </div>
          `);
        }
      },
      error: function () {
        Swal.fire("Error", "Server not responding. Try again later.", "error");
      },
    });
  }
});
