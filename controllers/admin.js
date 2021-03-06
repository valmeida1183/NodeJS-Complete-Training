const { validationResult } = require('express-validator');

const fileHelper = require('../utils/file');
const Product = require('../models/mongoDb/product');
const errorUtils = require('../utils/error');

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
        .catch(err => {
            return errorUtils.internalServerError(err, next);
        });
};

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
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
                hasError: false,
                product: product,
                errorMessage: null,
                validationErrors: [],
            });
        })
        .catch(err => {
            return errorUtils.internalServerError(err, next);
        });
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const { title, description, price } = req.body;
    const image = req.file;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: { _id: productId, title, imageUrl, description, price },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }

    Product.findById(productId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }

            product.title = title;
            if (image) {
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = `\\${image.path}`;
            }
            product.description = description;
            product.price = price;

            return product.save().then(() => {
                console.log('Updated Product!');
                res.redirect('/admin/product-list');
            });
        })
        .catch(err => {
            return errorUtils.internalServerError(err, next);
        });
};

exports.postAddProduct = (req, res, next) => {
    const { title, description, price } = req.body;
    const image = req.file;
    if (!image) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: { title, description, price },
            errorMessage: 'Attached file is not a image',
            validationErrors: [],
        });
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: { title, description, price },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
        });
    }

    const imageUrl = `\\${image.path}`;

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
        .catch(err => {
            return errorUtils.internalServerError(err, next);
        });
};

exports.postDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId)
        .then(product => {
            if (!product) return next(new Error('Product not found!'));

            fileHelper.deleteFile(product.imageUrl);
            return Product.deleteOne({ _id: productId, userId: req.user._id });
        })
        .then(() => {
            console.log('Deleted Product!');
            res.redirect('/admin/product-list');
        })
        .catch(err => {
            return errorUtils.internalServerError(err, next);
        });
};

exports.deleteProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            if (!product) return next(new Error('Product not found!'));

            fileHelper.deleteFile(product.imageUrl);
            return Product.deleteOne({ _id: productId, userId: req.user._id });
        })
        .then(() => {
            console.log('Deleted Product!');
            res.status(200).json({ message: 'Success!' });
        })
        .catch(err => {
            res.status(500).json({ message: 'Deleting product failed!' });
        });
};
