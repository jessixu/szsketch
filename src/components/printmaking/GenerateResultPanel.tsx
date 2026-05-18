import { Card, CardContent } from "@/components/ui/card";
import AIImageDisplay from "./AIImageDisplay";

interface GenerateResultPanelProps {
  origin: string;
  mood: string;
  imageUrl: string | null;
  imageError: string | null;
  description: string | null;
  aiAvailable: boolean;
}

function parseDescription(text: string) {
  const sections: { label: string; content: string }[] = [];
  const regex = /【(风格|建议|效果)】(.+?)(?=【|$)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    sections.push({ label: match[1], content: match[2].trim() });
  }
  if (sections.length === 0) {
    return [{ label: "描述", content: text }];
  }
  return sections;
}

export default function GenerateResultPanel({
  origin,
  mood,
  imageUrl,
  imageError,
  description,
  aiAvailable,
}: GenerateResultPanelProps) {
  return (
    <Card className="border-[#eadcc8] bg-white/90 shadow-sm">
      <CardContent className="p-5">
        <h2 className="mb-4 text-xl font-bold">生成结果</h2>

        {!aiAvailable && !imageUrl && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-center text-amber-700">
            AI生成功能即将开放，当前显示预览效果
          </div>
        )}

        {aiAvailable && imageError && !imageUrl && (
          <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-center text-amber-700">
            {imageError}
          </div>
        )}

        {/* AI Image */}
        {imageUrl && (
          <div className="mb-6 flex justify-center">
            <div className="w-full max-w-2xl">
              <AIImageDisplay imageUrl={imageUrl} origin={origin} mood={mood} />
            </div>
          </div>
        )}

        {/* GLM Dynamic Description */}
        {description && (
          <div className="rounded-xl border border-stone-200 bg-[#fffaf2] p-5">
            <h3 className="mb-4 text-center text-lg font-bold text-[#8a6a43]">版画效果分析</h3>
            <div className="space-y-4 leading-7 text-stone-800">
              {parseDescription(description).map((section, i) => (
                <div key={i}>
                  <span className="font-semibold text-[#8a6a43]">{section.label}：</span>
                  {section.content}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
