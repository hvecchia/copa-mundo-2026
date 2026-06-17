function emojiToIso(emoji) {
  if (!emoji) return ''
  const pts = [...emoji]
    .map(c => c.codePointAt(0))
    .filter(cp => cp >= 0x1F1E6 && cp <= 0x1F1FF)
  if (pts.length < 2) return ''
  return pts.slice(0, 2).map(cp => String.fromCharCode(cp - 0x1F1E6 + 65)).join('').toLowerCase()
}

export default function Flag({ emoji, size = 'text-xl', className = '' }) {
  const iso = emojiToIso(emoji)
  if (!iso) return <span className={`text-gray-600 ${className}`}>?</span>
  return (
    <span
      className={`fi fi-${iso} ${size} ${className}`}
      style={{ borderRadius: '2px' }}
    />
  )
}
