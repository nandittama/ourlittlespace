import { APP_NAME, ANNIVERSARY_DATE, PERSON_ONE_NAME, PERSON_TWO_NAME } from '../../config'
import { formatAnniversaryLabel } from '../../utils/date'

export default function FooterSection() {
  return (
    <footer className="site-footer">
      <p className="site-footer__title">{APP_NAME}</p>
      <p>
        Made for {PERSON_ONE_NAME} &amp; {PERSON_TWO_NAME} 🤍
      </p>
      <p className="muted tiny">Since {formatAnniversaryLabel(ANNIVERSARY_DATE)}</p>
    </footer>
  )
}
