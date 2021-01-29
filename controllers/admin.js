const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product" ,
    editing: false,  
  });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;    

  if (!editMode) {
   return res.redirect('/');
  }

  const productId = req.params.productId;
  Product.findById(productId)
    .then(([product]) => {
      if (product.length === 0) {
        return res.redirect('/');
      }

      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product[0]    
      });
    })
    .catch(err => console.log(err));  
};

exports.postEditProduct = (req, res, next) => { 
  const productId = req.body.productId; 
  const {title, imageUrl, description, price} = req.body;
  const updatedProduct = new Product(
    productId,
    title,
    imageUrl,
    description,
    price
  )

  updatedProduct.save();
  res.redirect('/admin/product-list');
};

exports.getAdminProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("admin/product-list", {
      prods: products,
      pageTitle: "Admin Product List",
      path: "/admin/product-list",
    });
  });
};


exports.postAddProduct = (req, res, next) => {
  const {title, imageUrl, description, price} = req.body;
  const product = new Product(null, title, imageUrl, description, price);

  product
    .save()
    .then(() => {
      res.redirect("/");
    })
    .catch(err => console.log(err));  
};

exports.postDeleteProduct = (req, res, next) => { 
  const productId = req.body.productId;
  Product.deleteById(productId);
  res.redirect('/admin/product-list');
};
