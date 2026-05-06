$(document).ready(function() {
    $("#loginBtn").click(function() {
        let email = $("#loginEmail").val();
        let password = $("#loginPassword").val();
        if(!email || !password) return Swal.fire("Error", "Fill all fields", "warning");

        $.post('./api/login.php', {email, password}, function(res) {
            let data = typeof res === 'string' ? JSON.parse(res) : res;
            if(data.status) {
                token = data.data.token;
                user = data.data.user;
                localStorage.setItem('token', token);
                showDashboard();
            } else {
                Swal.fire("Login Failed", data.message, "error");
            }
        });
    });

    $("#registerBtn").click(function() {
        let name = $("#regName").val();
        let email = $("#regEmail").val();
        let password = $("#regPassword").val();
        let role = "student";
        if(!name || !email || !password) return Swal.fire("Error", "Fill all fields", "warning");

        $.ajax({
            url: './api/register.php',
            type: 'POST',
            headers: getAuthHeaders(),
            data: {name, email, password, role},
            success: function(res) {
                let data = typeof res === 'string' ? JSON.parse(res) : res;
                if(data.status) {
                    Swal.fire("Success", "Student registered successfully!", "success");
                    bootstrap.Modal.getInstance(document.getElementById('registerStudentModal')).hide();
                    $("#regName").val('');
                    $("#regEmail").val('');
                    $("#regPassword").val('');
                } else {
                    Swal.fire("Error", data.message, "error");
                }
            }
        });
    });
});
