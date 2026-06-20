import Logo from "./Logo"

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border py-12 overflow-hidden">
      <div className="absolute right-8 bottom-4 opacity-[0.04] pointer-events-none select-none">
        <Logo mono className="w-32 h-auto" />
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <p>&copy; {new Date().getFullYear()} Agiliza. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
