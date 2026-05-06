$(document).ready(function () {
  $(document).on("click", "#resultModal .btn", function () {
    this.blur();
  });
  loadDashboard();
  $(".nav-link").click(function () {
    $(".nav-link").removeClass("active");
    $(this).addClass("active");
    let page = $(this).data("page");
    if (page === "dashboard") {
      loadDashboard();
    } else {
      loadQuizzes();
    }
  });
});
function loadDashboard() {
  $(".content").html(`
    <h2 class="fw-bold">Welcome back</h2>
    <div class="row g-4 mt-3">
      <div class="col-md-4">
        <div class="card-custom">
          <h6>Subjects</h6>
          <h2 id="subjectCount">0</h2>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card-custom">
          <h6>Total Quizzes</h6>
          <h2 id="quizCount">0</h2>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card-custom">
          <h6>Total Users</h6>
          <h2 id="userCount">0</h2>
        </div>
      </div>
    </div>
    <div class="user-card mt-4">
     <h5 class="mb-3">Users</h5>

  <table class="table table-dark table-hover">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Quizzes Attempted</th>
      </tr>
    </thead>
    <tbody id="userTable"></tbody>
  </table>
    </div>
  `);
  loadUsers();
  $.ajax({
    url: "api/dashboard.php",
    type: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    dataType: "json",
    success: function (data) {
      if (data.error) {
        alert("Login required");
        window.location.href = "index.html";
        return;
      }
      $("#subjectCount").text(data.subjects);
      $("#quizCount").text(data.quizzes);
      $("#userCount").text(data.users);
      let html = "";
      data.userList.forEach((user) => {
        html += `
          <li class="list-group-item bg-dark text-white">
            <strong>${user.name}</strong><br>
            <small>${user.email}</small>
          </li>
        `;
      });
    },
  });
}
function loadUsers() {
  console.log("Loading users...");

  $.ajax({
    url: "api/users.php",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    type: "GET",

    success: function (data) {
      console.log("USERS API RESPONSE:", data);

      let html = "";

      data
        .filter((user) => user.role === "user")
        .forEach((user) => {
          html += `
            <tr>
              <td>${user.name}</td>
              <td>${user.email}</td>
              <td>${user.role}</td>
              <td>${user.quizzes_attempted}</td>
            </tr>
          `;
        });

      $("#userTable").html(html);
    },
  });
}

