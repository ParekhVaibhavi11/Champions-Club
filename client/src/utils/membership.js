export const hasActiveMembership = (user, isAuthenticated) => Boolean(
  isAuthenticated
  && user?.role === 'member'
  && user?.membership_id
  && user?.membership_status === 'ACTIVE'
);
