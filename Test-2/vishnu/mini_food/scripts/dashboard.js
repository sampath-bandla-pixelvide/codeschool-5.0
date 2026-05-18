const token = localStorage.getItem("food_token");
if (!token) { window.location.href = "index.html"; }

function authHeader() {
  return { Authorization: token };
}

const cart = {};
let activeVeg = "";
let searchTimer = null;
let deliveryFee = 30;
let user = null;

function loadDeliveryFee() {
  $.ajax({
    url: "api/user/delivery_fee.php",
    dataType: "json",
    success: function (d) {
      if (d.status && d.data && d.data.delivery_fee !== undefined) {
        deliveryFee = parseFloat(d.data.delivery_fee) || 30;
      }
    },
  });
}

const ARTICLES = [
  {
    tag: "Did You Know?",
    title: "Honey Never Expires",
    text: "Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible. Its low moisture and acidic pH prevent bacterial growth.",
    img: "images/article_honey.png",
  },
  {
    tag: "Fun Fact",
    title: "Bananas Are Berries, Not Strawberries",
    text: 'Botanically, bananas qualify as berries while strawberries are "accessory fruits". The berry classification is surprisingly complex!',
    img: "images/article_banana.png",
  },
  {
    tag: "Health Tip",
    title: "Spicy Food Boosts Metabolism",
    text: "Capsaicin in chili peppers can temporarily boost your metabolism by up to 8%, making spicy food a natural thermogenic agent.",
    img: "images/article_chili.png",
  },
  {
    tag: "Food Science",
    title: "Why Onions Make You Cry",
    text: "Cutting onions releases syn-Propanethial-S-oxide, which reacts with your eye moisture to form sulphuric acid — triggering tears.",
    img: "images/article_onion.png",
  },
  {
    tag: "History",
    title: "Pizza Was Once Poor Man's Food",
    text: "In 18th-century Naples, pizza was cheap street food sold to the working class. It only became globally popular after WWII.",
    img: "images/article_pizza.png",
  },
  {
    tag: "Nutrition",
    title: "Dark Chocolate Is A Superfood",
    text: "Rich in antioxidants, dark chocolate (70%+) improves blood flow, lowers blood pressure and can even enhance brain function.",
    img: "images/article_chocolate.png",
  },
];

function fmtPrice(p) {
  return "₹" + parseFloat(p).toFixed(2);
}

function cartCount() {
  return Object.values(cart).reduce((s, i) => s + i.qty, 0);
}
function cartSubtotal() {
  return Object.values(cart).reduce((s, i) => s + i.price * i.qty, 0);
}

function updateBadge() {
  $("#cart-badge").text(cartCount());
}

function renderCart() {
  const items = Object.values(cart);
  if (!items.length) {
    $("#cart-body").html(
      '<div class="empty-cart-msg"><i class="fa-solid fa-bowl-food fa-3x mb-3 d-block"></i>Cart is empty</div>',
    );
    $("#cart-footer").hide();
    return;
  }
  let html = "";
  items.forEach((it) => {
    html += `<div class="cart-item d-flex align-items-center gap-2">
          <img src="${it.img || "images/food_hero.png"}" style="width:46px;height:46px;object-fit:cover;border-radius:8px"/>
          <div class="flex-grow-1">
            <div style="font-size:12px;font-weight:600">${it.name}</div>
            <div style="font-size:11px;color:var(--accent)">${fmtPrice(it.price)}</div>
          </div>
          <div class="qty-ctrl">
            <button onclick="changeQty(${it.id},-1)">−</button>
            <span>${it.qty}</span>
            <button onclick="changeQty(${it.id},1)">+</button>
          </div>
        </div>`;
  });
  const sub = cartSubtotal();
  $("#cart-body").html(html);
  $("#cart-sub").text(fmtPrice(sub));
  $("#cart-delivery").text(fmtPrice(deliveryFee));
  $("#cart-total").text(fmtPrice(sub + deliveryFee));
  $("#cart-footer").show();
}

function saveCart() {
  localStorage.setItem("food_cart", JSON.stringify(cart));
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("food_cart") || "null");
    if (saved && typeof saved === "object") {
      Object.assign(cart, saved);
    }
  } catch (e) {
    localStorage.removeItem("food_cart");
  }
}

