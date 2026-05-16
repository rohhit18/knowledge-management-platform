interface UseCase {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  order: number;
}

interface Props {
  useCases: UseCase[];
}

export function UseCaseGrid({ useCases }: Props) {
  if (useCases.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {useCases.map((useCase) => (
        <div
          key={useCase.id}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5"
        >
          {useCase.icon && (
            <span className="text-2xl mb-3 block" aria-hidden="true">
              {useCase.icon}
            </span>
          )}
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
            {useCase.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {useCase.description}
          </p>
        </div>
      ))}
    </div>
  );
}
