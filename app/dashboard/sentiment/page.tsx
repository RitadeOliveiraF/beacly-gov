"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { ThumbsUp, ThumbsDown, Star, Loader2, Info } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

interface Review {
  google_place_id: string
  restaurant_name: string
  review_rating: number
  review_text: string | null
}

const POSITIVE_STRONG = [
  "exceptional","outstanding","incredible","amazing","unforgettable","michelin",
  "fantastic","excellent","magnificent","wonderful","sublime","spectacular",
  "perfect","extraordinary","best","highly recommend","five star"
]
const NEGATIVE_STRONG = [
  "disappointed","terrible","awful","horrible","worst","disgusting","bad","poor",
  "overpriced","rude","slow","cold food","dirty","avoid","tasteless","bland","no flavor","no flavour"
]

function sentiment(text: string | null): number | null {
  if (!text) return null
  const lower = text.toLowerCase()
  const pos = POSITIVE_STRONG.filter(w => lower.includes(w)).length
  const neg = NEGATIVE_STRONG.filter(w => lower.includes(w)).length
  return pos - neg
}

export default function Sentiment() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      let all: Review[] = []
      let from = 0
      while (true) {
        const { data } = await supabase
          .from("azorean_reviews")
          .select("google_place_id, restaurant_name, review_rating, review_text")
          .range(from, from + 999)
        if (!data || data.length === 0) break
        all = [...all, ...(data as Review[])]
        if (data.length < 1000) break
        from += 1000
      }
      setReviews(all)
      setLoading(false)
    }
    fetchAll()
  }, [])

  const stats = useMemo(() => {
    if (!reviews.length) return null
    const withText = reviews.filter(r => r.review_text)
    const sentiments = withText.map(r => sentiment(r.review_text)).filter((s): s is number => s !== null)
    const pctPositive = sentiments.length ? Math.round((sentiments.filter(s => s > 0).length / sentiments.length) * 100) : 0
    const pctNegative = sentiments.length ? Math.round((sentiments.filter(s => s < 0).length / sentiments.length) * 100) : 0
    const avgRating = reviews.reduce((a, r) => a + (r.review_rating || 0), 0) / reviews.length
    const satisfactionIndex = Math.round((avgRating / 5) * 60 + (pctPositive / 100) * 40)

    const posCounts: Record<string, number> = {}
    const negCounts: Record<string, number> = {}
    withText.forEach(r => {
      const lower = r.review_text!.toLowerCase()
      POSITIVE_STRONG.forEach(w => { if (lower.includes(w)) posCounts[w] = (posCounts[w]||0)+1 })
      NEGATIVE_STRONG.forEach(w => { if (lower.includes(w)) negCounts[w] = (negCounts[w]||0)+1 })
    })
    const topPos = Object.entries(posCounts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([word,count])=>({word,count}))
    const topNeg = Object.entries(negCounts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([word,count])=>({word,count}))

    const byPlace: Record<string, { name: string; ratings: number[]; sents: number[] }> = {}
    reviews.forEach(r => {
      if (!byPlace[r.google_place_id]) byPlace[r.google_place_id] = { name: r.restaurant_name, ratings: [], sents: [] }
      byPlace[r.google_place_id].ratings.push(r.review_rating)
      const s = sentiment(r.review_text)
      if (s !== null) byPlace[r.google_place_id].sents.push(s)
    })
    const placesSentiment = Object.values(byPlace)
      .filter(p => p.ratings.length >= 15)
      .map(p => ({
        name: p.name,
        n: p.ratings.length,
        pctPos: p.sents.length ? Math.round((p.sents.filter(s=>s>0).length / p.sents.length)*100) : 0
      }))
      .sort((a,b) => b.pctPos - a.pctPos)
      .slice(0, 10)

    return { totalReviews: reviews.length, pctPositive, pctNegative, avgRating, satisfactionIndex, topPos, topNeg, placesSentiment }
  }, [reviews])

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-6 w-6 animate-spin text-ocean" /></div>
  if (!stats) return null

  return (
    <div className="p-8 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-preto/30">Sentimento</p>
        <h1 className="mt-1 text-2xl font-serif font-bold text-preto">Percepção turística — Pico & Faial</h1>
        <p className="text-sm text-preto/50">Análise de {stats.totalReviews.toLocaleString()} reviews</p>
      </div>

      <div className="rounded-2xl border border-ocean/20 bg-ocean/5 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-ocean shrink-0 mt-0.5" />
        <p className="text-xs text-preto/60">Sentimento calculado por análise textual das reviews — menções a palavras de qualidade excepcional ("exceptional", "michelin", "unforgettable") vs. queixas recorrentes ("disappointed", "overpriced", "bland").</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-ocean text-white p-5">
          <span className="text-xs font-bold uppercase tracking-wider opacity-60">Índice de satisfação</span>
          <p className="text-3xl font-bold mt-2">{stats.satisfactionIndex}<span className="text-base opacity-50">/100</span></p>
        </div>
        <div className="rounded-2xl bg-branco border border-preto/8 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-preto/30">Menções positivas</span>
            <ThumbsUp className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.pctPositive}%</p>
        </div>
        <div className="rounded-2xl bg-branco border border-preto/8 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-preto/30">Rating médio</span>
            <Star className="h-4 w-4 fill-signal text-signal" />
          </div>
          <p className="text-3xl font-bold text-preto mt-2">{stats.avgRating.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl bg-branco border border-preto/8 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-preto/30">Menções negativas</span>
            <ThumbsDown className="h-4 w-4 text-red-400" />
          </div>
          <p className="text-3xl font-bold text-preto mt-2">{stats.pctNegative}%</p>
        </div>
      </div>

      <div className="rounded-2xl bg-branco border border-preto/8 p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-preto/40 mb-4">Top 10 espaços por sentimento positivo (≥15 reviews)</p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.placesSentiment} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" horizontal={false} />
            <XAxis type="number" domain={[0,100]} tick={{ fontSize: 11, fill: "#1a1a1a80" }} />
            <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 10, fill: "#1a1a1a80" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e8e4de", fontSize: 12 }} formatter={(v: number) => [`${v}%`, "Sentimento positivo"]} />
            <Bar dataKey="pctPos" fill="#4ADE80" radius={[0,6,6,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-branco border border-preto/8 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-4">Mais mencionado — Positivo</p>
          <div className="space-y-2">
            {stats.topPos.map(({word, count}) => (
              <div key={word} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-preto capitalize flex-1">{word}</span>
                <div className="h-1.5 rounded-full bg-emerald-100 overflow-hidden w-24">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(count/stats.topPos[0].count)*100}%` }} />
                </div>
                <span className="text-xs font-bold text-emerald-600 w-10 text-right">{count}x</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-branco border border-preto/8 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-red-500 mb-4">Mais mencionado — A melhorar</p>
          <div className="space-y-2">
            {stats.topNeg.map(({word, count}) => (
              <div key={word} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-preto capitalize flex-1">{word}</span>
                <div className="h-1.5 rounded-full bg-red-100 overflow-hidden w-24">
                  <div className="h-full rounded-full bg-red-400" style={{ width: `${(count/(stats.topNeg[0]?.count||1))*100}%` }} />
                </div>
                <span className="text-xs font-bold text-red-500 w-10 text-right">{count}x</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
