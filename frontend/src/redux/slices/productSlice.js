import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


export const fetchProductsByFilters = createAsyncThunk(
  "sneakers/fetchByFilters",
  async ({
    collection,
    size,
    color,
    gender,
    minPrice,
    maxPrice,
    sortBy,
    search,
    condition,     
    boxCondition,  
    brand,
    limit
  }) => {
    const query = new URLSearchParams();
    if (collection) query.append("collection", collection);
    if (size) query.append("size", size);
    if (color) query.append("color", color);
    if (gender) query.append("gender", gender);
    if (minPrice) query.append("minPrice", minPrice);
    if (maxPrice) query.append("maxPrice", maxPrice);
    if (sortBy) query.append("sortBy", sortBy); // e.g., "hype-high-to-low" or "price-low-to-high"
    if (search) query.append("search", search);
    if (condition) query.append("condition", condition);
    if (boxCondition) query.append("boxCondition", boxCondition);
    if (brand) query.append("brand", brand);
    if (limit) query.append("limit", limit);

    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/products?${query.toString()}`
    );
    return response.data;
  }
);

// Async thunk to fetch a single sneaker's details (e.g., specific Jordan 4 listing page)
export const fetchProductDetails = createAsyncThunk(
  "sneakers/fetchProductDetails",
  async (id) => {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`
    );
    return response.data;
  }
);

// Async thunk to update a listing (e.g., seller dropping their price to make a quick sale)
export const updateProduct = createAsyncThunk(
  "sneakers/updateProduct",
  async ({ id, productData }) => {
    const response = await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`,
      productData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      }
    );
    return response.data;
  }
);

// Async thunk to fetch alternative sneaker listings within the same silhouette/brand tier
export const fetchSimilarProducts = createAsyncThunk(
  "sneakers/fetchSimilarProducts",
  async ({ id }) => {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/products/similar/${id}`
    );
    return response.data;
  }
);

// ==========================================================================
// REDUX SLICE - STATE INITIALIZATION & REDUCERS
// ==========================================================================

const sneakerSlice = createSlice({
  name: "sneakers",
  initialState: {
    products: [],
    selectedProduct: null,
    similarProducts: [],
    loading: false,
    error: null,
    // Sneaker-centric filtering architecture
    filters: {
      brand: "",
      size: "",
      color: "",
      gender: "",
      condition: "",
      boxCondition: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "hype",
      search: "",
      collection: "",
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        brand: "",
        size: "",
        color: "",
        gender: "",
        condition: "",
        boxCondition: "",
        minPrice: "",
        maxPrice: "",
        sortBy: "hype",
        search: "",
        collection: "",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetching entire feed
      .addCase(fetchProductsByFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.products = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchProductsByFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetching focused shoe details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Updating a seller's listing
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updatedSneaker = action.payload;
        const index = state.products.findIndex(
          (shoe) => shoe._id === updatedSneaker._id
        );
        if (index !== -1) {
          state.products[index] = updatedSneaker;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetching alternative recommendations
      .addCase(fetchSimilarProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.similarProducts = action.payload;
      })
      .addCase(fetchSimilarProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFilters, clearFilters } = sneakerSlice.actions;
export default sneakerSlice.reducer;