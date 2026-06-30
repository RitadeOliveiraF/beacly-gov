"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Loader2, Info } from "lucide-react"

interface Space {
  uuid: string
  restaurant_name: string
  ilha: string
  rating: number | null
  latitude: number | null
  longitude: number | null
  google_type: string | null
}

export default function Heatmap() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<any>(null)

  useEffect(() => {
    const fetchAll = async () => {
      let all: Space[] = []
      let from = 0
      while (true) {
        const { data } = await supabase
          .from("azorean_gastronomy")
          .select("uuid, restaurant_name, ilha, rating, latitude, longitude, google_type")
          .not("latitude", "is", null)
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

  useEffect(() => {
    if (loading || !mapRef.current || leafletMap.current) return

    const loadLeaflet = async () => {
      if (!(window as any).L) {
        await new Promise<void>((resolve) => {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
          const script = document.createElement("script")
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          script.onload = () => resolve()
          document.head.appendChild(script)
        })
      }
      const L = (window as any).L
      const map = L.map(mapRef.current).setView([38.5, -28.3], 10)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "© CartoDB",
        maxZoom: 18
      }).addTo(map)

      spaces.forEach(s => {
        if (!s.latitude || !s.longitude) return
        const color = s.rating && Number(s.rating) >= 4.5 ? "#4ADE80" : s.rating && Number(s.rating) >= 4.0 ? "#FBBF24" : "#E8602C"
        L.circleMarker([s.latitude, s.longitude], {
          radius: 5, fillColor: color, color: "#fff", weight: 1, opacity: 1, fillOpacity: 0.8
        }).bindPopup(`<b>${s.restaurant_name}</b><br/>${s.google_type || ""}<br/>${s.rating ? `★ ${s.rating}` : "Sem rating"}`).addTo(map)
      })

      leafletMap.current = map
    }
    loadLeaflet()
  }, [loading, spaces])

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-6 w-6 animate-spin text-ocean" /></div>

  return (
    <div className="p-8 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-preto/30">Mapa</p>
        <h1 className="mt-1 text-2xl font-serif font-bold text-preto">Distribuição geográfica</h1>
        <p className="text-sm text-preto/50">{spaces.length} estabelecimentos georreferenciados</p>
      </div>

      <div className="rounded-2xl border border-ocean/20 bg-ocean/5 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-ocean shrink-0 mt-0.5" />
        <p className="text-xs text-preto/60">Verde: rating ≥4.5 · Âmbar: rating ≥4.0 · Laranja: rating &lt;4.0 ou sem dados. Clica num ponto para ver detalhes.</p>
      </div>

      <div className="rounded-2xl bg-branco border border-preto/8 overflow-hidden">
        <div ref={mapRef} style={{ height: "600px", width: "100%" }} />
      </div>
    </div>
  )
}
