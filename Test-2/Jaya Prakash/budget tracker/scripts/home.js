const userToken = localStorage.getItem("userToken");
if (!userToken) {
  localStorage.removeItem("userToken");
  window.location.replace("./index.html");
}

function setHeader() {
  return { Authentication: localStorage.getItem("userToken") };
}

function logout() {
  $.ajax({
    type: "GET",
    headers: setHeader(),
    url: "../api/logout.php",
    dataType: "json",
    success: function (response) {
      if (response) {
        localStorage.removeItem("userToken");
        window.location.replace("./index.html");
      }
    },
    error: function (err) {
      localStorage.removeItem("userToken");
      window.location.replace("./index.html");
    },
  });
}

function validateToken() {
  $.ajax({
    type: "GET",
    headers: setHeader(),
    url: "../api/validateToken.php",
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        Swal.fire("Error", response.message, "warning").then(() => {
          logout();
          return;
        });
      }
      $("#navbarUsername").text(response.data["first_name"]);
    },
    error: function (err) {
      console.error(err);
      logout();
    },
  });
}

function darkMode(isDarkMode = localStorage.getItem("isDarkMode") === "true") {
  if (!isDarkMode) {
    $(".bg-black").removeClass("bg-black").addClass("bg-light");
    $(".text-white").removeClass("text-white").addClass("text-dark");
    $(".darkmode-hover")
      .removeClass("darkmode-hover")
      .addClass("lightmode-hover");
    $("body").removeClass("darkmode").addClass("lightmode");
    $("#offcanvasClose").removeClass("btn-close-white");
  } else {
    $(".bg-light").removeClass("bg-light").addClass("bg-black");
    $(".text-dark").removeClass("text-dark").addClass("text-white");
    $(".lightmode-hover")
      .removeClass("lightmode-hover")
      .addClass("darkmode-hover");
    $("body").removeClass("lightmode").addClass("darkmode");
    $("#offcanvasClose").addClass("btn-close-white");
  }
  $("#darkModeSwitch").prop("checked", isDarkMode);
}

function removeActiveLink() {
  $(".active-link").removeClass("active-link");
}

function getUserProfileData() {
  $.ajax({
    type: "GET",
    url: "../api/getUserProfileData.php",
    headers: setHeader(),
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        Swal.fire("Error", response.message, "error").then(() => {
          window.location.reload();
          return;
        });
      } else {
        $("#userProfileFirstName").val(response.data.first_name);
        $("#userProfileLastName").val(response.data.last_name);
        $("#userProfilePhone").val(response.data.phone_number);
        $("#userProfileEmail").val(response.data.email);
        if (response.data.photo) {
          let src = `./uploads/${response.data.photo}`;
          $("#userProfileImg").attr("src", src);
        }
      }
    },
    error: function (err) {
      console.error(err);
    },
  });
}

function getCategories() {
  $.ajax({
    type: "GET",
    url: "../api/getCategories.php",
    headers: setHeader(),
    dataType: "json",
    success: function (response) {
      if (response.status) {
        if (response.data.length > 0) {
          let html = "";
          for (let i = 0; i < response.data.length; i++) {
            html += `
                        <tr>
                          <td>${i + 1}</td>
                          <td>${response.data[i].name}</td>
                          <td>
                            <button class="btn btn-sm btn-danger deleteCategoryBtn" onclick="deleteCategory('${response.data[i].id}')">
                              Delete
                            </button>
                          </td>
                        </tr>
                      `;
          }
          $("#categoryTable").html(html);
        }
      }
    },
    error: function (err) {
      console.error(err);
    },
  });
}

function deleteCategory(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "This category will be deleted permanently!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "red",
    cancelButtonColor: "grey",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (!result.isConfirmed) {
      return;
    }

    $.ajax({
      type: "POST",
      url: "../api/deleteCategory.php",
      headers: setHeader(),
      data: {
        id,
      },
      dataType: "json",
      success: function (res) {
        if (!res.status) {
          Swal.fire("Error", "Failed to delete category", "error");
          return;
        }
        Swal.fire("Deleted!", "Category removed successfully.", "success").then(
          () => {
            getCategories();
          },
        );
      },

      error: function (err) {
        Swal.fire("Error", "Something went wrong", "error");
        console.error(err);
      },
    });
  });
}

