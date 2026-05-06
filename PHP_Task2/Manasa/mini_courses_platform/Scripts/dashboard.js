$(document).ready(function () {
  let token = localStorage.getItem("token");
  let role = localStorage.getItem("role");

  let allCourses = [];
  let showAll = false;
  let selectedCourseId = null;
  let editingLessonId = null;
  let studentCourses = [];
  let enrollmentRequests = [];
  let showAllStudent = false;
  let enrolledCourses = [];
  let myLearningData = [];
  let pendingRequests = [];

  if (!token || !role) {
    window.location.href = "Login.html";
    return;
  }

  applyRole(role);

  if (role === "admin") {
    loadCourses();
    loadRevenue();
    loadRequests();
    loadEnrollmentRequests();
    loadGlobalSetting();

  }
  if (role === "student") {
    loadEnrolledCourses();
    loadStudentCourses();
    loadMyLearning();
    loadPendingRequests();
  }

  function applyRole(role) {
    if (role === "admin") {
      $(".admin-only").show();
      $(".student-only").hide();
    } else {
      $(".student-only").show();
      $(".admin-only").hide();
    }
  }

  function loadRevenue() {
    $.ajax({
      url: "api/get_revenue.php",
      type: "GET",
      headers: { Authorization: "Bearer " + token },

      success: function (res) {
        if (res.status === "success") {
          $("#revenueStat").text("₹" + res.revenue);
        }
      },
    });
  }

  $("#logoutBtn").click(function () {
    $.ajax({
      url: "api/logout.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      success: function () {
        localStorage.clear();
        window.location.href = "Login.html";
      },
    });
  });

  $("#saveCourseButton").click(function () {
    let title = $("#courseTitle").val().trim();
    let description = $("#courseDesc").val().trim();
    let price = $("#coursePrice").val();
    let requiresApproval = $("#courseApprovalToggle").is(":checked") ? 1 : 0;
    if (!title || !description) {
      Swal.fire("Error", "All fields required", "error");
      return;
    }

    $.ajax({
      url: "api/create_course.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      contentType: "application/json",
      data: JSON.stringify({ title, description, price, requires_approval: requiresApproval }),

      success: function (res) {
        if (res.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Course Created",
            timer: 1500,
            showConfirmButton: false,
          });

          $("#courseTitle").val("");
          $("#courseDesc").val("");
          $("#coursePrice").val("");
          $("#courseApprovalToggle").prop("checked", false);

          bootstrap.Modal.getInstance(
            document.getElementById("createCourseModal"),
          ).hide();

          loadCourses();
        } else {
          Swal.fire("Error", res.message, "error");
        }
      },
    });
  });

  function loadCourses() {
    $.ajax({
      url: "api/get_courses.php",
      type: "GET",
      headers: { Authorization: "Bearer " + token },

      success: function (res) {
        if (res.status === "success") {
          allCourses = res.courses;
          $("#totalCoursesCount").text(allCourses.length);

          renderCourses();
        }
      },
    });
  }

  function renderCourses() {
    let html = "";

    let coursesToShow = showAll ? allCourses : allCourses.slice(0, 4);

    coursesToShow.forEach((course) => {
      html += `
<div class="col-12 col-md-6">
  <div class="card-box h-100 d-flex flex-column justify-content-between position-relative">

    <i class="bi bi-trash deleteCourseBtn"
       data-id="${course.id}"
       style="position:absolute; top:10px; right:10px; cursor:pointer; color:red;">
    </i>

    <div>
      <h5 class="fw-bold">${course.title}</h5>
      <p class="text-muted small">${course.description}</p>
      <span class="badge bg-dark">₹${course.price || 0}</span>
    </div>

    <div class="d-flex gap-2 mt-3">
      <button class="btn btn-primary btn-sm addLessonBtn" data-id="${course.id}">
        Add Lesson
      </button>

      <button class="btn btn-success btn-sm viewLessonBtn" data-id="${course.id}">
        View Lessons
      </button>
    </div>

  </div>
</div>
`;
    });

    $("#coursesContainer").html(html);

    if (allCourses.length <= 4) {
      $("#toggleCoursesBtn").hide();
    } else {
      $("#toggleCoursesBtn").show();
      $("#toggleCoursesBtn").text(showAll ? "Show Less 🔺" : "Show More 🔻");
    }
  }

  $("#toggleCoursesBtn").click(function () {
    showAll = !showAll;
    renderCourses();
  });

  $(document).on("click", ".deleteCourseBtn", function () {
    let id = $(this).data("id");

    Swal.fire({
      title: "Delete Course?",
      text: "All lessons will be deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: "api/delete_course.php",
          type: "POST",
          headers: { Authorization: "Bearer " + token },
          contentType: "application/json",
          data: JSON.stringify({ course_id: id }),

          success: function (res) {
            if (res.status === "success") {
              Swal.fire({
                icon: "success",
                title: "Deleted",
                timer: 1200,
                showConfirmButton: false,
              });

              loadCourses();
            } else {
              Swal.fire("Error", res.message, "error");
            }
          },
        });
      }
    });
  });

  $(document).on("click", ".addLessonBtn", function () {
    selectedCourseId = $(this).data("id");
    new bootstrap.Modal("#addLessonModal").show();
  });

  $("#saveLessonBtn").click(function () {
    $.ajax({
      url: "api/add_lesson.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      contentType: "application/json",
      data: JSON.stringify({
        course_id: selectedCourseId,
        title: $("#lessonTitle").val(),
        content: $("#lessonContent").val(),
        lesson_order: $("#lessonOrder").val(),
      }),

      success: function (res) {
        if (res.status === "success") {
          Swal.fire("Success", "Lesson added", "success");
          location.reload();
        } else {
          Swal.fire("Error", res.message, "error");
        }
      },
    });
  });

  $(document).on("click", ".viewLessonBtn", function () {
    let id = $(this).data("id");

    $.ajax({
      url: "api/get_lessons.php?course_id=" + id,
      headers: { Authorization: "Bearer " + token },

      success: function (res) {
        let html = "";

        if (res.lessons.length === 0) {
          html = "<p>No lessons</p>";
        } else {
          res.lessons.forEach((l) => {
            html += `
<div class="card mb-2">
  <div class="card-body d-flex justify-content-between">

    <div>
      <h6>${l.lesson_order}. ${l.title}</h6>
      <small>${l.content}</small>
    </div>

    <div>
      <button class="btn btn-warning btn-sm editLessonBtn"
        data-id="${l.id}"
        data-title="${l.title}"
        data-content="${l.content}"
        data-order="${l.lesson_order}">
        <i class="bi bi-pencil-square"></i>
      </button>

      <button class="btn btn-danger btn-sm deleteLessonBtn"
        data-id="${l.id}">
        <i class="bi bi-trash"></i>
      </button>
    </div>

  </div>
</div>`;
          });
        }

        $("#lessonsContainer").html(html);
        new bootstrap.Modal("#viewLessonsModal").show();
      },
    });
  });

  $(document).on("click", ".deleteLessonBtn", function () {
    let id = $(this).data("id");

    $.ajax({
      url: "api/delete_lesson.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      contentType: "application/json",
      data: JSON.stringify({ lesson_id: id }),

      success: function () {
        Swal.fire("Deleted", "", "success");
        location.reload();
      },
    });
  });

  $(document).on("click", ".editLessonBtn", function () {
    editingLessonId = $(this).data("id");

    $("#editLessonTitle").val($(this).data("title"));
    $("#editLessonContent").val($(this).data("content"));
    $("#editLessonOrder").val($(this).data("order"));

    new bootstrap.Modal("#editLessonModal").show();
  });

  $("#updateLessonBtn").click(function () {
    $.ajax({
      url: "api/update_lesson.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      contentType: "application/json",
      data: JSON.stringify({
        lesson_id: editingLessonId,
        title: $("#editLessonTitle").val(),
        content: $("#editLessonContent").val(),
        lesson_order: $("#editLessonOrder").val(),
      }),

      success: function () {
        Swal.fire("Updated", "", "success");
        location.reload();
      },
    });
  });

  //>>>>>student functionlities

  function loadStudentCourses() {
    $.ajax({
      url: "api/get_all_courses.php",
      type: "GET",
      headers: { Authorization: "Bearer " + token },

      success: function (res) {
        if (res.status === "success") {
          studentCourses = res.courses;
          renderStudentCourses();
        }
      },
    });
  }

  function renderStudentCourses() {
    let html = "";

    let coursesToShow = showAllStudent
      ? studentCourses
      : studentCourses.slice(0, 4);

    coursesToShow.forEach((course) => {
      let isEnrolled = enrolledCourses.some((e) => e.id == course.id);
      let isPending = pendingRequests.some((r) => r.course_id == course.id);

      html += `
      <div class="col-12 col-md-6">
        <div class="card-box h-100 d-flex flex-column justify-content-between">

          <div>
            <h6 class="fw-bold">${course.title}</h6>
            <p class="text-muted small">${course.description}</p>
            <span class="badge bg-dark">₹${course.price || 0}</span>
          </div>

          <button 
  class="btn mt-3 
  ${isEnrolled ? "btn-success" : isPending ? "btn-warning" : "enrollBtn"}"
  
  ${isEnrolled || isPending ? "disabled" : ""}
  
  data-id="${course.id}">

  ${isEnrolled ? "Enrolled" : isPending ? "Pending" : "Enroll"}

</button>

        </div>
      </div>
    `;
    });

    $("#studentCoursesContainer").html(html);

    if (studentCourses.length <= 4) {
      $("#toggleStudentCoursesBtn").hide();
    } else {
      $("#toggleStudentCoursesBtn").show();
      $("#toggleStudentCoursesBtn").text(
        showAllStudent ? "Show Less 🔺" : "Show More 🔻",
      );
    }
  }

  $("#toggleStudentCoursesBtn").click(function () {
    showAllStudent = !showAllStudent;
    renderStudentCourses();
  });

  $(document).on("click", ".enrollBtn", function () {
    let courseId = $(this).data("id");

    $.ajax({
      url: "api/enroll_course.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      contentType: "application/json",
      data: JSON.stringify({ course_id: courseId }),

      success: function (res) {

        if (res.status === "success") {
          Swal.fire("Enrolled!", "", "success");

          loadEnrolledCourses();
          loadPendingRequests();
        }

        else if (res.status === "pending") {
          Swal.fire("Request Sent", "Waiting for admin approval", "info");

          loadPendingRequests();
        }

        else {
          Swal.fire("Info", res.message, "info");
        }

      },
    });
  });

  function loadEnrolledCourses() {
    $.ajax({
      url: "api/get_enrolled_courses.php",
      type: "GET",
      headers: { Authorization: "Bearer " + token },

      success: function (res) {
        if (res.status === "success") {
          enrolledCourses = res.courses;
          $("#enrolledCount").text(enrolledCourses.length);

          renderEnrolledCourses();
        }
      },
    });
  }

  function renderEnrolledCourses() {
    let html = "";

    if (enrolledCourses.length === 0) {
      html = "<p>No enrolled courses yet</p>";
    } else {
      enrolledCourses.forEach((course) => {
        html += `
<div class="col-12">
  <div class="card-box">

    <h6>${course.title}</h6>
    <p class="small text-muted">${course.description}</p>

    <div class="d-flex justify-content-between align-items-center mt-2">

      <button class="btn btn-sm btn-info viewLessonsStudentBtn"
        data-id="${course.id}">
        View Lessons
      </button>

      <span class="badge bg-success">Enrolled ✅</span>
    </div>

    
    <div class="mt-3">
      <label class="small">Rate this course:</label>
      <div class="rating-stars" data-course="${course.id}">
        ${[1, 2, 3, 4, 5]
            .map(
              (i) => `
          <i class="bi bi-star starBtn" data-value="${i}" data-course="${course.id}" style="cursor:pointer;"></i>
        `,
            )
            .join("")}
      </div>
    </div>

  </div>
</div>
`;
      });
    }

    $(document).on("click", ".starBtn", function () {
      let value = $(this).data("value");
      let courseId = $(this).data("course");

      let parent = $(this).parent();

      parent
        .find(".starBtn")
        .removeClass("active")
        .removeClass("bi-star-fill")
        .addClass("bi-star");

      parent.find(".starBtn").each(function () {
        if ($(this).data("value") <= value) {
          $(this)
            .addClass("active")
            .removeClass("bi-star")
            .addClass("bi-star-fill");
        }
      });

      $.ajax({
        url: "api/add_review.php",
        type: "POST",
        headers: { Authorization: "Bearer " + token },
        contentType: "application/json",
        data: JSON.stringify({
          course_id: courseId,
          rating: value,
        }),
        success: function (res) {
          if (res.status === "success") {
            Swal.fire("Rated!", "", "success");
          }
        },
      });
    });

    $("#myCoursesContainer").html(html);


  }


  function loadLessonsIntoModal(courseId) {

    $.ajax({
      url: "api/get_lessons.php?course_id=" + courseId,
      headers: { Authorization: "Bearer " + token },

      success: function (res) {

        let html = "";

        if (res.lessons.length === 0) {
          html = "<p>No lessons available</p>";
        } else {

          res.lessons.forEach((lesson) => {

            let buttonHTML = "";

            if (lesson.is_completed == 1) {
              buttonHTML = `
              <button class="btn btn-sm btn-danger undoCompleteBtn"
                data-id="${lesson.id}"
                data-course="${courseId}">
                Undo Completionfirstt 
              </button>
            `;
            } else {
              buttonHTML = `
              <button class="btn btn-sm btn-success markCompleteBtn"
                data-id="${lesson.id}"
                data-course="${courseId}">
                Mark as Completed
              </button>
            `;
            }

            html += `
<div class="card mb-2">
  <div class="card-body">
    <h6>${lesson.lesson_order}. ${lesson.title}</h6>
    <p class="small">${lesson.content}</p>
    ${buttonHTML}
  </div>
</div>`;
          });
        }

        $("#lessonsContainer").html(html);
      }
    });

  }

  $(document).on("click", ".viewLessonsStudentBtn", function () {
    let courseId = $(this).data("id");

    loadLessonsIntoModal(courseId);


    new bootstrap.Modal("#viewLessonsModal").show();
  });

  
  $(document).on("click", ".undoCompleteBtn", function () {
    let lessonId = $(this).data("id");
    let courseId = $(this).data("course");

    $.ajax({
      url: "api/undo_progress.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      contentType: "application/json",
      data: JSON.stringify({
        lesson_id: lessonId
      }),
      success: function () {
        // Swal.fire("Reverted!", "", "success");

        loadMyLearning();


        loadLessonsIntoModal(courseId);
      }
    });
  });


  $(document).on("click", ".markCompleteBtn", function () {
    let lessonId = $(this).data("id");
    let courseId = $(this).data("course");

    $.ajax({
      url: "api/update_progress.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      contentType: "application/json",
      data: JSON.stringify({
        lesson_id: lessonId,
        course_id: courseId,
      }),

      success: function () {
        Swal.fire("Completed!", "", "success");

        loadMyLearning();
      },
    });
  });

  $("#myLearningBtn").click(function () {
    $("#studentCoursesContainer").closest(".card-box").hide();
    $("#myCoursesContainer").closest(".card-box").hide();

    $(".banner").show();

    $("#myLearningSection").show();

    loadMyLearning();
  });

  $("#coursesBtn").click(function () {
    $("#studentCoursesContainer").closest(".card-box").show();
    $("#myCoursesContainer").closest(".card-box").show();

    $(".banner").show();

    $("#myLearningSection").hide();
  });
  function loadMyLearning() {
    $.ajax({
      url: "api/getMyLearning.php",
      type: "GET",
      headers: { Authorization: "Bearer " + token },

      success: function (res) {
        console.log("learning data:", res);
        myLearningData = res;
        renderMyLearning();
      },

      error: function (xhr) {
        console.log("ERROR:", xhr.responseText);
      },
    });
  }

  function renderMyLearning() {
    let html = "";

    if (myLearningData.length === 0) {
      html = "<p>No learning progress yet</p>";
    } else {
      myLearningData.forEach((course) => {
        html += `
<div class="card-box mb-3">

  <h6 class="fw-bold">${course.title}</h6>


  <div class="progress mb-2" style="height:10px;">
    <div class="progress-bar bg-success"
      style="width:${course.progress || 0}%">
    </div>
  </div>

  <small>${course.progress || 0}% Completed</small>

  <div class="mt-2 text-muted small">
    ${course.completed_lessons} / ${course.total_lessons} lessons completed
  </div>

</div>
`;
      });
    }

    $("#myLearningProgressContainer").html(html);
  }

  $(document).on("click", ".starBtn", function () {
    let rating = $(this).data("value");
    let courseId = $(this).data("course");

    $.ajax({
      url: "api/add_review.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      contentType: "application/json",
      data: JSON.stringify({
        course_id: courseId,
        rating: rating,
      }),

      success: function (res) {
        if (res.status === "success") {
          Swal.fire("Thanks!", "Rating submitted", "success");
        } else {
          Swal.fire("Error", res.message, "error");
        }
      },
    });
  });

  function loadPendingRequests() {
    $.ajax({
      url: "api/get_pending_requests.php",
      type: "GET",
      headers: { Authorization: "Bearer " + token },

      success: function (res) {
        if (res.status === "success") {
          pendingRequests = res.requests;
          renderStudentCourses();
        }
      }
    });
  }

  function loadEnrollmentRequests() {
    $.ajax({
      url: "api/get_enrollment_requests.php",
      type: "GET",
      headers: { Authorization: "Bearer " + token },

      success: function (res) {
        if (res.status === "success") {
          enrollmentRequests = res.requests;
          renderRequests();
        }
      }
    });
  }

  function renderRequests() {
    let html = "";

    if (enrollmentRequests.length === 0) {
      html = "<p>No pending requests</p>";
    } else {
      enrollmentRequests.forEach((r) => {
        html += `
<div class="card mb-2">
  <div class="card-body d-flex justify-content-between align-items-center">

    <div>
      <strong>${r.user_name}</strong>
      <div class="small text-muted">
        requested for <b>${r.course_title}</b>
      </div>
    </div>

    <div class="d-flex gap-2">
      <button class="btn btn-success btn-sm approveBtn"
        data-id="${r.id}">
        Approve
      </button>

      <button class="btn btn-danger btn-sm rejectBtn"
        data-id="${r.id}">
        Reject
      </button>
    </div>

  </div>
</div>
`;
      });
    }

    $("#requestsContainer").html(html);
  }

  $(document).on("click", ".approveBtn", function () {
    let id = $(this).data("id");

    $.ajax({
      url: "api/handle_request.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      contentType: "application/json",
      data: JSON.stringify({
        request_id: id,
        action: "approve"
      }),

      success: function () {
        Swal.fire("Approved!", "", "success");
        loadEnrollmentRequests();
      }
    });
  });

  $(document).on("click", ".rejectBtn", function () {
    let id = $(this).data("id");

    $.ajax({
      url: "api/handle_request.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      contentType: "application/json",
      data: JSON.stringify({
        request_id: id,
        action: "reject"
      }),

      success: function () {
        Swal.fire("Rejected!", "", "info");
        loadEnrollmentRequests();
      }
    });
  });

  function loadGlobalSetting() {
    $.ajax({
      url: "api/get_global_setting.php",
      headers: { Authorization: "Bearer " + token },

      success: function (res) {
        if (res.status === "success") {
          $("#globalApprovalToggle").prop(
            "checked",
            res.require_approval_global == 1
          );
        }
      }
    });
  }
  $("#globalApprovalToggle").change(function () {
    let value = $(this).is(":checked") ? 1 : 0;

    $.ajax({
      url: "api/update_global_setting.php",
      type: "POST",
      headers: { Authorization: "Bearer " + token },
      contentType: "application/json",
      data: JSON.stringify({
        require_approval_global: value
      }),

      success: function () {
        Swal.fire("Updated!", "Global setting changed", "success");
      }
    });
  });

  function loadRequests() {
    $.ajax({
      url: "api/get_enrollment_requests.php",
      headers: { Authorization: "Bearer " + token },

      success: function (res) {
        let html = "";

        if (res.requests.length === 0) {
          html = "<p>No pending requests</p>";
        } else {
          res.requests.forEach((r) => {
            html += `
<div class="card mb-2">
  <div class="card-body d-flex justify-content-between align-items-center">

    <div>
      <strong>${r.student_name}</strong> requested for
      <strong>${r.course_title}</strong>
    </div>

    <div class="d-flex gap-2">
      <button class="btn btn-success btn-sm approveBtn" data-id="${r.id}">
        Approve
      </button>

      <button class="btn btn-danger btn-sm rejectBtn" data-id="${r.id}">
        Reject
      </button>
    </div>

  </div>
</div>`;
          });
        }

        $("#requestsContainer").html(html);
      },
    });
  }
});
