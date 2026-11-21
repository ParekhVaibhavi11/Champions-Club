import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { MemberLayout } from './MemberLayout';
import { PublicLayout } from './PublicLayout';

export const ShopPageLayout = ({ children }) => {
  const { user } = useAuth();
  const Layout = user?.role === 'member' ? MemberLayout : PublicLayout;
  return <Layout>{children}</Layout>;
};
