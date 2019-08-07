var app;

$(document).ready(function() {

  app = new Vue({
    el: '#content',
    data: {
      users: {}
    },
    methods: {
      toggleSidebar: function() {
        $("body").toggleClass("sidebar-toggled");
        $(".sidebar").toggleClass("toggled");
        if ($(".sidebar").hasClass("toggled")) {
          $(".sidebar .collapse").hide();
        }
      },
      isAdmin: function(u) {
        return u.is_staff;
      },
      isBlocked: function(u) {
        return u.blocked;
      },
      fullName: function(u) {
        return u.name;
      }
    }
  });

  $.ajax({
    url: "api/users",
    method: "GET",
    success: function(data, status) {
      app.users = data;
    }
  });
});

function lockUnlockUser(u) {
  $.ajax({
    url: "api/users/" + u.pk + "/",
    type: "PATCH",
    beforeSend:function(xhr){
      xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    },
    data: {
      "blocked": u.blocked ? "false" : "true"
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

function adminUnadminUser(u) {
  $.ajax({
    url: "api/users/" + u.pk + "/",
    type: "PATCH",
    beforeSend:function(xhr){
      xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    },
    data: {
      "is_staff": u.is_staff ? "false" : "true"
    },
    success: function() {
      location.reload();
    }
  });
}
