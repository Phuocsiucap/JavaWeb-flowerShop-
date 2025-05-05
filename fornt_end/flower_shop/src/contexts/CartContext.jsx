// src/contexts/CartContext.jsx

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Khởi tạo context
const CartContext = createContext();

// Trạng thái khởi tạo
const initialState = {
  cartItems: [], // mỗi item: { id, name, price, quantity, image }
  totalItems: 0,
  totalPrice: 0,
};

// Hàm reducer xử lý các hành động với giỏ hàng
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item } = action.payload;
      const existingItem = state.cartItems.find((i) => i.id === item.id);

      let updatedCartItems;

      if (existingItem) {
        updatedCartItems = state.cartItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      } else {
        updatedCartItems = [...state.cartItems, item];
      }

      return {
        ...state,
        cartItems: updatedCartItems,
      };
    }

    case 'REMOVE_ITEM': {
      const updatedCartItems = state.cartItems.filter((i) => i.id !== action.payload.id);
      return {
        ...state,
        cartItems: updatedCartItems,
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        cartItems: [],
      };

    case 'UPDATE_TOTALS': {
      const { totalItems, totalPrice } = state.cartItems.reduce(
        (totals, item) => {
          totals.totalItems += item.quantity;
          totals.totalPrice += item.quantity * item.price;
          return totals;
        },
        { totalItems: 0, totalPrice: 0 }
      );

      return {
        ...state,
        totalItems,
        totalPrice,
      };
    }

    default:
      return state;
  }
};

// CartProvider
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Cập nhật tổng số sản phẩm & tổng tiền khi giỏ hàng thay đổi
  useEffect(() => {
    dispatch({ type: 'UPDATE_TOTALS' });
  }, [state.cartItems]);

  // Các hàm tiện ích
  const addToCart = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: { item } });
  };

  const removeFromCart = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems: state.cartItems,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook
export const useCart = () => useContext(CartContext);
