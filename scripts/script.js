var cityToSearch = "";
var loadLastCity = "";
var apiKey = "&APPID=f97d09aad6f01e913a987bee4e1619fb";

cityHistory = [];

init();

function init() {
  getCitiesFromStorage();
  //if local storage not null
  //if a search history exists, load the last searched city.
  if (loadLastCity) {
    cityToSearch = cityHistory[cityHistory.length - 1].location;
    searchCityWeather();
    searchCityForecast();
    loadLastCity = false;
  }
  //renderCityWeather();
  //renderCityForecast();
}

function searchCityWeather() {
  //build/submit ajax query
  var baseURL = "http://api.openweathermap.org/data/2.5/weather?q=";
  var locationURL = cityToSearch;
  var locationUnits = "&units=imperial";
  //var apiKey = "&APPID=f97d09aad6f01e913a987bee4e1619fb";
  var queryURL = baseURL + locationURL + locationUnits + apiKey;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    var cityName = response.name;
    var cityDate = moment.unix(response.dt).format("YYYY-MM-DD");
    var cityIcon = response.weather[0].icon;
    var cityIconURL = "http://openweathermap.org/img/w/" + cityIcon + ".png";
    var cityTemp = response.main.temp;
    var cityHumidity = response.main.humidity;
    var cityWindSpeed = response.wind.speed;
    var cityLat = response.coord.lat;
    var cityLon = response.coord.lon;
    //TODO:UV indicator
    var cityUV = UVIndex(cityLat, cityLon);
    console.log("cityUV: " + cityUV);

    renderCityWeather(cityName, cityDate, cityTemp, cityHumidity, cityWindSpeed, cityUV, cityIconURL);
  });
}

function UVIndex(lat, lon) {
  var cityUV = "";

  queryURL = "http://api.openweathermap.org/data/2.5/uvi/forecast?&appid=f97d09aad6f01e913a987bee4e1619fb&lat=" + lat + "&lon=" + lon;
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    console.log(response[0].value);
    cityUV = response[0].value;
  });
  return cityUV;
}

function searchCityForecast() {
  var baseURL = "https://api.openweathermap.org/data/2.5/forecast?q=";
  var locationURL = cityToSearch;
  var locationUnits = "&units=imperial";
  //var apiKey = "&APPID=f97d09aad6f01e913a987bee4e1619fb";
  var queryURL = baseURL + locationURL + locationUnits + apiKey;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    //loop through forecasted days and pull the 12:00 time.
    for (var i = 0; i < response.list.length; i++) {
      if (response.list[i].dt_txt[12] === "2") {
        var forecastDate = moment.unix(response.list[i].dt).format("YYYY-MM-DD");
        var forecastTemp = response.list[i].main.temp;
        var forecastHumidity = response.list[i].main.humidity;
        var forecastIcon = response.list[i].weather[0].icon;
        var forecastIconURL = "http://openweathermap.org/img/w/" + forecastIcon + ".png";

        renderCityForecast(forecastDate, forecastTemp, forecastHumidity, forecastIconURL);
      }
    }
  });
}

function renderCityWeather(cityName, cityDate, cityTemp, cityHumidity, cityWindSpeed, cityUV, cityIconURL) {
  //TODO:need to lookup UV indicator
  $("#city-summary").empty();
  $("#forecast-card-deck").empty();
  var card = $("<div>").attr("class", "card city-card");
  var cardBody = $("<div>").attr("class", "card-body city-card-body");
  var cardCity = $("<h3>")
    .attr("class", "card-title city-card-title")
    .text(cityName + " (" + cityDate + ")");
  $("<img>").attr("class", "icon").attr("src", cityIconURL).attr("alt", "Weather Icon").appendTo(cardCity);
  var cardTemp = $("<p>")
    .attr("class", "card-text city-card-text")
    .text("Temperature: " + cityTemp + " °F");
  var cardHumidity = $("<p>")
    .attr("class", "card-text city-card-text")
    .text("Humidity: " + cityHumidity + " %");
  var cardWindSpeed = $("<p>")
    .attr("class", "card-text city-card-text")
    .text("Wind Speed: " + cityWindSpeed + " MPH");
  var cardCityUV = $("<p>")
    .attr("class", "card-text city-card-text")
    .text("UV Index: " + cityUV);
  $("#city-summary").append(card, cardBody, cardCity, cardTemp, cardHumidity, cardWindSpeed, cardCityUV);
}

function renderCityForecast(forecastDate, forecastTemp, forecastHumidity, forecastIconURL) {
  var card = $("<div>").attr("class", "card forecast-card");
  //var cardBody = $("<div>").attr("class", "card-body forecast-card-body");
  var cardDate = $("<h6>").attr("class", "card-title forecast-card-title").text(forecastDate);
  var cardIcon = $("<img>").attr("class", "icon").attr("src", forecastIconURL).attr("alt", "Weather Icon");
  var cardTemp = $("<p>")
    .attr("class", "card-text forecast-card-text")
    .text("Temp: " + forecastTemp + " °F");
  var cardHumidity = $("<p>")
    .attr("class", "card-text forecast-card-text")
    .text("Humidity: " + forecastHumidity + " %");
  $(card).append(cardDate, cardIcon, cardTemp, cardHumidity);
  $("#forecast-card-deck").append(card);
}

function renderCityHistory() {
  $("#search-list").empty();
  //$("<button>").attr("class", "button").attr("id", "clear-history").text("Clear History").appendTo("#search-list");
  for (var i = 0; i < cityHistory.length; i++) {
    var historyBtn = $("<button>").attr("class", "button").text(cityHistory[i].location);
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
  //https://www.tutorialrepublic.com/faq/how-to-check-if-an-array-includes-an-object-in-javascript.php
  //if city not in city history array, add it
  //FIXME:includes is not working...
  if (cityHistory.some((city) => city.location === cityToSearch)) {
    console.log("Match");
  } else {
    console.log("No Match");

    var newCity = {
      location: cityToSearch,
    };
    cityHistory.push(newCity);
    localStorage.setItem("cityhistory", JSON.stringify(cityHistory));

    renderCityHistory();
  }

  //console.log(cityHistory);
}

$("#search-button").click(function (event) {
  event.preventDefault();
  cityToSearch = $("#search-input").val().trim();
  $("#search-input").val("");
  // Return from function early if submitted text is blank
  if (cityToSearch === "") {
    return;
  }

  console.log(cityToSearch);
  saveCityToStorage();
  searchCityWeather();
  searchCityForecast();
});

// $("#clear-history").click(function (event) {
//   alert("Clear History?");
//   localStorage.clear();
//   $("#search-list").empty();
// });
