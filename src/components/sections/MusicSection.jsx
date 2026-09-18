import Section from '../Section'
import { SPOTIFY_PLAYLIST_URL, getSpotifyEmbedUrl } from '../../config'

export default function MusicSection() {
  const embedSrc = getSpotifyEmbedUrl(SPOTIFY_PLAYLIST_URL)

  return (
    <Section id="music" title="Our Playlist" subtitle="Lagu-lagu kecil untuk kita.">
      <div className="spotify-wrap">
        <iframe
          title="Spotify playlist"
          src={embedSrc}
          width="100%"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{ borderRadius: 16 }}
        />
      </div>
    </Section>
  )
}
