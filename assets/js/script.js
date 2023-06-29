var movieInfo = document.getElementById('movieInfo');
var trailerContainer = document.getElementById('trailerContainer');

// Append movie information to the container
movieContainer.appendChild(movieTitle);
movieContainer.appendChild(moviePremise);
movieContainer.appendChild(movieCast);
movieContainer.appendChild(movieImages);

// Append movie container to the main section
movieInfo.appendChild(movieContainer);

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

// Function to display movie trailer, using iframe to embed content from youtube
function showTrailer(videoId) {
  var trailerContainer = document.getElementById('trailerContainer');
  trailerContainer.innerHTML = `<iframe width='560' height='315' src='https://youtube.com/embed/${videoId}' frameborder='0' allowfullscreen></iframe>`;
}