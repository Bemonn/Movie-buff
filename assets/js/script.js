
// Function to display movie trailer, using iframe to embed content from youtube
function showTrailer(videoId) {
  var trailerContainer = document.getElementById('trailerContainer');
  trailerContainer.innerHTML = `<iframe width='560' height='315' src='https://youtube.com/embed/${videoId}' frameborder='0' allowfullscreen></iframe>`;
}