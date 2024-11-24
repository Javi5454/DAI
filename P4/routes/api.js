import express from "express";

import Productos from "../model/productos.js";
import { searchProductByID } from "../model/productos.js";

const router = express.Router();

// GET /api/ratings
router.get('/api/ratings', async (req, res) => {
    try {
        const products = await Productos.find({}, 'rating'); //Solo obtenemos el campo rating

        //Comprobamos que todo ha ido bien
        if (products.length == 0) {
            return res.status(404).json({ error: 'No ratings found' });
        }
        res.status(200).json(products.map(product => product.rating));
    } catch (err) {
        console.error('Database error', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/ratings/:id
router.get('/api/ratings/:id', async (req, res) => {
    try {
        const id = req.params.id; // Capturamos el ID desde los parametros
        const product = await searchProductByID(id); //Obtenemos el producto por id

        if (!product || product.length != 1) {
            return res.status(404).json({ error: `No product find with id: ${id}` });
        }

        //Devolvemos el rating del producto
        res.status(200).json(product[0].rating);
    } catch (err) {
        console.error('Database error', err);

        //Si el error es por un formato de ID invaludo, devolvemos 400
        if (err.name == 'CastError') {
            return res.status(400).json({ error: 'Invalid product ID format' });
        }

        res.status(500).json({ error: 'Internal server error' });
    }
})

//PUT /api/ratings/:id
router.put('/api/ratings/:id', async (req, res) => {
    const id = req.params.id;
    console.log(req.user_is_admin);
})

export default router;