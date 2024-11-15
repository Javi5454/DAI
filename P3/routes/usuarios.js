import express from "express";
import jwt from "jsonwebtoken";

import Usuarios from "../model/usuarios.js";

const router = express.Router();

// Para mostrar el formulario de login
router.get('/login', (req, res) => {
    res.render("login.html");
})

// Para recoger datos del formulario de login
router.post('/login', async (req, res) => {
    const user = req.body.user;
    const password = req.body.password;

    try{
        //Buscamos un usuario por username o email
        const usuario =  await Usuarios.findByUsernameOrEmail(user);

        if(!usuario){
            return res.status(401).json({message : 'Usuario o contraseña incorrectos'})
        }

        //Verificamos la contraseña
        const isMatch = await usuario.comparePassword(password);
        if(!isMatch){
            return res.status(401).json({ message : 'Usuario o contraseña incorrectos'})
        }

        res.json({ message : 'Inicio se sesión exitoso' })
    }
    catch (err){
        console.log(err);
        res.status(500).json({message: 'Error en el servidor', error: err})
    }
})

export default router;