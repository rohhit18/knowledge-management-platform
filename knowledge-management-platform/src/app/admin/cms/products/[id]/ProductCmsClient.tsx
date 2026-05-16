"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

type Tab = "overview" | "features" | "media" | "use-cases" | "architecture" | "downloads" | "faqs" | "seo";

interface MediaItem {
  id: string;
  title: string | null;
  url: string;
  type: "IMAGE" | "VIDEO";
  description: string | null;
  order: number;
}

interface UseCase {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  order: number;
}

interface ArchSection {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  order: number;
}

interface Download {
  id: string;
  name: string;
  description: string | null;
  fileUrl: string;
  fileType: string | null;
  fileSize: string | null;
  order: number;
}

interface Faq {
  id: string;
  question: string;
  answer: string;
  order: number;
}

interface ProductFeature {
  id: string;
  name: string;
  slug: string;
  status: string;
  order: number;
  overview: string | null;
  coverImage: string | null;
}

interface Product {
  id: string;
  name: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  overviewText?: string | null;
  bannerImage?: string | null;
  introVideo?: string | null;
  galleryImages?: string[];
  brochureUrls?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  platform: { name: string } | null;
  productFeatures: ProductFeature[];
  mediaItems: MediaItem[];
  useCases: UseCase[];
  architectureSections: ArchSection[];
  downloads: Download[];
  faqs: Faq[];
}

interface Props {
  product: Product;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "features", label: "Features" },
  { id: "media", label: "Media" },
  { id: "use-cases", label: "Use Cases" },
  { id: "architecture", label: "Architecture" },
  { id: "downloads", label: "Downloads" },
  { id: "faqs", label: "FAQs" },
  { id: "seo", label: "SEO" },
];

const inputCls =
  "border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full";
const btnPrimary =
  "px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors";
const btnDanger = "text-xs text-red-500 hover:text-red-700 transition-colors";
const labelCls = "block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1";

