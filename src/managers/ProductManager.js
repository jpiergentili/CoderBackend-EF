import fs from 'fs';
import path from 'path';
import __dirname from '../utils.js';

// Ruta absoluta al archivo productos.json
const fileProductos = path.resolve(__dirname, 'data', 'products.json');

console.log(`Ruta del archivo productos.json: ${fileProductos}`);

class ProductManager {
  #products;
  constructor() {
    this.#products = [];
  }

  async init() {
    try {
      const data = await fs.promises.readFile(fileProductos, 'utf-8');
      this.#products = JSON.parse(data);
      console.log(`Se cargaron ${this.#products.length} productos desde el archivo "products.json"`);
    } catch (err) {
      console.log('Error: No se pudo leer el archivo de productos!');
      throw err;
    }
  }

  async getProducts(limit) {
    try {
      if (limit !== null) {
        return this.#products.slice(0, limit);
      } else {
        return this.#products;
      }
    } catch (err) {
      console.error('No se pudo obtener la lista de productos', err);
      throw err;
    }
  }

  async getProductById(id) {
    const product = this.#products.find((p) => p.id === +id);
    if (!product) {
      throw new Error(`No se encontró el producto con el ID ${id}`);
    }
    return product;
  }

  #generateID = () => {
    const ids = this.#products.map(product => product.id).sort((a, b) => a - b);
    let id = 1;
    for (let i = 0; i < ids.length; i++) {
      if (ids[i] !== id) {
        break;
      }
      id++;
    }
    return id;
  }
  
  async addProduct(productData) {
    const { title, description, price, thumbnails, code, stock, category } = productData;
    if (!title || !description || !price || !code || !stock || !category) {
      console.error('Error: Todos los campos son obligatorios');
      throw new Error('Todos los campos son obligatorios');
    }
  
    if (this.#products.some(p => p.code === code)) {
      console.error(`Error: Ya existe un producto con el código ${code}`);
      throw new Error(`Ya existe un producto con el código ${code}`);
    }
  
    let id = this.#generateID();
  
    let newProduct = { 
      id, 
      title, 
      description, 
      price, 
      thumbnails: thumbnails || [],
      code, 
      stock, 
      category,
      status: true 
    };
  
    try {
      // Lee el archivo y actualiza la propiedad #products
      let existingProducts = await fs.promises.readFile(fileProductos, 'utf-8');
      existingProducts = JSON.parse(existingProducts);
      existingProducts.push(newProduct);
  
      // Actualiza la propiedad #products
      this.#products = existingProducts;
  
      // Escribe en el archivo
      await fs.promises.writeFile(fileProductos, JSON.stringify(existingProducts, null, '\t'));
      console.log(`Se agregó el producto: "${title}"`);
      return newProduct;
    } catch (err) {
      console.error('Error: No se pudo agregar el producto', err);
      throw err;
    }
  }

  async updateProduct(id, json) {
    if (!id || !json) {
      console.error('Error: Todos los campos son obligatorios');
      return;
    }
    try {
      const product = await this.getProductById(+id);
      const oldValues = {};
      let isModified = false;
  
      for (let prop in json) {
        if (product.hasOwnProperty(prop)) {
          oldValues[prop] = product[prop];
          product[prop] = json[prop];
          isModified = true;
        }
      }
  
      if (!isModified) {
        console.error('Error: No se encontraron propiedades validas para actualizar');
        return;
      }
  
      const indexProduct = this.#products.findIndex((oldProduct) => oldProduct.id === product.id);
  
      if (indexProduct === -1) {
        console.error(`Error: No se encontró el producto con el ID ${id}`);
        return;
      }
  
      this.#products[indexProduct] = product;
  
      await fs.promises.writeFile(fileProductos, JSON.stringify(this.#products, null, '\t'));
  
      console.log(`El producto "${product.title}" ha sido actualizado: ${JSON.stringify(oldValues)} -> ${JSON.stringify(json)}`);  
      return product;
    } catch (err) {
      console.error('Error: No se pudo actualizar el producto', err);
      throw err;
    }
  }

  async deleteProduct(id) {
    if (!id) {
      console.error('Error: Todos los campos son obligatorios');
      return;
    }
    if (typeof(id) !== "number") {
      console.error('Error: Ingrese valores validos');
      return;
    }
    try {
      const productDeleted = await this.getProductById(Number(id));
      this.#products = this.#products.filter(objeto => objeto.id !== id);
      await fs.promises.writeFile(fileProductos, JSON.stringify(this.#products, null, '\t'));
      console.log(`El producto "${productDeleted.title}" ha sido eliminado correctamente`);
    } catch (err) {
      console.error('Error al borrar el producto', err);
      throw err;
    }
  }
}

export default ProductManager;
