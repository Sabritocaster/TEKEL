# TEKEL Market Stok Takip Sistemi - Frontend

Bu proje, Tekel bayileri için geliştirilmiş modern bir arayüze sahip stok ve kârlılık takip sistemidir.

## 🚀 Proje Durumu (Frontend Tamamlandı)

Projenin frontend geliştirmesi tamamlanmış olup, şu an **Mock Data** (temsili veriler) ile çalışmaktadır. Kullanıcı arayüzü, formlar, tablolar ve grafikler tamamen işlevseldir.

### ✅ Tamamlanan Özellikler
- **Genel Bakış (Dashboard):** Kritik stok, toplam kâr ve stok değeri özetleri.
- **Ürün Yönetimi:** Ürün ekleme, listeleme ve stok durumu (Kritik/Normal) takibi.
- **Stok Hareketleri:** Hızlı stok girişi (Alış) ve çıkışı (Satış) formları.
- **Analiz:** Gelir/Gider ve Fiyat Trendi grafikleri (Recharts).
- **Tasarım:** Premium "Deep Navy & Gold" teması, responsive (mobil uyumlu) yapı, havalı tekel logosu.

### 🛠 Teknoloji Yığını
- **Framework:** Next.js 16 (App Router)
- **UI Kütüphanesi:** Shadcn/ui + Tailwind CSS
- **State Yönetimi:** Zustand (Client side state)
- **Veri Yönetimi:** TanStack Query (Hazırlandı, backend bekliyor)
- **Formlar:** React Hook Form + Zod
- **Grafikler:** Recharts

---

## 🔜 Backend Entegrasyonu (Yapılacaklar)

Backend API servisleri (MongoDB + Prisma) hazırlandığında frontend tarafında yapılması gereken değişiklikler şunlardır:

### 1. Servis Bağlantıları
Backend API endpoint'leri için servis fonksiyonları yazılmalı.
*Örnek (`src/services/productService.ts`):*
```typescript
export const getProducts = async () => {
  const res = await fetch('/api/products');
  return res.json();
};
```

### 2. State Yönetimini Güncelleme
Şu an `useProductStore` içinde tutulan mock veriler yerine **TanStack Query** kullanılmalı.

*Eski (Zustand Mock):*
```typescript
const { products } = useProductStore();
```

*Yeni (TanStack Query):*
```typescript
const { data: products } = useQuery({ 
  queryKey: ['products'], 
  queryFn: getProducts 
});
```

### 3. Mutation (Veri Değişikliği) İşlemleri
Ürün ekleme ve stok hareketi işlemleri için `useMutation` hook'ları eklenmeli.

```typescript
const mutation = useMutation({
  mutationFn: (newProduct) => axios.post('/api/products', newProduct),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    toast.success('Ürün eklendi!');
  },
});
```

---

## 💻 Kurulum ve Çalıştırma

Projeyi yerel ortamda çalıştırmak için:

1. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

2. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```

3. **Tarayıcıda açın:**
   [http://localhost:3000](http://localhost:3000)
