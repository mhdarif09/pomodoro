// File: resources/js/Pages/Pomodoro/components/AIAssistantPanel.jsx
// VERSI FINAL — dengan toggle Mode (Chat, Reviewer, Writer), Upload PDF/XLSX/CSV, Preview interaktif,
// Hapus Percakapan, dan Pencarian Web

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import * as XLSX from 'xlsx';
import {
  SparklesIcon, XMarkIcon, PaperAirplaneIcon, ArrowsPointingOutIcon,
  ComputerDesktopIcon, DocumentArrowUpIcon, AcademicCapIcon, ClipboardDocumentListIcon, GlobeAltIcon
} from '@heroicons/react/24/solid';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const sizeOptions = {
  default: 'sm:max-w-md',
  wide: 'sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl'
};

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

// Markdown rendering helper removed in favor of <Markdown> component
const sanitizeHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
};

const LoadingBubble = () => (
  <div className="flex items-center space-x-1.5">
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
  </div>
);


const EmptyState = ({ onAttachmentClick }) => (
  <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400 p-8">
    <SparklesIcon className="h-16 w-16 mb-4 text-slate-400 dark:text-slate-500" />
    <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-300">Asisten Riset Cerdas</h3>
    <p className="text-sm mt-1 max-w-xs">Tanya apa saja, aktifkan mode Reviewer atau Writer untuk kebutuhan akademik.</p>
    <button
      onClick={onAttachmentClick}
      className="mt-6 flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg shadow-lg shadow-teal-500/30 transition-all">
      <DocumentArrowUpIcon className="h-5 w-5" />
      Unggah Dokumen (PDF/Excel/CSV)
    </button>
  </div>
);

