import React from 'react'
import { Link, useLocation } from 'react-router-dom';
import { loginUser } from '../redux/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { mergeCart } from '../redux/slices/cartSlice';

const Login = () => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, guestId, loading } = useSelector((state) => state.auth);
    const { cart } = useSelector((state) => state.cart);

    // Get redirect parameter and check if it is checkout or something else
    const redirect = new URLSearchParams(location.search).get("redirect") || "/";
    const isCheckoutRedirect = redirect.includes("checkout");

    React.useEffect(() => {
        if (user) {
            if (cart?.products.length > 0 && guestId) {
                dispatch(mergeCart({ guestId, user })).then(() => {
                    navigate(isCheckoutRedirect ? "/checkout" : "/");
                });
            } else {
                navigate(isCheckoutRedirect ? "/checkout" : "/");
            }
        }
    }, [ user, guestId, cart, navigate, isCheckoutRedirect, dispatch ]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }));
    }

  return (
    <div className='min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 font-sans'>
        <div className="w-full max-w-md space-y-8 bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 transition-all">
            
            {/* Branding & Welcome Header */}
            <div className="text-center">
              <span className="text-3xl">👟</span>
              <h2 className='text-3xl font-black text-slate-900 tracking-tight mt-4'>
                SSneakers
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter your credentials to access live listings
              </p>
            </div>

            {/* Core Interaction Form */}
            <form onSubmit={handleSubmit} className='mt-8 space-y-5'>
                
                {/* Email Input Field Group */}
                <div>
                    <label className='block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-ssneakers-red focus:bg-white transition-all' 
                      placeholder='you@example.com'
                      required
                    />
                </div>

                {/* Password Input Field Group */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className='block text-xs font-bold uppercase tracking-wider text-slate-400'>
                          Password
                        </label>
                        <a href="#forgot" className="text-xs font-semibold text-ssneakers-red hover:underline">
                          Forgot?
                        </a>
                    </div>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-ssneakers-red focus:bg-white transition-all' 
                      placeholder='••••••••'
                      required
                    />
                </div>

                {/* Dynamic Trigger Action Button */}
                <button 
                  type='submit' 
                  disabled={loading}
                  className='w-full bg-ssneakers-red hover:bg-red-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-red-100 transition-all active:scale-[0.99] text-sm tracking-wide mt-2 flex justify-center items-center gap-2'
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Authenticating...
                    </>
                  ) : "Sign In Securely"}
                </button>

                {/* Switch Mode Link Section */}
                <div className="pt-4 border-t border-slate-100 text-center text-sm font-medium text-slate-500">
                    <p>
                        New to the marketplace?{" "}
                        <Link 
                          to={`/register?redirect=${encodeURIComponent(redirect)}`} 
                          className="text-ssneakers-red font-bold hover:underline ml-1"
                        >
                          Register here
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Login