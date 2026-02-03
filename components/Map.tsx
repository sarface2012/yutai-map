'use client'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useState } from 'react'

// アイコン設定（前回と同じ）
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

type Shop = {
  id: number
  name: string
  lat: number
  lng: number
  brand_code: string | null
}

// ★現在地へ飛ぶボタンコンポーネント
// components/Map.tsx の LocateControl 関数をこれに置き換え

function LocateControl() {
  const map = useMap()
  const [loading, setLoading] = useState(false)

  const handleLocate = (e: React.MouseEvent) => {
    // ★ここが大事：クリックイベントが地図に吸われないように止める
    e.stopPropagation()
    e.preventDefault()

    console.log("📍ボタンが押されました！(イベント発火)") 
    setLoading(true)
    
    map.locate().on("locationfound", function (e) {
      console.log("✅ 位置特定成功:", e.latlng)
      setLoading(false)
      map.flyTo(e.latlng, 15)
      L.circle(e.latlng, { radius: 100 }).addTo(map)
    }).on("locationerror", function (e) {
      console.error("❌ 位置特定エラー:", e)
      setLoading(false)
      alert("位置情報を取得できませんでした。")
    })
  }

  return (
    <button
      onClick={handleLocate}
      // ★ z-index を 9999 に指定して、確実に一番手前に持ってくる
      className="bg-white p-3 rounded-full shadow-lg border-2 border-gray-300 hover:bg-gray-100 absolute pointer-events-auto"
      style={{ 
        bottom: '120px', 
        right: '20px', 
        zIndex: 9999, // ← これで勝てます
      }} 
    >
      {loading ? (
        <span className="text-xl animate-spin block">⏳</span>
      ) : (
        <span className="text-xl block">📍</span>
      )}
    </button>
  )
}


export default function Map({ shops }: { shops: Shop[] }) {
  // 初期位置（東京駅）
  const position: [number, number] = [35.681236, 139.767125]

  return (
    <MapContainer center={position} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* ★ここにボタンを追加 */}
      <LocateControl />
      
      {shops.map((shop) => (
        <Marker key={shop.id} position={[shop.lat, shop.lng]}>
          <Popup>
            <div className="font-bold">{shop.name}</div>
            <div className="text-xs text-gray-500 mt-1">
              株主優待利用可
              <br />
              {/* ブランドコードで簡易判定して表示を変えるなどの拡張も可能 */}
              Code: {shop.brand_code}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}