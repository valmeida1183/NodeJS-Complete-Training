const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  const productId = req.params.productId;

  if (!editMode) {
    return res.redirect("/");
  }
  req.user
    .getProducts({ where: { id: productId } })
    //Product.findByPk(productId)
    .then((products) => {
      const product = products[0];
      if (product.length === 0) {
        return res.redirect("/");
      }

      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const { title, imageUrl, description, price } = req.body;
  Product.findByPk(productId)
    .then((product) => {
      product.title = title;
      product.imageUrl = imageUrl;
      product.description = description;
      product.price = price;

      return product.save();
    })
    .then((result) => {
      console.log("Updated Product!");
      res.redirect("/admin/product-list");
    })
    .catch((err) => console.log(err));
};

exports.getAdminProducts = (req, res, next) => {
  req.user
    .getProducts()
    .then((products) => {
      res.render("admin/product-list", {
        prods: products,
        pageTitle: "Admin Product List",
        path: "/admin/product-list",
      });
    })
    .catch((err) => console.log(err));
};

exports.postAddProduct = (req, res, next) => {
  const { title, imageUrl, description, price } = req.body;
  req.user
    .createProduct({
      // método criado pelo sequelize devido as configs de relacionamento
      title,
      price,
      imageUrl,
      description,
    })
    .then((result) => {
      //console.log(result);
      console.log("Created Product!");
      res.redirect("/admin/product-list");
    })
    .catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.findByPk(productId)
    .then((product) => {
      return product.destroy();
    })
    .then((result) => {
      console.log("Deleted Product!");
      res.redirect("/admin/product-list");
    })
    .catch((err) => console.log(err));
};
