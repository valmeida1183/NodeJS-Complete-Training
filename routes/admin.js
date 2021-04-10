const express = require('express');
const productsController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, productsController.getAddProduct);

// /admin/product-list => GET
router.get('/product-list', isAuth, productsController.getAdminProducts);

// /admin/add-product => POST
router.post('/add-product', isAuth, productsController.postAddProduct);

router.get('/edit-product/:productId', isAuth, productsController.getEditProduct);

router.post('/edit-product', isAuth, productsController.postEditProduct);

router.post('/delete-product', isAuth, productsController.postDeleteProduct);

module.exports = router;
