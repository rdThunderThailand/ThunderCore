'use client'

import Map, { NavigationControl } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export function DashboardMap() {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    return (
        <div className="w-full h-full bg-slate-100 rounded-xl overflow-hidden relative">
            {mapboxToken ? (
                <Map
                    mapboxAccessToken={mapboxToken}
                    initialViewState={{
                        longitude: 100.5018,
                        latitude: 13.7563,
                        zoom: 4.5,
                    }}
                    mapStyle="mapbox://styles/mapbox/streets-v12"
                    attributionControl={false}
                >
                    <NavigationControl position="bottom-right" />
                </Map>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-sm font-semibold mb-1">Map Preview Unavailable</span>
                    <span className="text-xs text-slate-400">Missing Mapbox token</span>
                </div>
            )}
        </div>
    )
}
