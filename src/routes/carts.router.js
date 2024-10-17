import { Router } from 'express';
import cartModel from '../models/cart.model.js';
import productModel from '../models/product.model.js';

const router = Router();

// Mostrar la vista de todos los carritos
router.get('/', async (req, res) => {
    try {
        const carts = await cartModel.find();
        res.render('carts', { carts, title: 'Lista de Carritos', style: 'carts.css' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener solo los IDs de los carritos
router.get('/cart-ids', async (req, res) => {
    try {
      const carts = await cartModel.find({}, { _id: 1 });  // Solo obtener los IDs
      res.json(carts);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener los carritos' });
    }
});

// Mostrar los detalles de un carrito específico
router.get('/:cid', async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid).populate('cartProducts.product');
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        res.render('cartDetails', { cart, title: `Detalles del Carrito de ${cart.first_name}`, style: 'cartDetails.css' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// POST /api/carts/ - Crear un nuevo carrito
router.post('/', async (req, res) => {
  try {
    const newCart = new cartModel({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      cartProducts: []
    });
    await newCart.save();
    res.status(201).json(newCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/carts/:cid/product/:pid - Agregar un producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cart = await cartModel.findById(req.params.cid);
    const product = await productModel.findById(req.params.pid);

    if (!cart || !product) {
      return res.status(404).json({ error: 'Carrito o producto no encontrado' });
    }

    const productInCart = cart.cartProducts.find(p => p.product._id.equals(product._id));

    if (productInCart) {
      productInCart.qty += 1; // Si ya existe, incrementa la cantidad
    } else {
      cart.cartProducts.push({ product: product._id, qty: 1 }); // Si no existe, lo agrega
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar un producto del carrito
router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        // Filtra los productos para eliminar el producto con el ID dado
        cart.cartProducts = cart.cartProducts.filter(p => !p.product.equals(req.params.pid));

        // Guarda el carrito actualizado en la base de datos
        await cart.save();

        res.json({ message: 'Producto eliminado del carrito', cart });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el producto del carrito' });
    }
});

// PUT /api/carts/:cid - Actualizar carrito completo con un arreglo de productos
/* request para hacer con postman: http://localhost:8080/api/carts/67107731758a6a7e52c47c21
    {
    "products": [
        { "productId": "67106bf4758a6a7e52c47bea", "qty": 5 },
        { "productId": "67106bf4758a6a7e52c47beb", "qty": 2 }
    ]
    }
*/
router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;  // El arreglo de productos vendrá en el body de la petición.

    // Verificar que el arreglo de productos no esté vacío o que sea válido
    if (!products || !Array.isArray(products)) {
        return res.status(400).json({ error: 'El arreglo de productos es inválido o no existe.' });
    }

    try {
        // Buscar el carrito por ID
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado.' });
        }

        // Validar que cada producto en el arreglo tenga el formato correcto
        const updatedProducts = [];
        for (const product of products) {
            const { productId, qty } = product;

            if (!productId || !qty || qty <= 0) {
                return res.status(400).json({ error: 'Cada producto debe tener un productId válido y una cantidad mayor que 0.' });
            }

            // Verificar si el producto existe en la base de datos
            const existingProduct = await productModel.findById(productId);
            if (!existingProduct) {
                return res.status(404).json({ error: `Producto con ID ${productId} no encontrado.` });
            }

            // Agregar el producto actualizado al arreglo
            updatedProducts.push({
                product: productId,
                qty: qty
            });
        }

        // Actualizar los productos en el carrito
        cart.cartProducts = updatedProducts;

        // Guardar los cambios
        await cart.save();

        res.json({ message: 'Carrito actualizado correctamente.', cart });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el carrito.' });
    }
});

// PUT /api/carts/:cid/products/:pid/quantity
router.put('/:cid/products/:pid/quantity', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Cantidad inválida' });
    }

    try {
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        // Encontrar el producto en el carrito
        const productInCart = cart.cartProducts.find(p => p.product._id.toString() === pid.toString());
        if (!productInCart) {
            return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }

        // Actualizar la cantidad del producto
        productInCart.qty = quantity;

        // Guarda los cambios en la base de datos
        await cart.save();
        res.json({ message: 'Cantidad actualizada', cart });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar la cantidad' });
    }
});

// Eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        // Filtrar los productos para eliminar el producto con el ID dado
        const initialLength = cart.cartProducts.length;  // Guardamos la cantidad inicial
        cart.cartProducts = cart.cartProducts.filter(p => p.product._id.toString() !== pid);

        if (cart.cartProducts.length === initialLength) {
            // Si la longitud no cambió, significa que no se encontró el producto
            return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }

        // Guarda el carrito actualizado en la base de datos
        await cart.save();

        res.json({ message: 'Producto eliminado del carrito', cart });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el producto del carrito' });
    }
});

export default router;
