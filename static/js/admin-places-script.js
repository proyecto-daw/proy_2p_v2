var WAYPOINTS = {};
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
      waypoints: {}
    },
    methods: {
      toggleSidebar: function() {
        $("body").toggleClass("sidebar-toggled");
        $(".sidebar").toggleClass("toggled");
        if ($(".sidebar").hasClass("toggled")) {
          $(".sidebar .collapse").hide();
        }
      },
    }
  });

  $.ajax({
    url: "waypoints",
    method: "GET",
    success: function(data, status) {
      WAYPOINTS = data.waypoints;
      app.waypoints = WAYPOINTS;
    }
  });
});

var lastButtonClicked;

$(document).ready(function() {
  // $("input#submitEdit").click(submitEdit);
  // $("input#submitDelete").click(submitDelete);
  $('input[type="submit"]').click(function(event) {
    lastButtonClicked = $(event.target);
  });

  $("form").submit(function(event) {
    if (lastButtonClicked.is($("input#submitEdit"))) {
      submitEdit(event);
    } else {
      submitDelete(event);
    }
  });
});

function rowClicked(id) {
  let waypoint = WAYPOINTS[id];
  $("span#targetId").text(id);
  $("input#inputLat").val(waypoint[0]);
  $("input#inputLong").val(waypoint[1]);
  $("input#inputName").val(waypoint[2]);
}

function submitEdit(event) {
  event.preventDefault();
  var targetId = $("span#targetId").text();
  if (targetId == "*") {
    targetId = "-1";
  }

  if (!$("form")[0].checkValidity()) {
    return;
  }

  var user = sessionStorage.getItem("user");
  if (user != null) {
    user = JSON.parse(user);
  } else {
    return;
  }

  $.ajax({
    url: "api_admin/new_or_edit_waypoint",
    method: "POST",
    data: {
      "username": user.EMAIL,
      "password": user.PASSWORD,
      "waypoint": JSON.stringify({
        [targetId]: [
          $("input#inputLat").val(),
          $("input#inputLong").val(),
          $("input#inputName").val()
        ]
      })
    },
    success: function() {
      location.reload();
    },
    error: function(xhr, status, error) {
      alert("Server error!");
    }
  });
}

function submitDelete(event) {
  event.preventDefault();

  var targetId = $("span#targetId").text();
  if (targetId == "*") {
    alert("Seleccione un punto que ya esté guardado!");
    return;
  }

  var user = sessionStorage.getItem("user");
  if (user != null) {
    user = JSON.parse(user);
  } else {
    return;
  }

  $.ajax({
    url: "api_admin/delete_waypoint",
    method: "POST",
    data: {
      "username": user.EMAIL,
      "password": user.PASSWORD,
      "waypoint_id": targetId
    },
    success: function(data, status) {
      if (data.result == "OK") {
        location.reload();
      } else if (data.result == "PROTECTED_ERROR") {
        alert("No se puede eliminar! El waypoint todavía está relacionado con alguna clase!");
      }
    },
    error: function(xhr, status, error) {
      alert("Server error!");
    }
  });
}
