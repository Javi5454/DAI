import { MongoClient } from "mongodb";

//del archivo .env
const USER_DB = process.env.USER_DB
const PASS = process.env.PASS

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017` //Para conectar con la base de datos
const client = new MongoClient(url)

//Database Name
const dbName = `VibraModa`;

//Funcion para consultar productos de mas de 100$
async function consultarProductosCaros() {
    console.log('CONSULTANDO LOS PRODUCTOS MÁS CAROS (>=100$)...')
    console.log(`-----------------------------------------------`)
    try {
        //Conectamos el cliente de MongoDB
        await client.connect();
        console.log('Conectado a la base de datos')

        //Nos conectamos a la base de datos
        const db = client.db(dbName)
        const collection = db.collection(`productos`)

        //Realizamos la consulta
        const productosCaros = await collection.find({ price: { $gte: 100 } }).toArray() //Lo pasamos a Array

        //Mostramos los resultados
        console.log(`Productos encontrados: ${productosCaros.length}`)
        productosCaros.forEach((producto, index) => {
            console.log(`Producto ${index + 1}:`, producto)
        })

        //Los devolvemos por si fuesen de utilidad en el futuro
        return productosCaros

    } catch (err) {
        //Mensaje de error de la consulta
        console.error(`Error al consultar productos: `, err)
        throw err
    } finally {
        //Ceramos la conexion con la base de datos
        await client.close();
        console.log(`Conexion con la base de datos cerrada`)
    }
}

//Función para consultar productos que contengan 'winter' en la descripción, ordenados por precio
async function consultarProductosWinter() {
    console.log(`CONSULTANDO LOS PRODUCTOS QUE CONTIENEN LA PALABRA 'WINTER' EN LA DESCRIPCIÓN ORDENADOS POR PRECIO...`)
    console.log(`-----------------------------------------------------------------------------------------------------`)
    try {
        //Conectamos el cliente de MongoDB
        await client.connect();
        console.log('Conectado a la base de datos')

        //Nos conectamos a la base de datos
        const db = client.db(dbName)
        const collection = db.collection(`productos`)

        //Realizamos la consulta
        const productosWinter = await collection
            .find({ description: { $regex: /winter/i } }) //Usamos expresiones regulares para ignorar mayus y minus
            .sort({ price: 1 }) //Ordenamos por precio de menor a mayor
            .toArray()

        //Mostramos los resultados
        console.log(`Productos encontrados: ${productosWinter.length}`)
        productosWinter.forEach(function (producto, index) {
            console.log(`Producto ${index + 1}:`, producto);
        })

        //Los devolvemos por si fuesen de utilidad en el futuro
        return productosWinter

    } catch (err) {
        //Mensaje de error de la consulta
        console.error(`Error al consultar productos: `, err)
        throw err
    } finally {
        //Ceramos la conexion con la base de datos
        await client.close();
        console.log(`Conexion con la base de datos cerrada`)
    }
}

//Función para consultar productos de joyeria ordenados por raiting
async function consultarProductosJoyeria() {
    console.log(`CONSULTANDO LOS PRODUCTOS DE JOYERÍA ORDENADOS POR RATING`)
    console.log(`---------------------------------------------------------`)
    try {
        //Conectamos el cliente de MongoDB
        await client.connect();
        console.log('Conectado a la base de datos')

        //Nos conectamos a la base de datos
        const db = client.db(dbName)
        const collection = db.collection(`productos`)

        //Realizamos la consulta
        const productosJoyeria = await collection
            .find({ category: 'jewelery' })
            .sort({ 'rating.rate': -1 }) //Ordenamos por precio de mayor a mayor
            .toArray()

        //Mostramos los resultados
        console.log(`Productos encontrados: ${productosJoyeria.length}`)
        productosJoyeria.forEach(function (producto, index) {
            console.log(`Producto ${index + 1}:`, producto);
        })

        //Los devolvemos por si fuesen de utilidad en el futuro
        return productosJoyeria

    } catch (err) {
        //Mensaje de error de la consulta
        console.error(`Error al consultar productos: `, err)
        throw err
    } finally {
        //Ceramos la conexion con la base de datos
        await client.close();
        console.log(`Conexion con la base de datos cerrada`)
    }
}

//Función para consultar el numero total de reseñas
async function consultarTotalResenias() {
    console.log(`CONSULTANDO EL NUMERO TOTAL DE RESEÑAS`)
    console.log(`--------------------------------------`)
    try {
        //Conectamos el cliente de MongoDB
        await client.connect();
        console.log('Conectado a la base de datos')

        //Nos conectamos a la base de datos
        const db = client.db(dbName)
        const collection = db.collection(`productos`)

        //Realizamos la consulta
        const resultado = await collection.aggregate([
            { $group: { _id: null, totalResenias: { $sum: '$rating.count' } } } //Sumamos
        ]).toArray();

        //Obtenemos el resultado
        const totalResenias = resultado.length > 0 ? resultado[0].totalResenias : 0

        //Mostramos los resultados
        console.log(`Número total de reseñas:`, totalResenias)

        //Los devolvemos por si fuesen de utilidad en el futuro
        return totalResenias

    } catch (err) {
        //Mensaje de error de la consulta
        console.error(`Error al consultar productos: `, err)
        throw err
    } finally {
        //Ceramos la conexion con la base de datos
        await client.close();
        console.log(`Conexion con la base de datos cerrada`)
    }
}


//Función para consultar la puntuacion media por categoria de producto
async function consultarRatingMedioProducto() {
    console.log(`CONSULTANDO LA PUNTUACION MEDIA POR CATEGORIA DE PRODUCTO`)
    console.log(`---------------------------------------------------------`)
    try {
        //Conectamos el cliente de MongoDB
        await client.connect();
        console.log('Conectado a la base de datos')

        //Nos conectamos a la base de datos
        const db = client.db(dbName)
        const collection = db.collection(`productos`)

        //Realizamos la consulta
        const resultado = await collection.aggregate([
            {
                $group: {
                    _id: '$category', //Agrupamos por categoria
                    ratingMedio: { $avg: '$rating.rate' } //Calculamos la media
                }
            },
            {
                $project: {
                    _id: 1, //Por orden alfabetico
                    ratingMedio: { $round: ['$ratingMedio', 2] } //Redondeamos a dos decimales
                }
            }
        ]).toArray();

        //Mostramos los resultados
        resultado.forEach(item => {
            console.log(`Categoría ${item._id}, Puntuación media: ${item.ratingMedio}`)
        })

        //Los devolvemos por si fuesen de utilidad en el futuro
        return resultado

    } catch (err) {
        //Mensaje de error de la consulta
        console.error(`Error al consultar productos: `, err)
        throw err
    } finally {
        //Ceramos la conexion con la base de datos
        await client.close();
        console.log(`Conexion con la base de datos cerrada`)
    }
}


/*consultarProductosJoyeria()
  .then(productos => {
    if (productos.length === 0) {
      console.log('No se encontraron productos con "winter" en la descripción');
    } else {
      console.log(`Total productos consultados:`, productos.length);
    }
  })
  .catch(err => {
    console.error('Error en la ejecución de la consulta:', err.message);
  });*/

consultarRatingMedioProducto()