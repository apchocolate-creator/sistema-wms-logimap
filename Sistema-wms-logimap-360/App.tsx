
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserRole, Product, Transaction, User, TransactionType, TransactionOrigin, ProductAddress, NavigationItem, UnitType } from './types';
import { NAVIGATION_ITEMS, INITIAL_PRODUCTS, INITIAL_TRANSACTIONS } from './constants';
import { X, LogOut, Search, Plus, AlertCircle, TrendingUp, Package, CheckCircle2, Edit2, Trash2, Calendar, Tag, User as UserIcon, MapPin, MapPinned, Warehouse, Info, ArrowUpRight, ArrowDownLeft, FileText, Share2, Printer, Bell, Shield, Database, Save, UserCheck, Smartphone, Users, Lock, Eye, EyeOff, AlertTriangle, FileSpreadsheet, PanelLeftClose, PanelLeft, Sparkles, Loader2, Box, BarChart2, BarChart3, RefreshCw, QrCode, Download, Upload, Trash, RotateCcw, ChevronRight, Hash, Layers, List, LayoutGrid, Filter, MoreHorizontal, MessageCircle, ChevronDown, ChevronUp, History, ScanLine, Camera, MoveRight, ArrowRightLeft, LayoutDashboard, FilePlus, ClipboardCheck, Ruler, Sun, Moon, HelpCircle, BookOpen, MousePointer2, SmartphoneIcon, ChevronLeft, PlayCircle, CheckCircle, Cloud, CloudCheck, Globe, Wifi, LocateFixed, ZoomIn, Menu, Scan, BarChart as BarChartIcon, BoxSelect, View, Cuboid, TrendingDown, CloudSync } from 'lucide-react';
import { GeminiService } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, Legend } from 'recharts';
import { supabase } from './lib/supabase';

// --- LocalStorage Keys ---
const STORAGE_KEYS = {
  CURRENT_USER: 'logimap_360_current_user',
  THEME: 'logimap_360_theme'
};

// --- Shared UI Components ---

const Badge: React.FC<{ children: React.ReactNode; color?: string; className?: string }> = ({ children, color = 'blue', className = "" }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    red: 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    green: 'bg-green-50 text-green-600 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-blue-800',
    yellow: 'bg-yellow-50 text-yellow-600 border border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-blue-800',
    orange: 'bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-blue-800',
    slate: 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    indigo: 'bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-blue-800',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${colors[color] || colors.blue} ${className}`}>
      {children}
    </span>
  );
};

const Card: React.FC<{ children: React.ReactNode; title?: string; className?: string; headerAction?: React.ReactNode }> = ({ children, title, className = "", headerAction }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden card ${className}`}>
    {title && (
      <div className="px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
        <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
          {title}
        </h3>
        <div className="no-print">
          {headerAction}
        </div>
      </div>
    )}
    <div className="p-4 md:p-6">{children}</div>
  </div>
);

const AddressDisplay: React.FC<{ address: ProductAddress; compact?: boolean }> = ({ address, compact }) => {
  const itemStyle = "flex items-center rounded-md md:rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm transition-transform hover:scale-105";
  const labelStyle = "px-0.5 md:px-1.5 py-0.5 md:py-1 text-[6px] md:text-[8px] font-black text-white uppercase leading-none flex items-center justify-center";
  const valueStyle = "px-1 md:px-2 py-0.5 md:py-1 text-[8px] md:text-[10px] font-black text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 min-w-[14px] md:min-w-[24px] text-center leading-none";

  return (
    <div className={`flex flex-wrap items-center gap-0.5 md:gap-1.5 ${compact ? 'justify-start md:justify-center' : ''}`}>
      <div className={itemStyle} title="Rua">
        <span className={`${labelStyle} bg-blue-600`}>R</span>
        <span className={valueStyle}>{address.street || '--'}</span>
      </div>
      <div className={itemStyle} title="Bloco">
        <span className={`${labelStyle} bg-slate-700`}>B</span>
        <span className={valueStyle}>{address.block || '--'}</span>
      </div>
      <div className={itemStyle} title="Nível">
        <span className={`${labelStyle} bg-zinc-500`}>N</span>
        <span className={valueStyle}>{address.level || '--'}</span>
      </div>
      <div className={itemStyle} title="Posição">
        <span className={`${labelStyle} bg-amber-600`}>P</span>
        <span className={valueStyle}>{address.position || '--'}</span>
      </div>
    </div>
  );
};

