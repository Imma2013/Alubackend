'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { ImageIcon, ZapIcon, FilmIcon, SparkleIcon, UploadIcon, GlobeIcon, LockIcon, UsersIcon } from '../icons';
import { db } from '../../db';
import { saveFileFromUrl, saveFileFromBlob } from '../../fileSystem';

type ContentType = 'image' | 'short' | 'video';

export default function CreateTab() {
  const { getToken } = useAuth();
  const [selectedType, setSelectedType] = useState<ContentType>('image');
  const [mode, setMode] = useState<'upload' | 'ai'>('ai');
  const [prompt, setPrompt] = useState('');
  const [caption, setCaption] = useState('');
  const [privacy, setPrivacy] = useState('everyone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAI, setIsAI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const types: { key: ContentType; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: 'image', label: 'Image', desc: 'Up to 3 photos', icon: <ImageIcon size={24} /> },
    { key: 'short', label: 'Short', desc: 'Up to 1 min', icon: <ZapIcon size={24} /> },
    { key: 'video', label: 'Video', desc: '1-10 min', icon: <FilmIcon size={24} /> },
  ];

  const privacyOptions = [
    { value: 'everyone', label: 'Everyone', icon: <GlobeIcon size={16} /> },
    { value: 'followers', label: 'Followers', icon: <UsersIcon size={16} /> },
    { value: 'private', label: 'Only me', icon: <LockIcon size={16} /> },
  ];

  const acceptTypes = selectedType === 'image'
    ? 'image/jpeg,image/png,image/gif,image/webp'
    : 'video/mp4,video/quicktime,video/webm';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Validate size (100MB)
    if (selected.size > 100 * 1024 * 1024) {
      setError('File too large. Maximum size is 100MB.');
      return;
    }

    setFile(selected);
    setError(null);
    setSuccess(false);

    // Create preview
    const url = URL.createObjectURL(selected);
    setPreview(url);
  };

  const clearFile = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setIsAI(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = await getToken();
      if (!token) throw new Error('You must be signed in to upload.');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaType', file.type.startsWith('image/') ? 'image' : 'video');
      formData.append('caption', caption);
      if (selectedType === 'short') formData.append('videoType', 'short');
      if (selectedType === 'video') formData.append('videoType', 'long');
      formData.append('is_ai', isAI ? 'true' : 'false');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/upload`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Upload failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.post) {
        // Save file locally to OPFS (from the File object directly, not re-download)
        const ext = result.post.mediaType === 'image' ? 'png' : 'mp4';
        const fileName = `${result.post._id}.${ext}`;
        await saveFileFromBlob(file, fileName);

        // Save to Dexie
        await db.posts.add({
          ...result.post,
          contentUrl: fileName,
          synced: 1,
          updatedAt: new Date(),
        });

        setSuccess(true);
        clearFile();
        setCaption('');
        setIsAI(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const body = {
      prompt: prompt.trim(),
      type: selectedType === 'image' ? 'image' : 'video',
      isLongVideo: selectedType === 'video',
    };

    try {
      const token = await getToken();
      if (!token) throw new Error('You must be signed in to generate content.');

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Error: ${response.status}`);
      }

      const result = await response.json();

      if (result.post && result.post.contentUrl) {
        const fileExtension = result.post.mediaType === 'image' ? 'png' : 'mp4';
        const fileName = `${result.post._id}.${fileExtension}`;

        await saveFileFromUrl(result.post.contentUrl, fileName);

        await db.posts.add({
          ...result.post,
          contentUrl: fileName,
          synced: 1,
          updatedAt: new Date(),
        });

        setSuccess(true);
        setPrompt('');
        setCaption('');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[500px] mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <h2 className="text-xl font-bold text-alu-text mb-6">Create</h2>

      {/* Content Type Selector */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {types.map((t) => (
          <button
            key={t.key}
            onClick={() => { setSelectedType(t.key); clearFile(); }}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedType === t.key
                ? 'border-[var(--alu-primary)] bg-[var(--alu-primary-glow)]'
                : 'border-alu-border hover:border-alu-text-tertiary bg-white'
            }`}
          >
            <span className={selectedType === t.key ? 'text-[var(--alu-primary-dark)]' : 'text-alu-text-secondary'}>{t.icon}</span>
            <span className={`text-sm font-semibold ${selectedType === t.key ? 'text-[var(--alu-primary-dark)]' : 'text-alu-text'}`}>
              {t.label}
            </span>
            <span className="text-[11px] text-alu-text-tertiary">{t.desc}</span>
          </button>
        ))}
      </div>

      {/* Mode Toggle: Upload vs AI */}
      <div className="flex bg-alu-surface rounded-xl p-1 mb-6">
        <button
          onClick={() => setMode('upload')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            mode === 'upload' ? 'bg-white text-alu-text shadow-sm' : 'text-alu-text-tertiary hover:text-alu-text-secondary'
          }`}
        >
          <UploadIcon size={16} /> Upload
        </button>
        <button
          onClick={() => setMode('ai')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            mode === 'ai' ? 'bg-white text-alu-text shadow-sm' : 'text-alu-text-tertiary hover:text-alu-text-secondary'
          }`}
        >
          <SparkleIcon size={16} /> AI Generate
        </button>
      </div>

      {/* Upload Area or AI Prompt */}
      {mode === 'upload' ? (
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptTypes}
            onChange={handleFileSelect}
            className="hidden"
          />
          {!file ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-alu-border rounded-xl p-8 text-center hover:border-[var(--alu-primary)] hover:bg-[var(--alu-primary-glow)] transition-all duration-200 cursor-pointer"
            >
              <div className="flex justify-center mb-3 text-alu-text-tertiary">
                <UploadIcon size={40} />
              </div>
              <p className="text-sm font-semibold text-alu-text mb-1">
                Tap to upload {selectedType === 'image' ? 'a photo' : selectedType === 'short' ? 'a short video' : 'a video'}
              </p>
              <p className="text-xs text-alu-text-tertiary">
                {selectedType === 'image' ? 'JPG, PNG, GIF, WebP' : 'MP4, MOV, WebM'} — max 100MB
              </p>
            </button>
          ) : (
            <div className="relative rounded-xl overflow-hidden border-2 border-[var(--alu-primary)] bg-black">
              {file.type.startsWith('image/') ? (
                <img src={preview!} alt="Preview" className="w-full max-h-80 object-contain" />
              ) : (
                <video src={preview!} controls playsInline className="w-full max-h-80" />
              )}
              <button
                onClick={clearFile}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <div className="absolute bottom-2 left-2 text-[11px] bg-black/60 text-white px-2 py-1 rounded">
                {(file.size / (1024 * 1024)).toFixed(1)}MB
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              selectedType === 'image'
                ? 'Describe the image you want to create...'
                : selectedType === 'short'
                ? 'Describe your short video concept...'
                : 'Describe your video idea...'
            }
            className="w-full h-28 p-4 bg-alu-surface rounded-xl text-sm text-alu-text placeholder:text-alu-text-tertiary outline-none resize-none focus:ring-2 focus:ring-[var(--alu-primary-glow)] transition-shadow"
          />
          <div className="flex justify-end mt-2">
            <span className="text-[11px] text-alu-text-tertiary">
              {selectedType === 'image' ? '3 left today' : selectedType === 'short' ? '2 left today' : '1 left today'} · Free tier
            </span>
          </div>
        </div>
      )}

      {/* AI Content Label (upload mode only) */}
      {mode === 'upload' && (
        <div className="mb-6">
          <button
            onClick={() => setIsAI(!isAI)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isAI
                ? 'bg-[var(--alu-primary-glow)] text-[var(--alu-primary-dark)] border border-[var(--alu-primary)]'
                : 'bg-alu-surface text-alu-text-secondary border border-transparent hover:border-alu-border'
            }`}
          >
            <SparkleIcon size={14} />
            AI Generated
          </button>
          <p className="text-[11px] text-alu-text-tertiary mt-1.5">Toggle if this content was made with AI</p>
        </div>
      )}

      {/* Caption */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-alu-text-secondary mb-2 block">Caption</label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption... use @ to tag people"
          className="w-full h-20 p-3 bg-alu-surface rounded-xl text-sm text-alu-text placeholder:text-alu-text-tertiary outline-none resize-none focus:ring-2 focus:ring-[var(--alu-primary-glow)] transition-shadow"
        />
      </div>

      {/* Privacy */}
      <div className="flex items-center gap-2 mb-6">
        {privacyOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPrivacy(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              privacy === opt.value
                ? 'bg-[var(--alu-primary-glow)] text-[var(--alu-primary-dark)] border border-[var(--alu-primary)]'
                : 'bg-alu-surface text-alu-text-secondary border border-transparent hover:border-alu-border'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>

      {/* Error / Success */}
      {error && <p className="text-sm text-[var(--alu-danger)] mb-4">{error}</p>}
      {success && <p className="text-sm text-[var(--alu-success)] mb-4">Content {mode === 'ai' ? 'generated' : 'uploaded'} successfully!</p>}

      {/* Submit */}
      <button
        onClick={mode === 'ai' ? handleAIGenerate : handleUpload}
        disabled={isLoading || (mode === 'ai' && !prompt.trim()) || (mode === 'upload' && !file)}
        className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, var(--alu-primary), var(--alu-primary-light))' }}
      >
        {isLoading
          ? (mode === 'ai' ? 'Generating...' : 'Uploading...')
          : (mode === 'ai' ? 'Generate & Post' : 'Post')
        }
      </button>
    </div>
  );
}
