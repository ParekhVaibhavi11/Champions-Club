import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { MemberLayout } from './MemberLayout';
import { AdminLayout } from './AdminLayout';
import { PublicLayout } from './PublicLayout';

export const CafePageLayout = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <AdminLayout>{children}</AdminLayout>;
  }
  if (user?.role === 'member' || user?.membership_tier || user?.membership_id) {
    return <MemberLayout>{children}</MemberLayout>;
  }
  return <PublicLayout>{children}</PublicLayout>;
};
