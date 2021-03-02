function getAllTournament() {
  $.ajax({
    url:
      "https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US&leagueId=100695891328981122%2C101097443346691685%2C101382741235120470%2C104366947889790212%2C105266074488398661%2C105266088231437431%2C105266091639104326%2C105266094998946936%2C105266098308571975%2C105266101075764040%2C105266103462388553%2C105266106309666619%2C105266108767593290%2C105266111679554379%2C105266114583847756%2C105266116681590588%2C105266118689416013%2C105549980953490846%2C98767975604431411%2C98767991295297326%2C98767991299243165%2C98767991302996019%2C98767991310872058%2C98767991314006698%2C98767991325878492%2C98767991331560952%2C98767991332355509%2C98767991335774713%2C98767991343597634%2C98767991349978712%2C99332500638116286",

    beforeSend: function (xhr) {
      xhr.setRequestHeader(
        "x-api-key",
        "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z"
      );
    },
    success: function (data) {
      if (data) {
        var events = data.data.schedule.events;
        var upcomingmatch = "";
        for (var i = 0; i < events.length; i++) {
          if (events[i].state === "unstarted" && events[i].match) {
            var a = new Date(events[i].startTime).toString().split(" ");
            upcomingmatch =
              upcomingmatch +
              '<div class="single-matches-box"> <div class="row align-items-center"><div class="col-lg-5 col-md-12"> <div class="matches-team">' +
              '<img  src="' +
              events[i].match.teams[0].image +
              '" alt="image">' +
              '<div class="content">' +
              '<h3><a href="https://scorex.netlify.app/match/' +
              events[i].match.id +
              '" >' +
              events[i].match.teams[0].name +
              "</a></h3>" +
              '<ul class="watch-list"><li>' +
              events[i].league.name +
              " " +
              events[i].blockName +
              "</li> </ul> </div></div></div>" +
              '<div class="col-lg-2 col-md-12"><div class="matches-result"><ul>' +
              "<li>" +
              events[i].match.teams[0].result.gameWins +
              "</li><li>" +
              events[i].match.teams[1].result.gameWins +
              "</li>" +
              '</ul><span class="date-time">' +
              a[0] +
              " " +
              a[1] +
              " " +
              a[2] +
              " " +
              a[3] +
              " " +
              a[4] +
              '</span> </div> </div> <div class="col-lg-5 col-md-12"><div class="matches-team right-image">' +
              '<img  src="' +
              events[i].match.teams[1].image +
              '" alt="image">' +
              '<div class="content">' +
              '<h3><a href="https://scorex.netlify.app/match/' +
              events[i].match.id +
              '" >' +
              events[i].match.teams[1].name +
              "</a></h3>" +
              '<ul class="watch-list"> <li>BO ' +
              events[i].match.strategy.count +
              "</li></ul></div></div></div> </div></div>";
          }
        }

        $("#upcoming-matches").html(upcomingmatch);
      }
    },
    error: function () {
      console.log("Error");
    },
  });
}

function GetFinishMatch() {
  $.ajax({
    url: "https://esports-api.lolesports.com/persisted/gw/getCompletedEvents",
    data: { hl: "en-US" },
    beforeSend: function (xhr) {
      xhr.setRequestHeader(
        "x-api-key",
        "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z"
      );
    },
    success: function (data) {
      var events = data.data.schedule.events;
      var fmStr = "";
      for (var i = 0; i < events.length; i++) {
        var a = new Date(events[i].startTime).toString().split(" ");
        fmStr =
          '<div class="single-matches-box"> <div class="row align-items-center"><div class="col-lg-5 col-md-12"> <div class="matches-team">' +
          '<img  src="' +
          events[i].match.teams[0].image +
          '" alt="image">' +
          '<div class="content">' +
          '<h3><a href="https://scorex.netlify.app/match/' +
          events[i].match.id +
          '" >' +
          events[i].match.teams[0].name +
          "</a></h3>" +
          '<ul class="watch-list"><li>' +
          events[i].league.name +
          " " +
          events[i].blockName +
          "</li> </ul> </div></div></div>" +
          '<div class="col-lg-2 col-md-12"><div class="matches-result"><ul>' +
          "<li>" +
          events[i].match.teams[0].result.gameWins +
          "</li><li>" +
          events[i].match.teams[1].result.gameWins +
          "</li>" +
          '</ul><span class="date-time">' +
          a[0] +
          " " +
          a[1] +
          " " +
          a[2] +
          " " +
          a[3] +
          " " +
          a[4] +
          '</span> </div> </div> <div class="col-lg-5 col-md-12"><div class="matches-team right-image">' +
          '<img  src="' +
          events[i].match.teams[1].image +
          '" alt="image">' +
          '<div class="content">' +
          '<h3><a href="https://scorex.netlify.app/match/' +
          events[i].match.id +
          '" >' +
          events[i].match.teams[1].name +
          "</a></h3>" +
          '<ul class="watch-list"> <li>BO ' +
          events[i].match.strategy.count +
          "</li></ul></div></div></div> </div></div>" +
          fmStr;
      }

      $("#finish-matches").html(fmStr);
    },
    error: function () {
      console.log("error");
    },
  });
}

