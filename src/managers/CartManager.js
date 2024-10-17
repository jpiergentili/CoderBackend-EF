import fs from 'fs';
import path from 'path';
import __dirname from '../utils.js';

// Ruta al archivo de carritos
const filecarrito = path.resolve(__dirname, 'data', 'carts.json');

class CartManager {
  #carts;
  constructor() {
    this.#carts = [];
  }

  async init() {
    try {
      const data = await fs.promises.readFile(filecarrito, 'utf-8');
      this.#carts = JSON.parse(data);
      console.log(`Se cargaron ${this.#carts.length} carritos desde el archivo "carrito.json"`);
    } catch (err) {
      console.log('Error: No se pudo leer el archivo del carrito!');
      throw err;
    }
  }

  async getCartById(id) {
    const cart = this.#carts.find(cart => cart.id === +id);
    if (!cart) {
      throw new Error(`El carrito con id "${id}" no existe`);
    }
    return cart;
  }

  async createCart() {
    const id = this.#carts.length ? Math.max(this.#carts.map(c => c.id)) + 1 : 1;
    const newCart = { id, products: [] };
    this.#carts.push(newCart);
    await fs.promises.writeFile(filecarrito, JSON.stringify(this.#carts, null, '\t'));
    return newCart;
  }

  async addProductToCart(cartID, productID) {
    const cart = await this.getCartById(+cartID);
    const productIndex = cart.products.findIndex(p => p.id === +productID);

    if (productIndex !== -1) {
      cart.products[productIndex].quantity++;
    } else {
      cart.products.push({ id: +productID, quantity: 1 });
    }

    await fs.promises.writeFile(filecarrito, JSON.stringify(this.#carts, null, '\t'));
    return cart;
  }

  async removeProductFromCart(cartID, productID) {
    const cart = await this.getCartById(+cartID);
    cart.products = cart.products.filter(p => p.id !== +productID);
    await fs.promises.writeFile(filecarrito, JSON.stringify(this.#carts, null, '\t'));
    return cart;
  }

  async updateProductQuantity(cartID, productID, quantity) {
    const cart = await this.getCartById(cartID);
    const product = cart.products.find(p => p.id === +productID);

    if (product) {
      product.quantity = +quantity;
      if (product.quantity <= 0) {
        cart.products = cart.products.filter(p => p.id !== +productID);
      }
    } else {
      throw new Error(`El producto con id "${productID}" no está en el carrito`);
    }

    await fs.promises.writeFile(filecarrito, JSON.stringify(this.#carts, null, '\t'));
    return cart;
  }

  async clearCart(cartID) {
    const cart = await this.getCartById(+cartID);
    cart.products = [];
    await fs.promises.writeFile(filecarrito, JSON.stringify(this.#carts, null, '\t'));
    return cart;
  }
}

export default CartManager;
