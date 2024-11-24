import express from "express";

import Productos from "../model/productos.js";
import { searchProductByID } from "../model/productos.js";
import { type } from "os";

const router = express.Router();

// GET /api/ratings
router.get('/api/ratings', async (req, res) => {
    try {
        //Parseamos los parámetros de consulta
        let { desde, hasta } = req.query;

        //Aseguramos valores por defecto si no se proporcionan
        desde = parseInt(desde, 10) || 0;
        hasta = parseInt(hasta, 10) || 10;

        //Validamos que los parámetros sean válidos
        if (desde < 0 || hasta <= desde) {
            return res.status(400).json({ error: 'Invalid query parameters: "desde" must be >= 0 and "hasta" must be > "desde"' })
        }
        const products = await Productos.find({}, 'rating') //Solo obtenemos el campo rating
            .skip(desde) //Saltar los primeros "desde" elementos
            .limit(hasta - desde); //Limitar el numero de elementos a devolver

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
    try {
        if (!req.user_is_admin) {
            return res.status(403).json({ error: 'Forbidden: Only admins can edit!' })
        }

        let product = await searchProductByID(id); //Buscamos el produto por id
        product = product[0]; //Nos quedamos solo con el primero

        if (!product) { //Si no hay producto scon ese ID
            res.status(404).json({ error: 'No product find with that ID' })
        }

        const { rate, count } = req.body;

        if (rate == undefined || count == undefined) {
            return res.status(400).json({ error: 'Bad request: Missing rate or count' })
        }

        //Verificamos que los valores sean válidos
        if (typeof rate !== 'number' || !Number.isInteger(count)) {
            return res.status(400).json({ error: 'Bad request: rate and count must be numbers!' })
        }

        //Verificamos que los valores son validos
        if (rate < 0 || rate > 5 || count < 0) {
            return res.status(400).json({ error: 'Bad request: rate must be between 0 and 5, count must be non-negative' })
        }

        product.rating.rate = rate;
        product.rating.count = count;
        await product.save();

        res.status(200).json({ message: 'Rating updated successfuly', rating: product.rating });
    } catch (err) {
        console.error('Error updating rating:', err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (err.name == 'CastError') {
            return res.status(400).json({ error: 'Invalid product ID Format' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
})

export default router;