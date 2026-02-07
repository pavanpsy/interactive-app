interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost"
}

export default function Button({
  children,
  variant = "primary",
  ...props
}: ButtonProps) {
  const base = `
    w-full
    py-4
    rounded-2xl
    font-semibold
    transition-all
    active:scale-[0.97]
    disabled:opacity-50
  `

  const styles =
    variant === "primary"
      ? "bg-black text-white hover:bg-gray-800 shadow-lg"
      : "bg-transparent text-black hover:bg-gray-100"

  return (
    <button {...props} className={`${base} ${styles}`}>
      {children}
    </button>
  )
}
