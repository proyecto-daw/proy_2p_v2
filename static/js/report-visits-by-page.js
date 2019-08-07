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
      }
    }
  });

  $.ajax({
    url: "/stats/visits-by-page" + url,
    method: "GET",
    success: function(data, status) {
      app.visits = data;
    }
  });
});