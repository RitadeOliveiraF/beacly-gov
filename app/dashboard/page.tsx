"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Building2, Star, MapPin, AlertTriangle, Loader2, TrendingUp, MessageSquare } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts"

interface Space {
  uuid: string
  restaurant_name: string
  ilha: string
  rating: number | null
  review_count: number | null
  business_status: string
  google_type: string | null
}

const COLORS = ["#0B2D6B", "#E8602C", "#4ADE80", "#FBBF24", "#A78BFA", "#F472B6", "#60A5FA"]

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

  const stats = useMemo(() => {
    if (!spaces.length) return null
    const total = spaces.length
    const operational = spaces.filter(s => s.business_status === "operational").length
    const tempClosed = spaces.filter(s => s.business_status === "temporarily_closed").length
    const permClosed = spaces.filter(s => s.business_status === "permanently_closed").length
    const withRating = spaces.filter(s => s.rating)
    const avgRating = withRating.length ? withRating.reduce((a, s) => a + Number(s.rating), 0) / withRating.length : 0
    const totalReviews = spaces.reduce((a, s) => a + (s.review_count || 0), 0)

    const byIlha = ["pico", "faial"].map(ilha => ({
      ilha: ilha === "pico" ? "Pico" : "Faial",
      count: spaces.filter(s => s.ilha === ilha).length,
      avgRating: (() => {
        const r = spaces.filter(s => s.ilha === ilha && s.rating)
        return r.length ? (r.reduce((a, s) => a + Number(s.rating), 0) / r.length).toFixed(2) : "—"
      })(),
    }))

    const byType: Record<string, number> = {}
    spaces.forEach(s => {
      const t = s.google_type || "Outro"
      byType[t] = (byType[t] || 0) + 1
    })
    const topTypes = Object.entries(byType).sort((a,b) => b[1]-a[1]).slice(0,7).map(([type, count]) => ({ type, count }))

    return { total, operational, tempClosed, permClosed, avgRating, totalReviews, byIlha, topTypes }
  }, [spaces])

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-6 w-6 animate-spin text-ocean" /></div>
  if (!stats) return null

  return (
    <div className="p-8 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-preto/30">Dashboard</p>
        <h1 className="mt-1 text-2xl font-serif font-bold text-preto">Turismo Gastronómico — Pico & Faial</h1>
        <p className="text-sm text-preto/50">Visão geral do ecossistema gastronómico mapeado</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-ocean text-white p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider opacity-60">Estabelecimentos</span>
            <Building2 className="h-4 w-4 opacity-60" />
          </div>
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="mt-1 text-xs opacity-50">{stats.operational} operacionais</p>
        </div>
        <div className="rounded-2xl bg-branco border border-preto/8 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-preto/30">Rating médio</span>
            <Star className="h-4 w-4 fill-signal text-signal" />
          </div>
          <p className="text-3xl font-bold text-preto">{stats.avgRating.toFixed(2)}</p>
          <p className="mt-1 text-xs text-preto/40">Pico & Faial combinados</p>
        </div>
        <div className="rounded-2xl bg-branco border border-preto/8 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-preto/30">Reviews totais</span>
            <MessageSquare className="h-4 w-4 text-preto/20" />
          </div>
          <p className="text-3xl font-bold text-preto">{stats.totalReviews.toLocaleString()}</p>
          <p className="mt-1 text-xs text-preto/40">Volume agregado Google</p>
        </div>
        <div className={`rounded-2xl p-5 ${stats.tempClosed + stats.permClosed > 0 ? "bg-amber-50 border border-amber-200" : "bg-branco border border-preto/8"}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${stats.tempClosed + stats.permClosed > 0 ? "text-amber-600" : "text-preto/30"}`}>Encerrados</span>
            <AlertTriangle className={`h-4 w-4 ${stats.tempClosed + stats.permClosed > 0 ? "text-amber-500" : "text-preto/20"}`} />
          </div>
          <p className={`text-3xl font-bold ${stats.tempClosed + stats.permClosed > 0 ? "text-amber-700" : "text-preto"}`}>{stats.tempClosed + stats.permClosed}</p>
          <p className="mt-1 text-xs text-preto/40">{stats.tempClosed} temp · {stats.permClosed} perm</p>
        </div>
      </div>

      {/* Por ilha */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {stats.byIlha.map(({ ilha, count, avgRating }) => (
          <div key={ilha} className="rounded-2xl bg-branco border border-preto/8 p-6 flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ocean/10 shrink-0">
              <MapPin className="h-7 w-7 text-ocean" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-preto/30">{ilha}</p>
              <div className="flex items-baseline gap-3 mt-1">
                <p className="text-2xl font-bold text-preto">{count}</p>
                <span className="text-xs text-preto/40">estabelecimentos</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-xs text-preto/50">
                <Star className="h-3 w-3 fill-signal text-signal" />Rating médio: {avgRating}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Distribuição por categoria */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-branco border border-preto/8 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-preto/40 mb-4">Categorias mais comuns</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.topTypes} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#1a1a1a80" }} />
              <YAxis type="category" dataKey="type" width={120} tick={{ fontSize: 11, fill: "#1a1a1a80" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e8e4de", fontSize: 12 }} />
              <Bar dataKey="count" fill="#0B2D6B" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl bg-branco border border-preto/8 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-preto/40 mb-4">Distribuição visual</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={stats.topTypes} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={90} label={(e) => e.type}>
                {stats.topTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e8e4de", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
