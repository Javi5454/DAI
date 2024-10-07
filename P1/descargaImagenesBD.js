import { promisify } from "util"; //Para manejar los callbacks de stream
import { pipeline } from "stream";
import { createWriteStream } from "fs";
import fs from "fs/promises"; //Para poder crear los directorios
import path from "path";

//Importamos los nodos para hacer la solicitud
const streamPipeline = promisify(pipeline)


//Función para descargar imágnes desde una URL y guardalas en una carpeta
async function descargarImagen(url, rutaArchivo) {
    const response = await fetch(url);

    //Verificamos si la respuesta es OK
    if (!response.ok) throw new Error(`Error al descargar la imagen: ${response.statusText}`)

    //Usamos stream para descargar y guardar la imagen
    await streamPipeline(response.body, createWriteStream(rutaArchivo))
}

//Función para obtener los datos de la API y descargar las imágenes
async function obtenerYDescargarImagenes(url) {
    try {
        //Obtenemos los datos desde el API
        const productos = await fetch(url).then(res => res.json())

        //Ruta para guardar las imágenes
        const __dirname = path.dirname(new URL(import.meta.url).pathname); //Directorio actual
        const directorioImagenes = path.join(__dirname, 'imagenes');

        //Verificamos si el directorio existe, si no lo creamos
        try {
            await fs.access(directorioImagenes);
        } catch {
            await fs.mkdir(directorioImagenes);
        }

        //Recorremos los productos y descargamos las imágenes
        for (const producto of productos) {
            const urlImagen = producto.image; //Campo imagen en el JSON servido por la API
            const nombreArchivo = path.basename(urlImagen); //Obtenemos el nombre de la imagen

            //Definimos la ruta completa donde se guardara la imagen
            const rutaArchivo = path.join(directorioImagenes, nombreArchivo);

            //Descargamos la imagen y la guardamos en la carpeta imagenes
            console.log(`Descargando imagen para ${producto.tile} desde ${urlImagen}`);
            await descargarImagen(urlImagen, rutaArchivo);
            console.log(`Imagen guardada en ${rutaArchivo}`);
        }

        console.log('Todas las imágenes han sido descargadas.')
    } catch (error) {
        console.log('Error durante el proceso:', error);
    }
}

//Ejecutamos la función
obtenerYDescargarImagenes("https://fakestoreapi.com/products")