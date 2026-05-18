import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { edits } from "@/data/moods";
import Icon from "./Icon";

interface EditPanelProps {
  notes: string;
  onNotesChange: (v: string) => void;
  onRegenerate: () => void;
  loading: boolean;
}

export default function EditPanel({ notes, onNotesChange, onRegenerate, loading }: EditPanelProps) {
  const handleQuickEdit = (item: string) => {
    const addition = `调整${item}`;
    if (notes.includes(addition)) return;
    const next = notes.trim() ? `${notes.trim()}；${addition}` : addition;
    onNotesChange(next.slice(0, 200));
  };

  return (
    <Card className="border-[#eadcc8] bg-white/90 shadow-sm">
      <CardContent className="p-5">
        <h2 className="text-xl font-bold">二次修改</h2>
        <p className="mt-1 text-stone-500">对生成结果进行调整与优化</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {edits.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleQuickEdit(item)}
              className="rounded-lg bg-[#f3eadf] px-3 py-2 text-sm font-medium text-stone-700 hover:bg-[#ead8c2]"
            >
              {item}
            </button>
          ))}
        </div>
        <label className="mt-5 block font-semibold">修改说明</label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          maxLength={200}
          placeholder="例如：希望主体更威猛一些；增加更多火纹和云纹；构图改成左右对称。"
          className="mt-2 h-40 w-full resize-none rounded-xl border border-stone-200 bg-[#fffaf2] p-3 outline-none focus:border-[#9c7b4f]"
        />
        <div className="text-right text-sm text-stone-400">{notes.length}/200</div>
        <Button
          onClick={onRegenerate}
          disabled={loading}
          className="mt-3 h-12 w-full gap-2 rounded-xl bg-[#27221c] text-[#f6e2b8] hover:bg-[#3b3025]"
        >
          <Icon name="rotate" size={18} />
          重新生成
        </Button>
      </CardContent>
    </Card>
  );
}
