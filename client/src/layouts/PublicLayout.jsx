import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-champion-grey">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-champion-dark text-gray-400 py-6 border-t border-neutral-800 text-center text-xs">
        <p>© 2026 Champions Club. Built with speed, precision & athletic excellence.</p>
      </footer>
    </div>
  );
};
