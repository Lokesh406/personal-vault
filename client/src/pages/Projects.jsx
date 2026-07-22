import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FiGithub, FiExternalLink, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    githubLink: '',
    liveDemo: '',
    technologies: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/projects', config);
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`http://localhost:5000/api/projects/${id}`, config);
      setProjects(projects.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error deleting project', error);
    }
  };

  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      description: project.description || '',
      githubLink: project.githubLink || '',
      liveDemo: project.liveDemo || '',
      technologies: project.technologies?.join(', ') || '',
    });
    setActiveProject(project);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setFormData({ title: '', description: '', githubLink: '', liveDemo: '', technologies: '' });
    setActiveProject(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      const payload = {
        ...formData,
        technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean)
      };

      if (activeProject) {
        const { data } = await axios.put(`http://localhost:5000/api/projects/${activeProject._id}`, payload, config);
        setProjects(projects.map(p => p._id === data._id ? data : p));
      } else {
        const { data } = await axios.post('http://localhost:5000/api/projects', payload, config);
        setProjects([...projects, data]);
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error saving project', error);
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
          <h2 className="text-3xl font-bold tracking-tight">Project Portfolio</h2>
          <p className="text-muted-foreground mt-2">Manage your showcased projects and case studies.</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <FiPlus className="mr-2" /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-card p-12 text-center rounded-xl border border-border shadow-sm">
          <p className="text-muted-foreground">No projects found. Add your first project!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
              <div className="h-48 bg-secondary/50 flex items-center justify-center border-b border-border text-muted-foreground">
                [Image Placeholder]
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-muted-foreground text-sm flex-1 mb-4 line-clamp-3">
                  {project.description || 'No description provided.'}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.technologies?.map((tech, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <div className="flex space-x-3">
                    {project.githubLink && (
                      <a href={project.githubLink} className="flex items-center text-sm font-medium hover:text-primary transition-colors">
                        <FiGithub className="mr-1.5" /> Code
                      </a>
                    )}
                    {project.liveDemo && (
                      <a href={project.liveDemo} className="flex items-center text-sm font-medium hover:text-primary transition-colors">
                        <FiExternalLink className="mr-1.5" /> Demo
                      </a>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={() => handleEdit(project)} className="p-2 text-muted-foreground hover:bg-secondary rounded-md" title="Edit">
                      <FiEdit2 />
                    </button>
                    <button onClick={() => handleDelete(project._id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-md" title="Delete">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-2xl p-6 rounded-xl border border-border shadow-xl my-8">
            <h3 className="text-xl font-bold mb-6">{activeProject ? 'Edit Project' : 'Add Project'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Project Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="w-full mt-1 px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none resize-none"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">GitHub Repository Link</label>
                  <input
                    type="url"
                    value={formData.githubLink}
                    onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                    className="w-full mt-1 px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Live Demo Link</label>
                  <input
                    type="url"
                    value={formData.liveDemo}
                    onChange={(e) => setFormData({ ...formData, liveDemo: e.target.value })}
                    className="w-full mt-1 px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Technologies Used (comma separated)</label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder="React, Node.js, Tailwind..."
                  className="w-full mt-1 px-4 py-2 bg-input rounded-md border border-border focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 hover:bg-secondary rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium"
                >
                  {activeProject ? 'Update' : 'Save'} Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Projects;
