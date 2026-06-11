// =========================================================================
// 1. CONFIGURACIÓN DE OMDb API (Pon la misma clave que usaste en app.js)
// =========================================================================
const API_KEY = "ce3f855f"; // <-- Pega aquí tu clave del correo

const modal = document.getElementById('movie-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const videoContainer = document.getElementById('video-container');

// Capturamos el contenedor principal de la página de categorías
const contenedorCategorias = document.getElementById('contenedor-populares'); 

// Diccionario estético para mostrar los títulos bonitos en español en la pantalla
const nombresTraducidos = {
    'spain': 'Cine Español',
    'anime': 'Anime Japonés',
    'korean': 'K-Drama / Cine Coreano',
    'thailand': 'Cine Tailandés',
    'hollywood': 'Éxitos de Hollywood',
    'british': 'Cine Británico'
};

// =========================================================================
// 2. FUNCIÓN PARA CARGAR LAS PELÍCULAS INTERNACIONALES
// =========================================================================
async function cargarPeliculasPorGenero() {
    try {
        // 1. Leemos la palabra clave que viene en la URL (?id=anime, ?id=spain, etc.)
        const parametros = new URLSearchParams(window.location.search);
        let genero = parametros.get('id') || 'hollywood'; // Si no hay ninguno, por defecto Hollywood

        // 2. Cambiamos el título principal de la pantalla de forma bonita
        const tituloPrincipal = document.getElementById('titulo-principal');
        if (tituloPrincipal) {
            tituloPrincipal.innerText = nombresTraducidos[genero.toLowerCase()] || `Categoría: ${genero.toUpperCase()}`;
        }

        // 3. Hacemos la petición limpia a OMDb API
        const url = `https://www.omdbapi.com/?s=${genero}&apikey=${API_KEY}&type=movie`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (!contenedorCategorias) return;
        contenedorCategorias.innerHTML = ''; // Limpiamos el "Cargando..." o pantalla vacía

        if (datos.Response === "True") {
            datos.Search.forEach(pelicula => {
                if (pelicula.Poster === "N/A") return; // Saltamos películas sin póster

                const tarjeta = document.createElement('div');
                tarjeta.classList.add('movie-card');

                tarjeta.innerHTML = `
                    <img src="${pelicula.Poster}" alt="${pelicula.Title}" onclick="abrirDetalles('${pelicula.imdbID}')">
                    <div class="movie-info">
                        <h3>${pelicula.Title}</h3>
                        <span>📅 ${pelicula.Year}</span>
                        <button class="btn-add-list" onclick="guardarEnLista('${pelicula.imdbID}', '${pelicula.Title.replace(/'/g, "\\'")}', '${pelicula.Poster}', 8.5)">
                            <span class="material-symbols-outlined">add</span> Mi Lista
                        </button>
                    </div>
                `;
                contenedorCategorias.appendChild(tarjeta);
            });
        } else {
            contenedorCategorias.innerHTML = `<p class="error-msg">No se encontraron películas para esta categoría.</p>`;
        }
    } catch (error) {
        console.error("Error al cargar la categoría internacional:", error);
    }
}

// =========================================================================
// 3. FUNCIÓN PARA ABRIR LA VENTANA MODAL (REPRODUCTOR DE CINE)
// =========================================================================
async function abrirDetalles(imdbID) {
    try {
        const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}&plot=full`;
        const respuesta = await fetch(url);
        const pelicula = await respuesta.json();

        document.getElementById('modal-img').src = pelicula.Poster !== "N/A" ? pelicula.Poster : 'https://via.placeholder.com/500x750?text=Sin+Imagen';
        document.getElementById('modal-titulo').innerText = pelicula.Title;
        document.getElementById('modal-puntuacion').innerText = `⭐ ${pelicula.imdbRating} (IMDb)`;
        document.getElementById('modal-fecha').innerText = pelicula.Year;
        document.getElementById('modal-sinopsis').innerText = pelicula.Plot !== "N/A" ? pelicula.Plot : "Sinopsis no disponible.";

        videoContainer.style.display = 'none';

        document.getElementById('btn-ver-pelicula').onclick = () => {
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

        document.getElementById('btn-ver-trailer').style.display = 'none';
        modal.style.display = 'block';

    } catch (error) {
        console.error("Error al abrir detalles en categorías:", error);
    }
}

// =========================================================================
// 4. EVENTOS DE CIERRE Y LOCALSTORAGE
// =========================================================================
if (closeModalBtn) {
    closeModalBtn.onclick = () => {
        modal.style.display = 'none';
        videoContainer.style.display = 'none';
        videoContainer.innerHTML = '';
    };
}

window.onclick = (evento) => {
    if (evento.target === modal) {
        modal.style.display = 'none';
        videoContainer.style.display = 'none';
        videoContainer.innerHTML = '';
    }
};

function guardarEnLista(id, titulo, poster, voto) {
    let listaFavoritos = JSON.parse(localStorage.getItem('sofveria_favoritos')) || [];
    const existe = listaFavoritos.some(p => p.id === id);
    if (!existe) {
        listaFavoritos.push({ id, titulo, poster, voto });
        localStorage.setItem('sofveria_favoritos', JSON.stringify(listaFavoritos));
        alert(`"${titulo}" se ha añadido a Mi Lista.`);
    } else {
        alert("Esta película ya está en tu lista.");
    }
}

// Ejecutar la carga al entrar a la página
cargarPeliculasPorGenero();