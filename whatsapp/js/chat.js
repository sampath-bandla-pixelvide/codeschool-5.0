// $("#sendBtn").click(function () {
//   const content = $("#messageInput").val().trim();
//   const conversationId = localStorage.getItem("activeConversation");

//   if (!conversationId) {
//     alert("Select a chat first");
//     return;
//   }

//   if (!content) return;

//   $.ajax({
//     url: "/api/chat/send.php",
//     method: "POST",
//     headers: {
//       Authorization: "Bearer " + localStorage.getItem("token"),
//     },
//     data: {
//       conversation_id: conversationId,
//       content: content,
//     },
//     success: function (res) {
//       if (res.status) {
//         // backend should return is_mine
//         appendMessage(res.data);

//         $("#messageInput").val("");
//       } else {
//         alert(res.message);
//       }
//     },
//   });
// });
$("#sendBtn").click(function () {
  const conversationId = localStorage.getItem("activeConversation");
  const content = $("#messageInput").val().trim();

  if (!conversationId) {
    alert("Select chat first");
    return;
  }

  let formData = new FormData();

  formData.append("conversation_id", conversationId);

  if (selectedFile) {
    formData.append("file", selectedFile);
    formData.append("message_type", "media");
  } else {
    if (!content) return;
    formData.append("content", content);
    formData.append("message_type", "text");
  }

  $.ajax({
    url: "/api/chat/send.php",
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: formData,
    processData: false,
    contentType: false,
    success: function (res) {
      if (res.status) {
        // appendMessage(res.data);
        loadMessages(localStorage.getItem("activeConversation"))

        $("#messageInput").val("");
        $("#fileInput").val("");
        selectedFile = null;
        $("#mediaPreview").addClass("d-none");
      } else {
        alert(res.message);
      }
    },
  });
});

function loadMessages(conversationId) {
  $.ajax({
    url: "/api/chat/messages.php",
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: {
      conversation_id: conversationId,
    },
    success: function (res) {
      if (res.status) {
        renderMessages(res.data);

        // safer header logic
        if (res.data.length > 0 && res.data[0].user) {
          updateChatHeader(res.data[0].user);
        }
      }
    },
  });
}

function renderMessages(messages) {
  let html = "";

  messages.forEach((m) => {
    // if(m.deleted_for_me) return;

    let ticks = m.is_mine ? getTicks(m.status) : "";
    let contentHTML = "";
   console.log("hi-2")
    if(m.deleted_for_everyone){
      console.log("hi-3")
      contentHTML=`<em class="text-muted">This msg was deleted</em>`
    }

    else if (m.message_type === "text") {
      contentHTML = m.content;
    }

    //  MEDIA MESSAGE
    else if (m.message_type === "media") {
      // detect image
      if (m.file_path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        contentHTML = `
        <img src="${m.file_path}" 
             style="max-width:200px;border-radius:10px;display:block;">
      `;
      }

      // video
      else if (m.file_path.match(/\.(mp4|webm|ogg)$/i)) {
        contentHTML = `
        <video controls style="max-width:200px;border-radius:10px;">
          <source src="${m.file_path}">
        </video>
      `;
      }

      // other files (pdf, doc, etc.)
      else {
        let fileName = m.file_path.split("/").pop();

        contentHTML = `
  <a href="${m.file_path}" target="_blank" 
     class="text-decoration-none text-dark">

    <div class="p-2 bg-white border rounded d-flex align-items-center" 
         style="max-width:250px; cursor:pointer;">

      <i class="bi bi-file-earmark me-2"></i>

      <div class="text-truncate">
        ${fileName}
      </div>

    </div>

  </a>
`;
      }
    }

    html += `
      <div class="mb-2 ${m.is_mine ? "text-end" : ""}" data-id="${m.id}">
        <div class="${m.is_mine ? "bg-success-subtle" : "bg-white"} p-2 rounded d-inline-block msg">
          
          ${contentHTML}

          <small class="text-muted ms-2">
            ${formatTime(m.created_at)} ${ticks}
          </small>

        </div>
      </div>
    `;
  });

  $("#chatMessages").html(html);

  $("#chatMessages").scrollTop($("#chatMessages")[0].scrollHeight);
}

// function appendMessage(msg) {
//   let ticks = msg.is_mine ? getTicks(msg.status) : "";
//   let html = `
//     <div class="mb-2 ${msg.is_mine ? "text-end" : ""}">
//       <div class="${msg.is_mine ? "bg-success-subtle" : "bg-white"} p-2 rounded d-inline-block message-bubble">

//         ${msg.content}

//         <small class="text-muted ms-2">
//           ${formatTime(msg.created_at)}  ${ticks}
//         </small>

//       </div>
//     </div>
//   `;

//   $("#chatMessages").append(html);

