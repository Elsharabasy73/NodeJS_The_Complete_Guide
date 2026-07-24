const backdrop = document.querySelector(".backdrop");
const sideDrawer = document.querySelector(".mobile-nav");
const menuToggle = document.querySelector("#side-menu-toggle");
const closeButton = document.querySelector(".mobile-nav__close");
let previouslyFocusedElement;

function closeMenu() {
  backdrop.classList.remove("open");
  sideDrawer.classList.remove("open");
  sideDrawer.setAttribute("aria-hidden", "true");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
  if (previouslyFocusedElement) previouslyFocusedElement.focus();
}

function openMenu() {
  previouslyFocusedElement = document.activeElement;
  backdrop.classList.add("open");
  sideDrawer.classList.add("open");
  sideDrawer.setAttribute("aria-hidden", "false");
  menuToggle.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
  closeButton.focus();
}

if (backdrop && sideDrawer && menuToggle && closeButton) {
  backdrop.addEventListener("click", closeMenu);
  menuToggle.addEventListener("click", openMenu);
  closeButton.addEventListener("click", closeMenu);
  sideDrawer
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sideDrawer.classList.contains("open"))
      closeMenu();
  });
}
