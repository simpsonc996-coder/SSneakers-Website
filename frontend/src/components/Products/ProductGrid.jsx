import React from 'react';
import { Link } from 'react-router-dom';
import { formatZAR } from '../../utils/formatPrice';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';

const ProductGrid = ({ products, loading, error }) => {
  const dispatch = useDispatch();
  const { user, guestId } = useSelector((state) => state.auth);
  const productList = Array.isArray(products) ? products : [];

  if (loading) {
    return <div className="py-10 text-center text-sm text-gray-500">Loading catalogue...</div>;
  }
  if (error) {
    return <div className="py-10 text-center text-sm text-red-600">We couldn't load the catalogue right now.</div>;
  }
  if (productList.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center text-gray-600">
        No sneakers available right now. Check back soon for the latest drops.
      </div>
    );
  }

  const handleQuickAdd = (product) => {
    dispatch(
      addToCart({
        productId: product._id,
        quantity: 1,
        size: product.sizes?.[0] || "M",
        color: product.colors?.[0] || "Black",
        userId: user?._id || null,
        guestId: user ? undefined : guestId,
      })
    );
  };

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
      {productList.map((product, index) => (
        <Link key={index} to={`/product/${product._id}`} className='block group'>
          <div className='bg-white p-4 rounded-lg relative overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200'>
            <div className='w-full h-96 mb-4 overflow-hidden rounded'>
              <img 
                src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'} 
                alt={product.images?.[0]?.alt || product.name} 
                className='w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-300'
              />
            </div>
            <h3 className='text-sm mb-2 font-medium text-gray-800'>{product.name}</h3>
            <p className='text-sm text-gray-500 font-medium tracking-tighter'>{formatZAR(product.price)}</p>
            
            {/* Quick add action button */}
            <button 
              onClick={() => handleQuickAdd(product)}
              className="mt-3 w-full bg-black text-white text-xs py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-800"
            >
              Quick Add
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;