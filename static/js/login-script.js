$(document).ready(function() {
  $("p#login-error").hide();

  $("a#login").click(function() {

    $.ajax({
      url: "data/users.json",
      //url: "http://localhost:5000/data/users.json",
      method: "POST",
      data: {
        "username": $("input#inputEmail").val(),
        "password": $("input#inputPassword").val()
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
