'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils.js';
import {
    LayoutDashboard,
    Package,
    ArrowRightLeft,
    TrendingUp,
    Settings,
    LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { signOutAction } from '@/features/auth/actions';

import Image from 'next/image';

const MENU_ITEMS = [
    { href: '/dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
    { href: '/products', label: 'Ürün Yönetimi', icon: Package },
    { href: '/stock-movements', label: 'Stok Hareketleri', icon: ArrowRightLeft },
    { href: '/reports', label: 'Analiz & Rapor', icon: TrendingUp },
];

export function AppSidebar({ className }) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                'flex h-full w-64 flex-col border-r bg-card text-card-foreground',
                className
            )}
        >
            <div className="flex h-16 items-center border-b px-6">
                <Image
                    src="/logo.png"
                    alt="Tekel Stok Logo"
                    width={160}
                    height={48}
                    className="h-12 w-auto object-contain"
                    priority
                />
            </div>

            <nav className="flex-1 space-y-1 p-4">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-muted',
                                isActive
                                    ? 'bg-primary/10 text-primary hover:bg-primary/15'
                                    : 'text-muted-foreground'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t p-4">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
                    onClick={async () => {
                        await signOutAction();
                    }}
                >
                    <LogOut className="h-5 w-5" />
                    Çıkış Yap
                </Button>
            </div>
        </aside>
    );
}
