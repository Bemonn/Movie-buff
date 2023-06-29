var movieInput = document.getElementById('searchInput')
var movieFormEl = document.getElementById('search-form')


var formSubmitHandler = function (event) {
    event.preventDefault();

    var movieName = movieInput.value.trim();
    console.log(movieName)

    if (movieName) {
        getMovieApi(movieName);

        movieInput.value = '';
    } else {
        alert('Please enter a movie name')
    }
}




function getMovieApi(title) {
    var requestMovieUrl = 'http://www.omdbapi.com/?t=' + title + '&apikey=2bd63a1d'

    fetch(requestMovieUrl)
    .then(function (respone) {
        return respone.json();
    })
    .then(function (data) {
        console.log(data)
    })
}


movieFormEl.addEventListener('submit', formSubmitHandler)

