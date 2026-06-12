const userToken = localStorage.getItem("userToken");
const userNameRegex = /^[a-zA-Z][a-zA-Z0-9._]{2,19}$/;
const nameRegex = /^[A-Za-z]{2,}(?: [A-Za-z]+)*$/;

if (!userToken) {
  logout();
}

function logout() {
  $.ajax({
    type: "post",
    url: "../api/logout.php",
    data: { userToken },
    dataType: "json",
    success: function () {
      localStorage.removeItem("userToken");
      window.location.href = "./index.html";
    },
    error: function () {
      alert("error occures!!");
    },
  });
}

function openChat(username) {
  const sidebar = $("#sidebar");
  const chatBox = $("#chatBox");
  if (!chatBox.is(":visible")) {
    sidebar.addClass("d-none");
    chatBox.removeClass("d-none");
  }
  getChatContent(username);
}

function validateToken() {
  $.ajax({
    type: "post",
    url: "../api/validateToken.php",
    data: { userToken },
    dataType: "json",
    success: function (response) {
      if (!response || !response.status) {
        logout();
      } else {
        const photo = response.data.photo || "default.png";
        $("#userProfile").attr("src", `./uploads/${photo}`);
        $("#userName").text(response.data.username);
      }
    },

    error: function () {
      logout();
    },
  });
}

function scrollToBottom() {
  const chatArea = document.getElementById("chatArea");
  chatArea.scrollTop = chatArea.scrollHeight;
}

function dayIdentifier(sentDate, today) {
  let dayDifference = today.getDate() - sentDate.getDate();
  let sameMonthAndYear =
    today.getMonth() == sentDate.getMonth() &&
    today.getYear() == sentDate.getYear();
  console.log(sameMonthAndYear);
  if (dayDifference == 0 && sameMonthAndYear) {
    return "Today";
  } else if (dayDifference == 1 && sameMonthAndYear) {
    return "Yesterday";
  } else if (dayDifference > 1 && dayDifference < 6 && sameMonthAndYear) {
    return `${dayDifference} days ago`;
  } else if (dayDifference > 6 && dayDifference < 30 && sameMonthAndYear) {
    let weekCount = Math.floor(dayDifference / 7);
    return `${weekCount} weeks ago`;
  } else {
    let date =
      sentDate.getDate() +
      " : " +
      sentDate.getMonth() +
      " : " +
      sentDate.getYear();
    return date;
  }
}

