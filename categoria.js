// 1. CONFIGURACIÓN (Usa tu misma API Key real de TMDb)
const API_KEY = 'b46d1f6c718586ac87e104a286f7f5c6'; 
const URL_IMAGEN = 'https://image.tmdb.org/t/p/w500';

// 2. LEER LOS PARÁMETROS DE LA URL (?id=XX&name=YY)
const parametrosURL = new URLSearchParams(window.location.search);
const idGenero = parametrosURL.get('id');
const nombreGenero = parametrosURL.get('name');

// Capturar contenedores del HTML
const tituloCategoria = document.getElementById('titulo-categoria');
const contenedorCategoria = document.getElementById('contenedor-categoria');

// Cambiar el título principal de la página con el nombre del género
if (nombreGenero) {
    tituloCategoria.innerText = `Películas de ${nombreGenero}`;
}

// 3. FUNCIÓN PARA CARGAR LAS PELÍCULAS DE ESTE GÉNERO
async function cargarPeliculasPorGenero() {
    // URL especial de TMDb para descubrir películas filtradas por género (with_genres)
    const urlDescubrir = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=es-ES&sort_by=popularity.desc&with_genres=${idGenero}`;

    try {
        const respuesta = await fetch(urlDescubrir);
        const datos = await respuesta.json();

        contenedorCategoria.innerHTML = '';

        datos.results.forEach(pelicula => {
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('movie-card');
            tarjeta.style.position = 'relative';

            const rutaPoster = pelicula.poster_path ? `${URL_IMAGEN}${pelicula.poster_path}` : 'https://via.placeholder.com/500x750?text=Sin+Imagen';

            tarjeta.innerHTML = `
                <img src="${rutaPoster}" alt="${pelicula.title}" onclick="abrirDetalles('${pelicula.id}')">
                <div class="movie-info-fav" style="padding: 10px; background: #1a1615;">
                    <h3 style="font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${pelicula.title}</h3>
                    <span style="color: var(--color-primario); font-size: 11px;">⭐ ${pelicula.vote_average.toFixed(1)}</span>
                </div>
            `;
            contenedorCategoria.appendChild(tarjeta);
        });
    } catch (error) {
        console.error("Error al cargar las películas de la categoría:", error);
    }
}

// 4. LÓGICA DE LA MODAL (Reutilizada para poder ver trailers aquí también)
const modal = document.getElementById('movie-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const videoContainer = document.getElementById('video-container');
const videoPlayer = document.getElementById('video-player');

async function abrirDetalles(id) {
    try {
        const urlDetalles = `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=es-ES`;
        const respuesta = await fetch(urlDetalles);
        const pelicula = await respuesta.json();

        document.getElementById('modal-img').src = pelicula.poster_path ? `${URL_IMAGEN}${pelicula.poster_path}` : 'https://via.placeholder.com/500x750?text=Sin+Imagen';
        document.getElementById('modal-titulo').innerText = pelicula.title;
        document.getElementById('modal-puntuacion').innerText = `⭐ ${pelicula.vote_average.toFixed(1)} (Reseñas)`;
        document.getElementById('modal-fecha').innerText = pelicula.release_date ? pelicula.release_date.split('-')[0] : 'N/A';
        document.getElementById('modal-sinopsis').innerText = pelicula.overview || "No hay una sinopsis disponible.";

        videoContainer.style.display = 'none';
        videoPlayer.src = '';

        const urlVideos = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}&language=es-ES`;
        const respVideos = await fetch(urlVideos);
        const datosVideos = await respVideos.json();
        const trailer = datosVideos.results.find(vid => vid.type === 'Trailer' && vid.site === 'YouTube') || datosVideos.results.find(vid => vid.site === 'YouTube');

        const btnTrailer = document.getElementById('btn-ver-trailer');
        if (trailer) {
            btnTrailer.style.display = 'block';
            btnTrailer.onclick = () => {
                videoPlayer.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
                videoContainer.style.display = 'block';
            };
        } else {
            btnTrailer.style.display = 'none';
        }

        document.getElementById('btn-ver-pelicula').onclick = () => {
            alert(`🎬 Iniciando la reproducción de: "${pelicula.title}".`);
        };

        modal.style.display = 'block';
    } catch (error) {
        console.error("Error al abrir los detalles:", error);
    }
}

closeModalBtn.onclick = () => { modal.style.display = 'none'; videoPlayer.src = ''; };
window.onclick = (e) => { if (e.target === modal) { modal.style.display = 'none'; videoPlayer.src = ''; } };

// Inicializar la carga al entrar a la página
cargarPeliculasPorGenero();