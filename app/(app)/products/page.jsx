import { ProductDialog } from '@/features/products/components/AddProductDialog.jsx';
import { ProductTable } from '@/features/products/components/ProductTable.jsx';

export const dynamic = 'force-dynamic';

export default function ProductsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Ürün Yönetimi</h2>
                    <p className="text-muted-foreground">
                        Marketinizdeki ürünleri buradan yönetebilirsiniz.
                    </p>
                </div>
                <ProductDialog />
            </div>

            <ProductTable />
        </div>
    );
}
