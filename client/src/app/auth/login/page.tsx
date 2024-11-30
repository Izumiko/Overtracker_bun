/**
 * Login page component
 * Handles user authentication
 * Provides login form and navigation
 */

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import AuthInput from '@/components/auth/AuthInput';
import { useAuth } from '@/contexts/AuthContext';
import { showNotification } from '@/utils/notifications';
import { AxiosError } from 'axios';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(formData);
      
      if (response.success) {
        showNotification.success(t('auth.notification.successLogin'));
      } else {
        showNotification.error(response.message || t('auth.notification.error'));
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      if (error instanceof AxiosError) {
        showNotification.error(
          error.response?.data?.message || t('auth.notification.error')
        );
      } else {
        showNotification.error(t('auth.notification.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title={t('auth.login.title')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label={t('auth.login.username')}
          type="text"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          required
          autoFocus
        />
        <AuthInput
          label={t('auth.login.password')}
          type="password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          required
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-background py-2 rounded 
                   hover:bg-primary-dark transition-colors font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('common.loading') : t('auth.login.submit')}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link 
          href="/auth/forgot-password"
          className="text-primary hover:text-primary-dark transition-colors"
        >
          {t('auth.login.forgotPassword')}
        </Link>
      </div>

      <div className="mt-4 text-center text-sm">
        <span className="text-text-secondary">
          {t('auth.login.noAccount')}{' '}
        </span>
        <Link 
          href="/auth/register"
          className="text-primary hover:text-primary-dark transition-colors"
        >
          {t('auth.login.register')}
        </Link>
      </div>
    </AuthCard>
  );
} 