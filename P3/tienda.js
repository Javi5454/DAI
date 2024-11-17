import express from "express";
import nunjucks from "nunjucks";
import session from "express-session";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

import connectDB from "./model/db.js";
connectDB(); //Nos conectamos a la base de datos

const app = express(); //Nuestro server

export const IN = process.env.IN || 'development'; //Por defecto development
export const JWT_SECRET = process.env.JWT_SECRET || 'mi_secreto_jwt'

nunjucks.configure('views', { //directorio 'views' donde tendremos las plantillas html
    autoescape: true, //Evitar ataques por inyeccionSQL
    noCache: IN == 'development', //true para desarrollar sin cache
    watch: IN == 'development', //recarga los archivos al guardar
    express: app //Trabajaremos con express
})
app.set('view engine', 'html')

app.use(express.static('public')) //Para archivos estáticos

// Para recibir parámetros por URL Encode
app.use(express.urlencoded({ extended: true }));

// Usamos las cookies
app.use(cookieParser())

//Middleware para la autentificación
const autentificacion = (req, res, next) => {
    const token = req.cookies.access_token;
    if (token) {
        const data = jwt.verify(token, JWT_SECRET);
        req.username = data.username; //Introducimos el username en las request
        req.user_is_admin = data.admin; //Permisos de administrador
    }
    next();
}

app.use(autentificacion);

// Sesiones para poder manejar el carrito
app.use(session({
    secret: 'my-secret', // a secret string used to sign the session ID cookie
    resave: false,  // don't save session if unmodified
    saveUninitialized: false // don't create session until something stored
}))

//test para el servidor
app.get("/hola", (req, res) => {
    res.send('Hola desde el servidor');
})

//Las demás rutas con código en el directorio route
import TiendaRouter from "./routes/router_tienda.js";
import UsuariosRouter from "./routes/usuarios.js"
app.use("/", TiendaRouter); //Rutas disponibles desde la raiz
app.use("/", UsuariosRouter); //Rutas disponibles desde la raiz

const PORT = process.env.PORT || 8000; //Por defecto estaremos en el puerto 8000

app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
})