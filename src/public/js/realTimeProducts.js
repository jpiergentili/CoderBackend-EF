const socket = io(); // Inicializo la conexión con el servidor WebSocket

// Botones para eliminar productos
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-btn")) {
    const productId = event.target.getAttribute("data-id");

    // Emitir el evento de eliminar producto
    socket.emit("deleteProduct", productId);

    // SweetAlert2 para notificación de éxito
    socket.on("productDeleted", (message) => {
      Swal.fire({
        icon: "success",
        title: "Producto Eliminado",
        text: message,
        timer: 2000,
        showConfirmButton: false,
      });

      // Eliminar la fila correspondiente del DOM
      event.target.closest('tr').remove();
    });

    // SweetAlert2 para notificación de error
    socket.on("productDeleteError", (errorMessage) => {
      Swal.fire({
        icon: "error",
        title: "Error al Eliminar Producto",
        text: errorMessage,
      });
    });
  }
});

// Actualizar la tabla de productos cuando se actualicen
socket.on("productsUpdated", (products) => {
  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = "";  // Limpiar tabla
  products.forEach((product) => {
    const row = `
      <tr>
        <td>${product._id}</td>
        <td>${product.title}</td>
        <td>${product.description}</td>
        <td>${product.price}</td>
        <td>${product.category}</td>
        <td>${product.stock}</td>
        <td>
          <button class="btn btn-danger delete-btn" data-id="${product._id}">Eliminar</button>
        </td>
        <td>
          <a href="/api/products/update/${product._id}" class="btn btn-warning">Actualizar</a>
        </td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
});
