import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#030712] selection:bg-indigo-500/30 text-slate-50">
      {/* Global Background Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none mix-blend-screen" />

      {/* Navbar Overlay */}
      <Navbar />

      {/* Main Content Content Container */}
      <div className="relative z-10 w-full pt-24 pb-16">
        <main className="container mx-auto px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
