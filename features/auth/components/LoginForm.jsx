'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginForm() {
    const [errorMessage, dispatch] = useFormState(authenticate, undefined);

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader className="">
                <CardTitle className="text-2xl">Giriş Yap</CardTitle>
                <CardDescription className="">
                    Panel erişimi için bilgilerinizi giriniz.
                </CardDescription>
            </CardHeader>
            <CardContent className="">
                <form action={dispatch} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username" className="">Kullanıcı Adı</Label>
                        <Input
                            id="username"
                            type="text"
                            name="username"
                            placeholder="admin"
                            required
                            className=""
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="">Şifre</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            required
                            placeholder="••••••"
                            className=""
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        {/* Optional: Add remember me or forgot password logic here */}
                    </div>
                    <LoginButton />
                    <div
                        className="flex h-8 items-end space-x-1"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {errorMessage && (
                            <p className="text-sm text-red-500">
                                {errorMessage}
                            </p>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <Button className="w-full" aria-disabled={pending} disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Giriş Yap
        </Button>
    );
}
