import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  // Load cart from local storage on initial render, or default to an empty array
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Sync cart state to localStorage on every update
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, sizeArg, qtyArg) => {
    // 💡 Smart parameter resolution: Works with object payloads or positional arguments
    const targetSize =
      (typeof sizeArg === 'string' && sizeArg) ||
      product.size ||
      'M';

    const targetQty =
      (typeof sizeArg === 'number' ? sizeArg : qtyArg) ||
      product.qty ||
      1;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item._id === product._id && item.size === targetSize
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item._id === product._id && item.size === targetSize
            ? { ...item, qty: item.qty + targetQty }
            : item
        );
      } else {
        return [...prevItems, { ...product, size: targetSize, qty: targetQty }];
      }
    });
  };

  const updateQty = (productId, size, newQty) => {
    if (newQty < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId && item.size === size
          ? { ...item, qty: newQty }
          : item
      )
    );
  };

  const removeFromCart = (productId, size) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item._id === productId && item.size === size))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};