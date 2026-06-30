"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Loader2, Star, Search, ArrowUpDown, MapPin } from "lucide-react"

interface Space {
  uuid: string
  restaurant_name: string
  ilha: string
  rating: number | null
  review_count: number | null
  business_status: string
  google_type: string | null
  full_address: string | null
}

type SortKey = "name" | "rating" | "reviews"

export default function Registry() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [ilhaFilter, setIlhaFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortKey, setSortKey] = useState<SortKey>("rating")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    const fetchAll = async () => {
      let all: Space[] = []
      let from = 0
      while (true) {
        const { data } = await supabase
          .from("azorean_gastronomy")
          .select("uuid, restaurant_name, ilha, rating, review_count, business_status, google_type, full_address")
          .range(from, from + 999)
        if (!data || data.length === 0) break
        all = [...all, ...(data as Space[])]
        if (data.length < 1000) break
        from += 1000
      }
      setSpaces(all)
      setLoading(false)
    }
    fetchAll()
  }, [])

  const filtered = useMemo(() => {
    let r = spaces
    if (search) r = r.filter(s => s.restaurant_name.toLowerCase().includes(search.toLowerCase()))
    if (ilhaFilter !== "all") r = r.filter(s => s.ilha === ilhaFilter)
    if (statusFilter !== "all") r = r.filter(s => s.business_status === statusFilter)
    return [...r].sort((a, b) => {
      let cmp = 0
      if (sortKey === "name") cmp = a.restaurant_name.localeCompare(b.restaurant_name)
      if (sortKey === "rating") cmp = (Number(a.rating)||0) - (Number(b.rating)||0)
      if (sortKey === "reviews") cmp = (a.review_count||0) - (b.review_count||0)
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [spaces, search, ilhaFilter, statusFilter, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("desc") }
  }

  const statusLabel = (s: string) => ({
    operational: "Aberto", temporarily_closed: "Temp. encerrado", permanently_closed: "Encerrado", invalid_location: "Localização inválida"
  }[s] || s)
  const statusColor = (s: string) => ({
    operational: "bg-emerald-50 text-emerald-700", temporarily_closed: "bg-amber-50 text-amber-700",
    permanently_closed: "bg-red-50 text-red-700", invalid_location: "bg-preto/5 text-preto/40"
  }[s] || "bg-preto/5 text-preto/40")

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-6 w-6 animate-spin text-ocean" /></div>

  return (
    <div className="p-8 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-preto/30">Cadastro</p>
        <h1 className="mt-1 text-2xl font-serif font-bold text-preto">Estabelecimentos</h1>
        <p className="text-sm text-preto/50">{filtered.length} de {spaces.length} espaços</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-preto/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar nome..."
            className="w-full rounded-xl border border-preto/8 bg-branco pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-ocean/40" />
        </div>
        <select value={ilhaFilter} onChange={e => setIlhaFilter(e.target.value)}
          className="rounded-xl border border-preto/8 bg-branco px-3 py-2.5 text-sm font-semibold text-preto">
          <option value="all">Todas as ilhas</option>
          <option value="pico">Pico</option>
          <option value="faial">Faial</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl border border-preto/8 bg-branco px-3 py-2.5 text-sm font-semibold text-preto">
          <option value="all">Todos os estados</option>
          <option value="operational">Aberto</option>
          <option value="temporarily_closed">Temp. encerrado</option>
          <option value="permanently_closed">Encerrado</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="rounded-2xl bg-branco border border-preto/8 overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_100px_100px_140px] gap-4 px-6 py-3 border-b border-preto/5 bg-cream/50">
          <button onClick={() => toggleSort("name")} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-preto/40 hover:text-preto">
            Nome <ArrowUpDown className="h-3 w-3" />
          </button>
          <p className="text-xs font-bold uppercase tracking-wider text-preto/40">Ilha</p>
          <button onClick={() => toggleSort("rating")} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-preto/40 hover:text-preto">
            Rating <ArrowUpDown className="h-3 w-3" />
          </button>
          <button onClick={() => toggleSort("reviews")} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-preto/40 hover:text-preto">
            Reviews <ArrowUpDown className="h-3 w-3" />
          </button>
          <p className="text-xs font-bold uppercase tracking-wider text-preto/40">Estado</p>
        </div>
        <div className="divide-y divide-preto/5 max-h-[600px] overflow-y-auto">
          {filtered.map(s => (
            <div key={s.uuid} className="grid grid-cols-[1fr_120px_100px_100px_140px] gap-4 px-6 py-3 items-center hover:bg-cream/50 transition-colors">
              <div>
                <p className="text-sm font-semibold text-preto truncate">{s.restaurant_name}</p>
                <p className="text-xs text-preto/40 truncate">{s.google_type || "—"}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-preto/50">
                <MapPin className="h-3 w-3" />{s.ilha === "pico" ? "Pico" : "Faial"}
              </div>
              <div className="flex items-center gap-1">
                {s.rating ? (<><Star className="h-3.5 w-3.5 fill-signal text-signal" /><span className="text-sm font-bold text-preto">{s.rating}</span></>) : <span className="text-xs text-preto/30">—</span>}
              </div>
              <p className="text-xs text-preto/50">{s.review_count || 0}</p>
              <span className={`inline-block w-fit rounded-full px-2.5 py-1 text-[10px] font-bold ${statusColor(s.business_status)}`}>
                {statusLabel(s.business_status)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
