import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [sneakers, setSneakers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSneakers = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        const { data } = await axios.get(`${backendUrl}/api/products`);
        setSneakers(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching database sneakers:", error);
        setLoading(false);
      }
    };
    fetchSneakers();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-xl">Loading Marketplace...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50/60 text-slate-800 antialiased font-sans">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header Banner */}
        <header className="bg-white shadow-sm p-6 rounded-2xl mb-10 border border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              SSneakers
            </h1>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">C2C Marketplace Live</p>
          </div>
          <span className="bg-red-50 text-ssneakers-red text-xs font-bold px-4 py-2 rounded-full border border-red-100">
            System Online
          </span>
        </header>

        {/* Content Section */}
        <h2 className="text-2xl font-bold tracking-tight mb-6">Live Marketplace Feed</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sneakers.length > 0 ? (
            sneakers.map((sneaker) => (
              <div key={sneaker._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
                <img 
                  src={sneaker.images?.[0]?.url || 'https://via.placeholder.com/300'} 
                  alt={sneaker.images?.[0]?.altText || sneaker.name} 
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <h3 className="font-bold text-lg">{sneaker.name}</h3>
                <p className="text-sm text-slate-500 font-medium mb-2">{sneaker.brand}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-black text-slate-900">R{sneaker.price}</span>
                  <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600">
                    {sneaker.condition || "New"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center col-span-3 text-slate-400">No sneakers available right now. Check back soon for the latest drops.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;