var user;
var app;

$(document).ready(function() {
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
        return this.chosenSource.name;
      },
      chosenTarget: function() {
        return this.waypoints[this.chosenTargetIndex];
      },
      neighborsOfChosen: function() {
        return this.chosenSource.neighbor_waypoints;
      },
      notNeighborsOfChosen: function() {
        let ans = [];
        for (let x in this.waypoints) {
          let neigh = false;
          for (let y of this.neighborsOfChosen) {
            if ((parseInt(x) == y.target_pk) || (parseInt(x) == parseInt(this.chosenSourceIndex))) {
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
            url: "add_new_route",
            method: "POST",
            data: {
              "source": this.chosenSourceIndex,
              "target": this.chosenTargetIndex,
              "distance": this.dist
            }
          });

          this.chosenSource.neighbor_waypoints.push({
            "distance": parseInt(this.dist),
            "target_pk": parseInt(this.chosenTargetIndex),
            "target_name": this.waypoints[parseInt(this.chosenTargetIndex)].name
          });
          this.chosenTarget.neighbor_waypoints.push({
            "distance": parseInt(this.dist),
            "target_pk": parseInt(this.chosenSourceIndex),
            "target_name": this.waypoints[parseInt(this.chosenTargetIndex)].name
          });
          this.dist = null;
        } else {
          this.error();
        }
      }
    }
  });

  $.ajax({
    url: "api/waypoints",
    method: "GET",
    success: function(data, status) {
      for(let wp of data){
        Vue.set(app.waypoints, wp.pk, wp)
      }
    }
  });
});
