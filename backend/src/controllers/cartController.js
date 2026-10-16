import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// Helper to calculate totals and filter invalid items
const formatCartResponse = (cart) => {
  let subtotal = 0;
  let totalItems = 0;

  const validItems = cart.items
    .filter((item) => item.product && item.product.isActive)
    .map((item) => {
      const itemSubtotal = item.product.price * item.quantity;
      subtotal += itemSubtotal;
      totalItems += item.quantity;
      return {
        _id: item._id,
        product: {
          _id: item.product._id,
          title: item.product.title,
          price: item.product.price,
          imageUrl: item.product.imageUrl,
          stockQuantity: item.product.stockQuantity,
          category: item.product.category,
        },
        quantity: item.quantity,
        itemSubtotal: Number(itemSubtotal.toFixed(2)),
      };
    });

  return {
    _id: cart._id,
    user: cart.user,
    items: validItems,
    totalItems,
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number((subtotal * 0.08).toFixed(2)), // standard 8% tax
    shipping: subtotal > 100 || subtotal === 0 ? 0 : 10.0, // Free shipping over $100
    grandTotal: Number(
      (
        subtotal +
        subtotal * 0.08 +
        (subtotal > 100 || subtotal === 0 ? 0 : 10.0)
      ).toFixed(2)
    ),
  };
};

// @desc    Get logged in user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    return res.status(200).json({
      success: true,
      data: formatCartResponse(cart),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const addQty = Math.max(1, parseInt(quantity, 10));

    // Verify product exists and has stock
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable',
      });
    }

    if (product.stockQuantity < addQty) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockQuantity} items remaining in stock`,
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if item already exists in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      const newTotalQty = cart.items[itemIndex].quantity + addQty;
      if (newTotalQty > product.stockQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more than available stock (${product.stockQuantity})`,
        });
      }
      cart.items[itemIndex].quantity = newTotalQty;
    } else {
      cart.items.push({ product: productId, quantity: addQty });
    }

    await cart.save();
    await cart.populate('items.product');

    return res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: formatCartResponse(cart),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:productId
// @access  Private
export const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const newQty = parseInt(quantity, 10);
    if (isNaN(newQty) || newQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (newQty > product.stockQuantity) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${product.stockQuantity})`,
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in your cart',
      });
    }

    cart.items[itemIndex].quantity = newQty;
    await cart.save();
    await cart.populate('items.product');

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: formatCartResponse(cart),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
export const removeCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product');

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: formatCartResponse(cart),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        items: [],
        totalItems: 0,
        subtotal: 0,
        tax: 0,
        shipping: 0,
        grandTotal: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
