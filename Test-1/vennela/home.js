$(document).ready(function () {
  $.ajax({
    url: "https://dummyjson.com/recipes",
    method: "GET",
    success: function (data) {
      let categoryMap = {};
      data.recipes.forEach((recipe) => {
        recipe.tags.forEach((tag) => {
          if (!categoryMap[tag]) {
            categoryMap[tag] = recipe.image;
          }
        });
      });
      let categories = Object.keys(categoryMap).slice(0, 6);
      categories.forEach((category) => {
        $("#categories").append(`
                <div class="col-lg-2 col-md-3 col-6">
                    <div class="category-card">
                        <img src="${categoryMap[category]}" 
                             class="category-img shadow">
                        <div class="category-name">
                            ${category}
                        </div>
                    </div>
                </div>
            `);
      });
    },
  });
});

$(document).ready(function () {
  $.ajax({
    url: "https://dummyjson.com/recipes?limit=6",
    method: "GET",
    success: function (data) {
      data.recipes.forEach((recipe) => {
        let stars = "";
        for (let i = 0; i < Math.round(recipe.rating); i++) {
          stars += `<span class="star"><i class="bi bi-star-fill"></i></span>`;
        }
        $("#recipeList").append(`

<div class="col-lg-4 col-md-6">
<div class="card recipe-card shadow-sm">
<img src="${recipe.image}" class="card-img-top recipe-img">
<div class="card-body">
<div class="mb-2">${stars}</div>
<div class="recipe-title mb-2">
${recipe.name}
</div>
<div class="d-flex align-items-center mb-3">
<img src="https://fabrx.co/preview/tastebite/assets/images/avatars/avatar1.png" class="author-img">
<span>Emilys</span>
</div>
<div class="d-flex justify-content-between meta">
<span><i class="bi bi-calendar"></i>  Yesterday</span>
<span><i class="bi bi-chat-left"></i>  456</span>
</div>

</div>

</div>

</div>

`);
      });
    },
  });
});
$(document).ready(function(){

const user = JSON.parse(localStorage.getItem("user"));

if(user){

$("#authBtn").text("Logout");

$("#authBtn").attr("href","#");

$("#authBtn").click(function(){

localStorage.removeItem("user");

window.location.reload();

});

}

});