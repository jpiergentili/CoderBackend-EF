const socket = io(); // Inicializo la conexión con el servidor WebSocket

// Formulario para agregar productos
const addProductForm = document.getElementById("addProductForm");
addProductForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(addProductForm);
    const productData = {};
    formData.forEach((value, key) => {
        productData[key] = value;
    });

    // Emitir el evento de agregar producto
    socket.emit("addProduct", productData);
});

// SweetAlert2 para notificación satisfactoria o error
socket.on("productAdded", (newProduct) => {
    Swal.fire({
        icon: "success",
        title: "Producto Agregado",
        text: `Producto "${newProduct.title}" agregado exitosamente`,
        timer: 2000,
        showConfirmButton: false,
    });

    // Actualizo el DOM agregando el nuevo producto directamente a la tabla
    const tableBody = document.querySelector("tbody");

    // Crear una nueva fila con los datos del nuevo producto
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${newProduct.id}</td>
        <td>${newProduct.title}</td>
        <td>${newProduct.description}</td>
        <td>${newProduct.price}</td>
        <td>${newProduct.category}</td>
        <td>${newProduct.stock}</td>
        <td>
            <button class="btn btn-danger delete-btn" data-id="${newProduct.id}">Eliminar</button>
        </td>
    `;

    // Agregar la nueva fila al final de la tabla
    tableBody.appendChild(row);

    // Restablezco el formulario después de agregar el producto
    addProductForm.reset();
});

// SweetAlert2 para notificación de error
socket.on("productAddError", (errorMessage) => {
    Swal.fire({
        icon: "error",
        title: "Error al Agregar Producto",
        text: errorMessage,
    });
});

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
                <td>${product.id}</td>
                <td>${product.title}</td>
                <td>${product.description}</td>
                <td>${product.price}</td>
                <td>${product.category}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="btn btn-danger delete-btn" data-id="${product.id}">Eliminar</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
});
