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

        // 3. Buscar el Tráiler oficial en YouTube a través de la API de TMDb
        const urlVideos = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}&language=es-ES`;
        const respVideos = await fetch(urlVideos);
        let datosVideos = await respVideos.json();
        
        // Truco Pro: Si no encuentra videos en español, le pedimos a la API los videos en inglés (originales)
        if (!datosVideos.results || datosVideos.results.length === 0) {
            const respVideosEng = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`);
            datosVideos = await respVideosEng.json();
        }

        // Filtramos buscando un video que sea exactamente un "Trailer" y esté alojado en "YouTube"
        const trailer = datosVideos.results.find(vid => vid.type === 'Trailer' && vid.site === 'YouTube') 
                     || datosVideos.results.find(vid => vid.type === 'Teaser' && vid.site === 'YouTube')
                     || datosVideos.results.find(vid => vid.site === 'YouTube'); // Cualquier video de YouTube si no hay trailer oficial

        const btnTrailer = document.getElementById('btn-ver-trailer');
        
        if (trailer && trailer.key) {
            btnTrailer.style.display = 'block';
            btnTrailer.onclick = () => {
                // Opción A: Abrir directamente en una pestaña nueva de YouTube (100% libre de errores)
                window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
                
                /* 
                // Opción B: Si prefieres seguir intentándolo dentro de la web, usa esta URL simplificada sin bloqueos:
                videoPlayer.src = `https://www.youtube.com/embed/${trailer.key}`;
                videoContainer.style.display = 'block';
                setTimeout(() => {
                    videoContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
                */
            };
        } else {
            btnTrailer.style.display = 'none';
        }

        // Configurar acción al presionar "Ver Película" (Reproductor Cinemático Activo)
        document.getElementById('btn-ver-pelicula').onclick = () => {
            // 1. Si el usuario estaba viendo el tráiler de YouTube, lo limpiamos y apagamos
            videoPlayer.src = ''; 
            
            // 2. Cargamos en el reproductor un archivo de video real (.mp4) de alta calidad cinematográfica
            // Nota: Cambiamos dinámicamente el comportamiento del iframe para que lea un reproductor de video directo
            videoPlayer.src = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
            
            // 3. Mostramos el contenedor del video si estaba oculto
            videoContainer.style.display = 'block';
            
            // 4. Hacemos un scroll suave automático para centrar la película en la pantalla del usuario
            setTimeout(() => {
                videoContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
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