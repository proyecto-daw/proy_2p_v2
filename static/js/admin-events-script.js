var EVENTS = {};
var WAYPOINTS = {};

var app;

$(document).ready(function() {
  app = new Vue({
    el: '#content',
    data: {
      events: {}
    },
    methods: {
      toggleSidebar: function() {
        $("body").toggleClass("sidebar-toggled");
        $(".sidebar").toggleClass("toggled");
        if ($(".sidebar").hasClass("toggled")) {
          $(".sidebar .collapse").hide();
        }
      },
      format(x) {
        return moment(x).format('MMMM D YYYY, h:mm A');
      }
    }
  });

  $.fn.datetimepicker.Constructor.Default = $.extend({}, $.fn.datetimepicker.Constructor.Default, {
    icons: {
      time: 'far fa-clock',
      date: 'far fa-calendar',
      up: 'fa fa-arrow-up',
      down: 'fa fa-arrow-down',
      previous: 'fa fa-chevron-left',
      next: 'fa fa-chevron-right',
      today: 'far fa-calendar-check-o',
      clear: 'far fa-trash',
      close: 'far fa-times'
    }
  });

  $('#datetimepicker1').datetimepicker();
});

$(document).ready(function() {
  var arr = [];

  $.ajax({
    url: "api/waypoints",
    method: "GET",
    success: function(data, status) {
      for(let wp of data){
        WAYPOINTS[wp.pk]=wp;
      }
      for (let w in WAYPOINTS) {
        arr.push({
          val: w,
          text: WAYPOINTS[w].name
        });
      }

      let dropdown_cell = $('#edit-row td:nth-child(4)');
      var sel = $('<select id="inputClosestWp" required class="form-control">');
      dropdown_cell.append(sel);
      $(arr).each(function() {
        sel.append($("<option>").attr('value', this.val).text(this.text));
      });
      sel.append("<option value='' selected disabled hidden>Escoja un waypoint</option>");

      fillEvents();
    }
  });
});

function fillEvents() {
  $.ajax({
    url: "api/events",
    method: "GET",
    success: function(data, status) {
      let events = data;
      for(let ev of data){
        EVENTS[ev.pk]=ev;
      }
      app.events = EVENTS;
      app.waypoints = WAYPOINTS;
      // for (let e in events) {
      //   var row = $("tr#event-template").clone().removeAttr("id");
      //   row.show();
      //   $("th:nth-child(1)", row).html(e);
      //   $("td:nth-child(2)", row).html(events[e][0]);
      //   $("td:nth-child(3)", row).html(events[e][1]);
      //   $("td:nth-child(4)", row).html(WAYPOINTS[events[e][2]][2]);
      //   $("td:nth-child(5)", row).html(moment(events[e][3]).format('MMMM D YYYY, h:mm A'));
      //   row.click({
      //     "id": e
      //   }, rowClicked);
      //   $("table").prepend(row);
      // }
    }
  });
}

var lastButtonClicked;

$(document).ready(function() {
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
  let ev = EVENTS[id];
  $("span#targetId").text(id);
  $("input#inputName").val(ev.name);
  $("input#inputPlace").val(ev.place);
  $("select").val(ev.closest_waypoint_pk);
  $('#datetimepicker1').datetimepicker('date', moment(ev.start_datetime));
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
      url: "api/events/",
      method: "POST",
      beforeSend:function(xhr){
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
      },
      data: {
        "name": $("input#inputName").val(),
        "place": $("input#inputPlace").val(),
        "closest_waypoint": $("select#inputClosestWp").val(),
        "start_datetime": moment($("input#inputDate").val()).format("YYYY-MM-DDThh:mm:ss")
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
      url: "api/events/" + targetId + "/",
      method: "PATCH",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
      },
      data: {
        "name": $("input#inputName").val(),
        "place": $("input#inputPlace").val(),
        "closest_waypoint": $("select#inputClosestWp").val(),
        "start_datetime": moment($("input#inputDate").val()).format("YYYY-MM-DDThh:mm:ss")
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
    url: "api/events/" + targetId + "/",
    method: "DELETE",
    beforeSend: function (xhr) {
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
