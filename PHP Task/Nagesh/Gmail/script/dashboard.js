$(document).ready(function () {
  const token = localStorage.getItem("token");
  let user = {};

  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
    }
  } catch (e) {
    user = {};
  }
  let currentFolder = "inbox";
  let currentPage = 1;
  let totalEmails = 0;
  const PAGE_LIMIT = 25;
  let currentEmailId = null;
  let sidebarCollapsed = false;
  let moreExpanded = false;
  let composeMinimized = false;
  let sendingMail = false;

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  initUser();
  loadEmails();

  function initUser() {
    if (user && user.name) {
      renderUserUI(user);
    }

    $.get("api/get_user.php", { token }, function (res) {
      if (res.status) {
        user = res.data;
        localStorage.setItem("user", JSON.stringify(user));
        renderUserUI(user);
      }
    });
  }

  function renderUserUI(u) {
    const initial = (u.first_name || u.name || "G")[0].toUpperCase();
    $("#avatarInitial").text(initial);
    $("#modalAvatar").text(initial);
    $("#modalUserName").text(u.name || u.first_name + " " + u.last_name);
    $("#modalUserEmail").text(u.email);
  }

  function loadEmails(folder, page, search) {
    folder = folder || currentFolder;
    page = page || currentPage;
    search = search || $("#searchInput").val().trim();

    $("#emailList").html(`
      <div class="loading-spinner">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Loading...</p>
      </div>`);

    $.ajax({
      url: "api/get_emails.php",
      method: "GET",
      data: { token, folder, page, search, limit: PAGE_LIMIT },
      dataType: "json",
      success: function (res) {
        if (!res.status) {
          showToast(res.message, "error");
          return;
        }

        totalEmails = res.data.total;
        const emails = res.data.emails;
        const unread = res.data.unread_count;

        if (unread > 0) {
          $("#inboxBadge").text(unread).show();
        } else {
          $("#inboxBadge").text("").hide();
        }

        const start = (page - 1) * PAGE_LIMIT + 1;
        const end = Math.min(page * PAGE_LIMIT, totalEmails);
        if (totalEmails > 0) {
          $("#paginationInfo").text(`${start}–${end} of ${totalEmails}`);
        } else {
          $("#paginationInfo").text("");
        }

        $("#prevPage").prop("disabled", page <= 1);
        $("#nextPage").prop("disabled", end >= totalEmails);

        renderEmails(emails, folder);
      },
      error: function (xhr) {
        try {
          const err = JSON.parse(xhr.responseText);
          if (err.message && err.message.toLowerCase().includes("session")) {
            showToast("Session expired. Redirecting...", "error");
            setTimeout(() => {
              doLogout();
            }, 1500);
          } else {
            showToast(err.message || "Failed to load emails.", "error");
          }
        } catch (e) {
          showToast("Server error", "error");
        }
        $("#emailList").html(
          '<div class="empty-state"><i class="bi bi-exclamation-circle"></i><h5>Could not load emails</h5></div>',
        );
      },
    });
  }

  function renderEmails(emails, folder) {
    if (!emails || emails.length === 0) {
      const icons = {
        inbox: "bi-inbox",
        starred: "bi-star",
        sent: "bi-send",
        trash: "bi-trash",
        draft: "bi-file-earmark",
        all: "bi-envelope",
      };
      const icon = icons[folder] || "bi-envelope";
      const msgs = {
        inbox: "Your inbox is empty",
        starred: "No starred messages",
        sent: "No sent messages",
        trash: "Trash is empty",
      };
      const msg = msgs[folder] || "No emails found";
      $("#emailList").html(`
        <div class="empty-state">
          <i class="bi ${icon}"></i>
          <h5>${msg}</h5>
          <p class="small mt-1">When you have emails, they'll appear here.</p>
        </div>`);
      return;
    }

    let html = "";
    emails.forEach(function (mail) {
      const isUnread = !mail.is_read;
      const isStarred =
        mail.is_starred == "t" ||
        mail.is_starred === true ||
        mail.is_starred == 1;
      const snippet = stripHtml(mail.body || "").substring(0, 80);
      const senderDisplay = mail.sender_name || mail.sender_email || "Unknown";
      const timeStr = formatEmailDate(mail.created_at);

      html += `
      <div class="email-row ${isUnread ? "unread" : "read"}" data-id="${mail.id}" data-email-id="${mail.email_id}">
        <div class="email-check">
          <input type="checkbox" class="g-checkbox row-check" data-id="${mail.id}">
        </div>
        <i class="bi ${isStarred ? "bi-star-fill starred" : "bi-star"} email-star" data-id="${mail.id}" title="Star"></i>
        <i class="bi bi-bookmark-fill email-important ${mail.is_important ? "important" : ""}" data-id="${mail.id}" title="Mark as important"></i>
        <span class="email-sender">${escHtml(senderDisplay)}</span>
        <span class="email-subject-wrap">
          <span class="email-subject">${escHtml(mail.subject || "(no subject)")}</span>
          <span class="email-snippet">– ${escHtml(snippet)}</span>
        </span>
        <span class="email-time">${timeStr}</span>
        <div class="row-hover-actions">
          <button class="row-action-btn" title="Archive"><i class="bi bi-archive"></i></button>
          <button class="row-action-btn trash-row-btn" data-id="${mail.id}" title="Delete"><i class="bi bi-trash"></i></button>
          <button class="row-action-btn" title="Mark as unread"><i class="bi bi-envelope"></i></button>
          <button class="row-action-btn" title="Snooze"><i class="bi bi-clock"></i></button>
        </div>
      </div>`;
    });

    $("#emailList").html(html);
  }

  //  OPEN EMAIL DETAIL
  $(document).on("click", ".email-row", function (e) {
    if (
      $(e.target).closest(
        "input, .email-star, .email-important, .row-action-btn",
      ).length
    )
      return;

    const id = $(this).data("id");
    currentEmailId = id;
    openEmailDetail(id);
  });

  function openEmailDetail(id) {
    $.ajax({
      url: "api/read.php",
      method: "GET",
      data: { token, id },
      dataType: "json",
      success: function (res) {
        if (!res.status) {
          showToast(res.message, "error");
          return;
        }
        const mail = res.data;

        $(`.email-row[data-id="${id}"]`).removeClass("unread").addClass("read");

        const senderName = mail.sender_name || mail.sender_email;
        const senderInit = (senderName || "?")[0].toUpperCase();
        const isStarred = mail.is_starred == "t" || mail.is_starred === true;
        const folderLabel = mail.folder === "sent" ? "Sent" : "Inbox";

        const detailHTML = `
          <div class="detail-subject">
            ${escHtml(mail.subject || "(no subject)")}
            <span class="detail-label">${folderLabel}</span>
          </div>
          <div class="detail-meta">
            <div class="detail-avatar">${senderInit}</div>
            <div class="detail-sender-info">
              <div class="detail-sender-name">${escHtml(senderName)}</div>
              <div class="detail-sender-email">&lt;${escHtml(mail.sender_email)}&gt;</div>
            </div>
            <div class="detail-date">${formatFullDate(mail.created_at)}</div> 
            <button class="detail-star-btn ${isStarred ? "starred" : ""}" id="detailStarBtn" data-id="${id}" title="Star">
              <i class="bi ${isStarred ? "bi-star-fill" : "bi-star"}"></i>
            </button>
          </div>
          <div class="detail-body">${escHtml(mail.body || "")}</div>
          <div class="reply-box mt-4">
            <div class="reply-box-header">
              <i class="bi bi-reply me-1"></i> Reply to ${escHtml(senderName)}
            </div>
            <textarea id="replyBody" placeholder="Write a reply..."></textarea>
            <div class="reply-box-footer">
              <button class="reply-send-btn" id="replyBtn" data-to="${escHtml(mail.sender_email)}" data-subject="${escHtml(mail.subject || "")}">
                <i class="bi bi-send me-1"></i> Send Reply
              </button>
            </div>
          </div>`;

        $("#detailContent").html(detailHTML);
        $("#emailListView").addClass("d-none");
        $("#emailDetailView").removeClass("d-none");

        $("#detailTrashBtn").data("id", id);
      },
      error: function () {
        showToast("Failed to load email.", "error");
      },
    });
  }

  $("#backToList").click(function () {
    $("#emailDetailView").addClass("d-none");
    $("#emailListView").removeClass("d-none");
    loadEmails();
  });

  $(document).on("click", "#detailStarBtn", function () {
    const id = $(this).data("id");
    toggleStar(id, function (isStarred) {
      if (isStarred) {
        $("#detailStarBtn")
          .addClass("starred")
          .html('<i class="bi bi-star-fill"></i>');
      } else {
        $("#detailStarBtn")
          .removeClass("starred")
          .html('<i class="bi bi-star"></i>');
      }
    });
  });

  $("#detailTrashBtn").click(function () {
    const id = $(this).data("id");
    deleteEmail(id, "trash", function () {
      showToast("Moved to trash.");
      $("#emailDetailView").addClass("d-none");
      $("#emailListView").removeClass("d-none");
      loadEmails();
    });
  });

  $(document).on("click", ".trash-row-btn", function (e) {
    e.stopPropagation();
    const id = $(this).data("id");
    deleteEmail(id, "trash", function () {
      showToast("Moved to trash.");
      $(`.email-row[data-id="${id}"]`).slideUp(200, function () {
        $(this).remove();
      });
    });
  });

  // Reply
  $(document).on("click", "#replyBtn", function () {
    const to = $(this).data("to");
    const subject = "Re: " + $(this).data("subject");
    const body = $("#replyBody").val().trim();

    if (!body) {
      showToast("Reply cannot be empty.", "error");
      return;
    }

    $(this)
      .prop("disabled", true)
      .html('<i class="bi bi-hourglass me-1"></i> Sending...');
    const btn = this;

    $.post(
      "api/send_mail.php",
      { token, to, subject, body },
      function (res) {
        if (res.status) {
          showToast("Reply sent!");
          $("#replyBody").val("");
        } else {
          showToast(res.message, "error");
        }
        $(btn)
          .prop("disabled", false)
          .html('<i class="bi bi-send me-1"></i> Send Reply');
      },
      "json",
    ).fail(function () {
      showToast("Failed to send reply.", "error");
      $(btn)
        .prop("disabled", false)
        .html('<i class="bi bi-send me-1"></i> Send Reply');
    });
  });

  //  STAR TOGGLE
  $(document).on("click", ".email-star", function (e) {
    e.stopPropagation();
    const id = $(this).data("id");
    const $btn = $(this);
    toggleStar(id, function (isStarred) {
      if (isStarred) {
        $btn
          .addClass("starred")
          .removeClass("bi-star")
          .addClass("bi-star-fill");
      } else {
        $btn
          .removeClass("starred")
          .removeClass("bi-star-fill")
          .addClass("bi-star");
      }
    });
  });

  function toggleStar(id, cb) {
    $.post(
      "api/starred.php",
      { token, id },
      function (res) {
        if (res.status && cb) {
          const isStarred =
            res.data.is_starred === true || res.data.is_starred == "t";
          cb(isStarred);
        }
      },
      "json",
    );
  }

  $(document).on("click", ".email-important", function (e) {
    e.stopPropagation();
    const id = $(this).data("id");
    const $btn = $(this);
    $.post(
      "api/toggle_important.php",
      { token, id },
      function (res) {
        if (res.status) {
          const isImportant =
            res.data.is_important === true || res.data.is_important == "t";
          $btn.toggleClass("important", isImportant);
        }
      },
      "json",
    );
  });

  function deleteEmail(id, action, cb) {
    $.post(
      "api/delete_email.php",
      { token, id, action },
      function (res) {
        if (res.status && cb) cb();
        else if (!res.status) showToast(res.message, "error");
      },
      "json",
    );
  }

  $(document).on("click", ".nav-item[data-folder]", function () {
    const folder = $(this).data("folder");
    if (!folder) return;

    currentFolder = folder;
    currentPage = 1;

    $(".nav-item").removeClass("active");
    $(this).addClass("active");

    if (folder === "inbox") {
      $("#tabsBar").show();
    } else {
      $("#tabsBar").hide();
    }

    $("#emailDetailView").addClass("d-none");
    $("#emailListView").removeClass("d-none");

    loadEmails(folder, 1);
  });

  $("#moreToggle").click(function () {
    moreExpanded = true;
    $("#moreItems").slideDown(200);
    $("#moreToggle").addClass("d-none");
    $("#lessToggle").removeClass("d-none");
  });

  $("#lessToggle").click(function () {
    moreExpanded = false;
    $("#moreItems").slideUp(200);
    $("#lessToggle").addClass("d-none");
    $("#moreToggle").removeClass("d-none");
  });

  // $("#toggleSidebar").click(function () {
  //   sidebarCollapsed = !sidebarCollapsed;
  //   $("#sidebar").toggleClass("collapsed", sidebarCollapsed);
  // });

  $(document).on("click", ".g-tab", function () {
    $(".g-tab").removeClass("active");
    $(this).addClass("active");
    loadEmails("inbox", 1);
  });

  $("#refreshBtn").click(function () {
    $(this).find("i").addClass("spin");
    loadEmails(currentFolder, currentPage);
    setTimeout(() => {
      $(this).find("i").removeClass("spin");
    }, 800);
  });

  $("#prevPage").click(function () {
    if (currentPage > 1) {
      currentPage--;
      loadEmails(currentFolder, currentPage);
    }
  });
  $("#nextPage").click(function () {
    const maxPage = Math.ceil(totalEmails / PAGE_LIMIT);
    if (currentPage < maxPage) {
      currentPage++;
      loadEmails(currentFolder, currentPage);
    }
  });

  let searchTimeout;
  $("#searchInput").on("input", function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function () {
      currentPage = 1;
      loadEmails(currentFolder, 1, $("#searchInput").val().trim());
    }, 400);
  });

  $("#composeBtn").click(openCompose);
  $("#closeCompose").click(closeCompose);
  $("#discardCompose").click(closeCompose);

  function openCompose() {
    composeMinimized = false;
    $("#composeWindow").show();
    $("#composeBody").show();
    $("#composeTo").focus();
  }
  function closeCompose() {
    $("#composeWindow").hide();
    clearCompose();
  }
  function clearCompose() {
    $("#composeTo, #composeSubject").val("");
    $("#composeMessage").val("");
    $("#composeCc, #composeBcc").val("");
    $("#ccBccRow").hide();
  }

  $("#minimizeCompose").click(function () {
    composeMinimized = !composeMinimized;
    if (composeMinimized) {
      $("#composeBody").hide();
      $("#composeWindow").addClass("minimized");
    } else {
      $("#composeBody").show();
      $("#composeWindow").removeClass("minimized");
    }
  });

  let isFullscreen = false;
  $("#expandCompose").click(function () {
    isFullscreen = !isFullscreen;
    $("#composeWindow").toggleClass("fullscreen", isFullscreen);
    $(this)
      .find("i")
      .toggleClass("bi-arrows-angle-expand bi-arrows-angle-contract");
  });

  $("#ccBccBtn").click(function () {
    $("#ccBccRow").slideToggle(150);
    $(this).text($("#ccBccRow").is(":visible") ? "Hide" : "Cc");
  });

  $(document).on("click", "#sendMailBtn", function () {
    if (sendingMail) return;

    const to = $("#composeTo").val()?.trim() || "";
    const subject = $("#composeSubject").val()?.trim() || "";
    const body = $("#composeMessage").val()?.trim() || "";

    console.log({ to, subject, body });

    if (!to || !subject || !body) {
      showToast("Please fill in all fields (To, Subject, Message).", "error");
      return;
    }

    sendingMail = true;

    $(this)
      .prop("disabled", true)
      .html('<i class="bi bi-hourglass me-1"></i> Sending...');

    $.ajax({
      url: "api/send_mail.php",
      method: "POST",
      data: { token, to, subject, body },
      dataType: "json",
      success: function (res) {
        if (res.status) {
          closeCompose();
          showToast("Email sent!");
        } else {
          showToast(res.message || "Failed to send email.", "error");
        }
      },
      error: function () {
        showToast("Server error. Could not send email.", "error");
      },
      complete: function () {
        sendingMail = false;
        $("#sendMailBtn")
          .prop("disabled", false)
          .html('Send <i class="bi bi-send ms-1"></i>');
      },
    });
  });

  $("#logoutBtn").click(function () {
    bootstrap.Modal.getInstance(document.getElementById("accountModal")).hide();
    setTimeout(() => {
      new bootstrap.Modal(document.getElementById("confirmLogoutModal")).show();
    }, 300);
  });

  $("#confirmLogoutBtn").click(function () {
    $(this).prop("disabled", true).text("Signing out...");
    $.post(
      "api/logout.php",
      { token },
      function () {
        doLogout();
      },
      "json",
    ).fail(function () {
      doLogout();
    });
  });

  function saveDraft() {
    $.post(
      "api/save_draft.php",
      {
        token: localStorage.getItem("token"),
        subject: $("#subject").val(),
        body: $("#body").val(),
      },
      function (res) {
        console.log(res.message);
      },
    );
  }

  function doLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
  }

  //  SELECT ALL

  $("#selectAll").change(function () {
    $(".row-check").prop("checked", this.checked);
  });

  function escHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function stripHtml(html) {
    return html.replace(/<[^>]*>/g, "");
  }

  function formatEmailDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const oneDay = 86400000;

    if (diff < oneDay && d.getDate() === now.getDate()) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diff < 7 * oneDay) {
      return d.toLocaleDateString([], { weekday: "short" });
    } else {
      return d.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  }

  function formatFullDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function showToast(msg, type) {
    const toast$ = $("#gmailToast");
    $("#toastMsg").text(msg);
    if (type === "error") {
      toast$.css("background", "#b00020");
    } else {
      toast$.css("background", "#323232");
    }
    const bsToast = new bootstrap.Toast(toast$[0], { delay: 3500 });
    bsToast.show();
  }

  if (!document.getElementById("spinStyle")) {
    const style = document.createElement("style");
    style.id = "spinStyle";
    style.textContent = `
      @keyframes spin { to { transform: rotate(360deg); } }
      .spin { animation: spin 0.8s linear infinite; display:inline-block; }
    `;
    document.head.appendChild(style);
  }

  $("#composeTo").on("input", function () {
    const query = $(this).val().trim();

    if (query.length < 4) {
      $("#toSuggestions").hide();
      return;
    }

    $.ajax({
      url: "api/search_users.php",
      method: "GET",
      data: { q: query },
      dataType: "json",
      success: function (res) {
        if (!res.status || !res.data.length) {
          $("#toSuggestions").hide();
          return;
        }

        let html = "";

        res.data.forEach((user) => {
          html += `
          <div class="suggestion-item" data-email="${user.email}">
            (${user.email})
          </div>
        `;
        });

        $("#toSuggestions").html(html).show();
      },
      error: function () {
        $("#toSuggestions").hide();
      },
    });
  });
  $(document).on("click", ".suggestion-item", function () {
  const email = $(this).data("email");

  $("#composeTo").val(email);   
  $("#toSuggestions").hide();   
});

  $("#toggleSidebar")
    .off("click")
    .on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (window.innerWidth <= 768) {
        $("#sidebar").toggleClass("active");
        $("body").toggleClass("sidebar-open");
      } else {
        $("#sidebar").toggleClass("collapsed");
      }
    });
});
