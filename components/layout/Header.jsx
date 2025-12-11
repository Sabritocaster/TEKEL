'use client';

import Image from 'next/image';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet.jsx';
import { AppSidebar } from './Sidebar';
import { useUIStore } from '@/lib/stores/useUIStore.js';

export function Header() {
    const { isSidebarOpen } = useUIStore();
    return (
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:hidden">
            <div className="flex items-center gap-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle Sidebar</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <AppSidebar />
                    </SheetContent>
                </Sheet>

                <Image
                    src="/logo.png"
                    alt="Tekel Stok Logo"
                    width={120}
                    height={36}
                    className="h-9 w-auto object-contain"
                    priority
                />
            </div>
        </header>
    );
}
