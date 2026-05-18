$(document).ready(() => {
  
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("userId");

  if (!token) {
    window.location.replace("./index.html");
    return;
  }

  // Load User Profile Data
  function loadUserProfile() {
    $.ajax({
      url: `/api/getUser.php?userId=${userId}`,
      type: "GET",
      dataType: "json",
      success: function (res) {
        if (res.status) {
          const u = res.data;
          const avatarUrl = u.avatar ? u.avatar.replace('../assets/', '/') : `https://ui-avatars.com/api/?name=${u.first_name}+${u.last_name}&background=random`;
          $("#name").text(u.first_name);
          $("#topNavAvatar").attr("src", avatarUrl);

          $("#profileAvatar").attr("src", avatarUrl);
          $("#profileName").text(`${u.first_name} ${u.last_name}`);
          $("#profileRole").text(u.role === 'admin' ? 'Administrator' : 'User');
          $("#profileEmail").text(u.email);
          $("#profilePhone").text(u.phone);
          $("#profileDob").text(u.dob);

          const hour = new Date().getHours();
          let greeting = 'Good Evening';
          if (hour < 12) greeting = 'Good Morning';
          else if (hour < 17) greeting = 'Good Afternoon';
          $("#headerGreeting").text(`${greeting}, ${u.first_name}!`);
        }
      }
    });
  }
  loadUserProfile();

  if (role === 'admin') {
    $(".admin-only").removeClass("d-none");
  } else {
    $(".user-only").removeClass("d-none");
  }

  function navigateTo(target) {
    $(".nav-item").removeClass("active");
    $(`.nav-item[data-target="${target}"]`).addClass("active");

    $(".section-container").removeClass("active");
    $("#" + target).addClass("active");

    let title = "Dashboard";
    if (target === 'homeSection') title = "Overview";
    if (target === 'allProductsSection') title = "Explore Products";
    if (target === 'addProductSection') title = "New Product";
    if (target === 'profileSection') title = "My Profile";
    if (target === 'productDetailSection') title = "Product Details";
    $("#pageTitle").text(title);

    if (target === "allProductsSection") {
      getProducts();
    }
    if (target === "feedbacksSection") {
      loadAllFeedbacks();
    }
  }

  $(".nav-item, .nav-item-trigger").on("click", function () {
    navigateTo($(this).data("target"));
    if ($(window).width() <= 768) {
      $(".sidebar").removeClass("active");
      $("#sidebarOverlay").addClass("d-none");
    }
  });

  $("#sidebarToggle").on("click", function (e) {
    e.stopPropagation();
    $(".sidebar").toggleClass("active");
    if ($(".sidebar").hasClass("active")) {
      $("#sidebarOverlay").removeClass("d-none");
    } else {
      $("#sidebarOverlay").addClass("d-none");
    }
  });

  $("#sidebarClose, #sidebarOverlay").on("click", function () {
    $(".sidebar").removeClass("active");
    $("#sidebarOverlay").addClass("d-none");
  });

  $("#uploadForm").submit((e) => {
    e.preventDefault();

    const title = $("#title").val().trim();
    const description = $("#description").val().trim();
    const endTime = $("#endTime").val();
    const image = $("#image")[0].files[0];

    if (!title || !description || !endTime || !image) {
      Swal.fire({ icon: "error", text: "All fields are required" });
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(image.type)) {
      Swal.fire({ icon: "error", text: "Only JPG, PNG, WEBP allowed" });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("endTime", endTime);
    formData.append("image", image);
    formData.append("userId", userId);

    $.ajax({
      url: "/api/uploadProduct.php",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      dataType: "json",
      beforeSend: () => Swal.fire({ title: "Uploading...", allowOutsideClick: false, didOpen: () => Swal.showLoading() }),
      success: (response) => {
        Swal.close();
        if (response.status) {
          Swal.fire({ icon: "success", text: response.message });
          $("#uploadForm")[0].reset();
          // Switch to my products view after upload
          $('[data-target="myProductsSection"]').click();
        } else {
          Swal.fire({ icon: "error", text: response.message });
        }
      },
      error: () => { Swal.close(); Swal.fire({ icon: "error", text: "Upload failed" }); }
    });
  });

  function getProducts() {
    $.ajax({
      url: "/api/getProducts.php",
      type: "GET",
      dataType: "json",
      success: function (response) {
        let allCards = "";
        let myCards = "";
        let allCount = 0;
        let myCount = 0;

        if (response.status && response.data.length > 0) {
          response.data.forEach((product) => {
            const isMyProduct = String(product.created_by) === String(userId);

            let actionButtons = `
              <div class="mt-auto pt-3 border-top border-light">
                <button class="btn btn-light w-100 fw-bold viewProductBtn text-primary" data-id="${product.id}" data-title="${product.title}" data-desc="${product.description}" data-end="${product.feedback_end_time}" data-img="${product.image_path.replace('../assets/', '/')}">View Details</button>
              </div>
            `;

            const cardHtml = `
              <div class="col-md-6 col-lg-4">
                  <div class="card h-100">
                      <div style="height: 220px; width: 100%; background: #f8f9fa; display: flex; justify-content: center; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05);">
                          <img src="${product.image_path.replace('../assets/', '/')}" class="card-img-top" style="max-height: 100%; max-width: 100%; object-fit: contain;" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                      </div>
                      <div class="card-body p-4 d-flex flex-column">
                          <h4 class="fw-bold mb-2 text-truncate">${product.title}</h4>
                          <p class="text-secondary small mb-3 flex-grow-1" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical; overflow:hidden;">${product.description}</p>
                          <div class="d-flex align-items-center gap-2 mb-3 text-danger fw-semibold small">
                            <i class="bi bi-hourglass-split"></i> ${formatDate(product.feedback_end_time)}
                          </div>
                          ${actionButtons}
                      </div>
                  </div>
              </div>
            `;

            allCards += cardHtml;
            allCount++;
          });
        }

        $("#productCount").text(`${allCount} Product${allCount !== 1 ? 's' : ''}`);

        if (allCount > 0) {
          $("#allProductsContainer").html(allCards);
          $("#allProductsEmpty").removeClass("d-flex").addClass("d-none");
        } else {
          $("#allProductsContainer").html("");
          $("#allProductsEmpty").removeClass("d-none").addClass("d-flex");
        }
      },
      error: function () {
        Swal.fire({ icon: "error", text: "Failed to fetch products" });
      },
    });
  }


  $(document).on("click", ".viewProductBtn", function (e) {
    e.stopPropagation();
    const id = $(this).data("id");

    $("#detailTitle").text($(this).data("title"));
    $("#detailDesc").text($(this).data("desc"));
    $("#detailEnds").text(formatDate($(this).data("end")));
    $("#detailImg").attr("src", $(this).data("img"));
    $("#detailProductId").val(id);

    $("#feedbackText").val("");
    $("#ratingValue").val(0);
    $(".star").removeClass("text-warning").addClass("text-muted");

    if (role === 'admin') {
      $("#feedbackHeading").text("All User Feedbacks");
    } else {
      $("#feedbackHeading").text("Your Feedbacks");
    }

    loadFeedbacks(id);
    navigateTo("productDetailSection");
  });

  $('.star').on('click', function () {
    const val = $(this).data('val');
    $('#ratingValue').val(val);
    $('.star').removeClass('text-warning').addClass('text-muted');
    $('.star').each(function () {
      if ($(this).data('val') <= val) {
        $(this).removeClass('text-muted').addClass('text-warning');
      }
    });
  });

  $("#feedbackForm").submit(function (e) {
    e.preventDefault();
    const productId = $("#detailProductId").val();
    const rating = $('#ratingValue').val();
    const feedback = $('#feedbackText').val();

    if (!rating || rating < 1 || rating > 5) {
      Swal.fire({ icon: 'warning', text: 'Please select a star rating' });
      return;
    }
    if (!feedback || feedback.trim().length < 5) {
      Swal.fire({ icon: 'warning', text: 'Feedback must be at least 5 characters' });
      return;
    }

    $.ajax({
      url: '/api/addFeedback.php',
      type: 'POST',
      data: { productId: productId, userId: userId, rating: rating, feedback: feedback.trim() },
      dataType: 'json',
      success: function (response) {
        if (response.status) {
          Swal.fire({ icon: 'success', text: response.message, timer: 1500, showConfirmButton: false });
          $("#feedbackText").val("");
          $("#ratingValue").val(0);
          $(".star").removeClass("text-warning").addClass("text-muted");
          loadFeedbacks(productId);
        } else {
          Swal.fire({ icon: 'error', text: response.message });
        }
      },
      error: function () { Swal.fire({ icon: 'error', text: 'Submission failed' }); }
    });
  });

  $(document).on("click", ".deleteBtn", function (e) {
    e.stopPropagation();
    const productId = $(this).data("id");

    Swal.fire({
      title: "Are you sure?",
      text: "This product will be deleted permanently",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: "/api/deleteProduct.php",
          type: "POST",
          data: { productId: productId },
          dataType: "json",
          success: function (response) {
            if (response.status) {
              Swal.fire({ icon: "success", text: response.message });
              getProducts();
            } else {
              Swal.fire({ icon: "error", text: response.message });
            }
          },
          error: function () { Swal.fire({ icon: "error", text: "Delete failed" }); },
        });
      }
    });
  });

  function loadFeedbacks(productId) {
    $.ajax({
      url: "/api/getFeedbacks.php",
      type: "POST",
      data: { productId: productId, userId: userId },
      dataType: "json",
      success: function (response) {
        if (!response.status || !response.data || response.data.length === 0) {
          $("#feedbackList").html("");
          $("#noFeedbackMsg").removeClass("d-none");
          return;
        }

        $("#noFeedbackMsg").addClass("d-none");
        let feedbackHtml = "";
        const ts = new Date().getTime();
        response.data.forEach((feedback) => {
          const uAvatar = feedback.avatar ? feedback.avatar.replace('../assets/', '/') + `?t=${ts}` : `https://ui-avatars.com/api/?name=${feedback.first_name}&background=random`;
          feedbackHtml += `
            <div class="feedback-item">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div class="d-flex align-items-center gap-3">
                        <img src="${uAvatar}" class="rounded-circle avatar-img" style="width:40px; height:40px; min-width:40px; object-fit:cover;">
                        <div>
                            <h6 class="fw-bold m-0">${feedback.first_name}</h6>
                            <small class="text-muted"><i class="bi bi-calendar3 me-1"></i>${feedback.created_at ? formatDate(feedback.created_at) : formatDate(new Date().toISOString())}</small>
                        </div>
                    </div>
                    <div class="star-rating fs-5">${"★".repeat(feedback.rating)}${"☆".repeat(5 - feedback.rating)}</div>
                </div>
                <p class="mb-0 text-dark ps-2 border-start border-2 border-light">${feedback.feedback}</p>
            </div>
          `;
        });
        $("#feedbackList").html(feedbackHtml);
      }
    });
  }
  $("#avatarUpload").on("change", function () {
    const file = this.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', userId);

    $.ajax({
      url: '/api/updateAvatar.php',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      beforeSend: () => Swal.fire({ title: "Uploading...", didOpen: () => Swal.showLoading() }),
      success: function (res) {
        res = typeof res === 'string' ? JSON.parse(res) : res;
        Swal.close();
        if (res.status) {
          Swal.fire({ icon: 'success', text: 'Avatar updated!', timer: 1500 });
          loadUserProfile();
          // Also refresh active feedbacks
          const activeTarget = $(".nav-item.active").data("target");
          if (activeTarget === "feedbacksSection") {
            loadAllFeedbacks();
          } else if (activeTarget === "productDetailSection") {
            loadFeedbacks($("#detailProductId").val());
          }
        } else {
          Swal.fire({ icon: 'error', text: res.message });
        }
      }
    });
  });

  $("#updatePasswordForm").submit(function (e) {
    e.preventDefault();
    const pwd = $("#newPassword").val();
    const conf = $("#confirmNewPassword").val();

    if (pwd !== conf) {
      Swal.fire({ icon: 'error', text: 'Passwords do not match' });
      return;
    }

    // Get email from profile DOM
    const email = $("#profileEmail").text();

    $.ajax({
      url: '/api/updatedPassword.php',
      type: 'POST',
      data: { email: email, password: pwd, confirmPassword: conf },
      success: function (res) {
        res = typeof res === 'string' ? JSON.parse(res) : res;
        if (res.status) {
          Swal.fire({ icon: 'success', text: 'Password updated successfully' });
          $("#updatePasswordForm")[0].reset();
        } else {
          Swal.fire({ icon: 'error', text: res.message });
        }
      }
    });
  });

  $("#logout").on("click", () => {
    Swal.fire({
      title: "Logout?",
      text: "You will be redirected to login page",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: "/api/logout.php",
          type: "POST",
          data: { token: token },
          dataType: "json",
          success: function (response) {
            localStorage.clear();
            window.location.replace("./index.html");
          },
          error: function () { Swal.fire({ icon: "error", text: "Logout failed" }); },
        });
      }
    });
  });

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function loadAllFeedbacks() {
    $.ajax({
      url: "/api/getAllFeedbacks.php",
      type: "GET",
      data: { userId: userId },
      dataType: "json",
      success: function (res) {
        if (!res.status || !res.data || res.data.length === 0) {
          $("#allFeedbacksList").html("");
          $("#noAllFeedbacksMsg").removeClass("d-none");
          return;
        }

        $("#noAllFeedbacksMsg").addClass("d-none");
        let html = "";
        const ts = new Date().getTime();
        res.data.forEach((item) => {
          const uAvatar = item.avatar
            ? item.avatar.replace("../assets/", "/") + `?t=${ts}`
            : `https://ui-avatars.com/api/?name=${item.first_name}&background=random`;
          const fDate = item.created_at
            ? formatDate(item.created_at)
            : formatDate(new Date().toISOString());
          html += `
            <tr>
              <td>
                <div class="d-flex align-items-center gap-3">
                  <img src="${uAvatar}" class="rounded-circle avatar-img" style="width:36px; height:36px; min-width:36px; object-fit:cover;">
                  <span class="fw-bold">${item.first_name}</span>
                </div>
              </td>
              <td><span class="badge bg-light text-dark border">${item.product_title || "Product"}</span></td>
              <td><span class="text-warning">${"★".repeat(item.rating)}${"☆".repeat(5 - item.rating)}</span></td>
              <td><p class="mb-0 text-truncate" style="max-width: 250px;" title="${item.feedback}">${item.feedback}</p></td>
              <td class="text-muted small">${fDate}</td>
            </tr>
          `;
        });
        $("#allFeedbacksList").html(html);
      },
    });
  }
});
