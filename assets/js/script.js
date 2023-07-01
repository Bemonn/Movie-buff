var searchInput = document.getElementById('searchInput');
var searchFormEl = document.getElementById('search-form');
var movieInfo = document.getElementById('movieInfo');
var trailerContainer = document.getElementById('trailerContainer');

var formSubmitHandler = function (event) {
  event.preventDefault();

  var movieName = searchInput.value.trim();
  console.log(movieName)

  if (movieName) {
      getMovieApi(movieName);
      searchInput.value = '';
  } else {
      $('#errorModal').foundation('open');
  }
}

function getMovieApi(title) {
    var requestMovieUrl = 'http://www.omdbapi.com/?t=' + title + '&apikey=2bd63a1d'

    fetch(requestMovieUrl)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        //modal if movie doesn't exist 
        if (data.Error) {
            $('#inccorectInputModal').foundation('open');
            return
        } else {
        console.log(data);
        //variable to dislay the movie info
        var movieTitle = data.Title
        var movieDate = data.Released
        var movieRating = data.Rated
        var movieRunTime = data.Runtime
        var moviePlot = data.Plot
        var moviePoster = data.Poster

        renderMovieInfo(movieTitle, movieDate, movieRating, movieRunTime, moviePlot, moviePoster)
        
        fetchTrailer(data.Title); // Call fetchTrailer function here.
    }
    })
}

searchFormEl.addEventListener('submit', formSubmitHandler);

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

// render movie information. Title, date, rating, runtime, description & Poster 
// description added as a card
function renderMovieInfo(title, date, rating, runtime, moviePlot, poster) {
    
    //tried clearing the div first, but doesn't render the content 
    // movieInfo = ''

    var titleEl = document.createElement('h2')
    titleEl.innerHTML = title 
    movieInfo.append(titleEl)

    var movieDetailsEl = document.createElement('p')
    movieDetailsEl.innerHTML = date + ", " + rating + ", " + runtime;
    titleEl.append(movieDetailsEl)

    var movieDesciptionCard = document.createElement('div')

    var movieDescriptionBody = document.createElement('div')

    movieDesciptionCard.append(movieDescriptionBody)

    var descriptionTitle = document.createElement('h3')
    descriptionTitle.textContent = "Movie Description"

    var descriptionContentEl = document.createElement('p')
    descriptionContentEl.innerHTML = moviePlot

    movieDescriptionBody.append(descriptionContentEl)

    movieDetailsEl.append(movieDesciptionCard)

    var moviePosterEl = document.createElement('img')

    moviePosterEl.setAttribute('src', poster)

    trailerContainer.appendChild(moviePosterEl)

}



//Initialises Foundation (should be at the end of any other JavaScript code)
$(document).foundation();