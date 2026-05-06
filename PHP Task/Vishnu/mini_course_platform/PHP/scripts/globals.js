let token = localStorage.getItem("token");
let user = null;
let currentCourseId = null;

function getAuthHeaders() {
  return { Authorization: token };
}
