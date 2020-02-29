var searchBtn = $("#search");
var searchList = $("#searchList");
var apiKey = "d5294f3378f302d77473d3cd236f4d46";
var now = moment().format("L");
var weatherIconURL = "http://openweathermap.org/img/w/";
var searchHist;

searchHist = JSON.parse(localStorage.getItem("citySearched"));
if(searchHist !== null){
    for (city of searchHist){
        createHistory(city);
    }
}else{
    searchHist = [];
}


searchBtn.on("click", function(){
    var city = $("#search_txt").val();
    
    createHistory(city);

    searchHist.push(city);

    localStorage.setItem("citySearched", JSON.stringify(searchHist));

    searchForCity(city);
});

searchList.on("click", function(event){
    var city = event.target.innerText;

    searchForCity(city);
});

function createHistory(cityName){
    var listEl = $("<li>");

    listEl.addClass("list-group-item");
    listEl.text(cityName);
    searchList.append(listEl);
}

function searchForCity(city){
    $.ajax({
        url: "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + apiKey + "&units=imperial",
        method: "GET"
    }).then(function(response){
        var mainObj = response.main;
        var lon = response.coord.lon;
        var lat = response.coord.lat;
        var iconEl = $("<img>");

        $("#city").text(response.name + " (" + now + ")");
        iconEl.attr("src", weatherIconURL + response.weather[0].icon + ".png");
        $("#city").append(iconEl);
        $("#temp").text(mainObj.temp + "°F");
        $("#humidity").text(mainObj.humidity + "%");
        $("#wind").text(response.wind.speed + " MPH");

        getUVIndex(lat, lon);
        getFiveDayForecast(city);
    });
}

function getUVIndex(lat, lon){
    $.ajax({
        url: "http://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + lat + "&lon=" + lon + "&units=imperial",
        method: "GET"
    }).then(function(response){
        $("#uv_index").text(response.value);
    });
}

function getFiveDayForecast(city){
    $.ajax({
        url: "http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&APPID=" + apiKey + "&units=imperial",
        method: "GET"
    }).then(function(response){
        var forecastList = response.list;
    });
}