let fetchChatTimer;
let currentUser;
function fetchMessages(username) {
  const chatArea = $("#chatArea");
  currentUser = username;
  clearTimeout(fetchChatTimer);
  $.ajax({
    type: "post",
    url: "../api/fetchMessages.php",
    data: { username, userToken },
    dataType: "json",
    success: function (response) {
      chatArea.text("");
      if (response.status) {
        let dayLabel = null;
        let newDayLabel = null;
        for (let i = 0; i < response.data.length; i++) {
          let is_mine = response.data[i].is_mine;
          let datetime = response.data[i].send_at;
          let dateTimeObj = new Date(datetime);
          let today = new Date();
          newDayLabel = dayIdentifier(dateTimeObj, today);
          if (dayLabel != newDayLabel) {
            chatArea.append(
              $("<div>")
                .addClass("d-flex justify-content-center")
                .append(
                  $("<div>")
                    .addClass("bg-dark rounded-pill px-2 p-1")
                    .append(
                      $("<span>")
                        .addClass("text-center text-white fs-6")
                        .text(newDayLabel),
                    ),
                ),
            );
            dayLabel = newDayLabel;
          }
          let time = dateTimeObj.getHours() + " : " + dateTimeObj.getMinutes();
          let readMsgClass;
          if (response.data[i].status) {
            readMsgClass = "bi-check-all text-info";
          } else {
            readMsgClass = "bi-check text-secondary";
          }
          if (!is_mine) {
            if (response.data[i].is_media) {
              chatArea.append(
                $("<div>")
                  .addClass("d-flex")
                  .append(
                    $("<div>")
                      .addClass("msg received px-4 py-2 pb-3 position-relative")
                      .append(
                        $("<img>")
                          .addClass("img-fluid rounded-3")
                          .attr({
                            src: `./uploads/${response.data[i].message_content}`,
                            heigth: "400",
                            width: "300",
                          }),
                        $("<span>")
                          .addClass("msg-time position-absolute")
                          .css({ right: "10px", bottom: "0px" })
                          .text(`${time}`),
                      ),
                  ),
              );
            } else {
              chatArea.append(
                $("<div>")
                  .addClass("d-flex")
                  .append(
                    $("<div>")
                      .addClass("msg received px-4 py-2 pb-3 position-relative")
                      .text(response.data[i].message_content)
                      .append(
                        $("<span>")
                          .addClass("msg-time position-absolute")
                          .css({ right: "10px", bottom: "0px" })
                          .text(`${time}`),
                      ),
                  ),
              );
            }
            continue;
          }
          if (response.data[i].is_media) {
            chatArea.append(
              $("<div>")
                .addClass("d-flex justify-content-end pe-3")
                .append(
                  $("<div>")
                    .addClass("msg sent px-4 py-2 pb-3 position-relative")
                    .append(
                      $("<img>")
                        .addClass("img-fluid rounded-3")
                        .attr({
                          src: `./uploads/${response.data[i].message_content}`,
                          heigth: "400",
                          width: "300",
                        }),
                      $("<span>")
                        .addClass("msg-time position-absolute")
                        .css({ right: "5px", bottom: "0px" })
                        .text(`${time}`)
                        .append(
                          $("<small>").addClass(
                            `d-inline bi ${readMsgClass} fs-6 msg-time`,
                          ),
                        ),
                    ),
                ),
            );
          } else {
            chatArea.append(
              $("<div>")
                .addClass("d-flex justify-content-end pe-3")
                .append(
                  $("<div>")
                    .addClass("msg sent px-4 py-2 pb-3 position-relative")
                    .text(response.data[i].message_content)
                    .append(
                      $("<span>")
                        .addClass("msg-time position-absolute")
                        .css({ right: "5px", bottom: "0px" })
                        .text(time)
                        .append(
                          $("<small>").addClass(
                            `d-inline bi ${readMsgClass} fs-6 msg-time`,
                          ),
                        ),
                    ),
                ),
            );
          }
        }
        scrollToBottom();
      }
    },
  });
  fetchChatTimer = setTimeout(() => {
    if (currentUser == username) {
      fetchMessages(username);
    }
  }, 3000);
}

function getChatContent(userName, Id) {
  let username = userName;
  let id = Id;
  $(".active-contact").removeClass("active-contact");
  $(`#${id}`).addClass("active-contact");
  $("#chatBox").load("./templates/chatBox.html", function () {
    const pfp = $("#contactProfilePicture");
    const contactUsername = $("#contactUsername");
    const contactStatus = $("#contactStatus");
    const sendBtn = $("#sendBtn");
    contactUsername.text("");
    contactStatus.text("");
    $.ajax({
      type: "post",
      url: "../api/getChatContent.php",
      data: { username, userToken },
      dataType: "json",
      success: function (response) {
        if (response.status) {
          pfp.attr("src", `./uploads/${response.data.photo}`);
          contactUsername.text(response.data.username);
          if (response.data.is_online) {
            contactStatus.text("online").addClass("text-success");
          } else {
            contactStatus.text("offline").addClass("text-secondary");
          }
          sendBtn.attr("onclick", `sendMessage('${response.data.username}')`);
          $("#chatArea").text("");
          fetchMessages(username);
        }
      },
    });
  });
}

