import React from "react";
import { Plus, Search, Users, MapPin, Phone, Calendar, Download, Pencil, Trash2 } from "lucide-react";
import { Citizen } from "../types";
import { exportToCSV } from "../data";

interface WargaViewProps {
  citizens: Citizen[];
  citizenSearch: string;
  setCitizenSearch: (val: string) => void;
  setShowAddCitizenModal: (show: boolean) => void;
  onEditCitizen: (citizen: Citizen) => void;
  onDeleteCitizen: (id: string) => void;
}

function avatarInitials(name: string): string {
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
}

const avatarColors = [
  "bg-emerald-500", "bg-blue-500", "bg-violet-500", "bg-amber-500",
  "bg-indigo-500", "bg-rose-500", "bg-teal-500", "bg-orange-500",
];

export default function WargaView({ citizens, citizenSearch, setCitizenSearch, setShowAddCitizenModal, onEditCitizen, onDeleteCitizen }: WargaViewProps) {
  const filtered = [...citizens]
    .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt) || b.id.localeCompare(a.id))
    .filter(c =>
      c.name.toLowerCase().includes(citizenSearch.toLowerCase()) ||
      c.nik.includes(citizenSearch)
    );

  const handleExportCitizensCSV = () => {
    const headers = ["Nama Warga", "NIK", "No Telepon", "RT/RW", "Alamat Domisili", "Tanggal Terdaftar"];
    const rows = filtered.map(c => [
      c.name,
      c.nik,
      c.phone,
      c.rtRw,
      c.address,
      c.joinedAt
    ]);
    exportToCSV("Database_Warga_Desa", headers, rows);
  };

  return (
    <div id="view_warga" className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Database Warga Desa</h2>
          <p className="text-sm text-slate-500 mt-1">
            Registrasi identitas resmi warga — dasar analisis kelayakan kredit 5C.
            <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
              <Users className="w-3 h-3" /> {citizens.length} jiwa terdaftar
            </span>
          </p>
        </div>
        <button
          id="btn_add_citizen"
          onClick={() => setShowAddCitizenModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Daftarkan Warga
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-900 text-sm">Buku Induk Kependudukan</h3>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIK..."
                value={citizenSearch}
                onChange={e => setCitizenSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              />
            </div>
            <button
              onClick={handleExportCitizensCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              Ekspor CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-3.5">Identitas Warga</th>
                <th className="px-6 py-3.5">NIK</th>
                <th className="px-6 py-3.5">Kontak</th>
                <th className="px-6 py-3.5">Domisili</th>
                <th className="px-6 py-3.5">Bergabung</th>
                <th className="px-6 py-3.5 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">Tidak ada warga yang sesuai dengan pencarian.</td>
                </tr>
              )}
              {filtered.map((cit, idx) => (
                <tr key={cit.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${avatarColors[idx % avatarColors.length]}`}>
                        {avatarInitials(cit.name)}
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{cit.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-600 tracking-widest">{cit.nik}</td>
                  <td className="px-6 py-4">
                    {cit.phone
                      ? <span className="flex items-center gap-1.5 text-xs text-slate-600"><Phone className="w-3 h-3 text-slate-400" />{cit.phone}</span>
                      : <span className="text-slate-300 text-xs">—</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-start gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                      <span>{cit.address}, <span className="font-semibold">{cit.rtRw}</span></span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {cit.joinedAt}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEditCitizen(cit)}
                        className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                        title="Edit Profil Warga"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCitizen(cit.id)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Hapus Data Warga"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
