import express from "express";
import path from "path";
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const uri = 'mongodb+srv://jp2:Q1w2e3r4@jp-backend-coder01.bavi18s.mongodb.net/backendP1-EntregaFinal';
const app = express();

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log('DB connected!');
  } catch (error) {
    console.log("No se pudo conectar con la base de datos!!", error);
  }
};

// Llamar a la función de conexión a la base de datos
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

// Configuración de Handlebars
app.engine("handlebars", handlebars.engine({
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
}));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "handlebars");

// Ruta para la gestión de productos
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Ruta principal
app.get('/', (req, res) => {
  res.redirect('/api/products');
});

app.get('/carts', async (req, res) => {
  const carts = await cartModel.find();
  res.render('carts', { carts });
});

app.get('/api/carts/:cid', async (req, res) => {
  const cart = await cartModel.findById(req.params.cid).populate('cartProducts.product');
  res.render('cartDetails', { cart });
});

// Inicializar el servidor http
const httpServer = app.listen(8080, () => {
  console.log("Servidor escuchando en el puerto 8080");
});