function getContacts() {
  $.ajax({
    type: "post",
    url: "../api/getUserContacts.php",
    data: { userToken },
    dataType: "json",
    success: function (response) {
      if (response.status) {
        const contactsContainer = $("#contactsContainer");
        contactsContainer.text("");
        for (let i = 0; i < response.data.length; i++) {
          let is_online;
          if (response.data[i].is_online) {
            is_online = $("<small>").addClass("text-success").text("online");
          } else {
            is_online = $("<small>").addClass("text-secondary").text("offline");
          }

          contactsContainer.append(
            $("<div>")
              .addClass(
                "d-flex align-items-center bg-white gap-2 p-2 contact onHover m-1 rounded-2",
              )
              .attr({
                id: `contact${i}`,
                onclick: `getChatContent('${response.data[i].username}','contact${i}')`,
              })
              .append(
                $("<img>")
                  .addClass("rounded-circle")
                  .attr({
                    src: `./uploads/${response.data[i].photo}`,
                    height: "50",
                    width: "50",
                  }),
                $("<div>")
                  .addClass("flex-grow-1")
                  .append(
                    $("<div>")
                      .addClass("fw-semibold username")
                      .text(response.data[i].username),
                    $("<small>")
                      .addClass("text-muted text-truncate d-block")
                      .text(response.data[i].bio),
                  ),
                is_online,
              ),
          );
        }
      }
    },
  });
}

function sendFriendRequest(username, i) {
  $(`#friendRequestBtn${i}`).addClass("d-none");
  $(`#spinnerIcon${i}`).removeClass("d-none");
  $.ajax({
    type: "post",
    url: "../api/friendRequests.php",
    data: { username, userToken },
    dataType: "token",
    success: function (response) {
      $(`#friendRequestBtnContainer${i}`).attr({ onclick: "" });
      $(`#spinnerIcon${i}`).addClass("d-none");
      $(`#personCheck${i}`).removeClass("d-none");
    },
    error: function () {
      $(`#friendRequestBtnContainer${i}`).attr({ onclick: "" });
      $(`#spinnerIcon${i}`).addClass("d-none");
      $(`#personCheck${i}`).removeClass("d-none");
    },
  });
}

function acceptRequest(username, i) {
  $.ajax({
    type: "post",
    url: "../api/acceptRequest.php",
    data: { username, userToken },
    dataType: "json",
    success: function (response) {
      if (response.status) {
        $(`#actionBtnsDiv${i}`).addClass("d-none");
        $(`#accepted${i}`).removeClass("d-none");
        getContacts();
      }
    },
  });
}

function rejectRequest(username) {
  $.ajax({
    type: "post",
    url: "../api/rejectRequest.php",
    data: { username, userToken },
    dataType: "json",
    success: function (response) {
      if (response.status) {
        $(`#actionBtnsDiv${i}`).addClass("d-none");
        $(`#rejected${i}`).removeClass("d-none");
        // ajax call for contacts;
      }
    },
  });
}

function getNotifications() {
  $.ajax({
    type: "post",
    url: "../api/getNotifications.php",
    data: { userToken },
    dataType: "json",
    success: function (response) {
      if (response.status) {
        const notificationPanal = $("#notificationPanal");
        notificationPanal.text("");
        if (response.data.length > 0) {
          $("#notificationsPopupIcon").removeClass("d-none");
        }
        for (let i = 0; i < response.data.length; i++) {
          notificationPanal.append(
            $("<div>")
              .addClass(
                "d-flex align-items-center gap-2 p-2 contact rounded-2 m-1",
              )
              .css({ "background-color": "lightgray" })
              .append(
                $("<img>")
                  .addClass("rounded-circle")
                  .attr({
                    src: `./uploads/${response.data[i].photo}`,
                    height: "50",
                    width: "50",
                  }),
                $("<div>")
                  .addClass("flex-grow-1")
                  .append(
                    $("<div>")
                      .addClass("fw-semibold fs-5")
                      .text(response.data[i].username),
                    $("<small>").text("Has send you chat request!!"),
                  ),
                $("<div>")
                  .addClass("d-flex gap-1")
                  .attr({ id: `actionBtnsDiv${i}` })
                  .append(
                    $("<button>")
                      .addClass("btn btn-outline-success fs-5 fw-semibold p-1")
                      .attr(
                        "onclick",
                        `acceptRequest('${response.data[i].username}',${i})`,
                      )
                      .html(`<i class="bi bi-check-lg"></i>`),
                    $("<button>")
                      .addClass("btn btn-outline-danger fs-5 fw-semibold p-1")
                      .attr(
                        "onclick",
                        `rejectRequest('${response.data[i].username}',${i})`,
                      )
                      .html(`<i class="bi bi-x-lg"></i>`),
                  ),
                $("<i>")
                  .addClass("bi bi-person-check fs-5 text-success d-none")
                  .attr("id", `accepted${i}`),
                $("<i>")
                  .addClass("bi bi-person-x fs-5 text-danger d-none")
                  .attr("id", `rejected${i}`),
              ),
          );
        }
      }
    },
  });
}

