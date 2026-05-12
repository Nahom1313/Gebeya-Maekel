import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    wishlistItems: localStorage.getItem('wishlist')
      ? JSON.parse(localStorage.getItem('wishlist'))
      : [],
  },
  reducers: {
    addToWishlist: (state, action) => {
      const exists = state.wishlistItems.find(x => x._id === action.payload._id);
      if (!exists) {
        state.wishlistItems.push(action.payload);
        localStorage.setItem('wishlist', JSON.stringify(state.wishlistItems));
      }
    },
    removeFromWishlist: (state, action) => {
      state.wishlistItems = state.wishlistItems.filter(x => x._id !== action.payload);
      localStorage.setItem('wishlist', JSON.stringify(state.wishlistItems));
    },
  },
});

export const { addToWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;