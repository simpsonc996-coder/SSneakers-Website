import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import store from "./redux/store";

// 1. Common Layout Elements (Nested inside Common/Layout)
//import UserLayout from "./components/Admin/Cart/Common/Layout/UserLayout";
//import ProtectedRoute from "./components/Admin/Cart/Common/Layout/ProtectedRoute";

// 2. Core Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CollectionsPage from "./pages/CollectionsPage";

// 3. Product & Cart Flow Components
import ProductDetails from "./components/Products/ProductDetails";
import Checkout from "./components/Admin/Cart/Checkout";
import KicksSearchPage from "./pages/KicksSearchPage";

// 4. Order Pages
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import MyOrdersPage from "./pages/MyOrdersPage";

// 5. Admin Framework Components (Sitting directly under src/components/Admin)
import AdminLayout from "./components/Admin/AdminLayout";
import AdminHomePage from "./pages/AdminHomePage";
import UserManagement from "./components/Admin/UserManagement";
import ProductManagement from "./components/Admin/ProductManagement";
import EditProductPage from "./components/Admin/EditProduct";
import OrderManagement from "./components/Admin/OrderManagement";
import Header from "./components/Admin/Cart/Common/Header";
import Footer from "./components/Admin/Cart/Common/Footer";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster position="top-right" closeButton />
        <Header />
        <Routes>
          
          {/* User Shop Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/collections/:collection" element={<CollectionsPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/kicks-search" element={<KicksSearchPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/order/:id" element={<OrderDetailsPage />} />

          {/* Admin Back-Office Routes */}
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route index element={<AdminHomePage />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="products/:id/edit" element={<EditProductPage />} />
            <Route path="orders" element={<OrderManagement />} />
          </Route>

        </Routes>
        <Footer />
      </BrowserRouter>
    </Provider>
  );
}

export default App;