import React, { useState } from "react";
import { CheckCircle, AlertTriangle, AlertOctagon, Info } from "lucide-react";
import { useBumdesState } from "./hooks/useBumdesState";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Modals from "./components/Modals";
import DashboardOverview from "./components/DashboardOverview";
import BukuKasView from "./views/BukuKasView";
import SimpananView from "./views/SimpananView";
import PinjamanView from "./views/PinjamanView";
import WargaView from "./views/WargaView";
import LaporanView from "./views/LaporanView";
import AdvisorView from "./views/AdvisorView";

export default function App() {
  const state = useBumdesState();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);

  return (
    <div id="bumdes_system" className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30 flex flex-col shrink-0
          w-64 bg-slate-900 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <Sidebar
          activeTab={state.activeTab}
          setActiveTab={(tab) => {
            state.setActiveTab(tab);
            setSidebarOpen(false);
          }}
          userRole={state.userRole}
          onAdminAction={() => {
            if (state.userRole === "admin") {
              state.handleAdminLogout();
            } else {
              state.setShowLoginModal(true);
            }
          }}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <Header
          config={state.config}
          activeTab={state.activeTab}
          setFormConfig={state.setFormConfig}
          setShowConfigModal={state.setShowConfigModal}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">

            {state.activeTab === "dashboard" && (
              <div className="animate-fade-in">
                <DashboardOverview
                  cashTransactions={state.cashTransactions}
                  savingAccounts={state.savingAccounts}
                  loans={state.loans}
                  villageName={state.config.villageName}
                  bumdesName={state.config.bumdesName}
                  onNavigate={(tab) => state.setActiveTab(tab)}
                  sisaHasilUsaha={state.sisaHasilUsaha}
                  citizens={state.citizens}
                  isLedgerCorrupted={state.isLedgerCorrupted}
                  targetShu={state.config.targetShu}
                  targetPades={state.config.targetPades}
                />
              </div>
            )}

            {state.activeTab === "kas" && (
              <div className="animate-fade-in">
                <BukuKasView
                  cashTransactions={state.cashTransactions}
                  cashSearch={state.cashSearch}
                  setCashSearch={state.setCashSearch}
                  cashFilterCategory={state.cashFilterCategory}
                  setCashFilterCategory={state.setCashFilterCategory}
                  cashStartDate={state.cashStartDate}
                  setCashStartDate={state.setCashStartDate}
                  cashEndDate={state.cashEndDate}
                  setCashEndDate={state.setCashEndDate}
                  setShowAddCashModal={state.setShowAddCashModal}
                  currentGeneralCash={state.currentGeneralCash}
                  onEditCash={state.handleOpenEditCash}
                  onDeleteCash={state.handleDeleteCashTransaction}
                  userRole={state.userRole}
                />
              </div>
            )}

            {state.activeTab === "simpanan" && (
              <div className="animate-fade-in">
                <SimpananView
                  savingAccounts={state.savingAccounts}
                  savingTransactions={state.savingTransactions}
                  savingSearch={state.savingSearch}
                  setSavingSearch={state.setSavingSearch}
                  setShowSavingActionModal={state.setShowSavingActionModal}
                />
              </div>
            )}

            {state.activeTab === "pinjaman" && (
              <div className="animate-fade-in">
                <PinjamanView
                  loans={state.loans}
                  loanSearch={state.loanSearch}
                  setLoanSearch={state.setLoanSearch}
                  loanRepayments={state.loanRepayments}
                  setShowNewLoanModal={state.setShowNewLoanModal}
                  setShowRepaymentModal={state.setShowRepaymentModal}
                  setFormRepayment={state.setFormRepayment}
                  onEditLoan={state.handleOpenEditLoan}
                  onDeleteLoan={state.handleDeleteLoan}
                  onOpenAmortization={state.handleOpenAmortization}
                  userRole={state.userRole}
                  onShowCreditCalc={() => setShowCreditModal(true)}
                />
              </div>
            )}

            {state.activeTab === "warga" && (
              <div className="animate-fade-in">
                <WargaView
                  citizens={state.citizens}
                  citizenSearch={state.citizenSearch}
                  setCitizenSearch={state.setCitizenSearch}
                  setShowAddCitizenModal={state.setShowAddCitizenModal}
                  onEditCitizen={state.handleOpenEditCitizen}
                  onDeleteCitizen={state.handleDeleteCitizen}
                  userRole={state.userRole}
                />
              </div>
            )}

            {state.activeTab === "laporan" && (
              <div className="animate-fade-in">
                <LaporanView
                  config={state.config}
                  totalFeeRevenue={state.totalFeeRevenue}
                  totalOtherRevenues={state.totalOtherRevenues}
                  totalBumdesGrossIncome={state.totalBumdesGrossIncome}
                  totalGajiBeban={state.totalGajiBeban}
                  totalOpsBeban={state.totalOpsBeban}
                  totalBumdesExpenses={state.totalBumdesExpenses}
                  sisaHasilUsaha={state.sisaHasilUsaha}
                  alokasiPADesa={state.alokasiPADesa}
                  alokasiCadangan={state.alokasiCadangan}
                  alokasiPengurus={state.alokasiPengurus}
                  alokasiBonusWarga={state.alokasiBonusWarga}
                  alokasiSosial={state.alokasiSosial}
                  triggerPrintLPJ={state.triggerPrintLPJ}
                  setActiveTab={state.setActiveTab}
                  cashTransactions={state.cashTransactions}
                  savingAccounts={state.savingAccounts}
                  loans={state.loans}
                  citizens={state.citizens}
                  userRole={state.userRole}
                  onDistributeDividends={state.handleDistributeDividends}
                />
              </div>
            )}

            {state.activeTab === "advisor" && (
              <div className="animate-fade-in">
                <AdvisorView
                  isAuditLoading={state.isAuditLoading}
                  aiAuditReport={state.aiAuditReport}
                  handleGenerateAuditReport={state.handleGenerateAuditReport}
                  aiChatHistory={state.aiChatHistory}
                  isAiLoading={state.isAiLoading}
                  aiChatInput={state.aiChatInput}
                  setAiChatInput={state.setAiChatInput}
                  handleSendAiMessage={state.handleSendAiMessage}
                />
              </div>
            )}

          </div>
        </main>
      </div>

      <Modals
        showConfigModal={state.showConfigModal}
        setShowConfigModal={state.setShowConfigModal}
        formConfig={state.formConfig}
        setFormConfig={state.setFormConfig}
        handleUpdateConfig={state.handleUpdateConfig}
        handleClearMockData={state.handleClearMockData}

        showAddCashModal={state.showAddCashModal}
        setShowAddCashModal={state.setShowAddCashModal}
        formCash={state.formCash}
        setFormCash={state.setFormCash}
        handleAddCashTransaction={state.handleAddCashTransaction}

        showAddCitizenModal={state.showAddCitizenModal}
        setShowAddCitizenModal={state.setShowAddCitizenModal}
        formCitizen={state.formCitizen}
        setFormCitizen={state.setFormCitizen}
        handleAddCitizen={state.handleAddCitizen}

        showSavingActionModal={state.showSavingActionModal}
        setShowSavingActionModal={state.setShowSavingActionModal}
        formSavingAction={state.formSavingAction}
        setFormSavingAction={state.setFormSavingAction}
        handleSavingAction={state.handleSavingAction}
        citizens={state.citizens}

        showNewLoanModal={state.showNewLoanModal}
        setShowNewLoanModal={state.setShowNewLoanModal}
        formLoan={state.formLoan}
        setFormLoan={state.setFormLoan}
        handleDisburseLoan={state.handleDisburseLoan}

        showRepaymentModal={state.showRepaymentModal}
        setShowRepaymentModal={state.setShowRepaymentModal}
        formRepayment={state.formRepayment}
        setFormRepayment={state.setFormRepayment}
        handleRepayLoan={state.handleRepayLoan}
        loans={state.loans}

        showEditCitizenModal={state.showEditCitizenModal}
        setShowEditCitizenModal={state.setShowEditCitizenModal}
        editingCitizen={state.editingCitizen}
        setEditingCitizen={state.setEditingCitizen}
        handleUpdateCitizen={state.handleUpdateCitizen}

        showEditCashModal={state.showEditCashModal}
        setShowEditCashModal={state.setShowEditCashModal}
        editingCash={state.editingCash}
        setEditingCash={state.setEditingCash}
        handleUpdateCashTransaction={state.handleUpdateCashTransaction}

        showEditLoanModal={state.showEditLoanModal}
        setShowEditLoanModal={state.setShowEditLoanModal}
        editingLoan={state.editingLoan}
        setEditingLoan={state.setEditingLoan}
        handleUpdateLoan={state.handleUpdateLoan}

        showAmortizationModal={state.showAmortizationModal}
        setShowAmortizationModal={state.setShowAmortizationModal}
        amortizationLoan={state.amortizationLoan}

        showReceiptModal={state.showReceiptModal}
        setShowReceiptModal={state.setShowReceiptModal}
        lastCompletedTx={state.lastCompletedTx}
        showLoginModal={state.showLoginModal}
        setShowLoginModal={state.setShowLoginModal}
        adminPasswordInput={state.adminPasswordInput}
        setAdminPasswordInput={state.setAdminPasswordInput}
        handleAdminLogin={state.handleAdminLogin}
        cooldownSeconds={state.cooldownSeconds}
        showCreditModal={showCreditModal}
        setShowCreditModal={setShowCreditModal}
        loanRepayments={state.loanRepayments}
        userRole={state.userRole}
      />

      {/* Toast Notification overlay */}
      {state.toast.visible && (
        <div className="fixed top-4 right-4 z-50 pointer-events-auto animate-toast-in">
          <div className={`
            flex items-center gap-3 px-4.5 py-3 rounded-2xl border shadow-xl backdrop-blur-md max-w-sm
            ${state.toast.type === "success" ? "bg-emerald-600/95 text-white border-emerald-700/50" : ""}
            ${state.toast.type === "error" ? "bg-rose-600/95 text-white border-rose-700/50" : ""}
            ${state.toast.type === "warning" ? "bg-amber-500/95 text-white border-amber-600/50" : ""}
            ${state.toast.type === "info" ? "bg-slate-900/95 text-white border-slate-950/50" : ""}
          `}>
            <div className="shrink-0">
              {state.toast.type === "success" && <CheckCircle className="w-5 h-5" />}
              {state.toast.type === "error" && <AlertOctagon className="w-5 h-5" />}
              {state.toast.type === "warning" && <AlertTriangle className="w-5 h-5" />}
              {state.toast.type === "info" && <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-relaxed break-words">{state.toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
