var WAYPOINTS = {};
var app;

$(document).ready(function() {
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
      rowClicked: function(id){
        rowClicked(id);
      }
    }
  });

  $.ajax({
    url: "api/waypoints",
    method: "GET",
    success: function(data, status) {
      for(let wp of data){
        WAYPOINTS[wp.pk]=wp;
      }
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
  $("input#inputLat").val(waypoint.latitude);
  $("input#inputLong").val(waypoint.longitude);
  $("input#inputName").val(waypoint.name);
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

  if(targetId == "-1"){
    $.ajax({
      url: "api/waypoints/",
      method: "POST",
      beforeSend:function(xhr){
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
      },
      data: {
        "latitude": $("input#inputLat").val(),
        "longitude": $("input#inputLong").val(),
        "name": $("input#inputName").val(),
        "description": ""
      },
      success: function() {
        location.reload();
      },
      error: function(xhr, status, error) {
        alert("Server error!" + xhr);
        console.log(xhr);
      }
    });
  } else {
    $.ajax({
      url: "api/waypoints/" + targetId + "/",
      method: "PATCH",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
      },
      data: {
        "latitude": $("input#inputLat").val(),
        "longitude": $("input#inputLong").val(),
        "name": $("input#inputName").val()
      },
      success: function () {
        location.reload();
      },
      error: function (xhr, status, error) {
        alert("Server error!");
      }
    });
  }
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

function submitDelete(event) {
  event.preventDefault();

  var targetId = $("span#targetId").text();
  if (targetId == "*") {
    alert("Seleccione un punto que ya esté guardado!");
    return;
  }

  $.ajax({
    url: "api/waypoints/" + targetId + "/",
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
}
