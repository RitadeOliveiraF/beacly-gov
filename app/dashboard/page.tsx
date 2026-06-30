"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { AZORES_HORECA, AZORES_TOTALS } from "@/lib/radiografia"
import { Building2, Star, MapPin, AlertTriangle, Loader2, MessageSquare, Utensils, Coffee, Wine, Zap, Cookie, IceCream } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

interface Space {
  uuid: string
  restaurant_name: string
  ilha: string
  rating: number | null
  review_count: number | null
  business_status: string
  google_type: string | null
}

const CATEGORY_ICONS = [
  { key: "restaurante", label: "Restaurante", icon: Utensils, color: "#0B2D6B" },
  { key: "cafe", label: "Café", icon: Coffee, color: "#10B981" },
  { key: "barPub", label: "Bar / Pub", icon: Wine, color: "#F59E0B" },
  { key: "fastFood", label: "Fast Food", icon: Zap, color: "#EF4444" },
  { key: "pastelaria", label: "Pastelaria", icon: Cookie, color: "#6366F1" },
  { key: "geladosSumos", label: "Gelados / Sumos", icon: IceCream, color: "#EC4899" },
] as const

export default function Overview() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      let all: Space[] = []
      let from = 0
      while (true) {
        const { data } = await supabase
          .from("azorean_gastronomy")
          .select("uuid, restaurant_name, ilha, rating, review_count, business_status, google_type")
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

  const deepStats = useMemo(() => {
    if (!spaces.length) return null
    const operational = spaces.filter(s => s.business_status === "operational").length
    const tempClosed = spaces.filter(s => s.business_status === "temporarily_closed").length
    const permClosed = spaces.filter(s => s.business_status === "permanently_closed").length
    const withRating = spaces.filter(s => s.rating)
    const avgRating = withRating.length ? withRating.reduce((a, s) => a + Number(s.rating), 0) / withRating.length : 0
    const totalReviews = spaces.reduce((a, s) => a + (s.review_count || 0), 0)
    return { total: spaces.length, operational, tempClosed, permClosed, avgRating, totalReviews }
  }, [spaces])

  const pctMapped = Math.round(((AZORES_HORECA.find(i=>i.name==="Pico")!.total + AZORES_HORECA.find(i=>i.name==="Faial")!.total) / AZORES_TOTALS.total) * 100)

  return (
    <div className="p-8 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-preto/30">Dashboard</p>
        <h1 className="mt-1 text-2xl font-serif font-bold text-preto">Radiografia HoReCa — Açores</h1>
        <p className="text-sm text-preto/50">Universo regional + cobertura aprofundada Pico & Faial</p>
      </div>

      {/* Universo total Açores */}
      <div className="rounded-2xl bg-ocean text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-60">Universo HoReCa — 9 ilhas</p>
            <p className="text-4xl font-bold mt-1">{AZORES_TOTALS.total.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold">{pctMapped}% mapeado em profundidade</div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORY_ICONS.map(({ key, label, icon: Icon, color }) => {
            const val = AZORES_TOTALS[key as keyof typeof AZORES_TOTALS] as number
            const pct = ((val / AZORES_TOTALS.total) * 100).toFixed(1)
            return (
              <div key={key} className="rounded-xl bg-white/10 p-3">
                <Icon className="h-4 w-4 mb-1.5 opacity-80" />
                <p className="text-xl font-bold">{val}</p>
                <p className="text-[10px] opacity-60">{label}</p>
                <p className="text-[10px] opacity-50">{pct}%</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tabela por ilha */}
      <div className="rounded-2xl bg-branco border border-preto/8 overflow-hidden">
        <div className="px-6 py-4 border-b border-preto/5 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-preto/40">Distribuição por ilha</p>
          <div className="flex gap-3 text-[10px] text-preto/40">
            {CATEGORY_ICONS.map(({key,label,color}) => (
              <span key={key} className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{background:color}}/>{label}</span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-preto/5 text-left">
                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-preto/30">Ilha</th>
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-preto/30">Total</th>
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-ocean">Rest.</th>
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-emerald-600">Café</th>
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-amber-600">Bar/Pub</th>
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-red-500">Fast Food</th>
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-indigo-500">Past.</th>
                <th className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-pink-500">Gel./Sum.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-preto/5">
              {AZORES_HORECA.map(ilha => (
                <tr key={ilha.name} className={ilha.mapped ? "bg-ocean/5" : ""}>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-preto">{ilha.name}</span>
                      {ilha.mapped && <span className="rounded-full bg-ocean/10 px-2 py-0.5 text-[9px] font-bold text-ocean">Mapeado</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-bold text-preto">{ilha.total}</td>
                  <td className="px-3 py-3 text-preto/70">{ilha.restaurante}</td>
                  <td className="px-3 py-3 text-preto/70">{ilha.cafe}</td>
                  <td className="px-3 py-3 text-preto/70">{ilha.barPub}</td>
                  <td className="px-3 py-3 text-preto/70">{ilha.fastFood}</td>
                  <td className="px-3 py-3 text-preto/70">{ilha.pastelaria}</td>
                  <td className="px-3 py-3 text-preto/70">{ilha.geladosSumos || "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-preto/10 font-bold">
                <td className="px-6 py-3 text-preto">Total</td>
                <td className="px-3 py-3 text-preto">{AZORES_TOTALS.total.toLocaleString()}</td>
                <td className="px-3 py-3 text-preto">{AZORES_TOTALS.restaurante}</td>
                <td className="px-3 py-3 text-preto">{AZORES_TOTALS.cafe}</td>
                <td className="px-3 py-3 text-preto">{AZORES_TOTALS.barPub}</td>
                <td className="px-3 py-3 text-preto">{AZORES_TOTALS.fastFood}</td>
                <td className="px-3 py-3 text-preto">{AZORES_TOTALS.pastelaria}</td>
                <td className="px-3 py-3 text-preto">{AZORES_TOTALS.geladosSumos}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Comparação visual por ilha */}
      <div className="rounded-2xl bg-branco border border-preto/8 p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-preto/40 mb-4">Estabelecimentos por ilha</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={AZORES_HORECA} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#1a1a1a80" }} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: "#1a1a1a80" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e8e4de", fontSize: 12 }} />
            <Bar dataKey="total" radius={[0,6,6,0]}>
              {AZORES_HORECA.map((entry, i) => (
                <rect key={i} fill={entry.mapped ? "#0B2D6B" : "#0B2D6B40"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cobertura aprofundada — Pico & Faial */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-1.5 w-1.5 rounded-full bg-ocean" />
          <p className="text-xs font-bold uppercase tracking-wider text-preto/40">Cobertura aprofundada — Pico & Faial</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32"><Loader2 className="h-5 w-5 animate-spin text-ocean" /></div>
        ) : deepStats && (
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-branco border border-preto/8 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-preto/30">Mapeados</span>
                <Building2 className="h-4 w-4 text-preto/20" />
              </div>
              <p className="text-3xl font-bold text-preto">{deepStats.total}</p>
              <p className="mt-1 text-xs text-preto/40">{deepStats.operational} operacionais</p>
            </div>
            <div className="rounded-2xl bg-branco border border-preto/8 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-preto/30">Rating médio</span>
                <Star className="h-4 w-4 fill-signal text-signal" />
              </div>
              <p className="text-3xl font-bold text-preto">{deepStats.avgRating.toFixed(2)}</p>
              <p className="mt-1 text-xs text-preto/40">Dados Google validados</p>
            </div>
            <div className="rounded-2xl bg-branco border border-preto/8 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-preto/30">Reviews analisadas</span>
                <MessageSquare className="h-4 w-4 text-preto/20" />
              </div>
              <p className="text-3xl font-bold text-preto">{deepStats.totalReviews.toLocaleString()}</p>
              <p className="mt-1 text-xs text-preto/40">Volume agregado Google</p>
            </div>
            <div className={`rounded-2xl p-5 ${deepStats.tempClosed + deepStats.permClosed > 0 ? "bg-amber-50 border border-amber-200" : "bg-branco border border-preto/8"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${deepStats.tempClosed + deepStats.permClosed > 0 ? "text-amber-600" : "text-preto/30"}`}>Encerrados</span>
                <AlertTriangle className={`h-4 w-4 ${deepStats.tempClosed + deepStats.permClosed > 0 ? "text-amber-500" : "text-preto/20"}`} />
              </div>
              <p className={`text-3xl font-bold ${deepStats.tempClosed + deepStats.permClosed > 0 ? "text-amber-700" : "text-preto"}`}>{deepStats.tempClosed + deepStats.permClosed}</p>
              <p className="mt-1 text-xs text-preto/40">{deepStats.tempClosed} temp · {deepStats.permClosed} perm</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
