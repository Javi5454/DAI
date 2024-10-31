import express from "express";
import Productos from "../model/productos.js";
import { obtenerTopProductos, searchBarProductos, searchProductByID } from "../model/productos.js";
const router = express.Router();

router.get('/portada', async (req, res) => {
    try {
        const categorias = await Productos.distinct('category') //Obtenemos las categorias
        const featured_articles = await obtenerTopProductos();
        res.render('portada.html', { categorias, featured_articles }); //../views/portada.html
    } catch (err) {
        res.status(500).send({ err })
    }
})

router.post('/portada', async (req, res) => {
    try {
        const categorias = await Productos.distinct('category') //Obtenemos las categorias
        const titulo = req.body.query;
        const search_result = await searchBarProductos(titulo);
        console.log(search_result)
        res.render('busqueda_productos.html', { categorias, search_result, titulo }); //../views/portada.html
    } catch (err) {
        res.status(500).send({ err })
    }
})

//Vista de productos
router.get('/producto/:id', async (req, res) => {
    const productId = parseInt(req.params.id); //Tomamos el ID del producto de la URL

    try {
        //Buscamos el producto
        let producto = await searchProductByID(productId);

        if (producto.length <= 0) {
            return res.status(404).send("Producto no encontrado");
        }

        producto = producto[0] //Invariante solo tomamos el primer producto

        //Renderizamos la vista del producto
        res.render('producto.html', { producto });
    } catch (err){
        res.status(500).send(err);
    }
})


router.get('/', async (req, res) => {
    try {
        res.render('home.html');
    } catch (err) {
        res.status(500).send({ err });
    }
})

export default router