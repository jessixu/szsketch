import { animals } from "@/data/animals";

export default function OriginSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-lg font-bold">1. 原形（选择或输入）</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例如：神鸟、异兽、玄鲲、火凤、白泽、鹿隐等"
        className="mt-3 w-full rounded-lg border border-stone-200 bg-[#fffaf2] px-4 py-3 outline-none focus:border-[#9c7b4f]"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {animals.map((animal) => (
          <button
            key={animal}
            onClick={() => onChange(animal)}
            className="rounded-lg bg-[#f3eadf] px-5 py-2 text-stone-700 hover:bg-[#ead8c2]"
          >
            {animal}
          </button>
        ))}
      </div>
    </div>
  );
}
