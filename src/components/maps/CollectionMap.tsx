"use client";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const makeNumberIcon = (n: number) => L.divIcon({
  html: `<div style="background:#16a34a;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)">${n}</div>`,
  className: "", iconSize: [28,28], iconAnchor:[14,14],
});

const DOUALA: [number,number] = [4.0511, 9.7679];

interface Props {
  collections: any[];
  routePoints: any[];
}

export default function CollectionMap({ collections, routePoints }: Props) {
  return (
    <MapContainer center={DOUALA} zoom={13} style={{ height:"100%",width:"100%" }}>
      <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
      {routePoints.map((p, i) => (
        <Marker key={i} position={[p.latitude, p.longitude]} icon={makeNumberIcon(p.order || i+1)}>
          <Popup>
            <div className="text-sm">
              <p className="font-bold text-primary-700">Arrêt #{p.order || i+1}</p>
              {p.address && <p className="text-gray-500">{p.address}</p>}
              {p.collectionTitle && <p className="text-xs text-gray-400 mt-1">📋 {p.collectionTitle}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
      {/* Tracer la route */}
      {collections.map((col) =>
        col.points?.length > 1 ? (
          <Polyline
            key={col.id}
            positions={col.points.sort((a:any,b:any)=>a.order-b.order).map((p:any)=>[p.latitude,p.longitude])}
            color="#16a34a"
            weight={3}
            dashArray="6 4"
            opacity={0.8}
          />
        ) : null
      )}
    </MapContainer>
  );
}