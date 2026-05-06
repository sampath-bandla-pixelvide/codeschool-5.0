function loadConversations() {
  const $list = $("#convList").empty();
  const $dm = $("#dmList").empty();

  for (let i = 0; i < 5; i++) {
    $list.append(
      '<div class="conv-row d-flex align-items-center gap-3 pe-none placeholder-glow" style="cursor:default">' +
        '<div class="placeholder rounded-circle" style="width:40px; height:40px; background-color:#3a3c40;"></div>' +
        '<div class="flex-grow-1 overflow-hidden">' +
        '<div class="placeholder col-4" style="background-color:#3a3c40; height:14px;"></div>' +
        '<div class="placeholder col-8 mt-1" style="background-color:#3a3c40; display:block; height:12px;"></div>' +
        "</div>" +
        "</div>",
    );
    $dm.append(
      '<div class="d-flex align-items-center gap-3 pe-none placeholder-glow px-3 py-2">' +
        '<div class="placeholder rounded-circle" style="width:28px; height:28px; background-color:#3a3c40;"></div>' +
        '<div class="placeholder col-6" style="background-color:#3a3c40; height:12px;"></div>' +
        "</div>",
    );
  }

  $.ajax({
    url: "./api/get_conversations.php",
    method: "POST",
    data: { token: token },
    dataType: "json",
    success: function (res) {
      if (res.status && res.data && res.data.conversations) {
        ChatApp.setConversations(res.data.conversations);
        renderConvList(res.data.conversations);
        renderSidebarDMs(res.data.conversations);
      } else {
        ChatApp.setConversations([]);
        renderConvList([]);
        renderSidebarDMs([]);
      }
    },
    error: function () {
      renderConvList([]);
      renderSidebarDMs([]);
    },
  });
}

function renderConvList(list) {
  const $list = $("#convList").empty();

  if (list.length === 0) {
    $list.append(
      '<div class="d-flex flex-column align-items-center justify-content-center py-5" style="color:#9aa0a6">' +
        '<span class="material-icons mb-2" style="font-size:48px">chat_bubble_outline</span>' +
        '<p style="font-size:16px; margin-bottom:4px">No conversations yet</p>' +
        '<button id="startChatFromEmpty" class="btn btn-sm rounded-pill px-4 mt-2" style="background:#8ab4f8; color:#202124; font-size:13px">Start a chat</button>' +
        "</div>",
    );
    $("#startChatFromEmpty").on("click", function () {
      $("#newChatPopup").removeClass("d-none");
      $("#newChatEmail").focus();
    });
    return;
  }

  for (let i = 0; i < list.length; i++) {
    let conv = list[i];
    const name = conv.first_name + " " + conv.last_name;
    const avatarHtml =
      '<img src="' +
      getAvatarUrl(conv, 40) +
      '" class="rounded-circle" width="40" height="40" />';

    const rawPreview = conv.last_message || "";
    const preview = /\.(jpg|jpeg|png|gif|webp)$/i.test(rawPreview)
      ? "📷 Image"
      : rawPreview;
    const time = conv.last_time ? timeAgo(conv.last_time) : "";
    const unread = parseInt(conv.unread_count) || 0;

    let unreadBadge = "";
    if (unread > 0) {
      unreadBadge =
        '<span style="background:#1a73e8; color:#fff; font-size:11px; border-radius:10px; padding:1px 7px; min-width:20px; text-align:center">' +
        unread +
        "</span>";
    }

    const row =
      '<div class="conv-row d-flex align-items-center gap-3" data-unread="' +
      unread +
      '">' +
      avatarHtml +
      '<div class="flex-grow-1 overflow-hidden">' +
      '<div class="conv-name">' +
      name +
      "</div>" +
      '<div class="conv-preview">' +
      preview +
      "</div>" +
      "</div>" +
      '<div class="d-flex flex-column align-items-end gap-1">' +
      '<div class="conv-time">' +
      time +
      "</div>" +
      unreadBadge +
      "</div>" +
      "</div>";

    $list.append(row);
  }
}

function renderSidebarDMs(list) {
  const $dm = $("#dmList").empty();

  for (let i = 0; i < list.length; i++) {
    const name = list[i].first_name + " " + list[i].last_name;
    let displayName = name.length > 18 ? name.substring(0, 18) + "..." : name;

    let btn =
      '<button class="nav-item-btn d-flex align-items-center gap-3 me-3" data-dm-index="' +
      i +
      '">' +
      '<img src="' +
      getAvatarUrl(list[i], 28) +
      '" class="rounded-circle" width="28" height="28" />' +
      '<span class="sidebar-text">' +
      displayName +
      "</span>" +
      "</button>";

    $dm.append(btn);
  }
}