//   $("#chatMessages").scrollTop($("#chatMessages")[0].scrollHeight);
//   loadConversations(msg.user_id);
// }

function appendMessage(msg) {
  let ticks = msg.is_mine ? getTicks(msg.status) : "";

  let contentHTML = "";

  // TEXT MESSAGE
  if (msg.message_type === "text") {
    contentHTML = msg.content;
  }

  //  MEDIA MESSAGE
  else if (msg.message_type === "media") {
    // detect image
    if (msg.file_path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      contentHTML = `
        <img src="${msg.file_path}" 
             style="max-width:200px;border-radius:10px;display:block;">
      `;
    }

    // video
    else if (msg.file_path.match(/\.(mp4|webm|ogg)$/i)) {
      contentHTML = `
        <video controls style="max-width:200px;border-radius:10px;">
          <source src="${msg.file_path}">
        </video>
      `;
    }

    // other files (pdf, doc, etc.)
    else {
      let fileName = msg.file_path.split("/").pop();
      let icon = "bi-file-earmark";
      contentHTML = `
  <div class="p-2 bg-white border rounded d-inline-flex align-items-center" 
       style="max-width:250px;">

    <i class="bi ${icon} fs-4 me-2"></i>

    <div class="flex-grow-1">
      <div class="text-truncate">${fileName}</div>
      <small class="text-muted">Click to open</small>
    </div>

  </div>
`;
    }
  }

  let html = `
    <div class="mb-2 ${msg.is_mine ? "text-end" : ""}">
      <div class="${msg.is_mine ? "bg-success-subtle" : "bg-white"} 
                  p-2 rounded d-inline-block message-bubble">

        ${contentHTML}

        <small class="text-muted ms-2">
          ${formatTime(msg.created_at)} ${ticks}
        </small>

      </div>
    </div>
  `;

  $("#chatMessages").append(html);
  $("#chatMessages").scrollTop($("#chatMessages")[0].scrollHeight);

  loadConversations();
  loadMessages(localStorage.getItem("activeConversation"));
}

function updateChatHeader(user) {
  let avatar = user.profile_picture
    ? `<img src="${user.profile_picture}" class="rounded-circle me-2" style="width:45px;height:45px;object-fit:cover;flex-shrink:0;">`
    : `<div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-2" style="width:40px;height:40px;">
        ${user.username.charAt(0).toUpperCase()}
      </div>`;

  $("#chatUserAvatar").html(avatar);
  $("#chatUserName").text(user.username);

  if (user.last_seen) {
    $("#chatUserStatus")
      .removeClass("text-success")
      .text("last seen " + formatLastSeen(user.last_seen));
  } else {
    $("#chatUserStatus").text("");
  }
}
function formatLastSeen(time) {
  if (!time) return "";

  const date = new Date(time);
  const now = new Date();

  const diff = (now - date) / 1000;

  // just now
  if (diff < 60) return "just now";

  // minutes ago
  if (diff < 3600) return Math.floor(diff / 60) + " minutes ago";

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.floor((today - msgDay) / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays === 0) {
    return "today at " + timeStr;
  }

  if (diffDays === 1) {
    return "yesterday at " + timeStr;
  }

  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "long" }) + " at " + timeStr;
  }

  return date.toLocaleDateString();
}

function loadConversations(search = "") {
  $.ajax({
    url: "/api/chat/conversations.php",
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: {
      search: search,
    },
    success: function (res) {
      if (res.status) {
        renderConversations(res.data);
      }
    },
  });
}

function renderConversations(conversations) {
  let html = "";

  let activeId = Number(localStorage.getItem("activeConversation"));

  conversations.forEach((c) => {
    let avatar = c.profile_picture
      ? `<img src="${c.profile_picture}" class="rounded-circle me-3" style="width:45px;height:45px;object-fit:cover;flex-shrink:0;">`
      : `<div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3" style="width:45px;height:45px;flex-shrink:0;font-weight:500;">
          ${c.username.charAt(0).toUpperCase()}
        </div>`;

    let ticks = c.is_last_mine ? getTicks(c.last_status) : "";
    // let prefix = c.is_last_mine ? "You: " : "";

    let lastMsg = c.last_message
      ? c.last_message.length > 40
        ? c.last_message.substring(0, 20) + "..."
        : c.last_message
      : "media";

    let time = c.last_time ? formatLastMsgTime(c.last_time) : "";
    let unread =
      c.unread_count > 0
        ? `<span class="badge bg-success rounded-pill ms-2">${c.unread_count}</span>`
        : "";

    html += `
      <div class="d-flex align-items-center p-3 chat-item 
           ${c.conversation_id == activeId ? "bg-light" : ""}" 
           data-id="${c.conversation_id}" style="cursor:pointer;">

        ${avatar}

        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-center">
    <div class="fw-semibold">${c.username}</div>
    <small class="text-muted">${time}</small>
  </div>
  <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">
          ${c.is_last_mine ? ticks + " " + lastMsg : lastMsg}
        </small>

        ${unread}
      </div>

        </div>

      </div>
    `;
  });

  $("#chatList").html(html);
}

