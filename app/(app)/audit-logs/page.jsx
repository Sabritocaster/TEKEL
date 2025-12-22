import { prisma } from "@/lib/prisma.js";
import { Card } from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table.jsx";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { startOfDay, subDays } from "date-fns";

export const dynamic = "force-dynamic";

const TZ = "Europe/Istanbul";

// VERILERI CEK

async function getLogs(filter) {
  const now = new Date();

  let where = {};

  if (filter === "today") {
    const zonedNow = toZonedTime(now, TZ);
    const startZoned = startOfDay(zonedNow);
    const startUtc = fromZonedTime(startZoned, TZ);

    where = { createdAt: { gte: startUtc } };
  }

  if (filter === "yesterday") {
    const zonedNow = toZonedTime(now, TZ);
    const todayStartZoned = startOfDay(zonedNow);
    const yesterdayStartZoned = startOfDay(subDays(zonedNow, 1));

    const todayStartUtc = fromZonedTime(todayStartZoned, TZ);
    const yesterdayStartUtc = fromZonedTime(yesterdayStartZoned, TZ);

    where = {
      createdAt: {
        gte: yesterdayStartUtc,
        lt: todayStartUtc,
      },
    };
  }

  if (filter === "last7") {
    const zonedNow = toZonedTime(now, TZ);
    const startZoned = startOfDay(subDays(zonedNow, 7));
    const startUtc = fromZonedTime(startZoned, TZ);

    where = { createdAt: { gte: startUtc } };
  }

  const logs = await prisma.actionLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return JSON.parse(JSON.stringify(logs));
}

function formatAction(action) {
  const map = {
    PRODUCT_CREATE: "Ürün Oluşturma",
    PRODUCT_UPDATE: "Ürün Güncelleme",
    PRODUCT_DELETE: "Ürün Silme",

    STOCK_PURCHASE: "Stok Girişi",
    STOCK_SALE: "Stok Çıkışı",
    STOCK_UPDATE: "Stok Hareketi Güncelleme",
  };

  return map[action] || action;
}

function extractProductName(message) {
  if (!message) return null;

  const match = message.match(/Ürün=([^,]+)/);
  return match ? match[1].trim() : null;
}

function formatTarget(log) {
  const name = extractProductName(log.message);

  if (log.targetType === "Product") {
    return name ? `Ürün – ${name}` : "Ürün";
  }

  if (log.targetType === "StockTransaction") {
    return name ? `Stok Hareketi – ${name}` : "Stok Hareketi";
  }

  return "-";
}

function badgeColor(action) {
  const map = {
    STOCK_PURCHASE: "bg-green-600/20 text-green-400",
    STOCK_SALE: "bg-red-600/20 text-red-400",
    STOCK_UPDATE: "bg-blue-600/20 text-blue-400",

    PRODUCT_CREATE: "bg-green-600/20 text-green-400",
    PRODUCT_UPDATE: "bg-blue-600/20 text-blue-400",
    PRODUCT_DELETE: "bg-red-600/20 text-red-400",
  };

  return map[action] || "bg-gray-600/20 text-gray-300";
}

export default async function AuditLogsPage({ searchParams }) {
  const filter = searchParams?.filter || null;
  const logs = await getLogs(filter);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">İşlem Logları</h1>
      </div>

      <div className="flex gap-2 mb-2">
        <a href="?filter=today">
          <Badge
            variant="outline"
            className={filter === "today" ? "bg-white text-black" : ""}
          >
            Bugün
          </Badge>
        </a>
        <a href="?filter=yesterday">
          <Badge
            variant="outline"
            className={filter === "yesterday" ? "bg-white text-black" : ""}
          >
            Dün
          </Badge>
        </a>
        <a href="?filter=last7">
          <Badge
            variant="outline"
            className={filter === "last7" ? "bg-white text-black" : ""}
          >
            Son 7 Gün
          </Badge>
        </a>
        <a href="?filter=all">
          <Badge
            variant="outline"
            className={
              filter === "all" || filter === null ? "bg-white text-black" : ""
            }
          >
            Tümü
          </Badge>
        </a>
      </div>

      {/* Tablo */}
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Tarih</TableHead>
              <TableHead className="w-[160px]">İşlem Türü</TableHead>
              <TableHead className="w-[200px]">Hedef Kayıt</TableHead>
              <TableHead>Açıklama</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                {/* Tarih */}
                <TableCell className="whitespace-nowrap text-sm">
                  {new Intl.DateTimeFormat("tr-TR", {
                    timeZone: "Europe/Istanbul",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }).format(new Date(log.createdAt))}
                </TableCell>

                {/* İşlem Türü */}
                <TableCell className="text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${badgeColor(
                      log.action
                    )}`}
                  >
                    {formatAction(log.action)}
                  </span>
                </TableCell>

                {/* Hedef Kayıt */}
                <TableCell className="text-sm whitespace-nowrap">
                  {formatTarget(log)}
                </TableCell>

                {/* Açıklama */}
                <TableCell className="text-sm whitespace-normal break-words">
                  {log.message || "-"}
                </TableCell>
              </TableRow>
            ))}

            {logs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-muted-foreground"
                >
                  Bu tarih aralığında işlem bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
