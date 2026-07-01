   import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const FilterSidebar = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filters, setFilters] = React.useState({
    category: "",
    gender: "",
    color: "",
    size: [],
    material: [],
    brand: [],
    minPrice: 0,
    maxPrice: 5000,
  });

  const [priceRange, setPriceRange] = React.useState([0, 5000]);

  const categories = ["Running", "Basketball", "Lifestyle", "Skateboarding", "Training"];

  const colors = ["Black", "White", "Gray", "Red", "Blue", "Green", "Orange", "Brown"];

  const sizes = ["6", "7", "8", "9", "10", "11", "12"];

  const materials = ["Leather", "Suede", "Mesh", "Knit", "Canvas", "Synthetic"];

  const brands = ["Nike", "Jordan", "Adidas", "New Balance", "Puma", "Asics", "Converse", "Vans"];

  const genders = ["Men", "Women", "Unisex"];

  const colorClasses = {
    Black: "bg-black",
    White: "bg-white",
    Gray: "bg-gray-500",
    Red: "bg-red-500",
    Blue: "bg-blue-500",
    Green: "bg-emerald-500",
    Orange: "bg-orange-500",
    Brown: "bg-amber-700",
  };

  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);
    // {category: 'Top Wear', color: 'Red', size: 'M,L', minPrice: '10', maxPrice: '90'} => params.category if you need category filter value

    setFilters({
      category: params.category || "",
      gender: params.gender || "",
      color: params.color || "",
      size: params.size ? params.size.split(",") : [],
      material: params.material ? params.material.split(",") : [],
      brand: params.brand ? params.brand.split(",") : [],
      minPrice: params.minPrice || 0,
      maxPrice: params.maxPrice || 5000,
    });
    setPriceRange([0, params.maxPrice || 5000]);
  }, [searchParams]);

  const handleFilterChange = (e) => {
    const { name, value, checked, type } = e.target;
    let newFilters = { ...filters };

    if (type === "checkbox") {
      // For checkbox filters like size, material, brand
      if (checked) {
        newFilters[name] = [...(newFilters[name] || []), value];
      } else {
        newFilters[name] = newFilters[name].filter((item) => item !== value);
      }
    } else {
      newFilters[name] = value; // For types other than checkbox
    }
    setFilters(newFilters);
    updatedURLParams(newFilters);
  };

  const updatedURLParams = (newFilters) => {
    const params = new URLSearchParams();
    // {category: "Top Wear", size: ["XS", "S"]}
    Object.keys(newFilters).forEach((key) => {
      if (Array.isArray(newFilters[key]) && newFilters[key].length > 0) {
        params.append(key, newFilters[key].join(","));
      } else if (newFilters[key] !== "" && newFilters[key] !== null && newFilters[key] !== undefined) {
        params.append(key, newFilters[key]);
      }
    });
    setSearchParams(params);
    navigate(`?${params.toString()}`); // ?category=Bottom+Wear&size=XS%2CS - here, %2C is the encoded version of comma
  };

  const handlePriceChange = (e) => {
    const newPrice = e.target.value;
    setPriceRange([0, newPrice]);
    const newFilters = { ...filters, minPrice: 0, maxPrice: newPrice };
    setFilters(newFilters);
    updatedURLParams(newFilters);
  };

  const clearAllFilters = () => {
    const resetFilters = {
      category: "",
      gender: "",
      color: "",
      size: [],
      material: [],
      brand: [],
      minPrice: 0,
      maxPrice: 5000,
    };
    setFilters(resetFilters);
    setPriceRange([0, 5000]);
    setSearchParams(new URLSearchParams());
    navigate("");
  };

  return (
    <aside className="h-full bg-white p-4 md:p-5 border-r border-stone-200">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Sneaker Finder</p>
          <h3 className="text-xl font-semibold text-stone-900">Filters</h3>
        </div>
        <button
          type="button"
          onClick={clearAllFilters}
          className="text-xs font-medium text-stone-600 hover:text-stone-900"
        >
          Clear all
        </button>
      </div>

      {/* Category filter */}
      <div className="mb-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <label className="block text-sm font-semibold text-stone-800 mb-3">Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <label
              key={category}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                filters.category === category
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
              }`}
            >
              <input
                type="radio"
                name="category"
                value={category}
                checked={filters.category === category}
                onChange={handleFilterChange}
                className="hidden"
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      {/* Gender filter */}
      <div className="mb-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <label className="block text-sm font-semibold text-stone-800 mb-3">Gender</label>
        <div className="grid grid-cols-3 gap-2">
          {genders.map((gender) => (
            <label
              key={gender}
              className={`cursor-pointer rounded-xl border p-2 text-center text-xs font-medium transition ${
                filters.gender === gender
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
              }`}
            >
              <input
                type="radio"
                name="gender"
                value={gender}
                checked={filters.gender === gender}
                onChange={handleFilterChange}
                className="hidden"
              />
              {gender}
            </label>
          ))}
        </div>
      </div>

      {/* Color filter */}
      <div className="mb-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <label className="block text-sm font-semibold text-stone-800 mb-3">Colorway</label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              name="color"
              value={color}
              onClick={handleFilterChange}
              className={`h-8 w-8 rounded-full border transition hover:scale-105 ${
                colorClasses[color]
              } ${filters.color === color ? "ring-2 ring-stone-900 ring-offset-2" : "border-stone-300"}`}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Size filter */}
      <div className="mb-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <label className="block text-sm font-semibold text-stone-800 mb-3">US Size</label>
        <div className="grid grid-cols-4 gap-2">
          {sizes.map((size) => (
            <label
              key={size}
              className={`cursor-pointer rounded-lg border p-2 text-center text-xs font-semibold transition ${
                filters.size.includes(size)
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
              }`}
            >
              <input
                type="checkbox"
                name="size"
                value={size}
                checked={filters.size.includes(size)}
                onChange={handleFilterChange}
                className="hidden"
              />
              {size}
            </label>
          ))}
        </div>
      </div>

      {/* Materials filter */}
      <div className="mb-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <label className="block text-sm font-semibold text-stone-800 mb-3">Material</label>
        {materials.map((material) => (
          <div key={material} className="flex items-center mb-2">
            <input
              type="checkbox"
              name="material"
              value={material}
              checked={filters.material.includes(material)}
              onChange={handleFilterChange}
              className="mr-2 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-500"
            />
            <span className="text-sm text-stone-700">{material}</span>
          </div>
        ))}
      </div>

      {/* Brand filter */}
      <div className="mb-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <label className="block text-sm font-semibold text-stone-800 mb-3">Brand</label>
        {brands.map((brand) => (
          <div key={brand} className="flex items-center mb-2">
            <input
              type="checkbox"
              name="brand"
              value={brand}
              checked={filters.brand.includes(brand)}
              onChange={handleFilterChange}
              className="mr-2 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-500"
            />
            <span className="text-sm text-stone-700">{brand}</span>
          </div>
        ))}
      </div>

      {/* Price range filter */}
      <div className="mb-8 rounded-2xl border border-stone-200 bg-stone-50 p-4">
        <label className="block text-sm font-semibold text-stone-800 mb-3">Price Cap (ZAR)</label>
        <input
          type="range"
          name="priceRange"
          min={0}
          max={5000}
          step={100}
          value={priceRange[1]}
          onChange={handlePriceChange}
          className="w-full h-2 bg-stone-300 rounded-lg appearance-none cursor-pointer"
        />
        <div className="mt-2 flex justify-between text-xs font-medium text-stone-600">
          <span>R0</span>
          <span>R{priceRange[1]}</span>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;