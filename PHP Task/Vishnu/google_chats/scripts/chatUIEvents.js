function startApp() {
  let profileName = (user.first_name || "") + " " + (user.last_name || "");
  if (profileName.trim()) {
    $("#profileAvatar").attr("src", getAvatarUrl(user, 36));
    $("#modalAvatar").attr("src", getAvatarUrl(user, 80));
  }

  if (user.email) {
    $("#modalEmail").text(user.email);
    $("#modalName").text(user.first_name || "User");
  }

  loadConversations();

  $("#sendMsgBtn").on("click", sendCurrentMessage);

  $("#chatMsgInput").on("keypress", function (e) {
    if (e.which === 13) {
      e.preventDefault();
      sendCurrentMessage();
    }
  });

  $("#uploadMediaBtn").on("click", function () {
    $("#mediaFileInput").click();
  });

  $("#mediaFileInput").on("change", function () {
    uploadMedia(this.files[0]);
    $(this).val("");
  });

  $("#chatBackBtn").on("click", function () {
    currentChatUser = null;
    if ($("#mentionsBtn").hasClass("active")) {
      loadMentionsView();
    } else if ($("#starredBtn").hasClass("active")) {
      loadStarredView();
    } else {
      $("#chatView").addClass("d-none");
      $("#homeView").removeClass("d-none");
      $("#mainViewTitle").text("Home");
      loadConversations();
    }
  });

  $(document).on("click", ".conv-row", function () {
    let idx = $(this).index();
    let conv = ChatApp.getConversation(idx);
    if (conv) {
      openChat(conv);
    }
  });

  $(document).on("click", "[data-dm-index]", function () {
    let idx = $(this).data("dm-index");
    let conv = ChatApp.getConversation(idx);
    if (conv) {
      openChat(conv);
    }
  });

  $(document).on("click", ".msg-star-btn", function (e) {
    e.stopPropagation();
    let $btn = $(this);
    let msgId = $btn.data("msg-id");

    $.ajax({
      url: "./api/toggle_star.php",
      method: "POST",
      data: { token: token, message_id: msgId },
      dataType: "json",
      success: function (res) {
        if (res.status) {
          let isStarred = res.data.starred;
          $btn.attr("data-starred", isStarred ? "true" : "false");
          $btn.find(".material-icons").text(isStarred ? "star" : "star_border");
          $btn
            .find(".material-icons")
            .css("color", isStarred ? "#fbbc04" : "#9aa0a6");
          $btn.css("opacity", isStarred ? "1" : "0");
        }
      },
    });
  });

  $("#searchInput").on("input focus click", function (e) {
    e.stopPropagation();
    let q = $(this).val().toLowerCase();

    $(".conv-row").each(function () {
      const name = $(this).find(".conv-name").text().toLowerCase();
      if (name.indexOf(q) !== -1) {
        $(this).removeClass("d-none");
      } else {
        $(this).addClass("d-none");
      }
    });

    let convs = ChatApp.getConversations();
    if (convs && convs.length > 0) {
      showSearchDropdown(q);
    }
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest("#searchInput, #searchDropdown").length) {
      $("#searchDropdown").addClass("d-none");
    }
  });

  $(document).on("click", ".search-dropdown-item", function () {
    let idx = $(this).data("index");
    let conv = ChatApp.getConversation(idx);
    if (conv) {
      $("#searchDropdown").addClass("d-none");
      $("#searchInput").val("");
      openChat(conv);
    }
  });

  $(document).on("mouseenter", ".search-dropdown-item", function () {
    $(this).css("background", "#3a3c40");
  });

  $(document).on("mouseleave", ".search-dropdown-item", function () {
    $(this).css("background", "transparent");
  });

  let toggleOn = false;
  $("#unreadToggle").on("click", function () {
    toggleOn = !toggleOn;
    $("#noUnreadMsg").remove();

    if (toggleOn) {
      $(this).css("background", "#1a73e8");
      $("#toggleThumb").css({ left: "19px", background: "#fff" });

      let hasUnread = false;
      $(".conv-row").each(function () {
        const unread = parseInt($(this).attr("data-unread")) || 0;
        if (unread > 0) {
          $(this).removeClass("d-none");
          hasUnread = true;
        } else {
          $(this).addClass("d-none");
        }
      });

      if (!hasUnread && $(".conv-row").length > 0) {
        $("#convList").append(
          '<div id="noUnreadMsg" class="text-center py-5" style="color:#9aa0a6">' +
            '<span class="material-icons mb-2" style="font-size:40px">mark_chat_read</span>' +
            '<p style="font-size:14px">No unread messages</p>' +
            "</div>",
        );
      }
    } else {
      $(this).css("background", "#3a3c40");
      $("#toggleThumb").css({ left: "3px", background: "#9aa0a6" });
      $(".conv-row").removeClass("d-none");
    }
  });

  $(".nav-item-btn").on("click", function () {
    $(".nav-item-btn").removeClass("active");
    $(this).addClass("active");
  });

  $("#sidebarToggle").on("click", function () {
    $(".sidebar").toggleClass("collapsed");
    $(".main").toggleClass("collapsed");
  });

  $("#mobileMenuBtn").on("click", function () {
    $(".sidebar").addClass("mobile-open");
    $("#sidebarOverlay").addClass("show");
  });

  $("#sidebarOverlay").on("click", function () {
    $(".sidebar").removeClass("mobile-open");
    $(this).removeClass("show");
  });

  $(document).on(
    "click",
    ".nav-item-btn, .conv-row, [data-dm-index]",
    function () {
      if (window.innerWidth <= 768) {
        $(".sidebar").removeClass("mobile-open");
        $("#sidebarOverlay").removeClass("show");
      }
    },
  );

  $("#newChatBtn").on("click", function (e) {
    e.stopPropagation();
    $("#newChatPopup").toggleClass("d-none");
    $("#newChatEmail").val("").focus();
    $("#searchResultArea").addClass("d-none");
    $("#newChatError").addClass("d-none");
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest("#newChatPopup, #newChatBtn").length) {
      $("#newChatPopup").addClass("d-none");
    }
  });

  $("#newChatEmail").on("keypress", function (e) {
    if (e.which === 13) {
      e.preventDefault();
      let email = $(this).val().trim();
      if (!email) return;

      $("#newChatError").addClass("d-none");
      $("#searchResultArea").addClass("d-none");

      $.ajax({
        url: "./api/search_user.php",
        method: "POST",
        data: { token: token, email: email },
        dataType: "json",
        success: function (res) {
          if (res.status && res.data && res.data.user) {
            const u = res.data.user;
            let searchName = u.first_name + " " + u.last_name;

            let html =
              '<div class="d-flex align-items-center gap-3 py-2" style="cursor:pointer" id="startChatWithUser">' +
              '<img src="' +
              getAvatarUrl(u, 28) +
              '" class="rounded-circle" width="28" height="28" />' +
              '<div class="flex-grow-1">' +
              '<div style="font-size:14px">' +
              u.first_name +
              " " +
              u.last_name +
              "</div>" +
              '<div style="font-size:12px; color:#9aa0a6">' +
              u.email +
              "</div>" +
              "</div>" +
              '<button class="btn btn-sm rounded-pill px-3" style="background:#8ab4f8; color:#202124; font-size:12px">Start chat</button>' +
              "</div>";

            $("#searchResultContent").html(html);
            $("#searchResultArea").removeClass("d-none");

            $("#startChatWithUser").on("click", function () {
              $("#newChatPopup").addClass("d-none");
              openChat(u);
            });
          } else {
            $("#newChatError")
              .text("No user found with this email.")
              .removeClass("d-none");
          }
        },
        error: function () {
          $("#newChatError")
            .text("Something went wrong. Try again.")
            .removeClass("d-none");
        },
      });
    }
  });

  $("#statusBtn").on("click", function (e) {
    e.stopPropagation();
    $("#statusDropdown").toggleClass("d-none");
  });

  $("#helpBtn").on("click", function (e) {
    e.stopPropagation();
    $("#helpDropdown").toggleClass("d-none");
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest("#statusDropdown, #statusBtn").length) {
      $("#statusDropdown").addClass("d-none");
    }
    if (!$(e.target).closest("#helpDropdown, #helpBtn").length) {
      $("#helpDropdown").addClass("d-none");
    }
  });

  $(".status-option").on("click", function () {
    let status = $(this).data("status");
    $(".status-check").addClass("d-none");
    $(this).find(".status-check").removeClass("d-none");

    if (status === "active") {
      $("#statusDot").css("background", "#34a853");
      $("#statusLabel").text("Active");
    } else if (status === "dnd") {
      $("#statusDot").css("background", "#ea4335");
      $("#statusLabel").text("Do not disturb");
    } else if (status === "away") {
      $("#statusDot").css("background", "#9aa0a6");
      $("#statusLabel").text("Away");
    }

    $.ajax({
      url: "./api/update_status.php",
      method: "POST",
      data: { token: token, status: status },
      dataType: "json",
    });

    $("#statusDropdown").addClass("d-none");
  });

  $("#chatUserInfoBtn").on("click", function (e) {
    e.stopPropagation();
    $("#chatUserInfoPanel").toggleClass("d-none");
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest("#chatUserInfoPanel, #chatUserInfoBtn").length) {
      $("#chatUserInfoPanel").addClass("d-none");
    }
  });

  $("#profileAvatar").on("click", function (e) {
    e.stopPropagation();
    $("#profileDropdown").toggleClass("d-none");
  });

  $("#profileClose").on("click", function () {
    $("#profileDropdown").addClass("d-none");
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest("#profileDropdown, #profileAvatar").length) {
      $("#profileDropdown").addClass("d-none");
    }
  });

  $("#signOutBtn").on("click", function () {
    doLogout();
  });

  $("#uploadAvatarBtn").on("click", function (e) {
    e.stopPropagation();
    $("#avatarInput").click();
  });

  $("#avatarInput").on("change", function () {
    let file = this.files[0];
    if (!file) return;

    let formData = new FormData();
    formData.append("token", token);
    formData.append("avatar", file);

    $.ajax({
      url: "./api/upload_avatar.php",
      method: "POST",
      data: formData,
      processData: false,
      contentType: false,
      dataType: "json",
      success: function (res) {
        if (res.status && res.avatar_url) {
          user.profile_picture = res.avatar_url;
          localStorage.setItem("user", JSON.stringify(user));
          $("#profileAvatar").attr("src", getAvatarUrl(user, 36));
          $("#modalAvatar").attr("src", getAvatarUrl(user, 80));
          Swal.fire({
            icon: "success",
            title: "Avatar Updated",
            text: "Your profile picture has been updated successfully!",
            background: "#2d2f33",
            color: "#e3e3e3",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Upload Failed",
            text: res.message || "Failed to upload avatar",
            background: "#2d2f33",
            color: "#e3e3e3",
          });
        }
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong uploading the avatar.",
          background: "#2d2f33",
          color: "#e3e3e3",
        });
      },
    });
    $(this).val("");
  });

  $("#addAccountBtn").on("click", function () {
    doLogout();
  });

  $("#chatMsgInput").on("input", function () {
    let val = $(this).val();
    let cursorPos = this.selectionStart;
    let beforeCursor = val.substring(0, cursorPos);
    let atIdx = beforeCursor.lastIndexOf("@");

    if (atIdx >= 0) {
      let afterAt = beforeCursor.substring(atIdx + 1);
      if (/^[A-Za-z]*\s?[A-Za-z]*$/.test(afterAt)) {
        mentionStartPos = atIdx;
        mentionQuery = afterAt.toLowerCase();
        mentionSelectedIdx = 0;
        showMentionDropdown();
        return;
      }
    }
    hideMentionDropdown();
  });

  $(document).on("click", ".mention-item", function () {
    insertMention($(this).data("name"));
  });

  $(document).on("mouseenter", ".mention-item", function () {
    $(".mention-item").css("background", "transparent");
    $(this).css("background", "#3a3c40");
  });

  $("#chatMsgInput").on("keydown", function (e) {
    if ($("#mentionDropdown").hasClass("d-none")) return;
    let items = $(".mention-item");
    if (items.length === 0) return;

    if (e.which === 40) {
      e.preventDefault();
      mentionSelectedIdx = Math.min(mentionSelectedIdx + 1, items.length - 1);
      items.css("background", "transparent");
      $(items[mentionSelectedIdx]).css("background", "#3a3c40");
    } else if (e.which === 38) {
      e.preventDefault();
      mentionSelectedIdx = Math.max(mentionSelectedIdx - 1, 0);
      items.css("background", "transparent");
      $(items[mentionSelectedIdx]).css("background", "#3a3c40");
    } else if (e.which === 13 && !$("#mentionDropdown").hasClass("d-none")) {
      e.preventDefault();
      let selectedName = $(items[mentionSelectedIdx]).data("name");
      if (selectedName) insertMention(selectedName);
    } else if (e.which === 27) {
      hideMentionDropdown();
    }
  });

  $("#mentionsBtn").on("click", function () {
    loadMentionsView();
  });

  $("#starredBtn").on("click", function () {
    loadStarredView();
  });

  $("#homeBtn").on("click", function () {
    $("#chatView").addClass("d-none");
    $("#homeView").removeClass("d-none");
    $("#mainViewTitle").text("Home");
    currentChatUser = null;
    loadConversations();
  });

  $("#settingsBtn").on("click", function () {
    $("#settingsFirstName").val(user.first_name || "");
    $("#settingsLastName").val(user.last_name || "");
    $("#settingsError, #settingsSuccess").addClass("d-none");
    var settingsModal = new bootstrap.Modal(
      document.getElementById("settingsModal"),
    );
    settingsModal.show();
  });

  $("#settingsForm").on("submit", function (e) {
    e.preventDefault();
    let fn = $("#settingsFirstName").val().trim();
    let ln = $("#settingsLastName").val().trim();

    $.ajax({
      url: "./api/update_profile.php",
      method: "POST",
      data: { token: token, first_name: fn, last_name: ln },
      dataType: "json",
      success: function (res) {
        if (res.status) {
          $("#settingsSuccess")
            .text("Profile updated successfully!")
            .removeClass("d-none");
          $("#settingsError").addClass("d-none");
          user.first_name = fn;
          user.last_name = ln;
          localStorage.setItem("user", JSON.stringify(user));

          let profileName = fn + " " + ln;
          $("#profileAvatar").attr("src", getAvatarUrl(user, 36));
          $("#modalAvatar").attr("src", getAvatarUrl(user, 80));
          $("#modalName").text(fn);

          Swal.fire({
            icon: "success",
            title: "Profile Updated",
            background: "#2d2f33",
            color: "#e3e3e3",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: res.message || "Failed to update profile",
            background: "#2d2f33",
            color: "#e3e3e3",
          });
        }
      },
      error: function () {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong. Try again.",
          background: "#2d2f33",
          color: "#e3e3e3",
        });
      },
    });
  });

  $("#deleteAccountBtn").on("click", function () {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this! Your account and all messages will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ea4335",
      cancelButtonColor: "#5f6368",
      confirmButtonText: "Yes, delete it",
      background: "#2d2f33",
      color: "#e3e3e3",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: "./api/delete_account.php",
          method: "POST",
          data: { token: token },
          dataType: "json",
          complete: function () {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "./index.html";
          },
        });
      }
    });
  });
}

