import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiUser,
  FiFileText,
  FiAward,
  FiBriefcase,
  FiCode,
  FiLink,
  FiEdit3,
  FiFolder,
  FiImage,
  FiVideo,
  FiLogOut
} from 'react-icons/fi';

const menuItems = [
  { path: '/dashboard', name: 'Dashboard', icon: <FiHome /> },
  { path: '/dashboard/folders', name: 'Folders', icon: <FiFolder /> },
  { path: '/dashboard/personal-details', name: 'Personal Details', icon: <FiUser /> },
  { path: '/dashboard/resumes', name: 'Resumes', icon: <FiFileText /> },
  { path: '/dashboard/certificates', name: 'Certificates', icon: <FiAward /> },
  { path: '/dashboard/projects', name: 'Projects', icon: <FiBriefcase /> },
  { path: '/dashboard/coding-profiles', name: 'Coding Profiles', icon: <FiCode /> },
  { path: '/dashboard/links', name: 'Links', icon: <FiLink /> },
  { path: '/dashboard/notes', name: 'Notes', icon: <FiEdit3 /> },
  { path: '/dashboard/documents', name: 'Documents', icon: <FiFolder /> },
  { path: '/dashboard/images', name: 'Images', icon: <FiImage /> },
  { path: '/dashboard/videos', name: 'Videos', icon: <FiVideo /> },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: isOpen ? 0 : -250 }}
      transition={{ duration: 0.3 }}
      className={`fixed z-20 inset-y-0 left-0 w-64 bg-card border-r border-border transition-transform lg:translate-x-0 lg:static lg:inset-auto flex flex-col`}
    >
      <div className="flex items-center justify-center h-16 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Personal Vault</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`
                }
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <FiLogOut className="mr-3 text-lg" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
