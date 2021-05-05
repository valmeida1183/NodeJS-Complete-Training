const express = require('express');
const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');
const pagination = require('../middleware/pagination');

const router = express.Router();

router.get('/', pagination, shopController.getIndex);

router.get('/product-list', pagination, shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.post('/cart', isAuth, shopController.postCart);

router.post('/create-order', isAuth, shopController.postOrder);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/order/:orderId', isAuth, shopController.getInvoice);

//router.get('/checkout', shopController.getCheckout);

module.exports = router;
