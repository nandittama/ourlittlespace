import { APP_NAME, APP_TAGLINE, getPersonName } from '../../config'

export default function FooterSection() {
  return (
    <footer className="site-footer">
      <p className="site-footer__title">{APP_NAME}</p>
      <p>{APP_TAGLINE}</p>
      <p className="muted tiny">
        {getPersonName('kamu')} &amp; {getPersonName('dia')} · Made with love
      </p>
    </footer>
  )
}
