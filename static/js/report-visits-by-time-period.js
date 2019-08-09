var app;

$(document).ready(function() {
  app = new Vue({
    el: '#content',
    data: {
      visits: []
    },
    methods: {
      toggleSidebar: function() {
        $("body").toggleClass("sidebar-toggled");
        $(".sidebar").toggleClass("toggled");
        if ($(".sidebar").hasClass("toggled")) {
          $(".sidebar .collapse").hide();
        }
      },
      endTime: function(startTime) {
          return moment(startTime).add(deltaHours, 'h').toDate();
      },
      format: function(time){
        return moment(time).format("DD MMM YYYY, HH:mm")
      }
    }
  });

  $.ajax({
    url: "/stats/visits-by-time-period" + url,
    method: "GET",
    success: function(data, status) {
      app.visits = data;
    }
  });
});