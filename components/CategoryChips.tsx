type Props = {
  categories: string[];
  active?: string;
};

export function CategoryChips({ categories, active }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => {
        const isActive = active === category;
        return (
          <span
            key={category}
            className={`rounded-full border px-4 py-2 text-sm uppercase tracking-wide ${
              isActive
                ? "border-forest bg-forest text-background"
                : "border-ink/10 bg-white/70 text-ink/70"
            }`}
          >
            {category}
          </span>
        );
      })}
    </div>
  );
}
