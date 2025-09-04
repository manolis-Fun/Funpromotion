import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: typeof window !== 'undefined' && localStorage.getItem('wishlist')
        ? JSON.parse(localStorage.getItem('wishlist'))
        : [],
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        addToWishlist: (state, action) => {
            if (!state.items.find(item => item.id === action.payload.id)) {
                state.items.push(action.payload);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('wishlist', JSON.stringify(state.items));
                }
            }
        },
        removeFromWishlist: (state, action) => {
            state.items = state.items.filter(item => item.id !== action.payload);
            if (typeof window !== 'undefined') {
                localStorage.setItem('wishlist', JSON.stringify(state.items));
            }
        },
    },
});

export const { addToWishlist, removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer; 