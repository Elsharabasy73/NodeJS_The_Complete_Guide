const fs = require("fs");
const path = require("path");

const imagesDirectory = path.resolve(__dirname, "..", "images");

const deleteFile = (filePath) => {
  if (!filePath || typeof filePath !== "string") {
    return;
  }

  const absolutePath = path.resolve(__dirname, "..", filePath);
  if (
    absolutePath !== imagesDirectory &&
    !absolutePath.startsWith(`${imagesDirectory}${path.sep}`)
  ) {
    console.warn(
      `Refusing to delete a file outside the images directory: ${filePath}`,
    );
    return;
  }

  fs.unlink(absolutePath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error(`Could not delete image ${filePath}:`, err);
    }
  });
};
exports.deleteFile = deleteFile;
