import React from 'react';
import Header from '../Header'; // Adjust dots if needed based on path
import Footer from '../Footer';
import {Outlet} from 'react-router-dom';

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Header */}
      <Header />
      {/* 2. Main content*/}
      <main className="flex-grow-max-w-7xl w-full mx-auto p-4">
        <Outlet />
      </main>
      
      {/* 3. Footer stays perfectly at the bottom */}
      <Footer />
    </div>
  );
};

export default UserLayout;