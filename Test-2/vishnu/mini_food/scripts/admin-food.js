let foodFilesArr = [];

function loadCatsSelect() {
  $.ajax({
    url: "api/admin/categories.php",
    headers: authHeader(),
    dataType: "json",
    success: function (d) {
      if (!d.status) return;
      let opts = '<option value="">Select category</option>';
      $.each(d.data, function (_, c) {
        opts += `<option value="${c.id}">${c.name}</option>`;
      });
      $("#food-category").html(opts);
    },
    error: function () {
      $("#food-category").html(
        '<option value="">Failed to load categories — try reopening</option>',
      );
    },
  });
}

function loadFoodItems() {
  $("#food-items-grid").html(skeletonCards(4));
  $.ajax({
    url: "api/admin/food_items.php",
    headers: authHeader(),
    dataType: "json",
    success: function (d) {
      if (!d.status || !d.data.length) {
        $("#food-items-grid").html(
          '<div class="col-12 text-center text-muted py-4">No food items yet.</div>',
        );
        return;
      }
      let html = "";
      $.each(d.data, function (_, item) {
        const avail = item.is_available
          ? '<span class="badge bg-success">Available</span>'
          : '<span class="badge bg-secondary">Unavailable</span>';
        const vegDot = item.is_veg
          ? '<span class="veg-dot green" title="Veg"></span>'
          : '<span class="veg-dot red" title="Non-Veg"></span>';
        const photos = item.photos || [];
        let imgHtml = "";
        if (photos.length > 1) {
          const cid = `fc-${item.id}`;
          imgHtml += `<div id="${cid}" class="carousel slide" data-bs-ride="false"><div class="carousel-inner">`;
          $.each(photos, function (pi, p) {
            imgHtml += `<div class="carousel-item${pi === 0 ? " active" : ""}"><img src="${p}" class="d-block w-100" style="height:175px;object-fit:cover"/></div>`;
          });
          imgHtml += `</div><button class="carousel-control-prev" type="button" data-bs-target="#${cid}" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>`;
          imgHtml += `<button class="carousel-control-next" type="button" data-bs-target="#${cid}" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button>`;
          imgHtml += `<div class="position-absolute bottom-0 end-0 m-1"><span class="badge bg-dark" style="font-size:10px">${photos.length} photos</span></div></div>`;
        } else {
          const src = photos.length ? photos[0] : "images/food_hero.png";
          imgHtml = `<img src="${src}" alt="${item.name}"/>`;
        }
        html += `<div class="col-sm-6 col-md-4 col-xl-3"><div class="card food-card">${imgHtml}<div class="card-body p-3">`;
        html += `<div class="d-flex justify-content-between align-items-start mb-1"><strong style="font-size:14px">${vegDot} ${item.name}</strong>${avail}</div>`;
        html += `<div class="text-muted mb-2" style="font-size:12px">${item.category_name || "—"}</div>`;
        html += `<div class="text-muted mb-2" style="font-size:12px">${item.description ? item.description.substring(0, 55) + "..." : "—"}</div>`;
        html += `<div class="d-flex justify-content-between align-items-center">`;
        html += `<span class="fw-600 accent-text fs-6">₹${parseFloat(item.price).toFixed(2)}</span>`;
        html += `<div class="d-flex gap-1">`;
        html += `<button class="btn btn-sm btn-outline-secondary edit-food-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-cat="${item.category_id}" data-desc="${item.description || ""}" data-avail="${item.is_available ? 1 : 0}" data-veg="${item.is_veg ? 1 : 0}"><i class="fa-solid fa-pen"></i></button>`;
        html += `<button class="btn btn-sm btn-outline-danger delete-btn" data-type="food_item" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>`;
        html += `</div></div></div></div></div>`;
      });
      $("#food-items-grid").html(html);
    },
    error: function (xhr) {
      const msg =
        xhr.status === 401
          ? "Session expired — please log in again."
          : "Failed to load food items. Try refreshing the page.";
      $("#food-items-grid").html(
        `<div class="col-12 text-center text-danger py-4">${msg}</div>`,
      );
    },
  });
}

