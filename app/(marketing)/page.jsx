import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      
      <h1 className="text-4xl font-bold mb-4">
        Stock Tracking Application
      </h1>

      <p className="text-lg mb-8">
        Welcome to the stock tracking system
      </p>

      <Link
        href="/login"
        className="
          inline-flex items-center justify-center
          rounded-lg
          bg-blue-600 hover:bg-blue-700
          px-6 py-3
          text-base font-medium text-white
          transition-colors
        "
      >
        Giriş Yap
      </Link>

    </main>
  );
}
