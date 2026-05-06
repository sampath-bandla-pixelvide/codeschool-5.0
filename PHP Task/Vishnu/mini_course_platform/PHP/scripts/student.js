let studentLessons = [];
let currentLessonPage = 1;
const LESSONS_PER_PAGE = 1;

function getSkeletonCard() {
  return `
    <div class="col-md-4">
        <div class="glass-card course-card p-4 bg-white border rounded shadow-sm" aria-hidden="true">
            <h5 class="card-title placeholder-glow"><span class="placeholder col-6"></span></h5>
            <p class="card-text placeholder-glow mb-3"><span class="placeholder col-7"></span><span class="placeholder col-4"></span></p>
            <div class="d-flex justify-content-between mb-3 placeholder-glow">
                <span class="placeholder col-3"></span>
                <span class="placeholder col-2"></span>
            </div>
            <a href="#" tabindex="-1" class="btn btn-primary disabled placeholder col-12"></a>
        </div>
    </div>`;
}

function loadExploreCourses(search = "") {
  $("#exploreCoursesGrid").html(
    getSkeletonCard() + getSkeletonCard() + getSkeletonCard(),
  );

  $.ajax({
    url: `./api/courses.php?search=${search}`,
    type: "GET",
    headers: getAuthHeaders(),
    success: function (res) {
      let data = typeof res === "string" ? JSON.parse(res) : res;
      let html = "";
      data.data.forEach((c) => {
        html += `
                    <div class="col-md-4">
                        <div class="glass-card course-card p-4 position-relative bg-white border rounded shadow-sm">
                            <h5 class="fw-bold mb-2 text-dark">${c.title}</h5>
                            <p class="small text-muted mb-3" style="min-height:40px;">${c.description}</p>
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="badge bg-primary">₹${c.price}</span>
                                <span class="text-warning small"><i class="bi bi-star-fill"></i> ${c.avg_rating}</span>
                            </div>
                            <button class="btn btn-primary w-100 enroll-btn" data-id="${c.course_id}">Enroll Now</button>
                        </div>
                    </div>
                `;
      });
      $("#exploreCoursesGrid").html(
        html ||
          '<div class="col-12"><p class="text-muted text-center">No courses found</p></div>',
      );
    },
  });
}

function loadMyCourses() {
  $("#myCoursesGrid").html(getSkeletonCard() + getSkeletonCard());

  $.ajax({
    url: "./api/my_courses.php",
    type: "GET",
    headers: getAuthHeaders(),
    success: function (res) {
      let data = typeof res === "string" ? JSON.parse(res) : res;
      let html = "";
      data.data.forEach((c) => {
        let progressStr = c.total_lessons > 0 ? c.progress + "%" : "0%";
        html += `
                    <div class="col-md-6">
                        <div class="glass-card course-card p-4 bg-white border rounded shadow-sm">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="fw-bold text-dark">${c.title}</h5>
                                <span class="badge ${c.progress == 100 ? "bg-success" : "bg-primary"}">${progressStr}</span>
                            </div>
                            <div class="progress-container mb-3">
                                <div class="progress-bar-fill" style="width: ${progressStr}"></div>
                            </div>
                            <p class="small text-muted mb-3">${c.completed_lessons} / ${c.total_lessons} lessons completed</p>
                            <button class="btn btn-primary w-100 continue-btn" data-id="${c.course_id}" data-title="${c.title}">Continue Learning</button>
                        </div>
                    </div>
                `;
      });
      $("#myCoursesGrid").html(
        html ||
          '<div class="col-12"><p class="text-muted text-center">You haven\'t enrolled in any courses yet.</p></div>',
      );
    },
  });
}

function loadCourseDetail() {
  $("#lessonsList").html(
    '<div class="placeholder-glow"><span class="placeholder col-12 mb-2 p-4"></span></div>',
  );

  $.ajax({
    url: `./api/course_progress.php?course_id=${currentCourseId}`,
    type: "GET",
    headers: getAuthHeaders(),
    success: function (res) {
      let d = typeof res === "string" ? JSON.parse(res) : res;
      if (d.status) {
        let prog = d.data.progress + "%";
        $("#detailProgressFill").css("width", prog);
        $("#detailProgressText").text(prog + " Completed");
      }
    },
  });

  $.ajax({
    url: `./api/course_lessons.php?course_id=${currentCourseId}`,
    type: "GET",
    headers: getAuthHeaders(),
    success: function (res) {
      let d = typeof res === "string" ? JSON.parse(res) : res;
      studentLessons = d.data || [];
      currentLessonPage = 1;
      renderPaginatedLessons();
    },
  });
}

