let token = localStorage.getItem('token')
let videos = [];
$(document).ready(function(){
   $.ajax({
    type: "GET",
    dataType: "json",
    url: "./api/php-scripts/default.php",
    success: function (res) {
      if (res.status) {
        console.log(res.data);
        videos = res.data;
      }
    },
    error: function (err) {
      console.log(err.responseText);
    },
  });
})

$(".header").load("header.html");
$(".sidebar").load("sidebar.html");
if(!token){
  swal.fire("Error","Something went wrong! Logged out","error")
window.location.href = "./index.html";
}
let user = {}
$(".header").load("header.html", function () {
    $.ajax({
        type: 'POST',
        dataType: 'json',
        url: "./api/php-scripts/checkToken.php",
        data: { token: token },

        success: function (res) {
            console.log(res);

            if (res.status) {
                youtubeUI(res.data); 
                user=res.data
                console.log(user);
                
            } else {
              
                 Swal.fire("Error", res.message, "error").then(() => {
              window.location.href = "./index.html";
            });
            }
        },

        error: function (err) {
            console.log(err.responseText);
        }
    });
    

});
function logout() {
      let token = localStorage.getItem("token");
      $.ajax({
        type:"POST",
        dataType:"json",
        url : "./api/php-scripts/logout.php",
        data : {
          token
        },
        success:function(res){
          if(!res.status){
            Swal.fire("logoutError", res.message, "error");
          }
             Swal.fire("Logout", res.message, "success").then(() => {
               localStorage.removeItem("token");
  window.location.href = "./index.html";
            });
          
 
        },
        error:function(err){
          console.log(err.responseText);
        } 
      })
}
  $(document).on("click","#profileIcon",function(e){
    console.log("clicked");
        e.stopPropagation();

    let card = $("#profileCard");

        if(card.length){
      card.toggleClass("show");
      return;
    }
    if (!user || !user.username) {
  console.log("User not loaded yet");
  return;
}

      console.log("clicked")
      profile(user);
     
    })
   function profile(user){
    
    $("#profileCard").remove();
      let html = `
    <div id="profileCard"
         class="card shadow position-absolute end-0"
         style="width: 230px; z-index: 1000; margin-top:30px;">
      <div class="card-body p-3">
        <h6 class="card-title">Profile</h6>
        <p class="text-muted mb-0 small fs-6 italic">Name: ${user.username}</p>
        <p class="text-muted small mb-2 fs-6 italic">Email: ${user.email}</p>
        <button class="btn btn-danger logoutBtn w-100 btn-sm">
          Sign out <i class="bi bi-box-arrow-in-right"></i>
        </button>
      </div>
    </div>`;

    $("#profileWrapper").append(html);
     setTimeout(()=>{
      $("#profileCard").addClass("show");
    },10);
    }

 $(document).on("click", ".logoutBtn", function(){
    logout();
  });
    


function youtubeUI(user){
  
        $("#innerEnd").addClass('d-none');
        $("#end").append(`
            <div class="d-flex flex-row align-items-center ms-1 me-2">
            <button class="btn btn-outline-dark px-2 rounded-pill border d-none d-md-flex postBtn">
            <i class="bi bi-plus fw-bold text-white"></i><span class="ms-1  text-white" >Create</span></button>
            <div id="postWrapper" class="position-relative">
             </div>
             <i class="bi bi-upload text-white d-flex d-md-none postBtn"></i>
            <button class="btn rounded-circle p-0 mx-3"><i class="bi bi-bell text-white fs-5"></i></button>
            <div id="profileWrapper" class="position-relative">
      <button class="btn p-0" id="profileIcon">
        <i class="bi bi-person-circle fs-4 text-white"></i>
      </button>
    </div>
            </div>`);

            
            
            $(".sidebar-signIn").addClass('d-none');
          
}
function liked(token, liked, videoId) {
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "./api/php-scripts/likes.php",
    data: { token, liked, video_id: videoId},
    success: function (res) {
      let $btn = $(".like-btn[data-video-id='" + videoId + "']");
      if (res.status) {
        if (liked) {
          $btn.find("i")
            .removeClass("bi-hand-thumbs-up")
            .addClass("bi-hand-thumbs-up-fill");
        } else {
          $btn.find("i")
            .removeClass("bi-hand-thumbs-up-fill")
            .addClass("bi-hand-thumbs-up");
        }
        $btn.siblings(".like-count").text("Likes " + res.data.likes);
      } else {
        if(res.message=="token is null"){
          window.location.href = "./signIn.html";
        }
        else{
          console.log(res.message)
        }
      }
    },
    error: function (err) {
      console.log(err.responseText);
    },
  });

}

$(document).on('click', ".postBtn", function(e){
    e.stopPropagation();

    let card = $("#postCard"); 
    if(card.length){
        card.toggleClass("show");
        return;
    }
    dropdown();
});

function dropdown(){
    $("#postCard").remove();
    let html = `
    <div id="postCard"
     class="card shadow position-absolute end-0 bg-black text-white border-rounded-3"
     style="width: 230px; z-index: 1000; margin-top:20px;">
  <ul class="list-group list-group-flush dropDown">
    <li class="list-group-item bg-black text-white btn border-dark d-flex align-items-center justify-content-center" id="uploadVideo"><i class="bi bi-play-btn fs-5"></i><span class="ms-2">Upload video</span></li>
    <li class="list-group-item bg-black text-white btn border-dark d-flex align-items-center justify-content-center"><i class="bi bi-broadcast"></i><span class="ms-2">Go live</span></li>
    <li class="list-group-item bg-black text-white btn border-dark d-flex align-items-center justify-content-center"><i class="bi bi-pencil-square"></i><span class="ms-2">Create post</span></li>
  </ul>
</div>
`
    $("#postWrapper").append(html);
    
}


$(document).click(function(){
    $("#profileCard").remove();
    $("#postCard").remove();
});


 
 

