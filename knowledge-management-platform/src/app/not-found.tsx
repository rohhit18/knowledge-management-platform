import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-3">Page not found</h2>
      <p className="text-gray-500 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
        Go home
      </Link>
    </div>
  );
}
