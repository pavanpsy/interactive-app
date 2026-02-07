export default function Card({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="
        w-full max-w-lg
        bg-white
        rounded-3xl
        p-8
        shadow-[0_20px_60px_rgba(0,0,0,0.08)]
        border border-gray-100
      "
    >
      {children}
    </div>
  )
}
