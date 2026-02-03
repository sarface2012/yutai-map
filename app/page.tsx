import { supabase } from '@/utils/supabase'
import MapWrapper from '@/components/MapWrapper'

// キャッシュを無効化し、毎回最新データを取得する（開発用）
export const revalidate = 0

export default async function Home() {
  // 1. データ取得
  // location(16進数)ではなく、raw_data(元のJSON)を取得するのがコツです
  const { data: shops, error } = await supabase
    .from('shops')
    .select('id, name, raw_data, brand_code')
    .limit(2000) // 1539件全部出すために少し多めに

  if (error) {
    console.error("Supabase Error:", error)
    return <div className="p-10 text-red-500">Error: {error.message}</div>
  }

  if (!shops || shops.length === 0) {
    return <div className="p-10">No shops found.</div>
  }

  // 2. データ整形
  // raw_dataの中に素直な数値(latitude, longitude)が入っています
  const formattedShops = shops.map((shop: any) => {
    const lat = shop.raw_data?.latitude
    const lng = shop.raw_data?.longitude

    // 緯度経度がないデータは除外
    if (!lat || !lng) return null

    return {
      id: shop.id,
      name: shop.name,
      lat: Number(lat), // 数値型に変換
      lng: Number(lng), // 数値型に変換
      brand_code: shop.brand_code
    }
  }).filter((shop): shop is NonNullable<typeof shop> => shop !== null) // nullを除外

  console.log(`地図に表示する店舗数: ${formattedShops.length}件`)

  return (
    <main className="w-full h-screen">
      {/* MapWrapperはクライアントサイド(ssr: false)で地図を読み込むための箱です。
        これがないとNext.jsのサーバー側で「window is not defined」エラーになります。
      */}
      <MapWrapper shops={formattedShops} />
    </main>
  )
}