function addToCart(id, name, price, img) {
  if (cart[id]) {
    cart[id].qty++;
  } else {
    cart[id] = { id, name, price: parseFloat(price), img, qty: 1 };
  }
  saveCart();
  updateBadge();
  refreshCartControl(id);
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
  saveCart();
  updateBadge();
  renderCart();
  refreshCartControl(id);
}

function refreshCartControl(id) {
  const it = cart[id];
  const $el = $(`.cart-ctrl[data-id="${id}"]`);
  if (!$el.length) return;
  if (it && it.qty > 0) {
    $el.html(
      `<div class="qty-ctrl"><button onclick="changeQty(${id},-1)">−</button><span>${it.qty}</span><button onclick="changeQty(${id},1)">+</button></div>`,
    );
  } else {
    $el.html(
      `<button class="add-btn" onclick="addToCart(${id},'${$el.data("name")}',${$el.data("price")},'${$el.data("img")}')">Add</button>`,
    );
  }
}

function skeletonCards(n, col) {
  let h = "";
  for (let i = 0; i < n; i++) {
    h += `<div class="${col}"><div class="card food-card placeholder-glow">
          <div class="placeholder w-100" style="height:170px;border-radius:0"></div>
          <div class="card-body"><span class="placeholder col-7 d-block mb-2"></span><span class="placeholder col-4 d-block mb-3"></span>
          <div class="d-flex justify-content-between"><span class="placeholder col-3"></span><span class="placeholder col-3"></span></div></div>
        </div></div>`;
  }
  return h;
}

function renderArticles() {
  let html = "";
  ARTICLES.forEach((a) => {
    html += `<div class="col-sm-6 col-lg-4">
          <div class="article-card">
            <img class="art-img" src="${a.img}" alt="${a.title}" loading="lazy"/>
            <div class="art-body">
              <div class="art-tag">${a.tag}</div>
              <div class="art-title">${a.title}</div>
              <div class="art-text">${a.text}</div>
            </div>
          </div>
        </div>`;
  });
  $("#articles-grid").html(html);
}

function loadHomeStats() {
  $.ajax({
    url: "api/user/order_history.php",
    headers: authHeader(),
    dataType: "json",
    success: function (d) {
      if (!d.status) return;
      const orders = d.data || [];
      const delivered = orders.filter((o) => o.status === "delivered").length;
      const active = orders.filter(
        (o) => !["delivered", "cancelled"].includes(o.status),
      ).length;
      const spent = orders
        .filter((o) => o.status !== "cancelled")
        .reduce((s, o) => s + parseFloat(o.total_amount), 0);
      $("#stat-orders").text(orders.length);
      $("#stat-delivered").text(delivered);
      $("#stat-active").text(active);
      $("#stat-spent").text("₹" + spent.toFixed(0));
    },
  });
}

function loadCategories() {
  $("#cat-grid").html(skeletonCards(6, "col-6 col-md-4 col-xl-3"));
  $.ajax({
    url: "api/user/categories.php",
    dataType: "json",
    success: function (d) {
      if (!d.status || !d.data.length) {
        $("#cat-grid").html(
          '<div class="col-12 text-center text-muted py-4">No categories found.</div>',
        );
        return;
      }
      let html = "";
      d.data.forEach((c, idx) => {
        const carouselId = `cat-cr-${idx}`;
        let mediaHtml;
        if (c.photos && c.photos.length > 1) {
          let indicators = "";
          let slides = "";
          c.photos.forEach((p, i) => {
            indicators += `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${i}" ${i === 0 ? 'class="active" aria-current="true"' : ""} aria-label="Photo ${i + 1}"></button>`;
            slides += `<div class="carousel-item${i === 0 ? " active" : ""}"><img src="${p}" class="img-fluid w-100" alt="${c.name}" loading="lazy"/></div>`;
          });
          mediaHtml = `<div id="${carouselId}" class="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">
                      <div class="carousel-indicators">${indicators}</div>
                      <div class="carousel-inner">${slides}</div>
                      <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>
                      <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button>
                    </div>`;
        } else if (c.photos && c.photos.length === 1) {
          mediaHtml = `<img src="${c.photos[0]}" class="img-fluid w-100" alt="${c.name}" loading="lazy"/>`;
        } else {
          mediaHtml = `<div class="cat-placeholder"><i class="fa-solid fa-bowl-food"></i></div>`;
        }
        html += `<div class="col-6 col-md-4 col-xl-3">
                  <div class="cat-card">
                    <div class="cat-media">${mediaHtml}</div>
                    <div class="cat-name">${c.name}</div>
                    <div class="px-3 pb-1 pt-2">
                      <button class="btn btn-sm w-100 fw-600" style="background:var(--accent);color:#fff;border-radius:8px;font-size:12px" onclick="filterByCategory(${c.id},'${c.name.replace(/'/g, "\\'")}')"><i class="fa-solid fa-utensils me-1"></i>View Food Items</button>
                    </div>
                  </div>
                </div>`;
      });
      $("#cat-grid").html(html);
    },
    error: function () {
      $("#cat-grid").html(
        '<div class="col-12 text-center text-danger py-4">Failed to load categories.</div>',
      );
    },
  });
}