export default function AIAssistantPanel({ isOpen, onClose, isPremium, onUpgrade }) {
  const [aiQuery, setAiQuery] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState(() => JSON.parse(sessionStorage.getItem('aiChatHistory') || '[]'));
  const [size, setSize] = useState('default');
  const [mode, setMode] = useState('chat'); // Mode: chat / reviewer / writer
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false);

  // file states
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [tableHtml, setTableHtml] = useState(null);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem('aiChatHistory', JSON.stringify(aiChatHistory));
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatHistory]);

  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const addMessageToHistory = (message) => {
    setAiChatHistory(prev => [...prev, message]);
  };

  const handleClearChat = () => {
    setAiChatHistory([]);
    sessionStorage.removeItem('aiChatHistory');
  };

  const handleAttachmentClick = () => {
    if (!isPremium) { onUpgrade(); return; }
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);

    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'pdf') {
      const newUrl = URL.createObjectURL(file);
      setUploadedFile(file);
      setFilePreviewUrl(newUrl);
      setFileType('pdf');
      setTableHtml(null);
      addMessageToHistory({ role: 'system', content: `✅ PDF "${file.name}" dimuat.` });
      setSize('wide');
    } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = new Uint8Array(ev.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const html = XLSX.utils.sheet_to_html(sheet);
        setUploadedFile(file);
        setFileType('excel');
        setTableHtml(html);
        addMessageToHistory({ role: 'system', content: `📊 File "${file.name}" dimuat.` });
        setSize('wide');
      };
      reader.readAsArrayBuffer(file);
    } else {
      addMessageToHistory({ role: 'assistant', content: '❌ Format tidak didukung. Pilih PDF, XLSX, atau CSV.', isError: true });
    }

    e.target.value = null;
  };

  const handleRemoveFile = () => {
    if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    setUploadedFile(null);
    setFilePreviewUrl(null);
    setFileType(null);
    setTableHtml(null);
    setSize('default');
    addMessageToHistory({ role: 'system', content: `📄 Sesi dokumen ditutup.` });
  };

  const handleAIQuery = async () => {
    if (!aiQuery.trim() || isLoadingAI) return;

    const currentQuery = aiQuery;
    const previousHistory = aiChatHistory; // Capture history for context

    addMessageToHistory({ role: 'user', content: currentQuery });
    setAiQuery('');
    setIsLoadingAI(true);
    addMessageToHistory({ role: 'assistant', content: '', isLoading: true });

    const updateLastMessage = (newMessage) => {
      setAiChatHistory(prev => {
        const historyWithoutLoader = prev.filter(msg => !msg.isLoading);
        return [...historyWithoutLoader, newMessage];
      });
    };

    try {
      let response;

      if (mode === 'reviewer' && uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        response = await axios.post('/api/ask-from-paper', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (mode === 'writer') {
        response = await axios.post('/api/ask-academic-writer', {
          topic: currentQuery, section: 'umum'
        });
      } else { // Default Chat Mode
        if (uploadedFile) {
          const formData = new FormData();
          formData.append('file', uploadedFile);
          formData.append('query', currentQuery);
          const endpoint = fileType === 'pdf' ? '/api/ask-from-pdf' : '/api/ask-from-sheet'; // FIX: Endpoint name
          response = await axios.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        } else {
          response = await axios.post('/api/ask', {
            query: currentQuery,
            history: previousHistory,
            webSearch: isWebSearchEnabled,
          });
          if (isWebSearchEnabled) setIsWebSearchEnabled(false);
        }
      }

      updateLastMessage({ role: 'assistant', content: response.data.response || 'Tidak ada respons dari AI.' });
    } catch (error) {
      const errorMessage = error.response?.data?.error || '❌ Terjadi kesalahan saat memproses permintaan.';
      updateLastMessage({ role: 'assistant', content: errorMessage, isError: true });
    } finally {
      setIsLoadingAI(false);
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAIQuery(); }
  };

  const toggleSize = () => setSize(current => (current === 'default' ? 'wide' : 'default'));

  const modeLabel = {
    chat: 'Chat Mode', reviewer: 'Reviewer Mode', writer: 'Writer Mode'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/30 z-40 sm:hidden" />
          <motion.div
            className={`fixed inset-y-0 right-0 sm:top-0 sm:h-full w-full bg-slate-50 dark:bg-slate-900 shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out ${sizeOptions[size]}`}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            {/* HEADER */}
            <header className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-6 w-6 text-teal-500" />
                <span className="font-bold truncate">{modeLabel[mode]}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button onClick={() => setMode('chat')} title="Chat Mode" className={`p-2 rounded ${mode === 'chat' ? 'bg-teal-500 text-white' : 'text-slate-500 hover:bg-slate-200'}`}><SparklesIcon className="h-5 w-5" /></button>
                <button onClick={() => setMode('reviewer')} title="Reviewer Mode" className={`p-2 rounded ${mode === 'reviewer' ? 'bg-teal-500 text-white' : 'text-slate-500 hover:bg-slate-200'}`}><ClipboardDocumentListIcon className="h-5 w-5" /></button>
                <button onClick={() => setMode('writer')} title="Writer Mode" className={`p-2 rounded ${mode === 'writer' ? 'bg-teal-500 text-white' : 'text-slate-500 hover:bg-slate-200'}`}><AcademicCapIcon className="h-5 w-5" /></button>
                <div className="border-l h-6 border-slate-200 dark:border-slate-700 mx-1"></div>
                <button onClick={toggleSize} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hidden sm:inline-block" title={size === 'default' ? 'Perlebar' : 'Perkecil'}>
                  {size === 'default' ? <ArrowsPointingOutIcon className="h-5 w-5" /> : <ComputerDesktopIcon className="h-5 w-5" />}
                </button>
                <button onClick={handleClearChat} className="p-2 text-slate-500 hover:text-rose-500" title="Bersihkan Percakapan"><TrashIcon className="h-5 w-5" /></button>
                <button onClick={onClose} className="p-2 text-slate-500 hover:text-rose-500" title="Tutup"><XMarkIcon className="h-6 w-6" /></button>
              </div>
            </header>

            {/* BODY */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {uploadedFile ? (
                <PanelGroup direction={size === 'default' ? 'vertical' : 'horizontal'} className="flex-1">
                  <Panel defaultSize={55} minSize={20}>
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 overflow-auto">
                      {fileType === 'pdf' && filePreviewUrl && <iframe src={filePreviewUrl} title="Preview PDF" className="w-full h-full border-none" />}
                      {fileType === 'excel' && tableHtml && (<div className="p-4 overflow-auto h-full"><div dangerouslySetInnerHTML={{ __html: sanitizeHtml(tableHtml) }} className="prose dark:prose-invert" /></div>)}
                    </div>
                  </Panel>
                  <PanelResizeHandle className="h-2 w-full sm:h-full sm:w-2 bg-slate-300 dark:bg-slate-700 hover:bg-teal-500 transition-colors" />
                  <Panel defaultSize={45} minSize={20} className="flex flex-col bg-slate-100/50 dark:bg-slate-900/50">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {aiChatHistory.map((msg, index) => (
                        <motion.div key={index} layout variants={messageVariants} initial="hidden" animate="visible" className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`p-3 rounded-xl max-w-sm lg:max-w-md text-sm shadow ${msg.role === 'user' ? 'bg-teal-500 text-white' : (msg.isError ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200')}`}>
                            {msg.isLoading ? <LoadingBubble /> : (
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                  </Panel>
                </PanelGroup>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {aiChatHistory.length === 0 ? <EmptyState onAttachmentClick={handleAttachmentClick} />
                    : aiChatHistory.map((msg, index) => (
                      <motion.div key={index} layout variants={messageVariants} initial="hidden" animate="visible" className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-xl max-w-sm lg:max-w-md text-sm shadow ${msg.role === 'user' ? 'bg-teal-500 text-white' : (msg.isError ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200')}`}>
                          {msg.isLoading ? <LoadingBubble /> : (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* FOOTER */}
            <footer className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg flex-shrink-0 space-y-3">
              <form onSubmit={(e) => { e.preventDefault(); handleAIQuery(); }}>
                <div className="flex items-end bg-slate-200 dark:bg-slate-700/50 rounded-lg overflow-hidden ring-2 ring-transparent focus-within:ring-teal-500 transition-shadow">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.xlsx,.xls,.csv" className="hidden" />
                  <button type="button" onClick={() => setIsWebSearchEnabled(prev => !prev)} disabled={!!uploadedFile} title={isWebSearchEnabled ? "Pencarian Web Aktif" : "Aktifkan Pencarian Web"} className={`p-3 transition-colors ${isWebSearchEnabled ? 'text-teal-500' : 'text-slate-500 hover:text-teal-500'} disabled:text-slate-400 disabled:hover:text-slate-400`}>
                    <GlobeAltIcon className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={handleAttachmentClick} title="Unggah Dokumen" className="p-3 text-slate-500 hover:text-teal-500 transition-colors"><DocumentArrowUpIcon className="h-5 w-5" /></button>
                  <TextareaAutosize value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder={mode === 'writer' ? "Masukkan topik untuk ditulis..." : (mode === 'reviewer' ? "Unggah jurnal lalu klik kirim untuk dianalisis..." : "Tanya apa saja...")}
                    className="flex-1 p-3 bg-transparent focus:outline-none text-sm text-slate-900 dark:text-white resize-none" rows={1} maxRows={5}
                  />
                  <button type="submit" disabled={isLoadingAI || !aiQuery.trim()} className="p-3 text-white bg-teal-500 hover:bg-teal-600 transition-colors m-1 rounded-md disabled:bg-teal-400/80 disabled:cursor-not-allowed">
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}