var histContainer = document.querySelector("#hist");
var futureContainer = document.querySelector("#future");

// Autocomplete with cities when user searching by typing city name
var split = function (val) {
  return val.split(/,\s*/);
}

var extractLast = function (term) {
  return split(term).pop();
}

var extractFirst = function (term) {
  return split(term)[0];
}

$(function () {
  var $citiesField = $("#cityInput");

  $citiesField.autocomplete({
      source: function (request, response) {
          jQuery.getJSON(
              "http://gd.geobytes.com/AutoCompleteCity?callback=?&filter=US&q=" + extractLast(request.term),
              function (data) {
                  response(data);
              }
          );
      },
      minLength: 3,
      select: function (event, ui) {
          var selectedObj = ui.item;
          placeName = selectedObj.value;
          if (typeof placeName == "undefined") placeName = $citiesField.val();

          if (placeName) {
              var terms = split($citiesField.val());
              // remove the current input
              terms.pop();
              // add the selected item (city only)
              terms.push(extractFirst(placeName));

              $citiesField.val(terms);
          }

          return false;
      },
      focus: function() {
          // prevent value inserted on focus
          return false;
      },
  });

  $citiesField.autocomplete("option", "delay", 100);
});

// Save search history
var saveSearch = function (cityName) {
  // Store searched cities in localStorage
  cities = JSON.parse(localStorage.getItem("cities"));
  // if nothing in localStorage, create a new object to track all cities searched
  if (!cities) {
    cities = [];
  };
  
  if (cityName) {
    cities.push(cityName);
    localStorage.setItem("cities", JSON.stringify(cities));
  };
  
};

// Add save ability when click search
$("#btn-search").on("click", function () {
  // get the current search value
  var citySearch = $(this).closest(".row").find("span").text().trim();
      cityName = citySearch.split(",")[0]
    
  saveSearch(cityName);
});

// Add searched city to history section
searchedCityName = JSON.parse(localStorage.getItem("cities"));

var showHistory = function (cityName) {
  // create city button
  var btnCity = document.createElement("button");
  btnCity.classList = "btn-search color-gray btn-block mb-2";
  btnCity.setAttribute("id", "btn-city");
  btnCity.setAttribute("type", "button");
  btnCity.textContent = cityName;
  
  histContainer.appendChild(btnCity);
};

//Display current weather
var displaycurrent = function (cityName, icon, temp, wind, humidity) {
  // Display icon
  var iconurl = "http://openweathermap.org/img/w/" + icon + ".png";
  $("#wicon").attr("src", iconurl);
  $("#icon-container").css("visibility", "visible");
  $("#current").addClass("border");
  $("#current").find("#currentCityName").text(cityName+" "+moment().format('MM/DD/YYYY'));
  $("#current").find("#currentTemp").text("Temp: "+temp+" °F");
  $("#current").find("#currentWind").text("Wind: "+wind+" MPH");
  $("#current").find("#currentHumidity").text("Humidity: "+humidity+" %");
};

//Get current weahter
var getCurrentWeather = function(cityName){
  var city = cityName.replace(/ /g,"\%20");
  var apiKey = "380a621c3ce6ec20318abf9243287d4c";
  var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q="+city+",US&lang=en&units=imperial&appid="+apiKey;

  fetch(apiUrl).then(function(response) {
    if (response.ok) {
      response.json().then(function(data) {
        displaycurrent(cityName, data.weather[0].icon, data.main.temp, data.wind.speed, data.main.humidity);
      });
    } else {
      alert('Error: GitHub User Not Found');
    }
  });
}

//Display future weather
var displayfuture = function (date, icon, temp, wind, humidity) {
  var futureTitleEl = document.querySelector("#future-title");
  futureTitleEl.style.visibility = "visible";
  var weatherContainer = document.createElement("div");
  weatherContainer.classList = "pr-2 color-darkBlue";
  futureContainer.appendChild(weatherContainer);

  var dateEl = document.createElement("h5");
  dateEl.classList = "p-2 font-weight-bold";
  dateEl.innerText = date;
  
  var tempEl = document.createElement("p");
  tempEl.className = "px-2";
  tempEl.innerText = "Temp: "+temp+" °F";
  
  var iconEl = document.createElement("img");
  iconEl.className = "px-2";
  iconEl.setAttribute("id", "wicon");
  iconEl.setAttribute("alt", "Weather icon");
  var iconurl = "http://openweathermap.org/img/w/" + icon + ".png";
  iconEl.setAttribute("src", iconurl);

  var windEl = document.createElement("p");
  windEl.className = "px-2";
  windEl.innerText = "Wind: "+wind+" MPH";
  
  var humidityEl = document.createElement("p");
  humidityEl.className = "px-2";
  humidityEl.innerText = "Humidity: "+humidity+" %";

  weatherContainer.appendChild(dateEl);
  weatherContainer.appendChild(iconEl);
  weatherContainer.appendChild(tempEl);
  weatherContainer.appendChild(windEl);
  weatherContainer.appendChild(humidityEl);
};

//Get future weather
var getFutureWeather = function (cityName) {
  var city = cityName.replace(/ /g,"\%20");
  var apiKey = "380a621c3ce6ec20318abf9243287d4c";
  var apiUrl = "https://api.openweathermap.org/data/2.5/forecast?q="+city+",US&lang=en&units=imperial&appid="+apiKey;

  fetch(apiUrl).then(function(response) {
    if (response.ok) {

      response.json().then(function(data) {
        console.log(data);
        for(i=0;i<data.list.length;i=i+8){
          displayfuture(data.list[i].dt_txt.split(" ")[0], 
          data.list[i].weather[0].icon,
          data.list[i].main.temp, data.list[i].wind.speed, 
          data.list[i].main.humidity);
        };

      });
    } else {
      alert('Error: GitHub User Not Found');
    }
  });

};

if (searchedCityName) {
  for(i=0; i<searchedCityName.length; i++) {
    showHistory(searchedCityName[i]);
};
  getCurrentWeather(searchedCityName[searchedCityName.length-1]);
  getFutureWeather(searchedCityName[searchedCityName.length-1]);
};

// Display weather info when clicking city from search history
var btnCityEl = document.querySelectorAll("#btn-city");
for(i=0;i<btnCityEl.length;i++){
  btnCityEl[i].addEventListener("click", function(){
    var cityName=$(this).text();
    futureContainer.innerHTML = "";
    getCurrentWeather(cityName);
    getFutureWeather(cityName);
  });
}