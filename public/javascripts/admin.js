document.addEventListener("DOMContentLoaded", function () {
  // ===== SIDEBAR TOGGLE =====
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.querySelector(".sidebar");
  const sidebarOverlay = document.createElement("div");
  sidebarOverlay.className = "sidebar-overlay";
  document.body.appendChild(sidebarOverlay);

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function (e) {
      e.preventDefault();
      sidebar.classList.toggle("show");

      if (sidebar.classList.contains("show")) {
        sidebarOverlay.style.display = "block";
        document.body.style.overflow = "hidden";
      } else {
        sidebarOverlay.style.display = "none";
        document.body.style.overflow = "";
      }
    });
  }

  sidebarOverlay.addEventListener("click", function () {
    sidebar.classList.remove("show");
    this.style.display = "none";
    document.body.style.overflow = "";
  });

  // ===== TOOLTIPS =====
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // ===== WINDOW RESIZE HANDLING =====
  function handleResize() {
    if (window.innerWidth > 992) {
      sidebar.classList.remove("show");
      sidebarOverlay.style.display = "none";
      document.body.style.overflow = "";
    }
  }
  window.addEventListener("resize", handleResize);

  // ===== VIEW PRODUCT =====
  document.querySelectorAll(".view-product").forEach((button) => {
    button.addEventListener("click", async function () {
      const productId = this.getAttribute("data-id");
      const row = this.closest("tr");

      const productData = {
        id: row.cells[0].textContent,
        name: row.cells[2].textContent,
        category: row.cells[3].textContent,
        price: row.cells[4].textContent,
        stock: row.cells[5].textContent,
        status: row.cells[6].querySelector(".badge").textContent,
        image: row.cells[1].querySelector("img").src,
      };

      document.getElementById("viewProductId").textContent = productData.id;
      document.getElementById("viewProductName").textContent = productData.name;
      document.getElementById("viewProductCategory").textContent = productData.category;
      document.getElementById("viewProductPrice").textContent = productData.price;
      document.getElementById("viewProductStock").textContent = productData.stock;
      document.getElementById("viewProductStatus").textContent = productData.status;
      document.getElementById("viewProductImage").src = productData.image;
      document.getElementById("viewProductDescription").textContent = "Loading...";

      const viewModal = new bootstrap.Modal(document.getElementById("viewProductModal"));
      viewModal.show();

      try {
        button.disabled = true;
        const response = await fetch(`/admin/product/${productId}`);
        const product = await response.json();
        document.getElementById("viewProductDescription").textContent = product.description || 'No description available';
      } catch (err) {
        console.error("Failed to load full details", err);
        document.getElementById("viewProductDescription").textContent = "Failed to load description";
      } finally {
        button.disabled = false;
      }
    });
  });

  // ===== EDIT PRODUCT =====
  let currentEditProductId = null; // Store the current product ID being edited

  document.querySelectorAll(".edit-product").forEach((button) => {
    button.addEventListener("click", function () {
      const row = this.closest("tr");
      currentEditProductId = this.getAttribute("data-id"); // Store the product ID

      const productData = {
        id: currentEditProductId,
        name: row.cells[2].textContent.trim(),
        category: row.cells[3].textContent.trim(),
        price: row.cells[4].textContent.replace('$', '').trim(),
        stock: row.cells[5].textContent.trim(),
        status: row.cells[6].querySelector('.badge').textContent.trim() === 'In Stock',
        image: row.cells[1].querySelector('img').src,
      };

      document.getElementById("editProductId").value = productData.id;
      document.getElementById("editProductName").value = productData.name;
      document.getElementById("editProductCategory").value = productData.category;
      document.getElementById("editProductPrice").value = productData.price;
      document.getElementById("editProductStock").value = productData.stock;
      document.getElementById("editProductStatus").checked = productData.status;
      document.getElementById("editProductCurrentImage").src = productData.image;
      document.getElementById("editProductDescription").value = "Loading...";

      const editModal = new bootstrap.Modal(document.getElementById("editProductModal"));
      editModal.show();

      // Fetch additional product details
      fetch(`/admin/product/${currentEditProductId}`)
        .then(response => response.json())
        .then(product => {
          document.getElementById("editProductDescription").value = product.description || '';
        })
        .catch(err => {
          console.error("Failed to fetch product details", err);
          document.getElementById("editProductDescription").value = "";
        });
    });
  });

  // ===== HANDLE FORM SUBMIT FOR EDIT PRODUCT =====
  document.getElementById("editProductForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = this;
    
    // Get the submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Updating...
    `;

    try {
      const formData = new FormData(form);
      
      // Ensure we're using the correct product ID
      const productId = document.getElementById("editProductId").value || currentEditProductId;
      if (!productId) {
        throw new Error("No product ID found");
      }
console.log('product Id ',productId)
formData.append('id',productId)
      const response = await fetch(`/admin/edit-product`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      alert("Product updated successfully");
      location.reload();
    } catch (err) {
      console.error("Edit failed:", err);
      alert(err.message || "Something went wrong");
    } finally {
      // Reset submit button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
});


document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".delete-product").forEach(button => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-id");
      const row = this.closest("tr");
      const productName = row.cells[2].textContent;

      // Fill in modal content
      document.getElementById("deleteProductId").textContent = productId;
      document.getElementById("deleteProductName").textContent = productName;

      // Show the modal
      const deleteModal = new bootstrap.Modal(document.getElementById("deleteProductModal"));
      deleteModal.show();
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // When delete icon is clicked
  document.querySelectorAll(".delete-product").forEach(button => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-id");
      const row = this.closest("tr");
      const productName = row.cells[2].textContent;

      // Set product ID and name in modal
      document.getElementById("deleteProductId").textContent = productId;
      document.getElementById("deleteProductName").textContent = productName;

      // Set data-id on confirm button
      document.getElementById("confirmDelete").setAttribute("data-id", productId);

      // Show modal
      const deleteModal = new bootstrap.Modal(document.getElementById("deleteProductModal"));
      deleteModal.show();
    });
  });

  // When confirm delete button is clicked
  document.getElementById("confirmDelete").addEventListener("click", async function () {
    const productId = this.getAttribute("data-id");
console.log('data delete',productId)
    try {
      const response = await fetch(`/admin/delete-product/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Product deleted successfully");
        location.reload(); // Or dynamically remove row from DOM
      } else {
        const error = await response.json();
        alert("Delete failed: " + error.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Something went wrong");
    }
  });
});
