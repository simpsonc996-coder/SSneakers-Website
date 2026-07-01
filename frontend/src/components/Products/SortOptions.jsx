import React from 'react'
import { useSearchParams } from 'react-router-dom';

const SortOptions = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const handleSortChange = (e) => {
        const SortBy = e.target.value;
        searchParams.set("sortBy", SortBy);
        setSearchParams(searchParams);
    }

  return (
    <div className='mb-4 flex items-center justify-end'>
        <select id="sort" value={searchParams.get("sortBy") || ""} onChange={handleSortChange} className='border border-gray-200 p-2 rounded-md focus:outline-none'>
            <option value="">Default</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="popularity">Popularity</option>
        </select>
    </div>
  )
}

export default SortOptions