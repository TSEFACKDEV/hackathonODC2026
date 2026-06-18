"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import api from "@/utils/api";
import { MdSearch, MdBlock, MdCheckCircle, MdFilterList, MdPeople, MdEmojiEvents, MdPhoneAndroid, MdCancel, MdPeopleOutline } from "react-icons/md";
import EmptyState from "@/components/ui/EmptyState";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit:"50" });
      if (role !== "ALL") params.set("role", role);
      const res = await api.get(`/users?${params}`);
      setUsers(res.data.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [role]);

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.patch(`/users/${id}`, { isActive: !isActive });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !isActive } : u));
      toast.success(isActive ? "Compte désactivé" : "Compte activé");
    } catch { toast.error("Erreur"); }
  };

  const filtered = users.filter(u =>
    search === "" ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors: Record<string,string> = { ADMIN:"badge-red", AGENT:"badge-blue", USER:"badge-green" };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900"><MdPeople className="inline mr-2"/>Utilisateurs</h2>
          <p className="text-gray-500 text-sm">{users.length} compte(s) enregistré(s)</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom ou email..." className="input pl-10 bg-white"/>
        </div>
        <div className="flex gap-2">
          {["ALL","USER","AGENT","ADMIN"].map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border ${role===r?"bg-primary-600 text-white border-primary-600":"bg-white text-gray-600 border-gray-200 hover:border-primary-300"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Utilisateur","Rôle","Points","Crédits","Statut","Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_,i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-gray-200 rounded animate-pulse"/></td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={<MdPeopleOutline size={48}/>} title="Aucun utilisateur trouvé"/></td></tr>
              ) : filtered.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.03 }}
                  className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={roleColors[u.role] || "badge-gray"}>{u.role}</span></td>
                  <td className="px-4 py-3 font-semibold text-primary-700"><MdEmojiEvents className="inline mr-1"/>{u.points}</td>
                  <td className="px-4 py-3 font-semibold text-blue-700"><MdPhoneAndroid className="inline mr-1"/>{u.credits}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isActive?"badge-green":"badge-red"}`}>
                      {u.isActive ? <><MdCheckCircle className="inline mr-1"/>Actif</> : <><MdCancel className="inline mr-1"/>Inactif</>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(u.id, u.isActive)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        u.isActive ? "text-red-600 bg-red-50 hover:bg-red-100" : "text-primary-600 bg-primary-50 hover:bg-primary-100"
                      }`}>
                      {u.isActive ? <><MdBlock size={14}/>Désactiver</> : <><MdCheckCircle size={14}/>Activer</>}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}