function getMonth(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function loadMonths() {
  validateToken();
  $.ajax({
    type: "GET",
    url: "../api/getMonths.php",
    headers: setHeader(),
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        return;
      }
      $("#monthList").html("");
      $("#expenseIncomeMonth").html("");
      $("#monthList").append(`
        <option value="0" selected>
          All Months
        </option>
      `);
      const currentMonth = getMonth();
      response.data.forEach((item) => {
        $("#monthList").append(
          `<option value="${item.month}"}>
            ${item.month}
          </option>`,
        );

        $("#expenseIncomeMonth").append(
          `<option value="${item.month}" ${item.month === currentMonth ? "selected" : ""}>
            ${item.month}
          </option>`,
        );
      });
      getMonthlySummary($("#monthList").val());
    },
    error: function (err) {
      console.error(err);
    },
  });
}

function addIncome() {
  const amount = $("#incomeAmount").val();
  const incomeDate = $("#incomeDate").val();
  if (!amount || !incomeDate) {
    Swal.fire("Warning", "All fields are required!!", "warning");
    return;
  }
  $.ajax({
    type: "POST",
    url: "../api/addIncome.php",
    headers: setHeader(),
    data: {
      amount,
      incomeDate,
    },
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        Swal.fire("Error", response.message, "error");
        return;
      }
      Swal.fire("Success", response.message, "success").then(() => {
        getIncome();
      });
      $("#incomeAmount").val("");
      $("#incomeDate").val("");
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addIncomeModal"),
      );
      modal.hide();
    },
    error: function (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong", "error");
    },
  });
}

function getIncome() {
  $.ajax({
    type: "GET",
    url: "../api/getIncome.php",
    headers: setHeader(),
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        return;
      }
      let html = "";
      for (let i = 0; i < response.data.length; i++) {
        html += `
          <tr>
            <td>${i + 1}</td>
            <td>
              ₹${response.data[i].amount}
            </td>
            <td>
              ${response.data[i].income_date}
            </td>
            <td>
              <button
                class="btn btn-danger btn-sm"
                onclick="deleteIncome('${response.data[i].id}')"
              >
                Delete
              </button>
            </td>
          </tr> 
        `;
      }
      $("#incomeTableBody").html(html);
    },
  });
}

function deleteIncome(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "This income will be deleted permanently!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "red",
    cancelButtonColor: "grey",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (!result.isConfirmed) {
      return;
    }
    $.ajax({
      type: "POST",
      url: "../api/deleteIncome.php",
      headers: setHeader(),
      data: {
        id,
      },
      dataType: "json",
      success: function (response) {
        if (!response.status) {
          Swal.fire("Error", response.message, "error");
          return;
        }
        Swal.fire("Deleted!", "Income removed successfully.", "success").then(
          () => {
            getIncome();
          },
        );
      },
      error: function (err) {
        Swal.fire("Error", "Something went wrong", "error");
        console.error(err);
      },
    });
  });
}

function getMonthlySummary(month) {
  $.ajax({
    type: "GET",
    url: "../api/getMonthlySummary.php",
    headers: setHeader(),
    data: {
      month,
    },
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        return;
      }
      $("#incomeAmountSpan").text(response.data.income);
      $("#expensesAmountSpan").text(response.data.expenses);
      $("#savingsAmountSpan").text(response.data.savings);
      renderDashboardBars(
        response.data.income,
        response.data.expenses,
        response.data.savings,
      );
    },
    error: function (err) {
      console.error(err);
    },
  });
}

