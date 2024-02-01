console.log("script");
const deleteProduct = (btn) => {
  console.log(btn.parentNode.querySelector("[name=_csrf]").value);
  console.log(btn.parentNode.querySelector("[name=productId]").value);
};
