function paymentBadge(o) {
  const method = (o.payment_method || "cod").toUpperCase();
  const pStatus = o.payment_status || "pending";
  const color =
    pStatus === "success"
      ? "success"
      : pStatus === "failed"
        ? "danger"
        : "warning";
  let cell = `<span class="badge bg-${color} me-1">${pStatus === "success" ? "Paid" : pStatus === "failed" ? "Failed" : "Unpaid"}</span>`;
  cell += `<span class="badge bg-secondary">${method}</span>`;
  if (o.payment_method === "upi" && o.utr_reference) {
    cell += `<br><small class="text-muted">UTR: ${o.utr_reference}</small>`;
  }
  return cell;
}

function openOrderModal(o) {
  const method = o.payment_method || "cod";

  $("#order-modal-id").text(o.id);
  $("#order-status-id").val(o.id);
  $("#order-payment-id").val(o.payment_id || "");
  $("#order-payment-method").val(method);
  $("#order-status-select").val(o.status);

  $("#cod-payment-section").hide();
  $("#upi-payment-section").hide();
  $("#other-payment-section").hide();

  if (method === "cod") {
    $("#cod-payment-section").show();
    $("#order-payment-select").val(o.payment_status || "pending");
  } else if (method === "upi") {
    $("#upi-payment-section").show();
    $("#utr-display").text(o.utr_reference || "Not provided");
    $("#order-payment-select-upi").val(o.payment_status || "pending");
  } else {
    $("#other-payment-section").show();
    $("#other-method-display").text(method.toUpperCase());
    $("#order-payment-select-other").val(o.payment_status || "pending");
  }

  new bootstrap.Modal($("#orderStatusModal")[0]).show();
}

function getSelectedPaymentStatus() {
  const method = $("#order-payment-method").val();
  if (method === "upi") return $("#order-payment-select-upi").val();
  if (method === "cod") return $("#order-payment-select").val();
  return $("#order-payment-select-other").val();
}

function loadOrders() {
  $("#orders-body").html(skeletonTableRows(7, 8));
  $.ajax({
    url: "api/admin/orders.php",
    headers: authHeader(),
    dataType: "json",
    success: function (d) {
      if (!d.status || !d.data.length) {
        $("#orders-body").html(
          '<tr><td colspan="8" class="text-center text-muted py-3">No orders yet.</td></tr>',
        );
        return;
      }
      let rows = "";
      $.each(d.data, function (_, o) {
        rows += `<tr>`;
        rows += `<td>#${o.id}</td>`;
        rows += `<td>${o.user_name}</td>`;
        rows += `<td><span class="badge bg-secondary">${o.item_count || 0} items</span></td>`;
        rows += `<td>₹${parseFloat(o.total_amount).toFixed(2)}</td>`;
        rows += `<td>${statusBadge(o.status)}</td>`;
        rows += `<td>${paymentBadge(o)}</td>`;
        rows += `<td>${new Date(o.created_at).toLocaleDateString()}</td>`;
        rows += `<td><button class="btn btn-sm btn-accent update-order-btn" data-order='${JSON.stringify(o)}'><i class="fa-solid fa-pen"></i></button></td>`;
        rows += `</tr>`;
      });
      $("#orders-body").html(rows);
    },
    error: function (xhr) {
      const msg =
        xhr.status === 401
          ? "Session expired — please log in again."
          : "Failed to load orders. Try refreshing.";
      $("#orders-body").html(
        `<tr><td colspan="8" class="text-center text-danger py-3">${msg}</td></tr>`,
      );
    },
  });
}

$(function () {
  $(document).on("click", ".update-order-btn", function () {
    const o = $(this).data("order");
    openOrderModal(o);
  });

  $("#confirm-order-status-btn").on("click", function () {
    const btn = $(this);
    const orderId = $("#order-status-id").val();
    const status = $("#order-status-select").val();
    const paymentId = $("#order-payment-id").val();
    const payStatus = getSelectedPaymentStatus();

    btn
      .prop("disabled", true)
      .html('<i class="fa-solid fa-spinner fa-spin me-1"></i>Saving…');

    const updateOrder = $.ajax({
      url: "api/admin/orders.php",
      method: "POST",
      headers: authHeader(),
      data: { action: "update_status", id: orderId, status },
      dataType: "json",
    });

    const updatePayment = paymentId
      ? $.ajax({
          url: "api/admin/orders.php",
          method: "POST",
          headers: authHeader(),
          data: {
            action: "update_payment",
            payment_id: parseInt(paymentId),
            status: payStatus,
          },
          dataType: "json",
        })
      : $.when();

    $.when(updateOrder, updatePayment)
      .done(function () {
        bootstrap.Modal.getInstance(
          $("#orderStatusModal")[0],
        ).hide();
        loadOrders();
      })
      .fail(function () {
        Swal.fire('Error', 'Failed to update. Please try again.', 'error');
      })
      .always(function () {
        btn.prop("disabled", false).html("Save Changes");
      });
  });
});