function addExpense() {
  $(".text-danger").addClass("d-none");
  $(".form-control").removeClass("is-invalid");

  const categoryId = $("#expenseCategory");
  const title = $("#expenseTitle");
  const description = $("#expenseDescription");
  const amountSpent = $("#expenseAmount");
  const spentDate = $("#expenseDate");
  const expenseIncomeMonth = $("#expenseIncomeMonth");

  let errorFlag = false;

  if (!categoryId.val()) {
    $("#expenseCategoryError").removeClass("d-none");
    categoryId.addClass("is-invalid");
    errorFlag = true;
  }

  if (title.val().trim().length < 4 || title.val().trim().length > 30) {
    $("#expenseTitleError").removeClass("d-none");
    title.addClass("is-invalid");
    errorFlag = true;
  }

  if (description.val().trim().length === 0) {
    $("#expenseDescriptionError").removeClass("d-none");
    description.addClass("is-invalid");
    errorFlag = true;
  }

  if (!amountSpent.val() || amountSpent.val() <= 0) {
    $("#expenseAmountError").removeClass("d-none");
    amountSpent.addClass("is-invalid");
    errorFlag = true;
  }

  if (!spentDate.val()) {
    $("#expenseDateError").text("Please select date").removeClass("d-none");
    spentDate.addClass("is-invalid");
    errorFlag = true;
  }

  const expenseDateMonth = getMonth(new Date(spentDate.val()));
  if (
    expenseIncomeMonth.val() &&
    expenseDateMonth !== expenseIncomeMonth.val()
  ) {
    $("#expenseDateError")
      .text("Expense date and selected month must match")
      .removeClass("d-none");
    spentDate.addClass("is-invalid");
    errorFlag = true;
  }

  if (!expenseIncomeMonth.val()) {
    $("#expenseIncomeMonthError").removeClass("d-none");
    expenseIncomeMonth.addClass("is-invalid");
    errorFlag = true;
  }

  const today = new Date();
  const selectedDate = new Date(spentDate.val());

  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate > today) {
    $("#expenseDateError")
      .text("Future date is not allowed")
      .removeClass("d-none");
    spentDate.addClass("is-invalid");
    errorFlag = true;
  }
  if (errorFlag) {
    return;
  }
  $.ajax({
    type: "POST",
    url: "../api/addExpense.php",
    headers: setHeader(),
    data: {
      categoryId: categoryId.val(),
      title: title.val(),
      description: description.val(),
      amountSpent: amountSpent.val(),
      spentDate: spentDate.val(),
      expenseIncomeMonth: expenseIncomeMonth.val(),
    },
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        return;
      }
      getExpenses();
      getMonthlySummary($("#monthList").val());
      $("#expenseTitle").val("");
      $("#expenseDescription").val("");
      $("#expenseAmount").val("");
      $("#expenseDate").val("");
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addExpenseModal"),
      );
      modal.hide();
    },
  });
}

function getExpenses() {
  const month = $("#monthList").val();
  const categoryId = $("#statusList").val();
  $.ajax({
    type: "GET",
    url: "./api/getExpenses.php",
    headers: setHeader(),
    data: {
      month,
      categoryId,
    },
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        return;
      }
      let html = "";
      if (response.data.length === 0) {
        html = `
          <tr>
            <td colspan="6">
              No expenses found
            </td>
          </tr>
        `;
      } else {
        for (let i = 0; i < response.data.length; i++) {
          html += `
            <tr>
              <td>
                ${i + 1}
              </td>
              <td>
                ${response.data[i].category_name}
              </td>
              <td>
                ${response.data[i].title}
              </td>
              <td>
                ₹${response.data[i].amount_spent}
              </td>
              <td>
                ${response.data[i].spent_date}
              </td>
              <td>
                <button
                  class="btn btn-danger btn-sm"
                  onclick="deleteExpense('${response.data[i].id}')"
                >
                  Delete
                </button>
              </td>
            </tr>     
          `;
        }
      }
      $("#expensesTableBody").html(html);
    },
    error: function (err) {
      console.error(err);
    },
  });
}

function deleteExpense(id) {
  $.ajax({
    type: "POST",
    url: "../api/deleteExpense.php",
    headers: setHeader(),
    data: { id },
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        Swal.fire("Warning", response.message, "warning");
        return;
      }
      Swal.fire("Success", response.message, "success").then(() => {
        getExpenses();
      });
    },
    error: function (err) {
      Swal.fire("Error", "Error while fetching the data!", "error");
      console.error(err);
    },
  });
}

function loadCategoriesForSelect() {
  $.ajax({
    type: "GET",
    url: "../api/getCategories.php",
    headers: setHeader(),
    dataType: "json",
    success: function (response) {
      if (!response.status) {
        return;
      }
      $("#expenseCategory,#statusList").html("");
      $("#statusList").html(`<option value="0">
                              All Categories
                            </option>`);
      response.data.forEach((item) => {
        $("#expenseCategory,#statusList").append(`
          <option value="${item.id}">
            ${item.name}
          </option>
        `);
      });
    },
  });
}

function clearExpensesFormErrors() {
  $(".text-danger").addClass("d-none");
  $("#expenseCategory").removeClass("is-invalid");
  $("#expenseTitle").removeClass("is-invalid");
  $("#expenseDescription").removeClass("is-invalid");
  $("#expenseAmount").removeClass("is-invalid");
  $("#expenseDate").removeClass("is-invalid");
  $("#expenseIncomeMonth").removeClass("is-invalid");
}

