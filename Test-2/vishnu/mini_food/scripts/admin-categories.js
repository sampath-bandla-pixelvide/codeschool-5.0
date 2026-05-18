let catFilesArr = [];

function loadCategories() {
  $("#categories-grid").html(skeletonCards(4));
  $.ajax({
    url: "api/admin/categories.php",
    headers: authHeader(),
    dataType: "json",
    success: function (d) {
      if (!d.status || !d.data.length) {
        $("#categories-grid").html(
          '<div class="col-12 text-center text-muted py-4">No categories yet.</div>',
        );
        return;
      }
      let html = "";
      $.each(d.data, function (_, c) {
        const badge = c.is_active
          ? '<span class="badge bg-success">Active</span>'
          : '<span class="badge bg-secondary">Inactive</span>';
        const photos = c.photos || [];
        let imgHtml = "";
        if (photos.length > 1) {
          const cid = `cc-${c.id}`;
          imgHtml += `<div id="${cid}" class="carousel slide" data-bs-ride="false"><div class="carousel-inner">`;
          $.each(photos, function (pi, p) {
            imgHtml += `<div class="carousel-item${pi === 0 ? " active" : ""}"><img src="${p}" class="d-block w-100" style="height:175px;object-fit:cover"/></div>`;
          });
          imgHtml += `</div><button class="carousel-control-prev" type="button" data-bs-target="#${cid}" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>`;
          imgHtml += `<button class="carousel-control-next" type="button" data-bs-target="#${cid}" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button>`;
          imgHtml += `<div class="position-absolute bottom-0 end-0 m-1"><span class="badge bg-dark" style="font-size:10px">${photos.length} photos</span></div></div>`;
        } else if (photos.length === 1) {
          imgHtml = `<img src="${photos[0]}" style="height:175px;object-fit:cover;width:100%"/>`;
        } else {
          imgHtml = `<div class="d-flex align-items-center justify-content-center bg-light" style="height:175px"><span class="text-muted"><i class="fa-solid fa-image fa-2x"></i></span></div>`;
        }
        html += `<div class="col-sm-6 col-md-4 col-xl-3"><div class="card food-card">${imgHtml}<div class="card-body p-3">`;
        html += `<div class="d-flex justify-content-between align-items-start mb-1"><strong style="font-size:14px">${c.name}</strong>${badge}</div>`;
        html += `<div class="d-flex justify-content-between align-items-center mt-2">`;
        html += `<span class="text-muted" style="font-size:12px">${photos.length || "No"} photo${photos.length !== 1 ? "s" : ""}</span>`;
        html += `<div class="d-flex gap-1">`;
        html += `<button class="btn btn-sm btn-outline-secondary edit-cat-btn" data-id="${c.id}" data-name="${c.name}" data-active="${c.is_active}"><i class="fa-solid fa-pen"></i></button>`;
        html += `<button class="btn btn-sm btn-outline-danger delete-btn" data-type="category" data-id="${c.id}"><i class="fa-solid fa-trash"></i></button>`;
        html += `</div></div></div></div></div>`;
      });
      $("#categories-grid").html(html);
    },
    error: function (xhr) {
      const msg =
        xhr.status === 401
          ? "Session expired — please log in again."
          : "Could not load categories. Check your connection.";
      $("#categories-grid").html(
        `<div class="col-12 text-center text-danger py-4">${msg}</div>`,
      );
    },
  });
}

$(function () {
  $("#cat-photos").on("change", function () {
    const maxMB = 2;
    const maxBytes = maxMB * 1024 * 1024;
    let oversized = [];
    Array.from(this.files).forEach((f) => {
      if (f.size > maxBytes) {
        oversized.push(f.name);
      } else {
        catFilesArr.push(f);
        addToPreview(f, catFilesArr.length - 1, "cat-img-preview", catFilesArr);
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

  $("#open-add-cat").on("click", function () {
    $("#cat-modal-title").text("Add Category");
    $("#cat-id").val("");
    $("#cat-name").val("").removeClass("is-invalid");
    $("#cat-active").prop("checked", true);
    $("#cat-status-wrap").hide();
    $("#cat-alert").addClass("d-none");
    $("#cat-photos").val("");
    $("#cat-img-preview").html("");
    catFilesArr = [];
  });

  $(document).on("click", ".edit-cat-btn", function () {
    const b = $(this);
    $("#cat-modal-title").text("Edit Category");
    $("#cat-id").val(b.data("id"));
    $("#cat-name").val(b.data("name")).removeClass("is-invalid");
    $("#cat-active").prop(
      "checked",
      b.data("active") == 1 || b.data("active") === true,
    );
    $("#cat-status-wrap").show();
    $("#cat-alert").addClass("d-none");
    $("#cat-photos").val("");
    $("#cat-img-preview").html("");
    catFilesArr = [];
    new bootstrap.Modal($("#categoryModal")[0]).show();
  });

  $("#save-cat-btn").on("click", function () {
    const name = $("#cat-name").val().trim();
    if (!name) {
      $("#cat-name").addClass("is-invalid");
      return;
    }
    $("#cat-name").removeClass("is-invalid");

    const id = $("#cat-id").val();
    const btn = $(this);
    btn
      .prop("disabled", true)
      .html('<i class="fa-solid fa-spinner fa-spin me-1"></i>Saving...');

    const fd = new FormData();
    fd.append("name", name);
    fd.append("is_active", $("#cat-active").is(":checked") ? 1 : 0);
    if (id) fd.append("id", id);
    catFilesArr.forEach((f) => fd.append("photos[]", f));

    $.ajax({
      url: "api/admin/categories.php",
      method: "POST",
      headers: authHeader(),
      data: fd,
      processData: false,
      contentType: false,
      dataType: "json",
      success: function (d) {
        if (d.status) {
          if (d.message && d.message.includes("photo issues")) {
            $("#cat-alert")
              .removeClass("d-none")
              .addClass("alert alert-warning")
              .text(d.message);
          } else {
            catFilesArr = [];
            bootstrap.Modal.getInstance(
              $("#categoryModal")[0],
            ).hide();
            loadCategories();
          }
        } else {
          $("#cat-alert")
            .removeClass("d-none")
            .addClass("alert alert-danger")
            .text(d.message);
        }
      },
      error: function (xhr) {
        $("#cat-alert")
          .removeClass("d-none")
          .addClass("alert alert-danger")
          .text("Error: " + xhr.responseText.substring(0, 200));
      },
      complete: function () {
        btn.prop("disabled", false).html("Save Category");
      },
    });
  });
});
