var cityToSearch = "";
var loadLastCity = "";
var apiKey = "&APPID=f97d09aad6f01e913a987bee4e1619fb";

cityHistory = [];

init();

function init() {
  getCitiesFromStorage();
  //if a search history exists, load the last searched city.
  if (loadLastCity) {
    cityToSearch = cityHistory[cityHistory.length - 1];
    searchCityWeather();
    searchCityForecast();
    loadLastCity = false;
  }
}

function searchCityWeather() {
  //build/submit ajax query
  var baseURL = "https://api.openweathermap.org/data/2.5/weather?q=";
  var locationURL = cityToSearch;
  var locationUnits = "&units=imperial";
  var queryURL = baseURL + locationURL + locationUnits + apiKey;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    var cityName = response.name;
    var cityDate = moment.unix(response.dt).format("MM/DD/YYYY");
    var cityIcon = response.weather[0].icon;
    var cityIconURL = "https://openweathermap.org/img/w/" + cityIcon + ".png";
    var cityTemp = response.main.temp;
    var cityHumidity = response.main.humidity;
    var cityWindSpeed = response.wind.speed;
    var cityLat = response.coord.lat;
    var cityLon = response.coord.lon;

    renderCityWeather(cityName, cityDate, cityTemp, cityHumidity, cityWindSpeed, cityIconURL);
    UVIndex(cityLat, cityLon);
  });
}

//call current UV data.
function UVIndex(lat, lon) {
  queryURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=f97d09aad6f01e913a987bee4e1619fb";
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    UVIndexScale(response.value);
  });
}

//https://www.epa.gov/sunsafety/uv-index-scale-0
function UVIndexScale(indexValue) {
  if (indexValue > 0 && indexValue < 2.5) {
    uvIndexSpan = "green";
  } else if (indexValue > 2.5 && indexValue < 5) {
    uvIndexSpan = "yellow";
  } else if (indexValue > 5 && indexValue < 7) {
    uvIndexSpan = "orange";
  } else if (indexValue > 7 && indexValue < 11) {
    uvIndexSpan = "red";
  } else {
    uvIndexSpan = "purple";
  }
  var uvIndexSpan = $("<span>").attr("class", uvIndexSpan).text(indexValue);
  var uvIndexH5 = $("<h5>").attr("class", "card-text city-card-text").attr("id", "uv-index").text("UV Index: ").append(uvIndexSpan);
  $(".city-card-body").append(uvIndexH5);
}

function searchCityForecast() {
  var baseURL = "https://api.openweathermap.org/data/2.5/forecast?q=";
  var locationURL = cityToSearch;
  var locationUnits = "&units=imperial";
  var queryURL = baseURL + locationURL + locationUnits + apiKey;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    //loop through forecasted days and pull the 12:00 time.
    for (var i = 0; i < response.list.length; i++) {
      if (response.list[i].dt_txt[12] === "2") {
        var forecastDate = moment.unix(response.list[i].dt).format("MM/DD/YYYY");
        var forecastTemp = response.list[i].main.temp;
        var forecastHumidity = response.list[i].main.humidity;
        var forecastIcon = response.list[i].weather[0].icon;
        var forecastIconURL = "https://openweathermap.org/img/w/" + forecastIcon + ".png";

        renderCityForecast(forecastDate, forecastTemp, forecastHumidity, forecastIconURL);
      }
    }
  });
}

function renderCityWeather(cityName, cityDate, cityTemp, cityHumidity, cityWindSpeed, cityIconURL) {
  $("#city-summary").empty();
  $("#forecast-card-deck").empty();
  var card = $("<div>").attr("class", "card city-card");
  var cardBody = $("<div>").attr("class", "card-body city-card-body");
  var cardCity = $("<h3>")
    .attr("class", "card-title city-card-title")
    .text(cityName + " (" + cityDate + ")");
  $("<img>").attr("class", "icon").attr("src", cityIconURL).attr("alt", "Weather Icon").appendTo(cardCity);
  var cardTemp = $("<h5>")
    .attr("class", "card-text city-card-text")
    .text("Temperature: " + cityTemp + " °F");
  var cardHumidity = $("<h5>")
    .attr("class", "card-text city-card-text")
    .text("Humidity: " + cityHumidity + " %");
  var cardWindSpeed = $("<h5>")
    .attr("class", "card-text city-card-text")
    .text("Wind Speed: " + cityWindSpeed + " MPH");
  $(cardBody).append(cardCity, cardTemp, cardHumidity, cardWindSpeed);
  $(card).append(cardBody);
  $("#city-summary").append(card);
}

function renderCityForecast(forecastDate, forecastTemp, forecastHumidity, forecastIconURL) {
  var card = $("<div>").attr("class", "card bg-light forecast-card");
  var cardBody = $("<div>").attr("class", "card-body forecast-card-body");
  $("<h6>").attr("class", "card-title forecast-card-title").text(forecastDate).appendTo(cardBody);
  $("<img>").attr("class", "icon").attr("src", forecastIconURL).attr("alt", "Weather Icon").appendTo(cardBody);
  $("<p>")
    .attr("class", "card-text forecast-card-text")
    .text("Temp: " + forecastTemp + " °F")
    .appendTo(cardBody);
  $("<p>")
    .attr("class", "card-text forecast-card-text")
    .text("Humidity: " + forecastHumidity + " %")
    .appendTo(cardBody);
  $(card).append(cardBody);
  $("#forecast-card-deck").append(card);
}

function renderCityHistory() {
  $("#search-list").empty();
  for (var i = 0; i < cityHistory.length; i++) {
    var historyBtn = $("<button>").attr("class", "button history-button").text(cityHistory[i]);
    $("#search-list").prepend(historyBtn);
  }
}

function getCitiesFromStorage() {
  storedCityHistory = JSON.parse(localStorage.getItem("cityhistory"));
  if (storedCityHistory !== null) {
    cityHistory = storedCityHistory;
    loadLastCity = true;
    renderCityHistory();
  }
}

function saveCityToStorage() {
  //if city not in city history array, add it
  if (cityHistory.includes(cityToSearch)) {
    return;
  } else {
    cityHistory.push(cityToSearch);
    localStorage.setItem("cityhistory", JSON.stringify(cityHistory));

    renderCityHistory();
    location.reload();
  }
}

$("#search-button").click(function (event) {
  event.preventDefault();
  cityToSearch = $("#search-input").val().trim();
  $("#search-input").val("");
  // Return from function early if submitted text is blank
  if (cityToSearch === "") {
    return;
  }

  saveCityToStorage();
  searchCityWeather();
  searchCityForecast();
});

$(".history-button").click(function (event) {
  event.preventDefault();
  cityToSearch = $(this).text().trim();
  searchCityWeather();
  searchCityForecast();
});