function closeImgPreview() {
  const chatImgPreviewContainer = $("#chatImgPreviewContainer");
  const chatImgPreview = $("#chatImgPreview");
  chatImgPreview.attr("src", "");
  document.getElementById("textMsgForm").reset();
  chatImgPreviewContainer.addClass("d-none");
}

function sendMessage(username) {
  const textmsg = $("#messageInput").val();
  const file = $("#imageInput")[0].files[0];
  if (file) {
    let formData = new FormData();
    formData.append("image", file);
    formData.append("userToken", userToken);
    formData.append("username", username);
    closeImgPreview();
    $.ajax({
      url: "../api/sendImage.php",
      type: "POST",
      data: formData,
      dataType: "json",
      processData: false,
      contentType: false,
      success: function (response) {
        if (response.status) {
          fetchMessages(currentUser);
          return;
        } else {
          Swal.fire(
            "Warning",
            "Invalid Img format or Imgae size must be < 2 MB",
            "warning",
          ).then(() => {
            return;
          });
        }
      },
    });
  }
  if (!textmsg) {
    return;
  }
  $.ajax({
    type: "post",
    url: "../api/sendMessage.php",
    data: { userToken, username, textmsg },
    dataType: "json",
    success: function (response) {
      if (response.status) {
        $("#messageInput").val("");
        $("#chatArea").text("");
        fetchMessages(username);
        return;
      }
    },
  });
}

function getUserData() {
  const photo = $("#photoPreview");
  const first_name = $("#first_name");
  const last_name = $("#last_name");
  const username = $("#username");
  const email = $("#email");
  const bio = $("#bio");
  $.ajax({
    type: "post",
    url: "../api/getUserData.php",
    data: { userToken },
    dataType: "json",
    success: function (response) {
      if (response.status) {
        photo.attr("src", `./uploads/${response.data.photo}`);
        first_name.val(response.data.first_name);
        last_name.val(response.data.last_name);
        username.val(response.data.username);
        email.val(response.data.email);
        bio.val(response.data.bio);
      }
    },
  });
}

// <div class="" style=": ;">
//   <i class="bi bi-person-check fs-5 text-success d-none" id="accepted"></i>
//   <i class="bi bi-person-x fs-5 text-danger d-none" id="rejected"></i>
// </div>

