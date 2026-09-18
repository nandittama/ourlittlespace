import { APP_NAME, PERSON_ONE_NAME, PERSON_TWO_NAME } from '../../config'

export default function FooterSection() {
  return (
    <footer className="site-footer">
      <p className="site-footer__title">{APP_NAME}</p>
      <p>
        {PERSON_ONE_NAME} &amp; {PERSON_TWO_NAME}
      </p>
      <p className="muted tiny">Made with love.</p>
    </footer>
  )
}
