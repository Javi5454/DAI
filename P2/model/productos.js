import mongoose from "mongoose";

const ProductosSchema = new mongoose.Schema({
    "id": {
        "type": "Number",
        "unique": true
    },
    "title" :{
        "type" : "String",
        "required": true //Queremos que haya sí o sí
    },
    "price":{
        "type": "Number",
        "required": true //Queremos que haya sí o sí
    },
    "description":{
        "type": "String"
    },
    "category":{
        "type": "String"
    },
    "image":{
        "type": "String"
    },
    "rating":{
        "rate":{
            "type": "Number"
        },
        "count":{
            "type": "Number" 
        }
    }
});

const Productos = mongoose.model("productos", ProductosSchema);

// Función para obtener los 3 artículos mejor valorados
export async function obtenerTopProductos() {
    try{
        const topProductos = await Productos.find()
            .sort({ "title" : -1}) //Orden descendente
            .limit(3); //Solo los 3 mejores
        return topProductos;
    } catch(err){
        console.error("Error al obtener los productos con mejor rate: ", err);
    }
}

export default Productos;