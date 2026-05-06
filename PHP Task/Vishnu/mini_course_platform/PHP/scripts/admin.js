function loadAdminDashboard() {
    $("#adminCoursesTable").html('<tr><td colspan="5"><div class="placeholder-glow"><span class="placeholder col-12"></span><span class="placeholder col-8"></span></div></td></tr>');

    $.ajax({
        url: './api/course_revenue.php',
        type: 'GET',
        headers: getAuthHeaders(),
        success: function(res) {
            let d = typeof res === 'string' ? JSON.parse(res) : res;
            if(d.status) {
                $("#totalRevenueDisplay").text("₹" + d.data.total_revenue);
            }
        }
    });

    updatePendingBadge();

    $.ajax({
        url: './api/admin_courses.php',
        type: 'GET',
        headers: getAuthHeaders(),
        success: function(res) {
            let d = typeof res === 'string' ? JSON.parse(res) : res;
            let html = '';
            if(d.status && d.data) {
                d.data.forEach(c => {
                    html += `
                        <tr>
                            <td class="fw-semibold text-dark">${c.title}</td>
                            <td class="text-dark">₹${c.price}</td>
                            <td><span class="badge bg-secondary">${c.student_count}</span></td>
                            <td><span class="badge bg-secondary">${c.lesson_count}</span></td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary add-lesson-btn me-1" data-id="${c.course_id}" data-title="${c.title}">
                                    <i class="bi bi-plus-circle"></i> Lesson
                                </button>
                                <button class="btn btn-sm btn-outline-secondary manage-lessons-btn me-1" data-id="${c.course_id}">
                                    <i class="bi bi-list-task"></i> Manage Lessons
                                </button>
                                <button class="btn btn-sm btn-outline-info edit-course-btn me-1" data-id="${c.course_id}" data-title="${c.title}" data-desc="${c.description || ''}" data-price="${c.price}">
                                    <i class="bi bi-pencil"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-outline-danger delete-course-btn" data-id="${c.course_id}" data-students="${c.student_count}">
                                    <i class="bi bi-trash"></i> Delete
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }
            $("#adminCoursesTable").html(html || '<tr><td colspan="5" class="text-center text-muted">No courses found</td></tr>');
        }
    });
}

$(document).ready(function() {
    $("#saveCourseBtn").click(function() {
        let title = $("#newCourseTitle").val();
        let desc = $("#newCourseDesc").val();
        let price = $("#newCoursePrice").val();
        let auto_enroll = $("#newCourseAutoEnroll").is(':checked') ? '1' : '0';
        if(!title) return Swal.fire("Warning", "Title is required", "warning");

        $.ajax({
            url: './api/create_course.php',
            type: 'POST',
            headers: getAuthHeaders(),
            data: { title, description: desc, price, auto_enroll },
            success: function(res) {
                let d = typeof res === 'string' ? JSON.parse(res) : res;
                if(d.status) {
                    bootstrap.Modal.getInstance(document.getElementById('createCourseModal')).hide();
                    $("#newCourseTitle").val(''); $("#newCourseDesc").val(''); $("#newCoursePrice").val('');
                    $("#newCourseAutoEnroll").prop('checked', true);
                    loadAdminDashboard();
                    Swal.fire("Created", "Course added successfully", "success");
                }
            }
        });
    });

    $(document).on('click', '.edit-course-btn', function() {
        let id = $(this).data('id');
        let title = $(this).data('title');
        let desc = $(this).data('desc');
        let price = $(this).data('price');

        $("#editCourseId").val(id);
        $("#editCourseTitle").val(title);
        $("#editCourseDesc").val(desc);
        $("#editCoursePrice").val(price);
        $("#editCourseAutoEnroll").prop('checked', true);

        $.ajax({
            url: './api/enrollment_settings.php',
            type: 'GET',
            headers: getAuthHeaders(),
            success: function(res) {
                let d = typeof res === 'string' ? JSON.parse(res) : res;
                if(d.status && d.data && d.data.courses) {
                    let course = d.data.courses.find(c => c.course_id == id);
                    if(course) {
                        $("#editCourseAutoEnroll").prop('checked', course.auto_enroll);
                    }
                }
            }
        });

        let modal = new bootstrap.Modal(document.getElementById('editCourseModal'));
        modal.show();
    });

    $("#updateCourseBtn").click(function() {
        let course_id = $("#editCourseId").val();
        let title = $("#editCourseTitle").val();
        let desc = $("#editCourseDesc").val();
        let price = $("#editCoursePrice").val();
        let auto_enroll = $("#editCourseAutoEnroll").is(':checked') ? '1' : '0';

        if(!title) return Swal.fire("Warning", "Title is required", "warning");

        $.ajax({
            url: './api/edit_course.php',
            type: 'POST',
            headers: getAuthHeaders(),
            data: { course_id, title, description: desc, price, auto_enroll },
            success: function(res) {
                let d = typeof res === 'string' ? JSON.parse(res) : res;
                if(d.status) {
                    bootstrap.Modal.getInstance(document.getElementById('editCourseModal')).hide();
                    loadAdminDashboard();
                    Swal.fire("Updated", "Course updated successfully", "success");
                } else {
                    Swal.fire("Error", d.message, "error");
                }
            }
        });
    });

    $(document).on('click', '.add-lesson-btn', function() {
        $("#lessonCourseId").val($(this).data('id'));
        let modal = new bootstrap.Modal(document.getElementById('addLessonModal'));
        modal.show();
    });

    $("#saveLessonBtn").click(function() {
        let course_id = $("#lessonCourseId").val();
        let title = $("#newLessonTitle").val();
        let content = $("#newLessonContent").val();
        let order = $("#newLessonOrder").val() || 1;

        if(!title) return Swal.fire("Warning", "Title is required", "warning");

        $.ajax({
            url: './api/add_lesson.php',
            type: 'POST',
            headers: getAuthHeaders(),
            data: { course_id, title, content, lesson_order: order },
            success: function(res) {
                let d = typeof res === 'string' ? JSON.parse(res) : res;
                if(d.status) {
                    bootstrap.Modal.getInstance(document.getElementById('addLessonModal')).hide();
                    $("#newLessonTitle").val(''); $("#newLessonContent").val(''); $("#newLessonOrder").val('');
                    loadAdminDashboard();
                    Swal.fire("Added", "Lesson added successfully", "success");
                } else {
                    Swal.fire("Error", d.message, "error");
                }
            }
        });
    });

    $(document).on('click', '.delete-course-btn', function() {
        let courseId = $(this).data('id');
        let studentCount = parseInt($(this).data('students')) || 0;

        if (studentCount > 0) {
            Swal.fire({
                title: 'Cannot Delete',
                html: `<div class="text-start">
                    <p>This course has <strong>${studentCount} enrolled student(s)</strong>.</p>
                    <p class="text-muted small mb-0">You must remove all student enrollments before deleting this course.</p>
                </div>`,
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        Swal.fire({
            title: 'Are you sure?',
            text: "This will permanently delete the course and all its lessons.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: './api/delete_course.php',
                    type: 'POST',
                    headers: getAuthHeaders(),
                    data: { course_id: courseId },
                    success: function(res) {
                        let d = typeof res === 'string' ? JSON.parse(res) : res;
                        if(d.status) {
                            loadAdminDashboard();
                            Swal.fire('Deleted!', 'The course has been deleted.', 'success');
                        } else {
                            Swal.fire('Error', d.message, 'error');
                        }
                    }
                });
            }
        });
    });


    $(document).on('click', '.manage-lessons-btn', function() {
        let courseId = $(this).data('id');
        loadAdminLessons(courseId);
        let modal = new bootstrap.Modal(document.getElementById('manageLessonsModal'));
        modal.show();
    });

    function loadAdminLessons(courseId) {
        $("#adminLessonsTable").html('<tr><td colspan="3"><div class="placeholder-glow"><span class="placeholder col-12"></span></div></td></tr>');
        $.ajax({
            url: `./api/course_lessons.php?course_id=${courseId}`,
            type: 'GET',
            headers: getAuthHeaders(),
            success: function(res) {
                let d = typeof res === 'string' ? JSON.parse(res) : res;
                let html = '';
                if(d.status && d.data && d.data.length > 0) {
                    d.data.forEach(l => {
                        html += `
                            <tr>
                                <td>${l.lesson_order}</td>
                                <td class="fw-semibold">${l.title}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-info edit-lesson-btn me-1"
                                            data-id="${l.lesson_id}"
                                            data-title="${l.title}"
                                            data-content="${l.content}"
                                            data-order="${l.lesson_order}"
                                            data-course="${l.course_id}">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger delete-lesson-btn"
                                            data-id="${l.lesson_id}" data-course="${l.course_id}">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    });
                } else {
                    html = '<tr><td colspan="3" class="text-center text-muted">No lessons found</td></tr>';
                }
                $("#adminLessonsTable").html(html);
            }
        });
    }

    $(document).on('click', '.edit-lesson-btn', function() {
        $("#editLessonId").val($(this).data('id'));
        $("#editLessonTitle").val($(this).data('title'));
        $("#editLessonContent").val($(this).data('content'));
        $("#editLessonOrder").val($(this).data('order'));

        let modal = new bootstrap.Modal(document.getElementById('editLessonModal'));
        modal.show();
    });

    $("#updateLessonBtn").click(function() {
        let lesson_id = $("#editLessonId").val();
        let title = $("#editLessonTitle").val();
        let content = $("#editLessonContent").val();
        let order = $("#editLessonOrder").val();

        if(!title) return Swal.fire("Warning", "Title is required", "warning");

        $.ajax({
            url: './api/edit_lesson.php',
            type: 'POST',
            headers: getAuthHeaders(),
            data: { lesson_id, title, content, lesson_order: order },
            success: function(res) {
                let d = typeof res === 'string' ? JSON.parse(res) : res;
                if(d.status) {
                    bootstrap.Modal.getInstance(document.getElementById('editLessonModal')).hide();


                    let courseId = $(".edit-lesson-btn").first().data("course") || $(".delete-lesson-btn").first().data("course");
                    if(courseId) loadAdminLessons(courseId);

                    Swal.fire("Updated", "Lesson updated successfully", "success");
                } else {
                    Swal.fire("Error", d.message, "error");
                }
            }
        });
    });

    $(document).on('click', '.delete-lesson-btn', function() {
        let lessonId = $(this).data('id');
        let courseId = $(this).data('course');

        Swal.fire({
            title: 'Delete this lesson?',
            text: "This cannot be undone.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: './api/delete_lesson.php',
                    type: 'POST',
                    headers: getAuthHeaders(),
                    data: { lesson_id: lessonId },
                    success: function(res) {
                        let d = typeof res === 'string' ? JSON.parse(res) : res;
                        if(d.status) {
                            loadAdminLessons(courseId);
                            Swal.fire('Deleted!', 'Lesson removed.', 'success');
                        } else {
                            Swal.fire('Error', d.message, 'error');
                        }
                    }
                });
            }
        });
    });


    $(document).on('click', '.approve-enrollment-btn', function() {
        let eid = $(this).data('id');
        $.ajax({
            url: './api/approve_enrollment.php',
            type: 'POST',
            headers: getAuthHeaders(),
            data: { enrollment_id: eid },
            success: function(res) {
                let d = typeof res === 'string' ? JSON.parse(res) : res;
                if(d.status) {
                    loadPendingEnrollments();
                    updatePendingBadge();
                    Swal.fire('Approved!', 'Student has been enrolled.', 'success');
                } else {
                    Swal.fire('Error', d.message, 'error');
                }
            }
        });
    });

    $(document).on('click', '.reject-enrollment-btn', function() {
        let eid = $(this).data('id');
        Swal.fire({
            title: 'Reject this enrollment?',
            text: "The student will not be enrolled.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, reject!'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: './api/reject_enrollment.php',
                    type: 'POST',
                    headers: getAuthHeaders(),
                    data: { enrollment_id: eid },
                    success: function(res) {
                        let d = typeof res === 'string' ? JSON.parse(res) : res;
                        if(d.status) {
                            loadPendingEnrollments();
                            updatePendingBadge();
                            Swal.fire('Rejected!', 'Enrollment request removed.', 'success');
                        } else {
                            Swal.fire('Error', d.message, 'error');
                        }
                    }
                });
            }
        });
    });

    $(document).on('change', '#globalAutoEnrollSwitch', function() {
        let isOn = $(this).is(':checked');
        $.ajax({
            url: './api/update_global_enroll.php',
            type: 'POST',
            headers: getAuthHeaders(),
            data: { auto_enroll: isOn ? '1' : '0' },
            success: function(res) {
                let d = typeof res === 'string' ? JSON.parse(res) : res;
                if(d.status) {
                    loadEnrollmentSettings();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: isOn ? 'Auto-enroll enabled globally' : 'Auto-enroll disabled globally',
                        showConfirmButton: false,
                        timer: 2000
                    });
                }
            }
        });
    });

    $(document).on('change', '.course-auto-enroll-switch', function() {
        let courseId = $(this).data('id');
        let isOn = $(this).is(':checked');
        $.ajax({
            url: './api/update_course_enroll.php',
            type: 'POST',
            headers: getAuthHeaders(),
            data: { course_id: courseId, auto_enroll: isOn ? '1' : '0' },
            success: function(res) {
                let d = typeof res === 'string' ? JSON.parse(res) : res;
                if(d.status) {
                    loadEnrollmentSettings();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: isOn ? 'Auto-enroll enabled for this course' : 'Approval required for this course',
                        showConfirmButton: false,
                        timer: 2000
                    });
                }
            }
        });
    });
});


