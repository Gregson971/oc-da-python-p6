const BASE_URL = 'http://localhost:8000/api/v1/titles/';
const playIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="ltr-4z3qvp e1svuwfo1" data-name="Play" aria-hidden="true">
                    <path d="M5 2.69127C5 1.93067 5.81547 1.44851 6.48192 1.81506L23.4069 11.1238C24.0977 11.5037 24.0977 12.4963 23.4069 12.8762L6.48192 22.1849C5.81546 22.5515 5 22.0693 5 21.3087V2.69127Z" fill="currentColor"></path>
                  </svg>`;
const infoIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="ltr-4z3qvp e1svuwfo1" data-name="CircleI" aria-hidden="true">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12ZM13 10V18H11V10H13ZM12 8.5C12.8284 8.5 13.5 7.82843 13.5 7C13.5 6.17157 12.8284 5.5 12 5.5C11.1716 5.5 10.5 6.17157 10.5 7C10.5 7.82843 11.1716 8.5 12 8.5Z" fill="currentColor"></path>
                  </svg>`;

// Get the best movie
function fetchBestMovie() {
  const loader = document.getElementById('loader');
  loader.style.display = 'block';

  let bestMovieTitle = document.getElementsByClassName('best_movie')[0].getElementsByClassName('title')[0];
  let bestMovieImg = document.getElementsByClassName('best_movie')[0].getElementsByClassName('cover')[0];
  let bestMovieDesc = document.getElementsByClassName('best_movie')[0].getElementsByClassName('description')[0];
  let bestMovieButton = document.getElementsByClassName('best_movie')[0].getElementsByClassName('button')[1];

  fetch(BASE_URL + '?sort_by=-imdb_score')
    .then((response) => response.json())
    .then((data) => {
      fetch(data['results'][0]['url'])
        .then((response) => response.json())
        .then((data) => {
          loader.style.display = 'none';
          bestMovieTitle.innerHTML = data['title'];
          bestMovieDesc.innerHTML = data['description'];
          bestMovieImg.src = data['image_url'];
          bestMovieButton.setAttribute('onclick', `openModal("${data['id']}")`);
        });
    })
    .catch(function (err) {
      loader.style.display = 'none';
      console.log('ERROR in fetchBestMovie() function', err);
    });
}

// Get movies by genre - 7 in total
async function fetchMoviesByGenre(categoryName) {
  const totalMovies = 7;
  const itemsPerFetch = 5;
  let moviesData = [];

  try {
    const initialResponse = await fetch(BASE_URL + '?genre=' + categoryName + '&sort_by=-imdb_score');
    const initialData = await initialResponse.json();

    if (initialData.count === 0) {
      return moviesData;
    }

    for (let i = 0; i < Math.min(totalMovies, initialData.results.length); i++) {
      const movieUrl = initialData.results[i].url;
      const movieResponse = await fetch(movieUrl);
      const movieInfo = await movieResponse.json();
      moviesData.push(movieInfo);
    }

    if (totalMovies > itemsPerFetch && initialData.next) {
      const nextPageResponse = await fetch(initialData.next);
      const nextPageData = await nextPageResponse.json();

      for (let i = 0; i < Math.min(totalMovies - itemsPerFetch, nextPageData.results.length); i++) {
        const movieUrl = nextPageData.results[i].url;
        const movieResponse = await fetch(movieUrl);
        const movieInfo = await movieResponse.json();
        moviesData.push(movieInfo);
      }
    }
  } catch (error) {
    console.log('ERROR in fetchMoviesByGenre() function', error);
  }

  return moviesData;
}

