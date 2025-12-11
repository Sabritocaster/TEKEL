const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("seeding Başladı...\n");

  // ADMIN KULLANICISI
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const user = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      name: "Admin User",
    },
  });
  console.log("Admin kullanıcısı oluşturuldu/güncellendi: admin / admin123");

  // ÖRNEK ÜRÜNLER
  const raki = await prisma.product.create({
    data: {
      name: "Yeni Rakı",
      ccValue: "70cl",
      category: "Rakı",
    },
  });

  const vodka = await prisma.product.create({
    data: {
      name: "Absolut Vodka",
      ccValue: "50cl",
      category: "Votka",
    },
  });

  console.log("2 ürün oluşturuldu");

  // ALIŞ
  // 10 adet yeni Rakı birim fiyat 300 TL
  const purchase1 = await prisma.stockTransaction.create({
    data: {
      productId: raki.id,
      type: "PURCHASE",
      quantity: 10,
      unitPrice: 300,
      totalPrice: 10 * 300,
    },
  });

  // Ürünün stok ve averageCost güncellemesi
  await prisma.product.update({
    where: { id: raki.id },
    data: {
      currentStock: 10,
      averageCost: 300,
    },
  });

  console.log("yeni rakı için ilk alış eklendi.");

  // İKİNCİ ALIŞŞ (PURCHASE)
  // 5 adet Yeni Rakı birim fiyat 350 TL
  // Yeni averageCost Ağırlıklı ortalama formülü

  const oldStock = 10;
  const oldAvg = 300;
  const newQty = 5;
  const newPrice = 350;

  const newAverage =
    (oldStock * oldAvg + newQty * newPrice) / (oldStock + newQty);

  const purchase2 = await prisma.stockTransaction.create({
    data: {
      productId: raki.id,
      type: "PURCHASE",
      quantity: 5,
      unitPrice: 350,
      totalPrice: 5 * 350,
    },
  });

  await prisma.product.update({
    where: { id: raki.id },
    data: {
      currentStock: oldStock + newQty,
      averageCost: Number(newAverage.toFixed(2)),
    },
  });

  console.log("yeni rakı için ikinci alış işlemi eklendi.");

  // SATIŞ
  // 3 adet Yeni Rakı satış fiyatı 500 TL
  // snapshotCost  o anki averageCost

  const productAfterPurchases = await prisma.product.findUnique({
    where: { id: raki.id },
  });

  const sale1 = await prisma.stockTransaction.create({
    data: {
      productId: raki.id,
      type: "SALE",
      quantity: 3,
      unitPrice: 500,
      totalPrice: 3 * 500,
      snapshotCost: productAfterPurchases.averageCost,
    },
  });

  await prisma.product.update({
    where: { id: raki.id },
    data: {
      currentStock: productAfterPurchases.currentStock - 3,
    },
  });

  console.log("yeni rakı için satış işlemi eklendi");

  console.log("\nseed başarıyla tamamlandı");
}

main()
  .catch((e) => {
    console.error("seed hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
