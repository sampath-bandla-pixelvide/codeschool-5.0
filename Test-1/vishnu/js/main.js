$(".category-card").on("touchstart", function () {
  $(".category-card").removeClass("touched");
  $(this).addClass("touched");
});