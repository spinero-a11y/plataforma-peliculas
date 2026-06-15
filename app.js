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
async function cargarSeccionMulticultural(keywords, contenedor) {
    try {
        contenedor.innerHTML = ''; 
        let peliculasMezcladas = [];

        for (const word of keywords) {
            const url = `https://www.omdbapi.com/?s=${word}&apikey=${API_KEY}&type=movie`;
            const respuesta = await fetch(url);
            const datos = await respuesta.json();
            
            if (datos.Response === "True") {
                const peliculasConFoto = datos.Search.filter(p => p.Poster && p.Poster !== "N/A");
                peliculasMezcladas = peliculasMezcladas.concat(peliculasConFoto.slice(0, 4));
            }
        }

        peliculasMezcladas.sort(() => 0.5 - Math.random());

        peliculasMezcladas.forEach(pelicula => {
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('movie-card');

            const imagenRespaldo = `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500&auto=format&fit=crop`;

            // OJO AQUÍ: Añadimos referrerpolicy="no-referrer" para romper el bloqueo de Amazon/IMDb
            tarjeta.innerHTML = `
                <img src="${pelicula.Poster}" alt="${pelicula.Title}" referrerpolicy="no-referrer" onclick="abrirDetalles('${pelicula.imdbID}')" onerror="this.onerror=null; this.src='${imagenRespaldo}';">
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
// 4. BUSCADOR INTELIGENTE (ESTILO NETFLIX CON FILTRO ANTIBLOQUEO)
// =========================================================================
const inputBusqueda = document.getElementById('input-busqueda');

inputBusqueda.addEventListener('input', async (evento) => {
    const textoBusqueda = evento.target.value.trim();
    const tituloPrincipal = document.getElementById('titulo-principal');
    const seccionTendencias = document.getElementById('seccion-tendencias');
    const contenedorPopulares = document.getElementById('contenedor-populares');

    // Si el usuario escribe más de 2 letras (por ejemplo: "bac...")
    if (textoBusqueda.length > 2) {
        // 1. Cambiamos el título de la sección dinámicamente
        tituloPrincipal.innerText = `Resultados para: "${textoBusqueda}"`;
        
        // 2. Ocultamos el segundo carrusel (Tendencias) para darle todo el protagonismo a la búsqueda
        if (seccionTendencias) seccionTendencias.style.display = 'none'; 

        try {
            // 3. Consultamos a OMDb con lo que el usuario está tecleando
            const url = `https://www.omdbapi.com/?s=${encodeURIComponent(textoBusqueda)}&apikey=${API_KEY}`;
            const respuesta = await fetch(url);
            const datos = await respuesta.json();
            
            contenedorPopulares.innerHTML = ''; // Limpiamos la rejilla para meter los resultados

            if (datos.Response === "True") {
                datos.Search.forEach(pelicula => {
                    // Filtro de seguridad: ignoramos resultados sin póster oficial
                    if (!pelicula.Poster || pelicula.Poster === "N/A") return;

                    const tarjeta = document.createElement('div');
                    tarjeta.classList.add('movie-card');
                    const imagenRespaldo = `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500&auto=format&fit=crop`;

                    // Inyectamos el escudo referrerpolicy para que carguen películas de terror/misterio como Backrooms sin fallos
                    tarjeta.innerHTML = `
                        <img src="${pelicula.Poster}" alt="${pelicula.Title}" referrerpolicy="no-referrer" onclick="abrirDetalles('${pelicula.imdbID}')" onerror="this.onerror=null; this.src='${imagenRespaldo}';">
                        <div class="movie-info">
                            <h3>${pelicula.Title}</h3>
                            <span>📅 ${pelicula.Year}</span>
                            <button class="btn-add-list" onclick="guardarEnLista('${pelicula.imdbID}', '${pelicula.Title.replace(/'/g, "\\'")}', '${pelicula.Poster}', 8.5)">
                                <span class="material-symbols-outlined">add</span> Mi Lista
                            </button>
                        </div>
                    `;
                    contenedorPopulares.appendChild(tarjeta);
                });
            } else {
                // Si la API no encuentra nada (por ejemplo, si escriben algo al azar como "asdfgh")
                contenedorPopulares.innerHTML = `<p class="error-msg" style="color: #aaa; padding: 20px;">No se han encontrado resultados que coincidan con tu búsqueda.</p>`;
            }
        } catch (error) {
            console.error("Error en el buscador inteligente:", error);
        }

    } else if (textoBusqueda.length === 0) {
        // Si el usuario borra por completo el buscador, restauramos la pantalla de Netflix original
        tituloPrincipal.innerText = "Recomendados para ti";
        if (seccionTendencias) seccionTendencias.style.display = 'block'; 
        inicializarCatalogo();
    }
});

// --- EL RESTO DE TUS FUNCIONES AUXILIARES SE QUEDAN IGUAL ---
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
    const seccionTendencias = document.getElementById('seccion-tendencias');
    if (seccionTendencias) seccionTendencias.style.display = 'block';
    inicializarCatalogo();
});

document.getElementById('btn-recomendados').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('titulo-principal').scrollIntoView({ behavior: 'smooth' });
});

// Guardar en favoritos
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