function loadMenu(catId) {
  catId = catId || 0;
  $("#menu-grid").html(skeletonCards(8, "col-6 col-md-4 col-xl-3"));
  const params = {
    category_id: catId,
    search: $("#search-input").val().trim(),
    veg: activeVeg,
  };
  $.ajax({
    url: "api/user/menu.php",
    dataType: "json",
    data: params,
    success: function (d) {
      if (!d.status || !d.data.length) {
        $("#menu-grid").html(
          '<div class="col-12 text-center text-muted py-5"><i class="fa-solid fa-triangle-exclamation fa-2x mb-2 d-block"></i>No items found.</div>',
        );
        return;
      }
      let html = "";
      d.data.forEach((item, idx) => {
        const avail = item.is_available === 1 || item.is_available === true;
        const dot = item.is_veg
          ? '<span class="veg-dot g"></span>'
          : '<span class="veg-dot r"></span>';
        const bdg = item.is_veg
          ? '<span class="badge" style="background:#e8f5e9;color:#28a745;font-size:10px">Veg</span>'
          : '<span class="badge" style="background:#fdecea;color:#dc3545;font-size:10px">Non-Veg</span>';
        const firstImg =
          item.photos && item.photos.length
            ? item.photos[0]
            : "images/food_hero.png";
        const it = avail ? cart[item.id] : null;
        const ctrl = !avail
          ? `<span class="badge" style="background:#6c757d;color:#fff;font-size:11px;padding:5px 10px"><i class="fa-solid fa-ban me-1"></i>Unavailable</span>`
          : it
            ? `<div class="qty-ctrl"><button onclick="changeQty(${item.id},-1)">−</button><span>${it.qty}</span><button onclick="changeQty(${item.id},1)">+</button></div>`
            : `<button class="add-btn" onclick="addToCart(${item.id},'${item.name.replace(/'/g, "\\'")}',${item.price},'${firstImg}')">Add</button>`;
        const crId = `fi-cr-${idx}`;
        let mediaSec;
        if (item.photos && item.photos.length > 1) {
          let ind = "",
            sld = "";
          item.photos.forEach((p, i) => {
            ind += `<button type="button" data-bs-target="#${crId}" data-bs-slide-to="${i}" ${i === 0 ? 'class="active" aria-current="true"' : ""} aria-label="Photo ${i + 1}"></button>`;
            sld += `<div class="carousel-item${i === 0 ? " active" : ""}"><img src="${p}" class="img-fluid w-100" alt="${item.name}" loading="lazy"/></div>`;
          });
          mediaSec = `<div id="${crId}" class="carousel slide" data-bs-ride="carousel" data-bs-interval="3500">
                      <div class="carousel-indicators">${ind}</div>
                      <div class="carousel-inner">${sld}</div>
                      <button class="carousel-control-prev" type="button" data-bs-target="#${crId}" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>
                      <button class="carousel-control-next" type="button" data-bs-target="#${crId}" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button>
                    </div>`;
        } else {
          mediaSec = `<img src="${firstImg}" class="img-fluid w-100" alt="${item.name}" loading="lazy"/>`;
        }
        html += `<div class="col-6 col-md-4 col-xl-3"><div class="card food-card" style="${!avail ? "opacity:0.6;filter:grayscale(40%)" : ""}">
                  ${mediaSec}
                  <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                      <span style="font-size:13px;font-weight:600">${dot}${item.name}</span>${bdg}
                    </div>
                    <div class="text-muted mb-1" style="font-size:11px">${item.category_name}</div>
                    <div class="text-muted mb-2" style="font-size:11px">${item.description ? item.description.substring(0, 55) + "…" : ""}</div>
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="price-tag">${fmtPrice(item.price)}</span>
                      <div class="cart-ctrl" data-id="${item.id}" data-name="${item.name.replace(/'/g, "\\&apos;")}" data-price="${item.price}" data-img="${firstImg}">${ctrl}</div>
                    </div>
                  </div>
                </div></div>`;
      });
      $("#menu-grid").html(html);
    },
    error: function () {
      $("#menu-grid").html(
        '<div class="col-12 text-center text-danger py-4">Failed to load menu.</div>',
      );
    },
  });
}

