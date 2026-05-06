$(document).ready(function () {
const token = localStorage.getItem('token');
if (!token ) {
  window.location.replace('../index.html');
}
loadUser();
});
function loadUser() {
  $.ajax({
    url: "/api/auth/get-user.php",
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    success: function (res) {

      if (!res.status) {
        localStorage.removeItem("token");
        window.location.replace("../index.html");
        return;
      }
      loadComponents(res.data);
    },
    error: function () {
      window.location.replace("../index.html");
    }
  });

}

// function loadComponents(user) {
//   $('#sidebarContainer').load('../components/sidebar.html', function () {
//     renderSidebar(user);
//   });
  
//   $('#navbarContainer').load('../components/navbar.html', function () {
//     renderNavbar(user);
//   });
//   const view = user.role === "admin" ? "admin-home" : "user-home";
//   loadView(view);
// }

function loadComponents(user) {
  $('#sidebarContainer').html(`
    <div id="mobileSidebar"></div>
    <div id="desktopSidebar"></div>
  `);

  $('#mobileSidebar').load('../components/sidebar.html', function () {
    renderSidebar(user);
  });

  $('#desktopSidebar').load('../components/sidebar2.html', function () {
    renderSidebar(user);
  });

  $('#navbarContainer').load('../components/navbar.html', function () {
    renderNavbar(user);
  });

  const view = user.role === "admin" ? "admin-home" : "user-home";
  loadView(view);
}
 
function renderSidebar(user) {
  const name   = user.name;
  const role   = user.role;
  const letter = name.charAt(0).toUpperCase();
 
  $('.sideUserName').text(name);
  $('.sideUserRole').text(role === 'admin' ? 'Administrator' : 'Student');
  $('.sideAvatar').text(letter);
  $('.sideRoleLabel').text(role === 'admin' ? 'ADMIN PANEL' : 'USER PANEL');

  if (role === 'admin') {
    $('.user-link').hide();
    $('.admin-link').show();
  } else {
    $('.admin-link').hide();
    $('.user-link').show();
  }
 
  // $('#sideUserBtn').click(function () {
  //   $('#logoutDropdown').slideToggle(150);
  // });
  $(document)
  .off('click', '.sideUserBtn').on('click', '.sideUserBtn', function () {
  $('.logoutDropdown').slideToggle(150);
});

 
  // Logout
  $(document).on('click', '.logoutBtn', function () {
  $.ajax({
    url: "/api/auth/logout.php",
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    success: function () {
      localStorage.removeItem("token");
      window.location.replace("../index.html");
    },
    error: function () {
      window.location.replace("../index.html");
    }
  });

});
 
  // sidebar nav clicks
 $(document)
 .off('click', '.sidebar-link')
 .on('click', '.sidebar-link', function (e) {
  e.preventDefault();
  const view = $(this).data('view');
  $('.sidebar-link').removeClass('active');
  $(this).addClass('active');
  // close sidebar (mobile)
  const sidebarEl = document.getElementById('sidebar');
  const offcanvas = bootstrap.Offcanvas.getInstance(sidebarEl);
  if (offcanvas) offcanvas.hide();
  loadView(view);
});
}
 
function renderNavbar(user) {
  $('#navUserName').text(user.name);
  $('#navUserRole').text(user.role === 'admin' ? 'Administrator' : 'Student');
  $('#navAvatar').text(user.name.charAt(0).toUpperCase());
 
  $('#globalSearch').on('keyup', debounce(function () {
    const q = $(this).val().trim();
    const view = user.role === 'admin' ? 'quizzes' : 'attempt-list';
    if (q.length > 1) loadView(view, { search: q });
  }, 400));
}
function debounce(func, delay) {
  let timer;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, arguments), delay);
  };
}

