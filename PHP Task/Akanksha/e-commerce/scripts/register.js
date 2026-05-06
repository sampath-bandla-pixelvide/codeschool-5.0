function register() {
    let firstName = $("#firstName").val();
    let lastName = $("#lastName").val();
    let email = $("#email").val();
    let phone = $("#phone").val();
    let password = $("#password").val();
    let confirmPassword = $("#confirmPassword").val();

    // validation

    $.ajax({
        method: "POST",
        url: "/api/register.php",
        data: {
            firstName,
            lastName,
            email,
            phone,
            password,
            confirmPassword
        },
        success: function (res) {
            let response = JSON.parse(res);
            if (response.status == false) {
                Swal.fire("Error", response.message, "warning");
                Object.keys(response.data).forEach(key => {
                    $(`#${key}Error`).text(response.data[key]);
                });
            } else {
                window.location.href = "/index.html?registered=true";
            }
        },
        error: function (err) {
            Swal.fire("Error", err.message, "error");
            console.log(err);
        }
    })
}