// $(document).on("click", ".chat-item", function () {
//   let cid = $(this).data("id");

//   let username = $(this).find(".fw-semibold").text();

//   let avatarHTML = $(this).find("img, div").first().prop("outerHTML");

//   localStorage.setItem("activeConversation", cid);

//   $("#chatUserName").text(username);
//   $("#chatUserAvatar").html(avatarHTML);
//   $("#chatUserStatus").text();
//   $("#rightHeader").removeClass("d-none");

//   loadMessages(cid);

//   $(".chat-item").removeClass("bg-light");
//   $(this).addClass("bg-light");
// });
$(document).on("click", ".chat-item", function () {
  let cid = $(this).data("id");

  localStorage.setItem("activeConversation", cid);

  $("#rightHeader").removeClass("d-none");

  loadMessages(cid);

  $.ajax({
    url: "/api/auth/lastseen.php",
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    data: {
      conversation_id: cid,
    },
    success: function (res) {
      if (res.status) {
        updateChatHeader(res.data);
      }
    },
  });
  loadMessages(cid);
  loadConversations();

  $(".chat-item").removeClass("bg-light");
  $(this).addClass("bg-light");
});

function formatLastMsgTime(time) {
  if (!time) return "";

  const msgDate = new Date(time);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(
    msgDate.getFullYear(),
    msgDate.getMonth(),
    msgDate.getDate(),
  );
  const diffDays = Math.floor((today - msgDay) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return msgDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return msgDate.toLocaleDateString([], { weekday: "long" });
  }
  return msgDate.toLocaleDateString();
}
function formatTime(time) {
  const date = new Date(time);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTicks(status) {
  if (status === "sent") {
    return `<i class="bi bi-check text-muted fs-5"></i>`;
  }
  if (status === "read") {
    return `<i class="bi bi-check-all text-primary fs-5"></i>`;
  }
  return "";
}

$(document).on("keydown", "#messageInput", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    $("#sendBtn").click();
  }
});

//file upload
$(document).on("click", "#attachBtn", function () {
  $("#fileInput").click();
});
let selectedFile = null;

$(document).on("change", "#fileInput", function () {
  selectedFile = this.files[0];

  if (selectedFile) {
    console.log("Selected:", selectedFile.name);
    // later: preview UI
  }
});

//preview
// let selectedFile = null;
$(document).on("change", "#fileInput", function () {
  const file = this.files[0];
  if (!file) return;
  selectedFile = file;
  if (file.type.startsWith("image")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      $("#previewImg").attr("src", e.target.result);
      $("#mediaPreview").removeClass("d-none");
    };
    reader.readAsDataURL(file);
  }
});

$(document).on("click", "#removePreview", function () {
  selectedFile = null;
  $("#fileInput").val("");
  $("#mediaPreview").addClass("d-none");
});


// $(document).on("click",".msg", function () {

//   // console.log("hi")
//   if (!$(this).closest(".text-end").length) return;

//   let messageId = $(this).closest("[data-id]").data("id");

//   // let choice = confirm("Delete for everyone?\nCancel = delete for me");
//   // let type = choice ? "everyone" : "me";
//   let confirmDelete = confirm("Delete for everyone?");
//   if (!confirmDelete) return;
//   let type="everyone";

//   $.ajax({
//     url: "/api/chat/delete-message.php",
//     method: "POST",
//     headers: {
//       Authorization: "Bearer " + localStorage.getItem("token")
//     },
//     data: {
//       message_id: messageId,
//       type: type
//     },
//     success: function () {
//       console.log(messageId,type)

//       loadMessages(localStorage.getItem("activeConversation"));
//     }
//   });

// });

let deleteMessageId = null;
// open modal
$(document).on("click", ".msg", function () {
  if (!$(this).closest(".text-end").length) return;
  deleteMessageId = $(this).closest("[data-id]").data("id");
  $("#deleteModal").removeClass("d-none");
}); 

$("#cancelDelete").click(function () {
  $("#deleteModal").addClass("d-none");
  deleteMessageId = null;
});

$("#confirmDelete").click(function () {

  if (!deleteMessageId) return;

  $.ajax({
    url: "/api/chat/delete-message.php",
    method: "POST",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    },
    data: {
      message_id: deleteMessageId,
      type: "everyone"
    },
    success: function () {
      $("#deleteModal").addClass("d-none");
      loadMessages(localStorage.getItem("activeConversation"));
    }
  });

});