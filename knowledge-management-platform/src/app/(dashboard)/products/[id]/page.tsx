import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Package,
  ChevronRight,
  FolderKanban,
  FileText,
  User,
  Tag,
  Layers,
  Play,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "@/components/ui/Table";
import { DOC_TYPE_LABELS, PROJECT_STATUS_LABELS, ProjectStatus } from "@/types";
import { formatDate, truncate } from "@/lib/utils";
import { FeatureCard } from "@/components/cms/FeatureCard";
import { UseCaseGrid } from "@/components/cms/UseCaseGrid";
import { ArchitectureList } from "@/components/cms/ArchitectureList";
import { DownloadList } from "@/components/cms/DownloadList";
import { FAQAccordion } from "@/components/cms/FAQAccordion";
import { MediaGallery } from "@/components/cms/MediaGallery";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: { name: true, metaTitle: true, metaDescription: true, keywords: true },
  });
  return {
    title: product?.metaTitle ?? product?.name ?? "Product",
    description: product?.metaDescription ?? undefined,
    keywords: product?.keywords?.join(", ") ?? undefined,
  };
}

function projectStatusVariant(status: ProjectStatus): "green" | "yellow" | "orange" | "default" {
  switch (status) {
    case "ACTIVE": return "green";
    case "PLANNING": return "yellow";
    case "ON_HOLD": return "orange";
    default: return "default";
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      platform: true,
      owner: { select: { name: true } },
      tags: true,
      // CMS content
      mediaItems: { orderBy: [{ order: "asc" }] },
      useCases: { orderBy: [{ order: "asc" }] },
      architectureSections: { orderBy: [{ order: "asc" }] },
      downloads: { orderBy: [{ order: "asc" }] },
      faqs: { orderBy: [{ order: "asc" }] },
      productFeatures: {
        include: {
          _count: { select: { useCases: true, downloads: true, faqs: true } },
        },
        orderBy: [{ order: "asc" }, { name: "asc" }],
      },
      // Existing relations
      projects: {
        include: { _count: { select: { modules: true, members: true } } },
        orderBy: { name: "asc" },
      },
      documents: {
        include: { author: { select: { name: true } } },
        orderBy: { updatedAt: "desc" },
        take: 20,
      },
    },
  });

  if (!product) notFound();

  const hasCmsContent =
    product.fullDescription ||
    product.overviewText ||
    product.introVideo ||
    product.galleryImages.length > 0 ||
    product.mediaItems.length > 0 ||
    product.useCases.length > 0 ||
    product.architectureSections.length > 0 ||
    product.downloads.length > 0 ||
    product.faqs.length > 0;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/products" className="hover:text-slate-700 dark:hover:text-slate-200">
          {product.platform.name}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 dark:text-slate-100 font-medium">{product.name}</span>
      </nav>

      {/* Banner image */}
      {product.bannerImage && (
        <div className="w-full aspect-[3/1] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <img
            src={product.bannerImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Product header */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex-shrink-0">
            <Package className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{product.name}</h1>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  Platform: {product.platform.name}
                </p>
              </div>
              <Badge variant={product.status === "active" ? "green" : "default"}>
                {product.status}
              </Badge>
            </div>

            {/* Short description (CMS) takes priority over legacy description */}
            {(product.shortDescription || product.description) && (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {product.shortDescription ?? product.description}
              </p>
            )}

            {product.owner && (
              <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <User className="w-4 h-4" />
                <span>Owner: {product.owner.name}</span>
              </div>
            )}

            {product.techStack.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {product.tags.length > 0 && (
              <div className="mt-3 flex items-center flex-wrap gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                {product.tags.map((tag) => (
                  <Badge key={tag.id} variant="default">{tag.name}</Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CMS CONTENT ─────────────────────────────────── */}

      {/* Full description / overview */}
      {(product.fullDescription || product.overviewText) && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-4">
          {product.fullDescription && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">About</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {product.fullDescription}
              </p>
            </div>
          )}
          {product.overviewText && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Overview</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {product.overviewText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Intro video */}
      {product.introVideo && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Introduction Video</h2>
          <a
            href={product.introVideo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            Watch Video
          </a>
        </div>
      )}

      {/* Media gallery */}
      {product.mediaItems.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Gallery</h2>
          <MediaGallery items={product.mediaItems} />
        </div>
      )}

      {/* Static gallery images (from galleryImages string[]) */}
      {product.galleryImages.length > 0 && product.mediaItems.length === 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {product.galleryImages.map((url, i) => (
              <div key={i} className="aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      {product.productFeatures.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-purple-500" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Features ({product.productFeatures.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {product.productFeatures.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={{
                  id: feature.id,
                  name: feature.name,
                  slug: feature.slug,
                  overview: feature.overview,
                  coverImage: feature.coverImage,
                  status: feature.status,
                  _count: feature._count,
                }}
                productId={product.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Use cases */}
      {product.useCases.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Use Cases</h2>
          <UseCaseGrid useCases={product.useCases} />
        </div>
      )}

      {/* Architecture */}
      {product.architectureSections.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">System Architecture</h2>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <ArchitectureList sections={product.architectureSections} />
          </div>
        </div>
      )}

      {/* Downloads */}
      {product.downloads.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Downloads & Resources</h2>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-700">
            <DownloadList downloads={product.downloads} />
          </div>
        </div>
      )}

      {/* FAQs */}
      {product.faqs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          <FAQAccordion faqs={product.faqs} />
        </div>
      )}

      {/* ── EXISTING CONTENT ────────────────────────────── */}

      {/* Projects */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Projects ({product.projects.length})
        </h2>
        {product.projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban />}
            title="No projects yet"
            description="No projects have been created under this product."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {product.projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full">
                  <CardContent className="flex flex-col h-full">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {project.name}
                      </h3>
                      <Badge variant={projectStatusVariant(project.status)}>
                        {PROJECT_STATUS_LABELS[project.status]}
                      </Badge>
                    </div>
                    {project.clientName && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        Client: {project.clientName}
                      </p>
                    )}
                    {project.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex-1">
                        {truncate(project.description, 80)}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-auto pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                      <span>{project._count.modules} modules</span>
                      <span>{project._count.members} members</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Documents */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
          Documents ({product.documents.length})
        </h2>
        {product.documents.length === 0 ? (
          <EmptyState
            icon={<FileText />}
            title="No documents yet"
            description="No documents have been attached to this product."
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Title</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Author</TableHeader>
                <TableHeader>Version</TableHeader>
                <TableHeader>Updated</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {product.documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="font-medium text-slate-900 dark:text-slate-100 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {doc.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{DOC_TYPE_LABELS[doc.type]}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">
                    {doc.author.name}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    v{doc.version}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {formatDate(doc.updatedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
