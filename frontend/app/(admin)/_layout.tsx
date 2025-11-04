import AdminSidebar from '@/components/admin_nav/adminSidebar';
import NavBarAdmin from '@/components/admin_nav/navbar-admin';
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <>
      <NavBarAdmin />
      <AdminSidebar>
        <Stack screenOptions={{ headerShown: false }} />
      </AdminSidebar>
    </>
  );
}
