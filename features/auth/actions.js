'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(prevState, formData) {
    try {
        const credentials = Object.fromEntries(formData);

        await signIn('credentials', {
            ...credentials,
            redirectTo: '/',
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Geçersiz kullanıcı adı veya şifre.';
                default:
                    return 'Bir hata oluştu.';
            }
        }
        throw error;
    }
}

export async function signOutAction() {
    await signOut({ redirectTo: '/login' });
}
