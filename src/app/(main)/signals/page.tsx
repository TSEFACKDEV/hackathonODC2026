"use client";

import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import {
  MdAdd,
  MdClose,
  MdMyLocation,
  MdImage,
  MdSearch,
  MdDelete,
  MdWarning,
  MdLocationOn,
  MdAccessTime,
  MdLocalShipping,
  MdCheckCircle,
  MdCancel,
  MdUpload,
  MdPhotoCamera,
  MdGpsFixed,
  MdFlag,
  MdError,
  MdCheck,
  MdInfo,
  MdOutlineReport,
} from "react-icons/md";
import { RootState } from "@/store";
import api from "@/utils/api";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";

const SignalMap = dynamic(
  () => import("@/components/maps/SignalMapFull"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    ),
  }
);

const MAX_IMAGES = 5;

const validationSchema = Yup.object({
  description: Yup.string()
    .min(10, "Minimum 10 caractères")
    .required("Description requise"),
  severity: Yup.number().min(1).max(3).required(),
});

interface Signal {
  id: string;
  description: string;
  severity: number;
  status: string;
  imageUrl: string;
  imageUrls?: string[];
  latitude: number;
  longitude: number;
  address?: string;
  createdAt: string;
  user?: {
    name: string;
  };
}

interface AddressResult {
  lat: string;
  lon: string;
  display_name: string;
}

// Interface corrigée pour correspondre à la réponse de l'API
interface UploadResponse {
  data: {
    url: string;
  };
}

interface ApiResponse<T> {
  data: T;
}

