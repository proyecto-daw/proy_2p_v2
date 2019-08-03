var app;
var user;

$(document).ready(function() {
  user = sessionStorage.getItem("user");
  if (user != null) {
    user = JSON.parse(user);
    getMyFriends();
  }

  if (localStorage.getItem("showBannerContacts")) {
    $("#welcome").hide();
  }

  $.notify.defaults({
    className: "success"
  });

  app = new Vue({
    el: '#content',
    data: {
      results: [],
      searched: false,
      friends: []
    },
    computed: {
      loggedIn: function() {
        return user != null;
      },
      anyResults: function() {
        return this.results.length > 0;
      },
      anyFriends: function() {
        return this.friends.length > 0;
      }
    },
    methods: {
      toggleSidebar: function() {
        $("body").toggleClass("sidebar-toggled");
        $(".sidebar").toggleClass("toggled");
        if ($(".sidebar").hasClass("toggled")) {
          $(".sidebar .collapse").hide();
        }
      },
      closeWell: function() {
        $("#welcome").slideUp();
        window.localStorage.setItem("showBannerContacts", "no");
      },
      locate: function(email) {
        locate(email);
      },
      filterTextA: function() {
        this.filterText($("input#filterTextA").val());
      },
      filterTextB: function() {
        this.filterText($("input#filterTextB").val());
      },
      filterText: function(text) {
        if (text == "") {
          this.results = [];
          return;
        }

        $.ajax({
          url: "search_people",
          method: "POST",
          data: {
            "username": user.EMAIL,
            "password": user.PASSWORD,
            "query": text
          },
          success: function(data, status) {
            app.results = data.found;
          }
        });
      },
      makeFriend(u) {
        $.ajax({
          url: "add_friend",
          method: "POST",
          data: {
            "username": user.EMAIL,
            "password": user.PASSWORD,
            "friend": u.EMAIL
          },
          success: function(data, status) {
            app.friends.push(u);
            app.$delete(app.results, app.results.indexOf(u));
          }
        });
      }
    }
  });

  $("#close-well").click(function() {
    $("#welcome").slideUp();
    window.localStorage.setItem("showBannerContacts", "no");
  });
  if (localStorage.getItem("showBannerContacts")) {
    $("#welcome").hide();
  }
});



function getMyFriends() {
  $.ajax({
    url: "get_friends_groups",
    method: "POST",
    data: {
      "username": user.EMAIL,
      "password": user.PASSWORD
    },
    success: function(data, status) {
      app.friends = data.friends;
    }
  });
}

function locate(email) {
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
