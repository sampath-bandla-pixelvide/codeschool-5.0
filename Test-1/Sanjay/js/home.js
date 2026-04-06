$(document).ready(function () {
  let deliciousContainer = $("#superDelicious");
  let curatedContainer = $("#curatedCollections");
  let latestContainer = $("#latestRecipes");

  function appendToLatestRecipes(recipe) {
    let card = $(`
      <div class="card m-3 shadow-sm recipe-card">
        
        <img src="${recipe.image}" 
             style="width:100%; height:180px; object-fit:cover; border-radius:10px;" 
             alt="${recipe.name}">

        <h5 class="mt-2 fw-semibold">${recipe.name}</h5>
        
      </div>
    `);

    latestContainer.append(card);
  }

  function appendToCuratedContainer(recipe) {
    let card = $(`
      <div class="card m-3 shadow-sm" 
           style="width:30rem; border-radius:12px; overflow:hidden;">
        
        <img src="${recipe.image}" 
             style="height:250px; width:100%; object-fit:cover;" 
             alt="${recipe.name}">

        <div class="p-4 bg-light">
          <h3 class="fw-bold">${recipe.name}</h3>

          <div class="d-flex justify-content-end mt-3">
            <button class="btn btn-outline-dark">
              ${Math.floor(Math.random() * 200) + 50} Recipes
            </button>
          </div>
        </div>

      </div>
    `);

    curatedContainer.append(card);
  }

  function appendToDeliciousContainer(recipe) {
    let card = $(`
      <div class="card m-3 shadow-sm" 
           style="width:22rem; border-radius:10px; overflow:hidden;">
        
        <img src="${recipe.image}" class="card-img-top" 
             style="height:200px; object-fit:cover;" 
             alt="${recipe.name}">
        
        <div class="card-body bg-light">
            
            <div class="mb-2 text-warning">
                ${`<i class="bi bi-star-fill"></i>`.repeat(Math.round(recipe.rating))}
            </div>

            <h5 class="card-title fw-bold">${recipe.name}</h5>

            <div class="d-flex align-items-center my-2">
                <img src="https://i.pravatar.cc/40" 
                     class="rounded-circle me-2" width="30" height="30">
                <span class="fw-semibold">Chef User</span>
            </div>

            <div class="d-flex justify-content-between text-muted mt-3">
                <span><i class="bi bi-calendar4"></i> Yesterday</span>
                <span><i class="bi bi-chat-fill"></i> ${Math.floor(Math.random() * 500)}</span>
            </div>

        </div>
      </div>
    `);

    deliciousContainer.append(card);
  }

  function appendData(data) {
    data.slice(0, 6).forEach((recipe) => appendToDeliciousContainer(recipe));
    data.slice(0, 6).forEach((recipe) => appendToCuratedContainer(recipe));
    data.slice(0, 12).forEach((recipe) => appendToLatestRecipes(recipe));
  }

  fetch("https://dummyjson.com/recipes")
    .then((res) => res.json())
    .then((data) => {
      appendData(data.recipes);
    });

  let loginBtn = $("#loginBtn");
  let logoutBtn = $("#logoutBtn");

  let token = localStorage.getItem("token");

  if (token) {
    loginBtn.hide();
  } else {
    logoutBtn.hide();
  }

  loginBtn.on("click", function () {
    window.location.href = "./login.html";
  });

  logoutBtn.on("click", function () {
    localStorage.removeItem("token");
    window.location.replace("./login.html");
  });
});
