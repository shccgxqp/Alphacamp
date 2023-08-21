const base_url = "https://webdev.alphacamp.io/";
const index_url = base_url + "api/movies/";
const poster_url = base_url + "posters/";
const MOVIES_PER_PAGE = 12;
let nowPage = 1;

const movies = [];
let filteredMovies = [];

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const modelDiv = document.querySelector(".modelDiv");

const web_State = {
  list: "list",
  cards: "cards"
};

const view = {
  MOVIES_PER_PAGE: 12,
  //生成卡片
  renderMovieList(data) {
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
                  data-id=${item.id}>
                  More
                </button>
                <button class="btn btn-info btn-add-favorite" data-id=${item.id}>+</button>
              </div>
            </div>
          </div>
        </div>`;
    });

    dataPanel.innerHTML = rawHTML;
  },

  renderMovieRowList(data) {
    console.log(data);
    let rawHTML = "";
    //Processing
    rawHTML += `<ul class="list-group">`;
    data.map(movie => {
      rawHTML += `
      <div class="list-row">
        <ul class="list-group-item">
          <div class="list-title">${movie.title}</div>
          <div class="buttons">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${movie.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id=${movie.id}>+</button>
          </div>
        </ul>
      </div>
      `;
    });
    rawHTML += `</ul>`;

    dataPanel.innerHTML = rawHTML;
  },

  //生成頁數
  renderPaginator() {
    const data = filteredMovies.length ? filteredMovies : movies;
    //計算總頁數
    const numberOfPages = Math.ceil(data.length / MOVIES_PER_PAGE);
    //製作 template
    let rawHTML = "";

    for (let page = 1; page <= numberOfPages; page++) {
      rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
    }
    //放回 HTML
    paginator.innerHTML = rawHTML;
  },

  //生成More
  showMovieModal(id) {
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
};

const modal = {
  //計算頁數
  getMoviesByPage(page) {
    const data = filteredMovies.length ? filteredMovies : movies;
    const startIndex = (page - 1) * MOVIES_PER_PAGE;
    return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
  },

  //收藏電影
  addToFavorite(id) {
    const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
    const movie = movies.find(movie => movie.id === id);
    if (list.some(movie => movie.id === id)) {
      return alert("以收藏此電影");
    }

    list.push(movie);

    localStorage.setItem("favoriteMovies", JSON.stringify(list));
  }
};

const controller = {
  currentState: web_State.cards,

  modeResponse() {
    axios
      .get(index_url)
      .then(response => {
        movies.push(...response.data.results);
        this.modeCheck();
      })
      .catch(err => console.log(err));
  },

  modeCheck() {
    switch (this.currentState) {
      case "cards":
        view.renderPaginator();
        view.renderMovieList(modal.getMoviesByPage(nowPage));
        break;

      case "list":
        view.renderPaginator();
        view.renderMovieRowList(modal.getMoviesByPage(nowPage));
        break;
      // console.log(movies)
    }
  }
};

modelDiv.addEventListener("click", function onModelClick(event) {
  if (event.target.matches(".fa-th")) {
    controller.currentState = web_State.cards;
  } else if (event.target.matches(".fa-bars")) {
    controller.currentState = web_State.list;
  }
  controller.modeCheck();
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== "A") return;

  //透過 dataset 取得被點擊的頁數
  nowPage = Number(event.target.dataset.page);
  //更新畫面

  if (controller.currentState === "cards") {
    view.renderMovieList(modal.getMoviesByPage(nowPage));
  } else if (controller.currentState === "list") {
    view.renderMovieRowList(modal.getMoviesByPage(nowPage));
  }
});

dataPanel.addEventListener("click", function onClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    view.showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    modal.addToFavorite(Number(event.target.dataset.id));
  }
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(keyword)
  );
  //錯誤處理：無符合條件的結果
  if (!filteredMovies.length) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  controller.modeCheck();
});

controller.modeResponse();
