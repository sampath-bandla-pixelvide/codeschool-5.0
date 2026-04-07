$(document).ready(function () {
  const token = localStorage.getItem("accessToken");
  const isRegistered = localStorage.getItem("isRegistered");

  if (token) {
    $("#signin").hide();
    $("#login").hide();
    $("#logout").removeClass("d-none");
  } else if (isRegistered) {
    $("#signin").show();
    $("#login").hide();
    $("#logout").addClass("d-none");
  } else {
    $("#signin").show();
    $("#login").hide();
    $("#logout").addClass("d-none");
  }

  $("#login").click(function () {
    window.location.replace("index.html");
  });

  $("#signin").click(function () {
    window.location.replace("register.html");
  });

  $("#logout").click(function (e) {
    e.preventDefault();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    if (!localStorage.getItem("accessToken")) {
      window.location.href = "index.html";
    }
  });

  function getProducts(url) {
    $.ajax({
      url: url,
      method: "GET",
      success: function (data) {
        $("#products").empty();

        data.products.forEach(function (product) {
          let discountPrice = (
            product.price -
            (product.price * product.discountPercentage) / 100
          ).toFixed(2);
          let card = `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-3">
          <div class="card border-0 h-100 product-card" data-id="${product.id}" style="cursor: pointer;">
            <img src="${product.thumbnail}" class="card-img-top bg-light" alt="${product.title}">
            <div class="card-body">
                <h5>${product.title}</h5>
                <div class="d-flex  gap-2 p-0 align-items-center text-muted">
                  <span class="pb-1"><b>$${discountPrice}</b></span>
                  <span class="text-muted text-decoration-line-through">$${product.price}</span>
                  <span class="text-danger ">(${Math.floor(product.discountPercentage)}%OFF)</span>
                </div>
                <p class="">${product.rating}⭐</p>
                <button class="btn btn-danger rounded-0 mt-2">Add to cart</button>
            </div>
          </div>
        </div>
            `;
          $("#products").append(card);
        });
      },
      error: function (err) {
        console.log(err);
        $("#products").html("<p>error loading products</p>");
      },
    });
  }

  getProducts("https://dummyjson.com/products");
});