function renderDashboardBars(income, expenses, savings) {
  let maxValue = Math.max(income, expenses, savings);
  if (maxValue === 0) {
    maxValue = 1;
  }

  const incomeWidth = (income / maxValue) * 100;
  const expensesWidth = (expenses / maxValue) * 100;
  const savingsWidth = (savings / maxValue) * 100;

  $("#incomeGraphBar").css("width", `${incomeWidth}%`);
  $("#expensesGraphBar").css("width", `${expensesWidth}%`);
  $("#savingsGraphBar").css("width", `${savingsWidth}%`);

  $("#incomeGraphAmount").text(`₹${income}`);
  $("#expensesGraphAmount").text(`₹${expenses}`);
  $("#savingsGraphAmount").text(`₹${savings}`);
}

$(document).ready(function () {
  validateToken();
  darkMode();

  $("#mainContainer").load("./templates/dashboard.html", () => {
    darkMode();
    loadMonths();
  });

  $("#logoutBtn").on("click", () => logout());

  $(document).on("click", "#darkModeSwitch", () => {
    if ($("#darkModeSwitch").is(":checked")) {
      localStorage.setItem("isDarkMode", true);
    } else {
      localStorage.setItem("isDarkMode", false);
    }
    darkMode();
  });

  $("#settingsBtn").on("click", () => {
    $("#mainContainer").load("./templates/settings.html", () => {
      darkMode();
      getUserProfileData();
    });
  });

  $("#dashboardLink,#offcanvasDashboardLink").on("click", function () {
    removeActiveLink();

    $(this).addClass("active-link");

    $("#pageTitle").text("Dashboard");

    $("#mainContainer").load("./templates/dashboard.html", () => {
      darkMode();
      loadMonths();
    });
  });

  $("#expensesLink,#offcanvasExpensesLink").on("click", function () {
    removeActiveLink();
    $(this).addClass("active-link");
    $("#pageTitle").text("Expenses");
    $("#mainContainer").load("./templates/expenses.html", () => {
      darkMode();
      loadMonths();
      loadCategoriesForSelect();
      getExpenses();
    });
  });

  $("#incomeLink,#offcanvasIncomeLink").on("click", function () {
    removeActiveLink();

    $(this).addClass("active-link");

    $("#pageTitle").text("Income");

    $("#mainContainer").load("./templates/income.html", () => {
      darkMode();
      getIncome();
    });
  });

  $("#categoriesLink,#offcanvasCategoriesLink").on("click", function () {
    removeActiveLink();

    $(this).addClass("active-link");

    $("#pageTitle").text("Categories");

    $("#mainContainer").load("./templates/categories.html", () => {
      darkMode();
      getCategories();
    });
  });

  $(document).on("click", "#editProfileBtn", function () {
    $(
      "#userProfileFirstName, #userProfileLastName, #userProfilePhone, #userProfileEmail",
    ).prop("disabled", false);
    $("#userProfileFirstName").focus();
    $("#editAndResetPasswordBtnsContainer").addClass("d-none");
    $("#confirmationBtnsContainer").removeClass("d-none");
  });

  $(document).on("click", "#cancelBtn", function () {
    $(
      "#userProfileFirstName, #userProfileLastName, #userProfilePhone, #userProfileEmail",
    ).prop("disabled", true);

    $("#editAndResetPasswordBtnsContainer").removeClass("d-none");
    $("#confirmationBtnsContainer").addClass("d-none");
    $("#settingsBtn").click();
  });

  $(document).on("click", "#saveCategoryBtn", function () {
    const name = $("#CategoryNameInput").val().trim();
    if (name.length === 0) {
      return;
    }
    $.ajax({
      type: "POST",
      url: "../api/addCategory.php",
      headers: setHeader(),
      data: {
        name,
      },
      dataType: "json",
      success: function (response) {
        if (!response.status) {
          Swal.fire("Failed", response.message, "warning");
          return;
        }
        Swal.fire("Success", "Category added successfully!", "success").then(
          () => {
            getCategories();
          },
        );
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("addCategoryModal"),
        );
        modal.hide();
      },
    });
  });

  $(document).on("click", "#saveIncomeBtn", addIncome);

  $(document).on("change", "#monthList", function () {
    getMonthlySummary($(this).val());
  });

  $(document).on("click", "#saveExpenseBtn", addExpense);

  $(document).on("change", "#statusList", function () {
    getExpenses();
  });

  $(document).on("change", "#monthList", function () {
    getExpenses();
  });

  $(document).on(
    "input",
    "#expenseCategory, #expenseTitle, #expenseDescription, #expenseAmount, #expenseDate, #expenseIncomeMonth",
    function () {
      clearExpensesFormErrors();
    },
  );
});
