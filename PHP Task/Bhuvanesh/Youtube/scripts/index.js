$(document).ready(function () {
  let videos = [];
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

  $(document).on("click", "#sidetoggleBtn", function (e) {
    e.preventDefault();
    $(".sidebarItems").toggleClass("d-none");

    if ($(".sidebarItems").hasClass("d-none")) {
      $(this).find("span").text("Show more");
    } else {
      $(this)
        .find("svg")
        .html(
          `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit; width: 100%; height: 100%;"><path d="M5.293 15.207a1 1 0 001.414 0L12 9.914l5.293 5.293a1 1 0 101.414-1.414L12 7.086l-6.707 6.707a1 1 0 000 1.414Z"></path></svg>`,
        );
      $(this).find("span").text("Show less");
    }
  });

  $(document).on("focus", "#searchInput", function () {
    $(".search-box").addClass("active");
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest(".search-box").length) {
      $(".search-box").removeClass("active");
    }
  });
  $(window).on("scroll", function () {
    if ($(this).scrollTop() > 10) {
      $(".header").addClass("scrolled");
    } else {
      $(".header").removeClass("scrolled");
    }
  });
  $(document).on("click", "#sidebartoggleBtn" ,function () {
    
    $(".sidebar-toggle").toggleClass("d-none");
    $(".on-toggle").toggleClass("d-none");
    $(".mainContent").toggleClass("offset-2 fixed-margin");
    $(".frame").toggleClass("mainCard-width col-lg-4 col-lg-3")
   
  });



  $(document).on("click", "#home", function (e) {
    e.preventDefault();
    $.ajax({
      type: "GET",
      dataType: "json",
      url: "./api/php-scripts/default.php",
      success: function (res) {
        if (res.status) {
          console.log(res.data);

          Default(res.data);
        }
      },
      error: function (err) {
        console.log(err.responseText);
      },
    });
  });
  console.log(videos);
  function Default(data) {
    let $container = $(".mainContent");
    $container.removeClass("justify-content-center");
    $container.addClass("justify-content-md-evenly");
    $container.empty();

    data.forEach((video) => {
      $container.append(`<div class="card bg-black shadow card-cursor mainCard-width frame  col-sm-11 col-md-6 rounded-2 ms-1 mb-3 col-lg-4" style="background-color:#212121; border:none;"  data-video='${JSON.stringify(video)}'>
  <div class="ratio ratio-16x9">
  <img 
    src="${video.thumbnail_path || "https://picsum.photos/400/225"}"
    class="w-100 h-100 object-fit-cover rounded-top  video-thumb"
    alt="video thumbnail"
    data-img="${video.thumbnail_path}"
    data-src = "${video.file_path}">

</div>

  <div class="card-body text-white large-video">
  <div class="d-flex flex-row justify-content-between align-items-center ">
    <h6 class="card-title fw-bold mb-1">
      ${video.title}
    </h6>

    <p class="mb-1 rounded-pill px-1 border badge d-inline" style="color:#a6a6a6; font-size:14px;">
      ${video.duration} 
    </p>
   </div>

    <p class="card-text" style="color:#a6a6a6; font-size:13px;">
      ${video.description}
    </p>
  </div>
</div>`);
    });
    data.forEach((video) => {
      placeholderDefault();
    });
  }
  function placeholderDefault() {
    let $container = $(".mainContent");
    
    $container.append(`<div class="card frame mainCard-width shadow col col-md-6  rounded-2  mb-3 col-lg-4" style="background-color:#212121; border:none;">
  <div class="ratio ratio-16x9 placeholder-glow">
    <iframe 
    class="rounded-2 placeholder"
      src=""
      title="YouTube video"
      allowfullscreen>
    </iframe>
  </div>

  <div class="card-body placeholder-glow  d-flex flex-column text-white">
    <h6 class="card-title fw-bold mb-1 placeholder">
     video-tile
    </h6>

    <p class="mb-1 placeholder " style="color:#a6a6a6; font-size:14px;">
      video-duration
    </p>

    <p class="card-text placeholder" style="color:#a6a6a6; font-size:13px;">
      video-description
    </p>
  </div>
</div>`);
  }

  function searchVideos() {
    let search = $("#searchInput").val();

    if (search === "") {
      console.log("Empty search");
      return;
    }

    $.ajax({
      type: "POST",
      dataType: "json",
      url: "./api/php-scripts/search.php",
      data: { search: search },
      success: function (res) {
        if (res.status) {
          console.log(res.data);
          Default(res.data);
        } else {
          console.log(res.message);
        }
      },
      error: function (err) {
        console.log(err.responseText);
      },
    });
  }

  let comments = [];
  $(document).on("click", ".searchSubmitBtn", function (e) {
    e.preventDefault();
    searchVideos();
  });
  $(document).on("click", ".signInBtn", function () {
    window.location.href = "./signIn.html";
  });
  $(document).on("click", ".large-video", function () {
    let video = $(this).closest(".frame").data("video");

    let video_id = video.id
    $("#center").addClass("d-none");
    $(".sidebar").addClass("d-none");
    $("#sidebartoggleBtn").addClass("d-none");

    $(".mainContent").removeClass("offset-2");
   
    $(".mainContent").html(`
  <div class="row w-100" id="inner-content">

    <div class="col col-md-6 col-lg-9 d-flex flex-column">
      <div class="card shadow rounded-2 mx-2 bg-black border-none"
        >

        <div class="ratio ratio-16x9">
          <iframe 
            class="rounded-2"
            src="${video.file_path}"
            allowfullscreen>
          </iframe>
        </div>

        <div class="card-body text-white">
          <div class="d-flex justify-content-between align-items-center">
          <h1 class="fw-bold m-0">${video.title}</h1>
          <div class="d-flex align-items-center justify-content-center">
<span class="btn fs-1 like-btn" data-video-id="${video.id}">
  <i class="bi ${video.liked ? "bi-hand-thumbs-up-fill" : "bi-hand-thumbs-up"}"></i>
</span>


<p class="badge fs-5 me-3 mt-3 rounded text-bg-dark like-count">
  Likes ${video.likes}
</p>
          <p class="badge mt-3 text-bg-dark  rounded fs-5">${video.duration}</p>
          </div></div>
           <p class="text-light">${video.description}</p>
        </div>
      </div>
      <div class="card shadow rounded-2 mx-2 mt-0 p-0 h-100 bg-black" 
        >
       <div class = "border p-3">
        <div class="ms-3 p-0"><i class="bi text-white ms-1 fs-4 bg-secondary bi-person"></i><p class="text-start badge fs-4 text-white ms-2" id="userName"></p></div>
        <form
            class="d-flex align-items-center text-white border mx-3 rounded-3"
          >
          
            <div class="input-group border-none text-white w-100">
              <input
                type="text"
                class="form-control border-none bg-transparent text-white"
                placeholder="comment on post"
                id="comment"
              />
              <button
                class="btn comment-post-btn"
                style="background-color: #212121"
                  data-video-id="${video.id}"
              >
               <i class="bi text-white bi-arrow-right"></i>
              </button>
            </div>
          </form></div>
          <div class="p-2  mt-3 comment_display " >

          </div>
        </div>
     
    </div>
    <div class="col-lg-3 h-100 d-flex " id="side-col">
    <div class = "card bg-black d-flex flex-column bg-black border-none">
    <div id="side-card_display" class="d-flex flex-column border-bottom">
    </div>
    <div id="placeholderCards" class="mt-3">
    </div> 
    
    </div>

  </div>
`);
    cardDefault(videos, "#side-card_display");
    // placeholderCards(videos,"#placeholderCards");
    comment_fetch(video_id,".comment_display");
    if (user && user.username) {
  $("#userName").text(user.username);
}
  });

  function cardDefault(data, container) {
    let $container = $(container);

    data.forEach((video) => {
      $container.append(`
       <div class="card mb-3 bg-black frame card-cursor" style="min-width: 300px;" data-video='${JSON.stringify(video)}'>
        <div class="row g-0">
          <div class="col-8">
            <div class="ratio ratio-16x9">
              <img 
                src="${video.thumbnail_path || "https://picsum.photos/400/225"}"
                class="w-100 h-100 object-fit-cover video-thumb"
                data-src="${video.file_path}"
                data-img="${video.thumbnail_path}">
            </div>
          </div>

          <div class="col-4 text-white large-video">
            <div class="card-body p-1">
              <h6 class="fw-bold mb-1">${video.title}</h6>
              <p class="badge border">${video.duration}</p>
              <p style="font-size:10px;">${video.description}</p>
            </div>
          </div>
        </div>
      </div>
  `);
    });
  }
  function placeholderCards(data,container){
     let $container = $(container);

    data.forEach((video) => {
      $container.append(`
       <div class="card mb-3 bg-black card-cursor placeholder-glow" style="min-width: 300px;"'>
        <div class="row g-0">
          <div class="col-8">
            <div class="ratio ratio-16x9 placeholder">
              <img 
                src
                class="w-100 h-100 object-fit-cover"
                data-src=""
                data-img="">
            </div>
          </div>

          <div class="col-4 text-white">
            <div class="card-body p-1  placeholder-glow">
              <h6 class="fw-bold mb-1 placeholder">video.title</h6>
              <p class="badge border placeholder">video.duration</p>
              <p style="font-size:10px; "class="placeholder">video.description</p>
            </div>
          </div>
        </div>
      </div>
  `);
    });
  }
  $(document).on("mouseenter", ".video-thumb", function () {
    let src = $(this).data("src");
    let img = $(this).data("img");

    $(this).replaceWith(`
    <iframe 
      class="w-100 h-100 video-frame"
      src="${src}?autoplay=1&mute=1"
      data-src="${src}"
      data-img="${img}"
      allowfullscreen>
    </iframe>
  `);
  });
  $(document).on("mouseleave", ".video-frame", function () {
    let src = $(this).data("src");
    let img = $(this).data("img");

    $(this).replaceWith(`
    <img 
      src="${img || "https://picsum.photos/400/225"}"
      class="w-100 h-100 object-fit-cover video-thumb"
      data-src="${src}"
      data-img="${img}"
    >
  `);
  });
  $(document).on('click','.like-btn',function(e){
     e.preventDefault();

  let videoId = $(this).data("video-id");
  let token = localStorage.getItem("token");
  let isLiked = $(this).find("i").hasClass("bi-hand-thumbs-up-fill");
   liked(token, !isLiked, videoId);
  })

  $(document).on('click','.comment-post-btn',function(e){
    e.preventDefault();
    let video_id = $(this).data("video-id");
    console.log(video_id)
   let comment = $("#comment").val();
   let token = localStorage.getItem("token");
   post_comment(token,comment,video_id);
  })
function comment_fetch(video_id, container){
  $.ajax({
    type : 'POST',
    dataType : 'json',
    url: './api/php-scripts/comments.php',
    data : { video_id : video_id },
    success:function(res){
      if(res.status){
        console.log(res.data);
        display_comments(res.data, container); 
      } else {
        console.log(res.message);
      }
    },
    error:function(err){
      console.log(err.responseText);
    }
  })
}

function display_comments(comments, container){
  let $container = $(container);  
  $container.empty();
  //   if (!Array.isArray(comments)) {
  //   comments = [comments];
  // }
  comments.forEach((comment)=>{
    $container.append(`
      <div class="border-bottom border-dark pt-3">
      <div class="ms-3 p-0 d-flex align-content-center text-white">
        <img
              class="dm-avatar"
              src="https://ui-avatars.com/api/?name=${comment.username}&background=ab47bc&color=fff&size=24"
              alt=""
            /> <span class="ms-2">${comment.username}</span>
      </div>
      <p class="text-white  ms-4 text-start">${comment.comment_text}</p>
      </div>
    `);
  });
}
function post_comment(token,comment,video_id){
  $.ajax({
    type : 'POST',
    dataType:'json',
    url:'./api/php-scripts/post-comment.php',
    data:{
      token:token,
      comment:comment,
      video_id:video_id
    },
    success:function(res){
      if(res.status){
        console.log(res.message);
         $("#comment").val("");
        let video = videos.find(v => v.id === video_id);
if(video){
  $(`.frame[data-video='${JSON.stringify(video)}'] .large-video`).trigger("click");

        
        comment_fetch(video_id, ".comment_display");
        }
        
      }else{
        if(res.message=="token is null"){
          window.location.href = "./signIn.html";
        }
        else{
          console.log(res.message)
        }
      }
    },
    error:function(err){
      console.log(err.responseText)
    }
  })
  

}   
});