const ConfirmationStep: React.FC<{
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  icon: React.ReactNode;
  data: { label: string; value: string }[];
}> = ({ title, onCancel, onConfirm, icon, data }) => (
  <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
    <div className="bg-white dark:bg-slate-900 w-full max-w-[450px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/10">
      <div className="p-8 md:p-10 text-center">
        <div className="flex justify-center mb-6">{icon}</div>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">{title}</h3>
        <div className="space-y-3 mb-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 text-left">
          {data.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center border-b border-slate-200/40 dark:border-slate-700/40 pb-2 last:border-0 last:pb-0">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase text-right leading-tight max-w-[200px] truncate">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">Cancelar</button>
          <button onClick={onConfirm} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">Confirmar Operação</button>
        </div>
      </div>
    </div>
  </div>
);

const Scanner: React.FC<{ onScan: (code: string) => void; onClose: () => void }> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio beep failed", e);
    }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isScanning = true;
    const hasDetector = 'BarcodeDetector' in window;
    setIsSupported(hasDetector);

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          if (hasDetector) {
            const detector = new (window as any).BarcodeDetector({ 
              formats: ['qr_code', 'ean_13', 'code_128', 'code_39'] 
            });
            const scanFrame = async () => {
              if (!isScanning || !videoRef.current) return;
              if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                try {
                  const barcodes = await detector.detect(videoRef.current);
                  if (barcodes.length > 0 && isScanning) {
                    isScanning = false;
                    playBeep();
                    onScan(barcodes[0].rawValue);
                    return;
                  }
                } catch (e) {
                  console.warn("Detection error:", e);
                }
              }
              requestAnimationFrame(scanFrame);
            };
            requestAnimationFrame(scanFrame);
          }
        }
      } catch (err) {
        setError('Não foi possível acessar a câmera. Verifique as permissões de acesso nas configurações do seu navegador.');
      }
    };

    startCamera();
    return () => {
      isScanning = false;
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [onScan]);

  const handleSimulatedScan = () => {
    const code = prompt("Simulação de Scanner:\nDigite o SKU ou Código de Sincronização:");
    if (code) {
      playBeep();
      onScan(code);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-slate-900 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-[500px] aspect-square bg-black rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl flex items-center justify-center">
        {error ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <p className="text-white font-black text-[10px] uppercase tracking-widest leading-relaxed">{error}</p>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
        )}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-blue-500/50 rounded-3xl relative">
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
            <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] animate-[scan_2.5s_infinite] opacity-80"></div>
          </div>
        </div>
      </div>
      <div className="mt-10 text-center space-y-6">
        <div className="space-y-2">
          <h3 className="text-white text-lg font-black uppercase tracking-tighter">Leitor LogiMap</h3>
          <p className="text-blue-400 text-[9px] font-black uppercase tracking-[0.4em]">{isSupported ? 'Posicione o código no centro' : 'Modo Manual / Digitação'}</p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-4">
            <button onClick={handleSimulatedScan} className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2"><ScanLine className="w-4 h-4" /> Digitar Código</button>
            <button onClick={onClose} className="px-6 py-4 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginView: React.FC<{ users: User[], onLogin: (u: User) => void }> = ({ users, onLogin }) => {
  const [password, setPassword] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.id === selectedUserId);
    if (user && user.password === password) {
      onLogin(user);
    } else {
      setError('Acesso negado. Verifique as credenciais.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-12 animate-in slide-in-from-top-8 duration-700">
          <div className="w-20 h-20 bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 mx-auto mb-6 rotate-6"><Package className="w-10 h-10" /></div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">LogiMap 360</h1>
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Inteligência Logística</p>
        </div>
        <div className="bg-white/10 backdrop-blur-2xl p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl animate-in zoom-in duration-500">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Selecione seu Perfil</label>
              <select className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required>
                <option value="" className="bg-slate-900 text-slate-400">Selecionar usuário...</option>
                {users.map(u => (<option key={u.id} value={u.id} className="bg-slate-900 text-white">{u.name}</option>))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Chave de Acesso</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600" placeholder="••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>
            </div>
            {error && (<div className="p-4 bg-rose-500/20 border border-rose-500/50 rounded-2xl flex items-center gap-3 animate-in shake duration-300"><AlertCircle className="w-5 h-5 text-rose-500" /><p className="text-[10px] font-black text-rose-200 uppercase tracking-widest">{error}</p></div>)}
            <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">Iniciar Sessão</button>
          </form>
        </div>
        <p className="text-center mt-10 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">LogiMap 360 &copy; {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

const WhatsAppButton: React.FC = () => {
  const handleSupportClick = () => { window.open('https://wa.me/5511971422073', '_blank'); };
  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-[60] no-print whatsapp-button">
      <button onClick={handleSupportClick} className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group" title="Suporte via WhatsApp">
        <MessageCircle className="w-7 h-7 text-white" />
        <span className="absolute right-full mr-3 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase text-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Falar no Suporte</span>
      </button>
    </div>
  );
};

// --- View Components ---

const TutorialView: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [practiceDone, setPracticeDone] = useState<string[]>([]);
  const [practiceData, setPracticeData] = useState({ sku: '', qty: 0 });

  const steps = [
    { title: "Boas-vindas ao LogiMap 360", description: "Este é o guia interativo do sistema LogiMap 360. Vamos aprender como operar o estoque de forma profissional.", icon: <BookOpen className="w-12 h-12 text-blue-500" />, actionLabel: "Começar Treinamento", content: (<div className="space-y-4"><p className="text-slate-600 dark:text-slate-400">Nosso sistema foi projetado para ser rápido e preciso. No topo você verá sempre o Painel com os alertas mais importantes.</p><div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl flex items-center gap-4"><AlertCircle className="w-6 h-6 text-blue-500" /><p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-widest">Dica: Itens abaixo de 98 unidades aparecerão no sino de notificações.</p></div></div>) },
    { title: "Dominando o Estoque", description: "A aba Estoque permite visualizar onde cada item está e imprimir etiquetas.", icon: <Package className="w-12 h-12 text-indigo-500" />, actionLabel: "Próximo Passo", practice: "inventory", content: (<div className="space-y-6"><div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700"><h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Zona de Prática: Visualizar Detalhes</h4><div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm flex items-center justify-between group cursor-pointer hover:border-blue-500 transition-all border border-transparent" onClick={() => setPracticeDone(prev => [...new Set([...prev, 'inventory'])])}><div className="flex flex-col"><span className="text-[8px] font-black text-blue-500 font-mono">#123456</span><p className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">Material de Prática</p></div><div className="flex items-center gap-2"><Badge color="slate">R01 B01</Badge><ChevronDown className="w-4 h-4 text-slate-300" /></div></div>{practiceDone.includes('inventory') && (<div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center gap-2 text-emerald-600 dark:text-emerald-400 animate-in fade-in"><CheckCircle className="w-4 h-4" /><p className="text-[10px] font-black uppercase tracking-widest">Excelente! Você aprendeu a localizar um item.</p></div>)}</div></div>) },
    { title: "Registrando Entradas", description: "A entrada de mercadoria é vital para manter o sistema atualizado.", icon: <ArrowUpRight className="w-12 h-12 text-emerald-500" />, actionLabel: "Próximo Passo", practice: "entry", content: (<div className="space-y-6"><div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700"><h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 text-center">Simulador de Entrada</h4><div className="space-y-4"><input type="text" placeholder="Digite o SKU (ex: 1010)" className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all" onChange={e => setPracticeData({...practiceData, sku: e.target.value})} /><input type="number" placeholder="Quantidade" className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-emerald-500 transition-all" onChange={e => setPracticeData({...practiceData, qty: Number(e.target.value)})} /><button disabled={!practiceData.sku || !practiceData.qty} onClick={() => setPracticeDone(prev => [...new Set([...prev, 'entry'])])} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 disabled:opacity-30 active:scale-95 transition-all">Simular Entrada (+)</button></div>{practiceDone.includes('entry') && (<div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 animate-in zoom-in"><Sparkles className="w-5 h-5 animate-pulse" /><p className="text-[10px] font-black uppercase tracking-widest">Muito bom! O saldo seria adicionado instantaneamente.</p></div>)}</div></div>) },
    { title: "O Mapa Industrial", description: "Visualize seu estoque de forma espacial.", icon: <MapPinned className="w-12 h-12 text-amber-500" />, actionLabel: "Próximo Passo", practice: "mapping", content: (<div className="space-y-6"><p className="text-slate-600 dark:text-slate-400 text-xs">O mapeamento mostra as Ruas (8A, 8B, 9A, 9B). Cada bloco tem 5 níveis (N01 ao N05).</p><div className="bg-slate-900 p-4 rounded-[2rem] border border-white/5 overflow-hidden"><div className="grid grid-cols-4 gap-2">{[1,2,3,4,5,6,7,8].map(i => (<div key={i} className="aspect-square bg-white/5 rounded-lg border border-white/10 flex items-center justify-center group hover:bg-blue-600/20 hover:border-blue-500/50 cursor-help transition-all" onClick={() => setPracticeDone(prev => [...new Set([...prev, 'mapping'])])}><div className="w-1 h-1 bg-white/20 rounded-full group-hover:scale-150 transition-transform"></div></div>))}</div></div>{practiceDone.includes('mapping') && (<div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center gap-2 text-blue-600 dark:text-blue-400 animate-in slide-in-from-left-4"><MousePointer2 className="w-4 h-4" /><p className="text-[10px] font-black uppercase tracking-widest">Interação capturada! No mapa real, você verá detalhes do item ao passar o mouse.</p></div>)}</div>) },
    { title: "Treinamento Concluído", description: "Você está pronto para operar o LogiMap 360!", icon: <CheckCircle2 className="w-16 h-16 text-emerald-500" />, actionLabel: "Finalizar e Ir ao Painel", content: (<div className="space-y-6 text-center"><p className="text-slate-600 dark:text-slate-400">Lembre-se: Em caso de dúvidas, o botão de suporte via WhatsApp está sempre disponível no canto inferior direito.</p><div className="flex justify-center"><div className="flex -space-x-2">{[1,2,3].map(i => (<div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 flex items-center justify-center overflow-hidden"><img src={`https://ui-avatars.com/api/?name=User+${i}&background=random`} alt="user" /></div>))}</div></div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">"A organização é a chave para a eficiência logística."</p></div>) }
  ];

  const handleNext = () => { if (activeStep < steps.length - 1) { setActiveStep(prev => prev + 1); } else { alert("Treinamento finalizado com sucesso!"); setActiveStep(0); setPracticeDone([]); } };
  const handleBack = () => { if (activeStep > 0) setActiveStep(prev => prev - 1); };

  const currentStep = steps[activeStep];
  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -translate-y-10 translate-x-10"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform">{currentStep.icon}</div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{currentStep.title}</h2>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-2">Etapa {activeStep + 1} de {steps.length}</p>
            </div>
          </div>
          <div className="w-full md:w-48 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 dark:text-slate-600 px-1"><span>Progresso</span><span>{Math.round(progress)}%</span></div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-600 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(37,99,235,0.3)]" style={{ width: `${progress}%` }}></div></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
           <Card title="Guia Prático" className="h-full !p-8">
              <div className="min-h-[300px] flex flex-col justify-center animate-in slide-in-from-bottom-4 duration-500">
                 <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase mb-4 leading-tight">{currentStep.description}</h3>
                 <div className="py-4">{currentStep.content}</div>
              </div>
              <div className="mt-12 flex gap-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                {activeStep > 0 && (<button onClick={handleBack} className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-3"><ChevronLeft className="w-5 h-5" /> Voltar</button>)}
                <button onClick={handleNext} className="flex-[2] py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3">{currentStep.actionLabel} <ChevronRight className="w-5 h-5" /></button>
              </div>
           </Card>
        </div>
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-slate-900 dark:bg-black p-8 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px] rounded-full -translate-y-10 translate-x-10"></div>
              <h4 className="text-xl font-black uppercase tracking-widest flex items-center gap-4 relative z-10"><Sparkles className="w-6 h-6 text-blue-400" /> Dica do Mestre</h4>
              <p className="text-sm text-slate-300 dark:text-slate-500 font-medium leading-relaxed relative z-10 flex-1">
                 {activeStep === 0 && "Sempre comece o dia olhando o painel principal. Ele resume tudo o que aconteceu enquanto você estava fora."}
                 {activeStep === 1 && "O botão azul no estoque permite cadastrar novos itens. Clique no ícone de QR Code para gerar etiquetas de prateleira."}
                 {activeStep === 2 && "Diferencie 'Compra' de 'Devolução'. Isso ajuda o setor financeiro a entender o fluxo real de dinheiro."}
                 {activeStep === 3 && "Itens em vermelho no mapa indicam que o estoque está baixo naquele endereço específico. Priorize a reposição."}
                 {activeStep === 4 && "Parabéns! Você concluiu o treinamento básico. Explore os relatórios para ver o poder dos dados."}
              </p>
              <div className="pt-6 border-t border-white/5 relative z-10"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><HelpCircle className="w-6 h-6 text-blue-400" /></div><div><p className="text-[10px] font-black uppercase text-slate-400 mb-0.5">Dúvidas?</p><p className="text-xs font-bold text-white">Consulte a ajuda online.</p></div></div></div>
           </div>
        </div>
      </div>
    </div>
  );
};

const DashboardView: React.FC<{ products: Product[]; transactions: Transaction[]; skuTotals: Record<string, { total: number, name: string }> }> = ({ products, transactions, skuTotals }) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  
  const handleGenerateInsights = async () => {
    setLoadingInsights(true);
    const res = await GeminiService.getStockInsights(products, transactions);
    setInsights(res);
    setLoadingInsights(false);
  };

  const chartData = useMemo(() => { return Object.values(skuTotals).map((data: { total: number; name: string }) => ({ name: data.name, total: data.total })).sort((a, b) => b.total - a.total).slice(0, 10); }, [skuTotals]);
  const stats = useMemo(() => { const totalItems = products.reduce((acc, p) => acc + p.quantity, 0); const lowStock = Object.keys(skuTotals).filter(code => { const data = skuTotals[code]; const p = products.find(prod => prod.code === code); return data.total <= (p?.minQuantity || 98); }).length; return { totalItems, lowStock, skus: Object.keys(skuTotals).length }; }, [products, skuTotals]);
  
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="col-span-1"><div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-5"><div className="p-2 md:p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl md:rounded-3xl shadow-inner"><Package className="w-5 h-5 md:w-10 md:h-10" /></div><div className="text-center md:text-left"><p className="text-[7px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] md:tracking-[0.2em] mb-0.5 md:mb-1">Estoque Total</p><h4 className="text-lg md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{stats.totalItems.toFixed(1)}</h4></div></div></Card>
        <Card className="col-span-1"><div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-5"><div className="p-2 md:p-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl md:rounded-3xl shadow-inner"><Tag className="w-5 h-5 md:w-10 md:h-10" /></div><div className="text-center md:text-left"><p className="text-[7px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] md:tracking-[0.2em] mb-0.5 md:mb-1">SKUs Únicos</p><h4 className="text-lg md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{stats.skus}</h4></div></div></Card>
        <Card className="col-span-2 md:col-span-1"><div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-5"><div className="p-2 md:p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl md:rounded-3xl shadow-inner"><AlertCircle className="w-5 h-5 md:w-10 md:h-10" /></div><div className="text-center md:text-left"><p className="text-[7px] md:text-[10px] font-black text-rose-400 uppercase tracking-[0.1em] md:tracking-[0.2em] mb-0.5 md:mb-1">Alertas Críticos</p><h4 className="text-lg md:text-4xl font-black text-rose-600 dark:text-rose-400 tracking-tighter">{stats.lowStock}</h4></div></div></Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <Card title="Distribuição de Volume (Top 10 SKUs)"><div className="h-[200px] md:h-[320px] w-full mt-6"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" /><XAxis dataKey="name" hide /><YAxis fontSize={10} axisLine={false} tickLine={false} fontWeight="700" stroke="#94a3b8" /><Tooltip cursor={{ fill: '#f8fafc', fillOpacity: 0.1 }} contentStyle={{ backgroundColor: '#1e293b', borderRadius: '16px', border: 'none', padding: '12px' }} labelStyle={{ fontWeight: '900', color: '#f8fafc', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }} itemStyle={{ color: '#3b82f6' }} /><Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={25}>{chartData.map((_, index) => (<Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#3b82f6'} />))}</Bar></BarChart></ResponsiveContainer></div></Card>
        <Card 
          title="Assistente de IA" 
          headerAction={
            insights.length > 0 && !loadingInsights ? (
              <button onClick={handleGenerateInsights} className="p-2 text-slate-400 hover:text-blue-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90" title="Gerar Novos Insights">
                <RefreshCw className="w-4 h-4" />
              </button>
            ) : loadingInsights ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : null
          }
        >
          <div className="space-y-4 py-2 min-h-[280px] flex flex-col justify-center">
            {insights.length > 0 ? (
              insights.map((insight, idx) => (
                <div key={idx} className="flex gap-3 md:gap-4 p-3 md:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-white dark:bg-slate-900 rounded-lg md:rounded-xl flex items-center justify-center shadow-sm">
                      <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-600 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h5 className="text-[8px] md:text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Análise Logística</h5>
                    <p className="text-[10px] md:text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-tight">{insight}</p>
                  </div>
                </div>
              ))
            ) : loadingInsights ? (
              <div className="py-20 flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">Analisando dados...</p>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center gap-6 text-center">
                 <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center shadow-inner">
                    <Sparkles className="w-8 h-8" />
                 </div>
                 <div>
                    <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase">Insights da IA</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Obtenha análises e sugestões sobre seu estoque.</p>
                 </div>
                 <button onClick={handleGenerateInsights} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2">
                    <Sparkles className="w-4 h-4"/> Gerar Insights
                 </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Extracted ProductFormModal for stability
const ProductFormModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (p: Product) => void; 
  initialData?: Product | null; 
  title: string;
  categories: string[];
  units: string[];
}> = ({ isOpen, onClose, onSubmit, initialData, title, categories, units }) => {
  const [formData, setFormData] = useState<any>({ 
    code: '', ean: '', name: '', 
    category: categories[0] || '10 MT', 
    unit: units[0] || 'un', 
    quantity: '', minQuantity: '98', 
    address: { street: '', block: '', level: '', position: '' } 
  });
  const [innerScanner, setInnerScanner] = useState<'sku' | 'ean' | null>(null);

  useEffect(() => { 
    if (initialData) { 
      setFormData(initialData); 
    } else { 
      setFormData({ 
        code: '', ean: '', name: '', 
        category: categories[0] || '10 MT', 
        unit: units[0] || 'un', 
        quantity: '', minQuantity: '98', 
        address: { street: '', block: '', level: '', position: '' } 
      }); 
    } 
  }, [initialData, isOpen, categories, units]);

  if (!isOpen) return null;

  const handleInnerScanResult = (code: string) => { 
    let decoded = code; 
    if (code.includes('SKU: ')) { 
      const match = code.match(/SKU: ([\w\-]+)/); 
      if (match) decoded = match[1]; 
    } 
    if (innerScanner === 'sku') setFormData({ ...formData, code: decoded }); 
    if (innerScanner === 'ean') setFormData({ ...formData, ean: decoded }); 
    setInnerScanner(null); 
  };

  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    const finalProduct = { 
      ...formData, 
      code: formData.code.trim().toUpperCase(),
      address: {
        street: (formData.address.street || 'PENDENTE').trim().toUpperCase(),
        block: (formData.address.block || '---').trim().toUpperCase(),
        level: (formData.address.level || '---').trim().toUpperCase(),
        position: (formData.address.position || '---').trim().toUpperCase()
      },
      quantity: formData.quantity === '' ? 0 : Number(formData.quantity), 
      minQuantity: formData.minQuantity === '' ? 98 : Number(formData.minQuantity), 
      id: initialData?.id || `${formData.code.trim().toUpperCase()}-${Date.now()}`, 
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0] 
    } as Product;
    onSubmit(finalProduct); 
    onClose(); 
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md overflow-hidden">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[850px] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col border border-white/10">
        <div className="px-8 md:px-10 py-7 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{title}</h2>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Gestão de Localização e Propriedades do Lote</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 md:p-10 space-y-8 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 flex justify-between items-center">
                <span>Código SKU</span>
                <button type="button" onClick={() => setInnerScanner('sku')} className="text-blue-600 hover:text-blue-700"><Scan className="w-4 h-4" /></button>
              </label>
              <input required type="text" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 flex justify-between items-center">
                <span>EAN Barras</span>
                <button type="button" onClick={() => setInnerScanner('ean')} className="text-blue-600 hover:text-blue-700"><Scan className="w-4 h-4" /></button>
              </label>
              <input type="text" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner" value={formData.ean} onChange={e => setFormData({ ...formData, ean: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Categoria</label>
              <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none cursor-pointer appearance-none shadow-inner" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>{categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Descrição Comercial Completa</label>
            <input required type="text" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-inner" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
            <label className="text-[11px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-widest flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg"><MapPinned className="w-4 h-4" /></div> Endereçamento Logístico
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase text-center block">Rua (Corredor)</label>
                <input required type="text" className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-black text-center text-blue-600 dark:text-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm" value={formData.address?.street} onChange={e => setFormData({...formData, address: {...formData.address, street: e.target.value.toUpperCase()}})} placeholder="8-A" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase text-center block">Bloco (Módulo)</label>
                <input required type="text" className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-black text-center text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm" value={formData.address?.block} onChange={e => setFormData({...formData, address: {...formData.address, block: e.target.value.toUpperCase()}})} placeholder="01" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase text-center block">Nível (Andar)</label>
                <input required type="text" className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-black text-center text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm" value={formData.address?.level} onChange={e => setFormData({...formData, address: {...formData.address, level: e.target.value.toUpperCase()}})} placeholder="01" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase text-center block">Posição</label>
                <input required type="text" className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-base font-black text-center text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm" value={formData.address?.position} onChange={e => setFormData({...formData, address: {...formData.address, position: e.target.value.toUpperCase()}})} placeholder="01" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Quantidade em Estoque</label>
              <input required type="number" step="0.1" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xl text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-inner" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} placeholder="0.0" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Mínimo de Segurança (SKU)</label>
              <input required type="number" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xl text-rose-600 dark:text-rose-400 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none shadow-inner" value={formData.minQuantity} onChange={e => setFormData({ ...formData, minQuantity: e.target.value })} placeholder="98" />
            </div>
          </div>
        </form>
        <div className="p-8 md:p-10 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
          <button type="submit" onClick={handleSubmit} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4 group">
            {initialData ? 'Atualizar Inventário' : 'Cadastrar novo Lote'}
            <ArrowRightLeft className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>
      {innerScanner && <Scanner onScan={handleInnerScanResult} onClose={() => setInnerScanner(null)} />}
    </div>
  );
};

const CatalogView: React.FC<{ products: Product[]; categories: string[]; units: string[]; onAdd: (p: Product) => void; onEdit: (p: Product) => void; onDelete: (id: string) => void; onAddCategory: (cat: string) => void; onAddUnit: (unit: string) => void; onAddBatch: (batch: Product[]) => void; user: User; }> = ({ products, categories, units, onAdd, onEdit, onDelete, onAddCategory, onAddUnit, onAddBatch, user }) => {
  const [formData, setFormData] = useState({ code: '', ean: '', name: '', category: categories[0] || '10 MT', unit: units[0] || 'un' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showScanner, setShowScanner] = useState<'sku' | 'ean' | 'edit-sku' | 'edit-ean' | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [listFilter, setListFilter] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const catalogProducts = useMemo(() => {
    const uniqueMap = new Map<string, Product>();
    const sortedProducts = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    
    sortedProducts.forEach(p => {
      if (!uniqueMap.has(p.code)) {
        uniqueMap.set(p.code, p);
      }
    });

    const uniqueList = Array.from(uniqueMap.values());

    return uniqueList.filter(p => 
      !listFilter || 
      p.name.toLowerCase().includes(listFilter.toLowerCase()) || 
      p.code.toLowerCase().includes(listFilter.toLowerCase()) || 
      p.ean?.toLowerCase().includes(listFilter.toLowerCase())
    ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [products, listFilter]);

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setFormData({ code: p.code, ean: p.ean || '', name: p.name, category: p.category, unit: p.unit });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditingProduct(null);
    setShowEditModal(false);
    setFormData({ code: '', ean: '', name: '', category: categories[0] || '10 MT', unit: units[0] || 'un' });
  };

  const handleAddCategory = (e: React.FormEvent) => { e.preventDefault(); if (!newCatName.trim()) return; onAddCategory(newCatName.trim().toUpperCase()); setNewCatName(''); setShowCategoryModal(false); alert('Nova categoria adicionada com sucesso!'); };
  const handleAddUnit = (e: React.FormEvent) => { e.preventDefault(); if (!newUnitName.trim()) return; onAddUnit(newUnitName.trim().toLowerCase()); setNewUnitName(''); setShowUnitModal(false); alert('Nova unidade de medida adicionada!'); };
  
  const handleScanResult = (code: string) => {
    let decoded = code;
    if (code.includes('SKU: ')) {
      const match = code.match(/SKU: ([\w\-]+)/);
      if (match) decoded = match[1];
    }
    
    if (showScanner === 'sku') setFormData(prev => ({ ...prev, code: decoded }));
    else if (showScanner === 'ean') setFormData(prev => ({ ...prev, ean: decoded }));
    else if (showScanner === 'edit-sku') setFormData(prev => ({ ...prev, code: decoded }));
    else if (showScanner === 'edit-ean') setFormData(prev => ({ ...prev, ean: decoded }));
    
    setShowScanner(null);
  };

  const downloadCatalogTemplate = () => { const headers = ['SKU', 'EAN', 'Nome', 'Categoria', 'Unidade']; const example = ['181400010180003', '7891234567890', 'Feltro Verde Bilhar', '10 MT', 'un']; const csvContent = "\uFEFF" + [headers, example].map(e => e.join(';')).join('\n'); const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.setAttribute('href', url); link.setAttribute('download', `modelo_cadastro_base_logimap_360.csv`); link.click(); };
  
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newProducts: Product[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(';');
        if (cols.length < 5) continue;
        const [code, ean, name, category, unit] = cols;
        newProducts.push({ id: `${code.trim()}-${Date.now()}-${i}`, code: code.trim().toUpperCase(), ean: ean.trim(), name: name.trim(), category: category.trim().toUpperCase(), unit: unit.trim().toLowerCase(), description: name.trim(), quantity: 0, minQuantity: 98, address: { street: 'PENDENTE', block: '---', level: '---', position: '---' }, supplier: 'LogiMap 360 Inventory', createdAt: new Date().toISOString().split('T')[0] });
      }
      if (newProducts.length > 0) {
        onAddBatch(newProducts);
        alert(`${newProducts.length} produtos importados para a base!`);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newProduct: Product = {
      id: `${formData.code.trim().toUpperCase()}-${Date.now()}`,
      code: formData.code.trim().toUpperCase(),
      ean: formData.ean.trim(),
      name: formData.name.trim(),
      category: formData.category,
      unit: formData.unit,
      description: formData.name.trim(),
      quantity: 0,
      minQuantity: 98,
      address: { street: 'PENDENTE', block: '---', level: '---', position: '---' },
      supplier: 'LogiMap 360 Inventory',
      createdAt: new Date().toISOString().split('T')[0]
    };
    onAdd(newProduct);
    setTimeout(() => {
      setFormData({ code: '', ean: '', name: '', category: categories[0] || '10 MT', unit: units[0] || 'un' });
      setIsSubmitting(false);
      alert('Produto cadastrado na base!');
    }, 300);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    onEdit({
      ...editingProduct,
      code: formData.code.trim().toUpperCase(),
      ean: formData.ean.trim(),
      name: formData.name.trim(),
      category: formData.category,
      unit: formData.unit,
      description: formData.name.trim()
    });
    handleCloseEditModal();
    alert('Alterações salvas com sucesso!');
  };

  const handleDeleteWithCheck = (id: string, code: string) => {
    const hasPhysicalStock = products.some(p => p.code === code && p.quantity > 0);
    if (hasPhysicalStock) {
      alert("Atenção: Não é possível excluir este material do catálogo base pois ainda existe saldo físico (quantidades) registrado em algum endereço de estoque.");
      return;
    }
    if(confirm("Deseja realmente remover este item do catálogo base?")) {
      onDelete(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6"><div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 dark:shadow-blue-900/20"><FilePlus className="w-8 h-8" /></div><div><h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Cadastro Base</h2><p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Definição mestre de produtos e catálogo</p></div></div>
        <div className="flex flex-wrap gap-2 justify-center">
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-5 py-3 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black dark:hover:bg-white transition-all active:scale-95" title="Importar CSV"><Upload className="w-4 h-4" /> Importar</button>
          <button onClick={downloadCatalogTemplate} className="p-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-xl hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-100 dark:hover:border-blue-900 transition-all active:scale-95" title="Baixar Modelo CSV"><Download className="w-4 h-4" /></button>
          <div className="w-px h-10 bg-slate-100 dark:bg-slate-800 mx-1"></div>
          <button onClick={() => setShowCategoryModal(true)} className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-black uppercase text-[10px] tracking-widest hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95"><Tag className="w-4 h-4" /> Categorias</button>
          <button onClick={() => setShowUnitModal(true)} className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-black uppercase text-[10px] tracking-widest hover:border-blue-200 dark:hover:border-blue-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95"><Ruler className="w-4 h-4" /> Unidades</button>
        </div>
        <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <Card title="Novo Registro">
            <form onSubmit={handleSubmitNew} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 flex justify-between items-center">
                    <span>SKU</span>
                    <button type="button" onClick={() => setShowScanner('sku')} className="text-blue-600 hover:text-blue-700"><Scan className="w-3.5 h-3.5" /></button>
                  </label>
                  <input required type="text" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="Ex: 181400..." value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 flex justify-between items-center">
                    <span>EAN</span>
                    <button type="button" onClick={() => setShowScanner('ean')} className="text-blue-600 hover:text-blue-700"><Scan className="w-3.5 h-3.5" /></button>
                  </label>
                  <input type="text" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="789..." value={formData.ean} onChange={e => setFormData({ ...formData, ean: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Nome do Produto</label><input required type="text" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="Ex: Feltro Verde Musgo" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Categoria</label><select className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none cursor-pointer" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>{categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Unidade</label><select className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none cursor-pointer" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })}>{units.map(u => (<option key={u} value={u}>{u.toUpperCase()}</option>))}</select></div>
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3">{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Salvar Registro Base</button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card title="Catálogo Geral" headerAction={<div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" /><input type="text" placeholder="Filtrar catálogo..." className="pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold outline-none focus:border-blue-500 transition-all" value={listFilter} onChange={e => setListFilter(e.target.value)} /></div>}>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
              {catalogProducts.map(p => (
                <div key={p.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:bg-white dark:hover:bg-slate-900 hover:border-blue-200 dark:hover:border-blue-800 transition-all">
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase truncate">{p.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5"><span className="text-[9px] font-black text-blue-600 dark:text-blue-400 font-mono">#{p.code}</span>{p.ean && <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 font-mono">EAN: {p.ean}</span>}<Badge color={p.category.includes('30') ? 'orange' : 'blue'} className="!text-[7px]">{p.category}</Badge><Badge color="slate" className="!text-[7px] uppercase">{p.unit}</Badge>{(p.address?.street === 'PENDENTE' || !p.address?.street) && <Badge color="orange" className="!text-[7px]">PENDENTE</Badge>}</div>
                  </div>
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditClick(p)} className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all" title="Editar"><Edit2 className="w-4 h-4" /></button>
                    {user.role === UserRole.ADMIN && (<button onClick={() => handleDeleteWithCheck(p.id, p.code)} className="p-2.5 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all" title="Excluir"><Trash2 className="w-4 h-4" /></button>)}
                  </div>
                </div>
              ))}
              {catalogProducts.length === 0 && (<div className="py-20 text-center opacity-30 flex flex-col items-center gap-4"><ClipboardCheck className="w-12 h-12 text-slate-400 dark:text-slate-600" /><p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-600">Nenhum produto encontrado</p></div>)}
            </div>
          </Card>
        </div>
      </div>

      {showEditModal && editingProduct && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[650px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/10">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div><h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Alterar Cadastro</h2><p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Modifique as propriedades mestres do material</p></div>
              <button onClick={handleCloseEditModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 flex justify-between items-center">
                    <span>Código SKU</span>
                    <button type="button" onClick={() => setShowScanner('edit-sku')} className="text-blue-600"><Scan className="w-3.5 h-3.5" /></button>
                  </label>
                  <input required className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 flex justify-between items-center">
                    <span>Código EAN</span>
                    <button type="button" onClick={() => setShowScanner('edit-ean')} className="text-blue-600"><Scan className="w-3.5 h-3.5" /></button>
                  </label>
                  <input className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" value={formData.ean} onChange={e => setFormData({...formData, ean: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Nome Comercial</label>
                <input required className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Categoria</label>
                  <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none cursor-pointer" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>{categories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Unidade</label>
                  <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-900 dark:text-white outline-none cursor-pointer" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>{units.map(u => (<option key={u} value={u}>{u.toUpperCase()}</option>))}</select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={handleCloseEditModal} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 active:scale-95 transition-all">Cancelar</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all">Atualizar Cadastro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[450px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-white/10">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Nova Categoria</h2>
              <button onClick={() => setShowCategoryModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddCategory} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Nome da Categoria</label>
                <input required autoFocus className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="Ex: 50 MT, RETALHOS, etc" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Adicionar à Base</button>
            </form>
          </div>
        </div>
      )}

      {showUnitModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[450px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-white/10">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Nova Unidade</h2>
              <button onClick={() => setShowUnitModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddUnit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Sigla da Unidade</label>
                <input required autoFocus className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="Ex: pct, rol, par, etc" value={newUnitName} onChange={e => setNewUnitName(e.target.value)} />
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Adicionar Unidade</button>
            </form>
          </div>
        </div>
      )}
      {showScanner && (<Scanner onScan={handleScanResult} onClose={() => setShowScanner(null)} />)}
    </div>
  );
};

const InventoryView: React.FC<{ products: Product[]; categories: string[]; units: string[]; onAdd: (p: Product) => void; onEdit: (p: Product) => void; onDelete: (id: string) => void; onAddBatch: (batch: Product[]) => void; onViewMovements: (sku: string) => void; user: User; skuTotals: Record<string, { total: number, name: string }>; transactions: Transaction[]; }> = ({ products, categories, units, onAdd, onEdit, onDelete, onAddBatch, onViewMovements, user, skuTotals, transactions }) => {
  const [filter, setFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showScanner, setShowScanner] = useState<'sku' | 'ean' | 'global' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detailed'>('list');
  const [expandedSkus, setExpandedSkus] = useState<string[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const handleClickOutside = (event: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(event.target as Node)) { setShowSearchDropdown(false); } }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
  
  const uniqueProductList = useMemo(() => { 
    const map = new Map<string, { code: string, name: string, total: number, category: string, minQuantity: number, items: Product[] }>(); 
    products.forEach(p => { 
      const existing = map.get(p.code); 
      if (existing) { 
        existing.total += p.quantity; 
        existing.items.push(p); 
      } else { 
        map.set(p.code, { code: p.code, name: p.name, total: p.quantity, category: p.category, minQuantity: p.minQuantity || 98, items: [p] }); 
      } 
    }); 
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)); 
  }, [products]);

  const filteredUniqueProducts = useMemo(() => { 
    if (!filter) return uniqueProductList; 
    const term = filter.toLowerCase();
    return uniqueProductList.filter(p => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)); 
  }, [uniqueProductList, filter]);

  // Gráfico de Saídas por Categoria (Últimos 30 Dias)
  const categoryExitData = useMemo(() => {
    const thirtyDaysAgo = new Date().getTime() - (30 * 24 * 60 * 60 * 1000);
    const exitMap: Record<string, number> = {};
    
    transactions.forEach(t => {
      if (t.type === 'exit' && new Date(t.date).getTime() >= thirtyDaysAgo) {
        // Encontrar a categoria do produto
        const productRef = products.find(p => p.id === t.productId || p.code === t.productId);
        const category = productRef?.category || "OUTROS";
        exitMap[category] = (exitMap[category] || 0) + t.quantity;
      }
    });

    return Object.entries(exitMap)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [transactions, products]);

  const toggleExpandSku = (code: string) => { setExpandedSkus(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]); };
  const openQrModal = (p: Product) => { setSelectedProduct(p); setShowQrModal(true); };
  
  const handleGlobalScanResult = (code: string) => { 
    let sku = code; 
    if (code.includes('SKU: ')) { 
      const match = code.match(/SKU: ([\w\-]+)/); 
      if (match) sku = match[1]; 
    } 
    setFilter(sku); 
    setShowScanner(null); 
    setShowSearchDropdown(false); 
  };

  const downloadTemplate = () => { const headers = ['SKU', 'EAN', 'Nome', 'Categoria', 'Quantidade', 'Minimo', 'Rua', 'Bloco', 'Nivel', 'Posicao']; const example = ['181400010180003', '7891234567890', 'Feltro Verde Bilhar', '10 MT', '98', '98', '8-A', '01', '04', '01']; const csvContent = "\uFEFF" + [headers, example].map(e => e.join(';')).join('\n'); const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.setAttribute('href', url); link.setAttribute('download', `modelo_importacao_logimap_360.csv`); link.click(); };
  
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => { 
    const file = e.target.files?.[0]; 
    if (!file) return; 
    const reader = new FileReader(); 
    reader.onload = (event) => { 
      const text = event.target?.result as string; 
      const lines = text.split('\n'); 
      const newProducts: Product[] = []; 
      for (let i = 1; i < lines.length; i++) { 
        const line = lines[i].trim(); 
        if (!line) continue; 
        const cols = line.split(';'); 
        if (cols.length < 10) continue; 
        const [code, ean, name, category, quantity, minQuantity, street, block, level, position] = cols; 
        newProducts.push({ 
          id: `${code.trim()}-${Date.now()}-${i}`, 
          code: code.trim().toUpperCase(), 
          ean: ean.trim(), 
          name: name.trim(), 
          category: category.trim().toUpperCase(), 
          description: name.trim(), 
          unit: 'un', 
          quantity: Number(quantity) || 0, 
          minQuantity: Number(minQuantity) || 98, 
          address: { street: street.trim().toUpperCase(), block: block.trim().toUpperCase(), level: level.trim().toUpperCase(), position: position.trim().toUpperCase() }, 
          supplier: 'Industria de Feltro Santa Fé', 
          createdAt: new Date().toISOString().split('T')[0] 
        }); 
      } 
      if (newProducts.length > 0) { 
        onAddBatch(newProducts); 
        alert(`${newProducts.length} produtos importados com sucesso!`); 
      } 
      if (fileInputRef.current) fileInputRef.current.value = ''; 
    }; 
    reader.readAsText(file); 
  };

  const handleModalSubmit = (p: Product) => {
    if (editingProduct) {
      onEdit(p);
      alert('Localização atualizada!');
    } else {
      onAdd(p);
      setFilter('');
      alert('Novo endereçamento registrado!');
    }
  };

  const getQrData = (p: Product) => { return `LOGIMAP 360 | SKU: ${p.code} | ITEM: ${p.name} | END: R${p.address.street} B${p.address.block} N${p.address.level} P${p.address.position}`; };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Gráfico Estratégico de Saídas por Categoria */}
      {categoryExitData.length > 0 && (
        <Card title="Volume de Saídas por Categoria (Últimos 30 Dias)" className="!p-4 md:!p-8">
           <div className="h-[250px] md:h-[350px] w-full mt-4">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={categoryExitData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                 <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} stroke="#94a3b8" />
                 <YAxis dataKey="name" type="category" fontSize={10} axisLine={false} tickLine={false} fontWeight="900" stroke="#64748b" width={70} />
                 <Tooltip 
                   cursor={{ fill: '#f8fafc', fillOpacity: 0.1 }} 
                   contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', padding: '10px' }}
                   labelStyle={{ display: 'none' }}
                   itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                   formatter={(value) => [`${value} unidades`, 'Total Saídas']}
                 />
                 <Bar dataKey="total" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={24}>
                   {categoryExitData.map((_, index) => (
                     <Cell key={`cell-${index}`} fill={index === 0 ? '#1d4ed8' : index === 1 ? '#2563eb' : '#3b82f6'} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </Card>
      )}

      <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 lg:gap-5 sticky top-20 z-20">
        <div className="flex flex-col md:flex-row lg:items-center justify-between gap-4">
          <div className="flex gap-2 w-full lg:max-w-md relative" ref={searchRef}><div className="relative flex-1 group"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" /><input type="text" placeholder="Buscar por nome ou SKU..." className="w-full pl-11 md:pl-12 pr-4 py-3 md:py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[1rem] md:rounded-[1.25rem] font-bold text-xs md:text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600" value={filter} onFocus={() => setShowSearchDropdown(true)} onChange={e => { setFilter(e.target.value); setShowSearchDropdown(true); }} /></div><button onClick={() => setShowScanner('global')} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 rounded-[1rem] md:rounded-[1.25rem] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-95 shadow-sm shrink-0" title="Escanear Código"><QrCode className="w-5 h-5 md:w-6 md:h-6" /></button>{showSearchDropdown && (<div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-[60] max-h-96 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in duration-200"><div className="p-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50"><h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Resultados Consolidados</h4><Badge color="blue">{uniqueProductList.length} SKUs</Badge></div>{uniqueProductList.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()) || p.code.toLowerCase().includes(filter.toLowerCase())).map(p => (<button key={p.code} onClick={() => { setFilter(p.code); setShowSearchDropdown(false); }} className="w-full p-4 flex items-center justify-between hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 text-left"><div className="min-w-0 pr-4"><p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase truncate">{p.name}</p><span className="text-[9px] font-black text-blue-600 dark:text-blue-400 font-mono">#{p.code}</span></div><div className="text-right shrink-0"><span className={`text-sm font-black font-mono ${p.total <= p.minQuantity ? 'text-rose-600' : 'text-slate-600 dark:text-slate-400'}`}>{p.total.toFixed(1)}</span><p className="text-[7px] font-black text-slate-300 dark:text-slate-600 uppercase">Total</p></div></button>))}</div>)}</div>
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto"><div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700"><button onClick={() => setViewMode('list')} className={`p-1.5 md:p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} title="Lista"><List className="w-4 h-4 md:w-5 md:h-5" /></button><button onClick={() => setViewMode('detailed')} className={`p-1.5 md:p-2 rounded-xl transition-all ${viewMode === 'detailed' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} title="Cards"><LayoutGrid className="w-4 h-4 md:w-5 md:h-5" /></button></div><div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block mx-1"></div><div className="flex items-center gap-1 md:gap-2"><button onClick={() => fileInputRef.current?.click()} className="p-2.5 md:p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-95" title="Importar"><Upload className="w-4 h-4 md:w-5 md:h-5" /></button><button onClick={downloadTemplate} className="p-2.5 md:p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-95" title="Baixar Modelo"><Download className="w-4 h-4" /></button></div></div>
        </div>
        <button onClick={() => { setEditingProduct(null); setShowAddModal(true); }} className="w-full flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] md:text-[11px] tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"><Plus className="w-4 h-4 md:w-5 md:h-5" /> Cadastrar Novos Produtos</button>
        <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
      </div>
      
      <div>
        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
            <div className="hidden md:grid grid-cols-12 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="col-span-1"></div>
              <div className="col-span-5 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Produto / SKU</div>
              <div className="col-span-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Categoria</div>
              <div className="col-span-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Saldo Total</div>
              <div className="col-span-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Ações</div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUniqueProducts.map(p => { 
                const isLow = p.total <= p.minQuantity; 
                const isExpanded = expandedSkus.includes(p.code); 
                return (
                  <div key={p.code} className={`transition-all ${isExpanded ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
                    <div className="hidden md:grid grid-cols-12 items-center px-6 py-4">
                      <div className="col-span-1 flex justify-center"><button onClick={() => toggleExpandSku(p.code)} className={`p-2 rounded-full transition-all ${isExpanded ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-blue-600'}`}>{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button></div>
                      <div className="col-span-5 flex flex-col min-w-0 pr-4"><span className="text-[9px] font-black text-blue-600 dark:text-blue-400 font-mono mb-0.5">#{p.code}</span><p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase truncate leading-tight">{p.name}</p></div>
                      <div className="col-span-2 flex justify-center"><Badge color={p.category.includes('30') ? 'orange' : 'blue'}>{p.category}</Badge></div>
                      <div className="col-span-2 text-right"><span className={`text-sm font-black font-mono ${isLow ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>{p.total.toFixed(1)}</span></div>
                      <div className="col-span-2 flex items-center justify-center gap-1 opacity-60 hover:opacity-100 transition-opacity"><button onClick={() => openQrModal(p.items[0])} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"><QrCode className="w-4 h-4" /></button><button onClick={() => { setEditingProduct(p.items[0]); setShowAddModal(true); }} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all"><Edit2 className="w-4 h-4" /></button></div>
                    </div>
                    {/* Versão Mobile */}
                    <div className="md:hidden">
                      <div className="p-3 flex items-start gap-3 border-b border-slate-50 dark:border-slate-800 last:border-0 relative">
                        <button onClick={() => toggleExpandSku(p.code)} className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 active:bg-blue-50'}`}>{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 overflow-hidden">
                            <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800 font-mono shrink-0">#{p.code}</span>
                            <Badge color={p.category.includes('30') ? 'orange' : 'slate'} className="!text-[7px] shrink-0">{p.category}</Badge>
                            {isLow && <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0 animate-pulse" />}
                          </div>
                          <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase leading-snug line-clamp-2 pr-16">{p.name}</p>
                        </div>
                        <div className="absolute top-3 right-3 text-right">
                          <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase mb-0.5 tracking-tighter">Saldo Total</p>
                          <span className={`text-sm font-black font-mono block ${isLow ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>{p.total.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 md:px-20 pb-4 animate-in slide-in-from-top-4 duration-300">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-inner">
                          <div className="bg-slate-100/50 dark:bg-slate-900/50 px-3 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                            <h5 className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2"><MapPinned className="w-3 h-3" /> Detalhes Logísticos</h5>
                            <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase">{p.items.length} locais</span>
                          </div>
                          <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {p.items.map(item => (
                              <div key={item.id} className="p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-white dark:hover:bg-slate-900/50 transition-colors">
                                <div className="flex-1"><AddressDisplay address={item.address} compact /></div>
                                <div className="flex items-center justify-between md:justify-end gap-6">
                                  <div className="text-right"><span className="text-xs font-black font-mono text-slate-700 dark:text-slate-300">{item.quantity.toFixed(1)} <span className="text-[8px] text-slate-300 dark:text-slate-600">{item.unit}</span></span></div>
                                  <div className="flex items-center gap-1.5">
                                    {user.role === UserRole.ADMIN && (<button onClick={() => onViewMovements(p.code)} className="p-1.5 text-slate-400 hover:text-blue-600"><History className="w-3.5 h-3.5" /></button>)}
                                    <button onClick={() => openQrModal(item)} className="p-1.5 text-blue-600"><QrCode className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => { setEditingProduct(item); setShowAddModal(true); }} className="p-1.5 text-slate-400 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                                    {user.role === UserRole.ADMIN && (<button onClick={() => { if(confirm("Deseja realmente remover o saldo deste endereço?")) onDelete(item.id); }} className="p-1.5 text-rose-300 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ); 
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-10">
            {filteredUniqueProducts.map(p => { 
              const isLow = p.total <= p.minQuantity; 
              const isExpanded = expandedSkus.includes(p.code); 
              return (
                <div key={p.code} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col h-fit relative overflow-hidden">
                  {isLow && <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500 text-white flex items-center justify-center transform rotate-45 translate-x-8 -translate-y-8 shadow-lg"><AlertTriangle className="w-3 h-3 -rotate-45" /></div>}
                  <div className="flex justify-between items-start mb-4"><Badge color={p.category.includes('30') ? 'orange' : 'blue'} className="!px-2 md:!px-3">{p.category}</Badge><span className="text-[9px] font-black text-slate-400 dark:text-slate-600 font-mono bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">#{p.code}</span></div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight mb-4 line-clamp-2 leading-snug">{p.name}</h3>
                  <div className="flex items-center justify-between p-3 md:p-4 rounded-[1.25rem] bg-slate-900 dark:bg-slate-950 text-white shadow-xl mb-4">
                    <div><p className="text-[8px] font-black text-slate-500 uppercase mb-0.5 opacity-60">Saldo Consolidado</p><span className={`text-lg md:text-xl font-black font-mono ${isLow ? 'text-rose-400' : 'text-blue-400'}`}>{p.total.toFixed(1)}</span></div>
                    <div className="text-right"><p className="text-[8px] font-black text-slate-500 uppercase mb-0.5 opacity-60">Localizações</p><p className="text-xs md:text-sm font-black font-mono">{p.items.length}</p></div>
                  </div>
                  <button onClick={() => toggleExpandSku(p.code)} className={`w-full py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 mb-4 transition-all ${isExpanded ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{isExpanded ? <><ChevronUp className="w-3 h-3" /> Ocultar Endereços</> : <><ChevronDown className="w-3 h-3" /> Ver Detalhes</>}</button>
                  {isExpanded && (
                    <div className="space-y-3 mb-4 animate-in slide-in-from-top-4 duration-300">
                      {p.items.map(item => (
                        <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col gap-2">
                          <AddressDisplay address={item.address} compact />
                          <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-2">
                            <span className="text-[10px] font-black font-mono text-slate-600 dark:text-slate-400">{item.quantity.toFixed(1)} {item.unit}</span>
                            <div className="flex gap-1">
                              <button onClick={() => openQrModal(item)} className="p-1 text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform"><QrCode className="w-3.5 h-3.5" /></button>
                              <button onClick={() => { setEditingProduct(item); setShowAddModal(true); }} className="p-1 text-slate-400 dark:text-slate-500 hover:text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                              {user.role === UserRole.ADMIN && (<button onClick={() => { if(confirm("Excluir endereço?")) onDelete(item.id); }} className="p-1 text-rose-300 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-50 dark:border-slate-800 mt-auto">
                    <button onClick={() => openQrModal(p.items[0])} className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"><QrCode className="w-4 h-4" /><span className="text-[8px] font-black uppercase">Etiqueta</span></button>
                    <button onClick={() => { setEditingProduct(p.items[0]); setShowAddModal(true); }} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-900 hover:text-white transition-all active:scale-95"><Edit2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ); 
            })}
          </div>
        )}
      </div>

      <ProductFormModal 
        isOpen={showAddModal} 
        onClose={() => { setShowAddModal(false); setEditingProduct(null); }} 
        onSubmit={handleModalSubmit} 
        initialData={editingProduct} 
        title={editingProduct ? 'Editar Registro de Inventário' : 'Cadastro de Novos Produtos'} 
        categories={categories} 
        units={units} 
      />
      
      {showScanner && (<Scanner onScan={handleGlobalScanResult} onClose={() => setShowScanner(null)} />)}
      {showQrModal && selectedProduct && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[500px] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-white/20">
            <div className="p-8 md:p-12 text-center relative print:p-4 print:shadow-none">
              <button onClick={() => setShowQrModal(false)} className="absolute right-6 top-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors no-print"><X className="w-6 h-6 text-slate-400" /></button>
              <div className="flex flex-col items-center mb-6 print:mb-4">
                <div className="w-full flex justify-between items-center mb-4 print:mb-2">
                  <div className="text-left">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">LogiMap 360</h2>
                    <p className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">LOGÍSTICA</p>
                  </div>
                  <Badge color="slate" className="print:hidden">ETIQUETA DE ENDEREÇO</Badge>
                </div>
                <div className="bg-white p-4 md:p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-inner mb-4 print:border-none print:p-0">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(getQrData(selectedProduct))}&margin=10&format=png`} alt="QR Code Endereço" className="w-48 h-48 md:w-56 md:h-56 mx-auto print:w-40 print:h-40" />
                </div>
              </div>
              <div className="space-y-3 mb-8 text-center print:mb-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 print:bg-transparent print:border-none print:p-0">
                  <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Identificação do Lote</p>
                  <h3 className="text-base md:text-xl font-black text-slate-900 dark:text-white uppercase leading-tight truncate">{selectedProduct.name}</h3>
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 font-mono mt-1 block">SKU: {selectedProduct.code}</span>
                </div>
                <div className="pt-2">
                  <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase mb-3">Localização Armazenada</p>
                  <div className="flex justify-center scale-125 print:scale-125"><AddressDisplay address={selectedProduct.address} /></div>
                </div>
              </div>
              <button onClick={() => window.print()} className="w-full py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase text-[10px] md:text-xs flex items-center justify-center gap-3 hover:bg-black dark:hover:bg-white transition-all shadow-xl active:scale-95 no-print"><Printer className="w-5 h-5" /> Imprimir Identificação</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MovementView: React.FC<{ type: TransactionType; products: Product[]; onTransaction: (t: Transaction) => void; user: User; }> = ({ type, products, onTransaction, user }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState<number | ''>('');
  const [origin, setOrigin] = useState<TransactionOrigin>(type === 'entry' ? 'compra' : 'venda');
  const [observation, setObservation] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [search, setSearch] = useState('');
  const [address, setAddress] = useState<ProductAddress>({ street: '', block: '', level: '', position: '' });
  const [showScanner, setShowScanner] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const handleClickOutside = (event: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(event.target as Node)) { setShowSearchDropdown(false); } }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
  const uniqueProductList = useMemo(() => { const map = new Map<string, { code: string, name: string, total: number, category: string, items: Product[] }>(); products.forEach(p => { const existing = map.get(p.code); if (existing) { existing.total += p.quantity; existing.items.push(p); } else { map.set(p.code, { code: p.code, name: p.name, total: p.quantity, category: p.category, items: [p] }); } }); return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)); }, [products]);
  const filteredUniqueProducts = useMemo(() => { if (!search) return []; return uniqueProductList.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())).slice(0, 10); }, [uniqueProductList, search]);
  const selectedProduct = products.find(p => p.id === selectedProductId);
  useEffect(() => { if (!selectedProduct) { if (type === 'entry') setAddress({ street: '', block: '', level: '', position: '' }); } else if (type === 'exit') { setAddress(selectedProduct.address); } }, [selectedProduct, type]);
  const handleScan = (code: string) => { let sku = code; const match = code.match(/SKU: ([\w\-]+)/); if (match) sku = match[1]; const product = products.find(p => p.code === sku || p.id === sku || p.ean === sku); if (product) { setSelectedProductId(product.id); setShowScanner(false); setSearch(''); } else { alert("Produto não localizado no estoque atual. Verifique o código SKU."); } };
  const handleConfirm = () => { if (!selectedProduct || qty === '') return; const transaction: Transaction = { id: Math.random().toString(36).substr(2, 9), productId: selectedProduct.id, productName: selectedProduct.name, type, quantity: Number(qty), date: new Date().toISOString(), origin, responsible: user.name, observation, address: address }; onTransaction(transaction); setShowConfirm(false); setSelectedProductId(''); setQty(''); setObservation(''); setAddress({ street: '', block: '', level: '', position: '' }); alert('Movimentação registrada com sucesso!'); };
  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <Card title={type === 'entry' ? 'Entrada de Mercadoria (Consolidado)' : 'Saída de Mercadoria (Por Endereço)'}>
        <div className="space-y-6">
          <div className="space-y-2 relative" ref={searchRef}><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Localizar por SKU ou Nome</label><div className="flex gap-2 group"><div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" /><input type="text" placeholder="Buscar por nome ou SKU..." className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" value={search} onFocus={() => setShowSearchDropdown(true)} onChange={e => { setSearch(e.target.value); setShowSearchDropdown(true); }} /></div><button onClick={() => setShowScanner(true)} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-95 shadow-sm" title="Escanear Código"><QrCode className="w-6 h-6" /></button></div>{showSearchDropdown && search && (<div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-[60] max-h-96 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in duration-200 scrollbar-thin"><div className="p-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50"><h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Resultados Consolidados</h4><Badge color="blue">{filteredUniqueProducts.length} encontrados</Badge></div>{filteredUniqueProducts.map(p => (<div key={p.code} className="border-b border-slate-50 dark:border-slate-800 last:border-0"><div className="p-4 bg-slate-50/30 dark:bg-slate-900/50 flex items-center justify-between"><div className="min-w-0 pr-4"><p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase truncate">{p.name}</p><span className="text-[9px] font-black text-blue-600 dark:text-blue-400 font-mono">#{p.code}</span></div><div className="text-right"><span className="text-xs font-black font-mono text-slate-500 dark:text-slate-400">{p.total.toFixed(1)}</span><p className="text-[7px] font-black text-slate-300 uppercase tracking-tighter">Saldo Total</p></div></div><div className="bg-white dark:bg-slate-900 px-4 py-2 flex flex-col gap-1">{type === 'entry' ? (<button onClick={() => { setSelectedProductId(p.items[0].id); setSearch(''); setShowSearchDropdown(false); }} className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"><div className="flex items-center gap-2"><Box className="w-4 h-4 text-blue-500" /><span className="text-[10px] font-black uppercase text-slate-600">Selecionar Material para Entrada</span></div><span className="text-[9px] font-black text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase">Escolher</span></button>) : (p.items.map(item => (<button key={item.id} onClick={() => { setSelectedProductId(item.id); setSearch(''); setShowSearchDropdown(false); }} className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"><AddressDisplay address={item.address} compact /><div className="flex items-center gap-4"><span className="text-[10px] font-black font-mono text-slate-700 dark:text-slate-300">{item.quantity.toFixed(1)}</span><span className="text-[9px] font-black opacity-0 group-hover:opacity-100 uppercase">Selecionar</span></div></button>)))}</div></div>))}</div>)}</div>
          {selectedProduct && (<div className="p-6 md:p-7 bg-slate-900 dark:bg-slate-950 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-2xl animate-in zoom-in duration-300 space-y-5 border border-white/5 relative overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -translate-y-10 translate-x-10"></div><div className="flex items-center justify-between relative z-10"><Badge color="blue" className="!bg-blue-600 !text-white !border-none !px-3 !py-1">{type === 'entry' ? 'SKU Identificado' : 'Item no Endereço'}</Badge><Warehouse className="w-4 h-4 opacity-40" /></div><div className="relative z-10"><h4 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight mb-2 truncate">{selectedProduct.name}</h4><p className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest">SKU: {selectedProduct.code}</p>{type === 'exit' && (<div className="mt-3 flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10"><span className="text-[10px] font-black uppercase tracking-widest:">Saldo no local:</span><span className="text-xs font-black font-mono text-blue-400">{selectedProduct.quantity.toFixed(1)} {selectedProduct.unit}</span></div>)}</div><div className="pt-2 relative z-10"><label className="text-[9px] font-black uppercase tracking-widest block mb-3 opacity-60">{type === 'entry' ? 'Definir Local de Armazenagem' : 'Endereço da Movimentação'}</label>{type === 'entry' ? (<div className="grid grid-cols-4 gap-2"><input type="text" className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-center text-blue-400 focus:bg-white/10 outline-none transition-all" value={address.street} onChange={e => setAddress({...address, street: e.target.value.toUpperCase()})} placeholder="Rua" /><input type="text" className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-center text-blue-400 focus:bg-white/10 outline-none transition-all" value={address.block} onChange={e => setAddress({...address, block: e.target.value.toUpperCase()})} placeholder="Bl" /><input type="text" className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-center text-blue-400 focus:bg-white/10 outline-none transition-all" value={address.level} onChange={e => setAddress({...address, level: e.target.value.toUpperCase()})} placeholder="Nív" /><input type="text" className="w-full p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-center text-blue-400 focus:bg-white/10 outline-none transition-all" value={address.position} onChange={e => setAddress({...address, position: e.target.value.toUpperCase()})} placeholder="Pos" /></div>) : (<div className="scale-110 origin-left"><AddressDisplay address={address} /></div>)}</div></div>)}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Quantidade ({selectedProduct?.unit.toUpperCase() || '?'})</label><input type="number" step="0.1" min="0.1" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xl text-slate-800 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" value={qty} onChange={e => setQty(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0.0" /></div><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Motivação</label><select className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xs text-slate-800 dark:text-slate-200 uppercase tracking-widest appearance-none cursor-pointer focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" value={origin} onChange={e => setOrigin(e.target.value as TransactionOrigin)}>{type === 'entry' ? (<><option value="compra">📦 Compra</option><option value="devolucao">↩️ Devolução</option><option value="transferencia">🔄 Transferência</option></>) : (<><option value="venda">💰 Venda</option><option value="consumo">✂️ Consumo</option><option value="transferencia">🔄 Transferência</option></>)}</select></div></div>
          <button disabled={!selectedProductId || qty === '' || (type === 'entry' && (!address.street || !address.block))} onClick={() => setShowConfirm(true)} className={`w-full py-4 md:py-5 rounded-[1.5rem] font-black shadow-2xl transition-all flex items-center justify-center gap-3 md:gap-4 uppercase text-[10px] md:text-xs tracking-widest active:scale-95 ${(!selectedProductId || qty === '' || (type === 'entry' && (!address.street || !address.block))) ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed shadow-none' : type === 'entry' ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/20'}`}>{type === 'entry' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />} Validar Movimentação</button>
        </div>
      </Card>
      {showScanner && (<Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />)}
      {showConfirm && selectedProduct && (<ConfirmationStep title="Autenticar Registro" onCancel={() => setShowConfirm(false)} onConfirm={handleConfirm} icon={type === 'entry' ? <ArrowUpRight className="w-12 h-12 text-emerald-600" /> : <ArrowDownLeft className="w-12 h-12 text-rose-600" />} data={[{ label: "Produto", value: selectedProduct.name }, { label: "Operação", value: type === 'entry' ? "ENTRADA (+)" : "SAÍDA (-)" }, { label: "Quantidade", value: `${qty} ${selectedProduct.unit.toUpperCase()}` }, { label: "Local", value: `R${address.street} B${address.block} N${address.level} P${address.position}` }, { label: "Motivo", value: origin.toUpperCase() }]} />)}
    </div>
  );
};

const TransferView: React.FC<{ products: Product[]; onTransfer: (sourceId: string, qty: number, targetAddress: ProductAddress) => void; user: User; }> = ({ products, onTransfer, user }) => {
  const [search, setSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState<number | ''>('');
  const [targetAddress, setTargetAddress] = useState<ProductAddress>({ street: '', block: '', level: '', position: '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const handleClickOutside = (event: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(event.target as Node)) { setShowSearchDropdown(false); } }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
  const selectedProduct = products.find(p => p.id === selectedProductId);
  const consolidatedForSelection = useMemo(() => { const map = new Map<string, { code: string, name: string, total: number, category: string, items: Product[] }>(); products.forEach(p => { const existing = map.get(p.code); if (existing) { existing.total += p.quantity; existing.items.push(p); } else { map.set(p.code, { code: p.code, name: p.name, total: p.quantity, category: p.category, items: [p] }); } }); let list = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)); if (search) { const term = search.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)); } return list; }, [products, search]);
  const handleScan = (code: string) => { let sku = code; const match = code.match(/SKU: ([\w\-]+)/); if (match) sku = match[1]; const p = products.find(prod => prod.code === sku || p.id === sku || p.ean === sku); if (p) { setSelectedProductId(p.id); setShowScanner(false); setSearch(''); } else { alert("Produto não localizado no estoque atual. Verifique o código SKU."); } };
  const handleConfirmTransfer = () => { if (!selectedProduct || qty === '') return; onTransfer(selectedProduct.id, Number(qty), targetAddress); setShowConfirm(false); setSelectedProductId(''); setQty(''); setTargetAddress({ street: '', block: '', level: '', position: '' }); alert('Transferência concluída com sucesso!'); };
  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-16">
      <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"><div className="flex items-center gap-4 md:gap-6"><div className="p-4 md:p-5 bg-blue-600 text-white rounded-[1.5rem] md:rounded-[2rem] shadow-2xl shadow-blue-200 rotate-3 transition-transform"><ArrowRightLeft className="w-8 h-8 md:w-10 md:h-10" /></div><div><h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">LogiMap Transfer</h2><p className="text-[10px] md:text-xs font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.3em] mt-1.5">Re-endereçamento de Carga</p></div></div><div className="hidden lg:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div><p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Mova o saldo de uma posição para outra instantaneamente.</p></div></div>
      <Card title="1. Localização e Origem (Pesquisar Material)">
        <div className="space-y-6">
          <div className="flex gap-3 group relative" ref={searchRef}><div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" /><input type="text" placeholder="Busque por SKU ou Nome para selecionar a origem..." className="w-full pl-12 pr-4 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-[1.5rem] font-bold text-sm text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm" value={search} onFocus={() => setShowSearchDropdown(true)} onChange={e => { setSearch(e.target.value); setShowSearchDropdown(true); }} /></div><button onClick={() => setShowScanner(true)} className="p-5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 rounded-[1.5rem] shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95 transition-all"><ScanLine className="w-6 h-6" /></button>{showSearchDropdown && search && (<div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-[60] max-h-96 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in duration-200 scrollbar-thin"><div className="p-4 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50"><h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Selecione o Item de Origem</h4><Badge color="blue">{consolidatedForSelection.length} encontrados</Badge></div>{consolidatedForSelection.map(p => (<div key={p.code} className="border-b border-slate-50 dark:border-slate-800 last:border-0"><div className="p-4 bg-slate-50/30 dark:bg-slate-900/50"><div className="flex justify-between items-center mb-2"><div className="min-w-0 pr-4"><p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase truncate">{p.name}</p><span className="text-[9px] font-black text-blue-600 dark:text-blue-400 font-mono">#{p.code}</span></div><Badge color="blue" className="shrink-0">TOTAL: {p.total.toFixed(1)}</Badge></div><div className="grid grid-cols-1 gap-1">{p.items.map(item => (<div key={item.id} onClick={() => { setSelectedProductId(item.id); setSearch(''); setShowSearchDropdown(false); }} className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-700 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-all text-left group cursor-pointer"><AddressDisplay address={item.address} compact /><div className="flex items-center gap-4"><span className="text-[10px] font-black font-mono text-slate-600 group-hover:text-white">{item.quantity.toFixed(1)}</span><span className="text-[9px] font-black opacity-0 group-hover:opacity-100 uppercase">Escolher</span></div></div>))}</div></div></div>))}</div>)}</div>
          {!selectedProduct && (<div className="py-10 text-center opacity-30 flex flex-col items-center gap-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl"><Search className="w-10 h-10 text-slate-300" /><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pesquise o produto acima para iniciar a transferência</p></div>)}
        </div>
      </Card>
      {selectedProduct && (<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 animate-in slide-in-from-top-10 duration-500"><div className="lg:col-span-5 space-y-6"><div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] md:rounded-[3.5rem] p-8 text-white shadow-2xl flex flex-col justify-between border border-white/5 relative overflow-hidden group"><div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 blur-[80px] rounded-full -translate-y-20 translate-x-20"></div><div className="relative z-10"><div className="flex justify-between items-start mb-10"><Badge color="blue" className="!bg-blue-600 !text-white !border-none !px-4 !py-1.5 shadow-lg">MOVIMENTAR DE:</Badge><Warehouse className="w-6 h-6 text-slate-600" /></div><h4 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight mb-2 group-hover:text-blue-400 transition-colors">{selectedProduct.name}</h4><p className="text-[11px] font-black text-slate-500 uppercase tracking-widest font-mono mb-8">SKU: {selectedProduct.code}</p><div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 space-y-5"><div className="flex justify-between items-center pb-4 border-b border-white/10"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Local Atual</span><div className="scale-110"><AddressDisplay address={selectedProduct.address} compact /></div></div><div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo no local</span><span className="text-2xl font-black font-mono text-blue-500">{selectedProduct.quantity.toFixed(1)} <span className="text-sm font-bold text-white/40">{selectedProduct.unit}</span></span></div></div></div><div className="mt-12 space-y-3"><label className="text-[10px] font-black text-slate-500 uppercase px-1 tracking-widest">Volume da Transferência ({selectedProduct.unit.toUpperCase()})</label><div className="relative"><input type="number" step="0.1" max={selectedProduct.quantity} className="w-full p-5 bg-white/10 border-2 border-white/10 rounded-[1.5rem] font-black text-3xl text-blue-400 outline-none focus:bg-white/20 focus:border-blue-500 transition-all text-center shadow-inner" placeholder="0.0" value={qty} onChange={e => setQty(e.target.value === '' ? '' : Number(e.target.value))} />{qty !== '' && (<button onClick={() => setQty(selectedProduct.quantity)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">TOTAL</button>)}</div></div></div></div><div className="hidden lg:flex lg:col-span-1 items-center justify-center"><div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full shadow-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400"><ArrowRightLeft className="w-8 h-8 animate-pulse" /></div></div><div className="lg:col-span-6 space-y-6"><div className="bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] p-8 border-2 border-slate-100 dark:border-slate-800 shadow-inner flex flex-col min-h-full"><div className="flex justify-between items-start mb-10"><Badge color="slate" className="!px-4 !py-1.5 border-slate-200 dark:border-slate-700">ALOCAR EM:</Badge><MapPinned className="w-6 h-6 text-slate-300 dark:text-slate-600" /></div><h4 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-8 px-1">Novas Coordenadas de Destino</h4><div className="space-y-6 flex-1"><div className="grid grid-cols-2 gap-4 md:gap-6"><div className="space-y-3"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase px-1 tracking-widest">Rua</label><input type="text" className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-[1.5rem] font-black text-xl text-center text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm" value={targetAddress.street} onChange={e => setTargetAddress({...targetAddress, street: e.target.value.toUpperCase()})} placeholder="Rua" /></div><div className="space-y-3"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase px-1 tracking-widest">Bloco</label><input type="text" className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-[1.5rem] font-black text-xl text-center text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm" value={targetAddress.block} onChange={e => setTargetAddress({...targetAddress, block: e.target.value.toUpperCase()})} placeholder="Bl" /></div></div><div className="grid grid-cols-2 gap-4 md:gap-6"><div className="space-y-3"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase px-1 tracking-widest">Nível</label><input type="text" className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-[1.5rem] font-black text-xl text-center text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm" value={targetAddress.level} onChange={e => setTargetAddress({...targetAddress, level: e.target.value.toUpperCase()})} placeholder="Nív" /></div><div className="space-y-3"><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Posição</label><input type="text" className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-[1.5rem] font-black text-xl text-center text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm" value={targetAddress.position} onChange={e => setTargetAddress({...targetAddress, position: e.target.value.toUpperCase()})} placeholder="Pos" /></div></div></div><div className="mt-12"><button disabled={!selectedProductId || qty === '' || !targetAddress.street || !targetAddress.block || qty <= 0 || qty > selectedProduct.quantity} onClick={() => { setShowConfirm(true); }} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-600/30 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center gap-4 group">Confirmar Re-endereçamento <MoveRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></button></div></div></div></div>)}
      {showScanner && (<Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />)}
      {showConfirm && selectedProduct && (<ConfirmationStep title="Validar Re-endereçamento" onCancel={() => setShowConfirm(false)} onConfirm={handleConfirmTransfer} icon={<div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-full"><RefreshCw className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin-slow" /></div>} data={[{ label: "Material", value: selectedProduct.name }, { label: "SKU", value: selectedProduct.code }, { label: "Qtd. Transferida", value: `${qty} ${selectedProduct.unit.toUpperCase()}` }, { label: "De (Origem)", value: `R${selectedProduct.address.street} B${selectedProduct.address.block} N${selectedProduct.address.level} P${selectedProduct.address.position}` }, { label: "Para (Destino)", value: `R${targetAddress.street} B${targetAddress.block} N${targetAddress.level} P${targetAddress.position}` }, { label: "Operador", value: user.name }]} />)}
    </div>
  );
};

const ReportsView: React.FC<{ products: Product[]; transactions: Transaction[]; user: User; skuTotals: Record<string, { total: number, name: string }>; initialSku?: string | null; onClearInitialSku?: () => void; }> = ({ products, transactions, user, skuTotals, initialSku, onClearInitialSku }) => {
  const [filter, setFilter] = useState('');
  const [reportType, setReportType] = useState<'all' | 'entry' | 'exit' | 'critical' | 'product_history'>('all');
  const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSku, setSelectedSku] = useState<string>('');
  
  useEffect(() => { if (initialSku) { setReportType('product_history'); setSelectedSku(initialSku); if (onClearInitialSku) onClearInitialSku(); } }, [initialSku, onClearInitialSku]);
  
  const uniqueProductList = useMemo(() => { const map = new Map<string, { code: string, name: string }>(); products.forEach(p => { if (!map.has(p.code)) map.set(p.code, { code: p.code, name: p.name }); }); return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)); }, [products]);
  
  const filteredTransactions = useMemo(() => { return transactions.filter(t => { const transDate = t.date.split('T')[0]; const matchPeriod = reportType === 'product_history' ? true : (transDate >= startDate && transDate <= endDate); let matchType = true; if (reportType === 'product_history') { const prod = products.find(p => p.id === t.productId || p.code === t.productId); matchType = prod?.code === selectedSku; } else { matchType = reportType === 'all' || t.type === reportType; } const matchSearch = t.productName.toLowerCase().includes(filter.toLowerCase()) || t.responsible.toLowerCase().includes(filter.toLowerCase()); return matchPeriod && matchType && matchSearch; }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); }, [transactions, reportType, filter, startDate, endDate, selectedSku, products]);

  // KPIs de Relatório
  const reportStats = useMemo(() => {
    let entries = 0;
    let exits = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'entry') entries += t.quantity;
      if (t.type === 'exit') exits += t.quantity;
    });
    return { entries, exits };
  }, [filteredTransactions]);

  const criticalItems = useMemo(() => {
     const list: Product[] = [];
     const skus = Object.keys(skuTotals);
     skus.forEach(sku => {
        const total = skuTotals[sku].total;
        const prodBase = products.find(p => p.code === sku);
        if (prodBase && total <= prodBase.minQuantity) {
           products.filter(p => p.code === sku).forEach(p => list.push(p));
        }
     });
     return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [products, skuTotals]);
  
  const handleCSVExport = () => { let headers = ['Data', 'Operação', 'SKU', 'Produto', 'Quantidade', 'Responsável', 'Origem']; let rows = filteredTransactions.map(t => [new Date(t.date).toLocaleDateString('pt-BR'), t.type === 'entry' ? 'ENTRADA (+)' : 'SAÍDA (-)', products.find(p => p.id === t.productId)?.code || 'S/SKU', t.productName, t.quantity.toFixed(1), t.responsible, t.origin]); const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(';')).join('\n'); const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.setAttribute('href', url); link.setAttribute('download', `relatorio_logimap_360_${reportType}_${new Date().toISOString().split('T')[0]}.csv`); link.click(); };

  const handleWhatsAppExport = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    let message = `📦 *RELATÓRIO SANTA FÉ*\n`;
    message += `📝 *TIPO:* ${reportType === 'critical' ? 'ESTOQUE CRÍTICO' : 'MOVIMENTAÇÃO'}\n`;
    message += `📅 *DATA:* ${dateStr} às ${timeStr}\n`;
    message += `👤 *RESP:* ${user.name}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (reportType === 'critical') {
      message += `⚠️ *ITENS COM SALDO CRÍTICO:* (${criticalItems.length})\n\n`;
      criticalItems.forEach(item => {
        message += `🔹 *${item.name}*\n`;
        message += `   ├ 🔖 SKU: ${item.code}\n`;
        message += `   ├ 📍 LOCAL: R:${item.address.street} B:${item.address.block} N:${item.address.level} P:${item.address.position}\n`;
        message += `   └ 📉 SALDO: *${item.quantity}* (Mín: ${item.minQuantity})\n\n`;
      });
    } else {
      message += `📊 *RESUMO DO PERÍODO:*\n`;
      message += `📈 Entradas: ${reportStats.entries.toFixed(1)}\n`;
      message += `📉 Saídas: ${reportStats.exits.toFixed(1)}\n\n`;
      message += `📋 *ÚLTIMAS TRANSAÇÕES:* (${Math.min(filteredTransactions.length, 10)})\n\n`;
      filteredTransactions.slice(0, 10).forEach(t => {
        message += `${t.type === 'entry' ? '✅' : '❌'} *${t.productName}*\n`;
        message += `   └ Qtd: ${t.quantity} | Motivo: ${t.origin.toUpperCase()}\n`;
      });
    }

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `_Sistema de Gestão Santa Fé_`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };
  
  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-16">
      
      {/* Indicadores Estratégicos de Relatório */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
        <Card className="!bg-emerald-50 dark:!bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><ArrowUpRight className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Total Entradas (Período)</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">{reportStats.entries.toFixed(1)}</h4>
            </div>
          </div>
        </Card>
        <Card className="!bg-rose-50 dark:!bg-rose-900/10 border-rose-100 dark:border-rose-800/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><ArrowDownLeft className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Total Saídas (Período)</p>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">{reportStats.exits.toFixed(1)}</h4>
            </div>
          </div>
        </Card>
        <Card className="!bg-blue-50 dark:!bg-blue-900/10 border-blue-100 dark:border-blue-800/50 hidden lg:block">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><RotateCcw className="w-6 h-6" /></div>
            <div>
              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Saldo Líquido Período</p>
              <h4 className={`text-2xl font-black ${reportStats.entries - reportStats.exits >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>{(reportStats.entries - reportStats.exits).toFixed(1)}</h4>
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-xl no-print space-y-8">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-5 flex-1 w-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl shrink-0"><BarChartIcon className="w-6 h-6 md:w-8 md:h-8" /></div>
              <div>
                <h2 className="text-xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Relatórios</h2>
                <p className="text-[8px] md:text-xs font-black text-blue-500 uppercase tracking-[0.4em] mt-1.5 md:mt-2">Módulo de Análise Estratégica</p>
              </div>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl md:rounded-[2rem] border-2 border-slate-200 dark:border-slate-700 w-full overflow-x-auto no-scrollbar gap-1.5">
              {[{ id: 'all', label: 'Visão Geral' }, { id: 'entry', label: 'Entradas' }, { id: 'exit', label: 'Saídas' }, { id: 'critical', label: 'Reposição' }, { id: 'product_history', label: 'Histórico SKU' }].map(t => (
                <button key={t.id} onClick={() => setReportType(t.id as any)} className={`flex-1 min-w-[90px] md:min-w-[120px] flex items-center justify-center px-4 py-3 md:py-4 rounded-lg md:rounded-[1.5rem] text-[9px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${reportType === t.id ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm scale-105 border border-slate-200/50 dark:border-slate-600/50' : 'text-slate-400 hover:text-slate-700'}`}>{t.label}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto xl:self-end">
            <button onClick={handleWhatsAppExport} className="flex items-center justify-center gap-2 p-3 bg-emerald-600 text-white rounded-2xl font-black text-[8px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95"><MessageCircle className="w-5 h-5" /> WhatsApp</button>
            <button onClick={handleCSVExport} className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-[8px] uppercase tracking-widest hover:border-emerald-200 transition-all"><FileSpreadsheet className="w-5 h-5 text-emerald-600" /> CSV</button>
            <button onClick={() => window.print()} className="flex items-center justify-center gap-2 p-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl font-black text-[8px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"><Printer className="w-5 h-5" /> PDF</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-8 border-t border-slate-100 dark:border-slate-800">
          {reportType === 'product_history' ? (
            <div className="md:col-span-8 space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Selecionar SKU</label>
              <select className="w-full p-4 md:p-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xs md:text-sm text-slate-900 dark:text-white uppercase outline-none focus:border-blue-500 transition-all" value={selectedSku} onChange={e => setSelectedSku(e.target.value)}>
                <option value="">--- BUSCAR POR SKU ---</option>
                {uniqueProductList.map(p => (<option key={p.code} value={p.code}>#{p.code} - {p.name}</option>))}
              </select>
            </div>
          ) : (
            <div className="md:col-span-8 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Data Início</label>
                <input type="date" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xs md:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Data Fim</label>
                <input type="date" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-black text-xs md:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
          )}
          <div className="md:col-span-4 space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Filtrar por Termo</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" placeholder="Nome, operador ou motivo..." className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-black text-[10px] md:text-sm text-slate-900 dark:text-white uppercase outline-none focus:border-blue-500" value={filter} onChange={e => setFilter(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden print-container">
        <div className="hidden md:block overflow-x-auto">
          {reportType === 'critical' ? (
            <table className="w-full text-left">
               <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Material Crítico</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">SKU</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Endereço</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Saldo Atual</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Mínimo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {criticalItems.map(item => (
                   <tr key={item.id} className="hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-colors">
                      <td className="px-8 py-5 text-xs font-black uppercase text-slate-800 dark:text-slate-200">{item.name}</td>
                      <td className="px-8 py-5 text-[10px] font-black font-mono text-blue-500">#{item.code}</td>
                      <td className="px-8 py-5"><AddressDisplay address={item.address} compact /></td>
                      <td className="px-8 py-5 text-right font-mono font-black text-rose-600">{item.quantity.toFixed(1)}</td>
                      <td className="px-8 py-5 text-right font-mono font-bold text-slate-400">{item.minQuantity}</td>
                   </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Data / Identificação</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Operação</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Localização</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Volume</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-8 py-7">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase truncate max-w-[200px]">{t.productName}</span>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-blue-500 font-mono">#{products.find(p => p.id === t.productId || p.code === t.productId)?.code || 'S/SKU'}</span>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-7"><Badge color={t.type === 'entry' ? 'green' : 'red'}>{t.type === 'entry' ? 'ENTRADA' : 'SAÍDA'}</Badge></td>
                    <td className="px-8 py-7">{t.address ? <AddressDisplay address={t.address} compact /> : '--'}</td>
                    <td className={`px-8 py-7 text-right font-mono text-lg font-black ${t.type === 'entry' ? 'text-emerald-600' : 'text-rose-600'}`}>{t.type === 'entry' ? '+' : '-'}{t.quantity.toFixed(1)}</td>
                    <td className="px-8 py-7 text-center text-[10px] font-black text-slate-500 uppercase">{t.responsible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const UsersView: React.FC<{ users: User[], onAdd: (u: User) => void, onEdit: (u: User) => void, onDelete: (id: string) => void, currentUser: User }> = ({ users, onAdd, onEdit, onDelete, currentUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', password: '', role: UserRole.OPERATOR });
  useEffect(() => { if (editingUser) { setFormData({ name: editingUser.name, password: editingUser.password || '', role: editingUser.role }); } else { setFormData({ name: '', password: '', role: UserRole.OPERATOR }); } }, [editingUser, showModal]);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editingUser) { onEdit({ ...editingUser, ...formData }); } else { onAdd({ ...formData, id: Date.now().toString() } as User); } setShowModal(false); setEditingUser(null); };
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-lg md:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Equipe Industrial</h2>
        <button onClick={() => { setEditingUser(null); setShowModal(true); }} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black shadow-xl hover:bg-blue-700 transition-all uppercase text-[10px] tracking-widest active:scale-95"><Plus className="w-4 h-4" /> Novo Acesso</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {users.map(u => (
          <Card key={u.id} className="relative transition-all hover:shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-white dark:border-slate-700 shadow-xl overflow-hidden shrink-0">
                <img src={`https://ui-avatars.com/api/?name=${u.name}&background=f8fafc&color=2563eb&bold=true&size=128`} alt={u.name} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs md:text-sm font-black text-slate-800 dark:text-slate-200 uppercase truncate">{u.name}</h4>
                <Badge color={u.role === UserRole.ADMIN ? 'blue' : 'slate'} className="!text-[8px]">{u.role}</Badge>
              </div>
              <div className="flex items-center gap-1">
                {currentUser.role === UserRole.ADMIN && (<button onClick={() => { setEditingUser(u); setShowModal(true); }} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 active:scale-90 transition-all" title="Editar"><Edit2 className="w-4 h-4" /></button>)}
                {currentUser.role === UserRole.ADMIN && u.id !== currentUser.id && (<button onClick={() => { if(confirm("Revogar acesso?")) onDelete(u.id); }} className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 active:scale-90 transition-all" title="Excluir"><Trash2 className="w-4 h-4" /></button>)}
              </div>
            </div>
          </Card>
        ))}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[450px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-white/10">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{editingUser ? 'Editar Acesso' : 'Novo Acesso'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Nome Completo</label>
                <input required className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Chave de Segurança</label>
                <input required type="text" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Nível de Privilégio</label>
                <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white cursor-pointer appearance-none outline-none focus:border-blue-500" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as any})}>
                  <option value={UserRole.OPERATOR}>Operador Logístico</option>
                  <option value={UserRole.ADMIN}>Administrador Master</option>
                </select>
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">{editingUser ? 'Salvar Alterações' : 'Ativar Usuário'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsView: React.FC<{ products: Product[], transactions: Transaction[], users: User[], categories: string[], units: string[], onReset: () => void, onRestore: (d: any) => void }> = ({ products, transactions, users, categories, units, onReset, onRestore }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showSyncQr, setShowSyncQr] = useState(false);
  const [qrError, setQrError] = useState(false);
  
  const getSyncPayload = () => {
    const data = { products, transactions, users, categories, units, timestamp: Date.now(), v: "1.0" };
    const jsonStr = JSON.stringify(data);
    // Codifica em base64 para o QR Code ser mais compacto
    return `LOGIMAP-360-SYNC:${btoa(unescape(encodeURIComponent(jsonStr)))}`;
  };

  const payload = getSyncPayload();
  const isPayloadTooLarge = payload.length > 2500;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <Card title="Multi-Dispositivo (Cloud & Mobile)">
          <div className="space-y-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Sincronize instantaneamente todos os dados entre seu computador e celular via Supabase Cloud.</p>
            <button onClick={() => { setQrError(false); setShowSyncQr(true); }} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all tracking-widest group"><Smartphone className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Gerar Token de Sincronia</button>
            <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800"><Wifi className="w-4 h-4 text-indigo-500" /><p className="text-[9px] font-black uppercase text-indigo-700 dark:text-indigo-400 tracking-widest">Supabase Cloud Ativo</p></div>
          </div>
        </Card>
        <Card title="Backup Manual">
          <div className="space-y-4">
            <button onClick={() => { const blob = new Blob([JSON.stringify({products, transactions, users, categories, units})], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `backup_logimap_360_${new Date().toISOString().split('T')[0]}.json`; a.click(); }} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all tracking-widest"><Download className="w-4 h-4" /> Exportar JSON</button>
            <button onClick={() => fileRef.current?.click()} className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 tracking-widest"><Upload className="w-4 h-4" /> Importar JSON</button>
            <input type="file" className="hidden" ref={fileRef} onChange={(e) => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onload=(ev) => { try{ const d = JSON.parse(ev.target?.result as string); onRestore(d); } catch(err){ alert('Erro no arquivo.'); }}; r.readAsText(f); }}} />
          </div>
        </Card>
      </div>
      <Card title="Segurança & Auditoria de Dados">
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{ label: "Produtos", val: products.length }, { label: "Transações", val: transactions.length }, { label: "Operadores", val: users.length }, { label: "Categorias", val: categories.length }].map((stat, i) => (<div key={stat.label} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-center group hover:bg-white dark:hover:bg-slate-900 transition-all shadow-sm"><p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 group-hover:text-blue-500">{stat.label}</p><h5 className="text-xl font-black text-slate-800 dark:text-slate-100">{stat.val}</h5></div>))}
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button onClick={() => { if(confirm('ALERTA: Resetar sistema apagará todos os dados de estoque e histórico. Deseja prosseguir?')) onReset(); }} className="px-8 py-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-xl font-black uppercase text-[10px] flex items-center gap-3 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all active:scale-95 tracking-widest"><Trash className="w-4 h-4" /> Resetar Banco Industrial</button>
          </div>
        </div>
      </Card>
      {showSyncQr && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[500px] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-white/20">
             <div className="p-10 text-center space-y-8">
               <div className="flex justify-between items-center mb-4">
                 <div className="text-left">
                   <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white">Sincronização Ativa</h2>
                   <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">Industrial Sync Gateway</p>
                 </div>
                 <button onClick={() => setShowSyncQr(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
               </div>
               
               <div className="bg-white p-8 rounded-[3rem] border-4 border-indigo-50 shadow-inner flex flex-col items-center gap-4 overflow-hidden">
                 {isPayloadTooLarge ? (
                    <div className="py-10 text-center space-y-4">
                       <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
                       <p className="text-[10px] font-black uppercase text-slate-700 leading-relaxed">Banco de dados muito extenso para QR Code ({Math.round(payload.length/1024)}KB).</p>
                       <p className="text-[8px] font-bold text-slate-400 uppercase italic">Por favor, utilize a função de Backup Manual (JSON) para transferir entre dispositivos.</p>
                    </div>
                 ) : (
                    <>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(payload)}&margin=10&format=png&ecc=L`} 
                        alt="QR Code Sincronização" 
                        className="w-full max-w-[280px]" 
                        onError={() => setQrError(true)}
                      />
                      {qrError && <p className="text-rose-500 text-[10px] font-black uppercase">Erro ao gerar imagem. Tente novamente.</p>}
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic leading-relaxed">Aponte a câmera do dispositivo móvel para importar os dados deste terminal.</p>
                    </>
                 )}
               </div>
               <button onClick={() => setShowSyncQr(false)} className="w-full py-5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Fechar Sincronia</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Improved Industrial Rack Mapping Components ---

const MappingView: React.FC<{ products: Product[]; skuTotals: Record<string, { total: number, name: string }> }> = ({ products, skuTotals }) => {
  const streets = ['8-A', '8-B', '9-A', '9-B'];
  const [selectedStreet, setSelectedStreet] = useState(streets[0]);
  const [mapSearch, setMapSearch] = useState('');
  const [is3D, setIs3D] = useState(false); 
  
  const streetData = useMemo(() => {
    return products.filter(p => p.address.street === selectedStreet);
  }, [products, selectedStreet]);

  const blocks = useMemo(() => {
    const b = new Set<string>();
    for(let i=1; i<=11; i++) b.add(i.toString().padStart(2, '0'));
    return Array.from(b).sort();
  }, []);

  const levels = ['05', '04', '03', '02', '01'];

  return (
    <div className="space-y-10 relative">
      <div className="flex flex-col xl:flex-row gap-6 items-center justify-between z-10 relative">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {streets.map(s => (
            <button 
              key={s} 
              onClick={() => setSelectedStreet(s)}
              className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all border-b-4 ${selectedStreet === s 
                ? 'bg-blue-600 text-white border-blue-800 shadow-xl scale-105' 
                : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
            >
              Corredor {s}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <div className="relative flex-1 md:max-w-md group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Localizar Material no Mapa..." 
              className="w-full pl-14 pr-6 py-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[1.5rem] text-[11px] font-black uppercase outline-none focus:border-blue-500 shadow-sm transition-all"
              value={mapSearch}
              onChange={e => setMapSearch(e.target.value)}
            />
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800">
            <button onClick={() => setIs3D(false)} className={`px-4 py-3 rounded-xl transition-all ${!is3D ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md scale-105' : 'text-slate-400'}`} title="Planta Baixa (2D)"><LayoutGrid className="w-5 h-5" /></button>
            <button onClick={() => setIs3D(true)} className={`px-4 py-3 rounded-xl transition-all ${is3D ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md scale-105' : 'text-slate-400'}`} title="Visão Isométrica (3D)"><Cuboid className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className={`
        relative w-full transition-all duration-700 
        ${is3D ? 'h-[800px] overflow-hidden' : 'h-auto'}
      `}>
        <div 
          className={`transition-transform duration-700 ease-out ${is3D ? 'preserve-3d' : ''}`}
          style={is3D ? {
            transform: `perspective(1500px) rotateX(45deg) rotateY(-5deg) rotateZ(-15deg)`,
            transformStyle: 'preserve-3d',
            paddingTop: '50px'
          } : {}}
        >
          <div className={`
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-8 pb-20
            ${is3D ? 'min-w-[1500px]' : ''}
          `}>
            {blocks.map(block => (
              <div 
                key={block} 
                className={`flex flex-col bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-4 transition-all hover:border-blue-300 dark:hover:border-blue-800 shadow-sm hover:shadow-xl group/block`}
              >
                <div className="flex items-center justify-between mb-6 px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span className="text-[12px] font-black uppercase text-slate-800 dark:text-white tracking-widest">Bloco {block}</span>
                   </div>
                   <Badge color="slate" className="!bg-slate-100 !text-slate-500">RU {selectedStreet}</Badge>
                </div>
                
                <div className="flex flex-col gap-3 relative">
                  {levels.map(level => {
                    const itemsAtPos = streetData.filter(p => p.address.block === block && p.address.level === level);
                    const totalQtyAtPos = itemsAtPos.reduce((acc, i) => acc + i.quantity, 0);
                    const isCriticalAtPos = itemsAtPos.some(i => i.quantity <= (i.minQuantity || 98));
                    const isHighlighted = mapSearch.length >= 2 && itemsAtPos.some(i => 
                      i.code.toLowerCase().includes(mapSearch.toLowerCase()) || 
                      i.name.toLowerCase().includes(mapSearch.toLowerCase())
                    );
                    
                    return (
                      <div 
                        key={level} 
                        className={`
                          group/level relative h-24 w-full rounded-2xl border-2 transition-all duration-300 
                          ${itemsAtPos.length > 0 
                            ? isHighlighted 
                              ? 'bg-amber-400 border-amber-600 shadow-[0_0_30px_rgba(251,191,36,0.6)] scale-105 z-40'
                              : isCriticalAtPos 
                                ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 shadow-md' 
                                : 'bg-white dark:bg-slate-800 border-white dark:border-slate-700 shadow-md hover:border-blue-400'
                            : 'bg-slate-100 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 opacity-40 border-dashed hover:opacity-100'
                          }
                        `}
                      >
                        <div className="absolute top-2 right-3 text-[7px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">Nív {level}</div>
                        
                        {itemsAtPos.length > 0 ? (
                          <div className="flex flex-col items-center justify-center h-full p-3 gap-1">
                             <div className="flex items-center gap-2">
                                <span className={`text-xl font-black font-mono tracking-tighter ${isHighlighted ? 'text-slate-900' : isCriticalAtPos ? 'text-rose-600' : 'text-blue-600'}`}>
                                  {totalQtyAtPos.toFixed(0)}
                                </span>
                                <span className={`text-[8px] font-black uppercase ${isHighlighted ? 'text-slate-700' : 'text-slate-400'}`}>Volume</span>
                             </div>
                             <div className="flex flex-wrap justify-center gap-1 max-w-[80%]">
                                {itemsAtPos.map((_, i) => (
                                   <div key={i} className={`w-1.5 h-1.5 rounded-full ${isHighlighted ? 'bg-slate-900' : isCriticalAtPos ? 'bg-rose-400' : 'bg-blue-400/50'}`}></div>
                                ))}
                             </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Plus className="w-4 h-4 text-slate-200 dark:text-slate-800 group-hover/level:text-blue-400 transition-colors" />
                          </div>
                        )}

                        <div className="
                          absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-72 
                          bg-slate-900 dark:bg-black text-white p-5 rounded-[2rem] text-[10px] 
                          opacity-0 group-hover/level:opacity-100 pointer-events-none transition-all z-[100] 
                          shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 transform scale-95 translate-y-2 group-hover/level:translate-y-0 group-hover/level:scale-100
                        ">
                          {itemsAtPos.length > 0 ? (
                            <div className="space-y-4">
                               <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center"><Box className="w-4 h-4 text-white" /></div>
                                    <div className="flex flex-col">
                                       <span className="text-white font-black uppercase tracking-widest text-[9px]">{selectedStreet} B{block} N{level}</span>
                                       <span className="text-slate-500 text-[8px] font-bold uppercase">Endereço Ativo</span>
                                    </div>
                                 </div>
                                 <Badge color="blue" className="!bg-blue-600/20 !border-blue-600/30 !text-blue-400">POSIÇÃO OCUPADA</Badge>
                               </div>
                               
                               <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                                 {itemsAtPos.map(i => (
                                   <div key={i.id} className="p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                     <div className="flex justify-between items-start mb-1">
                                        <p className="text-white font-black uppercase leading-tight line-clamp-2 pr-2">{i.name}</p>
                                        <span className="font-mono text-blue-400 font-black text-xs shrink-0">{i.quantity} {i.unit}</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <span className="text-[8px] text-slate-500 font-mono tracking-widest">SKU #{i.code}</span>
                                     </div>
                                   </div>
                                 ))}
                               </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                               <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Vaga Disponível</p>
                            </div>
                          )}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[10px] border-transparent border-t-slate-900 dark:border-t-black"></div>
                        </div>

                        {itemsAtPos.length > 0 && (
                           <div className="absolute top-0 left-0 h-full w-1 rounded-l-2xl overflow-hidden">
                              <div 
                                 className={`w-full transition-all duration-1000 ${isHighlighted ? 'bg-slate-900' : isCriticalAtPos ? 'bg-rose-500' : 'bg-blue-500'}`}
                                 style={{ height: `${Math.min(100, (totalQtyAtPos / 200) * 100)}%` }}
                              ></div>
                           </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MappingViewWithLegend: React.FC<{ products: Product[]; skuTotals: Record<string, { total: number, name: string }> }> = ({ products, skuTotals }) => (
  <div className="space-y-8 animate-in fade-in duration-500 pb-20">
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 blur-[80px] -translate-y-24 translate-x-24 rounded-full"></div>
      <div className="flex items-center gap-8 relative z-10">
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-200 dark:shadow-blue-900/40 rotate-3 transition-transform hover:rotate-0"><MapPinned className="w-10 h-10" /></div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">Mapa Logístico 360</h2>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Visão espacial integrada de racks e posições</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 justify-center md:justify-end relative z-10">
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="w-3.5 h-3.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
          <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Normal</span>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="w-3.5 h-3.5 bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Reposicão</span>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="w-3.5 h-3.5 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)]"></div>
          <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Busca</span>
        </div>
      </div>
    </div>
    
    <MappingView products={products} skuTotals={skuTotals} />
  </div>
);

// --- Main App Component ---

export const App: React.FC = () => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem(STORAGE_KEYS.THEME) === 'dark');
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => { const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER); return saved ? JSON.parse(saved) : null; });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!currentUser);
  const [reportSkuFilter, setReportSkuFilter] = useState<string | null>(null);
  const [isCloudLoading, setIsCloudLoading] = useState(true);

  // Initial Fetch from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsCloudLoading(true);
      try {
        const { data: p } = await supabase.from('products').select('*');
        const { data: t } = await supabase.from('transactions').select('*');
        const { data: u } = await supabase.from('users').select('*');
        const { data: c } = await supabase.from('categories').select('*');
        const { data: un } = await supabase.from('units').select('*');

        if (p) setProducts(p); else setProducts(INITIAL_PRODUCTS);
        if (t) setTransactions(t); else setTransactions(INITIAL_TRANSACTIONS);
        if (u) setUsers(u); else setUsers([{ id: '1', name: 'Emerson', password: '092210', role: UserRole.ADMIN }]);
        if (c) setCategories(c.map(item => item.name)); else setCategories(['10 MT', '30 MT', 'RETALHOS']);
        if (un) setUnits(un.map(item => item.name)); else setUnits(['un', 'm', 'kg']);
      } catch (error) {
        console.error("Supabase load error:", error);
      } finally {
        setIsCloudLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => { 
    localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light'); 
    if (isDark) document.documentElement.classList.add('dark'); 
    else document.documentElement.classList.remove('dark'); 
  }, [isDark]);

  useEffect(() => { 
    if (currentUser) { 
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser)); 
      setIsAuthenticated(true); 
    } else { 
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER); 
      setIsAuthenticated(false); 
    } 
  }, [currentUser]);

  const skuTotals = useMemo(() => { 
    const totals: Record<string, { total: number, name: string }> = {}; 
    products.forEach(p => { 
      if (!totals[p.code]) totals[p.code] = { total: 0, name: p.name }; 
      totals[p.code].total += p.quantity; 
    }); 
    return totals; 
  }, [products]);

  const handleAddProduct = async (p: Product) => {
    setProducts([p, ...products]);
    await supabase.from('products').insert([p]);
  };

  const handleEditProduct = async (p: Product) => {
    setProducts(products.map(prev => prev.id === p.id ? p : prev));
    await supabase.from('products').upsert(p);
  };

  const handleDeleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    await supabase.from('products').delete().eq('id', id);
  };

  const handleAddBatch = async (batch: Product[]) => {
    setProducts([...batch, ...products]);
    await supabase.from('products').insert(batch);
  };
  
  const handleRestore = async (data: any) => { 
    if (data.products) {
      setProducts(data.products);
      await supabase.from('products').upsert(data.products);
    }
    if (data.transactions) {
      setTransactions(data.transactions);
      await supabase.from('transactions').upsert(data.transactions);
    }
    alert('Sistema sincronizado com sucesso!'); 
  };

  const handleTransaction = async (t: Transaction) => { 
    setTransactions([t, ...transactions]); 
    await supabase.from('transactions').insert([t]);

    setProducts(prev => { 
      const sourceProduct = prev.find(p => p.id === t.productId || p.code === t.productId);
      if (!sourceProduct) return prev;

      const targetIdx = prev.findIndex(p => 
        p.code === sourceProduct.code && 
        p.address?.street === t.address?.street && 
        p.address?.block === t.address?.block && 
        p.address?.level === t.address?.level && 
        p.address?.position === t.address?.position
      );

      if (targetIdx !== -1) {
        const updated = [...prev];
        updated[targetIdx] = { 
          ...updated[targetIdx], 
          quantity: t.type === 'entry' ? updated[targetIdx].quantity + t.quantity : updated[targetIdx].quantity - t.quantity 
        };
        supabase.from('products').upsert(updated[targetIdx]).then();
        return updated;
      } else if (t.type === 'entry' && t.address) {
        const newRecord: Product = {
          ...sourceProduct,
          id: `${sourceProduct.code}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          quantity: t.quantity,
          address: t.address,
          createdAt: new Date().toISOString().split('T')[0]
        };
        supabase.from('products').insert([newRecord]).then();
        return [newRecord, ...prev];
      }
      return prev;
    }); 
  };

  const handleTransfer = async (sourceId: string, qty: number, targetAddress: ProductAddress) => { 
    const sourceProduct = products.find(p => p.id === sourceId); 
    if (!sourceProduct) return; 

    let newDestProduct: Product | null = null;

    setProducts(prev => { 
      let updated = prev.map(p => p.id === sourceId ? { ...p, quantity: p.quantity - qty } : p); 
      const destIdx = updated.findIndex(p => p.code === sourceProduct.code && p.address.street === targetAddress.street && p.address.block === targetAddress.block && p.address.level === targetAddress.level && p.address.position === targetAddress.position); 
      
      if (destIdx !== -1) { 
        updated[destIdx] = { ...updated[destIdx], quantity: updated[destIdx].quantity + qty }; 
        supabase.from('products').upsert(updated[destIdx]).then();
      } else { 
        newDestProduct = { ...sourceProduct, id: `${sourceProduct.code}-${Date.now()}-dest`, quantity: qty, address: targetAddress, createdAt: new Date().toISOString().split('T')[0] }; 
        updated = [newDestProduct, ...updated]; 
        supabase.from('products').insert([newDestProduct]).then();
      } 
      
      const sourceUpdate = updated.find(u => u.id === sourceId);
      if (sourceUpdate) supabase.from('products').upsert(sourceUpdate).then();

      return updated.filter(p => p.quantity > 0 || p.address.street === 'PENDENTE'); 
    }); 

    const trans: Transaction = { 
      id: Math.random().toString(36).substr(2, 9), 
      productId: sourceId, 
      productName: sourceProduct.name, 
      type: 'exit', 
      quantity: qty, 
      date: new Date().toISOString(), 
      origin: 'transferencia', 
      responsible: currentUser?.name || 'Sistema', 
      observation: `Para R${targetAddress.street} B${targetAddress.block}`, 
      address: sourceProduct.address 
    };
    setTransactions([trans, ...transactions]); 
    await supabase.from('transactions').insert([trans]);
  };

  const handleReset = async () => { 
    setProducts(INITIAL_PRODUCTS); 
    setTransactions(INITIAL_TRANSACTIONS); 
    await supabase.from('products').delete().neq('id', '0');
    await supabase.from('transactions').delete().neq('id', '0');
    alert('Banco de dados restaurado ao padrão de fábrica.'); 
  };

  if (!isAuthenticated || !currentUser) return <LoginView users={users} onLogin={setCurrentUser} />;
  const navItems = NAVIGATION_ITEMS.filter(item => item.roles.includes(currentUser.role));

  return (
    <div className={`min-h-screen flex ${isDark ? 'dark bg-slate-950' : 'bg-slate-50'} transition-colors duration-300`}>
      {sidebarOpen && window.innerWidth <= 1024 && (<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70]" onClick={() => setSidebarOpen(false)}></div>)}
      <aside className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-[80] transition-all duration-300 ease-in-out transform ${sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden h-screen`}>
        <div className="h-full flex flex-col w-72">
          <div className="p-6 flex items-center h-20 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0"><Package className="w-6 h-6" /></div>
              <div className={`transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
                <h1 className="text-lg font-black text-slate-800 dark:text-white tracking-tighter uppercase whitespace-nowrap">LogiMap 360</h1>
                <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest whitespace-nowrap">Inteligência Logística</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
            {navItems.map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); if(window.innerWidth <= 1024) setSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${activeTab === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                <div className={`w-6 h-6 flex items-center justify-center shrink-0 transition-transform duration-500 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</div>
                <span className={`text-[11px] font-black uppercase tracking-widest transition-opacity duration-300 whitespace-nowrap ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none lg:hidden'}`}>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2 shrink-0">
            <button onClick={() => setIsDark(!isDark)} className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <div className="w-6 h-6 flex items-center justify-center shrink-0">{isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</div>
              <span className={`text-[11px] font-black uppercase tracking-widest transition-opacity duration-300 whitespace-nowrap ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
            </button>
            <button onClick={() => setCurrentUser(null)} className="w-full flex items-center gap-4 p-4 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
              <div className="w-6 h-6 flex items-center justify-center shrink-0"><LogOut className="w-5 h-5" /></div>
              <span className={`text-[11px] font-black uppercase tracking-widest transition-opacity duration-300 whitespace-nowrap ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>Sair</span>
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col relative min-h-screen">
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-40 sticky top-0 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all active:scale-95 shadow-sm border border-slate-200 dark:border-slate-700" title="Alternar Menu"><Menu className="w-6 h-6" /></button>
            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest ml-2 hidden sm:block">{navItems.find(i => i.id === activeTab)?.label}</h2>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 hidden sm:flex">
              <div className={`w-1.5 h-1.5 rounded-full ${isCloudLoading ? 'bg-amber-500 animate-spin' : 'bg-emerald-500'} shadow-[0_0_5px_rgba(16,185,129,0.5)]`}></div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{isCloudLoading ? 'Sincronizando...' : 'Nuvem Conectada'}</span>
            </div>
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tighter">{currentUser.name}</span>
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{currentUser.role === UserRole.ADMIN ? 'Administrador' : 'Operador'}</span>
            </div>
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0"><UserIcon className="w-5 h-5" /></div>
          </div>
        </header>
        <div className="p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950/50 flex-1 h-auto">
          {isCloudLoading && products.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-6 py-20">
               <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
               <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Carregando Banco Santa Fé...</p>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {activeTab === 'dashboard' && <DashboardView products={products} transactions={transactions} skuTotals={skuTotals} />}
              {activeTab === 'catalog' && <CatalogView products={products} categories={categories} units={units} onAdd={handleAddProduct} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onAddCategory={c => setCategories([...categories, c])} onAddUnit={u => setUnits([...units, u])} onAddBatch={handleAddBatch} user={currentUser} />}
              {activeTab === 'inventory' && <InventoryView products={products} categories={categories} units={units} onAdd={handleAddProduct} onEdit={handleEditProduct} onDelete={handleDeleteProduct} onAddBatch={handleAddBatch} onViewMovements={s => { setReportSkuFilter(s); setActiveTab('reports'); }} user={currentUser} skuTotals={skuTotals} transactions={transactions} />}
              {activeTab === 'entry' && <MovementView type="entry" products={products} onTransaction={handleTransaction} user={currentUser} />}
              {activeTab === 'exit' && <MovementView type="exit" products={products} onTransaction={handleTransaction} user={currentUser} />}
              {activeTab === 'transfer' && <TransferView products={products} onTransfer={handleTransfer} user={currentUser} />}
              {activeTab === 'mapping' && <MappingViewWithLegend products={products} skuTotals={skuTotals} />}
              {activeTab === 'reports' && <ReportsView products={products} transactions={transactions} user={currentUser} skuTotals={skuTotals} initialSku={reportSkuFilter} onClearInitialSku={() => setReportSkuFilter(null)} />}
              {activeTab === 'users' && <UsersView users={users} onAdd={u => setUsers([...users, u])} onEdit={u => setUsers(users.map(user => user.id === u.id ? u : user))} onDelete={id => setUsers(users.filter(u => u.id !== id))} currentUser={currentUser} />}
              {activeTab === 'settings' && <SettingsView products={products} transactions={transactions} users={users} categories={categories} units={units} onReset={handleReset} onRestore={handleRestore} />}
              {activeTab === 'tutorial' && <TutorialView />}
            </div>
          )}
        </div>
        <footer className="px-6 py-10 border-t border-slate-200 dark:border-slate-800 text-center no-print bg-white/30 dark:bg-slate-900/30">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">© LogiMap 360 – Todos os direitos reservados</p>
          <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest mt-1">Sistema Inteligente de Mapeamento e Controle de Estoque</p>
        </footer>
      </main>
      <WhatsAppButton />
    </div>
  );
};
