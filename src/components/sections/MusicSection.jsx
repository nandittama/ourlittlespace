import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import Section from '../Section'
import { OUR_SONG } from '../../config'
import { formatAudioTime } from '../../utils/date'

const MusicSection = forwardRef(function MusicSection(_, ref) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [unavailable, setUnavailable] = useState(false)
  const [liked, setLiked] = useState(false)

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio || unavailable) return
    try {
      if (playing) {
        audio.pause()
        setPlaying(false)
      } else {
        await audio.play()
        setPlaying(true)
      }
    } catch (err) {
      console.error(err)
      setUnavailable(true)
    }
  }

  useImperativeHandle(ref, () => ({
    togglePlay: async () => {
      const audio = audioRef.current
      if (!audio || unavailable) return
      try {
        if (audio.paused) {
          await audio.play()
          setPlaying(true)
        } else {
          audio.pause()
          setPlaying(false)
        }
      } catch (err) {
        console.error(err)
        setUnavailable(true)
      }
    },
  }))

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined

    const onTime = () => setCurrent(audio.currentTime || 0)
    const onMeta = () => setDuration(audio.duration || 0)
    const onEnd = () => setPlaying(false)
    const onErr = () => {
      setUnavailable(true)
      setPlaying(false)
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)
    audio.addEventListener('error', onErr)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnd)
      audio.removeEventListener('error', onErr)
    }
  }, [])

  const seek = (e) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const next = Number(e.target.value)
    audio.currentTime = next
    setCurrent(next)
  }

  return (
    <Section id="music" title="Our Song" subtitle="Soundtrack kecil untuk kita.">
      <div className="music-card">
        <div className="music-card__art" aria-hidden="true">
          {OUR_SONG.artwork ? (
            <img
              src={OUR_SONG.artwork}
              alt=""
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : null}
          <span>♪</span>
        </div>
        <div className="music-card__body">
          <p className="music-label">{OUR_SONG.label}</p>
          <h3>{OUR_SONG.title}</h3>
          <p className="muted">{OUR_SONG.artist}</p>

          {unavailable ? (
            <p className="muted">Lagu kita belum tersedia saat ini.</p>
          ) : (
            <>
              <input
                className="music-progress"
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={current}
                onChange={seek}
                aria-label="Progress lagu"
              />
              <div className="music-times muted tiny">
                <span>{formatAudioTime(current)}</span>
                <span>{formatAudioTime(duration)}</span>
              </div>
              <div className="music-controls">
                <button
                  type="button"
                  id="music-play"
                  className="btn btn--primary music-play"
                  onClick={toggle}
                  aria-label={playing ? 'Jeda' : 'Putar'}
                >
                  {playing ? 'Pause' : 'Play'}
                </button>
                <button
                  type="button"
                  className={`icon-btn ${liked ? 'is-on' : ''}`}
                  aria-label="Favorit"
                  onClick={() => setLiked((v) => !v)}
                >
                  ♥
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <audio ref={audioRef} src={OUR_SONG.src} preload="metadata" />
    </Section>
  )
})

export default MusicSection
