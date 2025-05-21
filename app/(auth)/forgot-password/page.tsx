// app/(auth)/forgot-password/page.tsx
'use client';

import ForgotPasswordForm from '@/components/ForgotPasswordForm';
import { Suspense } from 'react';


export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}



