import express from "express";
import Productos from "../model/productos.js";
const router = express.Router();

router.get('/portada', async (req, res) => {
    try {
        const productos = await Productos.find({}) //todos los prodcutos
        res.render('portada.html', { productos }); //../views/portada.html
    }catch(err){
        res.status(500).send({err})
    }
})

router.get('/', async (req,res) => {
    try{
        res.render('home.html');
    }catch(err){
        res.status(500).send({err});
    }
})

export default router