import express from "express";
import Productos from "../model/productos.js";
import { obtenerTopProductos } from "../model/productos.js";
const router = express.Router();

router.get('/portada', async (req, res) => {
    try {
        const categorias = await Productos.distinct('category') //Obtenemos las categorias
        const featured_articles = await obtenerTopProductos();
        res.render('portada.html', { categorias, featured_articles }); //../views/portada.html
    }catch(err){
        res.status(500).send({err})
    }
})

router.post('/portada', async (req, res) => {
    try {
        const categorias = await Productos.distinct('category') //Obtenemos las categorias
        const featured_articles = await obtenerTopProductos();
        console.log(req.body);
        res.render('portada.html', { categorias, featured_articles }); //../views/portada.html
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