import React from 'react'
import { Link, useLocation } from 'react-router-dom';
import { registerUser } from '../redux/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { mergeCart } from '../redux/slices/cartSlice';

const Register = () => {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
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
        dispatch(registerUser({ name, email, password }));
    }

  return (
    <div className='min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 font-sans'>
        <div className="w-full max-w-md space-y-8 bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 transition-all">
            
            {/* Branding & Header */}
            <div className="text-center">
              <span className="text-3xl">🐰</span>
              <h2 className='text-3xl font-black text-slate-900 tracking-tight mt-4'>
                CREATE ACCOUNT
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Join the premier marketplace for authentic sneakers
              </p>
            </div>

            {/* Core Interaction Form */}
            <form onSubmit={handleSubmit} className='mt-8 space-y-5'>
                
                {/* Name Input Field Group */}
                <div>
                    <label className='block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-ssneakers-red focus:bg-white transition-all' 
                      placeholder='e.g. Thabo Ndlovu'
                      required
                    />
                </div>

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
                    <label className='block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
                      Password
                    </label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-ssneakers-red focus:bg-white transition-all' 
                      placeholder='••••••••'
                      required
                    />
                </div>

                {/* Submit Action Button with Loading Spinner */}
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
                      Creating Account...
                    </>
                  ) : "Register Account"}
                </button>

                {/* Toggle / Redirect link back to Login */}
                <div className="pt-4 border-t border-slate-100 text-center text-sm font-medium text-slate-500">
                    <p>
                        Already have an account?{" "}
                        <Link 
                          to={`/login?redirect=${encodeURIComponent(redirect)}`} 
                          className="text-ssneakers-red font-bold hover:underline ml-1"
                        >
                          Login here
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Register