function loadView(view,params = {}) {
  $("#mainContent").load(`../pages/${view}.html`, function () {
    if (view === "subjects") loadSubjects();
    if (view === "quizzes") loadQuizzes(params);
    if (view === "add-questions") loadQuestions();
    if (view === "attempt-list") loadAttemptList(params);
    if (view === "quiz-screen") loadQuizScreen();
    if (view === "admin-home") loadAdminHome();
    if (view === "user-home") loadUserHome();
  });

}

let visibleAttempts = 5;
let allAttempts = [];
 
function loadUserHome() {
  $.ajax({
    url: "/api/attempts/userAttempts.php",
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    success: function (res) {
      if (!res.status) {
        $("#recentAttempts").html(`
          <tr><td colspan="3" class="text-center text-danger">Failed to load</td></tr>
        `);
        return;
      }
      // const attempts = res.data || [];
      // const total = attempts.length;

      // let avg = 0;  //avg percentage
      // if (total > 0) {
      //   let sum = 0;
      //   attempts.forEach(a => {
      //     const pct = (a.obtained_marks / a.total_marks) * 100;
      //     sum += pct;
      //   });
      //   avg = Math.round(sum / total);
      // }

      // const rows = attempts.slice(0, 5).map(a => {
      //   const pct = Math.round((a.obtained_marks / a.total_marks) * 100);

      //   return `
      //     <tr>
      //       <td>${a.title}</td>
      //       <td>${a.obtained_marks} / ${a.total_marks} (${pct}%)</td>
      //       <td>${new Date(a.submitted_at).toLocaleDateString()}</td>
      //     </tr>
      //   `;
      // }).join('');

      // $("#recentAttempts").html(rows || `
      //   <tr>
      //     <td colspan="3" class="text-center text-muted py-3">
      //       No attempts yet
      //     </td>
      //   </tr>
      // `);

      // $("#totalAttempts").text(total);
      // $("#avgScore").text(avg + "%");
      allAttempts = res.data || []; // store all
      visibleAttempts = 5;

      renderAttempts();

    },
    error: function () {
      $("#recentAttempts").html(`
        <tr><td colspan="3" class="text-center text-danger">Server error</td></tr>
      `);
    }
  });

}

function renderAttempts() {
  const total = allAttempts.length;

  let avg = 0;
  if (total > 0) {
    let sum = 0;
    allAttempts.forEach(a => {
      // sum += (a.obtained_marks / a.total_marks) * 100;
      if (a.total_marks > 0) {
        sum += (a.obtained_marks / a.total_marks) * 100;
      }
    });
    avg = Math.round(sum / total);
  }

  const rows = allAttempts.slice(0, visibleAttempts).map(a => {
    // const pct = Math.round((a.obtained_marks / a.total_marks) * 100);
    const pct = a.total_marks > 0
      ? Math.round((a.obtained_marks / a.total_marks) * 100)
      : 0;

    return `
      <tr>
        <td>${a.title}</td>
        <td>${a.obtained_marks} / ${a.total_marks} (${pct}%)</td>
        <td>${new Date(a.submitted_at).toLocaleDateString()}</td>
      </tr>
    `;
  }).join('');

  $("#recentAttempts").html(rows || `
    <tr>
      <td colspan="3" class="text-center text-muted py-3">
        No attempts yet
      </td>
    </tr>
  `);

  $("#totalAttempts").text(total);
  $("#avgScore").text(avg + "%");
  $("#avgProgressBar").css("width", avg + "%");

  // toggle button
  if (visibleAttempts < total) {
    $("#loadMoreBtn").show();
  } else {
    $("#loadMoreBtn").hide();
  }
}

$(document).on('click', '#loadMoreBtn', function () {
  visibleAttempts += 5;
  renderAttempts();
});

function loadAdminHome() {

  $.ajax({
    url: "/api/attempts/admindashboard.php",
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    success: function (res) {

      if (!res.status) {
        $("#adminStats").html(`
          <div class="text-danger text-center py-4">Failed to load</div>
        `);
        return;
      }

      const data = res.data;

      $("#totalUsers").text(data.total_users || 0);
      $("#totalQuizzes").text(data.total_quizzes || 0);
      $("#totalAttempts").text(data.total_attempts || 0);

    },
    error: function () {
      $("#adminStats").html(`
        <div class="text-danger text-center py-4">Server error</div>
      `);
    }
  });
  loadAdminRecentAttempts();

}