$(document).ready(function () {
  validateToken();
  getContacts();
  getNotifications();

  $(document).on("click", "#logoutBtn", function () {
    logout();
  });

  let searchContactTimer;
  $(document).on("input", "#searchContacts", function () {
    $("#cancelSearch").removeClass("d-none");
    clearTimeout(searchContactTimer);
    searchContactTimer = setTimeout(() => {
      const searchInput = $("#searchContacts").val();
      if (!userNameRegex.test(searchInput)) {
        return;
      }
      $.ajax({
        type: "post",
        url: "../api/searchContactByUsername.php",
        data: { searchInput, userToken },
        dataType: "json",
        success: function (response) {
          const contactsContainer = $("#contactsContainer");
          contactsContainer.text("");
          if (response.status) {
            for (let i = 0; i < response.data.length; i++) {
              let contactDiv = $("<div>")
                .addClass(
                  "d-flex align-items-center bg-white gap-2 p-2 contact onHover m-1 rounded-2",
                )
                .append(
                  $("<img>")
                    .addClass("rounded-circle")
                    .attr({
                      src: `./uploads/${response.data[i].photo}`,
                      height: "50",
                      width: "50",
                    }),
                  $("<div>")
                    .addClass("flex-grow-1")
                    .append(
                      $("<div>")
                        .addClass("fw-semibold")
                        .text(response.data[i].username),
                      $("<small>")
                        .addClass("text-muted text-truncate d-block")
                        .text(response.data[i].bio),
                    ),
                );
              if (!response.data[i].is_friend) {
                contactDiv.append(
                  $("<div>")
                    .addClass("text-muted onHover p-2 py-1 rounded-3")
                    .attr({
                      onclick: `sendFriendRequest('${response.data[i].username}', ${i})`,
                      id: `friendRequestBtnContainer${i}`,
                    })
                    .html(
                      `<i class="bi bi-person-plus fs-5" id="friendRequestBtn${i}"></i><i class="bi bi-person-check fs-5 text-success d-none" id="personCheck${i}"></i><i class="spinner-border spinner-border-sm bg-secondary d-none" id="spinnerIcon${i}"></i>`,
                    ),
                );
              }
              contactsContainer.append(contactDiv);
            }
          } else {
            contactsContainer.html("<h5 >No user found!!</h5>");
          }
        },
      });
    }, 1000);
  });

  $(document).on("click", "#cancelSearch", function () {
    $("#contactsContainer").text("");
    $("#searchContacts").val("");
    getContacts();
    $("#cancelSearch").addClass("d-none");
  });

  $(document).on("click", "#editProfile", function () {
    getUserData();
  });

  $(document).on("submit", "#profileUpdateForm", function (e) {
    e.preventDefault();
    const first_name = $("#firstName").val();
    const last_name = $("#lastName").val();
    const user_name = $("#username").val();
    const email = $("#email").val();
    const bio = $("#bio").val();
    const photo = $("#photo")[0].files[0];
    let errorFlag = false;

    if (!nameRegex.test(first_name)) {
      $("#firstNameError").removeClass("d-none");
      errorFlag = true;
    }

    if (last_name) {
      if (!nameRegex.test(last_name)) {
        $("#lastNameError").removeClass("d-none");
        errorFlag = true;
      }
    }

    if (errorFlag) {
      return;
    }

    let formData = new FormData(document.getElementById("profileUpdateForm"));
    formData.append("token", userToken);

    $.ajax({
      url: "../api/updateProfile.php",
      type: "POST",
      data: formData,
      dataType: "json",
      processData: false,
      contentType: false,
      success: function (response) {
        console.log(response);
        if (response.status) {
          closeOffcanvas();
        }
      },
      error: function () {
        $("#registerError")
          .text("Something went wrong!! Try again later...")
          .removeClass("d-none");
      },
    });
  });

  $(document).on("input", "#registerForm", function () {
    $("#firstNameError").addClass("d-none");
    $("#lastNameError").addClass("d-none");
    $("#userNameError").addClass("d-none");
  });

  let userNameValidationTimer;
  $(document).on("input", "#username", function () {
    $("#userNameError").addClass("d-none");
    $("#usernameX").addClass("d-none");
    $("#usernameCheck").addClass("d-none");
    $("#usernameSpinner").removeClass("d-none");

    clearTimeout(userNameValidationTimer);
    userNameValidationTimer = setTimeout(function () {
      const user_name = $("#username").val().trim();

      if (user_name.length === 0) {
        $("#usernameSpinner").addClass("d-none");
        $("#userNameError").addClass("d-none");
        $("#usernameCheck").addClass("d-none");
        $("#usernameX").addClass("d-none");
        return;
      }

      if (!userNameRegex.test(user_name)) {
        $("#userNameError").text("Only a–z, A–Z, 0–9, _ and . are allowed");
        $("#userNameError").removeClass("d-none");
        $("#usernameSpinner").addClass("d-none");
        $("#usernameX").removeClass("d-none");
        return;
      }

      $.ajax({
        type: "get",
        url: "../api/isUserNameTaken.php",
        data: { user_name },
        dataType: "json",
        success: function (response) {
          if (response.status) {
            $("#usernameSpinner").addClass("d-none");
            $("#userNameError").addClass("d-none");
            $("#usernameX").addClass("d-none");
            $("#usernameCheck").removeClass("d-none");
          } else {
            $("#usernameSpinner").addClass("d-none");
            $("#userNameError").text("User-Name already taken!!");
            $("#userNameError").removeClass("d-none");
            $("#usernameCheck").addClass("d-none");
            $("#usernameX").removeClass("d-none");
          }
        },
      });
    }, 1000);
  });

  $(document).on("change", "#photo", function () {
    const file = $("#photo")[0].files[0];
    if (!file) {
      return;
    }
    $("#photoPreview").attr("src", URL.createObjectURL(file));
  });

  $(document).on("click", "#attachImg", function () {
    $("#imageInput").click();
  });

  $(document).on("change", "#imageInput", function () {
    const file = this.files[0];
    if (!file) {
      return;
    }

    const chatImgPreviewContainer = $("#chatImgPreviewContainer");
    const chatImgPreview = $("#chatImgPreview");

    chatImgPreviewContainer.removeClass("d-none");
    chatImgPreview.attr("src", URL.createObjectURL(file));
  });

  $(document).on("click", "#closeChatImgPreview", function () {
    closeImgPreview();
  });

  $(document).on("click", "#deleteChat", function () {
    Swal.fire({
      title: "Are you sure?",
      text: "This Chat will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          type: "post",
          url: "../api/deleteChat.php",
          data: { userToken, currentUser },
          dataType: "json",
          success: function (response) {
            if (response.status) {
              Swal.fire("Success", response.message, "success").then(() => {
                fetchMessages(currentUser);
              });
            }
          },
        });
      }
    });
  });

  $(document).on("click", ".contact", function () {
    const username = $(this).find(".username").text();
    if (window.innerWidth < 768) {
      openChat(username);
    }
  });

  $(document).on("click", "#backBtn", function () {
    const sidebar = $("#sidebar");
    const chatBox = $("#chatBox");
    sidebar.removeClass("d-none");
    chatBox.addClass("d-none");
  });

  $(document).on("click", "#deleteContact", function () {
    Swal.fire({
      title: "Are you sure?",
      text: "This Contact will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          type: "post",
          url: "../api/deleteContact.php",
          data: { userToken, currentUser },
          dataType: "json",
          success: function (response) {
            if (response.status) {
              Swal.fire("Success", response.message, "success").then(() => {
                $("chatBox").text("");
                getContacts();
              });
            }
          },
        });
      }
    });
  });

});



