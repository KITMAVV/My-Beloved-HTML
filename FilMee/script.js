const apiKey = 'YOUR_API_HERE'; // <----------------------------- API key
let currentPage = 1;
let currentTitle = '';
let totalPages = 0;
let searchType = 'movie';

$(document).ready(function() {
    loadPopularMovies();
});

$('#search-form').on('submit', function(e) {
    e.preventDefault();
    currentTitle = $('#movie-title').val();
    currentPage = 1;
    $('#top-20-text').hide();
    searchMovies(currentTitle, currentPage);
});

function loadPopularMovies() {
    $.ajax({
        url: `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&year=${new Date().getFullYear()}`,
        method: 'GET',
        success: function(data) {
            displayMovies(data, true);
        }
    });
}

function searchMovies(title, page) {
    let url;
    if (searchType === 'movie') {
        url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${title}&page=${page}`;
    } else if (searchType === 'person') {
        url = `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${title}&page=${page}`;
    }

    $.ajax({
        url: url,
        method: 'GET',
        success: function(data) {
            displayMovies(data, false);
        }
    });
}

function displayMovies(data, isPopular) {
    if (currentPage === 1) {
        $('#movies').empty();
    }
    $('#pagination').empty();
    if (data.results.length > 0) {
        if (searchType === 'movie') {
            data.results.forEach(movie => {
                const title = movie.title || movie.name;
                const year = movie.release_date ? movie.release_date.split('-')[0] : movie.first_air_date.split('-')[0];
                const overview = movie.overview ? movie.overview.split(' ').slice(0, 20).join(' ') + '...' : 'No description available';
                const mediaType = movie.media_type || 'movie';
                $('#movies').append(`
                    <div class="movie-item">
                        <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="Poster" onerror="this.onerror=null;this.src='no-image.png';" onclick="getMovieDetails('${movie.id}', '${mediaType}')">
                        <div class="movie-details">
                            <h3>${title} (${year})</h3>
                            <p>${overview}</p>
                        </div>
                    </div>
                `);
            });
            if (isPopular) {
                $('#top-20-text').text('T o p  < 2 0 >   t h i s  y e a r').show();
            }
        } else if (searchType === 'person') {
            data.results.forEach(person => {
                const name = person.name;
                const knownFor = person.known_for.map(item => item.title || item.name).join(', ');
                $('#movies').append(`
                    <div class="movie-item">
                        <img src="https://image.tmdb.org/t/p/w200${person.profile_path}" alt="Profile" onerror="this.onerror=null;this.src='no-image.png';" onclick="getPersonDetails('${person.id}')">
                        <div class="movie-details">
                            <h3>${name}</h3>
                            <p>${knownFor}</p>
                        </div>
                    </div>
                `);
            });
            if (isPopular) {
                $('#top-20-text').text('T o p  < 2 0 >   a c t o r s').show();
            }
        }
        totalPages = data.total_pages;
        if (!isPopular && currentPage < totalPages) {
            $('#movies').append(`<button class="show-more-button" onclick="loadMoreMovies()"><span>Show MORE</span></button>`);
            setupShowMoreButton();
        }
    } else {
        $('#movies').append('<p>Not found!</p>');
    }
}

function loadMoreMovies() {
    if (currentPage < totalPages) {
        currentPage++;
        if (currentTitle) {
            searchMovies(currentTitle, currentPage);
        } else {
            loadPopularMovies();
        }
    }
}

function getMovieDetails(id, type) {
    $.ajax({
        url: `https://api.themoviedb.org/3/${type}/${id}?api_key=${apiKey}&append_to_response=credits`,
        method: 'GET',
        success: function(data) {
            displayMovieDetails(data);
        }
    });
}

function displayMovieDetails(data) {
    $('#movie-details .modal-content').html(`
        <div class="movie-info">
            <div class="movie-details">
                <h2>${data.title || data.name}</h2>
                <p>${data.overview}</p>
                <p>Release Date: ${data.release_date || data.first_air_date}</p>
                <h3>Cast:</h3>
                <ul>
                    ${data.credits.cast.map(actor => `<li>${actor.name} as ${actor.character}</li>`).join('')}
                </ul>
                <h3>Crew:</h3>
                <ul>
                    ${data.credits.crew.map(member => `<li>${member.name} - ${member.job}</li>`).join('')}
                </ul>
            </div>
            <img src="https://image.tmdb.org/t/p/w300${data.poster_path}" alt="Poster" onerror="this.onerror=null;this.src='no-image.png';">
        </div>
    `);
    showModal('movie-details');
}

function showModal(id) {
    $('body').addClass('no-scroll');
    const modalContent = $(`#${id} .modal-content`);
    $(`#${id}`).addClass('show');
    setTimeout(() => {
        modalContent.addClass('show');
        $('.modal').css({
            'background': 'rgba(0, 0, 0, 0.8)',

        });
    }, 10);
}

