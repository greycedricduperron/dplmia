import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Post } from '../lib/types';
import { feedApi } from '../api/feed.api';
import AudioPlayer from '../components/common/AudioPlayer';

export default function AudioPage() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    feedApi.getAudio().then((r) => setPosts(r.data.data)).catch(() => {});
  }, []);

  return (
    <div className="page">
      <h1>{t('audio.title')}</h1>
      {posts.length === 0 ? (
        <p className="text-muted">{t('audio.empty')}</p>
      ) : (
        <div className="audio-list">
          {posts.map((p) => (
            <div key={p.id} className="card">
              <p className="text-muted">{p.class.name}</p>
              <AudioPlayer src={p.mediaUrl!} title={p.title} />
              {p.content && <p>{p.content}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
