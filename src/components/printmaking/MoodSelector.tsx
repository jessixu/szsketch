import { moods } from "@/data/moods";

export default function MoodSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-lg font-bold">2. 气质（选择）</label>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {moods.map((item) => (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`rounded-lg border px-4 py-3 font-medium ${
              value === item
                ? "border-[#9c7b4f] bg-[#2a241d] text-[#f8e8c7]"
                : "border-stone-200 bg-[#f7efe5] text-stone-700"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