export default function SignalsPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState("");
  const [addressSearch, setAddressSearch] = useState("");
  const [addressResults, setAddressResults] = useState<AddressResult[]>([]);
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setShowForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    api
      .get("/signals?limit=100")
      .then((res) => setSignals(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const searchAddress = (query: string) => {
    setAddressSearch(query);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (query.length < 3) {
      setAddressResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query + " Cameroun"
          )}&format=json&limit=5&addressdetails=1`
        );
        const data = await res.json();
        setAddressResults(data);
      } catch {
        setAddressResults([]);
      }
    }, 500);
  };

  const selectAddress = (item: AddressResult) => {
    setPosition([parseFloat(item.lat), parseFloat(item.lon)]);
    setAddress(item.display_name);
    setAddressSearch(item.display_name);
    setAddressResults([]);
  };

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Votre navigateur ne supporte pas la géolocalisation");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setPosition([lat, lng]);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          const displayName = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setAddress(displayName);
          setAddressSearch(displayName);
        } catch {
          setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
        toast.success("Position obtenue !");
      },
      () => {
        toast.error("Impossible d'obtenir votre position GPS");
      }
    );
  };

  const addImages = (fileList: FileList | null) => {
    if (!fileList) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.warning(`Maximum ${MAX_IMAGES} images`);
      return;
    }

    const newImages = Array.from(fileList)
      .slice(0, remaining)
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

    setImages((prev) => [...prev, ...newImages]);

    if (Array.from(fileList).length > remaining) {
      toast.warning(`Maximum ${MAX_IMAGES} images`);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index].preview);
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const formik = useFormik({
    initialValues: {
      description: "",
      severity: 2,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!position) {
        toast.error("Sélectionnez une localisation");
        return;
      }
      if (images.length === 0) {
        toast.error("Ajoutez au moins une photo");
        return;
      }

      try {
        setUploading(true);

        const imageUrls = await Promise.all(
          images.map(async ({ file }) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", "signals");

            // Correction: accès direct à response.data.url
            const response = await api.post<UploadResponse>("/upload", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });

            return response.data.data.url;
          })
        );

        setUploading(false);

        const response = await api.post<ApiResponse<Signal>>("/signals", {
          ...values,
          imageUrl: imageUrls[0],
          imageUrls: imageUrls,
          latitude: position[0],
          longitude: position[1],
          address,
        });

        setSignals((prev) => [response.data.data, ...prev]);
        toast.success("Signalement envoyé ! +10 points");
        setShowForm(false);
        setImages([]);
        setPosition(null);
        setAddress("");
        setAddressSearch("");
        resetForm();
      } catch (err: any) {
        setUploading(false);
        toast.error(err.response?.data?.error || "Erreur lors du signalement");
      }
    },
  });

  // Correction: Typage explicite de statusConfig avec React.ReactNode
  const statusConfig: Record<
    string,
    { label: string; color: string; icon: React.ReactNode }
  > = {
    PENDING: {
      label: "En attente",
      color: "badge-yellow",
      icon: <MdAccessTime />,
    },
    IN_PROGRESS: {
      label: "En cours",
      color: "badge-blue",
      icon: <MdLocalShipping />,
    },
    COLLECTED: {
      label: "Collecté",
      color: "badge-green",
      icon: <MdCheckCircle />,
    },
    REJECTED: {
      label: "Rejeté",
      color: "badge-red",
      icon: <MdCancel />,
    },
  };

  const getSeverityLabel = (severity: number) => {
    const labels = ["", "Faible", "Moyen", "Grave"];
    return labels[severity] || "Inconnu";
  };

  const getSeverityColor = (severity: number) => {
    const colors = ["", "badge-green", "badge-yellow", "badge-red"];
    return colors[severity] || "badge-gray";
  };

  const getSeverityIcon = (severity: number) => {
    const icons: Record<number, React.ReactNode> = {
      0: null,
      1: <MdInfo />,
      2: <MdWarning />,
      3: <MdError />,
    };
    return icons[severity] || <MdInfo />;
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="gradient-hero py-16 text-white px-4">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">
                <MdOutlineReport className="inline mr-2" />
                Signalements
              </h1>
              <p className="text-white/80 text-lg">
                Signalez les dépôts sauvages et gagnez 10 points par signalement
                validé.
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              size="lg"
              variant="white"
              icon={<MdAdd size={20} />}
            >
              Nouveau signalement
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="container-custom py-10">
        {/* Grid: Carte + Liste */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Colonne gauche: Carte */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h3 className="text-lg font-display font-bold text-gray-900 mb-3">
                <MdLocationOn className="inline mr-2" />
                Carte des signalements
              </h3>
              <div className="card overflow-hidden" style={{ height: 350 }}>
                <SignalMap
                  signals={signals}
                  onMapClick={(pos) => {
                    setPosition(pos);
                    setShowForm(true);
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                <MdGpsFixed className="inline mr-1" />
                Cliquez sur la carte pour signaler un lieu
              </p>
            </div>
          </div>

          {/* Colonne droite: Liste */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-display font-bold text-gray-900 mb-4">
              Tous les signalements ({signals.length})
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="card h-32 animate-pulse bg-gray-100"
                  />
                ))}
              </div>
            ) : signals.length === 0 ? (
              <EmptyState
                icon={<MdLocationOn />}
                title="Aucun signalement pour l'instant"
                description="Soyez le premier à signaler un dépôt dans votre quartier !"
              >
                <Button
                  onClick={() => setShowForm(true)}
                  icon={<MdAdd size={18} />}
                >
                  Signaler maintenant
                </Button>
              </EmptyState>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {signals.map((signal, index) => {
                  const status = statusConfig[signal.status] || statusConfig.PENDING;
                  const severityColor = getSeverityColor(signal.severity);
                  const severityLabel = getSeverityLabel(signal.severity);
                  const severityIcon = getSeverityIcon(signal.severity);

                  return (
                    <motion.div
                      key={signal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="card p-4 flex gap-4"
                    >
                      <img
                        src={signal.imageUrl}
                        alt="Signalement"
                        className="w-24 h-24 rounded-xl object-cover shrink-0 bg-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={status.color}>
                            {status.icon} {status.label}
                          </span>
                          <span className={severityColor}>
                            {severityIcon} {severityLabel}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {signal.description}
                        </p>
                        {signal.address && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <MdMyLocation size={12} />
                            {signal.address.slice(0, 60)}...
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(signal.createdAt).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Signalement */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="📍 Nouveau signalement"
        size="lg"
      >
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <span className="flex items-center gap-2">
                <MdPhotoCamera size={18} /> Photos du dépôt
              </span>
              <span className="text-xs font-normal text-gray-500">
                ({images.length}/{MAX_IMAGES})
              </span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-xl overflow-hidden group shadow-sm"
                >
                  <img
                    src={img.preview}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <MdDelete size={20} className="text-white" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 text-xs bg-primary-600 text-white px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <MdCheck size={12} />
                      Principale
                    </div>
                  )}
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-400 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50 hover:bg-primary-50">
                  <MdImage size={24} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500 font-medium">
                    Ajouter
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => addImages(e.target.files)}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500">
              <MdInfo className="inline mr-1" />
              La 1ère image sera principale. Max {MAX_IMAGES} photos. Format:
              JPG, PNG.
            </p>
          </div>

          {/* Localisation */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MdLocationOn size={18} /> Localisation
            </label>
            <div className="relative mb-2">
              <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={addressSearch}
                onChange={(e) => searchAddress(e.target.value)}
                placeholder="Recherchez une adresse, un quartier..."
                className="input pl-10 bg-white focus:ring-primary-500"
              />
              <AnimatePresence>
                {addressResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden"
                  >
                    {addressResults.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectAddress(item)}
                        className="w-full text-left px-4 py-3 hover:bg-primary-50 text-sm border-b border-gray-100 last:border-0 transition-colors"
                      >
                        <span className="font-medium text-gray-800">
                          {item.display_name.split(",").slice(0, 2).join(", ")}
                        </span>
                        <span className="text-xs text-gray-400 block">
                          {item.display_name}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              type="button"
              onClick={getMyLocation}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-primary-300 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors text-sm font-semibold"
            >
              <MdGpsFixed size={18} />
              {position
                ? `Position sélectionnée: ${address.slice(0, 40)}...`
                : "Utiliser ma position GPS"}
            </button>
            {!position && (
              <p className="text-xs text-orange-600 mt-2 flex items-center gap-1 bg-orange-50 px-3 py-2 rounded-lg">
                <MdWarning size={14} /> Une localisation est obligatoire
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...formik.getFieldProps("description")}
              className={`input resize-none h-24 bg-white focus:ring-primary-500 ${
                formik.touched.description && formik.errors.description
                  ? "input-error border-red-400"
                  : ""
              }`}
              placeholder="Décrivez le dépôt : taille, type de déchets, contexte, etc."
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <MdWarning size={14} /> {formik.errors.description}
              </p>
            )}
          </div>

          {/* Gravité */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <MdFlag size={18} /> Niveau de gravité
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  value: 1,
                  label: "Faible",
                  desc: "Quelques déchets",
                  icon: <MdInfo size={20} />,
                  colorClass:
                    "border-green-400 bg-green-50 text-green-700 hover:border-green-500",
                },
                {
                  value: 2,
                  label: "Moyen",
                  desc: "Amas modéré",
                  icon: <MdWarning size={20} />,
                  colorClass:
                    "border-yellow-400 bg-yellow-50 text-yellow-700 hover:border-yellow-500",
                },
                {
                  value: 3,
                  label: "Grave",
                  desc: "Décharge sauvage",
                  icon: <MdError size={20} />,
                  colorClass:
                    "border-red-400 bg-red-50 text-red-700 hover:border-red-500",
                },
              ].map(({ value, label, desc, icon, colorClass }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => formik.setFieldValue("severity", value)}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all text-center font-medium ${
                    formik.values.severity === value
                      ? colorClass
                      : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                  }`}
                >
                  <span className="text-lg mb-1">{icon}</span>
                  <span className="text-xs font-semibold">{label}</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={formik.isSubmitting || uploading}
            icon={uploading ? <MdUpload className="animate-spin" /> : <MdFlag />}
          >
            {uploading
              ? "Upload des images..."
              : "Envoyer le signalement (+10 pts)"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}