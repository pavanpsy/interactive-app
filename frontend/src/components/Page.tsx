export function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="
      min-h-screen
      flex items-center justify-center
      bg-white
      px-6
    ">
    <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white -z-10" />

      {children}
    </div>
  )
}
