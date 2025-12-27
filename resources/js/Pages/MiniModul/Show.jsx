import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ClockIcon, BookOpenIcon, PlayIcon, ShareIcon, XMarkIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { LinkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import ChapterListItem from './Partials/ChapterListItem';
import RelatedModulItem from './Partials/RelatedModulItem';

// ---------- Modal Share ----------
const ShareModal = ({ isOpen, onClose, modul, currentUrl }) => {
  const [copied, setCopied] = useState(false);

  const shareText = `Sedang belajar "${modul.title}" - ${modul.description}`;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const openShareWindow = (url) => window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bagikan Modul</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Info Modul */}
        <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">{modul.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {modul.category.name} • {modul.published_chapters.length} Chapter
          </p>
        </div>

        {/* Tombol Share */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {Object.entries(shareLinks).map(([key, url]) => (
            <button
              key={key}
              onClick={() => openShareWindow(url)}
              className="flex items-center justify-center p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition"
              aria-label={key}
            >
              {key === 'facebook' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              )}
              {key === 'twitter' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
              )}
              {key === 'linkedin' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              )}
              {key === 'whatsapp' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" /></svg>
              )}
              {key === 'telegram' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
              )}
            </button>
          ))}
          <button
            onClick={copyToClipboard}
            className={`flex items-center justify-center p-3 rounded-xl transition ${copied ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'}`}
            aria-label="Salin tautan"
          >
            {copied ? <CheckIcon className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
          </button>
        </div>

        {/* Salin Tautan */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Salin tautan:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={currentUrl}
              readOnly
              className="flex-1 p-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            />
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${copied ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'}`}
            >
              {copied ? 'Tersalin!' : 'Salin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------- Halaman Utama ----------
export default function Show({ auth, modul, userProgress, relatedModuls, isLocked }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const getDifficultyInfo = (difficulty) => {
    const styles = {
      beginner: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      intermediate: 'bg-green-200 text-green-900 dark:bg-green-800/50 dark:text-green-200',
      advanced: 'bg-green-300 text-green-900 dark:bg-green-700/50 dark:text-green-100',
    };
    const labels = { beginner: 'Pemula', intermediate: 'Menengah', advanced: 'Lanjutan' };
    return { style: styles[difficulty], label: labels[difficulty] };
  };

  const difficulty = getDifficultyInfo(modul.difficulty);
  const hasProgress = auth.user && modul.progress_percentage !== undefined && modul.progress_percentage !== null;

  const nextChapterToLearn = () => {
    if (!userProgress) return modul.published_chapters[0];
    const firstUncompleted = modul.published_chapters.find((ch) => !userProgress[ch.id]?.is_completed);
    return firstUncompleted || modul.published_chapters[0];
  };

  const nextChapter = nextChapterToLearn();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title={modul.title} />

      <div className="bg-gray-50 dark:bg-gray-900 relative">
        {/* PREMIUM LOCK OVERLAY */}
        {isLocked && (
          <div className="absolute inset-x-0 top-0 bottom-0 z-50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl flex items-start justify-center pt-32 pb-12 px-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 max-w-lg w-full text-center shadow-2xl border border-slate-100 dark:border-slate-700"
            >
              <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                <LockClosedIcon className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Modul Premium</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
                Anda telah mencapai batas 3 modul gratis. Upgrade ke **Premium** untuk membuka akses ke seluruh perpustakaan modul pembelajaran.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={route('subscribe.index')}
                  className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl shadow-xl shadow-teal-500/20 transition-all active:scale-95"
                >
                  Upgrade Sekarang
                </Link>
                <Link
                  href={route('mini-moduls.index')}
                  className="px-8 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Mungkin Nanti
                </Link>
              </div>
            </motion.div>
          </div>
        )}

        <div className={isLocked ? 'grayscale' : ''}>
          {/* Hero */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
              <div className={`grid gap-8 items-center ${modul.thumbnail ? 'md:grid-cols-3' : 'md:grid-cols-1'}`}>
                {modul.thumbnail && (
                  <div className="md:col-span-1">
                    <img
                      src={`/storage/${modul.thumbnail}`}
                      alt={modul.title}
                      className="w-full aspect-square object-cover rounded-xl shadow-md"
                    />
                  </div>
                )}
                <div className={`${!modul.thumbnail ? 'md:col-span-1 text-center' : 'md:col-span-2'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-base font-semibold text-green-600 dark:text-green-400">{modul.category.name}</p>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                      <ShareIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Bagikan</span>
                    </button>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
                    {modul.title}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mb-5">{modul.description}</p>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${difficulty.style}`}>{difficulty.label}</span>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <BookOpenIcon className="w-5 h-5 mr-2" />
                      <span>{modul.published_chapters.length} Chapter</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <ClockIcon className="w-5 h-5 mr-2" />
                      <span>{modul.total_duration} menit total</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Konten Utama */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Daftar Chapter */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Materi Pembelajaran</h2>
                {nextChapter && (
                  <Link
                    href={route('mini-moduls.chapter', { miniModul: modul.slug, chapter: nextChapter.slug })}
                    className="mb-8 w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-md hover:shadow-lg transition"
                  >
                    <PlayIcon className="w-6 h-6" />
                    <span>{hasProgress && modul.progress_percentage > 0 ? 'Lanjutkan Belajar' : 'Mulai Belajar'}</span>
                  </Link>
                )}
                <div className="space-y-4">
                  {modul.published_chapters.map((chapter, index) => (
                    <ChapterListItem
                      key={chapter.id}
                      modulSlug={modul.slug}
                      chapter={chapter}
                      index={index}
                      isCompleted={userProgress && userProgress[chapter.id]?.is_completed}
                      isNextUp={chapter.id === nextChapter?.id}
                    />
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {hasProgress && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Anda</h3>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <span>Penyelesaian</span>
                        <span className="font-bold">{modul.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${modul.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bagikan Modul</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Ajarkan temanmu bersama!</p>
                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl transition"
                    >
                      <ShareIcon className="w-4 h-4" />
                      Bagikan
                    </button>
                  </div>

                  {relatedModuls.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Modul Terkait</h3>
                      <div className="space-y-3">
                        {relatedModuls.map((rel) => (
                          <RelatedModulItem key={rel.id} modul={rel} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        modul={modul}
        currentUrl={currentUrl}
      />
    </AuthenticatedLayout>
  );
}