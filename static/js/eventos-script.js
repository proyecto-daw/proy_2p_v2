var app;
var user;

$(document).ready(function() {
  user = sessionStorage.getItem("user");
  if (user != null) {
    user = JSON.parse(user);
  }

  if (localStorage.getItem("showBannerEvents")) {
    $("#welcome").hide();
  }

  app = new Vue({
    el: '#content',
    data: {
      events: {},
      myEvents: {}
    },
    computed: {
      noEvents: function() {
        return Object.keys(this.events).length == 0;
      },
      loggedIn: function() {
        return user != null;
      },
      noMyEvents: function() {
        return Object.keys(this.myEvents).length == 0;
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
        window.localStorage.setItem("showBannerEvents", "no");
      },
      prettyDate: function(d) {
        return moment(d).format('MMMM D YYYY, h:mm A')
      },
      link: function(ev) {
        return "home?towp=" + ev[2];
      },
      filterDate: function() {
        let filtered = {};

        let start = $("input#from").val();
        if (start == "") {
          getEvents();
          return;
        } else {
          start = new Date(start);
        }

        let end = $("input#to").val();
        if (end == "") {
          getEvents();
          return;
        } else {
          end = new Date(end);
        }

        for (let e in this.events) {
          let eventDate = new Date(this.events[e][3]);
          if ((eventDate >= start) && (eventDate <= end)) {
            filtered[e] = this.events[e];
          }
        }
        this.events = filtered;
      },
      filterTextA: function() {
        this.filterText($("input#filterTextA").val());
      },
      filterTextB: function() {
        this.filterText($("input#filterTextB").val());
      },
      filterText: function(text) {
        if (text == "") {
          getEvents();
          return;
        }

        let filtered = {};
        for (let e in this.events) {
          if (this.events[e][0].toLowerCase().includes(text.toLowerCase())) {
            filtered[e] = this.events[e]
          }
        }
        this.events = filtered;
      },
      saveEv: function(i, ev) {
        saveEvent(i, ev);
      },
      deleteEv: function(i) {
        deleteEvent(i);
      }
    }
  });

  getEvents();
  if (user != null) {
    getMyEvents();
  }
});

function getEvents() {
  $.ajax({
    url: "events",
    method: "GET",
    success: function(data, status) {
      app.events = data.events;
    }
  });
}

function getMyEvents() {
  $.ajax({
    url: "get_my_events",
    method: "POST",
    data: {
      "username": user.EMAIL,
      "password": user.PASSWORD
    },
    success: function(data, status) {
      app.myEvents = data.events;
    }
  });
}

function saveEvent(id, ev) {
  $.ajax({
    url: "add_my_event",
    method: "POST",
    data: {
      "username": user.EMAIL,
      "password": user.PASSWORD,
      "event": id
    },
    success: function(data, status) {
      app.$set(app.myEvents, id, ev);
    }
  });
}

function deleteEvent(id) {
  $.ajax({
    url: "remove_my_event",
    method: "POST",
    data: {
      "username": user.EMAIL,
      "password": user.PASSWORD,
      "event": id
    },
    success: function(data, status) {
      app.$delete(app.myEvents, id);
    }
  });
}
