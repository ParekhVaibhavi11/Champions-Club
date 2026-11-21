import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-[#111111] text-neutral-400 text-sm py-10 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Champions Club. Built for high-performance athletic community.</p>
          <div className="flex gap-6 text-xs text-neutral-400">
            <span>In-Person Pro Shop</span>
            <span>All-Weather Clay & Glass Padel</span>
            <span>Performance Café</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
