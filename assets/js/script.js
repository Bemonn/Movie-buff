var searchInput = document.getElementById('searchInput');
var searchFormEl = document.getElementById('search-form');
var movieInfo = document.getElementById('movieInfo');
var trailerContainer = document.getElementById('trailerContainer');
var movieCastEl = document.getElementById('cast-list');

function init() {
  clearMovieInfo()
  // localStorage.removeItem("movieData")
}

init ()

var formSubmitHandler = function (event) {
  event.preventDefault();

  var movieName = searchInput.value.trim();
  console.log(movieName);

  if (movieName) {
    clearMovieInfo(); // clears previous movie info

    getMovieApi(movieName);
    searchInput.value = '';
  } else {
    $('#errorModal').foundation('open');
  }
};

function clearMovieInfo() {
  // $('#modalContent').empty
  movieInfo.innerHTML = '';
  trailerContainer.innerHTML = '';
  movieCastEl.innerHTML = ''; // Clear the cast list
}

// Function to save movie data in local storage
function saveMovieData(movieData) {
  localStorage.setItem('movieData', JSON.stringify(movieData));
}

// Function to retrieve movie data from local storage
function getMovieData() {
  var movieData = localStorage.getItem('movieData');
  return movieData ? JSON.parse(movieData) : null;
}

function getMovieApi(title) {
  var requestMovieUrl = 'http://www.omdbapi.com/?t=' + title + '&apikey=2bd63a1d';

  fetch(requestMovieUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.Error) {
        $('#inccorectInputModal').foundation('open');
        return;
      } else {
        console.log(data);

        var movieTitle = data.Title;
        var movieDate = data.Released;
        var movieRating = data.Rated;
        var movieRunTime = data.Runtime;
        var moviePlot = data.Plot;
        var moviePoster = data.Poster;

        var movieActors = data.Actors;
        console.log(movieActors);
        var cast = movieActors.split(',');
        console.log(cast);

        var castPromises = cast.map(function (actor) {
          var movieCastUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + actor;

          return fetch(movieCastUrl)
            .then(function (response) {
              if (!response.ok) {
                console.log("'Error fetching cast data:', error")
                return;
              }
              return response.json();
            });
        });

        Promise.all(castPromises)
          .then(function (castData) {
            var castImages = castData.map(function (dataCast) {
              console.log(dataCast);
              if (dataCast) {
                var imageSource = dataCast.thumbnail.source;
                var nameOfActor = dataCast.title;
                console.log(nameOfActor);
                return {
                  imageSource: imageSource,
                  nameOfActor: nameOfActor,
                };
              }
            });
            renderActorImages(castImages);
          })
          .catch(function (error) {
            console.error('Error fetching cast data:', error);
            clearMovieInfo()
            localStorage.removeItem("movieData")
            $('#inccorectInputModal').foundation('open')
          });

          //add empty method ####
        // $('#movieInfo').empty()
        renderMovieInfo(movieTitle, movieDate, movieRating, movieRunTime, moviePlot, moviePoster);
        

        fetchTrailer(data.Title);
        
        // Save movie data in local storage
        var movieData = {
          movieTitle: movieTitle,
          movieDate: movieDate,
          movieRating: movieRating,
          movieRunTime: movieRunTime,
          moviePlot: moviePlot,
          moviePoster: moviePoster,
          cast: cast,
        };
        saveMovieData(movieData);
      }
    });
}

function fetchTrailer(movieTitle) {
  var apiKey = 'AIzaSyDA9YYhJjULBoucsmFpmakO9g9PbIXzulQ';
  var apiUrl =
    'https://www.googleapis.com/youtube/v3/search?part=snippet' +
    '&q=' +
    
    encodeURIComponent(movieTitle + ' official trailer') +
    '&maxResults=1' +
    '&key=' +
    apiKey;

  fetch(apiUrl)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Error fetching trailer data: ' + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      console.log(data)
      if (data.items && data.items.length > 0) {
        var videoId = data.items[0].id.videoId;
        console.log(videoId)
        showTrailer(videoId);

        var movieData = getMovieData();
        movieData.videoId = videoId;
        saveMovieData(movieData);
      } else {
        console.error('Trailer not found');
      }
    })
    .catch(function (error) {
      console.error('Error fetching trailer data:', error);
    });
}



function renderMovieInfo(title, date, rating, runtime, moviePlot, poster) {
    // Create a new Foundation modal
    
    var modal = new Foundation.Reveal($('#movieInfoModal'));

    var moviePosterEl = document.createElement('img');
    moviePosterEl.innerHTML = ''
    moviePosterEl.setAttribute('src', poster);

    var titleEl = document.createElement('h2')
    titleEl.innerHTML = title 

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
  
    movieInfo.append(moviePosterEl, titleEl, descriptionContentEl);

    // $('#movieInfoModal .modal-content').empty().append(moviePosterEl, titleEl, movieDetailsEl);

    modal.open();
}

function showTrailer(videoId) {
  movieInfo.append(trailerContainer);
  trailerContainer.innerHTML = `<iframe width='560' height='315' src='https://youtube.com/embed/${videoId}' frameborder='0' allowfullscreen></iframe>`;
}

function renderActorImages(castImages) {
  castImages.forEach(function (castImage) {
    var actorImageCard = document.createElement('div');
    var actorImgBody = document.createElement('div');

    actorImageCard.append(actorImgBody);

    var actorsImage = document.createElement('img');
    actorsImage.setAttribute('src', castImage.imageSource);

    var actorsName = document.createElement('h2');
    actorsName.textContent = castImage.nameOfActor;

    actorImgBody.append(actorsImage, actorsName);

    movieCastEl.append(actorImageCard);
  });
}

window.addEventListener('load', function () {
  var savedMovieData = getMovieData();
  if (savedMovieData) {
    renderMovieInfo(
      savedMovieData.movieTitle,
      savedMovieData.movieDate,
      savedMovieData.movieRating,
      savedMovieData.movieRunTime,
      savedMovieData.moviePlot,
      savedMovieData.moviePoster
    );
    renderCastImgLocalStorage(savedMovieData.cast);
    console.log(savedMovieData.videoId)
    showTrailer(savedMovieData.videoId);
  }
});

function renderCastImgLocalStorage(actorImg) { 

  var castPromises = actorImg.map(function (actor) {
    var movieCastUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + actor;

    return fetch(movieCastUrl)
      .then(function (response) {
        if (!response.ok) {
          return;
        }
        return response.json();
      });
  });

  Promise.all(castPromises)
    .then(function (castData) {
      var castImages = castData.map(function (dataCast) {
        console.log(dataCast);
        if (dataCast) {
          var imageSource = dataCast.thumbnail.source;
          var nameOfActor = dataCast.title;
          console.log(nameOfActor);
          return {
            imageSource: imageSource,
            nameOfActor: nameOfActor,
          };
        }
      });
      renderActorImages(castImages);
    })
    .catch(function (error) {
      console.error('Error fetching cast data:', error);
    });

}




searchFormEl.addEventListener('submit', formSubmitHandler);

$(document).foundation();