import { Router } from "express";
import productModel from "../models/product.model.js";  // Asegúrate de importar el modelo correcto

const router = Router();

// Ruta para la vista de productos en tiempo real
router.get('/realtimeproducts', async (req, res) => {
  const { limit = 10, page = 1, sort, query } = req.query;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sort ? { price: sort === "asc" ? 1 : -1 } : {} // Ordenar por precio ascendente o descendente
  };

  try {
    const filters = query ? { category: { $regex: query, $options: "i" } } : {}; // Filtro por categoría
    const result = await productModel.paginate(filters, options);  // Usar mongoose-paginate-v2

    // Generar las páginas para mostrar
    const pages = Array.from({ length: result.totalPages }, (_, index) => ({
      number: index + 1,
      active: index + 1 === result.page
    }));

    res.render("realTimeProducts", {
      products: result.docs,
      title: "Mercadoliebre - Tiempo Real",
      style: "realTimeProducts.css",
      ...result,  // Pasa toda la información de paginación
      pages,  // Pasa el array de páginas
      query,
      limit,
      sort
    });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
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