function SectionMessage({ msg }: { msg: { type: "success" | "error"; text: string } | null }) {
  if (!msg) return null;
  return (
    <p
      className={`text-xs mt-2 ${
        msg.type === "success"
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {msg.text}
    </p>
  );
}

function featureStatusVariant(status: string): "green" | "yellow" | "default" {
  if (status === "active") return "green";
  if (status === "in_development") return "yellow";
  return "default";
}

export function ProductCmsClient({ product }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Overview state
  const [overview, setOverview] = useState({
    shortDescription: product.shortDescription ?? "",
    fullDescription: product.fullDescription ?? "",
    overviewText: product.overviewText ?? "",
    bannerImage: product.bannerImage ?? "",
    introVideo: product.introVideo ?? "",
    galleryImages: (product.galleryImages ?? []).join(", "),
    brochureUrls: (product.brochureUrls ?? []).join(", "),
  });
  const [overviewMsg, setOverviewMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [overviewSaving, setOverviewSaving] = useState(false);

  // Features state
  const [features, setFeatures] = useState<ProductFeature[]>(product.productFeatures);
  const [showAddFeature, setShowAddFeature] = useState(false);
  const [newFeature, setNewFeature] = useState({ name: "", overview: "", coverImage: "" });
  const [featureMsg, setFeatureMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [featureSubmitting, setFeatureSubmitting] = useState(false);

  // Media state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(product.mediaItems);
  const [newMedia, setNewMedia] = useState({ url: "", type: "IMAGE" as "IMAGE" | "VIDEO", title: "", description: "" });
  const [mediaMsg, setMediaMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [mediaSubmitting, setMediaSubmitting] = useState(false);

  // Use Cases state
  const [useCases, setUseCases] = useState<UseCase[]>(product.useCases);
  const [newUseCase, setNewUseCase] = useState({ title: "", description: "", icon: "" });
  const [useCaseMsg, setUseCaseMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [useCaseSubmitting, setUseCaseSubmitting] = useState(false);

  // Architecture state
  const [archSections, setArchSections] = useState<ArchSection[]>(product.architectureSections);
  const [newArch, setNewArch] = useState({ title: "", description: "", imageUrl: "" });
  const [archMsg, setArchMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [archSubmitting, setArchSubmitting] = useState(false);

  // Downloads state
  const [downloads, setDownloads] = useState<Download[]>(product.downloads);
  const [newDownload, setNewDownload] = useState({ name: "", fileUrl: "", description: "", fileType: "", fileSize: "" });
  const [downloadMsg, setDownloadMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [downloadSubmitting, setDownloadSubmitting] = useState(false);

  // FAQs state
  const [faqs, setFaqs] = useState<Faq[]>(product.faqs);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [faqMsg, setFaqMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [faqSubmitting, setFaqSubmitting] = useState(false);

  // SEO state
  const [seo, setSeo] = useState({
    metaTitle: product.metaTitle ?? "",
    metaDescription: product.metaDescription ?? "",
    keywords: (product.keywords ?? []).join(", "),
  });
  const [seoMsg, setSeoMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [seoSaving, setSeoSaving] = useState(false);

  // --- Handlers ---
  async function saveOverview() {
    setOverviewSaving(true);
    setOverviewMsg(null);
    try {
      const res = await fetch(`/api/cms/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortDescription: overview.shortDescription,
          fullDescription: overview.fullDescription,
          overviewText: overview.overviewText,
          bannerImage: overview.bannerImage,
          introVideo: overview.introVideo,
          galleryImages: overview.galleryImages.split(",").map((s) => s.trim()).filter(Boolean),
          brochureUrls: overview.brochureUrls.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setOverviewMsg({ type: "success", text: "Overview saved successfully." });
    } catch {
      setOverviewMsg({ type: "error", text: "Failed to save overview. Please try again." });
    } finally {
      setOverviewSaving(false);
    }
  }

  async function addFeature() {
    if (!newFeature.name.trim()) return;
    setFeatureSubmitting(true);
    setFeatureMsg(null);
    try {
      const res = await fetch(`/api/cms/products/${product.id}/features`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFeature),
      });
      if (!res.ok) throw new Error("Failed to add");
      const created = await res.json();
      setFeatures((prev) => [...prev, created]);
      setNewFeature({ name: "", overview: "", coverImage: "" });
      setShowAddFeature(false);
      setFeatureMsg({ type: "success", text: "Feature added successfully." });
    } catch {
      setFeatureMsg({ type: "error", text: "Failed to add feature." });
    } finally {
      setFeatureSubmitting(false);
    }
  }

  async function addMedia() {
    if (!newMedia.url.trim()) return;
    setMediaSubmitting(true);
    setMediaMsg(null);
    try {
      const res = await fetch(`/api/cms/products/${product.id}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMedia),
      });
      if (!res.ok) throw new Error("Failed to add");
      const created = await res.json();
      setMediaItems((prev) => [...prev, created]);
      setNewMedia({ url: "", type: "IMAGE", title: "", description: "" });
      setMediaMsg({ type: "success", text: "Media added successfully." });
    } catch {
      setMediaMsg({ type: "error", text: "Failed to add media." });
    } finally {
      setMediaSubmitting(false);
    }
  }

  async function deleteMedia(id: string) {
    if (!confirm("Delete this media item?")) return;
    setMediaItems((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/cms/media/${id}`, { method: "DELETE" });
    } catch {
      setMediaMsg({ type: "error", text: "Failed to delete media item." });
    }
  }

  async function addUseCase() {
    if (!newUseCase.title.trim() || !newUseCase.description.trim()) return;
    setUseCaseSubmitting(true);
    setUseCaseMsg(null);
    try {
      const res = await fetch(`/api/cms/products/${product.id}/use-cases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUseCase),
      });
      if (!res.ok) throw new Error("Failed to add");
      const created = await res.json();
      setUseCases((prev) => [...prev, created]);
      setNewUseCase({ title: "", description: "", icon: "" });
      setUseCaseMsg({ type: "success", text: "Use case added successfully." });
    } catch {
      setUseCaseMsg({ type: "error", text: "Failed to add use case." });
    } finally {
      setUseCaseSubmitting(false);
    }
  }

  async function deleteUseCase(id: string) {
    if (!confirm("Delete this use case?")) return;
    setUseCases((prev) => prev.filter((u) => u.id !== id));
    try {
      await fetch(`/api/cms/use-cases/${id}`, { method: "DELETE" });
    } catch {
      setUseCaseMsg({ type: "error", text: "Failed to delete use case." });
    }
  }

  async function addArch() {
    if (!newArch.title.trim()) return;
    setArchSubmitting(true);
    setArchMsg(null);
    try {
      const res = await fetch(`/api/cms/products/${product.id}/architecture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArch),
      });
      if (!res.ok) throw new Error("Failed to add");
      const created = await res.json();
      setArchSections((prev) => [...prev, created]);
      setNewArch({ title: "", description: "", imageUrl: "" });
      setArchMsg({ type: "success", text: "Architecture section added successfully." });
    } catch {
      setArchMsg({ type: "error", text: "Failed to add architecture section." });
    } finally {
      setArchSubmitting(false);
    }
  }

  async function deleteArch(id: string) {
    if (!confirm("Delete this architecture section?")) return;
    setArchSections((prev) => prev.filter((a) => a.id !== id));
    try {
      await fetch(`/api/cms/architecture/${id}`, { method: "DELETE" });
    } catch {
      setArchMsg({ type: "error", text: "Failed to delete architecture section." });
    }
  }

  async function addDownload() {
    if (!newDownload.name.trim() || !newDownload.fileUrl.trim()) return;
    setDownloadSubmitting(true);
    setDownloadMsg(null);
    try {
      const res = await fetch(`/api/cms/products/${product.id}/downloads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDownload),
      });
      if (!res.ok) throw new Error("Failed to add");
      const created = await res.json();
      setDownloads((prev) => [...prev, created]);
      setNewDownload({ name: "", fileUrl: "", description: "", fileType: "", fileSize: "" });
      setDownloadMsg({ type: "success", text: "Download added successfully." });
    } catch {
      setDownloadMsg({ type: "error", text: "Failed to add download." });
    } finally {
      setDownloadSubmitting(false);
    }
  }

  async function deleteDownload(id: string) {
    if (!confirm("Delete this download?")) return;
    setDownloads((prev) => prev.filter((d) => d.id !== id));
    try {
      await fetch(`/api/cms/downloads/${id}`, { method: "DELETE" });
    } catch {
      setDownloadMsg({ type: "error", text: "Failed to delete download." });
    }
  }

  async function addFaq() {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return;
    setFaqSubmitting(true);
    setFaqMsg(null);
    try {
      const res = await fetch(`/api/cms/products/${product.id}/faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFaq),
      });
      if (!res.ok) throw new Error("Failed to add");
      const created = await res.json();
      setFaqs((prev) => [...prev, created]);
      setNewFaq({ question: "", answer: "" });
      setFaqMsg({ type: "success", text: "FAQ added successfully." });
    } catch {
      setFaqMsg({ type: "error", text: "Failed to add FAQ." });
    } finally {
      setFaqSubmitting(false);
    }
  }

  async function deleteFaq(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    try {
      await fetch(`/api/cms/faqs/${id}`, { method: "DELETE" });
    } catch {
      setFaqMsg({ type: "error", text: "Failed to delete FAQ." });
    }
  }

  async function saveSeo() {
    setSeoSaving(true);
    setSeoMsg(null);
    try {
      const res = await fetch(`/api/cms/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metaTitle: seo.metaTitle,
          metaDescription: seo.metaDescription,
          keywords: seo.keywords.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSeoMsg({ type: "success", text: "SEO settings saved successfully." });
    } catch {
      setSeoMsg({ type: "error", text: "Failed to save SEO settings." });
    } finally {
      setSeoSaving(false);
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{product.name}</h1>
          {product.platform && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{product.platform.name}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 border border-b-white dark:border-slate-700 dark:border-b-slate-800 border-slate-200 -mb-px"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Overview Content</h2>
            <div>
              <label className={labelCls}>Short Description</label>
              <textarea
                rows={2}
                className={inputCls}
                value={overview.shortDescription}
                onChange={(e) => setOverview((prev) => ({ ...prev, shortDescription: e.target.value }))}
                placeholder="Brief product description..."
              />
            </div>
            <div>
              <label className={labelCls}>Full Description</label>
              <textarea
                rows={5}
                className={inputCls}
                value={overview.fullDescription}
                onChange={(e) => setOverview((prev) => ({ ...prev, fullDescription: e.target.value }))}
                placeholder="Detailed product description..."
              />
            </div>
            <div>
              <label className={labelCls}>Overview Text</label>
              <textarea
                rows={3}
                className={inputCls}
                value={overview.overviewText}
                onChange={(e) => setOverview((prev) => ({ ...prev, overviewText: e.target.value }))}
                placeholder="Overview section text..."
              />
            </div>
            <div>
              <label className={labelCls}>Banner Image URL</label>
              <input
                type="url"
                className={inputCls}
                value={overview.bannerImage}
                onChange={(e) => setOverview((prev) => ({ ...prev, bannerImage: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className={labelCls}>Intro Video URL</label>
              <input
                type="url"
                className={inputCls}
                value={overview.introVideo}
                onChange={(e) => setOverview((prev) => ({ ...prev, introVideo: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className={labelCls}>Gallery Images (comma-separated URLs)</label>
              <textarea
                rows={2}
                className={inputCls}
                value={overview.galleryImages}
                onChange={(e) => setOverview((prev) => ({ ...prev, galleryImages: e.target.value }))}
                placeholder="https://img1.jpg, https://img2.jpg"
              />
            </div>
            <div>
              <label className={labelCls}>Brochure URLs (comma-separated)</label>
              <textarea
                rows={2}
                className={inputCls}
                value={overview.brochureUrls}
                onChange={(e) => setOverview((prev) => ({ ...prev, brochureUrls: e.target.value }))}
                placeholder="https://brochure1.pdf, https://brochure2.pdf"
              />
            </div>
            <div className="pt-2">
              <button onClick={saveOverview} disabled={overviewSaving} className={btnPrimary}>
                {overviewSaving ? "Saving…" : "Save Overview"}
              </button>
              <SectionMessage msg={overviewMsg} />
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === "features" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-white">Product Features</h2>
              <button
                onClick={() => setShowAddFeature((v) => !v)}
                className={btnPrimary}
              >
                {showAddFeature ? "Cancel" : "Add Feature"}
              </button>
            </div>

            {showAddFeature && (
              <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 mb-4 space-y-3 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">New Feature</h3>
                <div>
                  <label className={labelCls}>Name *</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={newFeature.name}
                    onChange={(e) => setNewFeature((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Feature name"
                  />
                </div>
                <div>
                  <label className={labelCls}>Overview</label>
                  <textarea
                    rows={3}
                    className={inputCls}
                    value={newFeature.overview}
                    onChange={(e) => setNewFeature((prev) => ({ ...prev, overview: e.target.value }))}
                    placeholder="Feature overview..."
                  />
                </div>
                <div>
                  <label className={labelCls}>Cover Image URL</label>
                  <input
                    type="url"
                    className={inputCls}
                    value={newFeature.coverImage}
                    onChange={(e) => setNewFeature((prev) => ({ ...prev, coverImage: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <button
                  onClick={addFeature}
                  disabled={featureSubmitting || !newFeature.name.trim()}
                  className={btnPrimary}
                >
                  {featureSubmitting ? "Adding…" : "Add Feature"}
                </button>
              </div>
            )}

            <SectionMessage msg={featureMsg} />

            {features.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">No features yet. Add your first feature above.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {features.map((f) => (
                  <li key={f.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs text-slate-400 w-6 text-center">{f.order}</span>
                      <span className="font-medium text-slate-900 dark:text-white truncate">{f.name}</span>
                      <Badge variant={featureStatusVariant(f.status)}>{f.status}</Badge>
                    </div>
                    <Link
                      href={`/admin/cms/products/${product.id}/features/${f.id}`}
                      className="ml-4 px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors whitespace-nowrap"
                    >
                      Edit
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Media Tab */}
        {activeTab === "media" && (
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Media</h2>

            {/* Add Media Form */}
            <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 mb-6 space-y-3 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Add Media</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>URL *</label>
                  <input
                    type="url"
                    className={inputCls}
                    value={newMedia.url}
                    onChange={(e) => setNewMedia((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className={labelCls}>Type</label>
                  <select
                    className={inputCls}
                    value={newMedia.type}
                    onChange={(e) => setNewMedia((prev) => ({ ...prev, type: e.target.value as "IMAGE" | "VIDEO" }))}
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Title</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={newMedia.title}
                    onChange={(e) => setNewMedia((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Media title"
                  />
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={newMedia.description}
                    onChange={(e) => setNewMedia((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                  />
                </div>
              </div>
              <button
                onClick={addMedia}
                disabled={mediaSubmitting || !newMedia.url.trim()}
                className={btnPrimary}
              >
                {mediaSubmitting ? "Adding…" : "Add Media"}
              </button>
              <SectionMessage msg={mediaMsg} />
            </div>

            {/* Media Grid */}
            {mediaItems.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">No media yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {mediaItems.map((m) => (
                  <div key={m.id} className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
                    <div className="aspect-video bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      {m.type === "IMAGE" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.url} alt={m.title ?? ""} className="w-full h-full object-cover" />
                      ) : (
                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-xs underline px-2 text-center">
                          Video Link
                        </a>
                      )}
                    </div>
                    <div className="p-2">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs text-slate-700 dark:text-slate-300 truncate">{m.title ?? "Untitled"}</span>
                        <Badge variant={m.type === "IMAGE" ? "blue" : "purple"}>{m.type}</Badge>
                      </div>
                      <button onClick={() => deleteMedia(m.id)} className={`${btnDanger} mt-1`}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Use Cases Tab */}
        {activeTab === "use-cases" && (
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Use Cases</h2>

            <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 mb-6 space-y-3 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Add Use Case</h3>
              <div>
                <label className={labelCls}>Title *</label>
                <input
                  type="text"
                  className={inputCls}
                  value={newUseCase.title}
                  onChange={(e) => setNewUseCase((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Use case title"
                />
              </div>
              <div>
                <label className={labelCls}>Description *</label>
                <textarea
                  rows={3}
                  className={inputCls}
                  value={newUseCase.description}
                  onChange={(e) => setNewUseCase((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the use case..."
                />
              </div>
              <div>
                <label className={labelCls}>Icon (Lucide icon name or emoji)</label>
                <input
                  type="text"
                  className={inputCls}
                  value={newUseCase.icon}
                  onChange={(e) => setNewUseCase((prev) => ({ ...prev, icon: e.target.value }))}
                  placeholder="e.g. Shield or 🛡️"
                />
              </div>
              <button
                onClick={addUseCase}
                disabled={useCaseSubmitting || !newUseCase.title.trim() || !newUseCase.description.trim()}
                className={btnPrimary}
              >
                {useCaseSubmitting ? "Adding…" : "Add Use Case"}
              </button>
              <SectionMessage msg={useCaseMsg} />
            </div>

            {useCases.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">No use cases yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {useCases.map((uc) => (
                  <li key={uc.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {uc.icon && <span className="text-base">{uc.icon}</span>}
                        <span className="font-medium text-slate-900 dark:text-white">{uc.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{uc.description}</p>
                    </div>
                    <button onClick={() => deleteUseCase(uc.id)} className={`${btnDanger} shrink-0`}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Architecture Tab */}
        {activeTab === "architecture" && (
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Architecture</h2>

            <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 mb-6 space-y-3 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Add Architecture Section</h3>
              <div>
                <label className={labelCls}>Title *</label>
                <input
                  type="text"
                  className={inputCls}
                  value={newArch.title}
                  onChange={(e) => setNewArch((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Section title"
                />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  rows={3}
                  className={inputCls}
                  value={newArch.description}
                  onChange={(e) => setNewArch((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Section description..."
                />
              </div>
              <div>
                <label className={labelCls}>Image URL</label>
                <input
                  type="url"
                  className={inputCls}
                  value={newArch.imageUrl}
                  onChange={(e) => setNewArch((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <button
                onClick={addArch}
                disabled={archSubmitting || !newArch.title.trim()}
                className={btnPrimary}
              >
                {archSubmitting ? "Adding…" : "Add Section"}
              </button>
              <SectionMessage msg={archMsg} />
            </div>

            {archSections.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">No architecture sections yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {archSections.map((a) => (
                  <li key={a.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-medium text-slate-900 dark:text-white">{a.title}</span>
                      {a.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{a.description}</p>
                      )}
                      {a.imageUrl && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{a.imageUrl}</p>
                      )}
                    </div>
                    <button onClick={() => deleteArch(a.id)} className={`${btnDanger} shrink-0`}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Downloads Tab */}
        {activeTab === "downloads" && (
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Downloads</h2>

            <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 mb-6 space-y-3 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Add Download</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Name *</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={newDownload.name}
                    onChange={(e) => setNewDownload((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="File name"
                  />
                </div>
                <div>
                  <label className={labelCls}>File URL *</label>
                  <input
                    type="url"
                    className={inputCls}
                    value={newDownload.fileUrl}
                    onChange={(e) => setNewDownload((prev) => ({ ...prev, fileUrl: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className={labelCls}>File Type</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={newDownload.fileType}
                    onChange={(e) => setNewDownload((prev) => ({ ...prev, fileType: e.target.value }))}
                    placeholder="e.g. PDF, XLSX"
                  />
                </div>
                <div>
                  <label className={labelCls}>File Size</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={newDownload.fileSize}
                    onChange={(e) => setNewDownload((prev) => ({ ...prev, fileSize: e.target.value }))}
                    placeholder="e.g. 2.4 MB"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Description</label>
                  <input
                    type="text"
                    className={inputCls}
                    value={newDownload.description}
                    onChange={(e) => setNewDownload((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                  />
                </div>
              </div>
              <button
                onClick={addDownload}
                disabled={downloadSubmitting || !newDownload.name.trim() || !newDownload.fileUrl.trim()}
                className={btnPrimary}
              >
                {downloadSubmitting ? "Adding…" : "Add Download"}
              </button>
              <SectionMessage msg={downloadMsg} />
            </div>

            {downloads.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">No downloads yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {downloads.map((d) => (
                  <li key={d.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">{d.name}</span>
                        {d.fileType && <Badge variant="default">{d.fileType}</Badge>}
                      </div>
                      {d.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{d.description}</p>
                      )}
                      {d.fileSize && (
                        <p className="text-xs text-slate-400 mt-0.5">{d.fileSize}</p>
                      )}
                    </div>
                    <button onClick={() => deleteDownload(d.id)} className={`${btnDanger} shrink-0`}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === "faqs" && (
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">FAQs</h2>

            <div className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 mb-6 space-y-3 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Add FAQ</h3>
              <div>
                <label className={labelCls}>Question *</label>
                <input
                  type="text"
                  className={inputCls}
                  value={newFaq.question}
                  onChange={(e) => setNewFaq((prev) => ({ ...prev, question: e.target.value }))}
                  placeholder="Frequently asked question"
                />
              </div>
              <div>
                <label className={labelCls}>Answer *</label>
                <textarea
                  rows={4}
                  className={inputCls}
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq((prev) => ({ ...prev, answer: e.target.value }))}
                  placeholder="Answer to the question..."
                />
              </div>
              <button
                onClick={addFaq}
                disabled={faqSubmitting || !newFaq.question.trim() || !newFaq.answer.trim()}
                className={btnPrimary}
              >
                {faqSubmitting ? "Adding…" : "Add FAQ"}
              </button>
              <SectionMessage msg={faqMsg} />
            </div>

            {faqs.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">No FAQs yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {faqs.map((f) => (
                  <li key={f.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-medium text-slate-900 dark:text-white">{f.question}</span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{f.answer}</p>
                    </div>
                    <button onClick={() => deleteFaq(f.id)} className={`${btnDanger} shrink-0`}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === "seo" && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-white mb-4">SEO Settings</h2>
            <div>
              <label className={labelCls}>Meta Title</label>
              <input
                type="text"
                className={inputCls}
                value={seo.metaTitle}
                onChange={(e) => setSeo((prev) => ({ ...prev, metaTitle: e.target.value }))}
                placeholder="Page title for search engines"
              />
            </div>
            <div>
              <label className={labelCls}>Meta Description</label>
              <textarea
                rows={3}
                className={inputCls}
                value={seo.metaDescription}
                onChange={(e) => setSeo((prev) => ({ ...prev, metaDescription: e.target.value }))}
                placeholder="Short description for search results (150–160 chars recommended)"
              />
            </div>
            <div>
              <label className={labelCls}>Keywords (comma-separated)</label>
              <input
                type="text"
                className={inputCls}
                value={seo.keywords}
                onChange={(e) => setSeo((prev) => ({ ...prev, keywords: e.target.value }))}
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
            <div className="pt-2">
              <button onClick={saveSeo} disabled={seoSaving} className={btnPrimary}>
                {seoSaving ? "Saving…" : "Save SEO"}
              </button>
              <SectionMessage msg={seoMsg} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
