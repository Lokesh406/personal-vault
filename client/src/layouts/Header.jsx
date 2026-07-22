import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiSearch, FiBell } from 'react-icons/fi';

const Header = ({ toggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 shadow-sm">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors mr-4"
        >
          <FiMenu className="text-xl" />
        </button>
        
        <div className="flex-1 flex justify-center px-4 sm:px-6">
          <form onSubmit={handleSearchSubmit} className="max-w-md w-full relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search everything..."
              className="block w-full pl-10 pr-3 py-2 border border-border rounded-full leading-5 bg-secondary/50 text-foreground placeholder-muted-foreground focus:outline-none focus:bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all sm:text-sm"
            />
          </form>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors relative">
          <FiBell className="text-xl" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold cursor-pointer">
          A
        </div>
      </div>
    </header>
  );
};

export default Header;
