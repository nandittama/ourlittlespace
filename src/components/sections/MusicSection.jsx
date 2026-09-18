import Section from '../Section'
import { SPOTIFY_PLAYLIST_EMBED } from '../../config'

export default function MusicSection() {
  return (
    <Section id="music" title="Our Playlist" subtitle="Lagu-lagu kecil untuk kita.">
      <div className="spotify-wrap">
        <iframe
          title="Spotify playlist"
          src={SPOTIFY_PLAYLIST_EMBED}
          width="100%"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          style={{ borderRadius: 16 }}
        />
      </div>
    </Section>
  )
}