function loadOrders() {
  $("#orders-list").html(
    '<div class="text-center text-muted py-4"><i class="fa-solid fa-spinner fa-spin fa-2x mb-2 d-block"></i>Loading orders…</div>',
  );
  $.ajax({
    url: "api/user/order_history.php",
    headers: authHeader(),
    dataType: "json",
    success: function (d) {
      if (!d.status || !d.data.length) {
        $("#orders-list").html(
          '<div class="text-center text-muted py-5"><i class="fa-solid fa-bag-shopping fa-3x mb-3 d-block"></i>No orders yet. Start ordering!</div>',
        );
        return;
      }
      const statusColor = {
        placed: "primary",
        preparing: "warning",
        out_for_delivery: "info",
        delivered: "success",
        cancelled: "danger",
      };
      let html = "";
      d.data.forEach((o) => {
        const color = statusColor[o.status] || "secondary";
        let items = "";
        (o.items || []).forEach((i) => {
          items += `<div class="order-item-row d-flex justify-content-between"><span>${i.food_name} × ${i.quantity}</span><span>${fmtPrice(i.line_total)}</span></div>`;
        });
        html += `<div class="order-card">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div style="font-weight:700;font-size:14px">Order #${o.id}</div>
                      <div style="font-size:11px;color:#999">${new Date(o.created_at).toLocaleString()}</div>
                    </div>
                    <span class="order-badge bg-${color} text-${color === "warning" ? "dark" : "white"}">${o.status.replace(/_/g, " ").toUpperCase()}</span>
                  </div>
                  <div class="mb-2">${items}</div>
                  <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                    <span style="font-size:12px;color:#666"><i class="fa-solid fa-credit-card me-1"></i>${o.payment_method || "cod"}</span>
                    <span style="font-weight:700;color:var(--accent)">${fmtPrice(o.total_amount)}</span>
                  </div>
                </div>`;
      });
      $("#orders-list").html(html);
    },
    error: function (xhr) {
      const msg =
        xhr.status === 401
          ? "Session expired — please log in again."
          : "Failed to load orders.";
      $("#orders-list").html(
        `<div class="text-center text-danger py-4">${msg}</div>`,
      );
    },
  });
}

function filterByCategory(id, name) {
  showSection("menu");
  $("#page-title").text(name);
  loadMenu(id);
}

function showSection(name) {
  $(".section").removeClass("active");
  $(".nav-link").removeClass("active");
  $(`#section-${name}`).addClass("active");
  $(`.nav-link[data-section="${name}"]`).addClass("active");
  const titles = {
    home: "Home",
    categories: "Categories",
    menu: "Menu",
    orders: "Order History",
    settings: "Settings",
  };
  $("#page-title").text(titles[name] || name);

  if (name === "home") {
    renderArticles();
    loadHomeStats();
  }
  if (name === "categories") loadCategories();
  if (name === "menu") loadMenu(0);
  if (name === "orders") loadOrders();
  if (name === "settings") loadSettings();
}

