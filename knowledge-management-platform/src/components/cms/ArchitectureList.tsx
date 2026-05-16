interface ArchSection {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  order: number;
}

interface Props {
  sections: ArchSection[];
}

export function ArchitectureList({ sections }: Props) {
  if (sections.length === 0) return null;

  return (
    <div className="space-y-0">
      {sections.map((section, index) => (
        <div key={section.id}>
          <div className="py-5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {section.title}
            </h3>

            {section.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap mb-4">
                {section.description}
              </p>
            )}

            {section.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={section.imageUrl}
                alt={section.title}
                className="w-full rounded-lg max-h-80 object-contain bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700"
              />
            )}
          </div>

          {index < sections.length - 1 && (
            <hr className="border-slate-200 dark:border-slate-700" />
          )}
        </div>
      ))}
    </div>
  );
}
