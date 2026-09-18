import { APP_NAME } from '../../config'

export default function FooterSection() {
  return (
    <footer className="site-footer">
      <p className="site-footer__title">{APP_NAME}</p>
    </footer>
  )
}
