import { Router } from "express";
import productModel from "../models/product.model.js";

const router = Router();

router.get("/", async (req, res) => {
  const { limit = 10, page = 1, sort, query } = req.query;

  const filter = {};
  if (query) {
    filter.$or = [
      { category: query },
      { status: query === "available" ? true : false },
    ];
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {},
    lean: true,
  };

  try {
    const products = await productModel.paginate(filter, options);
    const {
      docs,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
    } = products;

    // Generar los enlaces de las páginas
    const pagesToShow = 5;
    let pagination = { pages: [], showEllipsis: false, totalPages };

    // Mostrar las primeras 2 páginas, páginas cercanas a la actual, y las últimas 2 páginas
    let startPage = Math.max(1, page - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages, page + Math.floor(pagesToShow / 2));

    if (startPage === 1) {
      endPage = Math.min(totalPages, startPage + pagesToShow - 1);
    }
    if (endPage === totalPages) {
      startPage = Math.max(1, totalPages - pagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pagination.pages.push({
        page: i,
        link: `/api/products?page=${i}&limit=${limit}&sort=${
          sort || ""
        }&query=${query || ""}`,
        isCurrent: i === page,
      });
    }

    if (startPage > 2) {
      pagination.pages.unshift({
        page: 1,
        link: `/api/products?page=1&limit=${limit}&sort=${sort || ""}&query=${
          query || ""
        }`,
      });
      pagination.pages.splice(1, 0, { isEllipsis: true });
    }

    if (endPage < totalPages - 1) {
      pagination.pages.push({ isEllipsis: true });
      pagination.pages.push({
        page: totalPages,
        link: `/api/products?page=${totalPages}&limit=${limit}&sort=${
          sort || ""
        }&query=${query || ""}`,
      });
    }

    const prevLink = hasPrevPage
      ? `/api/products?page=${prevPage}&limit=${limit}&sort=${
          sort || ""
        }&query=${query || ""}`
      : null;
    const nextLink = hasNextPage
      ? `/api/products?page=${nextPage}&limit=${limit}&sort=${
          sort || ""
        }&query=${query || ""}`
      : null;

    res.render("home", {
      products: docs,
      title: "Productos",
      style: "home.css",
      totalPages,
      page,
      prevLink,
      nextLink,
      hasPrevPage,
      hasNextPage,
      pagination,
      sort,
      query,
    });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// Ruta para la vista de actualizar producto
router.get("/update/:pid", async (req, res) => {
  const productId = req.params.pid;
  try {
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.render("updateProduct", {
      product,
      title: "Actualizar Producto",
      style: "home.css",
    });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

// Actualizar producto
router.put("/:pid", async (req, res) => {
  const productId = req.params.pid;
  const { title, description, price, thumbnails, code, stock, category } =
    req.body;

  try {
    const updatedProduct = await productModel.findByIdAndUpdate(
      productId,
      {
        title,
        description,
        price,
        thumbnails,
        code,
        stock,
        category,
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(updatedProduct); // Respuesta con el producto actualizado
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

// Ruta para la vista de crear producto
router.get("/create", (req, res) => {
  res.render("createProduct", { title: "Crear Producto", style: "home.css" });
});

// Crear producto
router.post("/", async (req, res) => {
  const { title, description, price, thumbnails, code, stock, category } =
    req.body;

  try {
    // Validar que el código no exista ya en la base de datos
    const existingProduct = await productModel.findOne({ code });
    if (existingProduct) {
      return res
        .status(400)
        .json({ error: "El código del producto ya existe" });
    }

    // Crear el nuevo producto
    const newProduct = new productModel({
      title,
      description,
      price,
      thumbnails,
      code,
      stock,
      category,
    });

    await newProduct.save();
    res.status(201).json({ message: "Producto creado exitosamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al crear el producto" });
  }
});

// Eliminar producto
router.delete("/:pid", async (req, res) => {
  const productId = req.params.pid;
  try {
    const deletedProduct = await productModel.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

export default router;
