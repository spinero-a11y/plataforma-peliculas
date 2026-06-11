// =========================================================================
// 1. CONFIGURACIÓN DE OMDb API (¡Pon tu clave aquí!)
// =========================================================================
const API_KEY = "ce3f855f"; // <-- Pega aquí la clave que te llegó al correo

// Configuración de la ventana modal y reproductor
const modal = document.getElementById('movie-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const videoContainer = document.getElementById('video-container');

// =========================================================================
// 2. FUNCIÓN PRINCIPAL PARA CARGAR PELÍCULAS POR PALABRA CLAVE
// =========================================================================
async function cargarSeccion(busquedaKeyword, contenedor) {
    try {
        // OMDb busca películas reales por palabras clave. 
        // Traeremos joyas del cine de forma dinámica.
        const url = `https://www.omdbapi.com/?s=${busquedaKeyword}&apikey=${API_KEY}&type=movie`;
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        
        contenedor.innerHTML = '';

        if (datos.Response === "True") {
            datos.Search.forEach(pelicula => {
                // Filtramos para evitar tarjetas sin póster válido
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
                contenedor.appendChild(tarjeta);
            });
        } else {
            contenedor.innerHTML = `<p class="error-msg">No se encontraron películas para esta sección.</p>`;
        }
    } catch (error) {
        console.error("Error al conectar con OMDb API:", error);
    }
}

// =========================================================================
// 3. FUNCIÓN PARA ABRIR LA MODAL CON DETALLES REALES (IMDb ID)
// =========================================================================
async function abrirDetalles(imdbID) {
    try {
        // Pedimos a OMDb los detalles completos (sinopsis, actores, nota) de la película pulsada
        const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}&plot=full`;
        const respuesta = await fetch(url);
        const pelicula = await respuesta.json();

        // Rellenamos los datos de la modal con información oficial de Hollywood
        document.getElementById('modal-img').src = pelicula.Poster !== "N/A" ? pelicula.Poster : 'https://via.placeholder.com/500x750?text=Sin+Imagen';
        document.getElementById('modal-titulo').innerText = pelicula.Title;
        document.getElementById('modal-puntuacion').innerText = `⭐ ${pelicula.imdbRating} (IMDb)`;
        document.getElementById('modal-fecha').innerText = pelicula.Year;
        document.getElementById('modal-sinopsis').innerText = pelicula.Plot !== "N/A" ? pelicula.Plot : "Sinopsis no disponible.";

        // Reiniciamos el contenedor de video cada vez que abrimos una película nueva
        videoContainer.style.display = 'none';

        // --- ACCIÓN DEL BOTÓN VER PELÍCULA (REPRODUCTOR ACTIVO) ---
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

        // OMDb no provee enlaces directos a trailers de YouTube, así que ocultamos el botón de tráiler para que no falle
        document.getElementById('btn-ver-trailer').style.display = 'none';

        // Mostramos la ventana modal
        modal.style.display = 'block';

    } catch (error) {
        console.error("Error al abrir detalles en OMDb:", error);
    }
}

// =========================================================================
// 4. FUNCIONES AUXILIARES (BUSCADOR, CARRUSEL Y LISTA)
// =========================================================================
const inputBusqueda = document.getElementById('input-busqueda');

// Buscador Inteligente conectado a OMDb
inputBusqueda.addEventListener('input', (evento) => {
    const textoBusqueda = evento.target.value.trim();
    const titulo = document.getElementById('titulo-principal');
    const seccionTendencias = document.getElementById('seccion-tendencias');
    const contenedorPopulares = document.getElementById('contenedor-populares');

    if (textoBusqueda.length > 2) {
        titulo.innerText = `Resultados para: "${textoBusqueda}"`;
        seccionTendencias.style.display = 'none'; 
        cargarSeccion(textoBusqueda, contenedorPopulares);
    } else if (textoBusqueda.length === 0) {
        titulo.innerText = "Recomendados para ti";
        seccionTendencias.style.display = 'block'; 
        inicializarCatalogo();
    }
});

// Deslizamiento del carrusel
function deslizar(idContenedor, direccion) {
    const contenedor = document.getElementById(idContenedor);
    if (direccion === 'izquierda') {
        contenedor.scrollLeft -= 500;
    } else {
        contenedor.scrollLeft += 500;
    }
}

// Botón de Inicio en el Menú
document.getElementById('btn-inicio').addEventListener('click', (e) => {
    e.preventDefault();
    inputBusqueda.value = ''; 
    document.getElementById('titulo-principal').innerText = "Recomendados para ti";
    document.getElementById('seccion-tendencias').style.display = 'block';
    inicializarCatalogo();
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
        listaFavoritos.push({ id, titulo, poster, voto });
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
    videoContainer.innerHTML = '';
};

window.onclick = (evento) => {
    if (evento.target === modal) {
        modal.style.display = 'none';
        videoContainer.style.display = 'none';
        videoContainer.innerHTML = '';
    }
};

// =========================================================================
// 6. INICIALIZACIÓN AUTOMÁTICA DEL CATÁLOGO MULTICULTURAL
// =========================================================================
function inicializarCatalogo() {
    const contenedorPopulares = document.getElementById('contenedor-populares');
    const contenedorTendencias = document.getElementById('contenedor-tendencias');

    // --- Carrusel 1: Recomendados para ti (Mix de Cine Español, Hollywood e Inglés) ---
    // Buscamos "Madrid" para forzar el cine español y "London" para el británico clásico, combinados con Hollywood
    cargarSeccionMulticultural(['Hollywood', 'Madrid', 'London'], contenedorPopulares);

    // --- Carrusel 2: Tendencias de la semana (Mix de Anime, K-Dramas, Cine Coreano, Japonés y Tailandés) ---
    // Palabras clave súper potentes para arrastrar animación y dramas asiáticos de golpe
    cargarSeccionMulticultural(['Anime', 'Korea', 'Japan', 'Thailand'], contenedorTendencias);
}

// NUEVA FUNCIÓN INTELIGENTE: Mezcla resultados de varios mundos para que no salga solo un tipo de película
async function cargarSeccionMulticultural(keywords, contenedor) {
    try {
        contenedor.innerHTML = ''; // Limpiamos la caja
        let peliculasMezcladas = [];

        // Hacemos micro-búsquedas por cada palabra clave para juntar el catálogo global
        for (const word of keywords) {
            const url = `https://www.omdbapi.com/?s=${word}&apikey=${API_KEY}&type=movie`;
            const respuesta = await fetch(url);
            const datos = await respuesta.json();
            
            if (datos.Response === "True") {
                // Tomamos las primeras 4 películas de cada temática para armar la variedad
                peliculasMezcladas = peliculasMezcladas.concat(datos.Search.slice(0, 4));
            }
        }

        // Ordenamos la lista de forma aleatoria para que cada vez que recargues se vea diferente y fresco
        peliculasMezcladas.sort(() => 0.5 - Math.random());

        // Dibujamos las tarjetas internacionales en la interfaz
        peliculasMezcladas.forEach(pelicula => {
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
            contenedor.appendChild(tarjeta);
        });

    } catch (error) {
        console.error("Error al armar la sección multicultural:", error);
    }
}

// ¡Arranca la plataforma con tu catálogo global!
inicializarCatalogo();
// Arranca la plataforma
inicializarCatalogo();