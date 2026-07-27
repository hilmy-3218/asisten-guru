import React from "react";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";

interface CustomAlertModalProps {
  isOpen: boolean;
  type?: "info" | "warning" | "success" | "danger";
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function CustomAlertModal({
  isOpen,
  type = "info",
  title,
  message,
  confirmLabel = "OK",
  cancelLabel,
  onConfirm,
  onCancel,
}: CustomAlertModalProps) {
  if (!isOpen) return null;

  const iconMap = {
    info: <Info className="w-6 h-6 text-blue-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    success: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
    danger: <AlertTriangle className="w-6 h-6 text-rose-500" />,
  };

  const bgIconMap = {
    info: "bg-blue-50 border border-blue-100",
    warning: "bg-amber-50 border border-amber-100",
    success: "bg-emerald-50 border border-emerald-100",
    danger: "bg-rose-50 border border-rose-100",
  };

  const confirmBtnBgMap = {
    info: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500/20",
    warning: "bg-amber-600 hover:bg-amber-700 active:bg-amber-800 focus:ring-amber-500/20",
    success: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500/20",
    danger: "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 focus:ring-rose-500/20",
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 flex items-start gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${bgIconMap[type]}`}>
            {iconMap[type]}
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="font-extrabold text-slate-800 text-base font-display">
              {title}
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
          {cancelLabel && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-500/20"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-2 ${confirmBtnBgMap[type]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
