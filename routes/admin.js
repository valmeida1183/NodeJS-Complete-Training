const express = require('express');
const productsController = require('../controllers/admin');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', productsController.getAddProduct);

// /admin/product-list => GET
router.get('/product-list', productsController.getAdminProducts);

// /admin/add-product => POST
router.post('/add-product', productsController.postAddProduct);

router.get('/edit-product/:productId', productsController.getEditProduct);

router.post('/edit-product', productsController.postEditProduct);

router.post('/delete-product', productsController.postDeleteProduct);

module.exports = router;
