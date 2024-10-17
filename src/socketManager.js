// socketManager.js
import productModel from './models/product.model.js'; // Asegúrate de importar el modelo correcto

export const configureWebSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado");

    // Agregar producto
    socket.on("addProduct", async (productData) => {
      try {
        const newProduct = new productModel(productData);
        await newProduct.save();
        io.emit("productAdded", newProduct);
        const products = await productModel.find();  // Obtener todos los productos actualizados
        io.emit("productsUpdated", products);
      } catch (error) {
        socket.emit("productAddError", "Hubo un error al agregar el producto");
      }
    });

    // Eliminar producto
    socket.on("deleteProduct", async (productId) => {
      try {
        await productModel.findByIdAndDelete(productId);
        io.emit("productDeleted", "Producto eliminado exitosamente");
        const products = await productModel.find();  // Obtener todos los productos actualizados
        io.emit("productsUpdated", products);
      } catch (error) {
        socket.emit("productDeleteError", "Hubo un error al eliminar el producto");
      }
    });
  });
};
