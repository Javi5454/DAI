import mongoose from "mongoose";

const ProductosSchema = new mongoose.Schema({
    "_id":{
        "type": mongoose.ObjectId,
        "required": true
    },
    "id": {
        "type": "Number",
        "unique": true
    },
    "title": {
        "type": "String",
        "required": true, // Queremos que haya sí o sí
        "validate": {
            "validator": function (value) {
                // Verifica si el título comienza con una letra mayúscula
                return /^[A-ZÁÉÍÓÚÑ]/.test(value);
            },
            "message": "El título debe comenzar con una letra mayúscula."
        }
    },
    "price": {
        "type": "Number",
        "required": true //Queremos que haya sí o sí
    },
    "description": {
        "type": "String"
    },
    "category": {
        "type": "String"
    },
    "image": {
        "type": "String"
    },
    "rating": {
        "rate": {
            "type": "Number"
        },
        "count": {
            "type": "Number"
        }
    }
});

const Productos = mongoose.model("productos", ProductosSchema);

// Función para obtener los 3 artículos mejor valorados
export async function obtenerTopProductos() {
    try {
        const topProductos = await Productos.find()
            .sort({ "title": -1 }) //Orden descendente
            .limit(3); //Solo los 3 mejores
        return topProductos;
    } catch (err) {
        console.error("Error al obtener los productos con mejor rate: ", err);
    }
}

//Funcion para obtener los productos usando la barra de búsqueda
export async function searchBarProductos(query) {
    try {
        const productos = await Productos.find({
            $or: [
                { "title": { $regex: query, $options: 'i' } },
                { "description": { $regex: query, $options: 'i' } }
            ]
        });

        return productos;
    } catch (err) {
        console.error("Error en la búsqueda de productos:", err);
        throw err;
    }
}

//Funcion para buscar un producto por ID
export async function searchProductByID(producto_id) {
    try {
        const producto = await Productos.find({ "id": producto_id });

        return producto;
    } catch (err) {
        console.log("Error al obtener el producto:", err);
        throw err;
    }
}

//Función para obtener producto por categorias
export async function productsByCategory(category) {
    try {
        const productos = await Productos.find({ "category": category });

        return productos;
    } catch (err){
        console.log("Error al obtener productos de una categoria:", err);
        throw err;
    }
}

export default Productos;