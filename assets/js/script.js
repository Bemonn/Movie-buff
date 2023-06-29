var searchInput = document.getElementById('searchInput')
var searchFormEl = document.getElementById('search-form')


var formSubmitHandler = function (event) {
    event.preventDefault();

    var movieName = searchInput.value.trim();
    console.log(movieName)

    if (movieName) {
        getMovieApi(movieName);

        searchInput.value = '';
    } else {
        alert('Please enter a movie name')
    }
}




function getMovieApi(title) {
    var requestMovieUrl = 'http://www.omdbapi.com/?t=' + title + '&apikey=2bd63a1d'

    fetch(requestMovieUrl)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data)
    })
}


searchFormEl.addEventListener('submit', formSubmitHandler)

