import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* --- ИСПОЛЬЗУЕМ ЭТОТ ВАРИАНТ --- */}
      <main className="flex-grow w-full">
        {/* Этот div будет отцентрирован и ограничит ширину контента */}
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      
      {/* <footer ...> ... </footer> */}
    </div>
  );
}