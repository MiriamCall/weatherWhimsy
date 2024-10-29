const API_key = import.meta.env.VITE_API_KEY;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

const currentTemp = document.querySelector("#current-temp");
const weatherImgWrapper = document.querySelector("#weather-img-wrapper");
const captionDesc = document.querySelector("#weather-desc");
const recommendationText = document.querySelector("#recommendation-text");
const forecastWrapper = document.querySelector("#forecast");
const locationElement = document.querySelector("#current-weather-title");
const getWeatherButton = document.querySelector("#get-weather-btn");

document.addEventListener("DOMContentLoaded", () => {
  // getLocation();
});

getWeatherButton.addEventListener("click", () => {
  getLocation();
});

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      console.log(lat, lon); // testing only
      const weatherUrl = createWeatherUrl(lat, lon);
      const forecastUrl = createForecastUrl(lat, lon);
      getWeatherData(weatherUrl);
      getForecastData(forecastUrl);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function createWeatherUrl(lat, lon) {
  return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=imperial`;
}

function createForecastUrl(lat, lon) {
  return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_key}&units=imperial`;
}

async function getWeatherData(url) {
  const cachedWeather = JSON.parse(localStorage.getItem("weatherData"));
  const now = Date.now();

  if (cachedWeather && now - cachedWeather.timestamp < CACHE_DURATION) {
    console.log("Using cached weather data");
    displayWeatherData(cachedWeather.data);
    updateRecommendations(cachedWeather.data.main.temp);
    insertCurrentLocation(cachedWeather.data);
  } else {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched new weather data");

        // Cache the data with a timestamp
        localStorage.setItem(
          "weatherData",
          JSON.stringify({ data: data, timestamp: now })
        );

        displayWeatherData(data);
        updateRecommendations(data.main.temp);
        insertCurrentLocation(data);
      } else {
        throw new Error("Error fetching weather data.");
      }
    } catch (error) {
      console.log(error);
    }
  }
}

async function getForecastData(url) {
  const cachedForecast = JSON.parse(localStorage.getItem("forecastData"));
  const now = Date.now();

  if (cachedForecast && now - cachedForecast.timestamp < CACHE_DURATION) {
    console.log("Using cached forecast data");
    displayForecastData(cachedForecast.data);
  } else {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched new forecast data");

        // Cache the data with a timestamp
        localStorage.setItem(
          "forecastData",
          JSON.stringify({ data: data, timestamp: now })
        );

        displayForecastData(data);
      } else {
        throw new Error("Error fetching forecast data.");
      }
    } catch (error) {
      console.log(error);
    }
  }
}

function insertCurrentLocation(data) {
  const loactionName = data.name;
  if (data) {
    locationElement.textContent = `Current Weather in ${loactionName}`;
  } else {
    locationElement.textContent = "Current Weather is:";
  }
}

function displayWeatherData(data) {
  const temp = data.main.temp.toFixed(0);
  const description = data.weather[0].description;
  insertCurrentLocation(data);
  const iconSrc = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;

  // Update the current temperature
  currentTemp.textContent = `${temp}°F`;

  // Create and append the weather icon image
  weatherImgWrapper.innerHTML = ""; // Clear previous image
  const weatherImg = document.createElement("img");
  weatherImg.setAttribute("src", iconSrc);
  weatherImg.setAttribute("alt", description);
  weatherImgWrapper.appendChild(weatherImg);

  // Update the weather description
  captionDesc.textContent = description;
}

function displayForecastData(data) {
  forecastWrapper.innerHTML = ""; // Clear previous forecast data

  // Group forecast data by day
  const forecast = {};
  data.list.forEach((item) => {
    const date = new Date(item.dt_txt).toDateString();
    if (!forecast[date]) {
      forecast[date] = [];
    }
    forecast[date].push(item.main.temp);
  });

  // Display the next 5 days of forecast
  const forecastKeys = Object.keys(forecast).slice(0, 5);
  forecastKeys.forEach((day) => {
    const temps = forecast[day];
    const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(
      0
    );

    const forecastDay = document.createElement("div");
    forecastDay.className = "individual-day-wrapper";
    forecastDay.innerHTML = `<p>Date: ${day}</p><p>Avg Temp: ${avgTemp}°F</p>`;
    forecastWrapper.appendChild(forecastDay);
  });
}

function updateRecommendations(temp) {
  let recommendation = "";

  if (temp < 32) {
    recommendation = "Dress warmly, it’s cold outside.";
  } else if (temp >= 32 && temp < 60) {
    recommendation = "It's a bit chilly, consider wearing a jacket.";
  } else if (temp >= 60 && temp < 80) {
    recommendation = "The weather is nice, dress comfortably.";
  } else {
    recommendation = "It’s warm, don't forget sunscreen!";
  }

  recommendationText.textContent = recommendation;
}
