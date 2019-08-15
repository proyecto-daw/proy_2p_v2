$(document).ready(function() {
  $("form").submit(function(event) {
    event.preventDefault();
    $.ajax({
      url: "signup",
      method: "POST",
      data: {
        "USERNAME": $("input#inputUsername").val(),
        "NAMES": $("input#firstName").val(),
        "LASTNAMES": $("input#lastName").val(),
        "EMAIL": $("input#inputEmail").val(),
        "PASSWORD": $("input#inputPassword").val(),
        "CAREER": $("input#inputCareer").val()
      },
      success: function(data, status) {
        window.location.href = "/";
      }
    });
  });
});
