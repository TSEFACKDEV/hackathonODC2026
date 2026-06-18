"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const pendingIcon = L.divIcon({
  html: `<div style="width:28px;height:28px;background:#ef4444;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:12px">📍</div>`,
  className: "", iconSize: [28, 28], iconAnchor: [14, 14],
});
const selectedIcon = L.divIcon({
  html: `<div style="width:32px;height:32px;background:#16a34a;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 12px rgba(22,163,74,.5);display:flex;align-items:center;justify-content:center;font-size:14px">✅</div>`,
  className: "", iconSize: [32, 32], iconAnchor: [16, 16],
});

const DOUALA: [number, number] = [4.0511, 9.7679];

interface Props {
  signals: any[];
  selectedPoints: any[];
  onTogglePoint: (signal: any) => void;
}

export default function AgentMap({ signals, selectedPoints, onTogglePoint }: Props) {
  const isSelected = (sig: any) => selectedPoints.some(p => p.signalId === sig.id);

  return (
    <MapContainer center={DOUALA} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer attribution="© OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
      {signals.map(sig => (
        <Marker
          key={sig.id}
          position={[sig.latitude, sig.longitude]}
          icon={isSelected(sig) ? selectedIcon : pendingIcon}
          eventHandlers={{ click: () => onTogglePoint(sig) }}
        >
          <Popup>
            <div className="w-48">
              <img src={sig.imageUrl} alt="" className="w-full h-28 object-cover rounded-lg mb-2"/>
              <p className="text-xs font-semibold">{sig.description?.slice(0, 80)}</p>
              <button
                onClick={() => onTogglePoint(sig)}
                className={`mt-2 w-full py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isSelected(sig) ? "bg-red-100 text-red-600" : "bg-primary-100 text-primary-700"
                }`}>
                {isSelected(sig) ? "✕ Retirer" : "+ Sélectionner"}
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}