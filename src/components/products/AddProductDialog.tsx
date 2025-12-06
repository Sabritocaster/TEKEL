'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { useProductStore } from '@/stores/useProductStore';
import { Product } from '@/lib/types';
import { toast } from 'sonner';

export function AddProductDialog() {
    const [open, setOpen] = useState(false);
    const { addProduct } = useProductStore();

    const handleSubmit = (data: any) => {
        // Mock ID generation
        const newProduct: Product = {
            id: Math.random().toString(36).substr(2, 9),
            ...data,
            currentStock: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        addProduct(newProduct);
        toast.success('Ürün başarıyla eklendi');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Yeni Ürün Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Yeni Ürün Ekle</DialogTitle>
                </DialogHeader>
                <ProductForm onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}
