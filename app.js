// Reemplaza esto con tu API Key real de TMDb
const API_KEY = 'b46d1f6c718586ac87e104a286f7f5c6'; 
const URL_PELICULAS = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`;

// Función para obtener las películas populares
async function obtenerPeliculas() {
    try {
        const respuesta = await fetch(URL_PELICULAS);
        const datos = await respuesta.json();
        
        console.log(datos.results); // Esto mostrará las películas en la consola del navegador
        // Aquí luego crearemos el código para pintarlas en el HTML
    } catch (error) {
        console.error("Hubo un error al traer las películas:", error);
    }
}

// Ejecutar la función al cargar la página
obtenerPeliculas();