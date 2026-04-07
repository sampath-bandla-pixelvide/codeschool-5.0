const userToken = localStorage.getItem("userToken");

if (userToken) {
  $("#AuthUser").removeClass("d-none");
  $("#unAuthUser").addClass("d-none");
} else {
  $("#AuthUser").addClass("d-none");
  $("#unAuthUser").removeClass("d-none");
}

$("#logOutBtn").click(function () {
  localStorage.removeItem("userToken");
  window.location.reload();
});

$("#logInBtn").click(() => {
  window.location.href = "../templates/login.html";
});

$("#registerBtn").click(() => {
  window.location.href = "../templates/register.html";
});

const parentDiv = $("#parentDiv");
const parentUnderBanner = $("#parentDivUnderbanner");
$.ajax({
  type: "GET",
  url: "https://newsdata.io/api/1/latest?apikey=pub_7a81b4f2a95246818e810323b0cc9c2d&country=in&language=en&image=1",

  success: function (response) {
    console.log(response);

    let articles = response.results;

    for (let i = 0; i < articles.length; i++) {
      iterateDiv(articles[i]);
    }
  },

  error: function (err) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Error while fetching data!!",
    }).then(() => {
      console.log(err);
    });
  },
});

function iterateDiv(article) {
  let card = $("<div>")
    .addClass("card d-flex flex-column rounded-4")
    .css("width", "18rem");

  let imgSrc = article.image_url
    ? article.image_url
    : "https://via.placeholder.com/300x200?text=No+Image";

  let cardImg = $("<img>")
    .attr({
      src: imgSrc,
      alt: "news image",
      height: "200",
    })
    .addClass("rounded-top-4");

  let cardBody = $("<div>").addClass(
    "card-body d-flex flex-column justify-content-between"
  );

  let title = $("<p>")
    .addClass("card-text fw-semibold")
    .text(article.title);

  let source = $("<small>")
    .addClass("text-danger")
    .text(article.source_name);

  let link = $("<a>")
    .attr({
      href: article.link,
      target: "_blank",
    })
    .addClass("btn btn-sm btn-primary mt-2")
    .text("Read More");

  cardBody.append(title, source, link);
  card.append(cardImg, cardBody);

  parentDiv.append(card);
  parentUnderBanner.append(card);
}