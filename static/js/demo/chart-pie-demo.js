// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

// Pie Chart Example
var myPieChart = null;

function populatePieChart(period) {
  piePartialUrl = "visits-by-page?period=" + period;
  $.ajax({
    url: "stats/" + piePartialUrl,
    method: "GET",
    success: function (data, status) {
      pieData = data;
      if(myPieChart!=null) {
        myPieChart.destroy();
      }
      var ctx = document.getElementById("myPieChart");
      myPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: data.map(x => x[0]),
          datasets: [{
            data: data.map(x => x[1])/*,
            backgroundColor: palette('tol', data.length).map(function (hex) {
              return '#' + hex;
            })*/,
          }],
        },
        options: {
          maintainAspectRatio: false,
          tooltips: {
            backgroundColor: "rgb(255,255,255)",
            bodyFontColor: "#858796",
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 15,
            yPadding: 15,
            displayColors: false,
            caretPadding: 10,
          },
          legend: {
            display: false
          },
          cutoutPercentage: 70,
        },
      });
    }
  });
}
populatePieChart("1d");