const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe = require('stripe');

const Product = require('../models/mongoDb/product');
const Order = require('../models/mongoDb/order');

const ITEMS_PER_PAGE = 5;
const stripeSdk = stripe(process.env.STRIPE_SECRET_KEY);

exports.getProducts = (req, res, next) => {
    const page = +req.query.page;
    let totalItems;

    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;

            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'All Products',
                path: '/product-list',
                totalItems: totalItems,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                currentPage: page,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            });
        })
        .catch(err => next(err));
};

exports.getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/product-list',
            });
        })
        .catch(err => next(err));
};

exports.getIndex = (req, res, next) => {
    const page = +req.query.page;
    let totalItems;

    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;

            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                totalItems: totalItems,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                currentPage: page,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            });
        })
        .catch(err => next(err));
};

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                path: '/cart',
                products: products,
            });
        })
        .catch(err => next(err));
};

exports.getCheckout = (req, res, next) => {
    let products;
    let total = 0;

    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const domain = `${req.protocol}://${req.get('host')}`;
            products = user.cart.items;

            products.forEach(product => {
                total += product.quantity * product.productId.price;
            });

            return stripeSdk.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: products.map(product => {
                    return {
                        /* name: product.productId.title,
                        description: product.productId.description,
                        amount: product.productId.price * 100,
                        currency: 'usd',
                        quantity: product.quantity, */
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: product.productId.title,
                                description: product.productId.description,
                            },
                            unit_amount_decimal: (product.productId.price * 100).toFixed(2),
                        },
                        quantity: product.quantity,
                    };
                }),
                mode: 'payment',
                success_url: `${domain}/checkout/success`,
                cancel_url: `${domain}/checkout/cancel`,
            });
        })
        .then(stripeSession => {
            res.render('shop/checkout', {
                pageTitle: 'Checkout',
                path: '/checkout',
                products: products,
                totalSum: total,
                sessionId: stripeSession.id,
            });
        })
        .catch(err => next(err));
};

exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            console.log(result);
            res.redirect('/cart');
        })
        .catch(err => next(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    req.user
        .removeFromCart(productId)
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => next(err));
};

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.session.user._id })
        .then(orders => {
            console.log(`------->${orders}`);
            res.render('shop/orders', {
                pageTitle: 'Your Orders',
                path: '/orders',
                orders: orders,
            });
        })
        .catch(err => next(err));
};

exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(item => {
                return {
                    product: { ...item.productId._doc },
                    quantity: item.quantity,
                };
            });
            const order = new Order({
                products: products,
                user: {
                    name: req.session.user.name,
                    email: req.session.user.email,
                    userId: req.session.user._id,
                },
            });

            return order.save();
        })
        .then(() => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => next(err));
};

exports.getCheckoutSuccess = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(item => {
                return {
                    product: { ...item.productId._doc },
                    quantity: item.quantity,
                };
            });
            const order = new Order({
                products: products,
                user: {
                    name: req.session.user.name,
                    email: req.session.user.email,
                    userId: req.session.user._id,
                },
            });

            return order.save();
        })
        .then(() => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => next(err));
};

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    const invoiceFileName = `invoice-${orderId}.pdf`;
    const invoiceFilePath = path.join('data', 'invoices', invoiceFileName);

    Order.findById(orderId)
        .then(order => {
            // garante que mesmo authenticado, o user deve ser o mesmo que criou a order.
            if (!order) {
                return next(new Error('No order found.'));
            }

            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized'));
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline;filename="' + invoiceFileName + '"');

            const pdfDoc = new PDFDocument();
            pdfDoc.pipe(fs.createWriteStream(invoiceFilePath));
            pdfDoc.pipe(res);

            pdfDoc.fontSize(26).text('Invoice', { underline: true, align: 'center' });
            pdfDoc.text('------------------------------------------------------', { align: 'center' });
            pdfDoc.moveDown();

            let totalPrice = 0;
            order.products.forEach(orderItem => {
                totalPrice += orderItem.quantity * orderItem.product.price;
                pdfDoc
                    .fontSize(14)
                    .text(`${orderItem.product.title} - ${orderItem.quantity} x $${orderItem.product.price}`);
            });

            pdfDoc.moveDown();
            pdfDoc.fontSize(26).text('------------------------------------------------------', { align: 'center' });
            pdfDoc.fontSize(14).text(`Total Price: ${totalPrice}`);

            pdfDoc.end();

            /* IMPORANTE - Para arquivos pequenos esta solução serve, mas se o arquivo for muito grande esta solução não é a melhor.
            Pois desta forma ele lê o arquivo inteiro na memória e depois o server devolve o que pode ser um problema no servidor para muitos requests */
            /* fs.readFile(invoiceFilePath, (err, data) => {
                if (err) {
                    return next(err);
                }

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'inline;filename="' + invoiceFileName + '"');
                res.send(data);
            }); */

            /* A solução ideal é servir o arquivo como um stream, onde os pedaços do arquivo são carregados em lotes na medida que é solicitado */
            /*  const file = fs.createReadStream(invoiceFilePath);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline;filename="' + invoiceFileName + '"');

            file.pipe(res); */
        })
        .catch(err => next(err));
};