function GetLiveMatch() {
  $.ajax({
    url: "https://esports-api.lolesports.com/persisted/gw/getLive",
    data: { hl: "en-US" },
    beforeSend: function (xhr) {
      xhr.setRequestHeader(
        "x-api-key",
        "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z"
      );
    },
    success: function (data) {
      var events = data.data.schedule.events;
      var fmStr = "";
      for (var i = 0; i < events.length; i++) {
        if (events[i].match) {
          var a = new Date(events[i].startTime).toString().split(" ");
          fmStr =
            fmStr +
            '<div class="single-matches-box"> <div class="row align-items-center"><div class="col-lg-5 col-md-12"> <div class="matches-team">' +
            '<img  src="' +
            events[i].match.teams[0].image +
            '" alt="image">' +
            '<div class="content">' +
            '<h3><a href="https://scorex.netlify.app/match/' +
            events[i].match.id +
            '" >' +
            events[i].match.teams[0].name +
            "</a></h3>" +
            '<ul class="watch-list"><li>' +
            events[i].league.name +
            " " +
            events[i].blockName +
            "</li> </ul> </div></div></div>" +
            '<div class="col-lg-2 col-md-12"><div class="matches-result"><ul>' +
            "<li>" +
            events[i].match.teams[0].result.gameWins +
            "</li><li>" +
            events[i].match.teams[1].result.gameWins +
            "</li>" +
            '</ul><span class="date-time">' +
            a[0] +
            " " +
            a[1] +
            " " +
            a[2] +
            " " +
            a[3] +
            " " +
            a[4] +
            '</span> </div> </div> <div class="col-lg-5 col-md-12"><div class="matches-team right-image">' +
            '<img  src="' +
            events[i].match.teams[1].image +
            '" alt="image">' +
            '<div class="content">' +
            '<h3><a href="https://scorex.netlify.app/match/' +
            events[i].match.id +
            '" >' +
            events[i].match.teams[1].name +
            "</a></h3>" +
            '<ul class="watch-list"> <li>BO ' +
            events[i].match.strategy.count +
            "</li></ul></div></div></div> </div></div>";
        }
      }
      console.log(fmStr);
      $("#trending-match").html(fmStr);
    },
    error: function () {
      console.log("error");
    },
  });
}

setInterval(function () {
  getAllTournament();
  GetLiveMatch();
  GetFinishMatch();
}, 6000);

function signin() {
  var tk = $("#tk").val();
  var mk = $("#mk").val();
  $("#login").hide();
  $("#root").html(root);
  $("#root").show();
  $("#body").css("background", "white");
}

function displayFinishMatches() {
  $("#upcoming-matches").hide();
  $("#finish-matches").show();
}

function displayUpcomingMatches() {
  $("#upcoming-matches").show();
  $("#finish-matches").hide();
}

