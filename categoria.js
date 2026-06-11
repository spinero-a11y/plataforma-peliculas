// =========================================================================
// 1. CONFIGURACIÓN DE OMDb API (¡Pon la misma clave que en app.js!)
// =========================================================================
const API_KEY = "TU_OMDB_API_KEY_AQUI"; // <-- Pega aquí tu misma clave del correo

const modal = document.getElementById('movie-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const videoContainer = document.getElementById('video-container');
const contenedorCategorias = document.getElementById('contenedor-populares'); // Reutilizamos tu caja principal

// =========================================================================
// 2. FUNCIÓN PARA CARGAR PELÍCULAS POR EL GÉNERO SELECCIONADO
// =========================================================================
async function cargarPeliculasPorGenero() {
    try {
        // 1. Leemos qué categoría quiere ver el usuario desde la barra de direcciones de la web
        const parametros = new URLSearchParams(window.location.search);
        let genero = parametros.get('id') || 'Action'; // Si no hay nada, por defecto carga Acción

        const tituloPrincipal = document.getElementById('titulo-principal');
        if (tituloPrincipal) {
            tituloPrincipal.innerText = `Categoría: ${genero.toUpperCase()}`;
        }

        // 2. Buscamos películas de Hollywood que correspondan a esa palabra clave
        const url = `https://www.omdbapi.com/?s=${genero}&apikey=${API_KEY}&type=movie`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (!contenedorCategorias) return;
        contenedorCategorias.innerHTML = '';

        if (datos.Response === "True") {
            datos.Search.forEach(pelicula => {
                if (pelicula.Poster === "N/A") return;

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
            contenedorCategorias.innerHTML = `<p class="error-msg">No se encontraron películas para esta categoría por el momento.</p>`;
        }
    } catch (error) {
        console.error("Error al cargar la categoría en OMDb:", error);
    }
}

// =========================================================================
// 3. FUNCIÓN PARA ABRIR LA MODAL EN CATEGORÍAS (IMDb ID)
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
// 4. EVENTOS DE CIERRE Y AUXILIARES
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

// Arrancar la carga de la categoría activa
cargarPeliculasPorGenero();