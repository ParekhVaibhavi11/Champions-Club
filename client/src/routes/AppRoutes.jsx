import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { MemberLayout } from '../layouts/MemberLayout';
import { FrontDeskLayout } from '../layouts/FrontDeskLayout';
import { StaffLayout } from '../layouts/StaffLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

import { Login } from '../features/auth/Login';
import { ResetPassword } from '../features/auth/ResetPassword';
import { Home } from '../features/public/Home';
import { Plans } from '../features/public/Plans';
import { SportsShowcase } from '../features/courts/SportsShowcase';
import { AvailabilityMatrix } from '../features/courts/AvailabilityMatrix';
import { MemberBookingFlow } from '../features/courts/MemberBookingFlow';
import { SocialPlay } from '../features/courts/SocialPlay';
import { MemberDashboard } from '../features/members/MemberDashboard';
import { MemberPlan } from '../features/members/MemberPlan';
import { TrialRequest } from '../features/public/TrialRequest';
import { TrialStatus } from '../features/public/TrialStatus';
import { LeadPipeline } from '../features/frontdesk/LeadPipeline';
import { FrontDeskCalendar } from '../features/frontdesk/FrontDeskCalendar';
import { MemberDirectory } from '../features/frontdesk/MemberDirectory';
import { ShopPOS } from '../features/shop/ShopPOS';
import { AdminDashboard } from '../features/finance/AdminDashboard';
import { CourtManagement } from '../features/courts/CourtManagement';
import { InventoryManager } from '../features/shop/InventoryManager';
import { CafePOS } from '../features/cafe/CafePOS';
import { KitchenQueue } from '../features/cafe/KitchenQueue';
import { ShopCatalog } from '../features/shop/ShopCatalog';
import { CafeMenu } from '../features/cafe/CafeMenu';
import { AdminFinance } from '../features/finance/AdminFinance';
import { AdminHr } from '../features/finance/AdminHr';
import { AdminOrderHistory } from '../features/finance/AdminOrderHistory';
import { ShopPageLayout } from '../layouts/ShopPageLayout';
import { CafePageLayout } from '../layouts/CafePageLayout';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/sports" element={<SportsShowcase />} />
        <Route path="/availability" element={<AvailabilityMatrix />} />
        <Route path="/trial" element={<TrialRequest />} />
        <Route path="/trial/status" element={<TrialStatus />} />
        <Route path="/contact" element={<TrialRequest />} />
      </Route>

      <Route path="/shop" element={<ShopPageLayout><ShopCatalog /></ShopPageLayout>} />
      <Route path="/cafe" element={<CafePageLayout><CafeMenu /></CafePageLayout>} />

      {/* Member Routes */}
      <Route
        path="/member"
        element={
          <ProtectedRoute allowedRoles={['member', 'admin']}>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<MemberDashboard />} />
        <Route path="membership" element={<MemberPlan />} />
        <Route path="book-court" element={<MemberBookingFlow />} />
        <Route path="social-play" element={<SocialPlay />} />
        <Route path="cafe" element={<CafeMenu />} />
      </Route>

      {/* Front Desk Routes */}
      <Route
        path="/desk"
        element={
          <ProtectedRoute allowedRoles={['front_desk', 'admin']}>
            <FrontDeskLayout />
          </ProtectedRoute>
        }
      >
        <Route path="calendar" element={<FrontDeskCalendar />} />
        <Route path="members" element={<MemberDirectory />} />
        <Route path="leads" element={<LeadPipeline />} />
      </Route>

      {/* Staff Routes */}
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['staff', 'admin']}>
            <StaffLayout />
          </ProtectedRoute>
        }
      >
        <Route path="shop-pos" element={<ShopPOS />} />
        <Route path="inventory" element={<InventoryManager />} />
        <Route path="cafe-pos" element={<CafePOS />} />
        <Route path="kitchen" element={<KitchenQueue />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="courts" element={<CourtManagement />} />
        <Route path="cafe" element={<CafePOS />} />
        <Route path="finance" element={<AdminFinance />} />
        <Route path="orders" element={<AdminOrderHistory />} />
        <Route path="hr" element={<AdminHr />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