// channel creation login
// function fetchChannelMessages(id) {
//   const chatArea = $("#chatArea");
//   $.ajax({
//     type: "post",
//     url: "../api/fetchChannelMessages.php",
//     data: { id, userToken },
//     dataType: "json",
//     success: function (response) {
//       chatArea.text("");
//       if (response.status) {
//         let dayLabel = null;
//         let newDayLabel = null;
//         console.log(response);
//         scrollToBottom();
//       }
//     },
//   });
// }

// function sendChannelMessage(id) {
//   const textmsg = $("#messageInput").val();
//   const file = $("#imageInput")[0].files[0];
//   if (file) {
//     let formData = new FormData();
//     formData.append("image", file);
//     formData.append("userToken", userToken);
//     formData.append("group_id", id);
//     closeImgPreview();
//     $.ajax({
//       url: "../api/sendImgInChannel.php",
//       type: "POST",
//       data: formData,
//       dataType: "json",
//       processData: false,
//       contentType: false,
//       success: function (response) {
//         if (response.status) {
//           fetchChannelMessages(id);
//           return;
//         } else {
//           Swal.fire(
//             "Warning",
//             "Invalid Img format or Imgae size must be < 2 MB",
//             "warning",
//           ).then(() => {
//             return;
//           });
//         }
//       },
//     });
//   }
//   if (!textmsg) {
//     return;
//   }
//   $.ajax({
//     type: "post",
//     url: "../api/sendChannelMessage.php",
//     data: { userToken, id, textmsg },
//     dataType: "json",
//     success: function (response) {
//       if (response.status) {
//         $("#messageInput").val("");
//         $("#chatArea").text("");