$(function () {
  if (!token) return;

  $.ajax({
    url: "api/get_current_user.php",
    headers: authHeader(),
    dataType: "json",
    success: function (d) {
      if (!d.status || !d.data || !d.data.user) {
        localStorage.removeItem("food_token");
        window.location.href = "index.html";
        return;
      }
      user = d.data.user;
      initDashboard();
    },
    error: function () {
      localStorage.removeItem("food_token");
      window.location.href = "index.html";
    },
  });
});

function initDashboard() {
  loadCart();
  loadDeliveryFee();
  $("#sb-name").text(user.name);
  $("#sb-avatar").text(user.name.charAt(0).toUpperCase());

  showSection("home");

  $(".nav-link").on("click", function () {
    showSection($(this).data("section"));
    $("#sidebar").removeClass("open");
    $("#sidebarOverlay").removeClass("show");
  });

  $("#hamburger-btn").on("click", function () {
    $("#sidebar").toggleClass("open");
    $("#sidebarOverlay").toggleClass("show");
  });

  $("#sidebarOverlay").on("click", function () {
    $("#sidebar").removeClass("open");
    $(this).removeClass("show");
  });

  $("#open-cart-btn").on("click", renderCart);

  $("#btn-veg").on("click", function () {
    activeVeg = activeVeg === "1" ? "" : "1";
    $(this).toggleClass("active", activeVeg === "1");
    $("#btn-nveg").removeClass("active");
    if (activeVeg === "1") activeVeg = "1";
    loadMenu(0);
  });

  $("#btn-nveg").on("click", function () {
    activeVeg = activeVeg === "0" ? "" : "0";
    $(this).toggleClass("active", activeVeg === "0");
    $("#btn-veg").removeClass("active");
    loadMenu(0);
  });

  $("#search-input").on("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => loadMenu(0), 400);
  });

  $("#checkout-btn").on("click", function () {
    bootstrap.Offcanvas.getInstance(
      $("#cartCanvas")[0],
    )?.hide();
    const sub = cartSubtotal();
    $("#ch-sub").text(fmtPrice(sub));
    $("#ch-delivery").text(fmtPrice(deliveryFee));
    $("#ch-total").text(fmtPrice(sub + deliveryFee));
    $("#ch-name").val(user.name || "");
    $("#ch-mobile").val(user.mobile || "");
    $("#ch-utr").val("");
    $("#utr-row").hide();
    $("#ch-method").val("cod");
    $("#ch-alert").addClass("d-none");
    loadCheckoutAddresses().always(function () {
      new bootstrap.Modal($("#checkoutModal")[0]).show();
    });
  });

  $("#ch-method").on("change", function () {
    if ($(this).val() === "upi") {
      $("#utr-row").slideDown(200);
    } else {
      $("#utr-row").slideUp(200);
      $("#ch-utr").val("");
    }
  });

  $("#place-order-btn").on("click", function () {
    const name = $("#ch-name").val().trim();
    const mobile = $("#ch-mobile").val().trim();
    const addressId = parseInt($("#ch-address-id").val() || "0", 10);
    const method = $("#ch-method").val();
    const utr = $("#ch-utr").val().trim();

    if (!name || !mobile) {
      Swal.fire('Oops...', 'Please enter your name and mobile.', 'warning');
      return;
    }
    if (!addressId) {
      Swal.fire('Oops...', 'Please select a delivery address. Save one in Settings first.', 'warning');
      return;
    }
    if (method === "upi" && !utr) {
      Swal.fire('Oops...', 'Please enter your UPI UTR number to confirm payment.', 'warning');
      return;
    }
    if (!cartCount()) {
      Swal.fire('Oops...', 'Your cart is empty.', 'warning');
      return;
    }

    const btn = $(this);
    btn
      .prop("disabled", true)
      .html('<i class="fa-solid fa-spinner fa-spin me-1"></i>Placing…');
    $("#ch-alert").addClass("d-none");

    $.ajax({
      url: "api/user/place_order.php",
      method: "POST",
      headers: authHeader(),
      contentType: "application/json",
      data: JSON.stringify({
        name,
        mobile,
        address_id: addressId,
        method,
        utr,
        items: Object.values(cart).map((i) => ({ id: i.id, qty: i.qty })),
      }),
      dataType: "json",
      success: function (d) {
        if (d.status) {
          bootstrap.Modal.getInstance(
            $("#checkoutModal")[0],
          ).hide();
          Object.keys(cart).forEach((k) => delete cart[k]);
          localStorage.removeItem("food_cart");
          updateBadge();
          renderCart();
          $("#success-total").text("Total: " + fmtPrice(d.data.total));
          $("#success-id").text("Order #" + d.data.order_id);
          new bootstrap.Modal($("#successModal")[0]).show();
        } else {
          Swal.fire('Checkout Failed', d.message, 'error');
        }
      },
      error: function (xhr) {
        const msg =
          xhr.status === 401
            ? "Session expired — please log in again."
            : "Failed to place order. Try again.";
        Swal.fire('Error', msg, 'error');
      },
      complete: function () {
        btn.prop("disabled", false).html("Place Order");
      },
    });
  });

  $("#successModal").on("hidden.bs.modal", function () {
    loadOrders();
  });

  $("#logout-btn").on("click", function () {
    Swal.fire({
      title: 'Logout?',
      text: 'Are you sure you want to log out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ff5722',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, logout'
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({ url: "api/logout.php", method: "POST", data: { token } });
        localStorage.removeItem("food_cart");
        localStorage.clear();
        window.location.href = "index.html";
      }
    });
  });

  $("#save-profile-btn").on("click", function () {
    const btn = $(this);
    const email = $("#prof-email").val().trim();
    const mobile = $("#prof-mobile").val().trim();
    $("#profile-alert").addClass("d-none");
    btn
      .prop("disabled", true)
      .html('<i class="fa-solid fa-spinner fa-spin me-1"></i>Saving…');
    $.ajax({
      url: "api/user/profile.php",
      method: "POST",
      headers: authHeader(),
      data: { action: "update", email, mobile },
      dataType: "json",
      success: function (d) {
        if (d.status) {
          Swal.fire('Saved!', d.message, 'success');
        } else {
          Swal.fire('Error', d.message, 'error');
        }
      },
      error: function () {
        Swal.fire('Error', 'Failed to update profile.', 'error');
      },
      complete: function () {
        btn
          .prop("disabled", false)
          .html('<i class="fa-solid fa-floppy-disk me-1"></i>Save Changes');
      },
    });
  });

  $("#show-add-addr-btn").on("click", function () {
    $("#add-addr-form").slideToggle(200);
  });
  $("#cancel-addr-btn").on("click", function () {
    $("#add-addr-form").slideUp(200);
  });

  $("#save-addr-btn").on("click", function () {
    const btn = $(this);
    const body = {
      label: $("#addr-label").val().trim() || "Home",
      address: $("#addr-address").val().trim(),
      city: $("#addr-city").val().trim(),
      pincode: $("#addr-pincode").val().trim(),
      is_default: $("#addr-default").is(":checked"),
    };
    if (!body.address || !body.city || !body.pincode) {
      Swal.fire('Oops...', 'Please fill address, city and pincode.', 'warning');
      return;
    }
    btn
      .prop("disabled", true)
      .html('<i class="fa-solid fa-spinner fa-spin me-1"></i>Saving…');
    $.ajax({
      url: "api/user/addresses.php",
      method: "POST",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      data: JSON.stringify(body),
      dataType: "json",
      success: function (d) {
        if (d.status) {
          $("#add-addr-form").slideUp(200);
          $("#addr-address,#addr-city,#addr-pincode").val("");
          $("#addr-label").val("Home");
          $("#addr-default").prop("checked", false);
          loadAddresses();
        } else {
          Swal.fire('Error', d.message, 'error');
        }
      },
      complete: function () {
        btn
          .prop("disabled", false)
          .html('<i class="fa-solid fa-floppy-disk me-1"></i>Save Address');
      },
    });
  });

  $(document).on("click", ".del-addr-btn", function () {
    const id = $(this).data("id");
    Swal.fire({
      title: 'Remove address?',
      text: "This will remove it from your saved addresses.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff5722',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, remove it'
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: "api/user/addresses.php",
          method: "POST",
          headers: authHeader(),
          data: { action: "delete", id: id },
          dataType: "json",
          success: function (d) {
            if (d.status) loadAddresses();
          },
        });
      }
    });
  });

  $(document).on("click", ".ch-addr-card", function () {
    $(".ch-addr-card").removeClass("border-primary bg-light");
    $(this).addClass("border-primary bg-light");
    $("#ch-address-id").val($(this).data("id"));
  });

  $(document).on("click", "#go-settings-link", function (e) {
    e.preventDefault();
    bootstrap.Modal.getInstance(
      $("#checkoutModal")[0],
    )?.hide();
    showSection("settings");
  });

  updateBadge();
}

