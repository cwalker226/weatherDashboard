var searchBtn = $("#search");
var searchList = $("#searchList");
var apiKey = "d5294f3378f302d77473d3cd236f4d46";
var now = moment().format("L");
var weatherIconURL = "https://openweathermap.org/img/w/";
var searchHist = [];


if(localStorage.getItem("citySearched")){
    searchHist = JSON.parse(localStorage.getItem("citySearched"));
    for (city of searchHist){
        createHistory(city);
    }
}


searchBtn.on("click", function(event){
    event.preventDefault();
    var city = $("#search_txt").val();

    if(searchHist.indexOf(city) < 0){
        searchHist.push(city);
        createHistory(city);
    }

    localStorage.setItem("citySearched", JSON.stringify(searchHist));

    searchForCity(city);
    $("#search_txt").val("");
});

searchList.on("click", function(event){
    var city = event.target.innerText;

    searchForCity(city);
});

function createHistory(cityName){
    var listEl = $("<li>");

    listEl.addClass("list-group-item list-group-item-action");
    listEl.text(cityName);
    searchList.append(listEl);
}

function searchForCity(city){
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + apiKey + "&units=imperial",
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
        url: "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + lat + "&lon=" + lon + "&units=imperial",
        method: "GET"
    }).then(function(response){
        var uvIndex = response.value;
        var uvEL = $("#uv_index");
        var scaleColor = "badge swatch-purple";
        if(uvIndex < "3"){
            scaleColor ="badge swatch-green";
        }else if(uvIndex >= 3 && uvIndex < 6){
            scaleColor = "badge swatch-yellow";
        }else if(uvIndex >= 6 && uvIndex < 8){
            scaleColor = "badge swatch-orange";
        }else if(uvIndex >= 8 && uvIndex < 11){
            scaleColor = "badge swatch-red";
        }
        uvEL.addClass(scaleColor);
        uvEL.text(response.value);
    });
}

function getFiveDayForecast(city){
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&APPID=" + apiKey + "&units=imperial",
        method: "GET"
    }).then(function(response){
        var forecastList = $("#forecast");
        var forecastArray = response.list;

        forecastList.empty();

        for(var i = 0; i < forecastArray.length; i++){
            if(moment(forecastArray[i].dt_txt).hour() === 15){
                var listItem = $("<div>");
                var dateEl = $("<h5>");
                var iconEl = $("<img>");
                var tempEl = $("<p>");
                var humidityEl = $("<p>");

                listItem.addClass("list-group-item active mr-4 p-2 text-nowrap");
                dateEl.text(moment(forecastArray[i].dt_txt).format("MM/DD/YYYY"));
                listItem.append(dateEl);
                iconEl.attr("src", weatherIconURL + forecastArray[i].weather[0].icon + ".png");
                listItem.append(iconEl);
                tempEl.text("Temp: " + forecastArray[i].main.temp + "°F");
                listItem.append(tempEl);
                humidityEl.text("Humidity: " + forecastArray[i].main.humidity + "%");
                listItem.append(humidityEl);
                forecastList.append(listItem);
            }
        }
    });
}