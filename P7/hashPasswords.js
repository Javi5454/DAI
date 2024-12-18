import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Usuarios from "./model/usuarios.js"; //Nuestro esquema

const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;
const DB_HOST = process.env.DB_HOST;
const url = `mongodb://${USER_DB}:${PASS}@${DB_HOST}:27017/VibraModa?authSource=admin`;

console.log(`Hasheando contraseñas de todos los usuarios`);


// Funcion que hashea las contraseñas de la BD
async function hashPasswords() {
    try {
        mongoose.connect(url);
    } catch (err) {
        console.error(err.message);
        process.exit(1); //Salimos con el código de error 1
    }

    //Conexion a la BD
    const dbConnection = mongoose.connection;

    dbConnection.once("open", (_) => {
        console.log(`Database connected: ${url}`);
    });

    dbConnection.on("error", (err) => {
        console.error(`connection error: ${err}`);
    });

    //Obtenemos todos los usuarios de la base de datos
    try {
        const users = await Usuarios.find();

        for (let user of users) {
            //Hasheamos la contraseña
            const hashedPassword = await bcrypt.hash(user.password, 10); //Damos 10 saltos 

            //Guardamos la versión hasheada
            user.password = hashedPassword;
            await user.save();
            console.log(`Contraseña de usuario ${user.username} actualizada.`);
        }

        console.log("Proceso completado. Todas las contraseñas han sido hasheadas.")
    }
    catch (err) {
        console.error('Error al hashear las contraseñas:', err);
    } finally {
        //Cerramos la conexion a la base de datos
        dbConnection.close();
    }
}

hashPasswords();