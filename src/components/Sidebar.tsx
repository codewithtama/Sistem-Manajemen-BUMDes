import React from "react";
import {
  LayoutDashboard,
  Wallet,
  Landmark,
  HandCoins,
  Users,
  FileText,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Ringkasan",       icon: LayoutDashboard, group: "Utama"      },
  { id: "kas",       label: "Buku Kas Umum",   icon: Wallet,          group: "Keuangan"  },
  { id: "simpanan",  label: "Simpanan Warga",  icon: Landmark,        group: "Keuangan"  },
  { id: "pinjaman",  label: "Simpan Pinjam",   icon: HandCoins,       group: "Keuangan"  },
  { id: "warga",     label: "Data Warga",      icon: Users,           group: "Administrasi" },
  { id: "laporan",   label: "Laporan LPJ",     icon: FileText,        group: "Administrasi" },
  { id: "advisor",   label: "Asisten AI",      icon: Sparkles,        group: "Lainnya",  special: true },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const groups = ["Utama", "Keuangan", "Administrasi", "Lainnya"];

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/40">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight tracking-tight">BUMDes Digital</p>
          <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider leading-none mt-0.5">SIM-Kemendesa</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {groups.map((group) => {
          const items = navItems.filter((n) => n.group === group);
          if (!items.length) return null;
          return (
            <div key={group}>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-1.5">
                {group}
              </p>
              <div className="space-y-0.5">
                {items.map(({ id, label, icon: Icon, special }) => {
                  const isActive = activeTab === id;
                  return (
                    <button
                      key={id}
                      id={`nav_${id}`}
                      onClick={() => setActiveTab(id)}
                      className={`
                        group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-all duration-150 cursor-pointer text-left
                        ${isActive
                          ? special
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30"
                            : "bg-slate-800 text-white"
                          : special
                            ? "text-emerald-400 hover:bg-emerald-600/10 hover:text-emerald-300"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                        }
                      `}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{label}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-800 shrink-0">
        <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0 animate-pulse" />
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Permendesa No.3/2021</p>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Laporan terstandarisasi & terverifikasi.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
