import { Card, CardContent } from "@/components/ui/card";
import { examples } from "@/data/examples";
import TextureBox from "./TextureBox";
import PrintSVG from "./PrintSVG";

export default function ExampleGallery() {
  return (
    <Card className="border-[#eadcc8] bg-[#fffaf2] shadow-sm">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-8">
          <h2 className="text-xl font-bold">版画效果参考</h2>
          <span className="text-stone-500">传统版画风格示例，激发创作灵感</span>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          {examples.map((item) => (
            <div key={item.title} className="rounded-xl border border-stone-200 bg-white p-2 shadow-sm">
              <TextureBox className="h-52">
                <PrintSVG type={item.svg} />
              </TextureBox>
              <div className="py-2 text-center font-semibold text-stone-700">{item.title}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
