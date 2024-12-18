import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UsuariosSchema = new mongoose.Schema({
    "_id":{
        "type": mongoose.ObjectId,
        "required": true
    },
    "address": {
        "geolocation": {
            "lat": { "type": "String" },
            "long": { "type": "String" }
        },
        "city": {
            "type": "String"
        },
        "street": {
            "type": "String"
        },
        "number": {
            "type": "Number"
        },
        "zipcode": {
            "type": "String"
        }
    },
    "id": {
        "type": "Number",
        "required": true //Queremos que haya sí o sí
    },
    "email": {
        "type": "String",
        "required": true //Queremos que haya sí o sí
    },
    "username": {
        "type": "String",
        "required": true
    },
    "password": {
        "type": "String",
        "required": true
    },
    "name": {
        "firstname": {
            "type": "String"
        },
        "lastname": {
            "type": "String"
        }
    },
    "phone": {
        "type": "String"
    },
    "admin" : {
        "type": "Boolean",
        "default": false,
        "required": false
    }
});

// Para verificar la contraseña del usuario
UsuariosSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

// Para buscar por usuario o email
UsuariosSchema.statics.findByUsernameOrEmail = async function(searchString){
    try{
        //Buscamos por usuario o email
        const user = await this.findOne({
            $or : [
                {"username" : searchString},
                {"email": searchString}
            ]
        });
        return user;
    } catch(err){
        console.error("Error al buscar el usuario: ", err);
        return null;
    }
}

const Usuarios = mongoose.model("usuarios", UsuariosSchema);

export default Usuarios;
