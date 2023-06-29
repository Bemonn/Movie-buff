var movieInput = document.getElementById('searchInput');
var movieFormEl = document.getElementById('search-form');
var movieInfo = document.getElementById('movieInfo');
var trailerContainer = document.getElementById('trailerContainer');


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
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data)
    })
}


movieFormEl.addEventListener('submit', formSubmitHandler)



// Fetch & display the movie trailer
fetchTrailer(movieData.Title);

// Using fetch method to request trailer from youtube using API key
async function fetchTrailer(movieTitle) {
  var apiKey = 'AIzaSyBLYYwlY0FawpIOHpAwRfHhh9nUa';
  var apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(movieTitle + 'official trailer')}&maxResults=1&key=${apiKey}`;

  try {
    var response = await fetch(apiUrl);
    var data = await response.json();
    if (data.items && data.items.length > 0) {
      var videoId = data.items[0].id.videoId;
      showTrailer(videoId);
    } else {
      console.log('Trailer not found');
    }
  } catch (error) {
    console.log('Error fetching trailer data:', error);
  }
}