function closeModal(id) {
    $('body').removeClass('no-scroll');
    const modalContent = $(`#${id} .modal-content`);
    modalContent.addClass('hide');
    $('.modal').css({
        'background': 'rgba(0, 0, 0, 0)',
        'backdrop-filter': 'none'
    });
    setTimeout(() => {
        modalContent.removeClass('show hide');
        $(`#${id}`).removeClass('show');
        modalContent.scrollTop(0);
    }, 500);
}

$(document).on('click', '.modal', function(e) {
    if ($(e.target).is('.modal')) {
        closeModal('movie-details');
    }
});

function setupShowMoreButton() {
    let hoverTimeout;


    let $showMoreButtons = $('.show-more-button');

    $showMoreButtons.hover(
        function() {
            let $this = $(this);
            let text = $this.find('span').text();
            $this.find('span').text('< Show MORE >');
            hoverTimeout = setTimeout(function() {
                $this.find('span').text('< < Show MORE > >');
                hoverTimeout = setTimeout(function() {
                    $this.find('span').text('< < < Show MORE > > >');
                }, 800);
            }, 800);
        },
        function() {
            clearTimeout(hoverTimeout);
            let $this = $(this);
            $this.find('span').text('Show MORE');
        }
    );


    $showMoreButtons.click(function() {
        $(this).remove();
    });
}


function goToMain() {
    $('#random-movie-generator, #about-section').hide();
    $('.movie-list, #search-form').show();
    searchType = 'movie';
    currentPage = 1;
    currentTitle = '';
    $('#top-20-text').hide();
    loadPopularMovies();
}

function goToActors() {
    $('#random-movie-generator, #about-section').hide();
    $('.movie-list, #search-form').show();
    searchType = 'person';
    currentPage = 1;
    currentTitle = '';
    $('#top-20-text').hide();
    loadPopularActors();
}

function goToWhatToWatch() {
    $('#random-movie-generator').show();
    $('.movie-list, #top-20-text, #search-form, #about-section').hide();
}

function goToCalendar() {
    alert("Not ready yet!");

}

function goToAbout() {
    $('#about-section').show();
    $('.movie-list, #top-20-text, #search-form, #random-movie-generator').hide();
}

function getPersonDetails(id) {
    $.ajax({
        url: `https://api.themoviedb.org/3/person/${id}?api_key=${apiKey}&append_to_response=movie_credits`,
        method: 'GET',
        success: function(data) {
            displayPersonDetails(data);
        }
    });
}

function displayPersonDetails(data) {
    $('#movie-details .modal-content').html(`
        <div class="movie-info">
            <div class="movie-details">
                <h2>${data.name}</h2>
                <p>Biography: ${data.biography || 'No biography available'}</p>
                <p>Birthday: ${data.birthday || 'N/A'}</p>
                <p>Place of Birth: ${data.place_of_birth || 'N/A'}</p>
                <h3>Known for:</h3>
                <ul>
                    ${data.movie_credits.cast.map(movie => `<li>${movie.title || movie.name} as ${movie.character}</li>`).join('')}
                </ul>
            </div>
            <img src="https://image.tmdb.org/t/p/w300${data.profile_path}" alt="Profile" onerror="this.onerror=null;this.src='no-image.png';">
        </div>
    `);
    showModal('movie-details');
}

function loadPopularActors() {
    $.ajax({
        url: `https://api.themoviedb.org/3/person/popular?api_key=${apiKey}&language=en-US&page=${currentPage}`,
        method: 'GET',
        success: function(data) {
            displayMovies(data, true);
        }
    });
}

function getRandomMovie() {
    const allowSusyContent = document.getElementById('allow-susy-content').checked;
    const randomId = getRandomId();
    const apiUrl = `https://api.themoviedb.org/3/movie/${randomId}?api_key=${apiKey}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (!allowSusyContent && isAdultContent(data)) {
                throw new Error('Adult content found');
            }
            const movieTitle = document.getElementById('random-movie-title');
            movieTitle.textContent = data.title;
            if (isAdultContent(data)) {
                movieTitle.textContent += ' (18+)';
            }

            if (data.poster_path) {
                document.getElementById('poster').src = `https://image.tmdb.org/t/p/w500/${data.poster_path}`;
            } else {
                document.getElementById('poster').src = 'https://ih1.redbubble.net/image.1861329650.2941/flat,750x,075,f-pad,750x1000,f8f8f8.jpg';
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            getRandomMovie();
        });
}

function getRandomId() {
    return Math.floor(Math.random() * 100000) + 1;
}

function isAdultContent(movieData) {
    return movieData.adult;
}








function openVideo() {
    var videoUrl = "https://www.youtube.com/embed/nM6Ztsn8Z7g?controls=0&modestbranding=1";
    window.open(videoUrl, "_blank");
}





