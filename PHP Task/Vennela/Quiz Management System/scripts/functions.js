
function displayOptions(options) {
  let html = "";
  options.forEach((opt, i) => {
    html += `
      <div class="option" data-id="${opt.id}">
        ${String.fromCharCode(65 + i)}. ${opt.text}
      </div>
    `;
  });

  $("#optionsList").html(html);
  selectedOption = null;
}
function displayQuizzes(data, role = "user") {
  let html = "";
  data.forEach((subject) => {
    html += `
      <div class="d-flex justify-content-between align-items-center mt-4 mb-2">
        <h4 class="quiz-subject mb-0">${subject.subject}</h4>
        ${role === "admin" ? `
          <button class="btn add-quiz-btn" data-id="${subject.subject_id}">
            <i class="bi bi-plus-lg"></i> Add Quiz
          </button>
        ` : ""}
      </div>
      <div class="row g-2">
    `;
    subject.quizzes.forEach((q) => {
      html += `
        <div class="col-md-4">
          <div class="card-custom p-3 h-100 position-relative">
            ${role === "admin" ? `
              <div class="quiz-actions">
                <i class="bi bi-pencil-square edit-btn"
                  data-id="${q.id}"
                  data-subject="${subject.subject_id}"></i>
                <i class="bi bi-trash delete-btn" data-id="${q.id}"></i>
              </div>
            ` : ""}
            <h5>${q.title}</h5>
            <p class="quiz-marks">${q.marks} Questions</p>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <small>
                <i class="bi bi-clock"></i> 
                ${formatTime((q.question_count || q.marks) * 30)}
              </small>
             ${role === "user" ? `
  <button class="start-btn btn btn-success btn-sm"
    data-id="${q.id}" 
    data-title="${q.title}"
    data-duration="${q.duration_minutes}">
    Start <i class="bi bi-arrow-right-short"></i>
  </button>
` : ""}
            </div>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  });
  $("#quizContainer").html(html);
}
function formatTime(totalSec) {
  let min = Math.floor(totalSec / 60);
  let sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}