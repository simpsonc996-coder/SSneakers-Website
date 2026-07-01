import React, { useEffect, useRef } from "react";
import { FaFilter } from "react-icons/fa";
import FilterSidebar from "../components/Products/FilterSidebar";
import SortOptions from "../components/Products/SortOptions";
import ProductGrid from "../components/Products/ProductGrid";
import { useParams, useSearchParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductsByFilters } from "../redux/slices/productSlice";

const CollectionPage = () => {
  const {collection} = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const {products, loading, error} = useSelector((state) => state.products);
  const queryParams = Object.fromEntries([...searchParams]);
  const sidebarRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    dispatch(fetchProductsByFilters({ collection, ...queryParams }))
  }, [dispatch, collection, searchParams]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClickOutside = (e) => {
    // Close sidebar if clicked outside and don't close when clicking inside the sidebar
    if(sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsSidebarOpen(false);
    }
  }

  useEffect(() => {
    // Add event listener to close sidebar when clicking outside by listening to document clicks
    document.addEventListener("mousedown", handleClickOutside);
    // Cleanup the event listener on component unmount
    return() => {
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, []);

  return (
    <div className="flex flex-col lg:flex-row">
        {/* Mobile filter button */}
        <button onClick={toggleSidebar} className="lg:hidden border border-gray-200 p-2 flex justify-center items-center">
            <FaFilter className="mr-2"/> Filters
        </button>

        {/* Filter sidebar */}
        <div ref={sidebarRef} className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 z-50 left-0 w-64 bg-white overflow-y-auto transition-transform duration-300 lg:static lg:translate-x-0`}>
            <FilterSidebar />
        </div>
        <div className="grow p-4">
            <h2 className="text-2xl uppercase mb-4">All Collection</h2>

            {/* Sort option */}
            <SortOptions />

            {/* Product grid */}
            <ProductGrid products={products} loading={loading} error={error}/>
        </div>
    </div>
    )
};

export default CollectionPage;
