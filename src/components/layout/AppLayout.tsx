'use client';

import { AppSidebar } from './AppSidebar';
import { Header } from './Header';

export function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <AppSidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto bg-muted/10 p-4 lg:p-6">
                    <div className="mx-auto max-w-7xl space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
