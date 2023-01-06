const weathercodeMap = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight showers',
  81: 'Moderate showers',
  82: 'Heavy showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

function timeAgoInWords(datetime) {
  // Get the current time
  const currentTime = new Date();

  // Convert the datetime to a date object
  const date = new Date(datetime);

  // Calculate the time difference in seconds
  const diffInSeconds = Math.abs(currentTime - date) / 1000;

  // Calculate the time difference in minutes
  const diffInMinutes = diffInSeconds / 60;

  // Calculate the time difference in hours
  const diffInHours = diffInMinutes / 60;

  // Calculate the time difference in days
  const diffInDays = diffInHours / 24;

  // Calculate the time difference in months
  const diffInMonths = diffInDays / 30;

  // Calculate the time difference in years
  const diffInYears = diffInMonths / 12;

  // Return the "time ago in words"
  if (diffInSeconds < 60) {
    return `${Math.round(diffInSeconds)} seconds ago`;
  } else if (diffInMinutes < 60) {
    return `${Math.round(diffInMinutes)} minutes ago`;
  } else if (diffInHours < 24) {
    return `${Math.round(diffInHours)} hours ago`;
  } else if (diffInDays < 30) {
    return `${Math.round(diffInDays)} days ago`;
  } else if (diffInMonths < 12) {
    return `${Math.round(diffInMonths)} months ago`;
  } else {
    return `${Math.round(diffInYears)} years ago`;
  }
}

async function setLagoonData() {
  const resp = await fetch('https://water.weather.gov/ahps2/hydrograph_to_xml.php?gage=crmc1&output=xml');
  const xml = new DOMParser().parseFromString(await resp.text(), 'text/xml');

  const firstNode = xml.querySelector('observed').children[0];
  const lastCheckedAt = timeAgoInWords(firstNode.querySelector('valid').textContent);
  const currentLevel = parseFloat(firstNode.querySelector('primary').textContent);

  const secondNode = xml.querySelector('observed').children[1];
  const previousLevelCheckedAt = timeAgoInWords(secondNode.querySelector('valid').textContent);
  const previousLevel = parseFloat(secondNode.querySelector('primary').textContent);

  const floodThreshold = 12.5;
  const actionThreshold = 10.0;
  let status, color;
  if (currentLevel > floodThreshold) {
    status = 'flood';
    color = 'red';
  } else if (currentLevel > actionThreshold) {
    status = 'action';
    color = 'orange';
  } else {
    status = 'ok';
    color = 'rgb(34, 197, 94)';
  }

  let trend;
  if (previousLevel === currentLevel) {
    trend = 'steady';
  } else if (previousLevel > currentLevel) {
    trend = 'down';
  } else {
    trend = 'up';
  }

  this.lagoonData = {
    name: 'Lagoon',
    floodThreshold,
    actionThreshold,
    currentLevel,
    lastCheckedAt,
    status,
    color,
    trend,
    previousLevel,
    previousLevelCheckedAt,
    linkUrl: 'https://water.weather.gov/ahps2/hydrograph.php?gage=CRMC1&wfo=mtr',
    graphUrl: 'https://water.weather.gov/resources/hydrographs/crmc1_hg.png',
  };

  createDataCard('lagoon', this.lagoonData)
}

async function setHighwayData() {
  const resp = await fetch('https://water.weather.gov/ahps2/hydrograph_to_xml.php?gage=cmrc1&output=xml');
  const xml = new DOMParser().parseFromString(await resp.text(), 'text/xml');

  const firstNode = xml.querySelector('observed').children[0];
  const lastCheckedAt = timeAgoInWords(firstNode.querySelector('valid').textContent);
  const currentLevel = parseFloat(firstNode.querySelector('primary').textContent);

  const secondNode = xml.querySelector('observed').children[1];
  const previousLevelCheckedAt = timeAgoInWords(secondNode.querySelector('valid').textContent);
  const previousLevel = parseFloat(secondNode.querySelector('primary').textContent);

  const floodThreshold = 17.0;
  const actionThreshold = 15.0;
  let status, color;
  if (currentLevel > floodThreshold) {
    status = 'flood';
    color = 'red';
  } else if (currentLevel > actionThreshold) {
    status = 'action';
    color = 'orange';
  } else {
    status = 'ok';
    color = 'rgb(34, 197, 94);';
  }

  let trend;
  if (previousLevel === currentLevel) {
    trend = 'steady';
  } else if (previousLevel > currentLevel) {
    trend = 'down';
  } else {
    trend = 'up';
  }

  this.highwayData = {
    name: 'Highway 1',
    floodThreshold,
    actionThreshold,
    currentLevel,
    lastCheckedAt,
    color,
    status,
    trend,
    previousLevel,
    previousLevelCheckedAt,
    linkUrl: 'https://water.weather.gov/ahps2/hydrograph.php?gage=CMRC1&wfo=mtr',
    graphUrl: 'https://water.weather.gov/resources/hydrographs/cmrc1_hg.png',
  };
  createDataCard('highway', this.highwayData)
}

async function createDataCard(id, data) {
  const el = document.getElementById(id)

  el.innerHTML = `
    <h1>${data.name}</h1>
    <h2>STATUS: <span style="color: ${data.color}">${data.status.toUpperCase()}</span><h2>
    <p>Level was <b>${data.currentLevel}ft</b> ${data.lastCheckedAt} and trending <b>${data.trend}</b>.</p>
    <small><i>(${data.previousLevel}ft ${data.previousLevelCheckedAt})</i></small>
    <br>
    <a href="${data.linkUrl}">More info</a>
    <br>
    <img src="${data.graphUrl}" class="graphImage" />
  `
}

async function setWeatherData() {
  const url = "https://api.open-meteo.com/v1/forecast?latitude=36.54&longitude=-121.92&current_weather=true&hourly=precipitation&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=America%2FLos_Angeles";
  const resp = await fetch(url);
  const parsed = await resp.json();
  this.currentWeather = parsed['current_weather'];
  this.currentWeather['description'] = weathercodeMap[this.currentWeather['weathercode']];
  const el = document.getElementById("weather");
  el.innerHTML = `
    <div class="weather">
      <p>${this.currentWeather.description}</p>
      <p>${this.currentWeather.temperature}&#8457</p>
      <p>Wind speed: ${this.currentWeather.windspeed} mph</p>
    </div>
  `

  this.rainGraphData = [];
  parsed['hourly']['time'].forEach((time, index) => {
    const convertedTime = new Date(Date.parse(time)).getTime()
    this.rainGraphData.push([convertedTime, parsed['hourly']['precipitation'][index]]);
  });
  buildRainGraph()
}

async function buildRainGraph() {
  Highcharts.chart('rainGraph', {
    tooltip: {
      style: {
        color: "#FFFFFF"
      }
    },
    legend: { enabled: false },
    chart: { type: "line" },
    title: { text: "" },
    xAxis: {
      type: "datetime",
      dateTimeLabelFormats: { day: '%b %e' }
    },
    yAxis: { title: { text: "inches" } },
    series: [{
      name: "Rain",
      data: this.rainGraphData
    }]

});

}

setLagoonData()
setHighwayData()
setWeatherData()
