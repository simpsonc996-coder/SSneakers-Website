import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const tokenFromStorage = localStorage.getItem('userToken');

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return true;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    if (!payload?.exp) return true;
    return Date.now() >= payload.exp * 1000;
  } catch (error) {
    return true;
  }
};

if (isTokenExpired(tokenFromStorage)) {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userInfo');
}

// Normalize user object: backend returns 'id', but components expect '_id'
const normalizeUser = (user) => {
  if (!user) return null;
  if (user._id) return user;
  return { ...user, _id: user.id };
};

// Retrieve user info from localStorage only when token is valid
const userFromStorage = normalizeUser(
  localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
);

// Check for an existing guest ID in the localStorage or generate a new one based on current timestamp
const initialGuestId = localStorage.getItem('guestId') || `guest_${new Date().getTime()}`;
localStorage.setItem('guestId', initialGuestId);

// Initial state of the auth slice
const initialState = {
    user: userFromStorage,
    guestId: initialGuestId,
    loading: false,
    error: null,
};

// Async thunk for user login
export const loginUser = createAsyncThunk('/auth/loginUser', async (userData, {rejectWithValue}) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/login`, userData);
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        localStorage.setItem('userToken', response.data.token);
        return response.data.user;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Async thunk for user registration
export const registerUser = createAsyncThunk('/auth/registerUser', async (userData, {rejectWithValue}) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/register`, userData);
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        localStorage.setItem('userToken', response.data.token);
        return response.data.user;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Slice
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.guestId = `guest_${new Date().getTime()}`; // Reset guestId on logout
            localStorage.removeItem('userInfo');
            localStorage.removeItem('userToken');
            localStorage.setItem('guestId', state.guestId); // Update localStorage with new guestId
        },
        generateNewGuestId: (state) => {
            state.guestId = `guest_${new Date().getTime()}`;
            localStorage.setItem('guestId', state.guestId);
        }
    },
    extraReducers: (builder) => {
        builder
          .addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(loginUser.fulfilled, (state, action) => {
            state.loading = false;
            state.user = normalizeUser(action.payload);
          })
          .addCase(loginUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message;
          })
          .addCase(registerUser.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(registerUser.fulfilled, (state, action) => {
            state.loading = false;
            state.user = normalizeUser(action.payload);
          })
          .addCase(registerUser.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message;
          });
    }
});

export const { logout, generateNewGuestId } = authSlice.actions;
export default authSlice.reducer;