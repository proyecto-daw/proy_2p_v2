var app;

$(document).ready(function() {
  var user = sessionStorage.getItem("user");
  if (user != null) {
    user = JSON.parse(user);
  } else {
    return;
  }

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
        return u.ADMIN;
      },
      isBlocked: function(u) {
        return u.BLOCKED;
      },
      fullName: function(u) {
        return u.NAMES + " " + u.LASTNAMES;
      }
    }
  });

  $.ajax({
    url: "api_admin/view_users",
    method: "POST",
    data: {
      "username": user.EMAIL,
      "password": user.PASSWORD
    },
    success: function(data, status) {
      app.users = data.users;
    }
  });
});

function lockUnlockUser(u) {
  var user = sessionStorage.getItem("user");
  if (user != null) {
    user = JSON.parse(user);
  } else {
    return;
  }

  if (u.EMAIL == user.EMAIL) {
    alert("No se puede bloquear al usuario que tiene iniciada sesión. Inicie sesión como otro administrador para editar a " + event.data.email);
    return;
  }

  $.ajax({
    url: "api_admin/block_user",
    method: "POST",
    data: {
      "username": user.EMAIL,
      "password": user.PASSWORD,
      "target": u.EMAIL,
      "action": u.BLOCKED ? "UNLOCK" : "LOCK"
    },
    success: function() {
      location.reload();
    }
  });
}

function adminUnadminUser(u) {
  var user = sessionStorage.getItem("user");
  if (user != null) {
    user = JSON.parse(user);
  } else {
    return;
  }

  if (u.EMAIL == user.EMAIL) {
    alert("No se puede editar al usuario que tiene iniciada sesión. Inicie sesión como otro administrador para editar a " + event.data.email);
    return;
  }

  $.ajax({
    url: "api_admin/adminify_user",
    method: "POST",
    data: {
      "username": user.EMAIL,
      "password": user.PASSWORD,
      "target": u.EMAIL,
      "action": u.ADMIN ? "UNADMIN" : "ADMIN"
    },
    success: function() {
      location.reload();
    }
  });
}
