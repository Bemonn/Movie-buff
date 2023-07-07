// Variables to link HTML
var searchInput = document.getElementById('searchInput');
var searchFormEl = document.getElementById('search-form');
var movieInfo = document.getElementById('movieInfo');
var trailerContainer = document.getElementById('trailerContainer');
var movieCastEl = document.getElementById('cast-list');

//Function is run when page loads to clear previously rendered inputs
function init() {
  clearMovieInfo()
}

init ()

// function to handle the form 
var formSubmitHandler = function (event) {
  event.preventDefault(); //prevent default clearing of form

  //movie name is retrieved from the form input 
  var movieName = searchInput.value.trim();
  console.log(movieName);

  //condition if statment to check an input was included
  // if movie name is included. The OMDb API is called and search input is cleared
  // else, An error modal is displayed informing the user to add an input 
  if (movieName) {
    clearMovieInfo(); // clears previous movie info

    getMovieApi(movieName);
    searchInput.value = '';
  } else {
    $('#errorModal').foundation('open');
  }
};

// function to clear contents of page 
function clearMovieInfo() {
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

// function to get movie information. Using OMDb API
function getMovieApi(title) {
  //input from form used to suppllement the URL
  var requestMovieUrl = 'https://www.omdbapi.com/?t=' + title + '&apikey=2bd63a1d';

  fetch(requestMovieUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (data.Error) {
        //error checking. If an error, a modal is opened 
        $('#inccorectInputModal').foundation('open');
        return;
      } else {
        console.log(data);
        // variables extrtacted from data using DOM
        var movieTitle = data.Title;
        var movieDate = data.Released;
        var movieRating = data.Rated;
        var movieRunTime = data.Runtime;
        var moviePlot = data.Plot;
        var moviePoster = data.Poster;
        // Cast is extract and converted to an array 
        var movieActors = data.Actors;
        console.log(movieActors);
        var cast = movieActors.split(',');
        console.log(cast);
        // .map method is used to populate a new array with the results of a function that calls the Wiki API for each input
        var castPromises = cast.map(function (actor) {
          var movieCastUrl = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + actor;

          return fetch(movieCastUrl)
            .then(function (response) { 
                if (!response.ok) {
                  return; // if an error when calling the API the code stops 
                }
              return response.json();
            });
        });

        Promise.all(castPromises) // promise.all for the new array ensure that all the a single promise is returned 
          .then(function (castData) {
            // array of cast information retrieved 
            //.map method used to populate a new object with the name of the actor and the image source
            // .map method does this for each cast member 
            var castImages = castData.map(function (dataCast) {
              console.log(dataCast);

              //conditional "if" statement. If the actor has no image src. A placeholder is used instead of casuing an error with rendering
              if (!dataCast.thumbnail) {
                var imageSource = 'http://placehold.it/200'; // placeholder location
                var nameOfActor = dataCast.title // the actor's name is still extracted from the data 

                return {
                  imageSource: imageSource,
                  nameOfActor: nameOfActor,
                  
                }
              }
              // Thumbnail image src saved with actor's name in a object 
              if (dataCast.thumbnail.source) {
               
                var imageSource = dataCast.thumbnail.source; //img location saved as variable 
                var nameOfActor = dataCast.title; //actor's name 
                console.log(nameOfActor);
                
                return {
                  imageSource: imageSource,
                  nameOfActor: nameOfActor,
                  
                } ;
              }
            });
            //using the new object created by the .map methodm the rendering function is called 
            renderActorImages(castImages);
          })

          .catch(function (error) {
            //errors with fetching API to be console logged 
            console.error('Error fetching cast data:', error);
            // clearing function called to empty anything that was rendered up to the error 
            clearMovieInfo()
            // local storage emptied
            localStorage.removeItem("movieData")
            // modal to pop up informing the user that no cast was found 
            $('#noCast').foundation('open')
          });

        // Function to render the movie information is called. Inputs from OMDb API
        renderMovieInfo(movieTitle, movieDate, movieRating, movieRunTime, moviePlot, moviePoster);
        
        // using the movie title from the OMDb data, the YouTube API is called 
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

// Function for fetching the trailer 
function fetchTrailer(movieTitle) {
  var apiKey = 'AIzaSyBLYYwlY0FawpIOHpAwRfHhh9nUa-xpIXc';
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
        // If response is not Ok, "trailer not found" is rendered 
        var errorEl = document.createElement('h1') // new h1 created for error message 
        errorEl.classList.add('no-trailer')
        movieInfo.append(errorEl)
        errorEl.textContent = 'Trailer not found'
        
        // Error with status is console logged
        throw new Error('Error fetching trailer data: ' + response.status);
        
      }
      return response.json();
    })
    .then(function (data) {
      console.log(data)
      // Conditional statement used to check there is data received from fetch call 
      if (data.items && data.items.length > 0) {
        var videoId = data.items[0].id.videoId; // Using DOM, the movie's video ID is saved as a variable 
        console.log(videoId)
        showTrailer(videoId); // function to render the trailer called with the movie's unique videoID 

        var movieData = getMovieData();
        movieData.videoId = videoId;
        saveMovieData(movieData);
      } else {
        console.error('Trailer not found'); // console error if error occurs 
      }
    })
    .catch(function (error) {
      // catch errors. Console log error information
      console.error('Error fetching trailer data:', error);
    });
}


// Function to render the movie information into the modal 
function renderMovieInfo(title, date, rating, runtime, moviePlot, poster) {
    
    // modal revealed when function is run
    var modal = new Foundation.Reveal($('#movieInfoModal'));

    var moviePosterEl = document.createElement('img'); // imgage element created for poster 
    moviePosterEl.innerHTML = '' //element first cleared to ensure no previous poster is displayed 
    moviePosterEl.setAttribute('src', poster); // location of poster set 

    var titleEl = document.createElement('h2') // h2 element created to display Movie Title 
    titleEl.innerHTML = title //Title from OMDb API 

    var movieDetailsEl = document.createElement('p'); // p element created to display the Date, Rating and Runtime of movie 
    movieDetailsEl.innerHTML = date + ", " + rating + ", " + runtime; //date + rating + runtime from OMDb API

    titleEl.append(movieDetailsEl); //Append the Date + rating + runtime below the movie title 

    var descriptionContentEl = document.createElement('p'); // p element created to display the movie plot 
    descriptionContentEl.innerHTML = moviePlot; // plot from OMDb API 
  
    //Append movie information to ensure it is displayed 
    movieInfo.append(titleEl, moviePosterEl, titleEl, descriptionContentEl); 

    modal.open(); //opens modal
}

// function to render trailer into web page 
function showTrailer(videoId) {
  // innerHTML used to embed trailer. Video ID used to get the correct location of the trailer 
  trailerContainer.innerHTML = `<iframe width='560' height='315' src='https://youtube.com/embed/${videoId}' frameborder='0' allowfullscreen></iframe>`;
}

// Function to render the Thumbnails of the cast 
function renderActorImages(castImages) {
  //.forEach to iterate through the number of cast memebers 
  castImages.forEach(function (castImage) {
    // divs created to format the images with foundation grid 
    var actorImageCard = document.createElement('div');
    actorImageCard.classList.add('column')
    var actorImgBody = document.createElement('div');

    //append divs in the correct order as per foundation grid requirements
    actorImageCard.append(actorImgBody);

    var actorsImage = document.createElement('img'); //img element created for images
    actorsImage.setAttribute('src', castImage.imageSource); //location of thumbnails from castImages Object. Object contains the image src and actors name 
    actorsImage.classList.add('img-height') // CSS styling to get images the same size

    var actorsName = document.createElement('h2'); // h2 element created to display actor's names 
    actorsName.classList.add('actors-names') // CSS styling added 
    actorsName.textContent = castImage.nameOfActor; // Name of actors from castImages Object

    actorImgBody.append(actorsImage, actorsName); // Append in the correct order 

    movieCastEl.append(actorImageCard); // append to ensure the images and names are displayed
  });
}


// event listener for when the page loads 
window.addEventListener('load', function () {
  var savedMovieData = getMovieData(); // gets local storage 

  //If there is data saved in local storage. run the rendering functions with the associated inputs
  if (savedMovieData) {
    renderMovieInfo( // Renders the movie information
      savedMovieData.movieTitle,
      savedMovieData.movieDate,
      savedMovieData.movieRating,
      savedMovieData.movieRunTime,
      savedMovieData.moviePlot,
      savedMovieData.moviePoster
    );
    renderCastImgLocalStorage(savedMovieData.cast); //Renders the cast images 
    showTrailer(savedMovieData.videoId); //Renders the trailer
  }

});

// Seperate function to render the actor images from local storage. API is required to retive the src of the image  
function renderCastImgLocalStorage(actorImg) { 

  // .map method is used to populate a new array with the results of a function that calls the Wiki API for each input
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

  Promise.all(castPromises) // promise.all for the new array ensure that all the a single promise is returned 
    // array of cast information retrieved 
    //.map method used to populate a new object with the name of the actor and the image source
    // .map method does this for each cast member 
    .then(function (castData) {
      var castImages = castData.map(function (dataCast) {
        console.log(dataCast);
        
         //conditional "if" statement. If the actor has no image src. A placeholder is used instead of casuing an error with rendering
        if (!dataCast.thumbnail) {
          var imageSource = 'http://placehold.it/200'; //Placeholder image
          var nameOfActor = dataCast.title

          return {
            imageSource: imageSource,
            nameOfActor: nameOfActor,
          }
        }

         // Thumbnail image src saved with actor's name in a object 
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
      renderActorImages(castImages); //function called to render images of actors 
    })
    .catch(function (error) {
      console.error('Error fetching cast data:', error); //console to catch any errors 
    });

}

// event listener on form
searchFormEl.addEventListener('submit', formSubmitHandler);

//link foundation CSS
$(document).foundation();