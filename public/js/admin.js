const productGrid = document.querySelector("#product-grid");
const statusMessage = document.querySelector("#admin-status");

if (productGrid) {
  productGrid.addEventListener("click", async (event) => {
    const button = event.target.closest(".delete-product");
    if (!button) return;

    const confirmed = window.confirm(
      `Delete “${button.dataset.productTitle}”? This action cannot be undone.`,
    );
    if (!confirmed) return;

    const productElement = button.closest("article");
    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = "Deleting…";
    statusMessage.hidden = true;

    try {
      const response = await fetch(
        `/admin/product/${button.dataset.productId}`,
        {
          method: "DELETE",
          headers: { "csrf-token": button.dataset.csrf },
        },
      );

      if (!response.ok)
        throw new Error("The product could not be deleted. Please try again.");
      productElement.remove();

      if (!productGrid.querySelector("article")) {
        productGrid.innerHTML =
          '<section class="empty-state"><div class="empty-state__icon" aria-hidden="true">+</div><h1>Catalog is empty</h1><p>Add a product when you are ready to publish again.</p><div class="empty-state__actions"><a class="btn" href="/admin/add-product">Add a product</a></div></section>';
      }
    } catch (error) {
      statusMessage.textContent = error.message;
      statusMessage.hidden = false;
      button.disabled = false;
      button.textContent = originalLabel;
    }
  });
}
