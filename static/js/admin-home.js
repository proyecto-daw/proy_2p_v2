const PIE_PERIODS = {"1d": "1 día", "1w": "1 semana", "30d": "1 mes"};
var piePartialUrl, linePartialUrl;
const LINE_LIMITS = {"1d": "1 hora (1 día máx)", "1w": "12 horas (1 semana máx)", "30d": "1 día (1 mes máx)"};
const LINE_UNITS = {"1d": "hour", "1w": "day", "30d": "day"};


$(document).ready(function () {
    $("#piePeriodDropdown .dropdown-item").click(function (event) {
        let p = $(event.target).data("period");
        $("#piePeriodDropdown button").text(PIE_PERIODS[p]);
        selectedPiePeriod = p;

        populatePieChart(p);
    });

    $("#linePeriodDropdown .dropdown-item").click(function (event) {
        let p = $(event.target).data("period");
        let l = $(event.target).data("limit");
        $("#linePeriodDropdown button").text(LINE_LIMITS[l]);
        selectedLineLimit = l;

        populateLineChart(p, l, LINE_UNITS[l]);
    });

    $("#downloadLinePeriodReportButton").click(function () {
        window.location = "reports/" + linePartialUrl;
    });

    $("#downloadPiePeriodReportButton").click(function () {
        window.location = "reports/" + piePartialUrl;
    });

    $.ajax({
        url: "stats/bargraph",
        method: "GET",
        success: function (data, status) {
            console.log(data);
            let eventsComplete = data.events.complete * 100 / data.events.all;
            $("span#bargraph1text").text(data.events.complete + "/" + data.events.all + " (" + eventsComplete + "%)");
            $("div#bargraph1bar").attr("style", "width: " + eventsComplete + "%");

            let usersActive = data.users.loggedIn * 100 / data.users.all;
            $("span#bargraph2text").text(data.users.loggedIn + "/" + data.users.all + " (" + usersActive + "%)");
            $("div#bargraph2bar").attr("style", "width: " + usersActive + "%");

            let savedEvents = data.events.saved * 100 / data.events.all;
            $("span#bargraph3text").text(data.events.saved + "/" + data.events.all + " (" + savedEvents + "%)");
            $("div#bargraph3bar").attr("style", "width: " + savedEvents + "%");
        }
    })
});