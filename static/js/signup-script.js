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
        var found = null;
        $(data.members).each(function(i, member) {
          if (member.EMAIL == $("input#inputEmail").val() && member.PASSWORD == $("input#inputPassword").val()) {
            found = member;
            return false; // break out of each() callback
          }
        });

        if (found == null) {
          $("p#login-error").show();
        } else {
          sessionStorage.setItem("user", JSON.stringify(found)); // Save user on WebStorage session
          window.location.href = "home"; // Redirect to home page
        }
      }
    });
  });
});
