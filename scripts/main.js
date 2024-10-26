const API_key = import.meta.env.VITE_API_KEY;

const currentTemp = document.querySelector("#current-temp");
const weatherImgWrapper = document.querySelector("#weather-img-wrapper");
const captionDesc = document.querySelector("#weather-desc");
const recommendationText = document.querySelector("#recommendation-text");
const forecastWrapper = document.querySelector("#forecast");

document.addEventListener("DOMContentLoaded", () => {
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
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      console.log(data); // testing only
      displayWeatherData(data);
      updateRecommendations(data.main.temp);
    } else {
      throw new Error("Error fetching weather data.");
    }
  } catch (error) {
    console.log(error);
  }
}

async function getForecastData(url) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      console.log(data); // testing only
      displayForecastData(data);
    } else {
      throw new Error("Error fetching forecast data.");
    }
  } catch (error) {
    console.log(error);
  }
}

function displayWeatherData(data) {
  const temp = data.main.temp.toFixed(0);
  const description = data.weather[0].description;
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
