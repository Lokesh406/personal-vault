import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SecretCode from './pages/SecretCode';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PersonalDetails from './pages/PersonalDetails';
import Links from './pages/Links';
import Notes from './pages/Notes';
import Projects from './pages/Projects';
import Documents from './pages/Documents';
import Resumes from './pages/Resumes';
import Certificates from './pages/Certificates';
import Images from './pages/Images';
import Videos from './pages/Videos';
import Search from './pages/Search';
import Folders from './pages/Folders';
import FolderDetails from './pages/FolderDetails';






import DashboardLayout from './layouts/DashboardLayout';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardLayout />}>

          <Route index element={<Dashboard />} />
          <Route path="personal-details" element={<PersonalDetails />} />
          <Route path="links" element={<Links />} />
          <Route path="notes" element={<Notes />} />
          <Route path="projects" element={<Projects />} />
          <Route path="documents" element={<Documents />} />
          <Route path="resumes" element={<Resumes />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="images" element={<Images />} />
          <Route path="videos" element={<Videos />} />
          <Route path="search" element={<Search />} />
          <Route path="folders" element={<Folders />} />
          <Route path="folders/:id" element={<FolderDetails />} />
        </Route>



      </Routes>
    </Router>
  );
}

export default App;
