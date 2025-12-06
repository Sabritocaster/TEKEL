import { AddProductDialog } from '@/components/products/AddProductDialog';
import { ProductTable } from '@/components/products/ProductTable';

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
                <AddProductDialog />
            </div>

            <ProductTable />
        </div>
    );
}
