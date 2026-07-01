import React, { useEffect } from 'react';
import { toast } from 'sonner';
import ProductGrid from './ProductGrid';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails, fetchSimilarProducts } from '../../redux/slices/productSlice';
import { addToCart } from '../../redux/slices/cartSlice';
import { formatZAR } from '../../utils/formatPrice';

const ProductDetails = ({ productId }) => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { selectedProduct, loading, error, similarProducts } = useSelector((state) => state.products);
    const { user, guestId } = useSelector((state) => state.auth);
    const [mainImage, setMainImage] = React.useState(selectedProduct?.images?.[0]?.url || null);
    
    // Sneaker Marketplace States
    const [selectedSize, setSelectedSize] = React.useState("");
    const [selectedColor, setSelectedColor] = React.useState("");
    const [sneakerCondition, setSneakerCondition] = React.useState("");
    const [boxCondition, setBoxCondition] = React.useState("");
    
    const [quantity, setQuantity] = React.useState(1);
    const [isButtonDisabled, setIsButtonDisabled] = React.useState(false);

    const productFetchId = productId || id;

    useEffect(() => {
        if (productFetchId) {
            dispatch(fetchProductDetails(productFetchId));
            dispatch(fetchSimilarProducts({ id: productFetchId }));
        }
    }, [dispatch, productFetchId, user, guestId]);

    React.useEffect(() => {
        if (selectedProduct?.images?.length > 0) {
            setMainImage(selectedProduct.images[0].url);
        }
    }, [selectedProduct]);

    const handleQuantityChange = (action) => {
        if (action === "plus") {
            setQuantity((prev) => prev + 1);
        } else if (action === "minus" && quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

    const handleAddToCart = () => {
        // C2C Sneaker Form Validation
        if (!selectedSize || !selectedColor || !sneakerCondition || !boxCondition) {
            toast.error("Please select Size, Color, Shoe Condition, and Box Status before checking out!", {
                duration: 2000,
            });
            return;
        }

        setIsButtonDisabled(true);

        dispatch(
            addToCart({
                productId: productFetchId,
                size: selectedSize,
                color: selectedColor,
                sneakerCondition: sneakerCondition,
                boxCondition: boxCondition,
                quantity,
                guestId,
                userId: user?._id,
            })
        ).then(() => {
            toast.success("Sneaker added to order queue!", {
                duration: 1000,
            });
        }).finally(() => {
            setIsButtonDisabled(false);
        });
    };

    if (loading) {
        return <p className="text-center mt-10">Loading your kicks...</p>;
    }

    if (error) {
        return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
    }

    // Available Sneaker Sizes list fallback if your DB doesn't have them preset
    const sneakerSizesList = selectedProduct?.sizes?.length > 0 
        ? selectedProduct.sizes 
        : ["US 7", "US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 10.5", "US 11", "US 12", "US 13"];

    const sneakerColorsList = selectedProduct?.colors?.length > 0
        ? selectedProduct.colors
        : ["Black", "White", "Red", "Blue"];

    return (
        <div>
            {selectedProduct && (
                <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg">
                    <div className="flex flex-col md:flex-row">
                    {/* Left thumbnails */}
                    <div className="hidden md:flex flex-col space-y-4 mr-6">
                        {selectedProduct.images?.map((image, index) => (
                            <img src={image.url} key={index} alt={image.altText || `Thumbnail ${index + 1}`} className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${mainImage === image.url ? "border-black" : "border-gray-300"}`} onClick={() => setMainImage(image.url)}/>
                        ))}
                    </div>
                    {/* Main image */}
                    <div className="md:w-1/2">
                        <div className="mb-4">
                            {mainImage && <img src={mainImage} alt="Main product" className='w-full h-auto object-cover rounded-lg shadow-sm'/>}
                        </div>
                    </div>
                    {/* Mobile thumbnail */}
                    <div className="md:hidden flex overflow-x-scroll space-x-4 mb-4">
                        {selectedProduct.images?.map((image, index) => (
                            <img src={image.url} key={index} alt={image.altText || `Thumbnail ${index + 1}`} className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${mainImage === image.url ? "border-black" : "border-gray-300"}`} onClick={() => setMainImage(image.url)}/>
                        ))}
                    </div>
                    
                    {/* Right side data details */}
                    <div className="md:w-1/2 md:ml-10">
                        <span className="text-xs uppercase tracking-widest font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Verified Authentic C2C Listing</span>
                        <h1 className="text-2xl md:text-3xl font-bold mt-2 mb-2 text-gray-900">
                            {selectedProduct.name}
                        </h1>
                        <p className="text-xl font-semibold text-gray-700 mb-2">
                            {formatZAR(selectedProduct.price)}
                        </p>
                        <p className="text-gray-600 mb-6 leading-relaxed">{selectedProduct.description}</p>
                        
                        <hr className="my-4 border-gray-200" />

                        {/* Sneaker Marketplace Custom Form Selectors */}
                        <div className="space-y-4 my-6">
                            {/* 1. Sizing Dropdown */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                                    Select Size (US Men):
                                </label>
                                <select 
                                    value={selectedSize}
                                    onChange={(e) => setSelectedSize(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 font-medium focus:ring-2 focus:ring-black focus:border-black"
                                >
                                    <option value="">-- Choose Size --</option>
                                    {sneakerSizesList.map((size) => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 2. Color Dropdown */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                                    Select Color:
                                </label>
                                <select 
                                    value={selectedColor}
                                    onChange={(e) => setSelectedColor(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 font-medium focus:ring-2 focus:ring-black focus:border-black"
                                >
                                    <option value="">-- Choose Color --</option>
                                    {sneakerColorsList.map((color) => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 3. Shoe Condition Dropdown */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                                    Sneaker Condition:
                                </label>
                                <select 
                                    value={sneakerCondition}
                                    onChange={(e) => setSneakerCondition(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 font-medium focus:ring-2 focus:ring-black focus:border-black"
                                >
                                    <option value="">-- Choose Pair Condition --</option>
                                    <option value="Deadstock">Deadstock (Brand New / Never Worn)</option>
                                    <option value="VNDS">VNDS (Very Near Deadstock / Worn Once)</option>
                                    <option value="Used - Excellent">Used (Excellent Condition / Clean)</option>
                                    <option value="Used - Flawed">Used (Minor Scuffs / Creasing)</option>
                                </select>
                            </div>

                            {/* 3. Box Status Dropdown */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                                    Box Status:
                                </label>
                                <select 
                                    value={boxCondition}
                                    onChange={(e) => setBoxCondition(e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-md bg-white text-gray-900 font-medium focus:ring-2 focus:ring-black focus:border-black"
                                >
                                    <option value="">-- Choose Box Condition --</option>
                                    <option value="OG Box (Perfect)">OG Box (Perfect Condition)</option>
                                    <option value="OG Box (Damaged)">OG Box (Damaged / Ripped)</option>
                                    <option value="Replacement Box">Replacement Box Provided</option>
                                    <option value="No Box">No Box / Loose Pair</option>
                                </select>
                            </div>
                        </div>

                        {/* Quantity selection layout */}
                        <div className="mb-6 flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <span className="text-sm font-semibold text-gray-700">Available Quantity:</span>
                            <div className="flex items-center space-x-4">
                                <button onClick={() => handleQuantityChange("minus")} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded font-bold text-lg transition-colors">-</button>
                                <span className='text-lg font-bold w-4 text-center'>{quantity}</span>
                                <button onClick={() => handleQuantityChange("plus")} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded font-bold text-lg transition-colors">+</button>
                            </div>
                        </div>

                        {/* Action Submit Checkout button */}
                        <button disabled={isButtonDisabled} onClick={handleAddToCart} className={`bg-black text-white font-bold py-3 px-6 rounded w-full mb-4 tracking-wide uppercase transition-all ${isButtonDisabled ? "cursor-not-allowed opacity-50" : "hover:bg-gray-800 active:scale-[0.99]"}`}>
                            {isButtonDisabled ? "Securing Pair..." : "Add to Shopping Cart"}
                        </button>

                        {/* Marketplace specs grid */}
                        <div className="mt-8 text-gray-700 border-t pt-6">
                            <h3 className='text-md font-bold uppercase tracking-wider text-gray-900 mb-3'>Listing Information:</h3>
                            <table className='w-full text-left text-sm text-gray-600'>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className='py-2 font-medium text-gray-500'>Authenticity Guarantee</td>
                                        <td className='py-2 font-semibold text-green-600 text-right'>100% Inspected & Hand Verified</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className='py-2 font-medium text-gray-500'>Brand Model</td>
                                        <td className='py-2 text-gray-900 text-right'>{selectedProduct.brand || "Premium Sneaker"}</td>
                                    </tr>
                                    <tr>
                                        <td className='py-2 font-medium text-gray-500'>Material Base</td>
                                        <td className='py-2 text-gray-900 text-right'>{selectedProduct.material || "Leather / Suede"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                {/* Related section block */}
                <div className="mt-20">
                    <h2 className='text-2xl text-center font-bold text-gray-900 mb-6'>
                        Trending Marketplace Recommendations
                    </h2>
                    <ProductGrid products={similarProducts} loading={loading} error={error}/>
                </div>
            </div>
            )}
        </div>
    );
};

export default ProductDetails;