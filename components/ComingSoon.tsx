export default function ComingSoon({
  eyebrow,
  title,
  description,
  needs,
}: {
  eyebrow: string;
  title: string;
  description: string;
  needs: string[];
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-[#C2703D] font-medium mb-1">{eyebrow}</p>
      <h1 className="font-serif text-3xl font-bold tracking-tight mb-1">{title}</h1>
      <p className="text-[#8A8378] text-sm mb-8 max-w-xl">{description}</p>

      <div className="bg-white border border-dashed border-[#D8CFBB] rounded-xl p-8 max-w-xl">
        <div className="text-xs uppercase tracking-widest text-[#8A8378] mb-3">Not built yet — needs a decision first:</div>
        <ul className="flex flex-col gap-2">
          {needs.map((n) => (
            <li key={n} className="text-sm flex items-start gap-2">
              <span className="text-[#C2703D] mt-0.5">•</span>
              {n}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