$(function () {
  $("#food-photos").on("change", function () {
    const maxMB = 2;
    const maxBytes = maxMB * 1024 * 1024;
    let oversized = [];
    Array.from(this.files).forEach((f) => {
      if (f.size > maxBytes) {
        oversized.push(f.name);
      } else {
        foodFilesArr.push(f);
        addToPreview(f, foodFilesArr.length - 1, "img-preview", foodFilesArr);
      }
    });
    if (oversized.length) {
      Swal.fire({
        icon: 'error',
        title: 'File too large',
        html: `The following file(s) exceed the <b>${maxMB}MB</b> limit and were skipped:<br><b>${oversized.join(', ')}</b>`,
        confirmButtonColor: '#ff6b2b'
      });
    }
    $(this).val("");
  });

  $("#open-add-food").on("click", function () {
    $("#food-name,#food-desc,#food-price").val("");
    $("#food-available").prop("checked", true);
    $('input[name=food_veg][value="1"]').prop("checked", true);
    $("#food-photos").val("");
    $("#img-preview").html("");
    foodFilesArr = [];
    $("#food-alert").addClass("d-none");
    loadCatsSelect();
  });

  $("#save-food-btn").on("click", function () {
    const name = $("#food-name").val().trim();
    const price = $("#food-price").val();
    const cat = $("#food-category").val();
    if (!name || !price || !cat) {
      $("#food-alert")
        .removeClass("d-none")
        .addClass("alert alert-warning")
        .text("Name, category and price are required.");
      return;
    }
    const btn = $(this);
    btn
      .prop("disabled", true)
      .html('<i class="fa-solid fa-spinner fa-spin me-1"></i>Saving...');

    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", $("#food-desc").val());
    fd.append("price", price);
    fd.append("category_id", cat);
    fd.append("is_available", $("#food-available").is(":checked") ? 1 : 0);
    fd.append("is_veg", $("input[name=food_veg]:checked").val());
    foodFilesArr.forEach((f) => fd.append("photos[]", f));

    $.ajax({
      url: "api/admin/food_items.php",
      method: "POST",
      headers: authHeader(),
      data: fd,
      processData: false,
      contentType: false,
      dataType: "json",
      success: function (d) {
        if (d.status) {
          foodFilesArr = [];
          bootstrap.Modal.getInstance(
            $("#foodItemModal")[0],
          ).hide();
          loadFoodItems();
        } else {
          $("#food-alert")
            .removeClass("d-none")
            .addClass("alert alert-danger")
            .text(d.message);
        }
      },
      error: function (xhr) {
        $("#food-alert")
          .removeClass("d-none")
          .addClass("alert alert-danger")
          .text("Error: " + xhr.responseText.substring(0, 200));
      },
      complete: function () {
        btn
          .prop("disabled", false)
          .html('<i class="fa-solid fa-floppy-disk me-1"></i>Save Item');
      },
    });
  });

  $(document).on("click", ".edit-food-btn", function () {
    const b = $(this);
    $("#edit-food-id").val(b.data("id"));
    $("#edit-food-name").val(b.data("name"));
    $("#edit-food-price").val(b.data("price"));
    $("#edit-food-desc").val(b.data("desc"));
    $("#edit-food-available").prop("checked", b.data("avail") == 1);
    $(`input[name=edit_food_veg][value="${b.data("veg")}"]`).prop(
      "checked",
      true,
    );
    $("#edit-food-alert").addClass("d-none");

    $.ajax({
      url: "api/admin/categories.php",
      headers: authHeader(),
      dataType: "json",
      success: function (d) {
        if (!d.status) return;
        let opts = '<option value="">Select category</option>';
        $.each(d.data, function (_, c) {
          opts += `<option value="${c.id}"${c.id == b.data("cat") ? " selected" : ""}>${c.name}</option>`;
        });
        $("#edit-food-category").html(opts);
      },
      error: function () {
        $("#edit-food-category").html(
          '<option value="">Failed to load categories — try again</option>',
        );
      },
    });
    new bootstrap.Modal($("#editFoodModal")[0]).show();
  });

  $("#update-food-btn").on("click", function () {
    const id = $("#edit-food-id").val();
    const name = $("#edit-food-name").val().trim();
    const price = $("#edit-food-price").val();
    const cat = $("#edit-food-category").val();
    if (!name || !price || !cat) {
      $("#edit-food-alert")
        .removeClass("d-none")
        .addClass("alert alert-warning")
        .text("Name, category and price are required.");
      return;
    }
    const btn = $(this);
    btn
      .prop("disabled", true)
      .html('<i class="fa-solid fa-spinner fa-spin me-1"></i>Updating...');

    $.ajax({
      url: "api/admin/food_items.php",
      method: "POST",
      headers: authHeader(),
      data: {
        action: "update",
        id,
        name,
        description: $("#edit-food-desc").val(),
        price,
        category_id: cat,
        is_available: $("#edit-food-available").is(":checked") ? 1 : 0,
        is_veg: $("input[name=edit_food_veg]:checked").val(),
      },
      dataType: "json",
      success: function (d) {
        if (d.status) {
          bootstrap.Modal.getInstance(
            $("#editFoodModal")[0],
          ).hide();
          loadFoodItems();
        } else {
          $("#edit-food-alert")
            .removeClass("d-none")
            .addClass("alert alert-danger")
            .text(d.message);
        }
      },
      error: function (xhr) {
        $("#edit-food-alert")
          .removeClass("d-none")
          .addClass("alert alert-danger")
          .text("Error: " + xhr.responseText.substring(0, 200));
      },
      complete: function () {
        btn
          .prop("disabled", false)
          .html('<i class="fa-solid fa-floppy-disk me-1"></i>Update Item');
      },
    });
  });
});