function renderPaginatedLessons() {
  let totalPages = Math.ceil(studentLessons.length / LESSONS_PER_PAGE);
  let startIdx = (currentLessonPage - 1) * LESSONS_PER_PAGE;
  let endIdx = startIdx + LESSONS_PER_PAGE;
  let pageLessons = studentLessons.slice(startIdx, endIdx);

  let html = "";
  pageLessons.forEach((l) => {
    let isComp = l.is_completed === true || l.is_completed === "t";
    let icon = isComp
      ? '<i class="bi bi-check-circle-fill text-success"></i>'
      : '<i class="bi bi-play-circle text-muted"></i>';
    let btn = !isComp
      ? `<button class="btn btn-sm btn-outline-secondary mark-complete-btn" data-id="${l.lesson_id}">Mark Done</button>`
      : `<button class="btn btn-sm btn-outline-warning mark-undone-btn" data-id="${l.lesson_id}"><i class="bi bi-arrow-counterclockwise"></i> Undone</button>`;

    html += `
            <div class="glass-card p-4 mb-3 border rounded shadow-sm bg-white d-flex flex-column gap-3">
                <div class="d-flex align-items-center justify-content-between border-bottom pb-3">
                    <div class="d-flex align-items-center gap-3">
                        <div class="fs-4">${icon}</div>
                        <h5 class="fw-bold text-dark mb-0">${l.lesson_order}. ${l.title}</h5>
                    </div>                                                    
                    <div>${btn}</div>
                </div>
                <div class="p-3 bg-light rounded text-dark lh-lg border">
                    ${l.content}
                </div>
            </div>
        `;
  });

  if (totalPages > 1) {
    html += `
        <div class="d-flex justify-content-between align-items-center mt-4 p-3 bg-white border rounded shadow-sm">
            <button class="btn btn-outline-primary" id="prevLessonBtn" ${currentLessonPage === 1 ? "disabled" : ""}><i class="bi bi-chevron-left"></i> Previous</button>
            <span class="text-muted fw-bold">Lesson ${currentLessonPage} of ${totalPages}</span>
            <button class="btn btn-primary" id="nextLessonBtn" ${currentLessonPage === totalPages ? "disabled" : ""}>Next <i class="bi bi-chevron-right"></i></button>
        </div>`;
  }

  $("#lessonsList").html(
    html ||
      '<div class="alert alert-info">No lessons available for this course yet.</div>',
  );
}

$(document).ready(function () {
  $("#searchCoursesInput").on("input", function () {
    loadExploreCourses($(this).val());
  });

  $(document).on("click", ".enroll-btn", function () {
    let courseId = $(this).data("id");
    let btn = $(this);
    btn.prop('disabled', true).html('<i class="bi bi-hourglass-split"></i> Processing...');
    $.ajax({
      url: "./api/enroll.php",
      type: "POST",
      headers: getAuthHeaders(),
      data: { course_id: courseId },
      success: function (res) {
        let data = typeof res === "string" ? JSON.parse(res) : res;
        if (data.status) {
          if (data.message.includes("pending") || data.message.includes("approval")) {
            btn.removeClass('btn-primary').addClass('btn-warning').html('<i class="bi bi-hourglass-split"></i> Pending Approval');
            Swal.fire("Request Sent", data.message, "info");
          } else {
            btn.removeClass('btn-primary').addClass('btn-success').html('<i class="bi bi-check-lg"></i> Enrolled');
            Swal.fire("Success", "Enrolled successfully!", "success");
          }
        } else {
          btn.prop('disabled', false).html('Enroll Now');
          Swal.fire("Notice", data.message, "info");
        }
      },
      error: function() {
        btn.prop('disabled', false).html('Enroll Now');
      }
    });
  });

  $(document).on("click", ".continue-btn", function () {
    currentCourseId = $(this).data("id");
    $("#detailCourseTitle").text($(this).data("title"));
    $(".page-view").removeClass("active");
    $("#viewCourseDetail").addClass("active");
    $("#pageTitle").text("Course Details");
    loadCourseDetail();
  });

  $("#backToMyCourses").click(function () {
    $(".page-view").removeClass("active");
    $("#viewMyCourses").addClass("active");
    $("#pageTitle").text("My Learning");
    loadMyCourses();
  });

  $(document).on("click", ".mark-complete-btn", function () {
    let lessonId = $(this).data("id");
    $.ajax({
      url: "./api/mark_complete.php",
      type: "POST",
      headers: getAuthHeaders(),
      data: { lesson_id: lessonId },
      success: function (res) {
        let d = typeof res === "string" ? JSON.parse(res) : res;
        if (d.status) loadCourseDetail();
      },
    });
  });

  $(document).on("click", ".mark-undone-btn", function () {
    let lessonId = $(this).data("id");
    $.ajax({
      url: "./api/mark_undone.php",
      type: "POST",
      headers: getAuthHeaders(),
      data: { lesson_id: lessonId },
      success: function (res) {
        let d = typeof res === "string" ? JSON.parse(res) : res;
        if (d.status) loadCourseDetail();
      },
    });
  });

  $(document).on("click", "#prevLessonBtn", function () {
    if (currentLessonPage > 1) {
      currentLessonPage--;
      renderPaginatedLessons();
    }
  });

  $(document).on("click", "#nextLessonBtn", function () {
    let totalPages = Math.ceil(studentLessons.length / LESSONS_PER_PAGE);
    if (currentLessonPage < totalPages) {
      currentLessonPage++;
      renderPaginatedLessons();
    }
  });

  $(".star-rating i").click(function () {
    let val = parseInt($(this).data("val"));
    $("#ratingStars").data("rating", val);
    $(".star-rating i").each(function () {
      if (parseInt($(this).data("val")) <= val) {
        $(this).removeClass("bi-star").addClass("bi-star-fill");
      } else {
        $(this).removeClass("bi-star-fill").addClass("bi-star");
      }
    });
  });

  $("#submitReviewBtn").click(function () {
    let rating = $("#ratingStars").data("rating");
    let review = $("#reviewText").val();
    if (rating === 0)
      return Swal.fire("Warning", "Select a star rating", "warning");

    $.ajax({
      url: "./api/rate_course.php",
      type: "POST",
      headers: getAuthHeaders(),
      data: { course_id: currentCourseId, rating: rating, review: review },
      success: function (res) {
        let d = typeof res === "string" ? JSON.parse(res) : res;
        if (d.status) {
          Swal.fire("Thank you", "Your review has been saved", "success");
          $("#reviewText").val("");
        }
      },
    });
  });
});
