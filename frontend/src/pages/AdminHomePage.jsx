import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminHomePage = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const orderRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const productRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
        setOrders(orderRes.data);
        setProducts(productRes.data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black mb-8">Admin Dashboard</h1>
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-bold uppercase text-slate-400">Active Listings</p>
            <h3 className="text-3xl font-black mt-2">{products.length} Sneakers</h3>
          </div>
          {/* Add similar dynamic logic for Revenue and Pending Orders */}
        </div>

        {/* Data Grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-slate-400 uppercase text-xs font-bold">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">User</th>
                <th className="pb-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b">
                  <td className="py-3 font-mono">{order._id}</td>
                  <td className="py-3">{order.user?.name}</td>
                  <td className="py-3 font-bold">R{order.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;