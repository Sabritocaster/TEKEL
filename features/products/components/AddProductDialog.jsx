'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog.jsx';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProductAction, updateProductAction } from '@/features/products/actions.js';
import { toast } from 'sonner';

export function ProductDialog({ productToEdit, trigger, open: controlledOpen, onOpenChange: setControlledOpen }) {
    const [internalOpen, setInternalOpen] = useState(false);
    const queryClient = useQueryClient();

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? setControlledOpen : setInternalOpen;

    const isEditMode = !!productToEdit;

    const mutation = useMutation({
        mutationFn: (data) => {
            if (isEditMode) {
                return updateProductAction({ ...data, id: productToEdit.id });
            }
            return createProductAction(data);
        },
        onSuccess: (result) => {
            if (result.success) {
                toast.success(isEditMode ? 'Ürün güncellendi' : 'Ürün başarıyla eklendi');
                queryClient.invalidateQueries({ queryKey: ['products'] });
                if (setOpen) setOpen(false);
            } else {
                toast.error(result.error);
            }
        },
        onError: (error) => {
            console.error('Mutation Error:', error);
            toast.error(`Hata: ${error.message}`);
        }
    });

    const handleSubmit = (data) => {
        const plainData = {
            name: String(data.name || ''),
            category: String(data.category || ''),
            cc: String(data.cc || ''),
            minStock: Number(data.minStock || 0),
        };

        if (data.maxStock !== undefined && data.maxStock !== null) {
            plainData.maxStock = Number(data.maxStock);
        }

        const serialized = JSON.parse(JSON.stringify(plainData));
        mutation.mutate(serialized);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && (
                trigger ? (
                    <DialogTrigger asChild>{trigger}</DialogTrigger>
                ) : (
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Yeni Ürün Ekle
                        </Button>
                    </DialogTrigger>
                )
            )}

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                    </DialogTitle>
                </DialogHeader>

                <div key={productToEdit?.id}>
                    <ProductForm
                        defaultValues={
                            productToEdit
                                ? {
                                    name: productToEdit.name,
                                    category: productToEdit.category,
                                    cc: productToEdit.ccValue,
                                    minStock: productToEdit.minStock || 0,
                                    maxStock: productToEdit.maxStock
                                }
                                : undefined
                        }
                        onSubmit={handleSubmit}
                        onCancel={() => setOpen && setOpen(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
