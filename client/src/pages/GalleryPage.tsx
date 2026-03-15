import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Post } from '@dplmia/shared';
import { feedApi } from '../api/feed.api';

export default function GalleryPage() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    feedApi.getGallery().then((r) => setPosts(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="page">
      <h1>{t('gallery.title')}</h1>
      {posts.length === 0 ? (
        <p className="text-muted">{t('gallery.empty')}</p>
      ) : (
        <div className="gallery-grid">
          {posts.map((p) => (
            <div key={p.id} className="gallery-item">
              <img src={p.mediaUrl!} alt={p.title} />
              <div className="gallery-caption">
                <strong>{p.title}</strong>
                <span>{p.class.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
