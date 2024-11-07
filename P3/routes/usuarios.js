import express from "express";

const router = express.Router();

// Para mostrar el formulario de login
router.get('/login', (req, res) => {
    res.render("login.html");
})

export default router;