function loadSettings() {
  $.ajax({
    url: "api/user/profile.php",
    headers: authHeader(),
    dataType: "json",
    success: function (d) {
      if (!d.status) return;
      $("#prof-name").val(d.data.name);
      $("#prof-email").val(d.data.email);
      $("#prof-mobile").val(d.data.mobile);
    },
  });
  loadAddresses();
}

function loadAddresses() {
  $("#addr-list-wrap").html(
    '<div class="text-center text-muted py-3" style="font-size:13px">Loading…</div>',
  );
  $.ajax({
    url: "api/user/addresses.php",
    headers: authHeader(),
    dataType: "json",
    success: function (d) {
      const list = d.data || [];
      if (!list.length) {
        $("#addr-list-wrap").html(
          '<div class="text-muted" style="font-size:13px">No saved addresses yet. Click <b>Add New</b> to save one.</div>',
        );
        return;
      }
      let html = "";
      list.forEach((a) => {
        const defBadge =
          a.is_default === "true" ||
          a.is_default === true ||
          a.is_default === "t"
            ? '<span class="badge bg-success ms-2" style="font-size:10px">Default</span>'
            : "";
        html += `<div class="d-flex justify-content-between align-items-start border-bottom py-2">
                  <div>
                    <div class="fw-600" style="font-size:13px">${a.label}${defBadge}</div>
                    <div class="text-muted" style="font-size:12px">${a.address}, ${a.city} — ${a.pincode}</div>
                  </div>
                  <button class="btn btn-sm btn-outline-danger del-addr-btn" data-id="${a.id}" style="font-size:11px;padding:2px 8px">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>`;
      });
      $("#addr-list-wrap").html(html);
    },
    error: function () {
      $("#addr-list-wrap").html(
        '<div class="text-danger" style="font-size:13px">Failed to load addresses.</div>',
      );
    },
  });
}

