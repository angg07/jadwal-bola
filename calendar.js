$(document).ready(function () {
  $("#select-continent").select2({
    placeholder: "Pilih benua",
    theme: "material"
  });

  $("#select-country").select2({
    placeholder: "Pilih negara",
    theme: "material"
  });

  $("#select-league").select2({
    placeholder: "Pilih liga",
    theme: "material"
  });

  $("#select-season").select2({
    placeholder: "Pilih season",
    theme: "material"
  });

  $(".select2-selection__arrow")
    .addClass("material-icons")
    .html("arrow_drop_down");

$("#select-continent").on("change", function () {
  let continent = $("#select-continent option:selected").val();

  console.log(continent);

  $("#select-country option[value='']").remove();

  $("#select-country").val(['']).trigger("change");

  if (continent != null) {
    $.ajax({
      url: "https://app.sportdataapi.com/api/v1/soccer/countries?apikey=7eec2f20-5e23-11eb-a6e1-1ddd15e6e6f2&continent=" + continent,
      type: "GET",
      dataType: "JSON",
      success: function (response) {
        let getDataContinents = response.data;

        let html = '';

        $.map(getDataContinents, function (item) {
          html += `<option value="${item.country_id}">${item.name}</option>`;
        });

        $("#select-country").html(html);
        $("#select-country").val('').trigger("change");
      },
      error: function (jqXHR, textStatus, errorThrown) {
        swal({
          title: "Error when fetching select country: " + textStatus,
          text: errorThrown,
          icon: "error",
        });
      }
    });
  }
});

$("#select-country").on("change", function () {
  let country = $("#select-country option:selected").val();

  console.log(country);

  $("#select-league option[value='']").remove();

  $("#select-league").val(['']).trigger("change");

  if (country != null) {
    $.ajax({
      url: `https://app.sportdataapi.com/api/v1/soccer/leagues?apikey=7eec2f20-5e23-11eb-a6e1-1ddd15e6e6f2&country_id=${country}`,
      type: "GET",
      dataType: "JSON",
      success: function (response) {
        let getDataLeagues = response.data;

        let html = '';

        $.map(getDataLeagues, function (item) {
          html += `<option value="${item.league_id}">${item.name}</option>`;
        });

        $("#select-league").html(html);
        $("#select-league").val('').trigger("change");
      },
      error: function (jqXHR, textStatus, errorThrown) {
        swal({
          title: "Error when fetching select league: " + textStatus,
          text: errorThrown,
          icon: "error",
        });
      }
    });
  }
})

$("#select-league").on("change", function () {
  let league = $("#select-league option:selected").val();

  console.log(league);

  $("#select-season option[value='']").remove();

  $("#select-season").val('').trigger("change");

  if (!(league === null) && !(league === '') && !(league === undefined)) {
    $.ajax({
      url: `https://app.sportdataapi.com/api/v1/soccer/seasons?apikey=7eec2f20-5e23-11eb-a6e1-1ddd15e6e6f2&league_id=${league}`,
      type: "GET",
      dataType: "JSON",
      success: function (response) {
        let getDataSeasons = response.data;

        let html = '';

        $.map(getDataSeasons, function (item) {
          html += `<option value="${item.season_id}">${item.name} (${moment(item.start_date).format('DD MMMM YYYY')} sampai ${moment(item.end_date).format('DD MMMM YYYY')})</option>`;
        });

        $("#select-season").html(html);
        $("#select-season").val('').trigger("change");
      },
      error: function (jqXHR, textStatus, errorThrown) {
        swal({
          title: "Error when fetching select season: " + textStatus,
          text: errorThrown,
          icon: "error",
        });
      }
    });
  }
})

$("#select-season").on("change", function () {
  let continent = $("#select-continent option:selected").val();
  let country = $("#select-country option:selected").val();
  let league = $("#select-league option:selected").val();
  let season = $("#select-season option:selected").val();

  console.log(continent);
  console.log(country);
  console.log(league);
  console.log(season);


  if (!(season === null) && !(season === '') && !(season === undefined)) {
    let getYesterdayStart = moment().subtract(1, 'days').format('YYYY-MM-DD');
    console.log('Yesterday start : ' + getYesterdayStart);
    let getYesterdayEnd = moment(getYesterdayStart).add(1, 'days').format('YYYY-MM-DD');
    console.log('Yesterday end : ' + getYesterdayEnd);

    showMatchFinished(season, getYesterdayStart, getYesterdayEnd);

    $('#fullcalendar').fullCalendar({
      header: {
        left: 'title',
        center: 'agendaDay,agendaWeek,month',
        right: 'prev,next, today'
      },
      // forceEventDuration: true,
      defaultView: 'month',
      eventLimit: true,
      defaultDate: moment().format(),
      // theme: 'standard',
      eventSources: [{
        color: '#18b9e6',
        textColor: '#000000',
        events: function (start, end, callback) { // timezone sebelum callback untuk ver diatas 2.x.x
          console.log(start);
          console.log(end);

          let setStart = new Date(start);
          let setEnd = new Date(end);

          let formatStart = moment(setStart).format('YYYY-MM-DD');
          let formatEnd = moment(setEnd).format('YYYY-MM-DD');

          console.log(formatStart);
          console.log(formatEnd);

          $.ajax({
            url: `https://app.sportdataapi.com/api/v1/soccer/matches?apikey=7eec2f20-5e23-11eb-a6e1-1ddd15e6e6f2&season_id=${season}&date_from=${formatStart}&date_to=${formatEnd}`,
            // type: 'get',
            dataType: 'json',
            success: function (dataEvents) {
              let getEvents = dataEvents.data;
              // console.log(JSON.stringify(getEvents))

              var evnts = [];

              getEvents.forEach((e) => {
                evnts.push({
                  title: (e.group != null) ? `${e.group.group_name} - ${e.stage.name}` : `${e.stage.name}`,
                  description: `<ul class="list-group list-group-flush">
                                  <li class="list-group-item">${e.home_team.name} vs ${e.away_team.name}</li>
                                  <li class="list-group-item">${e.status}</li>
                                  <li class="list-group-item">${moment(e.match_start).format('DD MMMM YYYY HH:mm:ss')}</li>
                                </ul>`,
                  start: e.match_start,
                  allDay: false,
                })
              });

              // console.log(evnts)

              callback(evnts);
            },
            error: function (jqXHR, textStatus, errorThrown) {
              swal({
                title: "Error when fetching events: " + textStatus,
                text: errorThrown,
                icon: "error",
              });
            }
          })
        }
      }],
      eventRender: function (event, element) {
        element.popover({
          title: event.title,
          content: event.description,
          html: true,
          animation: true,
          trigger: "hover",
          placement: "auto",
          container: "body",
        });
        // element.find('.fc-title').append("<br/>" + event.description);
      }
    });
  } else {
    $('#fullcalendar').fullCalendar('destroy');
  }
})

function showMatchFinished(season_id, start_date, end_date) {
  console.log(season_id);
  console.log(start_date);
  console.log(end_date);

  $.ajax({
    type: 'GET',
    url: `https://app.sportdataapi.com/api/v1/soccer/matches?apikey=7eec2f20-5e23-11eb-a6e1-1ddd15e6e6f2&season_id=${season_id}&date_from=${start_date}&date_to=${end_date}`,
    dataType: "JSON",
    success: function (response) {
      let getTodayMatch = response.data;

      console.log(response);
      console.log(response.data);
      console.log(response.data.status);
      console.log(getTodayMatch.status);

      var html = ''

      for (let i = 0; i < getTodayMatch.length; i++) {
        if (getTodayMatch[i].status_code == 3) {
          console.log(getTodayMatch[i].status);
          console.log(response.data[i].status);

          html += `<div class="col-md-4">
                      <div class="card show-detail-match">
                        <div class="card-header card-header-primary">
                          <h4 class="card-title show-team">${getTodayMatch[i].home_team.name} vs ${getTodayMatch[i].away_team.name}</h4>
                          <p class="category show-score">${getTodayMatch[i].stats.home_score} - ${getTodayMatch[i].stats.away_score}</p>
                        </div>

                        <div class="card-body">
                          <div class="row">
                            <div class="col-md-6">
                              <!-- <span class="material-icons">sports</span> -->
                              <span class="material-icons">grass</span> ${(getTodayMatch[i].venue != null) ? getTodayMatch[i].venue.name : ''}
                            </div>

                            <div class="col-md-6">
                              <span class="material-icons">place</span> ${(getTodayMatch[i].venue != null) ? getTodayMatch[i].venue.city : ''}
                            </div>
                          </div>

                          <div class="row">
                            <a href="javascript:void(0)" class="btn btn-info btn-detail-modal" id="btn-detail-${[i]}" data-match-id="${getTodayMatch[i].match_id}" data-toggle="modal" data-target="#modal-detail-match">
                              Detail match
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>`;
        }
      }

      $('#show-matches').html(html);

      $(".btn-detail-modal").click(function (e) {

        $('#modal-detail-match').modal('show');

        $.ajax({
          url: "https://app.sportdataapi.com/api/v1/soccer/matches/" + $(this).data("match-id") + "?apikey=7eec2f20-5e23-11eb-a6e1-1ddd15e6e6f2",
          success: function (detail) {
            const matchDetail = showMatchDetails(detail);

            $('.modal-title').text((detail.data.group != null) ? `${detail.data.group.group_name} - ${detail.data.stage.name}` : `${detail.data.stage.name}`);

            $(".detail-match-container").html(matchDetail);
          },
          error: function (jqXHR, textStatus, errorThrown) {
            swal({
              title: "Error when fetching match detail: " + textStatus,
              text: errorThrown,
              icon: "error",
            });
          },
        });
      });
    }
  });
}

function showMatchDetails(response) {
  console.log(response.data.home_team.team_id);
  console.log(response.data.away_team.team_id);

  let matchEventDetail = response.data.match_events;
  var html = '';

  html += `<div class="row">
            <div class="col-md-6">
              <h4 class="info-title">${response.data.home_team.name}</h4>
              <ul class="list-group list-group-flush">`;

  for (let i = 0; i < matchEventDetail.length; i++) {
    if (matchEventDetail[i].team_id == response.data.home_team.team_id) {
      if (matchEventDetail[i].type == "goal") {
        html += `<li class="list-group-item"><span class="material-icons">sports_soccer</span>${matchEventDetail[i].player_name} '${matchEventDetail[i].minute}</li>`;
      }
    }
  }

  html += `</ul>
            </div>

            <div class="col-md-6">
            <h4 class="info-title">${response.data.away_team.name}</h4>
              <ul class="list-group list-group-flush">`;

  for (let j = 0; j < matchEventDetail.length; j++) {
    if (matchEventDetail[j].team_id == response.data.away_team.team_id) {
      if (matchEventDetail[j].type == "goal") {
        html += `<li class="list-group-item"><span class="material-icons">sports_soccer</span>${matchEventDetail[j].player_name} '${matchEventDetail[j].minute}</li>`;
      }
    }
  }

  html += `</ul>
              </div>
            </div>`;

  return html;
}
});