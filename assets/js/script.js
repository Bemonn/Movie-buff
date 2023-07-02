var searchInput = document.getElementById('searchInput');
var searchFormEl = document.getElementById('search-form');
var movieInfo = document.getElementById('movieInfo');
var trailerContainer = document.getElementById('trailerContainer');
var movieCastEl = document.getElementById('cast-list')

var formSubmitHandler = function (event) {
  event.preventDefault();

  var movieName = searchInput.value.trim();
  console.log(movieName)

  if (movieName) {
    clearMovieInfo(); // clears previous movie info
      getMovieApi(movieName);
      searchInput.value = '';
  } else {
      $('#errorModal').foundation('open');
  }
};

function clearMovieInfo() {
    movieInfo.innerHTML = '';
    trailerContainer.innerHTML = '';
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
        
        //Get actors name and split them to create array
        var movieActors = data.Actors
        console.log(movieActors)
        var cast = movieActors.split(',')
        console.log(cast)

        // Wiki API to get Actors img
        // for loop to run through the number of actors. Get their img source and thier name as per the new API
        for (var i = 0; i < cast.length; i++) { 
            var movieCastUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + cast[i]

            fetch(movieCastUrl)
            .then(function (response) {
                if (!response.ok) {
                    return;
                }
                return response.json();
            })
            .then(function (dataCast) {
                console.log(dataCast)
                var imageSource = dataCast.thumbnail.source
                var nameOfActor = dataCast.title
                console.log(nameOfActor)
                renderActorImage(imageSource, nameOfActor)

            })

        }

        renderMovieInfo(movieTitle, movieDate, movieRating, movieRunTime, moviePlot, moviePoster);
        
        fetchTrailer(data.Title); // Call fetchTrailer function here.
    }
    })
}

searchFormEl.addEventListener('submit', formSubmitHandler);

// Using fetch method to request trailer from youtube using API key
function fetchTrailer(movieTitle) {
    var apiKey = 'AIzaSyBLYYwlY0FawpIOHpAwRfHhh9nUa-xpIXc';
    var apiUrl = 'https://www.googleapis.com/youtube/v3/search?part=snippet' +
      '&q=' + encodeURIComponent(movieTitle + ' official trailer') +
      '&maxResults=1' +
      '&key=' + apiKey;
  
    fetch(apiUrl)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Error fetching trailer data: ' + response.status);
        }
        return response.json();
      })
      .then(function(data) {
        if (data.items && data.items.length > 0) {
          var videoId = data.items[0].id.videoId;
          showTrailer(videoId);
        } else {
          console.error('Trailer not found');
        }
      })
      .catch(function(error) {
        console.error('Error fetching trailer data:', error);
      });
  }

  // Display movie trailer, using iframe to embed content from youtube
  function showTrailer(videoId) {
    var trailerContainer = document.getElementById('trailerContainer');
    trailerContainer.innerHTML = `<iframe width='560' height='315' src='https://youtube.com/embed/${videoId}' frameborder='0' allowfullscreen></iframe>`;
  }


// render movie information. Title, date, rating, runtime, description & Poster 
// description added as a card
function renderMovieInfo(title, date, rating, runtime, moviePlot, poster) {
    
    //tried clearing the div first, but doesn't render the content 
    // movieInfo = ''

   var moviePosterEl = document.createElement('img');
    moviePosterEl.setAttribute('src', poster);
    movieInfo.append(moviePosterEl);

    var titleEl = document.createElement('h2')
    titleEl.innerHTML = title 
    movieInfo.appendChild(titleEl);

    var movieDetailsEl = document.createElement('p');
    movieDetailsEl.innerHTML = date + ", " + rating + ", " + runtime;
    titleEl.append(movieDetailsEl);

    var movieDesciptionCard = document.createElement('div');

    var movieDescriptionBody = document.createElement('div');
    
    movieDesciptionCard.append(movieDescriptionBody);

    var descriptionTitle = document.createElement('h3');
    descriptionTitle.textContent = 'Movie Description';

    var descriptionContentEl = document.createElement('p');
    descriptionContentEl.innerHTML = moviePlot;
    
    movieDescriptionBody.append(descriptionContentEl);

    movieDetailsEl.append(movieDesciptionCard);

}

//Function to render actors names and thumbnails 
function renderActorImage(thumbnail, nameOfActor) {
    var actorImageCard = document.createElement('div');

    var actorImgBody = document.createElement('div');

    actorImageCard.append(actorImgBody);

    var actorsImage = document.createElement('img');
    actorsImage.setAttribute('src', thumbnail)
    
    var actorsName = document.createElement('h2')
    actorsName.textContent = nameOfActor 

    actorImgBody.append(actorsImage, actorsName)

    movieCastEl.append(actorImageCard)
}

//Initialises Foundation (should be at the end of any other JavaScript code)
$(document).foundation();