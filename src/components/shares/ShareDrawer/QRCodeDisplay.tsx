import { QRCodeSVG } from 'qrcode.react'
import styles from './QRCodeDisplay.module.scss'

interface QRCodeDisplayProps {
  url: string | null
}

function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  if (!url) return null
  return (
    <div className={styles.container}>
      <QRCodeSVG
        value={url}
        size={160}
        bgColor="#0D0D0D"
        fgColor="#0df20d"
      />
      <span className={styles.instruction}>// QR_SHARE</span>
    </div>
  )
}

export default QRCodeDisplay
