var currentlyActiveRow = -1;

let classes = { // index: [name, hour_of_start, minute_of_start]
};

function minutes_left(target_class) {
  const d = new Date();
  var hour_of_start = parseInt(target_class.HORA.split(":")[0]);
  var minute_of_start = parseInt(target_class.HORA.split(":")[1])
  return (hour_of_start - d.getHours()) * 60 + (minute_of_start - d.getMinutes());
}

function refreshProgressBar(minutes_left) {
  const container = document.querySelector("#progress_bar_container");
  container.innerHTML = "";
  let innerBar = document.createElement("div");
  innerBar.classList.add("progress-bar");

  let percent_of_bar = (1 - minutes_left / 10) * 100;
  percent_of_bar = Math.max(Math.min(100, percent_of_bar), 0);
  innerBar.style = "width: " + percent_of_bar + "%";
  if (percent_of_bar >= 90) {
    innerBar.classList.add("bg-danger");
  } else if (percent_of_bar >= 75) {
    innerBar.classList.add("bg-warning");
  }

  container.appendChild(innerBar);
}

function changeTargetClass(index) {
  let queryStringPrev = 'tr[data-index="' + currentlyActiveRow + '"] > td';
  let queryStringNext = 'tr[data-index="' + index + '"] > td';
  if (currentlyActiveRow > -1) {
    document.querySelector(queryStringPrev).innerHTML = "";
  }
  currentlyActiveRow = index;
  const clickedRow = document.querySelector(queryStringNext);
  clickedRow.innerHTML = '<i class="material-icons md-48">arrow_right</i></td>';

  document.querySelector("#monitored_class").innerText = '(' + classes[index].NOMBRE + ')';
  const mins_left = minutes_left(classes[index]);
  document.querySelector("#minutes_left").value = mins_left > 0 ? mins_left + " mins" : "Iniciada";

  refreshProgressBar(mins_left);

  computeShortestRoute(classes[index].BLOQUE);
}

function refreshCheckboxes() {
  for (let c in classes) {
    let checkbox = document.querySelector('tr[data-index="' + c + '"] input');
    if (checkbox != null)
      checkbox.checked = minutes_left(classes[c]) <= 0;
  }
}

window.setInterval(function() {
  refreshCheckboxes();
}, 5000); // Update the different "state" checkboxes every 5 secs

var app;
var user;

$(document).ready(function() {
  $("#close-well").click(function() {
    $("#welcome").slideUp();
    window.localStorage.setItem("showBannerIndex", "no");
  });
  if (localStorage.getItem("showBannerIndex")) {
    $("#welcome").hide();
  }

  $.notify.defaults({
    className: "info"
  });

  app = new Vue({
    el: 'nav',
    methods: {
      searchPlacesA: function() {
        this.searchPlaces($("input#searchPlacesA").val());
      },
      searchPlacesB: function() {
        this.searchPlaces($("input#searchPlacesB").val());
      },
      searchPlaces: function(text) {
        let foundOne = false;
        for (let m in markers) {
          if (markers[m][2].toLowerCase().includes(text.toLowerCase())) {
            window.location.href = "home?towp=" + m;
            foundOne = true;
          }
        }
        if (!foundOne) {
          alert("¡No existen puntos de interés para la búsqueda " + text + "!");
        }
      }
    }
  });

  user = sessionStorage.getItem("user");
  if (user != null) {
    user = JSON.parse(user);

    $.ajax({
      url: "get_my_classes",
      method: "POST",
      data: {
        "username": user.EMAIL,
        "password": user.PASSWORD,
      },
      success: function(data, status) {
        let cls = data.classes;
        if (cls.length == 0) {
          $("section#tabla_clases table").hide(); // Hide table from document
        } else {
          $("section#tabla_clases div.alert").hide(); // Hide "you have no classes today" message
        }
        for (let c in cls) {
          var row = $("tr#class-session-template").clone().removeAttr("id");
          row.show();
          row.attr("data-index", c);
          row.attr("onclick", "changeTargetClass(" + c + ")");
          $("td:nth-child(2)", row).html(cls[c].NOMBRE);
          $("td:nth-child(3)", row).html(cls[c].HORA);
          $("table").append(row);
          classes[c] = cls[c];
        }

        refreshCheckboxes();
      }
    });
  } else {
    $("section#tabla_clases table").hide(); // Hide table from document
    $("section#tabla_clases p").hide(); // Also hide "Click here to upload calendar" text
    $("section#tabla_clases div").hide(); // Also hide "You have no classes today" text

    // Insert "Log in!" message in place of table
    $("section#tabla_clases").append("<div class='alert alert-warning' role='alert'>¡Inicie sesión para ver su lista de clases!</div>");
  }

  if (user) {
    $("#username").val(user.EMAIL);
    $("#password").val(user.PASSWORD);
    $("#backurl").val(location.href);
  }

  $("#uploadCalForm").attr("action", "upload_calendar");

  $("#uploadCalForm").submit(function(event) {
    location.reload();
  });
});

