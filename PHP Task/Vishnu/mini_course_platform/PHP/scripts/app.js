$(document).ready(function() {
    if (token) {
        $.ajax({
            url: './api/get_current_user.php',
            type: 'GET',
            headers: getAuthHeaders(),
            success: function(res) {
                let data = typeof res === 'string' ? JSON.parse(res) : res;
                if(data.status && data.data && data.data.user) {
                    user = data.data.user;
                    showDashboard();
                } else {
                    $("#authSection").show();
                    $("#dashboardSection").hide();
                }
            },
            error: function() {
                $("#authSection").show();
                $("#dashboardSection").hide();
            }
        });
    } else {
        $("#authSection").show();
        $("#dashboardSection").hide();
    }

    $("#logoutBtn").click(function() {
        $.ajax({
            url: './api/logout.php',
            type: 'POST',
            headers: getAuthHeaders(),
            success: function() {
                localStorage.removeItem('token');
                location.reload();
            }
        });
    });

    $(document).on('click', '.nav-link[data-view]', function() {
        $(".nav-link").removeClass('active');
        $(this).addClass('active');
        let view = $(this).data('view');
        let title = $(this).data('title');

        $("#pageTitle").text(title);
        $(".page-view").removeClass('active');
        $("#view" + view).addClass('active');

        if(view === 'Explore') loadExploreCourses();
        if(view === 'MyCourses') loadMyCourses();
        if(view === 'AdminDashboard') loadAdminDashboard();
        if(view === 'AllStudents') loadAllStudents();
        if(view === 'PendingEnrollments') loadPendingEnrollments();
        if(view === 'EnrollmentSettings') loadEnrollmentSettings();


        let sidebarEl = document.getElementById('sidebarMenu');
        if (sidebarEl) {
            let bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(sidebarEl);
            bsOffcanvas.hide();
        }
    });

    $("#userProfileBtn").click(function() {
        if(user) {
            $("#modalNameDisplay").text(user.name);
            $("#modalRoleDisplay").text(user.role);
            $("#modalEmailDisplay").text(user.email);
            $("#modalAvatarDisplay").text(user.name.charAt(0).toUpperCase());

            $("#profileName").val(user.name);
            $("#profileEmail").val(user.email);
            $("#profilePassword").val('');


            var firstTab = new bootstrap.Tab(document.getElementById('details-tab'));
            firstTab.show();

            let modal = new bootstrap.Modal(document.getElementById('updateProfileModal'));
            modal.show();
        }
    });

    $("#saveProfileBtn").click(function() {
        let name = $("#profileName").val();
        let email = $("#profileEmail").val();
        let password = $("#profilePassword").val();

        if(!name || !email) return Swal.fire("Error", "Name and Email cannot be empty", "error");

        $.ajax({
            url: './api/update_profile.php',
            type: 'POST',
            headers: getAuthHeaders(),
            data: { name: name, email: email, password: password },
            success: function(res) {
                let d = typeof res === 'string' ? JSON.parse(res) : res;
                if(d.status) {
                    user = d.data.user;
                    $("#userNameDisplay").text(user.name);
                    $("#userAvatar").text(user.name.charAt(0).toUpperCase());
                    if ($("#studentGreeting").length) {
                        $("#studentGreeting").text("Hi " + user.name + "!");
                    }


                    $("#modalNameDisplay").text(user.name);
                    $("#modalEmailDisplay").text(user.email);
                    $("#modalAvatarDisplay").text(user.name.charAt(0).toUpperCase());


                    $("#profilePassword").val('');

                    bootstrap.Modal.getInstance(document.getElementById('updateProfileModal')).hide();
                    Swal.fire("Updated", "Profile updated successfully", "success");
                } else {
                    Swal.fire("Error", d.message, "error");
                }
            }
        });
    });
});

function showDashboard() {
    $("#authSection").hide();
    $("#dashboardSection").show();

    $("#userNameDisplay").text(user.name);
    $("#userRoleDisplay").text(user.role);
    $("#userAvatar").text(user.name.charAt(0).toUpperCase());
    if ($("#studentGreeting").length) {
        $("#studentGreeting").text("Hi " + user.name + "!");
    }

    let navHtml = '';
    if (user.role === 'admin') {
        navHtml = `
            <div class="nav-link active" data-view="AdminDashboard" data-title="Admin Dashboard"><i class="bi bi-speedometer2"></i> Dashboard</div>
            <div class="nav-link" data-view="AllStudents" data-title="All Students"><i class="bi bi-people"></i> Students</div>
            <div class="nav-link" data-view="PendingEnrollments" data-title="Pending Enrollments"><i class="bi bi-hourglass-split"></i> Pending <span class="badge bg-danger ms-auto" id="pendingBadge" style="display:none;">0</span></div>
            <div class="nav-link" data-view="EnrollmentSettings" data-title="Enrollment Settings"><i class="bi bi-gear"></i> Settings</div>
        `;
    } else {
        navHtml = `
            <div class="nav-link active" data-view="Explore" data-title="Explore Courses"><i class="bi bi-search"></i> Explore</div>
            <div class="nav-link" data-view="MyCourses" data-title="My Learning"><i class="bi bi-journal-bookmark"></i> My Courses</div>
        `;
    }
    $("#navLinks").html(navHtml);
    $("#navLinks .nav-link").first().click();
}