$(document).on("click", "#logoutBtn", function () {
  if (!confirm("Are you sure you want to logout?")) return;
  $.ajax({
    url: "api/logout.php",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    type: "POST",
    success: function (res) {
      console.log("LOGOUT:", res);
      localStorage.clear();
      window.location.href = "index.html";
    },
    error: function () {
      alert("Logout failed");
    },
  });
});
function loadQuizzes() {
  console.log("Loading quizzes...");
  $(".content").html(`
  <div class="d-flex justify-content-between align-items-center mb-3">
    <div>
      <h2 class="fw-bold">Quizzes</h2>
      <p class="text-light">Pick a subject and challenge yourself.</p>
    </div>
    <button class="btn add-subject-btn">
      <i class="bi bi-plus-lg"></i> Subject
    </button>
  </div>
  <div id="filters" class="mb-4"></div>
  <div id="quizContainer"></div>
`);
  $.ajax({
    url: "api/quizzes.php",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    type: "GET",
    success: function (data) {
      console.log("quiz:", data);
      if (data.error) {
        window.location.href = "index.html";
        return;
      }
      displayQuizzes(data, "admin");
    },
  });
}
$(document).on("click", ".add-subject-btn", function () {
  let modal = new bootstrap.Modal(document.getElementById("addSubjectModal"));
  modal.show();
});
$(document).on("click", "#saveSubject", function () {
  let name = $("#subjectName").val().trim();
  if (!name) {
    alert("Enter subject name");
    return;
  }
  $.ajax({
    url: "api/addSubject.php",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    type: "POST",
    dataType: "json",
    data: { name },
    success: function (res) {
      if (res.success) {
        // close modal
        bootstrap.Modal.getInstance(
          document.getElementById("addSubjectModal"),
        ).hide();
        $("#subjectName").val("");
        loadQuizzes();
      } else {
        alert(res.message);
      }
    },
    error: function (err) {
      console.log(err.responseText);
    },
  });
});
let questionCount = 0;
function addQuestionBlock() {
  questionCount++;
  let html = `
    <div class="question-block mt-4 p-3" data-index="${questionCount}">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="mb-0">Question ${questionCount}</h6>
        <button class="btn btn-sm text-danger remove-question">✖</button>
      </div>
      <input 
        class="form-control subject-input mb-2 question-text" 
        placeholder="Question text"
      >
      <div class="row">
        <div class="col-md-6 mb-2 d-flex align-items-center gap-2">
          <input type="radio" name="correct_${questionCount}" value="0">
          <input class="form-control subject-input option-text" placeholder="Option A">
        </div>
        <div class="col-md-6 mb-2 d-flex align-items-center gap-2">
          <input type="radio" name="correct_${questionCount}" value="1">
          <input class="form-control subject-input option-text" placeholder="Option B">
        </div>
        <div class="col-md-6 mb-2 d-flex align-items-center gap-2">
          <input type="radio" name="correct_${questionCount}" value="2">
          <input class="form-control subject-input option-text" placeholder="Option C">
        </div>
        <div class="col-md-6 mb-2 d-flex align-items-center gap-2">
          <input type="radio" name="correct_${questionCount}" value="3">
          <input class="form-control subject-input option-text" placeholder="Option D">
        </div>
      </div>
    </div>
  `;
  $("#questionsContainer").append(html);
}
$(document).on("click", ".add-question-btn", function () {
  addQuestionBlock();
});
$(document).on("click", "#saveQuiz", function () {
  let title = $("#quizTitleInput").val().trim();
  if (!title) {
    alert("Enter quiz title");
    return;
  }
  let questionsData = [];
  $(".question-block").each(function () {
    let qText = $(this).find(".question-text").val().trim();
    let options = [];
    $(this)
      .find(".option-text")
      .each(function () {
        options.push($(this).val().trim());
      });
    let correctIndex = $(this).find("input[type=radio]:checked").val();
    if (!qText || options.includes("") || correctIndex === undefined) {
      alert("Fill all question fields and select correct answer");
      return false;
    }
    if (correctIndex === undefined) {
      alert("Select correct answer");
      return false;
    }
    correctIndex = parseInt(correctIndex);
    questionsData.push({
      question_text: qText,
      options: options,
      correct: correctIndex,
    });
  });

  if (questionsData.length === 0) return;
 // console.log("final", questionsData);
  let editId = $("#saveQuiz").data("edit-id");
  let url = editId ? "api/updateQuiz.php" : "api/addQuizFull.php";
  $.ajax({
    url: url,
    type: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    dataType: "json",
    data: {
      quiz_id: editId,
      title: title,
      subject_id: selectedSubjectId,
      questions: JSON.stringify(questionsData),
    },
    success: function (res) {
      console.log("Quiz res:", res);
      if (res.success) {
        bootstrap.Modal.getInstance(
          document.getElementById("addQuizModal"),
        ).hide();
        loadQuizzes();
      } else {
        alert(res.message);
      }
    },
    error: function (err) {
      console.log(err.responseText);
    },
  });
});
let selectedSubjectId = null;
$(document).on("click", ".add-quiz-btn", function () {
  selectedSubjectId = $(this).data("id");
  let modal = new bootstrap.Modal(document.getElementById("addQuizModal"));
  modal.show();
  $("#quizTitleInput").val("");
  $("#questionsContainer").html("");
  questionCount = 0;
  addQuestionBlock();
  $("#saveQuiz").removeData("edit-id");
  $("#saveQuiz").text("Create Quiz");
});
$(document).on("click", ".remove-question", function () {
  $(this).closest(".question-block").remove();
  updateQuestionNumbers();
});
function updateQuestionNumbers() {
  let count = 1;
  $(".question-block").each(function () {
    $(this).attr("data-index", count);
    $(this)
      .find("h6")
      .text("Question " + count);
    $(this)
      .find("input[type=radio]")
      .attr("name", "correct_" + count);

    count++;
  });

questionCount = count - 1;
}
$(document).on("click", ".edit-btn", function () {
  let quizId = $(this).data("id");
  selectedSubjectId = $(this).data("subject");
  $.ajax({
    url: "api/getQuizDetails.php",
    type: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    dataType: "json",
    data: { quiz_id: quizId },
    success: function (res) {
      console.log("edit res:", res);
      if (!res || !res.questions) {
        alert("Invalid quiz data");
        return;
      }
      let modal = new bootstrap.Modal(document.getElementById("addQuizModal"));
      modal.show();
      $("#quizTitleInput").val(res.title);
      $("#questionsContainer").html("");
      questionCount = 0;
      res.questions.forEach((q) => {
        addQuestionBlock();
        let block = $(".question-block").last();
        block.find(".question-text").val(q.question_text);
        block.find(".option-text").each(function (i) {
          if (q.options && q.options[i]) {
            $(this).val(q.options[i].option_text);
          }
        });
        block.find(`input[value="${q.correct}"]`).prop("checked", true);
      });
      $("#saveQuiz").data("edit-id", quizId);
      $("#saveQuiz").text("Update Quiz");
    },
  });
});

$(document).on("click", ".delete-btn", function () {
  let quizId = $(this).data("id");
  if (!quizId) {
    alert("Invalid id");
    return;
  }
  if (!confirm("Delete this quiz?")) return;
  $.ajax({
    url: "api/deleteQuiz.php",
    type: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    dataType: "json",
    data: { quiz_id: quizId },
    success: function (res) {
      console.log(res);
      if (res.success) {
        alert("Deleted successfully");
        loadQuizzes();
      } else {
        alert(res.message || "Delete failed");
      }
    },
    error: function (err) {
      console.log(err.responseText);
      alert("Server error");
    },
  });
});
