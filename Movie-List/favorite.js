const base_url = "https://webdev.alphacamp.io/";
const index_url = base_url + "api/movies/";
const poster_url = base_url + "posters/";

const movies = JSON.parse(localStorage.getItem("favoriteMovies"));

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");

function renderMovieList(data) {
  let rawHTML = "";

  //Processing
  data.forEach(item => {
    rawHTML += `<div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                src="${poster_url + item.image}"
                class="card-img-top"
                alt="Movie Poster"
              />
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button
                  class="btn btn-primary btn-show-movie"
                  data-bs-toggle="modal"
                  data-bs-target="#movie-modal"
                  data-id=${item.id}
                >
                  More
                </button>

                <button class="btn btn-danger btn-remove-favorite" data-id=${item.id}>X</button>
              </div>
            </div>
          </div>
        </div>`;
  });

  dataPanel.innerHTML = rawHTML;
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#modal-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");
  axios.get(index_url + id).then(response => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalImage.innerHTML = `<img src="${poster_url +
      data.image}" alt="movie-poster" class="img-fluid">`;
    modalDescription.innerText = data.description;
  });
}

function removeFromFavorite(id) {
  const movieIndex = movies.findIndex(movie => movie.id === id);
  movies.splice(movieIndex, 1);
  localStorage.setItem("favoriteMovies", JSON.stringify(movies));
  renderMovieList(movies);
}

dataPanel.addEventListener("click", function onClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id));
  }
});

renderMovieList(movies);