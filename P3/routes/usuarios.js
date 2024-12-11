import express from "express";
import jwt from "jsonwebtoken";

import Usuarios from "../model/usuarios.js";
import Productos from "../model/productos.js";
import { JWT_SECRET, IN } from "../tienda.js";

const router = express.Router();

// Para mostrar el formulario de login
router.get('/login', async (req, res) => {
    //Comprobamos si ya ha iniciado sesión y redirigimos en su caso
    if (req.username) {
        res.redirect('/bienvenida');
    }
    else {
        const categorias = await Productos.distinct('category') //Obtenemos las categorias

        let carrito_unavailable = false;

        if (!req.session.carrito) {
            carrito_unavailable = true;
        }
        else {
            if (req.session.carrito.length <= 0) {
                carrito_unavailable = true;
            }
        }

        res.render("login.html", { categorias, carrito_unavailable, usuario: req.username });
    }
})

// Para recoger datos del formulario de login
router.post('/login', async (req, res) => {
    const user = req.body.user;
    const password = req.body.password;

    try {
        //Buscamos un usuario por username o email
        const usuario = await Usuarios.findByUsernameOrEmail(user);

        if (!usuario) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        //Verificamos la contraseña
        const isMatch = await usuario.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        //Si llegamos aquí es que hemos dado bien las credenciales
        const token = jwt.sign({ username: usuario.username, admin: usuario.admin }, //Payload
            JWT_SECRET, //Secreto
            { expiresIn: '2h' } //Tiene una validez de dos horas
        );

        //Establemos la cookie con el token
        res.cookie('access_token', token, {
            httpOnly: true, //Evita acceso desde JavaScript del cliente
            secure: IN == 'production', //En producción aseguramos HTTPS
            maxAge: 7200000 //2 horas en milisegundos
        }).json({ redirigir: true }); //Para redigir a bienvenida
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Error en el servidor', error: err })
    }
})

router.get('/bienvenida', async (req, res) => {
    //Solo dejamos acceder si hay un usuario
    //Comprobamos si ya ha iniciado sesión y redirigimos en su caso
    if (req.username) {
        try {
            const categorias = await Productos.distinct('category') //Obtenemos las categorias

            let carrito_unavailable = false;

            if (!req.session.carrito) {
                carrito_unavailable = true;
            }
            else {
                if (req.session.carrito.length <= 0) {
                    carrito_unavailable = true;
                }
            }

            res.render('bienvenida.html', { categorias, carrito_unavailable, usuario: req.username }); //../views/portada.html
        } catch (err) {
            console.log(err);
            res.status(500).send({ err })
        }
    }
    else {
        res.redirect("/login");
    }

})

// Para cerrar sesión
router.get('/logout', async (req, res) => {
    //Vemos que hay una sesión iniciada
    if (req.username) {
        const user = req.username;
        res.clearCookie('access_token').render("despedida.html", { user })
    }
    else {
        res.redirect('/portada')
    }

})

export default router;