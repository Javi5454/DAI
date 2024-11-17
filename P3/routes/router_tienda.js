import express from "express";
import Productos from "../model/productos.js";
import { obtenerTopProductos, searchBarProductos, searchProductByID, productsByCategory } from "../model/productos.js";
import mongoose from "mongoose";
const router = express.Router();

router.get('/portada', async (req, res) => {
    try {
        const categorias = await Productos.distinct('category') //Obtenemos las categorias
        const featured_articles = await obtenerTopProductos();

        let carrito_unavailable = false;

        if (!req.session.carrito) {
            carrito_unavailable = true;
        }
        else {
            if (req.session.carrito.length <= 0) {
                carrito_unavailable = true;
            }
        }

        res.render('portada.html', { categorias, featured_articles, carrito_unavailable, usuario : req.username }); //../views/portada.html
    } catch (err) {
        console.log(err);
        res.status(500).send({ err })
    }
})

router.post('/portada', async (req, res) => {
    try {
        const categorias = await Productos.distinct('category') //Obtenemos las categorias
        const titulo = req.body.query;
        const productos = await searchBarProductos(titulo);

        let carrito_unavailable = false;

        if (!req.session.carrito) {
            carrito_unavailable = true;
        }
        else {
            if (req.session.carrito.length <= 0) {
                carrito_unavailable = true;
            }
        }

        res.render('listado_productos.html', { categorias, productos, titulo, carrito_unavailable, usuario : req.username });
    } catch (err) {
        res.status(500).send({ err })
    }
})

//Vista de productos
router.get('/producto/:id', async (req, res) => {
    const productId = parseInt(req.params.id); //Tomamos el ID del producto de la URL

    try {
        const categorias = await Productos.distinct('category') //Obtenemos las categorias

        //Buscamos el producto
        let producto = await searchProductByID(productId);

        if (producto.length <= 0) {
            return res.status(404).send("Producto no encontrado");
        }

        producto = producto[0]; //Invariante solo tomamos el primer producto

        //Obtenemos los productos de categoria y le damos tres
        let productos_similares = await productsByCategory(producto.category)

        //Vemos que ninguno es el mismo 
        let index = 0;
        for (let similar of productos_similares) {
            if (similar.id == producto.id) {
                productos_similares.splice(index, 1);
                break; //Salimos del producto
            }
            index++;
        }

        //Dejamos solo 3
        productos_similares = productos_similares.slice(0, 3)

        let carrito_unavailable = false;

        if (!req.session.carrito) {
            carrito_unavailable = true;
        }
        else {
            if (req.session.carrito.length <= 0) {
                carrito_unavailable = true;
            }
        }

        //Renderizamos la vista del producto
        res.render('producto.html', { categorias, producto, productos_similares, carrito_unavailable, usuario : req.username, admin: req.user_is_admin });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

router.get('/categorias/:category', async (req, res) => {
    const category = req.params.category;

    try {
        const categorias = await Productos.distinct('category') //Obtenemos las categorias

        const productos = await productsByCategory(category);

        let carrito_unavailable = false;

        if (!req.session.carrito) {
            carrito_unavailable = true;
        }
        else {
            if (req.session.carrito.length <= 0) {
                carrito_unavailable = true;
            }
        }

        res.render('listado_productos.html', { categorias, productos, "titulo": category, category, carrito_unavailable, usuario : req.username }) //Pasamos dos veces category para el formateo en el html
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

//Ruta POST para añadir productos al carrito
router.post('/carrito/agregar/:id', async (req, res) => {
    const productId = parseInt(req.params.id);

    try {

        //Buscamos el producto
        let producto = await searchProductByID(productId);

        if (producto.length <= 0) {
            return res.status(404).send("Producto no encontrado");
        }

        producto = producto[0]; //Invariante solo tomamos el primer producto

        //Creamos el carrito de la sesion si no existe
        if (!req.session.carrito) {
            req.session.carrito = [];
        }

        //Agregamos el producto al carrito con toda la info a usar para evitar consulta a la base de datos
        //Comprobamos si ya estaba el producto en el carrito
        const productoExistente = req.session.carrito.find(item => item.id == producto.id);

        if (productoExistente) {
            productoExistente.quantity += 1;
        } else {
            req.session.carrito.push({
                id: producto.id,
                title: producto.title,
                price: producto.price,
                description: producto.description,
                image: producto.image,
                quantity: 1
            })
        }

        res.status(200).json({ message: "Producto añadido al carrito con éxito" });
    } catch (err) {
        console.error("Error al agregar al carrito:", err);
        res.status(500).send(err);
    }
})

// Para ver el carrito
router.get('/carrito', async (req, res) => {
    try {
        const categorias = await Productos.distinct('category') //Obtenemos las categorias

        const carrito_actual = await req.session.carrito;

        let carrito_unavailable = false;

        if (!req.session.carrito) {
            carrito_unavailable = true;
            res.redirect('/portada');
        }
        else {
            if (req.session.carrito.length <= 0) {
                carrito_unavailable = true;

                res.redirect('/portada');
            }
            else {
                res.render('carrito.html', { categorias, carrito_actual, carrito_unavailable, usuario : req.username }) //Pasamos dos veces category para el formateo en el html
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

//Lógica para aumentar y disminuir la cantidad de un elemento en el carrito
router.post('/carrito/aumentar/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const producto = req.session.carrito.find(item => item.id == productId);

        if (producto) {
            producto.quantity += 1;
            res.status(200).json({ message: "Cantidad aumentada", quantity: producto.quantity });
        }
        else {
            res.status(404).json({ message: "Producto no encontrado en el carrito" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

router.post('/carrito/disminuir/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const producto = req.session.carrito.find(item => item.id == productId);

        if (producto) {
            producto.quantity -= 1;
            res.status(200).json({ message: "Cantidad aumentada", quantity: producto.quantity });
        }
        else {
            res.status(404).json({ message: "Producto no encontrado en el carrito" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

router.get('/carrito/delete/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        let producto;

        if (req.session.carrito) {
            producto = req.session.carrito.find(item => item.id == productId);
        }
        else {
            producto = false;
        }

        if (producto) {
            const index = req.session.carrito.indexOf(producto);
            req.session.carrito.splice(index, 1);

            res.redirect('/carrito');
        }
        else {
            res.status(404).json({ message: "Producto no encontrado en el carrito" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
})

//Para poder modificar los productos
router.post('/producto/editar/:id', async (req,res) => {
    const new_title = req.body.title;
    const new_price = req.body.price;
    const productID = req.params.id;

    try{
        let productoOriginal = await searchProductByID(productID);
        productoOriginal = productoOriginal[0]; //Nos devuelve un array

        //Actualizamos el producto
        productoOriginal.title = new_title;
        productoOriginal.price = parseFloat(new_price);
        await productoOriginal.save();

        res.json({ message: 'Cambios guardados correctamente'});
    } catch(error){
        console.log(error);
        res.status(500).json({ message: "Error al guardar los cambios"});
    }
})

router.get('/', async (req, res) => {
    try {
        res.redirect('/portada');
    } catch (err) {
        res.status(500).send({ err });
    }
})

export default router