function doLogout() {
  Swal.fire({
    title: "Sign out",
    text: "Are you sure you want to sign out?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#8ab4f8",
    cancelButtonColor: "#5f6368",
    confirmButtonText: "Yes, sign out",
    background: "#2d2f33",
    color: "#e3e3e3",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "./api/logout.php",
        method: "POST",
        data: { token: token },
        dataType: "json",
        complete: function () {
          localStorage.removeItem("token");
          window.location.href = "./index.html";
        },
      });
    }
  });
}

function showSearchDropdown(q) {
  let $dropdown = $("#searchDropdown");
  $dropdown.empty();

  let matches = 0;
  let convs = ChatApp.getConversations() || [];
  for (let i = 0; i < convs.length; i++) {
    let conv = convs[i];
    let name = conv.first_name + " " + conv.last_name;
    let email = conv.email || "";

    if (
      name.toLowerCase().indexOf(q) !== -1 ||
      email.toLowerCase().indexOf(q) !== -1
    ) {
      matches++;

      let avatarHtml =
        '<img src="' +
        getAvatarUrl(conv, 36) +
        '" class="rounded-circle" width="36" height="36" />';

      let row =
        '<div class="search-dropdown-item d-flex align-items-center gap-3 px-3 py-2" data-index="' +
        i +
        '" style="cursor:pointer;">' +
        avatarHtml +
        '<div class="flex-grow-1 overflow-hidden">' +
        '<div style="font-size:14px; color:#e3e3e3;">' +
        name +
        "</div>" +
        '<div style="font-size:12px; color:#9aa0a6;">' +
        email +
        "</div>" +
        "</div>" +
        "</div>";
      $dropdown.append(row);
    }
  }

  if (matches > 0) {
    $dropdown.removeClass("d-none");
  } else {
    $dropdown.addClass("d-none");
  }
}
