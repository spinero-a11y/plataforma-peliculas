// 1. CONFIGURACIÓN INICIAL (Pon tu clave aquí)
const API_KEY = 'b46d1f6c718586ac87e104a286f7f5c6'; 

// Enlaces de la API de TMDb para Películas Populares y Tendencias
const URL_POPULARES = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`;
const URL_TENDENCIAS = `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&language=es-ES`;
const URL_BUSQUEDA = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=es-ES&query=`;

// URL base obligatoria de TMDb para poder cargar las imágenes de los pósters
const URL_IMAGEN = 'https://image.tmdb.org/t/p/w500';

// 2. CAPTURAR LOS CONTENEDORES DEL HTML
// =========================================================================
// 1. CONFIGURACIÓN DE LA API Y CAPTURA DE CONTENEDORES (SIEMPRE ARRIBA)
// =========================================================================
// (Asegúrate de que tus constantes de las URLs y API_KEY estén declaradas aquí arriba)

const contenedorPopulares = document.getElementById('contenedor-populares');
const contenedorTendencias = document.getElementById('contenedor-tendencias');
const inputBusqueda = document.getElementById('input-busqueda');

// CONTROL DE LA VENTANA MODAL Y REPRODUCTOR
const modal = document.getElementById('movie-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const videoContainer = document.getElementById('video-container');
const videoPlayer = document.getElementById('video-player');

// =========================================================================
// 2. FUNCIÓN PRINCIPAL PARA OBTENER DATOS DE LA API
// =========================================================================
async function cargarSeccion(url, contenedor) {
    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        
        // Limpiamos el contenedor antes de meter películas
        contenedor.innerHTML = '';

        // Recorremos las películas que nos devuelve la API
        datos.results.forEach(pelicula => {
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('movie-card');

            const rutaPoster = pelicula.poster_path ? `${URL_IMAGEN}${pelicula.poster_path}` : 'https://via.placeholder.com/500x750?text=Sin+Imagen';

            tarjeta.innerHTML = `
                <img src="${rutaPoster}" alt="${pelicula.title}" onclick="abrirDetalles('${pelicula.id}')">
                <div class="movie-info">
                    <h3>${pelicula.title}</h3>
                    <span>⭐ ${pelicula.vote_average.toFixed(1)}</span>
                    <button class="btn-add-list" onclick="guardarEnLista('${pelicula.id}', '${pelicula.title.replace(/'/g, "\\'")}', '${rutaPoster}', ${pelicula.vote_average})">
                        <span class="material-symbols-outlined">add</span> Mi Lista
                    </button>
                </div>
            `;
            contenedor.appendChild(tarjeta);
        });

    } catch (error) {
        console.error("Error al cargar las películas:", error);
    }
}

// =========================================================================
// 3. FUNCIÓN PARA ABRIR LA MODAL Y REPRODUCIR (TRÁILER / PELÍCULA)
// =========================================================================
async function abrirDetalles(id) {
    try {
        const urlDetalles = `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=es-ES`;
        const respuesta = await fetch(urlDetalles);
        const pelicula = await respuesta.json();

        // Rellenamos los textos de la modal
        document.getElementById('modal-img').src = pelicula.poster_path ? `${URL_IMAGEN}${pelicula.poster_path}` : 'https://via.placeholder.com/500x750?text=Sin+Imagen';
        document.getElementById('modal-titulo').innerText = pelicula.title;
        document.getElementById('modal-puntuacion').innerText = `⭐ ${pelicula.vote_average.toFixed(1)} (Reseñas)`;
        document.getElementById('modal-fecha').innerText = pelicula.release_date ? pelicula.release_date.split('-')[0] : 'N/A';
        document.getElementById('modal-sinopsis').innerText = pelicula.overview || "No hay una sinopsis disponible para esta película.";

        // Dejar el contenedor limpio con el iframe original cada vez que se abra una película nueva
        videoContainer.style.display = 'none';
        videoContainer.innerHTML = `<iframe id="video-player" width="100%" height="315" src="" frameborder="0" allowfullscreen></iframe>`;

        // --- BUSCAR TRÁILER ---
        const urlVideos = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}&language=es-ES`;
        const respVideos = await fetch(urlVideos);
        let datosVideos = await respVideos.json();
        
        if (!datosVideos.results || datosVideos.results.length === 0) {
            const respVideosEng = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`);
            datosVideos = await respVideosEng.json();
        }

        const trailer = datosVideos.results.find(vid => vid.type === 'Trailer' && vid.site === 'YouTube') 
                     || datosVideos.results.find(vid => vid.type === 'Teaser' && vid.site === 'YouTube')
                     || datosVideos.results.find(vid => vid.site === 'YouTube');

        const btnTrailer = document.getElementById('btn-ver-trailer');
        if (trailer && trailer.key) {
            btnTrailer.style.display = 'block';
            btnTrailer.onclick = () => {
                window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
            };
        } else {
            btnTrailer.style.display = 'none';
        }

        // --- BOTÓN VER PELÍCULA ---
        document.getElementById('btn-ver-pelicula').onclick = () => {
            // Inyectamos el reproductor HTML5 nativo para evitar pantallas negras
            videoContainer.innerHTML = `
                <video id="video-player-real" controls autoplay style="width:100%; aspect-ratio: 16/9; display:block;">
                    <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4">
                    Tu navegador no soporta reproducción de video.
                </video>
            `;
            videoContainer.style.display = 'block';
            setTimeout(() => {
                videoContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        };

        // Mostrar la ventana modal
        modal.style.display = 'block';

    } catch (error) {
        console.error("Error al obtener los detalles de la película:", error);
    }
}