var root =
  '<div><section class="matches-area bg-image ptb-100 jarallax" data-jarallax="{&quot;speed&quot;: 0.3}"><div class="container"><div class="section-title"><span class="sub-title">Matches</span><h2>Live Matches</h2></div><div id="trending-match" style="margin-bottom: 20px; background-color: dimgrey;"></div><div class="matches-tabs"><ul class="nav nav-tabs" id="myTab" role="tablist"><li class="nav-item" role="presentation"><span class="nav-link active" id="upcoming-matches-tab" data-toggle="tab" href="" role="tab" aria-controls="upcoming-matches" aria-selected="false" onclick="displayUpcomingMatches()" style="cursor: pointer;">Upcoming Matches</span></li><li class="nav-item " role="presentation"><div class="nav-link " id="latest-result-tab" onclick="displayFinishMatches()" style="cursor: pointer;">Latest Result</div></li></ul><div class="tab-content" id="myTabContent"><div class="tab-pane fade show active" id="upcoming-matches" role="tabpanel"></div><div class="tab-pane fade show active" id="finish-matches" role="tabpanel" style="display: none;"></div></div></div></div></section></div></div>';

function md5cycle(x, k) {
  var a = x[0],
    b = x[1],
    c = x[2],
    d = x[3];

  a = ff(a, b, c, d, k[0], 7, -680876936);
  d = ff(d, a, b, c, k[1], 12, -389564586);
  c = ff(c, d, a, b, k[2], 17, 606105819);
  b = ff(b, c, d, a, k[3], 22, -1044525330);
  a = ff(a, b, c, d, k[4], 7, -176418897);
  d = ff(d, a, b, c, k[5], 12, 1200080426);
  c = ff(c, d, a, b, k[6], 17, -1473231341);
  b = ff(b, c, d, a, k[7], 22, -45705983);
  a = ff(a, b, c, d, k[8], 7, 1770035416);
  d = ff(d, a, b, c, k[9], 12, -1958414417);
  c = ff(c, d, a, b, k[10], 17, -42063);
  b = ff(b, c, d, a, k[11], 22, -1990404162);
  a = ff(a, b, c, d, k[12], 7, 1804603682);
  d = ff(d, a, b, c, k[13], 12, -40341101);
  c = ff(c, d, a, b, k[14], 17, -1502002290);
  b = ff(b, c, d, a, k[15], 22, 1236535329);

  a = gg(a, b, c, d, k[1], 5, -165796510);
  d = gg(d, a, b, c, k[6], 9, -1069501632);
  c = gg(c, d, a, b, k[11], 14, 643717713);
  b = gg(b, c, d, a, k[0], 20, -373897302);
  a = gg(a, b, c, d, k[5], 5, -701558691);
  d = gg(d, a, b, c, k[10], 9, 38016083);
  c = gg(c, d, a, b, k[15], 14, -660478335);
  b = gg(b, c, d, a, k[4], 20, -405537848);
  a = gg(a, b, c, d, k[9], 5, 568446438);
  d = gg(d, a, b, c, k[14], 9, -1019803690);
  c = gg(c, d, a, b, k[3], 14, -187363961);
  b = gg(b, c, d, a, k[8], 20, 1163531501);
  a = gg(a, b, c, d, k[13], 5, -1444681467);
  d = gg(d, a, b, c, k[2], 9, -51403784);
  c = gg(c, d, a, b, k[7], 14, 1735328473);
  b = gg(b, c, d, a, k[12], 20, -1926607734);

  a = hh(a, b, c, d, k[5], 4, -378558);
  d = hh(d, a, b, c, k[8], 11, -2022574463);
  c = hh(c, d, a, b, k[11], 16, 1839030562);
  b = hh(b, c, d, a, k[14], 23, -35309556);
  a = hh(a, b, c, d, k[1], 4, -1530992060);
  d = hh(d, a, b, c, k[4], 11, 1272893353);
  c = hh(c, d, a, b, k[7], 16, -155497632);
  b = hh(b, c, d, a, k[10], 23, -1094730640);
  a = hh(a, b, c, d, k[13], 4, 681279174);
  d = hh(d, a, b, c, k[0], 11, -358537222);
  c = hh(c, d, a, b, k[3], 16, -722521979);
  b = hh(b, c, d, a, k[6], 23, 76029189);
  a = hh(a, b, c, d, k[9], 4, -640364487);
  d = hh(d, a, b, c, k[12], 11, -421815835);
  c = hh(c, d, a, b, k[15], 16, 530742520);
  b = hh(b, c, d, a, k[2], 23, -995338651);

  a = ii(a, b, c, d, k[0], 6, -198630844);
  d = ii(d, a, b, c, k[7], 10, 1126891415);
  c = ii(c, d, a, b, k[14], 15, -1416354905);
  b = ii(b, c, d, a, k[5], 21, -57434055);
  a = ii(a, b, c, d, k[12], 6, 1700485571);
  d = ii(d, a, b, c, k[3], 10, -1894986606);
  c = ii(c, d, a, b, k[10], 15, -1051523);
  b = ii(b, c, d, a, k[1], 21, -2054922799);
  a = ii(a, b, c, d, k[8], 6, 1873313359);
  d = ii(d, a, b, c, k[15], 10, -30611744);
  c = ii(c, d, a, b, k[6], 15, -1560198380);
  b = ii(b, c, d, a, k[13], 21, 1309151649);
  a = ii(a, b, c, d, k[4], 6, -145523070);
  d = ii(d, a, b, c, k[11], 10, -1120210379);
  c = ii(c, d, a, b, k[2], 15, 718787259);
  b = ii(b, c, d, a, k[9], 21, -343485551);

  x[0] = add32(a, x[0]);
  x[1] = add32(b, x[1]);
  x[2] = add32(c, x[2]);
  x[3] = add32(d, x[3]);
}

