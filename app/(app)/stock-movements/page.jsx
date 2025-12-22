import { MovementForm } from '@/features/stock-movements/components/MovementForm.jsx';
import { MovementHistory } from '@/features/stock-movements/components/MovementHistory.jsx';

import { AllMovementsDialog } from '@/features/stock-movements/components/AllMovementsDialog.jsx';

export const dynamic = 'force-dynamic';

export default function MovementsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight">Stok Hareketleri</h2>
                    <p className="text-muted-foreground">
                        Stok giriş ve çıkış işlemlerini buradan yapabilir, geçmiş hareketleri inceleyebilirsiniz.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <div className="lg:sticky lg:top-6">
                        <MovementForm />
                    </div>
                </div>
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Son Hareketler</h3>
                        <AllMovementsDialog />
                    </div>
                    <MovementHistory />
                </div>
            </div>
        </div>
    );
}