// =========================================================================
// 4. FUNCIONES AUXILIARES (BUSCADOR, CARRUSEL, FAVORITOS Y MENÚ)
// =========================================================================
// Programar el Buscador Inteligente
inputBusqueda.addEventListener('input', (evento) => {
    const textoBusqueda = evento.target.value.trim();
    const titulo = document.getElementById('titulo-principal');
    const seccionTendencias = document.getElementById('seccion-tendencias');

    if (textoBusqueda.length > 0) {
        titulo.innerText = `Resultados para: "${textoBusqueda}"`;
        seccionTendencias.style.display = 'none'; 
        cargarSeccion(`${URL_BUSQUEDA}${textoBusqueda}`, contenedorPopulares);
    } else {
        titulo.innerText = "Recomendados para ti";
        seccionTendencias.style.display = 'block'; 
        cargarSeccion(URL_POPULARES, contenedorPopulares);
    }
});

// Función para mover el carrusel con las flechas
function deslizar(idContenedor, direccion) {
    const contenedor = document.getElementById(idContenedor);
    const distanciaX = 500; 

    if (direccion === 'izquierda') {
        contenedor.scrollLeft -= distanciaX;
    } else {
        contenedor.scrollLeft += distanciaX;
    }
}

// Activar botones del Menú
document.getElementById('btn-inicio').addEventListener('click', (e) => {
    e.preventDefault();
    inputBusqueda.value = ''; 
    document.getElementById('titulo-principal').innerText = "Recomendados para ti";
    document.getElementById('seccion-tendencias').style.display = 'block';
    cargarSeccion(URL_POPULARES, contenedorPopulares);
});

document.getElementById('btn-recomendados').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('titulo-principal').scrollIntoView({ behavior: 'smooth' });
});

// Guardar en favoritos (LocalStorage)
function guardarEnLista(id, titulo, poster, voto) {
    let listaFavoritos = JSON.parse(localStorage.getItem('sofveria_favoritos')) || [];
    const existe = listaFavoritos.some(p => p.id === id);

    if (!existe) {
        const nuevaPelicula = { id, titulo, poster, voto };
        listaFavoritos.push(nuevaPelicula);
        localStorage.setItem('sofveria_favoritos', JSON.stringify(listaFavoritos));
        alert(`"${titulo}" se ha añadido a Mi Lista.`);
    } else {
        alert("Esta película ya está en tu lista.");
    }
}

// =========================================================================
// 5. EVENTOS DE CIERRE DE LA VENTANA MODAL
// =========================================================================
closeModalBtn.onclick = () => {
    modal.style.display = 'none';
    videoContainer.style.display = 'none';
    videoContainer.innerHTML = `<iframe id="video-player" width="100%" height="315" src="" frameborder="0" allowfullscreen></iframe>`;
};

window.onclick = (evento) => {
    if (evento.target === modal) {
        modal.style.display = 'none';
        videoContainer.style.display = 'none';
        videoContainer.innerHTML = `<iframe id="video-player" width="100%" height="315" src="" frameborder="0" allowfullscreen></iframe>`;
    }
};

// =========================================================================
// 6. INICIALIZAR LA PÁGINA (SIEMPRE AL FINAL DEL TODO)
// =========================================================================
cargarSeccion(URL_POPULARES, contenedorPopulares);
cargarSeccion(URL_TENDENCIAS, contenedorTendencias);