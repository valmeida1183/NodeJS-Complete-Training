const express = require('express');
const { body } = require('express-validator');

const productsController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, productsController.getAddProduct);

// /admin/product-list => GET
router.get('/product-list', isAuth, productsController.getAdminProducts);

router.get('/edit-product/:productId', isAuth, productsController.getEditProduct);

// /admin/add-product => POST
router.post(
    '/add-product',
    [
        body('title').isString().isLength({ min: 3 }).trim().withMessage('Title has an invalid value'),
        body('price').isFloat().withMessage('Price has an invalid value'),
        body('description').isLength({ min: 5, max: 400 }).trim().withMessage('Description has an invalid value'),
    ],
    isAuth,
    productsController.postAddProduct
);

router.post(
    '/edit-product',
    [
        body('title').isString().isLength({ min: 3 }).trim().withMessage('Title has an invalid value'),
        body('price').isFloat().withMessage('Price has an invalid value'),
        body('description').isLength({ min: 5, max: 400 }).trim().withMessage('Description has an invalid value'),
    ],
    isAuth,
    productsController.postEditProduct
);

//router.post('/delete-product', isAuth, productsController.postDeleteProduct);
//Delete Async
router.delete('/product/:productId', isAuth, productsController.deleteProduct);

module.exports = router;
