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

// Función para mostrar SweetAlert y agregar producto al carrito
document.addEventListener("click", async (event) => {
  if (event.target.classList.contains("add-to-cart-btn")) {
    const productId = event.target.getAttribute("data-id");

    try {
      // Obtener los IDs de los carritos disponibles
      const response = await fetch('/api/carts/cart-ids');
      const carts = await response.json();

      if (carts.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No hay carritos disponibles",
        });
        return;
      }

      // Crear el dropdown con los IDs de los carritos
      const cartOptions = carts.map(cart => `<option value="${cart._id}">${cart._id}</option>`).join('');

      // Mostrar el SweetAlert con el dropdown de carritos
      const { value: selectedCartId } = await Swal.fire({
        title: 'Selecciona un carrito',
        html: `
          <select id="cartSelect" class="swal2-select">
            ${cartOptions}
          </select>
        `,
        showCancelButton: true,
        confirmButtonText: 'Agregar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const cartId = Swal.getPopup().querySelector('#cartSelect').value;
          if (!cartId) {
            Swal.showValidationMessage('Debes seleccionar un carrito');
          }
          return cartId;
        }
      });

      if (selectedCartId) {
        // Enviar la solicitud al servidor para agregar el producto al carrito
        const addProductResponse = await fetch(`/api/carts/${selectedCartId}/product/${productId}`, {
          method: 'POST',
        });

        if (addProductResponse.ok) {
          Swal.fire({
            icon: "success",
            title: "Producto agregado",
            text: `Producto agregado exitosamente al carrito ${selectedCartId}`,
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un problema al agregar el producto al carrito",
          });
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al obtener los carritos.",
      });
    }
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
          <button class="btn btn-success add-to-cart-btn" data-id="${product._id}">Agregar</button>
        </td>
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