var notifiedRequest = null;
var notifiedResponses = {};

$(document).ready(function() {
  $.notify.addStyle('request', {
    html: "<div>" +
      "<div class='clearfix'>" +
      "<div class='title' data-notify-html='title'/>" +
      "<div class='buttons'>" +
      "<button class='no'>Denegar</button>" +
      "<button class='yes' data-notify-text='button'></button>" +
      "</div>" +
      "</div>" +
      "</div>"
  });
  $.notify.addStyle('response', {
    html: "<div>" +
      "<div class='clearfix'>" +
      "<div class='title' data-notify-html='title'/>" +
      "<div class='buttons'>" +
      "<button class='no'>Cerrar</button>" +
      "<button class='yes' data-notify-text='button'></button>" +
      "</div>" +
      "</div>" +
      "</div>"
  });
  //listen for click events from this style
  $(document).on('click', '.notifyjs-request-base .no', function() {
    //programmatically trigger propagating hide event
    denyRequest();
    $(this).trigger('notify-hide');
  });
  $(document).on('click', '.notifyjs-request-base .yes', function() {
    acceptRequest();
    //hide notification
    $(this).trigger('notify-hide');
  });
  //listen for click events from this style
  $(document).on('click', '.notifyjs-response-base .no', function() {
    //programmatically trigger propagating hide event
    $(this).trigger('notify-hide');
  });
  $(document).on('click', '.notifyjs-response-base .yes', function() {
    showOnMap(($(".title", $(this).parent().parent())).text()); // HACK: get text from notification
    //hide notification
    $(this).trigger('notify-hide');
  });

  // Call /poll endpoint every 10 seconds
  setInterval(function() {
    var user = sessionStorage.getItem("user");
    if (user != null) {
      user = JSON.parse(user);
    } else {
      return;
    }

    $.ajax({
      url: "poll",
      method: "POST",
      data: {
        "username": user.EMAIL,
        "password": user.PASSWORD,
      },
      success: function(data, status) {
        let pos_requests = data.requests;
        for (let pr of pos_requests) {
          notifyRequest(pr);
        }
        let pos_responses = data.responses;
        for (let pr of pos_responses) {
          notifyResponse(pr);
        }
      }
    });
  }, 10000);
});

function notifyRequest(request) {
  notifiedRequest = request;
  $.notify({
    title: request.CREADOR_EMAIL + " quiere saber tu ubicación: " + request.MENSAJE,
    button: 'Aceptar'
  }, {
    style: 'request',
    autoHide: false,
    clickToHide: false
  });
}

function denyRequest() {
  if (notifiedRequest == null) {
    return;
  }
  var user = sessionStorage.getItem("user");
  if (user != null) {
    user = JSON.parse(user);
  } else {
    return;
  }
  $.ajax({
    url: "publish_my_position",
    method: "POST",
    data: {
      "username": user.EMAIL,
      "password": user.PASSWORD,
      "friend_email": notifiedRequest.CREADOR_EMAIL,
      "decision": "REJECT",
      "latitude": -1,
      "longitude": -1
    },
  })
}

// myCurrentPos comes from script.js
function acceptRequest() {
  if (notifiedRequest == null) {
    return;
  }
  if (myCurrentPos == null) {
    alert("¡No hay una posición establecida! No se puede compartir ubicación.");
    return;
  }

  var user = sessionStorage.getItem("user");
  if (user != null) {
    user = JSON.parse(user);
  } else {
    return;
  }
  $.ajax({
    url: "publish_my_position",
    method: "POST",
    data: {
      "username": user.EMAIL,
      "password": user.PASSWORD,
      "friend_email": notifiedRequest.CREADOR_EMAIL,
      "decision": "ACCEPT",
      "latitude": myCurrentPos.coords.latitude,
      "longitude": myCurrentPos.coords.longitude
    },
  })
}

function notifyResponse(response) {
  notifiedResponses[response.OBJETIVO_EMAIL] = response;
  $.notify({
    title: response.OBJETIVO_EMAIL + " te ha enviado su ubicación.",
    button: 'Ver'
  }, {
    style: 'response',
    autoHide: false,
    clickToHide: false
  });
}

function showOnMap(text) {
  const email = text.split(" ")[0];
  const response = notifiedResponses[email];

  window.location.href = "home?lat=" +
    response.LATITUD + "&lng=" + response.LONGITUD + "&friend=" + email;
}
