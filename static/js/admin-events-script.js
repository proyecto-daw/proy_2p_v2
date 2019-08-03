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
  var user = sessionStorage.getItem("user");
  if (user != null) {
    user = JSON.parse(user);
  } else {
    return;
  }

  var arr = [];

  $.ajax({
    url: "waypoints",
    method: "GET",
    success: function(data, status) {
      WAYPOINTS = data.waypoints;
      for (let w in WAYPOINTS) {
        arr.push({
          val: w,
          text: WAYPOINTS[w][2]
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
    url: "events",
    method: "GET",
    success: function(data, status) {
      let events = data.events;
      EVENTS = events;
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
  $("input#inputName").val(ev[0]);
  $("input#inputPlace").val(ev[1]);
  $("select").val(ev[2]);
  $('#datetimepicker1').datetimepicker('date', moment(ev[3]));
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
    url: "api_admin/new_or_edit_event",
    // url: "http://localhost:8000/api_admin/new_or_edit_event",
    method: "POST",
    data: {
      "username": user.EMAIL,
      "password": user.PASSWORD,
      "event": JSON.stringify({
        [targetId]: [
          $("input#inputName").val(),
          $("input#inputPlace").val(),
          $("select#inputClosestWp").val(),
          $('#datetimepicker1').data("datetimepicker").date().format(),
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
    url: "api_admin/delete_event",
    method: "POST",
    data: {
      "username": user.EMAIL,
      "password": user.PASSWORD,
      "event_id": targetId
    },
    success: function(data, status) {
      if (data.result == "OK") {
        location.reload();
      } else if (data.result == "PROTECTED_ERROR") {
        alert(data.result);
      }
    },
    error: function(xhr, status, error) {
      alert("Server error!");
    }
  });
}
