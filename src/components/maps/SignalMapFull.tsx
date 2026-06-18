"use client";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const mkIcon = (color: string) => L.divIcon({
  html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>`,
  className:"", iconSize:[28,28], iconAnchor:[14,28],
});

const COLORS: Record<string,string> = { PENDING:"#f59e0b", IN_PROGRESS:"#3b82f6", COLLECTED:"#16a34a", REJECTED:"#ef4444" };
const DOUALA: [number,number] = [4.0511, 9.7679];

function ClickHandler({ onMapClick }: { onMapClick: (pos:[number,number])=>void }) {
  useMapEvents({ click: e => onMapClick([e.latlng.lat, e.latlng.lng]) });
  return null;
}

interface Props { signals: any[]; onMapClick?: (pos:[number,number])=>void; }

export default function SignalMapFull({ signals, onMapClick }: Props) {
  return (
    <MapContainer center={DOUALA} zoom={13} style={{ height:"100%", width:"100%" }}>
      <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
      {onMapClick && <ClickHandler onMapClick={onMapClick}/>}
      {signals.map(sig => (
        <Marker key={sig.id} position={[sig.latitude, sig.longitude]} icon={mkIcon(COLORS[sig.status] || "#f59e0b")}>
          <Popup>
            <div className="w-52">
              <img src={sig.imageUrl} alt="" className="w-full h-32 object-cover rounded-lg mb-2"/>
              <p className="text-xs font-semibold text-gray-800 line-clamp-2">{sig.description}</p>
              <span className="text-xs text-gray-500 mt-1 block">{new Date(sig.createdAt).toLocaleDateString("fr-FR")}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}