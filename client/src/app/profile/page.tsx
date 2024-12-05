/**
 * Profile Page
 * Displays user profile information and settings
 * Includes sections for avatar management, user info, statistics, and recent activity
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { UserProfile } from '@/types/user';
import ProfileLayout from '@/components/profile/ProfileLayout';
import RecentActivity from '@/components/profile/RecentActivity';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { showNotification } from '@/utils/notifications';
import { format } from 'date-fns';
import { es, enUS, fr } from 'date-fns/locale';

// Example data
const mockProfile: UserProfile = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  joinDate: '2024-01-15',
  avatar: null,
  stats: {
    uploaded: '1.5 TB',
    downloaded: '500 GB',
    ratio: 3.0,
    points: 1500,
    rank: 'Power User'
  },
  preferences: {
    notifications: true,
    privateProfile: false,
    language: 'en',
    theme: 'dark'
  }
};

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log('User data:', user);
  }, [user]);

  /*
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };
*/
  const handleRemoveAvatar = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const announceUrl = user?.passkey 
    ? `${process.env.NEXT_PUBLIC_TRACKER_URL || 'http://tracker.example.com'}/announce?passkey=${user.passkey}`
    : '';

  useEffect(() => {
    console.log('Announce URL:', announceUrl);
  }, [announceUrl]);

  const copyAnnounceUrl = async () => {
    try {
      await navigator.clipboard.writeText(announceUrl);
      showNotification.success(t('profile.notification.announceCopied'));
    } catch /*(_)*/ {
      showNotification.error(t('profile.notification.copyError'));
    }
  };

  const getLocale = () => {
    switch (i18n.language) {
      case 'es': return es;
      case 'fr': return fr;
      default: return enUS;
    }
  };

  const formattedJoinDate = user?.created_at 
    ? format(new Date(user.created_at), 'PPP', { locale: getLocale() })
    : '';

  return (
    <DashboardLayout>
      <ProfileLayout title="profile.title">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar with avatar and user info */}
          <div className="space-y-6">
            <div className="bg-surface rounded-lg border border-border p-6">
              <div className="space-y-4">
                {/* Avatar */}
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-background">
                  {(previewUrl || profile.avatar) ? (
                    <Image
                      src={previewUrl || profile.avatar!}
                      alt="Profile avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary">
                      <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Avatar buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 px-3 py-2 bg-primary text-background rounded hover:bg-primary-dark transition-colors text-sm"
                  >
                    {t('profile.actions.uploadAvatar')}
                  </button>
                  {(previewUrl || profile.avatar) && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-3 py-2 border border-border rounded hover:border-error hover:text-error transition-colors text-sm"
                    >
                      {t('profile.actions.removeAvatar')}
                    </button>
                  )}
                </div>

                {/* User Info y Quick Stats */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('profile.fields.username')}</span>
                    <span className="font-medium">{user?.username || ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('profile.fields.email')}</span>
                    <span className="font-medium">{user?.email || ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('profile.fields.ratio')}</span>
                    <span className="font-medium">{profile.stats.ratio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('profile.fields.points')}</span>
                    <span className="font-medium">{profile.stats.points}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('profile.fields.rank')}</span>
                    <span className="font-medium">{profile.stats.rank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('profile.fields.joinDate')}</span>
                    <span className="font-medium">{formattedJoinDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            {/* Detailed statistics */}
            <section className="bg-surface rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">{t('profile.sections.stats')}</h2>
              <div className="space-y-6">
                {/* Announce URL */}
                <div className="space-y-2">
                  <label className="block text-sm text-text-secondary">
                    {t('profile.fields.announceUrl')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={announceUrl}
                      readOnly
                      className="flex-1 p-2 bg-background border border-border rounded 
                                 text-text font-mono text-sm"
                    />
                    <button
                      onClick={copyAnnounceUrl}
                      className="px-4 py-2 bg-primary text-background rounded hover:bg-primary-dark 
                                 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span className="text-sm">{t('common.copy')}</span>
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm text-text-secondary">
                      {t('profile.fields.uploaded')}
                    </span>
                    <span className="text-lg font-medium text-green">{profile.stats.uploaded}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-text-secondary">
                      {t('profile.fields.downloaded')}
                    </span>
                    <span className="text-lg font-medium text-primary">{profile.stats.downloaded}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Preferences */}
            <section className="bg-surface rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">{t('profile.sections.preferences')}</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>{t('profile.preferences.notifications')}</span>
                  <input
                    type="checkbox"
                    checked={profile.preferences.notifications}
                    onChange={(e) => setProfile({
                      ...profile,
                      preferences: { ...profile.preferences, notifications: e.target.checked }
                    })}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>{t('profile.preferences.privateProfile')}</span>
                  <input
                    type="checkbox"
                    checked={profile.preferences.privateProfile}
                    onChange={(e) => setProfile({
                      ...profile,
                      preferences: { ...profile.preferences, privateProfile: e.target.checked }
                    })}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <RecentActivity />
          </div>
        </div>
      </ProfileLayout>
    </DashboardLayout>
  );
} 