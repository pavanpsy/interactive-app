interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input(props: InputProps) {
  return (
    <input
      {...props}
      className="
        w-full
        rounded-2xl
        border border-gray-200
        px-5 py-4
        text-lg
        focus:outline-none
        focus:ring-2 focus:ring-black
      "
    />
  )
}
