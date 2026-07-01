import React from 'react'
//import mensCollectionImage from '../../assets/mens-collection.webp'
//import womensCollectionImage from '../../assets/womens-collection.webp'
import { Link } from 'react-router-dom'

const GenderCollectionSection = () => {
  return (
    <section className='py-16 px-4 lg:px-0'>
        <div className='container mx-auto flex flex-col md:flex-row gap-8'>
            {/* Women's collection */}
            <div className="relative flex-1">
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"
                <div className='absolute bottom-8 left-8 bg-white/90 p-4'>
                    <h2 className='text-2xl font-bold'>Women's Collection</h2>
                    <Link to='/collections/all?gender=Women' className='text-gray-900 underline'>Shop Now</Link>
                </div>
            </div>
            {/* Men's collection */}
            {/* Women's collection */}
            <div className="relative flex-1">
                src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800"
                <div className='absolute bottom-8 left-8 bg-white/90 p-4'>
                    <h2 className='text-2xl font-bold'>Men's Collection</h2>
                    <Link to='/collections/all?gender=Men' className='text-gray-900 underline'>Shop Now</Link>
                </div>
            </div>
        </div>
    </section>
  )
}

export default GenderCollectionSection