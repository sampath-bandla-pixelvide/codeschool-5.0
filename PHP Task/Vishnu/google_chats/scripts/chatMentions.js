let mentionQuery = "";
let mentionStartPos = -1;
let mentionSelectedIdx = 0;

function showMentionDropdown() {
  $.ajax({
    url: "./api/get_chat_users.php",
    method: "POST",
    data: { token: token },
    dataType: "json",
    success: function (res) {
      if (res.status && res.data && res.data.users) {
        const allUsers = res.data.users;
        const filtered = [];

        for (let i = 0; i < allUsers.length; i++) {
          const name = (
            allUsers[i].first_name +
            " " +
            allUsers[i].last_name
          ).toLowerCase();
          if (name.indexOf(mentionQuery) !== -1) {
            filtered.push(allUsers[i]);
          }
        }

        const $dd = $("#mentionDropdown").empty();

        if (filtered.length === 0) {
          hideMentionDropdown();
          return;
        }

        for (let j = 0; j < filtered.length; j++) {
          let userName = filtered[j].first_name + " " + filtered[j].last_name;
          const bgStyle =
            j === mentionSelectedIdx ? " background:#3a3c40;" : "";

          $dd.append(
            '<div class="mention-item d-flex align-items-center gap-2 px-3 py-2" data-name="' +
              userName +
              '" style="cursor:pointer; font-size:14px; color:#e3e3e3;' +
              bgStyle +
              '">' +
              '<img src="' +
              getAvatarUrl(filtered[j], 24) +
              '" class="rounded-circle" width="24" height="24" />' +
              "<span>" +
              userName +
              "</span>" +
              '<span style="color:#9aa0a6; font-size:12px; margin-left:auto">' +
              filtered[j].email +
              "</span>" +
              "</div>",
          );
        }

        $dd.removeClass("d-none");
      }
    },
  });
}

function hideMentionDropdown() {
  $("#mentionDropdown").addClass("d-none").empty();
  mentionStartPos = -1;
}

function insertMention(name) {
  let input = $("#chatMsgInput");
  let val = input.val();
  let before = val.substring(0, mentionStartPos);
  let after = val.substring(input[0].selectionStart);
  let newVal = before + "@" + name + " " + after;
  input.val(newVal);
  input.focus();
  let newPos = mentionStartPos + name.length + 2;
  input[0].setSelectionRange(newPos, newPos);
  hideMentionDropdown();
}

function loadMentionsView() {
  $("#chatView").addClass("d-none");
  $("#homeView").removeClass("d-none");
  $("#mainViewTitle").text("Mentions");

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
    url: "./api/get_mentions.php",
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
            id: msg.message_from,
            first_name: msg.first_name,
            last_name: msg.last_name,
            profile_picture: msg.profile_picture,
          });

          let senderName = msg.first_name + " " + msg.last_name;
          const time = new Date(msg.send_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          let safeText = $("<span>").text(msg.message_content).html();
          const preview = highlightMentions(safeText);

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
            '<span class="material-icons mb-2" style="font-size:40px">alternate_email</span>' +
            '<p style="font-size:14px">No mentions found</p>' +
            "</div>",
        );
      }
    },
  });
}
