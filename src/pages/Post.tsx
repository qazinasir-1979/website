import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Post as PostType } from '../types';
import { Loader2, ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;
      try {
        const q = query(collection(db, 'posts'), where('slug', '==', slug), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setPost({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as PostType);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  }

  if (!post) {
    return (
      <div className="container text-center py-20">
        <h1 className="text-3xl font-bold mb-5">Post Not Found</h1>
        <Link to="/blog" className="btn btn-outline">Back to Blog</Link>
      </div>
    );
  }

  return (
    <article className="container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <Link to="/blog" className="inline-flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={18} /> Back to articles
        </Link>
        
        <div className="flex flex-wrap gap-4 text-sm text-text-muted mb-6">
          <span className="flex items-center gap-1.5"><Calendar size={16} /> {post.dateStr}</span>
          <span className="flex items-center gap-1.5"><Tag size={16} /> {post.category}</span>
          <span className="flex items-center gap-1.5"><User size={16} /> By {post.author}</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-10 leading-tight">
          {post.title}
        </h1>
        
        <div className="w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-20 mb-12"></div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="prose prose-lg max-w-none text-text-main leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="mt-20 pt-10 border-t border-border-main text-center">
        <h3 className="text-xl font-bold mb-6">Enjoyed this article?</h3>
        <Link to="/contact" className="btn">Get in Touch with Qazi</Link>
      </div>
    </article>
  );
}
