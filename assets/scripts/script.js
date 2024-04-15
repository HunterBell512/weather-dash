const searchForm = $('#searchForm');
const searchBar = $('#searchBar');
const cityName = $('#city-name');
const cityTemp = $('#temp');
const cityWind = $('#wind');
const cityHumidity = $('#humidity');
const forecast = $('#forecast');
const searchHistory = $('#history');
let currentDate = '';
let city = '';

const handleSubmit = async (search) => {
    if (search === '') {
        city = 'San Diego';
    } else {
        city = search;
    }

    const key = 'c490fc1c501f72d32157933ec3a3fb5d';
    const getCoordinates = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${key}`);
    const coordinateData = await getCoordinates.json();

    const url = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${coordinateData[0].lat}&lon=${coordinateData[0].lon}&units=imperial&exclude=hourly,minute&appid=${key}`);
    const results = await url.json();
    currentDate = dayjs(results.list[0].main.dt).format('MMM DD, YYYY');

    cityName.text(`${coordinateData[0].name} ${currentDate}`);
    cityTemp.text(`Temp: ${results.list[0].main.temp_max}`);
    cityWind.text(`Wind: ${results.list[0].wind.speed}`);
    cityHumidity.text(`Humidity: ${results.list[0].main.humidity}%`);

    generateForcast(results.list);
    saveToLS(coordinateData[0].name);
}

const generateForcast = (data) => {
    forecast.empty();
    let firstPass = true;
    let k = 0;
    const regex = /21:00:00/g
    for (let i = 0; i < 5; i++) {
        const card = $('<div>');
        const date = $('<p>');
        const temp = $('<p>');
        const wind = $('<p>');
        const humidity = $('<p>');
        const weather = $('<img>')
        const classes = 'is-size-5 m-3';

        if (firstPass) {
            while (!data[k].dt_txt.match(regex) || dayjs(data[k].dt_txt).format('MMM DD, YYYY') === currentDate) {
                k++;
            }
            firstPass = false;
        }
        console.log(k);

        card.addClass('container column is-2');
        date.text(dayjs(data[k].dt_txt).format('MMM DD, YYYY'));
        date.addClass(classes);
        temp.text(`Temp: ${data[k].main.temp_max}`);
        temp.addClass(classes);
        wind.text(`Wind: ${data[k].wind.speed}`);
        wind.addClass(classes);
        humidity.text(`Humidity: ${data[k].main.humidity}%`)
        humidity.addClass(classes);
        weather.attr('src', `https://openweathermap.org/img/wn/${data[k].weather[0].icon}.png`);
        weather.addClass('has-text-centered');

        card.append(date, temp, wind, humidity, weather);
        forecast.append(card);
        k += 6;
        if (k + 8 > 39) {
            k = 39;
        }
    } 
}

const saveToLS = (val) => {
    let items = [];
    if (localStorage.getItem('cities')) {
        items = JSON.parse(localStorage.getItem('cities'));
    }

    if (!items.includes(val)) {
        items.push(val)
        localStorage.setItem('cities', JSON.stringify(items));
        populateHistory(items);
    }
}

const loadLS = () => {
    if (localStorage.getItem('cities')) {
        populateHistory(JSON.parse(localStorage.getItem('cities')));
    }
}

const populateHistory = (history) => {
    searchHistory.empty();
    for (let i = 0; i < history.length; i++) {
        const historyBtn = $('<button>');

        historyBtn.text(history[i]);
        historyBtn.addClass('button is-rounded is-fullwidth historyBtn is-link is-outlined');
        historyBtn.on('click', (e) => {
            handleSubmit($(e.target).text())
        })
        searchHistory.append(historyBtn);
    }
}

loadLS();

searchForm.submit(() => {
    handleSubmit(searchBar.val());
    return false;
});