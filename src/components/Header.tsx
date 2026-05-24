import React from "react";
import { Menu, Settings, Bell, LayoutDashboard, Wallet, Landmark, HandCoins, Users, FileText, Sparkles } from "lucide-react";
import { BUMDesConfig } from "../types";

interface HeaderProps {
  config: BUMDesConfig;
  activeTab: string;
  setFormConfig: (cfg: BUMDesConfig) => void;
  setShowConfigModal: (show: boolean) => void;
  onMenuToggle: () => void;
}

const tabMeta: Record<string, { label: string; icon: React.FC<{ className?: string }> }> = {
  dashboard: { label: "Ringkasan Beranda",         icon: LayoutDashboard },
  kas:       { label: "Buku Kas Umum (BKU)",       icon: Wallet          },
  simpanan:  { label: "Unit Tabungan Warga",        icon: Landmark        },
  pinjaman:  { label: "Unit Simpan Pinjam",         icon: HandCoins       },
  warga:     { label: "Database Warga Desa",        icon: Users           },
  laporan:   { label: "Laporan Keuangan LPJ",       icon: FileText        },
  advisor:   { label: "Asisten Regulasi AI",        icon: Sparkles        },
};

export default function Header({ config, activeTab, setFormConfig, setShowConfigModal, onMenuToggle }: HeaderProps) {
  const meta = tabMeta[activeTab] ?? tabMeta["dashboard"];
  const Icon = meta.icon;

  const initials = (name: string) => {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 gap-4">

      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition cursor-pointer"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <h2 className="font-semibold text-slate-800 text-sm truncate">{meta.label}</h2>
        </div>
      </div>

      {/* Right: actions + avatar */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg transition cursor-pointer"
          aria-label="Notifikasi"
        >
          <Bell className="w-4 h-4" />
        </button>

        <button
          id="btn_open_config"
          onClick={() => { setFormConfig({ ...config }); setShowConfigModal(true); }}
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-lg transition cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan</span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* Operator avatar */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{config.bumdesName}</p>
            <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">{config.villageName}</p>
          </div>
          <button
            onClick={() => { setFormConfig({ ...config }); setShowConfigModal(true); }}
            className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-emerald-700 transition shadow-sm sm:hidden"
          >
            {initials(config.treasurerName)}
          </button>
          <div className="hidden sm:flex w-9 h-9 rounded-full bg-emerald-600 text-white items-center justify-center text-xs font-bold shadow-sm">
            {initials(config.treasurerName)}
          </div>
        </div>
      </div>

    </header>
  );
}
