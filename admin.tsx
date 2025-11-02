import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Upload, Edit2, Trash2, LogOut, BarChart3 } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function AdminDashboard() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [pendingPapers, setPendingPapers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  
  // Course form
  const [courseForm, setCourseForm] = useState({ code: '', name: '', description: '' });
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    if (token) {
      fetchUserInfo();
      fetchDashboardData();
    }
  }, [token]);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch(`${API_BASE}/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        if (!data.is_admin) {
          showMessage('error', 'Admin access required');
          logout();
        }
      } else {
        logout();
      }
    } catch (err) {
      console.error(err);
      logout();
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsRes.ok) setStats(await statsRes.json());

      const papersRes = await fetch(`${API_BASE}/papers/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (papersRes.ok) setPendingPapers(await papersRes.json());

      const coursesRes = await fetch(`${API_BASE}/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (coursesRes.ok) setCourses(await coursesRes.json());
    } catch (err) {
      showMessage('error', 'Failed to fetch data');
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', loginForm.email);
      formData.append('password', loginForm.password);

      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.access_token);
        showMessage('success', 'Login successful');
      } else {
        showMessage('error', 'Invalid credentials');
      }
    } catch (err) {
      showMessage('error', 'Login failed');
    }
    setLoading(false);
  };

  const logout = () => {
    setToken('');
    setUser(null);
  };

  const reviewPaper = async (paperId, status, reason = null) => {
    try {
      const res = await fetch(`${API_BASE}/papers/${paperId}/review`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, rejection_reason: reason })
      });

      if (res.ok) {
        showMessage('success', `Paper ${status} successfully`);
        fetchDashboardData();
      } else {
        showMessage('error', 'Failed to review paper');
      }
    } catch (err) {
      showMessage('error', 'Failed to review paper');
    }
  };

  const handleCourseSubmit = async () => {
    setLoading(true);
    try {
      const url = editingCourse 
        ? `${API_BASE}/courses/${editingCourse.id}`
        : `${API_BASE}/courses`;
      
      const res = await fetch(url, {
        method: editingCourse ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseForm)
      });

      if (res.ok) {
        showMessage('success', editingCourse ? 'Course updated' : 'Course created');
        setCourseForm({ code: '', name: '', description: '' });
        setEditingCourse(null);
        fetchDashboardData();
      } else {
        const error = await res.json();
        showMessage('error', error.detail || 'Failed to save course');
      }
    } catch (err) {
      showMessage('error', 'Failed to save course');
    }
    setLoading(false);
  };

  const deleteCourse = async (id) => {
    if (!confirm('Delete this course? All associated papers will be deleted.')) return;
    
    try {
      const res = await fetch(`${API_BASE}/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        showMessage('success', 'Course deleted');
        fetchDashboardData();
      } else {
        showMessage('error', 'Failed to delete course');
      }
    } catch (err) {
      showMessage('error', 'Failed to delete course');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (!token || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Portal</h1>
            <p className="text-gray-600 mt-2">Paper Submission Management</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="admin@university.edu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          {message.text && (
            <div className={`mt-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center">
              <Upload className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">{user.name}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {message.text && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className={`p-4 rounded-lg flex items-center space-x-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-lg shadow-sm p-1 flex space-x-1">
          {['dashboard', 'pending', 'courses'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-md font-medium capitalize ${
                activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && stats && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <BarChart3 className="mr-2" />
              Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">Total Papers</div>
                <div className="text-3xl font-bold text-gray-800">{stats.total_papers}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">Pending Review</div>
                <div className="text-3xl font-bold text-yellow-600">{stats.pending_papers}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">Approved</div>
                <div className="text-3xl font-bold text-green-600">{stats.approved_papers}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">Rejected</div>
                <div className="text-3xl font-bold text-red-600">{stats.rejected_papers}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">Total Courses</div>
                <div className="text-3xl font-bold text-indigo-600">{stats.total_courses}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-sm text-gray-600 mb-1">Total Users</div>
                <div className="text-3xl font-bold text-purple-600">{stats.total_users}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Papers ({pendingPapers.length})</h2>
            {pendingPapers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
                No pending papers to review
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPapers.map(paper => (
                  <div key={paper.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{paper.title}</h3>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">{paper.course_code}</span> - {paper.course_name}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Uploaded by {paper.uploader_name} ({paper.uploader_email})
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {paper.paper_type}
                      </span>
                    </div>

                    {paper.description && (
                      <p className="text-gray-700 mb-4">{paper.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        {paper.year && `Year: ${paper.year}`}
                        {paper.semester && ` | ${paper.semester}`}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => reviewPaper(paper.id, 'approved')}
                          className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <CheckCircle size={18} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:');
                            if (reason) reviewPaper(paper.id, 'rejected', reason);
                          }}
                          className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <XCircle size={18} />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Courses</h2>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                    <input
                      type="text"
                      value={courseForm.code}
                      onChange={(e) => setCourseForm({...courseForm, code: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="CS1108"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                    <input
                      type="text"
                      value={courseForm.name}
                      onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Python Programming"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows="2"
                    placeholder="Optional description"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCourseSubmit}
                    disabled={loading || !courseForm.code || !courseForm.name}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {editingCourse ? 'Update' : 'Create'} Course
                  </button>
                  {editingCourse && (
                    <button
                      onClick={() => {
                        setEditingCourse(null);
                        setCourseForm({ code: '', name: '', description: '' });
                      }}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {courses.map(course => (
                <div key={course.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-800">{course.code} - {course.name}</div>
                    {course.description && (
                      <div className="text-sm text-gray-600 mt-1">{course.description}</div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingCourse(course);
                        setCourseForm({ code: course.code, name: course.name, description: course.description || '' });
                      }}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}