export default function Badge({ label, color, background }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        color,
        background,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}
