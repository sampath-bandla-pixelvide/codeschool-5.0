const ChatApp = (function () {
  let convList = [];

  return {
    setConversations(data) {
      convList = data;
    },
    getConversation(index) {
      return convList[index];
    },
    getConversations() {
      return convList;
    },
    addConversation(conv) {
      convList.push(conv);
    },
  };
})();

function getAvatarUrl(userOrName, size) {
  size = size || 40;
  let name = "User";
  if (typeof userOrName === "object" && userOrName !== null) {
    if (userOrName.profile_picture) {
      return userOrName.profile_picture;
    }
    name =
      (
        (userOrName.first_name || "") +
        " " +
        (userOrName.last_name || "")
      ).trim() || "User";
  } else if (typeof userOrName === "string") {
    name = userOrName.trim() || "User";
  }
  return (
    "https://ui-avatars.com/api/?name=" +
    encodeURIComponent(name) +
    "&background=5f6368&color=fff&size=" +
    size +
    "&rounded=true&bold=true"
  );
}

function timeAgo(dateStr) {
  let now = new Date();
  let then = new Date(dateStr);
  let diff = Math.floor((now - then) / 60000);

  if (diff < 1) return "now";
  if (diff < 60) return diff + " min";
  if (diff < 1440) return Math.floor(diff / 60) + " hr";

  let days = Math.floor(diff / 1440);
  if (days < 30) return days + "d";

  let months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[then.getMonth()] + " " + then.getFullYear();
}

function highlightMentions(text) {
  return text.replace(
    /@([A-Za-z]+\s[A-Za-z]+)/g,
    '<span style="color:#8ab4f8; font-weight:500">@$1</span>',
  );
}

function getMessageDateDivider(dateStr) {
  let then = new Date(dateStr);
  let now = new Date();

  let thenDay = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  let nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let diffDays = Math.floor((nowDay - thenDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    let days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[then.getDay()];
  }
  if (diffDays < 30) return "A week ago";
  return "A month ago";
}
