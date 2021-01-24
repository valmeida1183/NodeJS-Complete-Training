const express = require("express");
const path = require("path");

const rootDir = require("../utils/local-paths");
const adminData = require("./admin");

const router = express.Router();

router.get("/", (req, res, next) => {
  const products = adminData.products;
  //res.sendFile(path.join(rootDir, 'views', 'shop.html'));
  res.render("shop", {
    prods: products,
    pageTitle: "Shop",
    path: "/",
    hasProducts: products.length > 0,
    activeShop: true,
    productCSS: true
  }); // usa o arquivo de template shop.pug que está dentro da pasta views e injeta um objecto que contém a prop prods tornando os produtos disponíveis na view.
});

module.exports = router;
