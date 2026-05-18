function loadUsers() {
  $("#usersList").html("<p class='text-center mt-3'>Loading...</p>");

  $.ajax({
    url: "/api/chat/users.php",
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    dataType: "json",
    success: function (res) {
      if (res.status) {
        renderUsers(res.data);
      } else {
        $("#usersList").html("<p class='text-danger text-center'>Failed</p>");
      }
    },
  });
}
function renderUsers(users) {
  let html = "";

  users.forEach((c) => {
   let avatar = c.profile_picture
      ? `<img src="${c.profile_picture}" class="rounded-circle me-3" style="width:45px;height:45px;object-fit:cover;flex-shrink:0;">`
      : `<div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3" style="width:45px;height:45px;flex-shrink:0;font-weight:500;">
          ${c.username.charAt(0).toUpperCase()}
        </div>`;

    html += `
      <div class="list-group-item list-group-item-action d-flex align-items-center user-item" data-id="${c.id}">
        ${avatar}
        <div class="ms-3">
          <div class="fw-semibold">${c.username}</div>
        </div>
      </div>
    `;
  });

  $("#usersList").html(html);
}

$(document)
.off("click", "#newChatBtn")
.on("click", "#newChatBtn", function () {
  $("#chatListPanel").addClass("d-none");
  $("#newChatPanel").removeClass("d-none");

  loadUsers();
});

$(document)
.off("click", "#backToChats")
.on("click", "#backToChats", function () {
  $("#newChatPanel").addClass("d-none");
  $("#chatListPanel").removeClass("d-none");
});

$(document)
.off("click", ".user-item")
.on("click", ".user-item", function () {
  let userId = $(this).data("id");
  let username = $(this).find(".fw-semibold").text();
  let avatarHTML = $(this).find("img, div").first().prop("outerHTML");

  $.ajax({
    url: "/api/chat/new-conversation.php",
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: { user_id: userId },
    dataType: "json",
    success: function (res) {
      if (res.status) {
        let cid = res.data.conversation_id;
        localStorage.setItem("activeConversation", cid);

        // switch back to chat view
        $("#newChatPanel").addClass("d-none");
        $("#chatListPanel").removeClass("d-none");

        $("#chatUserName").text(username);
        $("#chatUserAvatar").html(avatarHTML);
        $("#chatUserStatus").text("online");

        //  switch panels
        $("#newChatPanel").addClass("d-none");
        $("#chatListPanel").removeClass("d-none");

        loadConversations();
        loadMessages(cid);
      }
      else{
        alert(res.message);
      }
    },
  });
});


