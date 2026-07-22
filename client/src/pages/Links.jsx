import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiExternalLink, FiTrash2, FiPlus } from 'react-icons/fi';
import { API_URL } from '../config';

const Links = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '', category: 'General' });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`${API_URL}/api/links`, config);
      setLinks(data);
    } catch (error) {
      console.error('Error fetching links', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`${API_URL}/api/links/${id}`, config);
      setLinks(links.filter(l => l._id !== id));
    } catch (error) {
      console.error(`Error deleting link', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post(`${API_URL}/api/links`, newLink, config);
      setLinks([...links, data]);
      setShowModal(false);
      setNewLink({ title: '', url: '', category: 'General' });
    } catch (error) {
      console.error('Error creating link', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Important Links</h2>
          <p className="text-muted-foreground mt-2">Manage all your external links and resources.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <FiPlus className="mr-2" /> Add Link
        </button>
      </div>

      {links.length === 0 ? (
        <div className="bg-card p-12 text-center rounded-xl border border-border shadow-sm">
          <p className="text-muted-foreground">No links added yet. Click "Add Link" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => (
            <div key={link._id} className="bg-card p-6 rounded-xl border border-border shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{link.title}</h3>
                  <span className="text-xs px-2 py-1 bg-secondary rounded-full text-muted-foreground">
                    {link.category}
                  </span>
                </div>
                <a 
                  href={link.url} 
                  className="text-sm text-blue-500 hover:underline line-clamp-1 flex items-center"
                >
                  {link.url} <FiExternalLink className="ml-1" />
                </a>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleDelete(link._id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Link Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-md p-6 rounded-xl border border-border shadow-xl">
            <h3 className="text-xl font-bold mb-4">Add New Link</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">URL</label>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <input
                  type="text"
                  value={newLink.category}
                  onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
                  placeholder="e.g., Portfolio, Drive, Coding"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 hover:bg-secondary rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Links;
