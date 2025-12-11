export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`block w-full border rounded px-3 py-2 ${className}`}
      {...props}
    />
  )
}

