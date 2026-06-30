"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Heart, Database, Map, Fish } from "lucide-react"

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/sentiment", label: "Sentimento", icon: Heart },
  { href: "/dashboard/registry", label: "Cadastro", icon: Database },
  { href: "/dashboard/heatmap", label: "Mapa", icon: Map },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-preto/8 bg-branco">
      <div className="flex items-center gap-2.5 border-b border-preto/8 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ocean">
          <Fish className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-ocean leading-none">beacly</p>
          <p className="text-[10px] text-preto/40 font-medium">gov</p>
        </div>
      </div>
      <div className="border-b border-preto/8 px-5 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-preto/30">Região</p>
        <p className="mt-0.5 text-sm font-bold text-preto">Pico & Faial</p>
        <p className="text-xs text-preto/40">Açores</p>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-ocean text-white" : "text-preto/60 hover:bg-cream hover:text-preto"}`}>
              <Icon className="h-4 w-4 shrink-0" />{label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
