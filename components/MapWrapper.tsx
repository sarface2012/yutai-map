// components/MapWrapper.tsx
'use client' // ★これが重要！

import dynamic from 'next/dynamic'

// ここで ssr: false を指定する
const Map = dynamic(() => import('./Map'), { 
  ssr: false,
  loading: () => <p>Loading map...</p>
})

export default function MapWrapper({ shops }: { shops: any[] }) {
  return <Map shops={shops} />
}