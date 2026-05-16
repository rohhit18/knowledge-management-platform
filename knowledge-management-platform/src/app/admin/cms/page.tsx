import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Package, Puzzle, Lightbulb, Download } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "CMS Management — Admin" };

export default async function CmsOverviewPage() {
  const products = await prisma.product.findMany({
    include: {
      platform: true,
      _count: {
        select: {
          productFeatures: true,
          useCases: true,
          downloads: true,
          faqs: true,
        },
      },
    },
    orderBy: [{ platform: { name: "asc" } }, { name: "asc" }],
  });

  const totalFeatures = products.reduce((sum, p) => sum + p._count.productFeatures, 0);
  const totalUseCases = products.reduce((sum, p) => sum + p._count.useCases, 0);
  const totalDownloads = products.reduce((sum, p) => sum + p._count.downloads, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CMS Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage product content, features, use cases, and more
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="inline-flex p-2 rounded-lg bg-blue-50 dark:bg-blue-950 mb-3">
            <Package className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{products.length}</p>
          <p className="text-sm text-slate-500 mt-1">Products</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="inline-flex p-2 rounded-lg bg-purple-50 dark:bg-purple-950 mb-3">
            <Puzzle className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalFeatures}</p>
          <p className="text-sm text-slate-500 mt-1">Product Features</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="inline-flex p-2 rounded-lg bg-green-50 dark:bg-green-950 mb-3">
            <Lightbulb className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalUseCases}</p>
          <p className="text-sm text-slate-500 mt-1">Use Cases</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="inline-flex p-2 rounded-lg bg-orange-50 dark:bg-orange-950 mb-3">
            <Download className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalDownloads}</p>
          <p className="text-sm text-slate-500 mt-1">Downloads</p>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">Products</h2>
        </div>
        {products.length === 0 ? (
          <EmptyState
            icon={<Package />}
            title="No products found"
            description="Products will appear here once they are created."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Product</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden md:table-cell">Platform</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Features</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Use Cases</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">Downloads</th>
                <th className="text-left px-6 py-3 font-semibold text-slate-600 dark:text-slate-400 hidden lg:table-cell">FAQs</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/products/${product.id}`}
                      className="font-medium text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                    {product.platform?.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                    {product._count.productFeatures}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                    {product._count.useCases}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                    {product._count.downloads}
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                    {product._count.faqs}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/cms/products/${product.id}`}
                      className="px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap"
                    >
                      Edit CMS
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