function cmn(q, a, b, x, s, t) {
  a = add32(add32(a, q), add32(x, t));
  return add32((a << s) | (a >>> (32 - s)), b);
}

function ff(a, b, c, d, x, s, t) {
  return cmn((b & c) | (~b & d), a, b, x, s, t);
}

function gg(a, b, c, d, x, s, t) {
  return cmn((b & d) | (c & ~d), a, b, x, s, t);
}

function hh(a, b, c, d, x, s, t) {
  return cmn(b ^ c ^ d, a, b, x, s, t);
}

function ii(a, b, c, d, x, s, t) {
  return cmn(c ^ (b | ~d), a, b, x, s, t);
}

function md51(s) {
  txt = "";
  var n = s.length,
    state = [1732584193, -271733879, -1732584194, 271733878],
    i;
  for (i = 64; i <= s.length; i += 64) {
    md5cycle(state, md5blk(s.substring(i - 64, i)));
  }
  s = s.substring(i - 64);
  var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (i = 0; i < s.length; i++)
    tail[i >> 2] |= s.charCodeAt(i) << (i % 4 << 3);
  tail[i >> 2] |= 0x80 << (i % 4 << 3);
  if (i > 55) {
    md5cycle(state, tail);
    for (i = 0; i < 16; i++) tail[i] = 0;
  }
  tail[14] = n * 8;
  md5cycle(state, tail);
  return state;
}

function md5blk(s) {
  var md5blks = [],
    i;
  for (i = 0; i < 64; i += 4) {
    md5blks[i >> 2] =
      s.charCodeAt(i) +
      (s.charCodeAt(i + 1) << 8) +
      (s.charCodeAt(i + 2) << 16) +
      (s.charCodeAt(i + 3) << 24);
  }
  return md5blks;
}

var hex_chr = "0123456789abcdef".split("");

function rhex(n) {
  var s = "",
    j = 0;
  for (; j < 4; j++)
    s += hex_chr[(n >> (j * 8 + 4)) & 0x0f] + hex_chr[(n >> (j * 8)) & 0x0f];
  return s;
}

function hex(x) {
  for (var i = 0; i < x.length; i++) x[i] = rhex(x[i]);
  return x.join("");
}

function md5(s) {
  return hex(md51(s));
}

function add32(a, b) {
  return (a + b) & 0xffffffff;
}

if (md5("hello") != "5d41402abc4b2a76b9719d911017c592") {
  function add32(x, y) {
    var lsw = (x & 0xffff) + (y & 0xffff),
      msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }
}
