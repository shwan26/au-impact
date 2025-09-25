'use client';

// Make sure the import path is correct and the file exists
import PortalLoginForm from '@/components/forms/PortalLoginForm';

export default function AUSOPortalLogin() {
  return <PortalLoginForm role="auso" redirectTo="/auso" />;
}
