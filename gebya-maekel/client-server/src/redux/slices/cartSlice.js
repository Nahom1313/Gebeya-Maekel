import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { cartItems: [] },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const exists = state.cartItems.find(x => x._id === item._id);
      if (exists) {
        state.cartItems = state.cartItems.map(x =>
          x._id === exists._id ? item : x
        );
      } else {
        state.cartItems.push(item);
      }
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(x => x._id !== action.payload);
    },
    // 1. ADD THIS REDUCER HERE
    updateQuantity: (state, action) => {
      const { id, qty } = action.payload;
      const item = state.cartItems.find(x => x._id === id);
      if (item) {
        item.qty = qty; // or item.quantity depending on your data
      }
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

// 2. ADD updateQuantity TO THIS EXPORT LINE
export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

export default cartSlice.reducer;