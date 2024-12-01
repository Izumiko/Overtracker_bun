/**
 * Torrent Upload Page
 * Handles torrent upload and submission
 * Includes form for torrent details and file dropzones for torrent and NFO files
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { generateTagSuggestions, TagPatterns } from '@/utils/tagSuggestions';
import { detectCategory } from '@/utils/categoryDetection';

interface FileDropzoneProps {
  file: File | null;
  setFile: (file: File | null) => void;
  accept: string;
  dropzoneText: string;
  acceptedText: string;
  onFileSelected?: (file: File) => void;
}

function FileDropzone({ file, setFile, accept, dropzoneText, acceptedText, onFileSelected }: FileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.name.endsWith(accept)) {
      setFile(droppedFile);
      onFileSelected?.(droppedFile);
    }
  };

  const handleFileChange = (file: File) => {
    setFile(file);
    onFileSelected?.(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className="border-2 border-dashed border-border rounded p-8 text-center
                 hover:border-primary transition-colors cursor-pointer"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileChange(file);
        }}
      />
      {file ? (
        <span className="text-primary">{file.name}</span>
      ) : (
        <>
          <p>{dropzoneText}</p>
          <p className="text-text-secondary text-sm mt-2">
            {acceptedText}
          </p>
        </>
      )}
    </div>
  );
}

// Definir las categorías válidas como strings literales
type Category = 'video' | 'audio' | 'applications' | 'games' | 'other' | '';

// Etiquetas sugeridas por categoría
const SUGGESTED_TAGS: Record<string, string[]> = {
  audio: ['mp3', 'flac', 'album', 'single', 'ost', 'podcast', 'audiobook', 'live'],
  video: ['1080p', '4k', 'x264', 'x265', 'web-dl', 'bluray', 'subbed', 'dubbed'],
  applications: ['windows', 'macos', 'linux', 'android', 'ios', 'portable', 'cracked'],
  games: ['rpg', 'action', 'strategy', 'simulation', 'indie', 'repack', 'goty'],
  other: ['ebook', 'comic', 'magazine', 'tutorial', 'course', 'template']
};

const MAX_TAGS = 10;

export default function TorrentUploadPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '' as Category,
    tags: '',
    visibility: 'public'
  });
  const [torrentFile, setTorrentFile] = useState<File | null>(null);
  const [nfoFile, setNfoFile] = useState<File | null>(null);
  const [tagCount, setTagCount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);

  // Manejar cambios en las etiquetas
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value;
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    if (tagArray.length <= MAX_TAGS) {
      setFormData(prev => ({ ...prev, tags }));
      setTagCount(tagArray.length);
    }
  };

  // Añadir etiqueta sugerida
  const addSuggestedTag = (tag: string) => {
    const currentTags = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t);

    if (currentTags.length < MAX_TAGS && !currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(', ');
      setFormData(prev => ({ ...prev, tags: newTags }));
      setTagCount(currentTags.length + 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data:', formData);
    console.log('Torrent file:', torrentFile);
    console.log('NFO file:', nfoFile);
  };

  // Actualizar sugerencias cuando cambie el nombre o la categoría
  useEffect(() => {
    if (formData.category && formData.name) {
      const suggestions = generateTagSuggestions(
        formData.category as keyof TagPatterns | 'other',
        formData.name
      );
      setDynamicSuggestions(suggestions);
    }
  }, [formData.category, formData.name]);

  // Actualizar el manejador de cambio de categoría
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as Category;
    setFormData(prev => ({ ...prev, category: newCategory }));
    setShowSuggestions(true);
  };

  // Handler para cuando se selecciona un archivo torrent
  const handleTorrentFileSelected = (file: File) => {
    // Detectar y establecer la categoría
    const detectedCategory = detectCategory(file.name);
    if (detectedCategory && !formData.category) {
      setFormData(prev => ({ ...prev, category: detectedCategory }));
      setShowSuggestions(true);
    }

    // Establecer el nombre del archivo como nombre del torrent
    // Eliminamos la extensión .torrent del nombre
    const torrentName = file.name.replace(/\.torrent$/, '');
    setFormData(prev => ({ ...prev, name: torrentName }));
  };

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-background text-text p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">
          {t('torrents.upload.title')}
        </h1>

        <form onSubmit={handleSubmit} className="bg-surface p-6 rounded border border-border">
          <div className="space-y-6">
            {/* Torrent File Dropzone */}
            <div>
              <label className="block text-text mb-2">
                {t('torrents.upload.form.torrentFile')}
              </label>
              <FileDropzone
                file={torrentFile}
                setFile={setTorrentFile}
                accept=".torrent"
                dropzoneText={t('torrents.upload.dropzone.text')}
                acceptedText={t('torrents.upload.dropzone.accepted')}
                onFileSelected={handleTorrentFileSelected}
              />
            </div>

            {/* NFO File Dropzone */}
            <div>
              <label className="block text-text mb-2">
                {t('torrents.upload.form.nfoFile')}
              </label>
              <FileDropzone
                file={nfoFile}
                setFile={setNfoFile}
                accept=".nfo"
                dropzoneText={t('torrents.upload.dropzone.nfoText')}
                acceptedText={t('torrents.upload.dropzone.nfoAccepted')}
              />
            </div>

            <div>
              <label className="block text-text mb-2">
                {t('torrents.upload.form.name')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 bg-background border border-border rounded hover:border-primary transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-text mb-2">
                {t('torrents.upload.form.description')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 bg-background border border-border rounded h-32 hover:border-primary transition-colors"
                required
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-text mb-2">
                {t('torrents.upload.form.category')}
              </label>
              <select
                value={formData.category}
                onChange={handleCategoryChange}
                className="w-full p-2 bg-background border border-border rounded hover:border-primary transition-colors"
                required
              >
                <option value="">{t('torrents.upload.form.selectCategory')}</option>
                {Object.keys(SUGGESTED_TAGS).map(category => (
                  <option key={category} value={category}>
                    {t(`home.search.categories.${category}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Etiquetas */}
            <div>
              <label className="block text-text mb-2">
                {t('torrents.upload.form.tags')}
                <span className="text-text-secondary text-sm ml-2">
                  ({tagCount}/{MAX_TAGS})
                </span>
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={handleTagsChange}
                placeholder={t('torrents.upload.form.tagsPlaceholder')}
                className="w-full p-2 bg-background border border-border rounded hover:border-primary transition-colors"
              />
              <p className="text-text-secondary text-sm mt-1">
                {t('torrents.upload.form.tagsHelp')}
              </p>

              {/* Etiquetas sugeridas */}
              {showSuggestions && formData.category && (
                <div className="mt-3">
                  <p className="text-text-secondary text-sm mb-2">
                    {t('torrents.upload.form.suggestedTags')}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {/* Primero mostrar sugerencias basadas en el nombre */}
                    {dynamicSuggestions.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addSuggestedTag(tag)}
                        disabled={tagCount >= MAX_TAGS}
                        className="px-2 py-1 text-sm bg-primary/10 border border-primary rounded
                                 hover:bg-primary/20 transition-colors
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {tag}
                      </button>
                    ))}
                    {/* Luego mostrar sugerencias predefinidas que no estén ya incluidas */}
                    {SUGGESTED_TAGS[formData.category]
                      .filter(tag => !dynamicSuggestions.includes(tag))
                      .map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addSuggestedTag(tag)}
                          disabled={tagCount >= MAX_TAGS}
                          className="px-2 py-1 text-sm bg-background border border-border rounded
                                   hover:border-primary hover:text-primary transition-colors
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {tag}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-background py-3 rounded 
                         hover:bg-primary-dark transition-colors font-medium"
            >
              {t('torrents.upload.form.submit')}
            </button>
          </div>
        </form>
      </div>
      </div>
    </DashboardLayout>
  );
} 