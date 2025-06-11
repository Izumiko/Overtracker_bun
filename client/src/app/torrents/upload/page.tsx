/**
 * Torrent Upload Page
 * Handles torrent upload and submission
 * Includes form for torrent details and file dropzones for torrent and NFO files
 */

'use client';

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import axios from 'axios';
import { showNotification } from '@/utils/notifications';

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

export default function TorrentUploadPage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
  });
  const [torrentFile, setTorrentFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!torrentFile) {
      showNotification.error(t('torrents.upload.errors.noFile'));
      return;
    }

    console.log('File details:', {
      name: torrentFile.name,
      size: torrentFile.size,
      type: torrentFile.type
    });

    const uploadData = new FormData();
    uploadData.append('torrent', torrentFile);
    uploadData.append('name', formData.name);

    try {
      console.log('Sending request:', {
        url: `${process.env.NEXT_PUBLIC_API_URL}/torrents/upload`,
        name: formData.name,
        base64Length: uploadData.get('torrent')?.toString().length
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/torrents/upload`,
        uploadData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Server response:', response.data);

      if (response.data.success) {
        showNotification.success(t('torrents.upload.notification.success'));
        // Reset form
        setFormData({ name: '' });
        setTorrentFile(null);
      } else {
        showNotification.error(response.data.error || t('torrents.upload.notification.error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || t('torrents.upload.notification.error');
        showNotification.error(errorMessage);
      }
    }
  };

  // Handler para cuando se selecciona un archivo torrent
  const handleTorrentFileSelected = (file: File) => {
    // Establecer el nombre del archivo como nombre del torrent
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