import { Router } from "express";
import productModel from "../models/product.model.js";  // Asegúrate de importar el modelo correcto

const router = Router();

// Ruta para la vista de productos en tiempo real
router.get('/realtimeproducts', async (req, res) => {
  const products = await productManager.getProducts();
  res.render("realTimeProducts", {
    products,
    title: "Mercadoliebre",
    style: "realTimeProducts.css",
  });
});

// Ruta para la vista estática de productos
router.get("/", async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : null;
  try {
    // Si existe un límite, devuelve solo esa cantidad de productos
    const products = limit ? await productModel.find().limit(limit) : await productModel.find();
    res.render("home", {
      products,
      title: "Mercadoliebre",
      style: "home.css",
    });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

export default router;
