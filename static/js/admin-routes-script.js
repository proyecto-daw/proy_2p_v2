var user;
var app;

$(document).ready(function() {
  user = sessionStorage.getItem("user");
  if (user != null) {
    user = JSON.parse(user);
  } else {
    return;
  }

  app = new Vue({
    el: '#content',
    data: {
      step: 1,
      waypoints: {},
      chosenSourceIndex: null,
      chosenTargetIndex: null,
      dist: null,
      errorsA: false,
      errorsB: false,
      errorsC: false
    },
    computed: {
      onFirst: function() {
        return this.step == 1;
      },
      onLast: function() {
        return this.step == 3;
      },
      chosenSource: function() {
        return this.waypoints[this.chosenSourceIndex];
      },
      sourceName: function() {
        return this.chosenSource[2];
      },
      chosenTarget: function() {
        return this.waypoints[this.chosenTargetIndex];
      },
      neighborsOfChosen: function() {
        return this.chosenSource[3];
      },
      notNeighborsOfChosen: function() {
        let ans = [];
        for (let x in this.waypoints) {
          let neigh = false;
          for (let y of this.neighborsOfChosen) {
            if ((parseInt(x) == y[0]) || (parseInt(x) == parseInt(this.chosenSourceIndex))) {
              neigh = true;
              break;
            }
          }
          if (!neigh) {
            ans.push(x);
          }
        }
        return ans;
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
      onStep: function(i) {
        return this.step == i;
      },
      nextStep: function() {
        if (!this.validate()) {
          this.error();
          return;
        }
        if (this.step < 3) {
          this.step++;
        }
      },
      prevStep: function() {
        if (!this.validate()) {
          this.error();
          return;
        }
        if (this.step > 1) {
          this.step--;
        }
      },
      validate: function() {
        this.errorsA = false;
        this.errorsB = false;
        this.errorsC = false;
        switch (this.step) {
          case 1:
            return this.chosenSource != null;
          default:
            return true;
        }
      },
      error: function() {
        switch (this.step) {
          case 1:
            this.errorsA = true;
            break;
          case 2:
            this.errorsB = true;
            break;
          case 3:
            this.errorsC = true;
            break;
        }
      },
      saveNewRoute: function() {
        if (this.dist != null && this.chosenTargetIndex != null) {
          $.ajax({
            url: "api_admin/add_new_route",
            method: "POST",
            data: {
              "username": user.EMAIL,
              "password": user.PASSWORD,
              "source": this.chosenSourceIndex,
              "target": this.chosenTargetIndex,
              "distance": this.dist
            }
          });

          this.chosenSource[3].push([parseInt(this.chosenTargetIndex), parseInt(this.dist)]);
          this.chosenTarget[3].push([parseInt(this.chosenSourceIndex), parseInt(this.dist)]);
          this.dist = null;
        } else {
          this.error();
        }
      }
    }
  });

  $.ajax({
    url: "waypoints",
    method: "GET",
    success: function(data, status) {
      app.waypoints = data.waypoints;
    }
  });
});
