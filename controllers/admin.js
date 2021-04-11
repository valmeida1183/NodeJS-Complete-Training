const Product = require('../models/mongoDb/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
    });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    const productId = req.params.productId;

    if (!editMode) {
        return res.redirect('/');
    }
    Product.findById(productId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }

            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
            });
        })
        .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const { title, imageUrl, description, price } = req.body;

    Product.findById(productId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }

            product.title = title;
            product.imageUrl = imageUrl;
            product.description = description;
            product.price = price;

            return product.save().then(() => {
                console.log('Updated Product!');
                res.redirect('/admin/product-list');
            });
        })
        .catch(err => console.log(err));
};

exports.getAdminProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        //.select('title prince -_id') exemplo de como escolher os campos retornados e excluir o _id que vem por default.
        //.populate('userId') --> exemplo de como trazer os dados do ojeto relacionado
        .then(products => {
            res.render('admin/product-list', {
                prods: products,
                pageTitle: 'Admin Product List',
                path: '/admin/product-list',
            });
        })
        .catch(err => console.log(err));
};

exports.postAddProduct = (req, res, next) => {
    const { title, imageUrl, description, price } = req.body;
    const product = new Product({
        title,
        price,
        description,
        imageUrl,
        userId: req.user,
    });

    product
        .save()
        .then(() => {
            console.log('Created Product!');
            res.redirect('/admin/product-list');
        })
        .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteOne({ _id: productId, userId: req.user._id })
        .then(() => {
            console.log('Deleted Product!');
            res.redirect('/admin/product-list');
        })
        .catch(err => console.log(err));
};
