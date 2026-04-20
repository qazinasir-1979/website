import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  User
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Post } from '../types';
import { Loader2, Plus, Edit2, Trash2, LogOut, Lock, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [dateStr, setDateStr] = useState(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  const [author, setAuthor] = useState('Qazi Nasir');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setLoading(false);
        setPosts([]);
      }
    });

    // Real-time listener for posts
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    }, (err) => {
      console.error("Firestore listener error:", err);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribePosts();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);

    const email = username === 'admin' ? 'admin@qazinasir.com' : username;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Login failed:", err);
      setError('Invalid credentials. Check your username and password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const createSlug = (text: string) => {
    return text.toLowerCase().split(/[^a-z0-9]+/).filter(w => w).slice(0, 3).join('-') || 'post';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || content === '<p><br></p>') {
      alert("Please add some content.");
      return;
    }

    setSaving(true);
    const slug = createSlug(title);
    
    const postData = {
      title,
      category,
      dateStr,
      author,
      excerpt,
      content,
      slug,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingPost?.id) {
        await updateDoc(doc(db, 'posts', editingPost.id), postData);
        alert("✅ Post updated!");
      } else {
        await addDoc(collection(db, 'posts'), {
          ...postData,
          createdAt: serverTimestamp()
        });
        alert("🎉 Post published!");
      }
      resetForm();
    } catch (err: any) {
      console.error("Save failed:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setExcerpt('');
    setContent('');
    setEditingPost(null);
  };

  const startEdit = (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setCategory(post.category);
    setExcerpt(post.excerpt);
    setContent(post.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (postId: string) => {
    if (!postId) {
      setNotification({ message: "❌ Critical Error: Post ID is missing.", type: 'error' });
      return;
    }
    
    // Explicitly check for user auth before proceeding
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setNotification({ message: "❌ Auth Error: You must be logged in as an administrator to delete posts.", type: 'error' });
      return;
    }

    setDeletingId(postId); 
    
    try {
      console.log(`📡 Sending delete request for document: /posts/${postId}`);
      const postDocRef = doc(db, 'posts', postId);
      
      // Perform deletion
      await deleteDoc(postDocRef);
      
      console.log(`✅ Document ${postId} deleted successfully.`);
      setNotification({ message: "🗑️ Post deleted successfully!", type: 'success' });
      setConfirmDeleteId(null);
    } catch (err: any) {
      console.error("❌ Firebase Deletion Failed:", err);
      setNotification({ message: `❌ Error Deleting Post: ${err.message || 'Permission denied or network failure'}`, type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'color', 'background',
    'align',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  if (!user) {
    return (
      <div className="container py-20 flex justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-border-main p-10 rounded-2xl shadow-xl w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-primary" size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
            <p className="text-text-muted mt-2">Secure access only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type="text" required value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border-main rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border-main rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm font-medium text-center"
              >
                {error}
              </motion.p>
            )}

            <button 
              type="submit" disabled={authLoading}
              className="w-full btn flex items-center justify-center gap-2 py-4 text-lg"
            >
              {authLoading ? <Loader2 className="animate-spin" size={20} /> : 'Access Dashboard'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container relative">
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full shadow-lg font-medium ${
              notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        {confirmDeleteId && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Post?</h3>
              <p className="text-text-muted mb-6">This action is permanent and cannot be undone.</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setConfirmDeleteId(null)}
                  className="btn btn-outline py-3"
                  disabled={!!deletingId}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDelete(confirmDeleteId)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-md transition-colors flex items-center justify-center gap-2"
                  disabled={!!deletingId}
                >
                  {deletingId ? <Loader2 className="animate-spin" size={18} /> : 'Delete Item'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-text-muted">Welcome back, {user.displayName}</p>
        </div>
        <button onClick={handleLogout} className="btn btn-outline flex items-center gap-2">
          <LogOut size={18} /> Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-border-main p-8 rounded-xl shadow-sm mb-15">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
          {editingPost && (
            <button type="button" onClick={resetForm} className="text-text-muted hover:text-primary underline">
              Cancel Edit
            </button>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">Title</label>
            <input 
              type="text" required value={title} onChange={e => setTitle(e.target.value)}
              className="w-full p-3 border border-border-main rounded-md focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="Post Title"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <input 
                type="text" required value={category} onChange={e => setCategory(e.target.value)}
                className="w-full p-3 border border-border-main rounded-md outline-none"
                placeholder="Engineering, AI, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Author</label>
              <input 
                type="text" required value={author} onChange={e => setAuthor(e.target.value)}
                className="w-full p-3 border border-border-main rounded-md outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Excerpt</label>
            <textarea 
              required value={excerpt} onChange={e => setExcerpt(e.target.value)}
              className="w-full p-3 border border-border-main rounded-md outline-none min-h-[80px]"
              placeholder="Short summary for the feed..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Content</label>
            <div className="bg-white rounded-md overflow-hidden border border-border-main quill-editor-wrapper">
              <ReactQuill 
                theme="snow" 
                value={content} 
                onChange={setContent} 
                modules={modules}
                formats={formats}
                className="h-[400px] mb-12" 
                placeholder="Write your research findings or thoughts here..."
              />
            </div>
          </div>

          <button 
            type="submit" disabled={saving}
            className="w-full btn flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : (editingPost ? <Edit2 size={18} /> : <Plus size={18} />)}
            {editingPost ? 'Update Post' : 'Publish Post'}
          </button>
        </div>
      </form>

      <section>
        <h2 className="text-2xl font-bold mb-8">Existing Posts</h2>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : posts.length === 0 ? (
          <p className="text-center py-10 text-text-muted">No posts found in the database.</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="bg-white border border-border-main p-5 rounded-lg flex justify-between items-center group">
                <div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-sm text-text-muted">{post.dateStr} • {post.category}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(post)} className="p-2 text-text-muted hover:text-primary transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => setConfirmDeleteId(post.id!)} 
                    disabled={deletingId === post.id}
                    className="p-2 text-text-muted hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
