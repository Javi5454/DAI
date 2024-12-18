import { MongoClient } from "mongodb";

console.log(`🏁 seed.js ----------------->`)

//del archivo .env
const USER_DB = process.env.USER_DB
const PASS = process.env.PASS
const DB_HOST = process.env.DB_HOST;

const url = `mongodb://${USER_DB}:${PASS}@${DB_HOST}:27017/` //Para conectar con la base de datos
const client = new MongoClient(url)

//Database Name
const dbName = `VibraModa`;

//funcion asíncrona
async function Inserta_datos_en_coleccion(coleccion, url) {
    try {
        try {
            const datos = await fetch(url).then(res => res.json());
            // console.log(datos) Just for debugging

            //Conectamos el cliente de MongoDB
            await client.connect();
            console.log('Conectado a la base de datos')

            //Nos conectamos a la base de datos
            const database = client.db(dbName)
            const collection = database.collection(coleccion)

            const result = await collection.insertMany(datos)

            return `${datos.length} datos traidos para ${coleccion}`
        } catch (err) {
            err.errorResponse += ` en fetch ${coleccion}`
            throw err
        }
    } catch (errInsertion){
        console.error(`Error en la inserción de datos: `, errInsertion)
        throw errInsertion 
    } finally {
        //Cerramos la conexion a la BD pase lo que pase
        await client.close();
        console.log(`Conexión a la base de datos cerrada`)
    }
}

//Inserción consecutiva
Inserta_datos_en_coleccion(`productos`, `https://fakestoreapi.com/products`)
    .then((r) => console.log(`Todo bien: ${r}`)) //OK
    .then(() => Inserta_datos_en_coleccion(`usuarios`, `https://fakestoreapi.com/users`))
    .then((r) => console.log(`Todo bien: ${r}`)) //ok
    .catch((err) => console.error(`Algo mal: `, err.errorResponse))


console.log(`Lo primero que pasa`)
console.log(url);