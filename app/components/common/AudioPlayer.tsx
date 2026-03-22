export default function AudioPlayer({ src, title }: { src: string; title: string }) {
  return (
    <div className="audio-player">
      <p className="audio-title">{title}</p>
      <audio controls src={src} style={{ width: '100%' }} />
    </div>
  )
}