//         fetchChannelMessage(id);

//         return;
//       }
//     },
//   });
// }
// function getChannelContent(group_id, id) {
//   $("#chatBox").load("./templates/chatBox.html", function () {
//     // console.log(group_id, id);
//     const pfp = $("#contactProfilePicture");
//     const contactUsername = $("#contactUsername");
//     const contactStatus = $("#contactStatus");
//     const sendBtn = $("#sendBtn");
//     contactUsername.text("");
//     contactStatus.text("");
//     $(".active-contact").removeClass("active-contact");
//     $(`#${id}`).addClass("active-contact");
//     $.ajax({
//       type: "post",
//       url: "../api/getChannelData.php",
//       data: { group_id },
//       dataType: "json",
//       success: function (response) {
//         if (response.status) {
//           pfp.attr("src", `./uploads/${response.data.group_image}`);
//           contactUsername.text(response.data.group_name);
//           contactStatus
//             .text(`${response.data.members_count}`)
//             .addClass("text-success");
//           sendBtn.attr("onclick", `sendChannelMessage('${response.data.id}')`);
//           $("#chatArea").text("");
//         }
//       },
//     });
//   });
// }
// function getChannel() {
//   $.ajax({
//     type: "post",
//     url: "../api/getChannels.php",
//     data: { userToken },
//     dataType: "json",
//     success: function (response) {
//       if (response.status) {
//         console.log(response);
//         const groupsContainer = $("#contactsContainer");
//         for (let i = 0; i < response.data.length; i++) {
//           let group = response.data[i];
//           groupsContainer.append(
//             $("<div>")
//               .addClass(
//                 "d-flex align-items-center bg-white gap-2 p-2 group onHover m-1 rounded-2",
//               )
//               .attr({
//                 id: `group${i}`,
//                 onclick: `getChannelContent(${group.id}, 'group${i}')`,
//               })
//               .append(
//                 $("<img>")
//                   .addClass("rounded-circle")
//                   .attr({
//                     src: `./uploads/${group.group_image || "default.png"}`,
//                     height: "50",
//                     width: "50",
//                   }),

//                 $("<div>")
//                   .addClass("flex-grow-1")
//                   .append(
//                     $("<div>")
//                       .addClass("fw-semibold group-name")
//                       .text(group.group_name),

//                     $("<small>")
//                       .addClass("text-muted text-truncate d-block")
//                       .text(`${group.members_count} members`),
//                   ),
//               ),
//           );
//         }
//       }
//     },
//   });
// }

// $(document).ready(function () {
//     $(document).on("click", "#uploadChannelImageTriggerBtn", function () {
//     $("#channelPhoto").click();
//   });

//   $(document).on("change", "#channelPhoto", function () {
//     const file = this.files[0];
//     if (!file) {
//       return;
//     }
//     const groupImagePreview = $("#groupImagePreview");
//     groupImagePreview.attr("src", URL.createObjectURL(file));
//   });

//   $(document).on("click", "#cancelCreateChannel", function () {
//     $("#groupImagePreview").attr("src", "./assects/placeholderImg.jpg");
//     $("#createChannelForm").reset();
//   });

//   $(document).on("click", "#createChannelConfirm", function () {
//     const channelName = $("#ChannelNameInput").val().trim();
//     if (channelName.length < 4 && channelName.length > 30) {
//       $("#channelNameError").removeClass("d-none");
//       return;
//     }
//     const form = document.getElementById("createChannelForm");
//     let formData = new FormData(form);
//     formData.append("token", userToken);
//     $.ajax({
//       type: "post",
//       url: "../api/createChannel.php",
//       data: formData,
//       dataType: "json",
//       processData: false,
//       contentType: false,
//       success: function (response) {
//         $("#createChannelForm").reset();
//         window.location.reload();
//         getContacts(getChannel);
//       },
//     });
//   });
// });