$(document).ready(function () {
  loadQuestions();

  function loadQuestions() {
    $.ajax({
      type: "GET",
      url: "api/get_questions.php",
      dataType: "json",

      success: function (response) {
        if (response.status) {
          let html = "";

          if (response.data.length === 0) {
            html = `
              <tr>
                <td colspan="5" class="text-center text-muted">
                  No questions found
                </td>
              </tr>
            `;
          } else {
            $.each(response.data, function (index, q) {
              html += `
                <tr>
                  <td>${index + 1}</td>
                  <td>${q.subject_name}</td>
                  <td>${q.question}</td>
                  <td>
                    <span class="badge bg-success">
                      ${q.correct_answer}
                    </span>
                  </td>
                  <td>
                    <button 
                      class="btn btn-sm btn-danger deleteBtn"
                      data-id="${q.id}"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              `;
            });
          }

          $("#questionsTable").html(html);
        }
      },

      error: function () {
        Swal.fire("Error", "Failed to load questions", "error");
      },
    });
  }

  $(document).on("click", ".deleteBtn", function () {
    let id = $(this).data("id");

    Swal.fire({
      title: "Are you sure?",
      text: "This question will be deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    }).then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          type: "POST",
          url: "api/delete_question.php",
          data: {
            id: id,
          },
          dataType: "json",

          success: function (response) {
            if (response.status) {
              Swal.fire("Deleted", response.message, "success");
              loadQuestions();
            } else {
              Swal.fire("Error", response.message, "error");
            }
          },
        });
      }
    });
  });
});
