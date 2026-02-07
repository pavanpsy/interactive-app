interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: string[]
}

export default function Select({
  value,
  onChange,
  options
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full
        rounded-2xl
        border border-gray-200
        px-5 py-4
        text-lg
        bg-white
        focus:outline-none
        focus:ring-2 focus:ring-black
      "
    >
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}