// subjects
function loadSubjects() {

  $.ajax({
    url: "/api/subjects/getSubjects.php",
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    success: function (res) {

      if (!res.status) {
        $('#subjectsTable').html(`
          <tr><td colspan="3" class="text-danger text-center">Failed to load</td></tr>
        `);
        return;
      }

      const rows = res.data.map((s, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${s.name}</td>
          <td class="">
      <span class="quiz-badge">
        ${s.quizzes_count || 0} Quizzes
      </span>
    </td>
<td class="text-center">
  <div class="d-flex justify-content-center gap-2">

    <button class="btn btn-sm btn-outline-primary edit-subject"
      data-id="${s.id}" data-name="${s.name}">
      <i class="bi bi-pencil"></i>
    </button>

    <button class="btn btn-sm btn-outline-danger delete-subject"
      data-id="${s.id}">
      <i class="bi bi-trash"></i>
    </button>

  </div>
</td>
        </tr>
      `).join('');

      $('#subjectsTable').html(rows || `
        <tr><td colspan="3" class="text-center text-muted">No subjects</td></tr>
      `);

    },
    error: function () {
      $('#subjectsTable').html(`
        <tr><td colspan="3" class="text-danger text-center">Server error</td></tr>
      `);
    }
  });

}

// create
$(document).on("click", "#createSubjectBtn", function () {
  $("#subjectModalTitle").text("Add Subject");
  $("#subjectId").val("");
  $("#subjectName").val("");
  $("#subjectModalError").text("");

  new bootstrap.Modal("#subjectModal").show();
});

// edit
$(document).on("click", ".edit-subject", function () {
  $("#subjectModalTitle").text("Edit Subject");
  $("#subjectId").val($(this).data("id"));
  $("#subjectName").val($(this).data("name"));
  $("#subjectModalError").text("");

  new bootstrap.Modal("#subjectModal").show();
});

$(document).on("click", "#saveSubjectBtn", function () {

  const id = $("#subjectId").val();
  const name = $("#subjectName").val().trim();

  if (!name) {
    $("#subjectModalError").text("Name required");
    return;
  }

  const url = id
    ? "/api/subjects/updateSubject.php"
    : "/api/subjects/createSubject.php";

  const data = id ? { id, name } : { name };

  $.ajax({
    url: url,
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: data,
    success: function (res) {

      if (!res.status) {
        $("#subjectModalError").text(res.message);
        return;
      }

      bootstrap.Modal.getInstance(
        document.getElementById("subjectModal")
      ).hide();

      loadSubjects();

    }
  });

});

$(document).on("click", ".delete-subject", function () {

  const id = $(this).data("id");

  Swal.fire({
    title: "Delete subject?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Delete"
  }).then((r) => {

    if (!r.isConfirmed) return;

    $.ajax({
      url: "/api/subjects/delete.php",
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      data: { id },
      success: function (res) {

        if (!res.status) {
          Swal.fire("Error", res.message, "error");
          return;
        }

        loadSubjects();

      }
    });

  });

});
function getScoreClass(percent) {
  if (percent < 40) return "score-low";
  if (percent < 70) return "score-medium";
  return "score-high";
}

function loadAdminRecentAttempts() {
  $.ajax({
    url: "/api/attempts/allUserAttempts.php",
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    success: function (res) {
      if (!res.status) {
        $("#adminRecentAttempts").html(`
          <tr><td colspan="4" class="text-center text-danger">Failed to load</td></tr>
        `);
        return;
      }

      const attempts = res.data || [];

      const rows = attempts.slice(0, 5).map(a => {
        const pct = Math.round((a.obtained_marks / a.total_marks) * 100);
        const scoreClass = getScoreClass(pct);
        const initial = a.user_name ? a.user_name.charAt(0).toUpperCase() : "U";
        return `
          <tr>
            <td class="text-center">
        <div class="d-flex align-items-center gap-2">
          <div class="user-avatar">${initial}</div>
          <span class="fw-semibold">${a.user_name}</span>
        </div>
      </td>
            <td class="fw-semibold text-center">${a.quiz_title}</td>
            <td class="text-center">
        <span class="score-badge ${scoreClass}">
          ${pct}%
        </span>
        <span class="small text-muted ms-1">
          ${a.obtained_marks}/${a.total_marks}
        </span>
      </td>
            <td class="text-muted text-center">${new Date(a.submitted_at).toLocaleDateString()}</td>
          </tr>
        `;
      }).join('');

      $("#adminRecentAttempts").html(rows || `
        <tr><td colspan="4" class="text-center text-muted">No attempts yet</td></tr>
      `);
    }
  });
}


let currentPage = 1;
const limit = 7;
// quizzes admin
function loadQuizzes(params = {}) {
  params.page = currentPage;
  params.limit = limit;
  $.ajax({
    url: "/api/quizzes/getQuizzes.php",
    method: "GET",
    data:params,
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    success: function (res) {

      if (!res.status) {
        $("#quizTable").html(`
          <tr><td colspan="5" class="text-danger text-center">Failed to load</td></tr>
        `);
        return;
      }

      const rows = res.data.data.map((q, i) => `
        <tr>
          <td>${(currentPage - 1) * limit + i + 1}</td>
          <td>${q.title}</td>
          <td>${q.subject_name}</td>
          <td>${q.duration_minutes} min</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-success me-1 add-q"
              data-id="${q.id}" data-title="${q.title}">
              <i class="bi bi-plus"></i>Add Question
            </button>

            <button class="btn btn-sm btn-outline-primary me-1 edit-quiz"
              data-id="${q.id}"
              data-title="${q.title}"
              data-sid="${q.subject_id}"
              data-dur="${q.duration_minutes}"
              data-mpq="${q.marks_per_question}">
              <i class="bi bi-pencil"></i>
            </button>

            <button class="btn btn-sm btn-outline-danger delete-quiz"
              data-id="${q.id}">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `).join("");

      $("#quizTable").html(rows || `
        <tr><td colspan="5" class="text-center text-muted">No quizzes</td></tr>
      `);
      renderPagination(res.data.total);
    }
  });

}

function renderPagination(total) {
  const totalPages = Math.ceil(total / limit);

  $("#pageInfo").text(`Page ${currentPage} of ${totalPages}`);
  $("#currentPageBtn").text(currentPage);
  $("#prevPage").prop("disabled", currentPage === 1);
  $("#nextPage").prop("disabled", currentPage === totalPages);
}

// buttons
$(document).on("click", "#prevPage", function () {
  if (currentPage > 1) {
    currentPage--;
    loadQuizzes();
  }
});

$(document).on("click", "#nextPage", function () {
  currentPage++;
  loadQuizzes();
});

function loadSubjectsDropdown(selectedId = null) {

  $.ajax({
    url: "/api/subjects/getSubjects.php",
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    success: function (res) {

      const options = res.data.map(s => `
        <option value="${s.id}" ${selectedId == s.id ? "selected" : ""}>
          ${s.name}
        </option>
      `).join("");

      $("#quizSubject").html(options);

    }
  });

}

// create
$(document).on("click", "#createQuizBtn", function () {

  $("#quizModalTitle").text("Create Quiz");
  $("#quizId").val("");
  $("#quizTitle").val("");
  $("#quizDuration").val("");
  $("#quizMarks").val(1);
  $("#quizModalError").text("");

  loadSubjectsDropdown();

  new bootstrap.Modal("#quizModal").show();
});

// edit
$(document).on("click", ".edit-quiz", function () {

  $("#quizModalTitle").text("Edit Quiz");

  $("#quizId").val($(this).data("id"));
  $("#quizTitle").val($(this).data("title"));
  $("#quizDuration").val($(this).data("dur"));
  $("#quizModalError").text("");

  loadSubjectsDropdown($(this).data("sid"));

  new bootstrap.Modal("#quizModal").show();
});

let currentQuizId = null;
let currentQuizTitle = null;

$(document).on("click", "#saveQuizBtn", function () {

  const id = $("#quizId").val();
  const title = $("#quizTitle").val().trim();
  const subject_id = $("#quizSubject").val();
  const duration_mins = $("#quizDuration").val();

  if (!title || !subject_id || !duration_mins) {
    $("#quizModalError").text("All fields required");
    return;
  }

  const url = id
    ? "/api/quizzes/updateQuiz.php"
    : "/api/quizzes/createQuiz.php";

  const data = {
    subject_id,
    title,
    duration_mins
  };
  // console.log("hi")
  if (id) data.id = id;

  $.ajax({
    url: url,
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: data,
    success: function (res) {

      if (!res.status) {
        $("#quizModalError").text(res.message);
        return;
      }

      bootstrap.Modal.getInstance(
        document.getElementById("quizModal")
      ).hide();

      // after create → go to add questions
      if (!id && res.data?.quiz_id) {
        currentQuizId = res.data.quiz_id;
        currentQuizTitle = title;
        // console.log("hi");
        loadView("add-questions")
        // loadView("add-questions", {
        //   quiz_id: res.data.id,
        //   quiz_title: title
        // });
      } else {
        loadQuizzes();
      }

    }
  });

});

$(document).on("click", ".delete-quiz", function () {

  const id = $(this).data("id");

  Swal.fire({
    title: "Delete quiz?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Delete"
  }).then((r) => {

    if (!r.isConfirmed) return;

    $.ajax({
      url: "/api/quizzes/deleteQuiz.php",
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      data: { id },
      success: function (res) {

        if (!res.status) return;

        loadQuizzes();

      }
    });

  });

});


$(document).on("click", ".add-q", function () {
  currentQuizId = $(this).data("id");
  currentQuizTitle = $(this).data("title");
  loadView("add-questions")

});

// questions
// function loadQuestions(params={}) {

// //   const quizId = params.quiz_id;
// const quizId = params.quiz_id || currentQuizId;


//   $("#quizId").val(quizId);

//   $.ajax({
//     url: "/api/questions/getQuestions.php",
//     method: "GET",
//     headers: {
//       Authorization: "Bearer " + localStorage.getItem("token"),
//     },
//     data: { quiz_id: quizId },
//     success: function (res) {

//       if (!res.status) return;

//       const list = res.data.map((q, i) => `
//   <div class="border rounded p-3 mb-2 d-flex justify-content-between align-items-start">

//     <div style="flex:1; word-break: break-word; white-space: normal;">
//       <strong>Q${i + 1}.</strong> ${q.question_text}
//     </div>

//     <div class="ms-2 d-flex flex-column gap-1">
//       <button class="btn btn-sm btn-outline-primary edit-question"
//         data-id="${q.id}"
//         data-text="${q.question_text}">
//         <i class="bi bi-pencil"></i>
//       </button>

//       <button class="btn btn-sm btn-danger delete-question"
//         data-id="${q.id}">
//         <i class="bi bi-trash"></i>
//       </button>
//     </div>

//   </div>
// `).join("");

//       $("#questionsList").html(list || `
//         <p class="text-muted">No questions yet</p>
//       `);

//     }
//   });

// }

function loadQuestions(params = {}) {

  const quizId = params.quiz_id || currentQuizId;

  $("#quizId").val(quizId);

  $.ajax({
    url: "/api/questions/getQuestions.php",
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: { quiz_id: quizId },
    success: function (res) {

      if (!res.status) return;

      const list = res.data.map((q, i) => {

        const optionsHtml = (q.options || []).map((opt, index) => `
          <div class="${opt.is_correct ? 'text-success fw-bold' : ''}">
            ${index + 1}. ${opt.option_text}
            ${opt.is_correct ? '✔' : ''}
          </div>
        `).join("");

        return `
          <div class="border rounded p-3 mb-3">

            <!-- Question -->
            <div class="d-flex justify-content-between align-items-start">
              <div style="flex:1; word-break: break-word;">
                <strong>Q${i + 1}.</strong> ${q.question_text}
              </div>

              <div class="ms-2 d-flex flex-column gap-1">
                <button class="btn btn-sm btn-outline-primary edit-question"
                  data-id="${q.id}"
                  data-text="${q.question_text}"
                  data-options='${JSON.stringify(q.options)}'>
                  <i class="bi bi-pencil"></i>
                </button>

                <button class="btn btn-sm btn-danger delete-question"
                  data-id="${q.id}">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>

            <!-- Options -->
            <div class="mt-2 ps-2">
              ${optionsHtml}
            </div>

          </div>
        `;
      }).join("");

      $("#questionsList").html(list || `
        <p class="text-muted">No questions yet</p>
      `);

    }
  });

}

let editingQuestionId=null;
$(document).on("click", "#addQuestionBtn", function () {

  const quiz_id = currentQuizId;
  const question_text = $("#questionText").val().trim();
  const opt1 = $("#opt1").val().trim();
  const opt2 = $("#opt2").val().trim();
  const opt3 = $("#opt3").val().trim();
  const opt4 = $("#opt4").val().trim();
  const correct = $("input[name='correct']:checked").val();

  if (!question_text || !opt1 || !opt2 || !opt3 || !opt4 || !correct) {
    $("#questionError").text("All fields required");
    return;
  }

  const url = editingQuestionId
    ? "/api/questions/updateQuestion.php"
    : "/api/questions/createQuestion.php";

  const data = {
    quiz_id,
    question_text,
    options: JSON.stringify([
      { text: opt1, is_correct: correct == 1 },
      { text: opt2, is_correct: correct == 2 },
      { text: opt3, is_correct: correct == 3 },
      { text: opt4, is_correct: correct == 4 }
    ])
  };

  if (editingQuestionId) {
    data.id = editingQuestionId;
  }

  $.ajax({
    url: url,
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: data,
    success: function (res) {

      if (!res.status) {
        $("#questionError").text(res.message);
        return;
      }

      // reset form
      editingQuestionId = null;
      $("#addQuestionBtn").text("Add Question");
      $("#questionText, #opt1, #opt2, #opt3, #opt4").val("");
      $("input[name='correct']").prop("checked", false);
      $("#questionError").text("");

    //   loadQuestions();
    loadQuestions();

    }
  });

});

$(document).on("click", ".delete-question", function () {

  const id = $(this).data("id");
  const quiz_id = $(this).data("qid");

  $.ajax({
    url: "/api/questions/deleteQuestion.php",
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: { id },
    success: function (res) {
      if (!res.status) return;
      loadQuestions({ quiz_id });
    }
  });

});

$(document).on("click", "#backToQuizzes", function () {
  loadView("quizzes");
});

$(document).on("click", ".edit-question", function () {

  editingQuestionId = $(this).data("id");

  const text = $(this).data("text");
  const options = $(this).data("options");

  $("#questionText").val(text);

  // fill options
  $("#opt1").val(options[0]?.option_text || "");
  $("#opt2").val(options[1]?.option_text || "");
  $("#opt3").val(options[2]?.option_text || "");
  $("#opt4").val(options[3]?.option_text || "");

  // select correct option
  options.forEach((opt, index) => {
    if (opt.is_correct) {
      $(`input[name='correct'][value='${index + 1}']`).prop("checked", true);
    }
  });

  // change button text
  $("#addQuestionBtn").text("Update Question");

  // scroll up
  window.scrollTo({ top: 0, behavior: "smooth" });

});


