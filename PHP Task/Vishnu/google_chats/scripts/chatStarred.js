function loadStarredView() {
  $("#chatView").addClass("d-none");
  $("#homeView").removeClass("d-none");
  $("#mainViewTitle").text("Starred");

  const $list = $("#convList").empty();
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
  }

  $.ajax({
    url: "./api/get_starred_messages.php",
    method: "POST",
    data: { token: token },
    dataType: "json",
    success: function (res) {
      $list.empty();

      if (
        res.status &&
        res.data &&
        res.data.messages &&
        res.data.messages.length
      ) {
        const messages = res.data.messages;

        ChatApp.setConversations([]);
        for (let i = 0; i < messages.length; i++) {
          const msg = messages[i];
          ChatApp.addConversation({
            id: msg.chat_partner_id,
            first_name: msg.first_name,
            last_name: msg.last_name,
            profile_picture: msg.profile_picture,
          });

          let senderName = msg.first_name + " " + msg.last_name;
          const time = new Date(msg.send_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          const isMedia =
            msg.is_media === true || msg.is_media === "t" || msg.is_media === 1;
          let preview = "";
          let prefix = msg.message_from == user.id ? "You: " : "";
          if (isMedia) {
            preview = prefix + "<i>Image message</i>";
          } else {
            let safeText = $("<span>").text(msg.message_content).html();
            preview = prefix + highlightMentions(safeText);
          }

          $list.append(
            '<div class="conv-row d-flex align-items-center gap-3" style="cursor:pointer">' +
              '<img src="' +
              getAvatarUrl(msg, 40) +
              '" class="rounded-circle" width="40" height="40" />' +
              '<div class="flex-grow-1 overflow-hidden">' +
              '<div class="conv-name">' +
              senderName +
              "</div>" +
              '<div class="conv-preview" style="font-size:13px">' +
              preview +
              "</div>" +
              "</div>" +
              '<div class="conv-time">' +
              time +
              "</div>" +
              "</div>",
          );
        }
      } else {
        $list.append(
          '<div class="text-center py-5" style="color:#9aa0a6">' +
            '<span class="material-icons mb-2" style="font-size:40px">star_border</span>' +
            '<p style="font-size:14px">No starred messages found</p>' +
            "</div>",
        );
      }
    },
  });
}
