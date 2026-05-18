function loadAdminSettings() {
  $.ajax({
    url: "api/admin/settings.php",
    headers: adminHeader(),
    dataType: "json",
    success: function (d) {
      if (d.status && d.data) {
        $("#setting-delivery-fee").val(d.data.delivery_fee ?? 30);
      }
    },
  });
  loadSettingsCategories();
}

function loadSettingsCategories() {
  $.ajax({
    url: "api/admin/categories.php",
    headers: adminHeader(),
    dataType: "json",
    success: function (d) {
      if (!d.status) return;
      const cats = d.data || [];

      let html = "";
      cats.forEach((c) => {
        const isActive =
          c.is_active === 1 ||
          c.is_active === true ||
          c.is_active === "true" ||
          c.is_active === "t";
        html += `<div class="d-flex justify-content-between align-items-center border-bottom py-2">
                  <div>
                    <div class="fw-600" style="font-size:14px">${c.name}</div>
                  </div>
                  <div class="form-check form-switch mb-0">
                    <input class="form-check-input settings-cat-toggle" type="checkbox" data-id="${c.id}"
                           style="cursor:pointer" ${isActive ? "checked" : ""}/>
                    <label class="form-check-label" style="font-size:12px">${isActive ? "Active" : "Inactive"}</label>
                  </div>
                </div>`;
      });
      $("#settings-cat-list").html(
        html ||
          '<div class="text-muted" style="font-size:13px">No categories found.</div>',
      );

      const $sel = $("#settings-cat-filter");
      $sel.html('<option value="">— Select a Category —</option>');
      cats.forEach((c) => {
        $sel.append(`<option value="${c.id}">${c.name}</option>`);
      });
    },
  });
}

function loadSettingsFoodItems(catId) {
  if (!catId) {
    $("#settings-food-list").html(
      '<div class="text-center text-muted py-3">Select a category above to manage food item availability.</div>',
    );
    return;
  }
  $("#settings-food-list").html(
    '<div class="text-center text-muted py-3"><i class="fa-solid fa-spinner fa-spin me-1"></i>Loading…</div>',
  );
  $.ajax({
    url: "api/admin/settings.php?action=food&category_id=" + catId,
    headers: adminHeader(),
    dataType: "json",
    success: function (d) {
      if (!d.status) {
        $("#settings-food-list").html(
          '<div class="text-danger p-2">Failed to load items.</div>',
        );
        return;
      }
      const items = d.data || [];
      if (!items.length) {
        $("#settings-food-list").html(
          '<div class="text-muted py-2" style="font-size:13px">No food items in this category.</div>',
        );
        return;
      }
      let html = '<div class="row g-2">';
      items.forEach((item) => {
        const avail = item.is_available === 1 || item.is_available === true;
        const vegDot = item.is_veg
          ? '<span style="width:10px;height:10px;border-radius:50%;background:#28a745;display:inline-block;margin-right:5px"></span>'
          : '<span style="width:10px;height:10px;border-radius:50%;background:#dc3545;display:inline-block;margin-right:5px"></span>';
        html += `<div class="col-12 col-md-6">
                  <div class="d-flex justify-content-between align-items-center rounded-3 p-2 border" style="font-size:13px">
                    <div>
                      ${vegDot}<span class="fw-600">${item.name}</span>
                      <span class="text-muted ms-2">₹${parseFloat(item.price).toFixed(2)}</span>
                    </div>
                    <div class="form-check form-switch mb-0">
                      <input class="form-check-input settings-food-toggle" type="checkbox"
                             data-id="${item.id}" style="cursor:pointer" ${avail ? "checked" : ""}/>
                    </div>
                  </div>
                </div>`;
      });
      html += "</div>";
      $("#settings-food-list").html(html);
    },
  });
}

$(function () {
  $(document).on("click", "#save-delivery-fee-btn", function () {
    const fee = parseFloat($("#setting-delivery-fee").val());
    if (isNaN(fee) || fee < 0) {
      Swal.fire('Invalid input', 'Enter a valid delivery fee.', 'warning');
      return;
    }
    const btn = $(this);
    btn
      .prop("disabled", true)
      .html('<i class="fa-solid fa-spinner fa-spin me-1"></i>Saving…');
    $.ajax({
      url: "api/admin/settings.php",
      method: "POST",
      headers: { ...adminHeader(), "Content-Type": "application/json" },
      data: JSON.stringify({ delivery_fee: fee.toString() }),
      dataType: "json",
      success: function (d) {
        if (d.status) {
          Swal.fire('Saved!', d.message, 'success');
        } else {
          Swal.fire('Error', d.message, 'error');
        }
      },
      complete: function () {
        btn
          .prop("disabled", false)
          .html('<i class="fa-solid fa-floppy-disk me-1"></i>Save');
      },
    });
  });

  $(document).on("change", ".settings-cat-toggle", function () {
    const id = $(this).data("id");
    const isActive = $(this).is(":checked");
    const $label = $(this).next("label");
    $(this).prop("disabled", true);
    $.ajax({
      url: "api/admin/settings.php?action=cat",
      method: "POST",
      headers: { ...adminHeader(), "Content-Type": "application/json" },
      data: JSON.stringify({ id: id, is_active: isActive }),
      dataType: "json",
      success: function (d) {
        if (d.status) {
          $label.text(isActive ? "Active" : "Inactive");
        } else {
          $(this).prop("checked", !isActive);
        }
      }.bind(this),
      complete: function () {
        $(this).prop("disabled", false);
      }.bind(this),
    });
  });

  $(document).on("change", ".settings-food-toggle", function () {
    const id = $(this).data("id");
    const avail = $(this).is(":checked");
    $(this).prop("disabled", true);
    $.ajax({
      url: "api/admin/settings.php?action=food",
      method: "POST",
      headers: { ...adminHeader(), "Content-Type": "application/json" },
      data: JSON.stringify({ id: id, is_available: avail }),
      dataType: "json",
      success: function (d) {
        if (!d.status) {
          $(this).prop("checked", !avail);
        }
      }.bind(this),
      complete: function () {
        $(this).prop("disabled", false);
      }.bind(this),
    });
  });

  $(document).on("change", "#settings-cat-filter", function () {
    loadSettingsFoodItems($(this).val());
  });
});
