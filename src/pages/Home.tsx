import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Post } from '../types';

export default function Home() {
  const [latestPosts, setLatestPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatest() {
      try {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(3));
        const querySnapshot = await getDocs(q);
        const posts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];
        setLatestPosts(posts);
      } catch (error) {
        console.error("Error fetching latest posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLatest();
  }, []);

  return (
    <div className="container">
      <section className="text-center py-10 md:py-20">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold tracking-tight mb-5"
        >
          Dr. Qazi Nasir
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-text-muted max-w-2xl mx-auto mb-10"
        >
          Researcher in Chemical Engineering, Thermodynamics, and Artificial Intelligence.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link to="/about" className="btn">More About Me</Link>
          <Link to="/contact" className="btn btn-outline">Get in Touch</Link>
        </motion.div>
      </section>

      <section className="mt-20">
        <h2 className="text-3xl font-bold mb-10">Latest Articles</h2>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : latestPosts.length === 0 ? (
          <p className="text-center text-text-muted py-10">No articles published yet.</p>
        ) : (
          <div className="grid gap-8">
            {latestPosts.map((post, index) => (
              <motion.article 
                key={post.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="blog-card"
              >
                <span className="post-meta">{post.dateStr} • {post.category}</span>
                <h3 className="text-2xl font-bold mb-4">
                  <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-text-muted mb-5">{post.excerpt}</p>
                <Link to={`/blog/${post.slug}`} className="text-primary font-semibold flex items-center gap-1 hover:underline group">
                  Read more <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.article>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Link to="/blog" className="btn btn-outline">View All Posts</Link>
        </div>
      </section>
    </div>
  );
}
