console.log("create.js loaded");

$(document).ready(function () {
  let selectedFile = null;

  $(document).on("click", "#createBtn", function () {
    console.log("Create clicked");

    const modal = new bootstrap.Modal(document.getElementById("uploadModal"));
    modal.show();

    $("#step1").removeClass("d-none");
    $("#step2, #step3, #step4").addClass("d-none");

    $("#nextBtn, #sharePostBtn").addClass("d-none");
  });

  $(document)
    .off("click", "#selectBtn")
    .on("click", "#selectBtn", function () {
      $("#imageInput").click();
    });
  $(document)
    .off("change", "#imageInput")
    .on("change", "#imageInput", function () {
      let file = this.files[0];
      if (!file) return;

      selectedFile = file;

      let reader = new FileReader();
      reader.onload = function (e) {
        $("#previewImg").attr("src", e.target.result);
      };
      reader.readAsDataURL(file);

      $("#step1").addClass("d-none");
      $("#step2").removeClass("d-none");

      $("#nextBtn").removeClass("d-none");
    });

  $(document).on("click", "#nextBtn", function () {
    $("#step2").addClass("d-none");
    $("#step3").removeClass("d-none");

    $("#finalPreview").attr("src", $("#previewImg").attr("src"));

    $("#nextBtn").addClass("d-none");
    $("#sharePostBtn").removeClass("d-none");
  });

  $(document)
    .off("click", "#sharePostBtn")
    .on("click", "#sharePostBtn", function () {
      if (!selectedFile) {
        alert("Select image first");
        return;
      }

      let formData = new FormData();
      formData.append("image", selectedFile);

      $("#step3").addClass("d-none");
      $("#step4").removeClass("d-none");

      $("#finalSpinner").removeClass("d-none");
      $("#successText").addClass("d-none");

      $.ajax({
        url: "api/uploadPost.php",
        method: "POST",
        data: formData,
        processData: false,
        contentType: false,

        success: function (res) {
          console.log("RAW RESPONSE:", res);

          try {
            let response = typeof res === "string" ? JSON.parse(res) : res;

            if (response.status === "success") {
              $("#finalSpinner").addClass("d-none");
              $("#successText").removeClass("d-none");
              $("#gettingStartedCards").addClass("d-none");
              $("#postsContainer").removeClass("d-none");

              $("#postsContainer").prepend(`
        <div class="post" data-id="${response.post_id}">
            <img src="api/${response.image}" 
                 style="width:100%; height:100%; object-fit:cover;">
        </div>
    `);
              let count = parseInt($("#postCount").text()) || 0;
              $("#postCount").text(count + 1);
            } else {
              $("#finalSpinner").addClass("d-none");
              alert(response.message);
            }
          } catch (e) {
            console.log("JSON ERROR:", res);

            $("#finalSpinner").addClass("d-none");

            $("#successText").removeClass("d-none");
          }
        },
        error: function (xhr) {
          console.log("ACTUAL ERROR RESPONSE:");
          console.log(xhr.responseText);

          $("#finalSpinner").addClass("d-none");
          alert("Upload failed");
        },
      });
    });
});
