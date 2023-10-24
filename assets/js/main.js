const BASE_URL = 'http://localhost:8000/api/v1/titles/';

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

  console.log('MOVIES DATA', moviesData);

  return moviesData;
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
      document.getElementById('movieDetailsGenres').innerHTML = data['genres'];
      document.getElementById('movieDetailsImdb').innerHTML = data['imdb_score'] + ' / 10';

      document.getElementById('movieDetailsDirectors').innerHTML = data['directors'].join(', ');
      document.getElementById('movieDetailsCast').innerHTML = data['actors'].join(', ');
      document.getElementById('movieDetailsCountry').innerHTML = data['countries'].join(', ');
      document.getElementById('movieDetailsReleaseDate').innerHTML = data['date_published'];

      let movieDetailsRating = document.getElementById('movieDetailsRating');
      if (typeof data['rated'] === 'string' || data['rated'] instanceof String) {
        movieDetailsRating.innerHTML = data['rated'];
      } else {
        movieDetailsRating.innerHTML = data['rated'] + '+';
      }

      let movieDetailsBoxOffice = document.getElementById('movieDetailsBoxOffice');
      if (data['worldwide_gross_income'] == null) {
        movieDetailsBoxOffice.innerHTML = 'N/A';
      } else {
        movieDetailsBoxOffice.innerHTML = data['worldwide_gross_income'] + ' ' + data['budget_currency'];
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
    fetchMoviesByGenre('Sport');
    fetchMoviesByGenre('Sport');
    fetchMoviesByGenre('Sport');
  });
}

main();
