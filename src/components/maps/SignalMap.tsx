"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Signal } from "@/types";
import { MdLocationOn } from "react-icons/md";

// Fix icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const redIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const greenIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

function ClickHandler({ onPositionSelect }: { onPositionSelect?: (pos: [number, number]) => void }) {
  useMapEvents({
    click: (e) => onPositionSelect?.([e.latlng.lat, e.latlng.lng]),
  });
  return null;
}

interface SignalMapProps {
  signals: Signal[];
  onPositionSelect?: (pos: [number, number]) => void;
  selectedPosition?: [number, number] | null;
  routePoints?: Array<{ latitude: number; longitude: number; address?: string; order?: number }>;
  center?: [number, number];
  zoom?: number;
}

// Centre sur Douala, Cameroun
const DOUALA_CENTER: [number, number] = [4.0511, 9.7679];

export default function SignalMap({
  signals, onPositionSelect, selectedPosition,
  routePoints, center = DOUALA_CENTER, zoom = 12,
}: SignalMapProps) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {onPositionSelect && <ClickHandler onPositionSelect={onPositionSelect} />}

      {/* Signalements */}
      {signals.map((signal) => (
        <Marker
          key={signal.id}
          position={[signal.latitude, signal.longitude]}
          icon={signal.status === "COLLECTED" ? greenIcon : redIcon}
        >
          <Popup>
            <div className="w-48">
              <img src={signal.imageUrl} alt="signal" className="w-full h-24 object-cover rounded-lg mb-2" />
              <p className="text-xs font-semibold">{signal.description?.slice(0, 80)}...</p>
              <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block
                ${signal.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                  signal.status === "COLLECTED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                {signal.status === "PENDING" ? "En attente" : signal.status === "COLLECTED" ? "Collecté" : "En cours"}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Position sélectionnée */}
      {selectedPosition && (
        <Marker position={selectedPosition}>
          <Popup><MdLocationOn className="inline mr-1" size={14}/> Votre position sélectionnée</Popup>
        </Marker>
      )}

      {/* Points d'itinéraire */}
      {routePoints?.map((point, i) => (
        <Marker key={i} position={[point.latitude, point.longitude]}>
          <Popup>
            <p className="font-bold text-primary-700">Arrêt #{point.order || i + 1}</p>
            {point.address && <p className="text-xs text-gray-500">{point.address}</p>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}