function loadAllStudents() {
    $("#allStudentsTable").html('<tr><td colspan="5"><div class="placeholder-glow"><span class="placeholder col-12"></span><span class="placeholder col-8"></span></div></td></tr>');

    $.ajax({
        url: './api/all_students.php',
        type: 'GET',
        headers: getAuthHeaders(),
        success: function(res) {
            let d = typeof res === 'string' ? JSON.parse(res) : res;
            let html = '';
            if(d.status && d.data && d.data.length > 0) {
                $("#totalStudentCount").text(d.data.length);
                d.data.forEach((s, i) => {
                    let joinDate = new Date(s.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
                    html += `
                        <tr>
                            <td>${i + 1}</td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <div class="avatar" style="width:36px;height:36px;font-size:0.9rem;">${s.name.charAt(0).toUpperCase()}</div>
                                    <span class="fw-semibold text-dark">${s.name}</span>
                                </div>
                            </td>
                            <td class="text-muted">${s.email}</td>
                            <td><span class="badge bg-primary">${s.enrolled_courses}</span></td>
                            <td class="text-muted small">${joinDate}</td>
                        </tr>
                    `;
                });
            } else {
                $("#totalStudentCount").text('0');
                html = '<tr><td colspan="5" class="text-center text-muted">No students registered yet</td></tr>';
            }
            $("#allStudentsTable").html(html);
        }
    });
}


function loadPendingEnrollments() {
    $("#pendingEnrollmentsTable").html('<tr><td colspan="5"><div class="placeholder-glow"><span class="placeholder col-12"></span><span class="placeholder col-8"></span></div></td></tr>');

    $.ajax({
        url: './api/pending_enrollments.php',
        type: 'GET',
        headers: getAuthHeaders(),
        success: function(res) {
            let d = typeof res === 'string' ? JSON.parse(res) : res;
            let html = '';
            if(d.status && d.data && d.data.length > 0) {
                $("#pendingCount").text(d.data.length);
                d.data.forEach(e => {
                    let reqDate = new Date(e.enrolled_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    html += `
                        <tr>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <div class="avatar" style="width:36px;height:36px;font-size:0.9rem;">${e.student_name.charAt(0).toUpperCase()}</div>
                                    <span class="fw-semibold text-dark">${e.student_name}</span>
                                </div>
                            </td>
                            <td class="text-muted">${e.student_email}</td>
                            <td><span class="badge bg-secondary">${e.course_title}</span></td>
                            <td class="text-muted small">${reqDate}</td>
                            <td>
                                <button class="btn btn-sm btn-success approve-enrollment-btn me-1" data-id="${e.enrollment_id}">
                                    <i class="bi bi-check-lg"></i> Approve
                                </button>
                                <button class="btn btn-sm btn-outline-danger reject-enrollment-btn" data-id="${e.enrollment_id}">
                                    <i class="bi bi-x-lg"></i> Reject
                                </button>
                            </td>
                        </tr>
                    `;
                });
            } else {
                $("#pendingCount").text('0');
                html = '<tr><td colspan="5" class="text-center text-muted py-4"><i class="bi bi-check-circle fs-3 d-block mb-2 text-success"></i>No pending enrollment requests</td></tr>';
            }
            $("#pendingEnrollmentsTable").html(html);
        }
    });
}


function loadEnrollmentSettings() {
    $("#courseEnrollSettingsList").html('<div class="placeholder-glow"><span class="placeholder col-12 mb-2 p-4"></span></div>');

    $.ajax({
        url: './api/enrollment_settings.php',
        type: 'GET',
        headers: getAuthHeaders(),
        success: function(res) {
            let d = typeof res === 'string' ? JSON.parse(res) : res;
            if(d.status && d.data) {
                $("#globalAutoEnrollSwitch").prop('checked', d.data.global_auto_enroll);

                let html = '';
                if(d.data.courses && d.data.courses.length > 0) {
                    d.data.courses.forEach(c => {
                        let checked = c.auto_enroll ? 'checked' : '';

                        html += `
                            <div class="glass-card p-3 mb-3 d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="fw-bold mb-1 text-dark">${c.title}</h6>
                                    <div class="d-flex align-items-center">
                                        <span class="small ${c.auto_enroll ? 'text-success' : 'text-danger'}">
                                            <i class="bi ${c.auto_enroll ? 'bi-unlock' : 'bi-lock'}"></i>
                                            ${c.auto_enroll ? 'Auto-enroll enabled' : 'Approval required'}
                                        </span>
                                    </div>
                                </div>
                                <div class="form-check form-switch fs-5">
                                    <input class="form-check-input course-auto-enroll-switch" type="checkbox" role="switch" data-id="${c.course_id}" ${checked} style="cursor: pointer;">
                                </div>
                            </div>
                        `;
                    });
                } else {
                    html = '<div class="text-center text-muted p-4">No courses created yet</div>';
                }
                $("#courseEnrollSettingsList").html(html);
            }
        }
    });
}


function updatePendingBadge() {
    $.ajax({
        url: './api/pending_enrollments.php',
        type: 'GET',
        headers: getAuthHeaders(),
        success: function(res) {
            let d = typeof res === 'string' ? JSON.parse(res) : res;
            if(d.status && d.data) {
                let count = d.data.length;
                if(count > 0) {
                    $("#pendingBadge").text(count).show();
                } else {
                    $("#pendingBadge").hide();
                }
            }
        }
    });
}

