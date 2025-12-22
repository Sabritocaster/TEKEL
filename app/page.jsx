import Link from 'next/link';
import { LogIn, LayoutDashboard, Box, TrendingUp, BarChart3, Shield, LogOut } from 'lucide-react';
import { auth } from '@/auth';
import { signOutAction } from '@/features/auth/actions';

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Tekel Stok Takip
          </h1>
          <p className="text-muted-foreground">
            Stok, satış ve kârlılık yönetim paneli.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {isLoggedIn ? (
            <div className="space-y-3">
              <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm space-y-4">
                <p className="text-sm text-muted-foreground">
                  Hoş geldiniz{session.user.name ? `, ${session.user.name}` : ''}
                </p>

                <Link
                  href="/dashboard"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard&apos;a Git
                </Link>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    href="/products"
                    className="inline-flex flex-col items-center justify-center gap-1.5 rounded-md border border-input bg-background/50 px-3 py-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Box className="h-4 w-4 text-muted-foreground" />
                    Ürünler
                  </Link>
                  <Link
                    href="/stock-movements"
                    className="inline-flex flex-col items-center justify-center gap-1.5 rounded-md border border-input bg-background/50 px-3 py-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    Hareketler
                  </Link>
                  <Link
                    href="/reports"
                    className="inline-flex flex-col items-center justify-center gap-1.5 rounded-md border border-input bg-background/50 px-3 py-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    Raporlar
                  </Link>
                  <Link
                    href="/audit-logs"
                    className="inline-flex flex-col items-center justify-center gap-1.5 rounded-md border border-input bg-background/50 px-3 py-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Kayıtlar
                  </Link>
                </div>

                <form action={signOutAction} className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <LogIn className="h-4 w-4" />
                Giriş Yap
              </Link>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Tekel Stok Takip Sistemi - Medyanes 360
        </div>
      </div>
    </div>
  );
}