function loadCheckoutAddresses() {
  $("#ch-address-id").val("");
  $("#ch-addr-list").html(
    '<div class="text-muted"><i class="fa-solid fa-circle-info me-1"></i>Loading addresses…</div>',
  );
  return $.ajax({
    url: "api/user/addresses.php",
    headers: authHeader(),
    dataType: "json",
    success: function (d) {
      const list = d.data || [];
      if (!list.length) {
        $("#ch-addr-list").html(
          '<div class="text-muted p-2 rounded border" style="background:#f8f9fa;"><i class="fa-solid fa-circle-exclamation me-1 text-warning"></i>No saved addresses found. Please add a new address to proceed.</div>',
        );
        return;
      }
      let html = "";
      list.forEach((a) => {
        const star =
          a.is_default === "true" || a.is_default === true || a.is_default === "t"
            ? '<span class="badge bg-success ms-2" style="font-size:10px">Default</span>'
            : "";
        html += `
          <div class="ch-addr-card border rounded p-2 cursor-pointer" data-id="${a.id}" style="cursor: pointer; transition: all 0.2s;">
            <div class="d-flex align-items-center">
              <div class="flex-grow-1">
                <div class="fw-600 mb-1" style="font-size:13px">${a.label}${star}</div>
                <div style="font-size:12px; color:#555;">${a.address}, ${a.city}</div>
                <div class="text-muted" style="font-size:11px;">Pincode: ${a.pincode}</div>
              </div>
            </div>
          </div>
        `;
      });
      $("#ch-addr-list").html(html);


      const def =
        list.find(
          (a) => a.is_default === "true" || a.is_default === true || a.is_default === "t",
        ) || list[0];
      $(`.ch-addr-card[data-id="${def.id}"]`).click();
    },
  });
}
