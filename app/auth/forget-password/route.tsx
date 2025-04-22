// app/auth/forgot-password/route.ts

import { confirmReset } from '@/app/auth/confirmReset'; // Adjust the path if necessary

export async function POST(request: Request) {
  const formData = await request.formData();
  await confirmReset(formData);
}
