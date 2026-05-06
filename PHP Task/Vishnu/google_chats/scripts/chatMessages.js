function openChat(chatUser) {
  currentChatUser = chatUser;
  const fullName = chatUser.first_name + " " + chatUser.last_name;
  const otherUserId = chatUser.user_id || chatUser.id;

  $("#chatUserAvatar").replaceWith(
    '<img id="chatUserAvatar" src="' +
      getAvatarUrl(chatUser, 32) +
      '" class="rounded-circle" width="32" height="32" />',
  );
  $("#chatUserName").text(fullName);
  $("#chatUserStatus").text("");
  $("#chatUserInfoPanel").addClass("d-none");

  $.ajax({
    url: "./api/get_user_details.php",
    method: "POST",
    data: { token: token, user_id: otherUserId },
    dataType: "json",
    success: function (res) {
      if (res.status && res.data && res.data.user) {
        const u = res.data.user;
        const statusMap = {
          active: "Active",
          dnd: "Do not disturb",
          away: "Away",
        };
        let statusText = statusMap[u.status] || "Active";

        $("#chatUserStatus").text(statusText);
        $("#infoPanelAvatar").attr("src", getAvatarUrl(u, 72));
        $("#infoPanelName").text(u.first_name + " " + u.last_name);
        $("#infoPanelEmail").text(u.email);
        $("#infoPanelStatus").text(statusText);

        let joined = new Date(u.created_at);
        $("#infoPanelJoined").text(
          joined.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          }),
        );
      }
    },
  });

  $("#homeView").addClass("d-none");
  $("#chatView").removeClass("d-none");
  $("#chatMsgInput").focus();
  loadMessages(otherUserId);
}

function loadMessages(otherUserId) {
  const $area = $("#chatMessages").empty();

  $area.append(
    '<div class="placeholder-glow w-100 d-flex flex-column gap-3 py-3">' +
      '<div class="placeholder" style="width:60%; height:40px; border-radius:12px; background-color:#2d2f33; align-self:flex-start"></div>' +
      '<div class="placeholder" style="width:40%; height:40px; border-radius:12px; background-color:#1e3a5f; align-self:flex-end"></div>' +
      '<div class="placeholder" style="width:70%; height:60px; border-radius:12px; background-color:#2d2f33; align-self:flex-start"></div>' +
      '<div class="placeholder" style="width:50%; height:40px; border-radius:12px; background-color:#1e3a5f; align-self:flex-end"></div>' +
      "</div>",
  );

  $.ajax({
    url: "./api/get_messages.php",
    method: "POST",
    data: { token: token, other_user_id: otherUserId },
    dataType: "json",
    success: function (res) {
      const $area = $("#chatMessages").empty();

      if (
        res.status &&
        res.data &&
        res.data.messages &&
        res.data.messages.length
      ) {
        const messages = res.data.messages;
        let lastDateCategory = null;

        for (let i = 0; i < messages.length; i++) {
          const msg = messages[i];
          const dateCategory = getMessageDateDivider(msg.send_at);

          if (dateCategory !== lastDateCategory) {
            $area.append(
              '<div class="w-100 text-center my-3">' +
                '<span style="background:#2d2f33; color:#9aa0a6; font-size:12px; padding:4px 12px; border-radius:12px;">' +
                dateCategory +
                "</span>" +
                "</div>",
            );
            lastDateCategory = dateCategory;
          }
          const isMine = msg.message_from == user.id;
          const time = new Date(msg.send_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const isMedia =
            msg.is_media === true || msg.is_media === "t" || msg.is_media === 1;

          let contentHtml = "";
          if (isMedia) {
            contentHtml =
              '<img src="' +
              msg.message_content +
              '" style="max-width:100%; max-height:300px; border-radius:8px; display:block" />';
          } else {
            let safeText = $("<span>").text(msg.message_content).html();
            contentHtml = "<div>" + highlightMentions(safeText) + "</div>";
          }

          const isStarred =
            msg.is_starred === true ||
            msg.is_starred === "t" ||
            msg.is_starred === 1 ||
            msg.is_starred === "1";
          const starIcon = isStarred ? "star" : "star_border";
          const starColor = isStarred ? "#fbbc04" : "#9aa0a6";
          const starData = isStarred ? "true" : "false";
          const starOpacity = isStarred ? "1" : "0";

          const starHtml =
            '<div class="msg-star-btn" data-msg-id="' +
            msg.id +
            '" data-starred="' +
            starData +
            '" style="cursor:pointer; opacity:' +
            starOpacity +
            '; transition: opacity 0.2s; padding: 4px;">' +
            '<span class="material-icons" style="font-size:18px; color:' +
            starColor +
            '">' +
            starIcon +
            "</span>" +
            "</div>";

          const bgStyle = isMine
            ? "background:#1e3a5f; color:#e3e3e3;"
            : "background:#2d2f33; color:#e3e3e3;";

          const padding = isMedia ? "6px" : "10px 14px";
          const bubbleWrapDir = isMine ? "flex-row-reverse" : "flex-row";
          const bubbleWrapAlign = isMine ? "flex-end" : "flex-start";

          const bubble =
            '<div class="msg-bubble-wrap d-flex align-items-center gap-2 ' +
            bubbleWrapDir +
            '" style="align-self:' +
            bubbleWrapAlign +
            '; max-width:85%;" ' +
            "onmouseenter=\"$(this).find('.msg-star-btn').css('opacity', '1')\" " +
            "onmouseleave=\"if($(this).find('.msg-star-btn').attr('data-starred') !== 'true') $(this).find('.msg-star-btn').css('opacity', '0')\">" +
            '<div style="max-width:100%; padding:' +
            padding +
            "; border-radius:12px; font-size:14px; " +
            bgStyle +
            '">' +
            contentHtml +
            '<div style="font-size:11px; color:#9aa0a6; text-align:right; margin-top:4px">' +
            time +
            "</div>" +
            "</div>" +
            starHtml +
            "</div>";

          $area.append(bubble);
        }
      } else {
        $area.append(
          '<div class="text-center py-5" style="color:#9aa0a6">' +
            '<span class="material-icons mb-2" style="font-size:40px">chat</span>' +
            '<p style="font-size:14px">No messages yet. Say hello!</p>' +
            "</div>",
        );
      }
      setTimeout(function () {
        $area.scrollTop($area[0].scrollHeight);
      }, 50);

      $area.find("img").on("load", function () {
        $area.scrollTop($area[0].scrollHeight);
      });
    },
  });
}

function sendCurrentMessage() {
  const msg = $("#chatMsgInput").val().trim();
  if (!msg || !currentChatUser) return;

  let toId = currentChatUser.user_id || currentChatUser.id;
  $("#chatMsgInput").val("");

  $.ajax({
    url: "./api/send_message.php",
    method: "POST",
    data: { token: token, to_user_id: toId, message: msg },
    dataType: "json",
    success: function (res) {
      if (res.status) {
        loadMessages(toId);
      }
    },
  });
}

function uploadMedia(file) {
  if (!file || !currentChatUser) return;

  let toId = currentChatUser.user_id || currentChatUser.id;
  let formData = new FormData();
  formData.append("token", token);
  formData.append("to_user_id", toId);
  formData.append("media", file);

  $.ajax({
    url: "./api/upload_media.php",
    method: "POST",
    data: formData,
    processData: false,
    contentType: false,
    dataType: "json",
    success: function (res) {
      if (res.status) {
        loadMessages(toId);
      }
    },
  });
}
