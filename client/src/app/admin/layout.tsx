'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { showNotification } from '@/utils/notifications';
import { useTranslation } from 'react-i18next';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (user?.role !== 'admin') {
      showNotification.error(t('errors.unauthorized'));
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router, t]);

  // No mostrar nada mientras se verifica
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return children;
} 