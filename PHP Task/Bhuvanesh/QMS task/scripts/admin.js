$(document).ready(function () {
  let token = localStorage.getItem("token");
  let currentQuizId = null;

  $.ajax({
    url: "./api/php-scripts/authToken.php",
    type: "POST",
    headers: { Authorization: "Bearer " + token },
    dataType: "json",
    success: function (res) {
      if (res.status) {
        loadDashboard();
      } else {
        redirectLogin();
      }
    },
    error: redirectLogin,
  });

  function redirectLogin() {
    localStorage.removeItem("token");
    window.location = "index.html";
  }

  $(document).on("click", ".nav-link", function (e) {
    e.preventDefault();
    $(".nav-link").removeClass("active");
    $(this).addClass("active");

    let section = $(this).data("section");
    if (section === "dashboard") loadDashboard();
    if (section === "subjects") loadSubjects();
    if (section === "quizzes") loadQuizzes();
    if (section === "results") loadResults();
  });

  $(document).on("click", "#logoutBtn", function () {
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

  function loadDashboard() {
    $.ajax({
      type: "POST",
      url: "./api/php-scripts/adminDashboard.php",
      headers: { Authorization: "Bearer " + token },
      dataType: "json",
      success: function (res) {
        if (res.status) {
          let d = res.data;
          let html = `
  <h4 class="mb-3 fw-bold">Dashboard</h4>

  <div class="row g-3">

    <div class="col-md-3">
      <div class="card shadow-sm border-0 rounded-4 p-3 text-center">
        <h6 class="text-muted">Users</h6>
        <h3>${d.users-1}</h3>
      </div>
    </div>

    <div class="col-md-3">
      <div class="card shadow-sm border-0 rounded-4 p-3 text-center">
        <h6 class="text-muted">Subjects</h6>
        <h3>${d.subjects}</h3>
      </div>
    </div>

    <div class="col-md-3">
      <div class="card shadow-sm border-0 rounded-4 p-3 text-center">
        <h6 class="text-muted">Quizzes</h6>
        <h3>${d.quizzes}</h3>
      </div>
    </div>

    <div class="col-md-3">
      <div class="card shadow-sm border-0 rounded-4 p-3 text-center">
        <h6 class="text-muted">Questions</h6>
        <h3>${d.questions}</h3>
      </div>
    </div>

  </div>
`;

          $("#sectionContent").html(html);
        }
      },
      error: function () {
        Swal.fire("Error", "Server not responding. Try again later.", "error");
      },
    });
  }

  function loadSubjects() {
    $.ajax({
      url: "./api/php-scripts/adminSubjects.php",
      type: "GET",
      headers: { Authorization: "Bearer " + token },
      dataType: "json",
      success: function (res) {
        if (res.status) {
          let html = `
                        <h4>Subjects</h4>
                        <div class="input-group mb-3">
                            <input id="subjectName" class="form-control" placeholder="New subject">
                            <button id="addSubject" class="btn btn-primary">Add</button>
                        </div>
                        <ul class="list-group">
                    `;
          res.data.forEach((s) => {
            html += `
                            <li class="list-group-item d-flex justify-content-between">
                                ${s.name}
                                <div>
                                    <button class="btn btn-info btn-sm viewQuizzes" data-name="${s.name}">Quizzes</button>
                                    <button class="btn btn-warning btn-sm editSubject" data-id="${s.id}" data-name="${s.name}">Edit</button>
                                    <button class="btn btn-danger btn-sm deleteSubject" data-id="${s.id}">Delete</button>
                                </div>
                            </li>
                        `;
          });
          html += "</ul>";
          $("#sectionContent").html(html);
        }
      },
      error: function () {
        Swal.fire("Error", "Server not responding. Try again later.", "error");
      },
    });
  }

  $(document).on("click", "#addSubject", function () {
    $.ajax({
      url: "./api/php-scripts/adminSubjects.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      dataType: "json",
      data: { name: $("#subjectName").val() },
      success: function (res) {
        console.log(res.message);
        if (res.status) {
          loadSubjects();
        }
        Swal.fire("Success", res.message, "sucesss");
      },
      error: function (err) {
        Swal.fire("oops..", "something went wrong!", "error");
      },
    });
  });

  $(document).on("click", ".editSubject", function () {
    currentEntity = "subject";
    currentId = $(this).data("id");

    $("#crudTitle").text("Edit Subject");
    $("#crudForm").html(`
    <div class="mb-3">
      <label class="form-label">Subject Name</label>
      <input id="subjectNameEdit" class="form-control" value="${$(this).data("name")}">
    </div>
  `);

    $("#crudModal").modal("show");

    $(document)
      .off("click", "#saveBtn")
      .on("click", "#saveBtn", function () {
        $.ajax({
          url: "./api/php-scripts/adminSubjects.php",
          type: "POST",
          headers: { Authorization: "Bearer " + token },
          dataType: "json",
          data: {
            update: currentId,
            name: $("#subjectNameEdit").val(),
          },
          success: function (res) {
            if (res.status) {
              $("#crudModal").modal("hide");
              loadSubjects();
              Swal.fire("Success", res.message, "success");
            } else {
              Swal.fire("Error", res.message, "error");
            }
          },
          error: function () {
            Swal.fire(
              "Error",
              "Server not responding. Try again later.",
              "error",
            );
          },
        });
      });
  });

  $(document).on("click", ".deleteSubject", function () {
    $.ajax({
      url: "./api/php-scripts/adminSubjects.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      dataType: "json",
      data: { delete: $(this).data("id") },
      success: function (res) {
        console.log(res.message);
        if (res.status) {
          loadSubjects();
        }
        Swal.fire("oops..", res.message, "warning");
      },
      error: function (err) {
        Swal.fire("oops..", "something went wrong!", "error");
      },
    });
  });

  function loadQuizzes(subjectName = "") {
    let html = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-bold mb-0">
        ${subjectName ? "Quizzes - " + subjectName : "All Quizzes"}
      </h4>
    </div>


    <div class="card shadow-sm border-0 mb-3">
      <div class="card-body">

        <div class="row g-2 align-items-end">

          <div class="col-md-4">
            <label class="form-label">Subject</label>
            <select id="subjectSelect" class="form-select">
              <option value="">Select Subject</option>
            </select>
          </div>

          <div class="col-md-3">
            <label class="form-label">Title</label>
            <input id="quizTitle" class="form-control" placeholder="Quiz title">
          </div>

          <div class="col-md-2">
            <label class="form-label">Duration</label>
            <input id="quizDuration" type="number" class="form-control" placeholder="mins">
          </div>

          <div class="col-md-2">
            <label class="form-label">Marks</label>
            <input id="quizMarks" type="number" class="form-control" placeholder="marks">
          </div>

          <div class="col-md-1 d-grid">
            <button id="addQuiz" class="btn btn-primary">
              Add
            </button>
          </div>

        </div>

      </div>
    </div>

    <div id="quizContainer"></div>
  `;

    $("#sectionContent").html(html);

    $.ajax({
      url: "./api/php-scripts/adminSubjects.php",
      type: "GET",
      headers: { Authorization: "Bearer " + token },
      dataType: "json",
      success: function (res) {
        if (res.status) {
          res.data.forEach((s) => {
            $("#subjectSelect").append(
              `<option value="${s.name}" ${s.name === subjectName ? "selected" : ""}>
            ${s.name}
          </option>`,
            );
          });
        }
      },
      error: function () {
        Swal.fire("Error", "Server not responding. Try again later.", "error");
      },
    });

    $.ajax({
      url: "./api/php-scripts/adminQuizzes.php",
      type: "GET",
      headers: { Authorization: "Bearer " + token },
      dataType: "json",
      data: { subject: subjectName },
      success: function (res) {
        if (!res.status) return;

        let quizHtml = "";

        res.data.forEach((q) => {
          quizHtml += `
          <div class="card shadow-sm border-0 mb-3">

            <div class="card-body">

              <div class="d-flex justify-content-between align-items-start" >

                <div>
                  <h5 class="mb-1">${q.title}</h5>
                  <small class="text-muted">
                    ${q.subject_name} • ${q.duration_minutes} mins • ${q.total_marks} marks
                  </small>
                </div>

              </div>

              <div class="mt-3 d-flex gap-2 flex-wrap">

                <button class="btn btn-sm btn-outline-primary manageQuestions"
                  data-id="${q.id}" data-subject="${q.subject_name}" data-title="${q.title}">
                  Questions
                </button>

                <button class="btn btn-sm btn-outline-warning editQuiz"
                  data-id="${q.id}"
                  data-title="${q.title}"
                  data-duration="${q.duration_minutes}"
                  data-marks="${q.total_marks}"
                  data-subject="${q.subject_name}">
                  Edit
                </button>

                <button class="btn btn-sm btn-outline-danger deleteQuiz"
                  data-id="${q.id}">
                  Delete
                </button>

              </div>

            </div>

          </div>
        `;
        });

        $("#quizContainer").html(quizHtml);
      },
      error: function () {
        Swal.fire("Error", "Server not responding. Try again later.", "error");
      },
    });
  }
  $(document).on("change", "#subjectSelect", function () {
    loadQuizzes($(this).val());
  });

  $(document).on("click", "#addQuiz", function () {
    $.ajax({
      url: "./api/php-scripts/adminQuizzes.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      dataType: "json",
      data: {
        title: $("#quizTitle").val(),
        duration: $("#quizDuration").val(),
        marks: $("#quizMarks").val(),
        subject: $("#subjectSelect").val(),
      },
      success: function (res) {
        if (res.status) {
          loadQuizzes($("#subjectSelect").val());
        } else {
          Swal.fire("Error", res.message, "error");
        }
      },
      error: function (err) {
        Swal.fire("Error", "SomeThing went Wrong", "error");
      },
    });
  });
  $(document).on("click", ".editQuiz", function () {
    currentEntity = "quiz";
    currentId = $(this).data("id");
    subject = $(this).data('subject');

    $("#crudTitle").text(`Edit Quiz- ${subject}`);
    $("#crudTitle").addClass("text-black")
    $("#crudForm").html(`
    <div class="mb-3">
      <label class="form-label">Title</label>
      <input id="quizTitleEdit" class="form-control" value="${$(this).data("title")}">
    </div>
    <div class="mb-3">
      <label class="form-label">Duration (mins)</label>
      <input id="quizDurationEdit" type="number" class="form-control" value="${$(this).data("duration")}">
    </div>
    <div class="mb-3">
      <label class="form-label">Marks</label>
      <input id="quizMarksEdit" type="number" class="form-control" value="${$(this).data("marks")}">
    </div>
  `);

    $("#crudModal").modal("show");

    $(document)
      .off("click", "#saveBtn")
      .on("click", "#saveBtn", function () {
        $.ajax({
          url: "./api/php-scripts/adminQuizzes.php",
          type: "POST",
          headers: { Authorization: "Bearer " + token },
          dataType: "json",
          data: {
            update: currentId,
            title: $("#quizTitleEdit").val(),
            duration: $("#quizDurationEdit").val(),
            marks: $("#quizMarksEdit").val(),
          },
          success: function (res) {
            if (res.status) {
              $("#crudModal").modal("hide");
              loadQuizzes($("#subjectSelect").val());
              Swal.fire("Success", res.message, "success");
            } else {
              Swal.fire("Error", res.message, "error");
            }
          },
          error: function () {
            Swal.fire("Error", "Something went wrong", "error");
          },
        });
      });
  });

  $(document).on("click", ".deleteQuiz", function () {
    $.ajax({
      url: "./api/php-scripts/adminQuizzes.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      dataType: "json",
      data: { delete: $(this).data("id") },
      success: function (res) {
        if (res.status) {
          loadQuizzes($("#subjectSelect").val());
        } else {
          Swal.fire("Error", res.message, "error");
        }
      },
      error: function (err) {
        Swal.fire("Error", "SomeThing went Wrong", "error");
      },
    });
  });

  $(document).on("click", ".manageQuestions", function () {
    currentQuizId = $(this).data("id");
    subject   = $(this).data("subject");
    quizTitle = $(this).data("title");
    loadQuestions(currentQuizId,subject,quizTitle);
  });

  function loadQuestions(quizId ,subject,quizTitle) {
     subject   = subject;
    quizTitle = quizTitle;
    $.ajax({
      url: "./api/php-scripts/adminQuestions.php",
      type: "GET",
      headers: { Authorization: "Bearer " + token },
      dataType: "json",
      data: { quiz_id: quizId },

      success: function (res) {
        if (!res.status) {
          Swal.fire("Error", res.message, "warning");
          return;
        }

        let html = `
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="fw-bold mb-0">Questions - ${quizTitle}  (${subject})</h4>
        </div>

        
        <div class="card shadow-sm border-0 mb-3">
          <div class="card-body">

            <div class="row g-2 align-items-end">

              <div class="col-md-7">
                <label class="form-label">Question</label>
                <input id="questionText" class="form-control" placeholder="Enter question">
              </div>

              <div class="col-md-3">
                <label class="form-label">Marks</label>
                <input id="marks" type="number" class="form-control" placeholder="Marks">
              </div>

              <div class="col-md-2 d-grid">
                <button id="addQuestion" class="btn btn-primary">
                  Add
                </button>
              </div>

            </div>

          </div>
        </div>
      `;

        res.data.forEach((q) => {
          html += `
          <div class="card shadow-sm border-0 mb-3">

            <div class="card-body">

              <div class="d-flex justify-content-between align-items-start">

                <div>
                  <h6 class="mb-1">${q.question_text}</h6>
                  <small class="text-muted">${q.marks} marks</small>
                </div>

              </div>

           
              <div class="mt-3 d-flex gap-2 flex-wrap">

                <button class="btn btn-sm btn-outline-secondary viewOptions"
                  data-id="${q.id}" data-subject ="${subject}" data-title ="${quizTitle}" data-question="${q.question_text}">
                  Options
                </button>

                <button class="btn btn-sm btn-outline-warning editQuestion"
                  data-id="${q.id}"
                  data-text="${q.question_text}"
                  data-marks="${q.marks}"
                  data-subject ="${subject}" data-title ="${quizTitle}" >
                  Edit
                </button>

                <button class="btn btn-sm btn-outline-danger deleteQuestion"
                  data-id="${q.id}">
                  Delete
                </button>

              </div>

            
              <div id="options-${q.id}" class="mt-3"></div>

            </div>

          </div>
        `;
        });

        $("#sectionContent").html(html);
      },
      error: function () {
        Swal.fire("Error", "Server not responding. Try again later.", "error");
      },
    });
  }

  $(document).on("click", "#addQuestion", function () {
    $.ajax({
      url: "./api/php-scripts/adminQuestions.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      dataType: "json",
      data: {
        quiz_id: currentQuizId,
        text: $("#questionText").val(),
        marks: $("#marks").val(),
      },
      success: function (res) {
        if (res.status) {
          loadQuestions(currentQuizId,subject,quizTitle);
        } else {
          Swal.fire("oops", res.message, "warning");
        }
      },
      error: function (err) {
        Swal.fire("Error", "SomeThing went Wrong", "error");
      },
    });
  });

  $(document).on("click", ".editQuestion", function () {
    currentEntity = "question";
    currentId = $(this).data("id");
    subject   = $(this).data("subject");
    quizTitle = $(this).data("title");

    $("#crudTitle").text(`Edit Question - ${quizTitle} (${subject})`);
    $("#crudTitle").addClass("text-black");
    $("#crudForm").html(`
    <div class="mb-3">
      <label class="form-label">Question Text</label>
      <input id="questionTextEdit" class="form-control" value="${$(this).data("text")}">
    </div>
    <div class="mb-3">
      <label class="form-label">Marks</label>
      <input id="questionMarksEdit" type="number" class="form-control" value="${$(this).data("marks")}">
    </div>
  `);

    $("#crudModal").modal("show");

    $(document)
      .off("click", "#saveBtn")
      .on("click", "#saveBtn", function () {
        $.ajax({
          url: "./api/php-scripts/adminQuestions.php",
          type: "POST",
          headers: { Authorization: "Bearer " + token },
          dataType: "json",
          data: {
            update: currentId,
            text: $("#questionTextEdit").val(),
            marks: $("#questionMarksEdit").val(),
          },
          success: function (res) {
            if (res.status) {
              $("#crudModal").modal("hide");
              loadQuestions(currentQuizId,subject,quizTitle);
              Swal.fire("Success", res.message, "success");
            } else {
              Swal.fire("Error", res.message, "error");
            }
          },
          error: function () {
            Swal.fire("Error", "Something went wrong", "error");
          },
        });
      });
  });

  $(document).on("click", ".deleteQuestion", function () {
    $.ajax({
      url: "./api/php-scripts/adminQuestions.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      dataType: "json",
      data: { delete: $(this).data("id") },
      success: function (res) {
        if (res.status) {
          loadQuestions(currentQuizId);
        } else {
          Swal.fire("oops", res.message, "warning");
        }
      },
      error: function (err) {
        Swal.fire("Error", "SomeThing went Wrong", "error");
      },
    });
  });

  $(document).on("click", ".viewOptions", function () {
    let qid = $(this).data("id");
     let subject   = $(this).data("subject");
    let quizTitle = $(this).data("title");
    question_text = $(this).data("question");


    $("[id^='options-']").html("");

    $.ajax({
      url: "./api/php-scripts/adminOptions.php",
      type: "GET",
      headers: { Authorization: "Bearer " + token },
      dataType: "json",
      data: { question_id: qid },

      success: function (res) {
        if (!res.status) {
          Swal.fire("Error", res.message, "warning");
          return;
        }

        let html = `
        <div class="card border-0 shadow-sm mt-3">

          <div class="card-body">

           
            <div class="row g-2 align-items-end mb-3">

              <div class="col-md-7">
                <label class="form-label">Option</label>
                <input id="optText-${qid}" class="form-control" placeholder="Enter option">
              </div>

              <div class="col-md-3">
                <label class="form-label">Correct</label>
                <select id="optCorrect-${qid}" class="form-select">
                  <option value="false">Wrong</option>
                  <option value="true">Correct</option>
                </select>
              </div>

              <div class="col-md-2 d-grid">
                <button class="btn btn-success addOption" data-id="${qid}">
                  Add
                </button>
              </div>

            </div>

            
            <ul class="list-group list-group-flush">
      `;

        res.data.forEach((o) => {
          html += `
          <li class="list-group-item d-flex justify-content-between align-items-center">

            <div>
              <span class="fw-semibold">${o.option_text}</span>
              ${
                o.is_correct
                  ? `<span class="badge bg-success ms-2">Correct</span>`
                  : ""
              }
            </div>

            <div class="btn-group btn-group-sm">

              <button class="btn btn-outline-warning editOption"
                data-id="${o.id}"
                data-qid="${qid}"
                data-text="${o.option_text}"
                data-correct="${o.is_correct}"
                 data-subject  = "${subject}"
                data-title = "${quizTitle}"
                data-question ="${question_text}">
                Edit
              </button>

              <button class="btn btn-outline-danger deleteOption"
                data-id="${o.id}"
                data-qid="${qid}">
                Delete
              </button>

            </div>

          </li>
        `;
        });

        html += `
            </ul>
          </div>
        </div>
      `;

        $("#options-" + qid).html(html);
      },
      error: function () {
        Swal.fire("Error", "Server not responding. Try again later.", "error");
      },
    });
  });

  $(document).on("click", ".addOption", function () {
  let qid = $(this).data("id");
  let isCorrect = $("#optCorrect-" + qid).val();

  function proceedAdd() {
    $.ajax({
      url: "./api/php-scripts/adminOptions.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      dataType: "json",
      data: {
        question_id: qid,
        text: $("#optText-" + qid).val(),
        is_correct: isCorrect,
      },
      success: function (res) {
        if (res.status) {
          $(".viewOptions[data-id='" + qid + "']").click();
        } else {
          Swal.fire("Error", res.message, "error");
        }
      }
    });
  }

  
  if (isCorrect === "true") {

    $.ajax({
      url: "./api/php-scripts/adminOptions.php",
      type: "GET",
      headers: { Authorization: "Bearer " + token },
      dataType: "json",
      data: { check_correct: true, question_id: qid },

      success: function (res) {

        if (res.data.exists) {

          Swal.fire({
            title: "Replace correct answer?",
            text: "A correct option already exists. This will override it.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Replace"
          }).then((r) => {
            if (r.isConfirmed) proceedAdd();
          });

        } else {
          proceedAdd();
        }

      }
    });

  } else {
    proceedAdd();
  }
});

 $(document).on("click", ".editOption", function () {
  currentId = $(this).data("id");
  let qid = $(this).data("qid");
  let question_text = $(this).data("question");

  $("#crudTitle").text(`Edit Option on "${question_text}"`);
  $("#crudForm").html(`
    <div class="mb-3">
      <label>Option Text</label>
      <input id="optionTextEdit" class="form-control" value="${$(this).data("text")}">
    </div>
    <div class="mb-3">
      <label>Correct?</label>
      <select id="optionCorrectEdit" class="form-select">
        <option value="false" ${!$(this).data("correct") ? "selected" : ""}>Wrong</option>
        <option value="true" ${$(this).data("correct") ? "selected" : ""}>Correct</option>
      </select>
    </div>
  `);

  $("#crudModal").modal("show");

  $(document)
    .off("click", "#saveBtn")
    .on("click", "#saveBtn", function () {

      let isCorrect = $("#optionCorrectEdit").val();

      function proceedEdit() {
        $.ajax({
          url: "./api/php-scripts/adminOptions.php",
          type: "POST",
          headers: { Authorization: "Bearer " + token },
          dataType: "json",
          data: {
            update: currentId,
            text: $("#optionTextEdit").val(),
            is_correct: isCorrect,
            force: true  
          },
          success: function (res) {
            if (res.status) {
              $("#crudModal").modal("hide");
              $(".viewOptions[data-id='" + qid + "']").click();
              Swal.fire("Success", res.message, "success");
            }
          }
        });
      }

    
      if (isCorrect === "true") {

        $.ajax({
          url: "./api/php-scripts/adminOptions.php",
          type: "GET",
          headers: { Authorization: "Bearer " + token },
          dataType: "json",
          data: { check_correct: true, question_id: qid },

          success: function (res) {

            if (res.data.exists) {

              Swal.fire({
                title: "Override correct option?",
                text: "Existing correct answer will be replaced.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Continue"
              }).then((r) => {
                if (r.isConfirmed) {
                  proceedEdit(); 
                } else {
    $("#crudModal").modal("hide");  
  }
              });

            } else {
              proceedEdit();
            }

          }
        });

      } else {
        proceedEdit();
      }

    });
});

  $(document).on("click", ".deleteOption", function () {
    let optId = $(this).data("id");
    let qid = $(this).data("qid");
    $.ajax({
      url: "./api/php-scripts/adminOptions.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      dataType: "json",
      data: { delete: optId },
      success: function (res) {
        if (res.status) {
          $(".viewOptions[data-id='" + qid + "']").click();
        } else {
          Swal.fire("Oops", res.message, "warning");
        }
      },
      error: function () {
        Swal.fire("Error", "Something went wrong", "error");
      },
    });
  });
});
