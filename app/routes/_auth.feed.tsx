import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { Post, Comment } from '../types'
import {
  getFeedFn,
  createTextPostFn,
  createMediaPostFn,
  deletePostFn,
  getCommentsFn,
  addCommentFn,
} from '../functions/feed'
import { useAuth } from '../context/AuthContext'
import AudioPlayer from '../components/common/AudioPlayer'

type PostType = 'TEXT' | 'IMAGE' | 'AUDIO'

export const Route = createFileRoute('/_auth/feed')({
  component: FeedPage,
})

function FeedPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [type, setType] = useState<PostType>('TEXT')
  const [form, setForm] = useState({ title: '', content: '' })
  const [file, setFile] = useState<File | null>(null)
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({})
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  async function load() {
    try {
      const result = await getFeedFn()
      setPosts(result as Post[])
    } catch {
      // No connection yet — show empty feed
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function loadComments(postId: string) {
    const result = await getCommentsFn({ data: { postId } })
    setComments((prev) => ({ ...prev, [postId]: result as Comment[] }))
    setOpenComments((prev) => ({ ...prev, [postId]: true }))
  }

  async function uploadFile(f: File, mediaType: 'IMAGE' | 'AUDIO'): Promise<string> {
    const endpoint =
      mediaType === 'IMAGE' ? '/api/feed/upload-image' : '/api/feed/upload-audio'
    const formData = new FormData()
    formData.append('file', f)
    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
    if (!res.ok) throw new Error('UPLOAD_FAILED')
    const json = await res.json() as { data: { url: string } }
    return json.data.url
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      if (type === 'TEXT') {
        await createTextPostFn({ data: { title: form.title, content: form.content || undefined } })
      } else if (file) {
        const url = await uploadFile(file, type)
        await createMediaPostFn({
          data: { title: form.title, content: form.content || undefined, mediaUrl: url, mediaType: type },
        })
      }
      setForm({ title: '', content: '' })
      setFile(null)
      load()
    } catch {
      setError(t('common.error'))
    }
  }

  async function addComment(postId: string) {
    const text = commentText[postId] ?? ''
    if (!text.trim()) return
    await addCommentFn({ data: { postId, content: text } })
    setCommentText((prev) => ({ ...prev, [postId]: '' }))
    loadComments(postId)
  }

  async function deletePost(id: string) {
    await deletePostFn({ data: { postId: id } })
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="page">
      <h1>{t('feed.title')}</h1>

      <div className="card">
        <div className="tab-row">
          {(['TEXT', 'IMAGE', 'AUDIO'] as PostType[]).map((tp) => (
            <button
              key={tp}
              className={type === tp ? 'tab active' : 'tab'}
              onClick={() => setType(tp)}
            >
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
          <button type="submit" className="btn-primary">
            {t('feed.publish')}
          </button>
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
                <span className="text-muted">
                  {t('common.by')} <strong>{post.class.name}</strong>
                </span>
              </div>
              {post.class.id === user?.class?.id && (
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
                  openComments[post.id]
                    ? setOpenComments((p) => ({ ...p, [post.id]: false }))
                    : loadComments(post.id)
                }
              >
                💬 {post.commentCount ?? 0} {t('feed.comment')}
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
                    onChange={(e) =>
                      setCommentText((p) => ({ ...p, [post.id]: e.target.value }))
                    }
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
  )
}
