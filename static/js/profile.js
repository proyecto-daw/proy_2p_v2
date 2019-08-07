var user;

$(document).ready(function() {
  $("#close-well").click(function() {
    $("#welcome").slideUp();
    window.localStorage.setItem("showBannerProfile", "no");
  });
  if (localStorage.getItem("showBannerProfile")) {
    $("#welcome").hide();
  }

  updateUserData();
});

var toAnimate = [];

function updateUserData() {
  user = sessionStorage.getItem("user");

  if (user == null) {
    window.location.href = "home"
  }

  user = JSON.parse(user); // Logged in, show dropdown and change "Iniciar sesión" to username
  $("#nombre").attr("placeholder", user.NAMES);
  $("#apellido").attr("placeholder", user.LASTNAMES);
  $("#n_usuario").attr("placeholder", user.USERNAME);
  $("#correo").attr("placeholder", user.EMAIL);
  $("#carrera").attr("placeholder", user.CAREER);

  $.notify.defaults({
    className: "success"
  });

  $.ajax({
    url: "get_friends_groups",
    method: "POST",
    data: {
      "username": user.EMAIL,
      "password": user.PASSWORD
    },
    success: function(data, status) {
      let friends = data.friends;
      let i = 0;
      for (let f of friends) {
        i++;
        $("div#no-friends-alert").hide();
        var card = $("#friend-template").clone().removeAttr("id");
        card.attr("id", "friend-" + i);
        //card.show();
        $(".text-primary", card).text(f.NAMES + " " + f.LASTNAMES);
        $("a.search-friend", card).click(function() {
          searchFor(f.EMAIL)
        });
        $("a.unfriend", card).click(function() {
          unfriend(f.EMAIL)
        });

        $("#collapseCardFriends>.card-body").append(card);
        toAnimate.push(card);
      }
      animateFriends(1);
      toAnimate = [];
      let groups = data.groups;
      i = 0;
      for (let g of groups) {
        i++;
        $("div#no-groups-alert").hide();
        var card = $("#group-template").clone().removeAttr("id");
        card.attr("id", "group-" + i);
        //card.show();
        $(".text-primary", card).text(g.name);
        $("a.edit-group", card).click(function() {
          window.location = "/groups/"+g.pk+"/edit";
        });
        $("a.delete-group", card).click(function() {
          $.ajax({
            url: "api/groups/" + g.pk + "/",
            method: "DELETE",
            beforeSend:function(xhr){
              xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            },
            success: function(data, status) {
              location.reload();
            },
            error: function(xhr, status, error) {
              alert("Server error!");
            }
          });
        });

        $("#collapseCardGroups>.card-body").append(card);
        toAnimate.push(card);
      }
      animateFriends(1);
    }
  });
}

function animateFriends(i) {
  if (toAnimate.length == 0) {
    return;
  }
  let next = toAnimate.shift();
  next.show();

  $("#friend-" + i).removeClass().addClass('animated slideInLeft faster').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
    $(this).removeClass();
    animateFriends(i + 1); // Only animate card after previous card has completed animation
  });
}

function searchFor(email) {
  message = prompt("Escriba un mensaje para " + email);
  if (message == null) { // User clicked "Cancel" button
    return;
  }
  $.ajax({
    url: "ask_position",
    method: "POST",
    data: {
      "username": user.EMAIL,
      "password": user.PASSWORD,
      "friend_email": email,
      "message": message
    },
    success: function() {
      $.notify("Se ha enviado una solicitud de posición a " + email + ".\nVe a la página de inicio para recibirla.");
    }
  });
}

function unfriend(email) {
  $.ajax({
    url: "remove_friend",
    method: "POST",
    data: {
      "username": user.EMAIL,
      "password": user.PASSWORD,
      "no_longer_friend": email
    },
    success: function() {
      location.reload();
    }
  });
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}