// Build carousel
async function buildCarousel(name) {
  let categoryName = name === 'Best' ? '' : name;

  const section = document.createElement('section');
  section.classList.add('categories');

  const carousel = document.createElement('div');
  carousel.classList.add('wrapper');

  const categoryTitle = document.createElement('h2');
  categoryTitle.innerHTML = `${name} movies`;
  carousel.append(categoryTitle);

  const carouselContainer = document.createElement('div');
  carouselContainer.classList.add('carousel-container');

  const carouselContent = document.createElement('div');
  carouselContent.classList.add('carousel-content');
  carouselContent.setAttribute('id', `${name}-movies`);

  document.querySelector('.carousels').appendChild(section);

  const movies = await fetchMoviesByGenre(categoryName);

  movies.forEach((movie, index) => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movieCard');
    movieCard.setAttribute('id', `${name}${index + 1}`);

    const movieCover = document.createElement('img');
    movieCover.setAttribute('alt', movie.title);
    movieCover.src = movie.image_url;
    movieCard.appendChild(movieCover);

    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    const movieTitle = document.createElement('p');
    movieTitle.innerHTML = movie.title;
    overlay.appendChild(movieTitle);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
    overlay.appendChild(buttonContainer);

    const playButton = document.createElement('button');
    playButton.classList.add('overlay-button');
    playButton.innerHTML = `${playIcon} Play`;
    buttonContainer.appendChild(playButton);

    const modalButton = document.createElement('button');
    modalButton.classList.add('overlay-button');
    modalButton.setAttribute('onclick', `openModal("${movie.id}")`);
    modalButton.innerHTML = `${infoIcon} More info`;
    buttonContainer.appendChild(modalButton);

    movieCard.appendChild(overlay);
    carouselContent.appendChild(movieCard);
  });

  const controls = document.createElement('div');
  controls.classList.add('controls');

  const createButton = (className, ariaLabel, id, onclick, innerHTML) => {
    const button = document.createElement('button');
    button.classList.add('nav-btn');
    button.classList.add(className);
    button.setAttribute('aria-label', ariaLabel);
    button.setAttribute('id', id);
    button.setAttribute('onclick', onclick);
    button.innerHTML = innerHTML;
    return button;
  };

  const leftButton = createButton('left', `${name} slide left`, `${name}-left`, `moveCarouselRight("${name}")`, '‹');
  const rightButton = createButton('right', `${name} slide right`, `${name}-right`, `moveCarouselLeft("${name}")`, '›');

  rightButton.classList.add('show');

  controls.appendChild(leftButton);
  controls.appendChild(rightButton);

  carouselContainer.appendChild(carouselContent);
  carouselContainer.appendChild(controls);

  carousel.appendChild(carouselContainer);
  section.appendChild(carousel);
}

// Carousel controls

function moveCarouselLeft(category) {
  let carrouselContent = document.querySelector('#' + category + '-movies');
  let carrouselLeftBtn = document.querySelector('#' + category + '-left');
  let carrouselRightBtn = document.querySelector('#' + category + '-right');

  carrouselContent.style.left = '-680px';
  carrouselRightBtn.classList.remove('show');
  carrouselLeftBtn.classList.add('show');
}

function moveCarouselRight(category) {
  let carrouselContent = document.querySelector('#' + category + '-movies');
  let carrouselLeftBtn = document.querySelector('#' + category + '-left');
  let carrouselRightBtn = document.querySelector('#' + category + '-right');

  carrouselContent.style.left = '0px';
  carrouselRightBtn.classList.add('show');
  carrouselLeftBtn.classList.remove('show');
}

// Open the modal
function openModal(id) {
  let modal = document.getElementById('movieDetailsModal');
  let close = document.getElementsByClassName('modal__close-btn')[0];

  fetchModalData(id);

  modal.style.display = 'block';

  close.onclick = function () {
    modal.style.display = 'none';
  };

  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}

// Fetch the modal data
function fetchModalData(id) {
  fetch(BASE_URL + id)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('movieDetailsCover').src = data['image_url'];
      document.getElementById('movieDetailsTitle').innerHTML = data['title'];

      document.getElementById('movieDetailsYear').innerHTML = data['year'];
      document.getElementById('movieDetailsDuration').innerHTML = data['duration'] + ' min';
      document.getElementById('movieDetailsGenres').innerHTML = data['genres'].join(', ');
      document.getElementById('movieDetailsImdb').innerHTML = data['imdb_score'] + ' / 10';

      document.getElementById('movieDetailsDirectors').innerHTML = data['directors'].join(', ');
      document.getElementById('movieDetailsCast').innerHTML = data['actors'].join(', ');
      document.getElementById('movieDetailsCountry').innerHTML = data['countries'].join(', ');
      document.getElementById('movieDetailsReleaseDate').innerHTML = data['date_published'];
      document.getElementById('movieDetailsRating').innerHTML = data['rated'];

      let movieDetailsBoxOffice = document.getElementById('movieDetailsBoxOffice');
      let currency = data['budget_currency'] ? data['budget_currency'] : 'USD';
      if (data['worldwide_gross_income'] == null) {
        movieDetailsBoxOffice.innerHTML = 'N/A';
      } else {
        const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(data['worldwide_gross_income']);
        movieDetailsBoxOffice.innerHTML = amount;
      }

      let movieDetailsDescription = document.getElementById('movieDetailsDescription');
      let regExp = /[a-zA-Z]/g;
      if (regExp.test(data['long_description'])) {
        movieDetailsDescription.innerHTML = data['long_description'];
      } else {
        movieDetailsDescription.innerHTML = 'N/A';
      }
    })
    .catch(function (err) {
      console.log('ERROR in fetchModalData() function', err);
    });
}

function main() {
  window.addEventListener('load', () => {
    fetchBestMovie();
    buildCarousel('Best');
    buildCarousel('Sci-Fi');
    buildCarousel('Thriller');
    buildCarousel('Horror');
  });
}

main();
