import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Post, Comment } from '../lib/types';
import { feedApi } from '../api/feed.api';
import { useAuth } from '../context/AuthContext';
import AudioPlayer from '../components/common/AudioPlayer';

type PostType = 'TEXT' | 'IMAGE' | 'AUDIO';

export default function FeedPage() {
  const { t } = useTranslation();
  const { teacher } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [type, setType] = useState<PostType>('TEXT');
  const [form, setForm] = useState({ title: '', content: '' });
  const [file, setFile] = useState<File | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  async function load() {
    const r = await feedApi.getFeed();
    setPosts(r.data.data);
  }

  useEffect(() => { load(); }, []);

  async function loadComments(postId: string) {
    const r = await feedApi.getComments(postId);
    setComments((prev) => ({ ...prev, [postId]: r.data.data }));
    setOpenComments((prev) => ({ ...prev, [postId]: true }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (type === 'TEXT') await feedApi.createText({ title: form.title, content: form.content });
      else if (type === 'IMAGE' && file) await feedApi.createImage(form.title, form.content || undefined, file);
      else if (type === 'AUDIO' && file) await feedApi.createAudio(form.title, form.content || undefined, file);
      setForm({ title: '', content: '' });
      setFile(null);
      load();
    } catch (err: any) {
      setError(err.response?.data?.error ?? t('common.error'));
    }
  }

  async function addComment(postId: string) {
    const text = commentText[postId] ?? '';
    if (!text.trim()) return;
    await feedApi.addComment(postId, text);
    setCommentText((prev) => ({ ...prev, [postId]: '' }));
    loadComments(postId);
  }

  async function deletePost(id: string) {
    await feedApi.deletePost(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="page">
      <h1>{t('feed.title')}</h1>

      <div className="card">
        <div className="tab-row">
          {(['TEXT', 'IMAGE', 'AUDIO'] as PostType[]).map((tp) => (
            <button key={tp} className={type === tp ? 'tab active' : 'tab'} onClick={() => setType(tp)}>
              {t(`feed.${tp.toLowerCase()}`)}
            </button>
          ))}
        </div>
        {error && <p className="error">{error}</p>}
        <form onSubmit={submit}>
          <input
            placeholder={t('feed.postTitle')}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            placeholder={t('feed.postContent')}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={3}
          />
          {(type === 'IMAGE' || type === 'AUDIO') && (
            <input
              type="file"
              accept={type === 'IMAGE' ? 'image/*' : 'audio/*'}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          )}
          <button type="submit" className="btn-primary">{t('feed.publish')}</button>
        </form>
      </div>

      {posts.length === 0 ? (
        <p className="text-muted">{t('feed.noFeed')}</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="card post-card">
            <div className="post-header">
              <div>
                <h3>{post.title}</h3>
                <span className="text-muted">{t('common.by')} <strong>{post.class.name}</strong></span>
              </div>
              {post.class.id === teacher?.class?.id && (
                <button className="btn-danger btn-sm" onClick={() => deletePost(post.id)}>
                  {t('feed.deletePost')}
                </button>
              )}
            </div>

            {post.content && <p>{post.content}</p>}

            {post.mediaType === 'IMAGE' && post.mediaUrl && (
              <img src={post.mediaUrl} alt={post.title} className="post-image" />
            )}
            {post.mediaType === 'AUDIO' && post.mediaUrl && (
              <AudioPlayer src={post.mediaUrl} title={post.title} />
            )}

            <div className="post-footer">
              <button
                className="btn-ghost btn-sm"
                onClick={() =>
                  openComments[post.id] ? setOpenComments((p) => ({ ...p, [post.id]: false })) : loadComments(post.id)
                }
              >
                💬 {post._count?.comments ?? 0} {t('feed.comment')}
              </button>
            </div>

            {openComments[post.id] && (
              <div className="comments-section">
                {(comments[post.id] ?? []).map((c) => (
                  <div key={c.id} className="comment">
                    <strong>{c.class.name}</strong>: {c.content}
                  </div>
                ))}
                <div className="comment-form">
                  <input
                    placeholder={t('feed.addComment')}
                    value={commentText[post.id] ?? ''}
                    onChange={(e) => setCommentText((p) => ({ ...p, [post.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addComment(post.id)}
                  />
                  <button className="btn-primary btn-sm" onClick={() => addComment(post.id)}>
                    {t('feed.send')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
