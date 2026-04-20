import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Post } from '../types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Post[];
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="container">
      <h1 className="text-4xl font-bold mb-4">Articles & Research</h1>
      <p className="text-text-muted text-lg mb-12">Thoughts, updates, and tutorials on process engineering, ML models, and thermodynamics.</p>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-text-muted mb-5">No articles have been published yet.</p>
          <Link to="/dashboard" className="btn">Go to Dashboard</Link>
        </div>
      ) : (
        <div className="grid gap-10">
          {posts.map((post, idx) => (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="blog-card"
            >
              <span className="post-meta">{post.dateStr} • {post.category}</span>
              <h2 className="text-2xl font-bold mb-4">
                <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </h2>
              <p className="text-text-muted mb-6 leading-relaxed">{post.excerpt}</p>
              <Link to={`/blog/${post.slug}`} className="text-primary font-bold flex items-center gap-1 hover:underline group">
                Read full article <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
