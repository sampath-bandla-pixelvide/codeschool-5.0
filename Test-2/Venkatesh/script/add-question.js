$(document).ready(function () {
  loadSubjects();


  function loadSubjects() {
    $.ajax({
      type: "GET",
      url: "api/get_subjects.php",
      dataType: "json",

      success: function (response) {
        if (response.status) {
          let options = `<option value="">Select Subject</option>`;

          $.each(response.data, function (index, subject) {
            options += `
              <option value="${subject.id}">
                ${subject.subject_name}
              </option>
            `;
          });

          $("#subject_id").html(options);
        }
      },

      error: function () {
        Swal.fire("Error", "Failed to load subjects", "error");
      },
    });
  }
  $("#addQuestionForm input, #addQuestionForm textarea, #addQuestionForm select")
  .on("input change", function () {
    $(this).next(".error").text("");
  });
  $("#addQuestionForm").submit(function (e) {
    e.preventDefault();

    $(".error").text("");

    let subjectId = $("#subject_id").val();
    let question = $("#question").val().trim();
    let optionA = $("#option_a").val().trim();
    let optionB = $("#option_b").val().trim();
    let optionC = $("#option_c").val().trim();
    let optionD = $("#option_d").val().trim();
    let correctAnswer = $("#correct_answer").val();

    let isValid = true;

    if (subjectId === "") {
      $("#subject_id").next(".error").text("Subject is required");
      isValid = false;
    }

    if (question === "") {
      $("#question").next(".error").text("Question is required");
      isValid = false;
    }

    if (optionA === "") {
      $("#option_a").next(".error").text("Option A is required");
      isValid = false;
    }

    if (optionB === "") {
      $("#option_b").next(".error").text("Option B is required");
      isValid = false;
    }

    if (optionC === "") {
      $("#option_c").next(".error").text("Option C is required");
      isValid = false;
    }

    if (optionD === "") {
      $("#option_d").next(".error").text("Option D is required");
      isValid = false;
    }

    if (correctAnswer === "") {
      $("#correct_answer").next(".error").text("Correct answer is required");
      isValid = false;
    }

    if (!isValid) return;

    $.ajax({
      type: "POST",
      url: "api/add_question.php",
      data: {
        subject_id: subjectId,
        question: question,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_answer: correctAnswer,
      },
      dataType: "json",

      success: function (response) {
        if (response.status) {
          Swal.fire("Success", response.message, "success");
          $("#addQuestionForm")[0].reset();
        } else {
          Swal.fire("Error", response.message, "error");
        }
      },

      error: function () {
        Swal.fire("Error", "Server error", "error");
      },
    });
  });
});
