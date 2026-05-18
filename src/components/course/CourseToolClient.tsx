"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, type CourseGenerateResponse } from "@/lib/api";
import {
  beastEdits,
  beastLibrary,
  beastMoods,
  blackWhiteStyles,
  colorCounts,
  colorMoods,
  colorPalettes,
  colorTones,
  compositions,
  courseList,
  elements,
  freeStyles,
  type CourseKey,
} from "@/lib/courseConfig";

interface Props {
  courseKey: CourseKey;
}

type Beast = (typeof beastLibrary)[number];

const BEAST_GROUPS = [
  { name: "祥瑞类", ids: ["xiezhi", "baize", "lushu", "yinglong", "chenghuang", "feiyu", "chigui"] },
  { name: "神秘类", ids: ["zhongshan", "dijiang", "longzhi", "tianwu", "zhuyin", "fuxi", "queshen"] },
  { name: "力量类", ids: ["qiangliang", "hechu", "dahan", "zhujian", "machang", "danghu"] },
];

export default function CourseToolClient({ courseKey }: Props) {
  const router = useRouter();
  const course = courseList.find((item) => item.key === courseKey) || courseList[1];
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CourseGenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [blackWhiteImage, setBlackWhiteImage] = useState("");
  const [blackWhiteStyle, setBlackWhiteStyle] = useState(blackWhiteStyles[0].key);

  const [beastId, setBeastId] = useState(beastLibrary[0].id);
  const [beastMood, setBeastMood] = useState(beastMoods[3]);
  const [selectedEdits, setSelectedEdits] = useState<string[]>([]);
  const [editNotes, setEditNotes] = useState("");
  const [openBeastGroup, setOpenBeastGroup] = useState(BEAST_GROUPS[0].name);
  const [initialBeastResult, setInitialBeastResult] = useState<CourseGenerateResponse | null>(null);
  const [revisedBeastResult, setRevisedBeastResult] = useState<CourseGenerateResponse | null>(null);

  const [freeMode, setFreeMode] = useState<"text" | "image">("text");
  const [freeKeyword, setFreeKeyword] = useState("");
  const [freeImage, setFreeImage] = useState("");
  const [freeStyle, setFreeStyle] = useState(freeStyles[0]);
  const [composition, setComposition] = useState(compositions[0]);
  const [element, setElement] = useState(elements[0]);

  const [colorImage, setColorImage] = useState("");
  const [tone, setTone] = useState(colorTones[0]);
  const [atmosphere, setAtmosphere] = useState(colorMoods[0]);
  const [colorCount, setColorCount] = useState(colorCounts[1]);
  const [colorPaletteResult, setColorPaletteResult] = useState<CourseGenerateResponse | null>(null);
  const [colorEffectResult, setColorEffectResult] = useState<CourseGenerateResponse | null>(null);
  const [paletteSeed, setPaletteSeed] = useState(0);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    api.me().catch(() => router.push("/login"));
  }, [router]);

  const selectedBeast = useMemo(
    () => beastLibrary.find((item) => item.id === beastId) || beastLibrary[0],
    [beastId],
  );

  useEffect(() => {
    if (courseKey === "shanhaijing" && initialBeastResult) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [courseKey, initialBeastResult, revisedBeastResult]);

  useEffect(() => {
    setColorPaletteResult(null);
    setColorEffectResult(null);
  }, [colorImage, tone, atmosphere, colorCount]);

  const runGenerate = async (action: string, inputs: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await api.courseGenerate({ courseKey, action, inputs });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const runBeastGenerate = async (revision = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.courseGenerate({
        courseKey,
        action: "draft",
        inputs: revision ? { beastId, mood: beastMood, edits: selectedEdits, notes: editNotes } : { beastId, mood: beastMood },
      });
      if (revision) {
        setRevisedBeastResult(response);
      } else {
        setInitialBeastResult(response);
        setRevisedBeastResult(null);
        setSelectedEdits([]);
        setEditNotes("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const runColorPalette = async (refresh = false) => {
    if (!colorImage) {
      setError("请先上传黑白底稿");
      return;
    }
    const nextSeed = refresh ? paletteSeed + 1 : paletteSeed;
    setLoading(true);
    setError(null);
    try {
      const response = await api.courseGenerate({
        courseKey,
        action: "palette",
        inputs: { tone, atmosphere, count: colorCount, seed: nextSeed },
      });
      setPaletteSeed(nextSeed);
      setColorPaletteResult(response);
      setColorEffectResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const runColorEffect = async () => {
    if (!colorImage) {
      setError("请先上传黑白底稿");
      return;
    }
    const palette = colorPaletteResult?.palette;
    if (!palette?.length) {
      setError("请先生成并确认配色方案");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.courseGenerate({
        courseKey,
        action: "effect",
        inputs: { imageData: colorImage, tone, atmosphere, count: colorCount, palette },
      });
      setColorEffectResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbf6ee] p-6 text-stone-900">
      {loading && <LoadingOverlay onCancel={() => setLoading(false)} />}
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-4">
            <BrandMark size="md" />
            <div>
              <p className="text-sm font-semibold text-[#8a6a43]">{course.stage}</p>
              <h1 className={`text-3xl font-bold ${courseKey === "shanhaijing" ? "font-heading tracking-normal" : "tracking-tight"}`}>
                {course.title}
              </h1>
              <p className="mt-1 text-lg text-stone-600">{course.subtitle}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-stone-200 bg-[#f4eadc]" onClick={() => router.push("/")}>
              返回课程
            </Button>
            <Button variant="outline" className="border-stone-200 bg-[#f4eadc]" onClick={() => router.push("/history")}>
              生成记录
            </Button>
          </div>
        </header>

        {courseKey === "black-white" && (
          <ToolCard>
            <div className="rounded-xl bg-[#fffaf2] p-4 text-sm leading-6 text-[#7a6040]">
              本工具将你拍摄的风景照片转化为版画风格的黑白稿，作为第一阶段刻制练习的参考。拿到生成结果后，请先在纸上画出你想保留、改动或添加的部分，再开始上板刻制。
            </div>
            <UploadField
              label="上传风景照片"
              value={blackWhiteImage}
              onChange={setBlackWhiteImage}
              helperText="支持 JPG / PNG，建议使用你自己拍摄的风景照片"
            />
            <OptionGroup
              title="风格一键选择"
              options={blackWhiteStyles.map((item) => ({ value: item.key, label: item.label, description: item.description }))}
              value={blackWhiteStyle}
              onChange={setBlackWhiteStyle}
            />
            <Button onClick={() => runGenerate("generate", { imageData: blackWhiteImage, styleKey: blackWhiteStyle })}>
              生成版画稿
            </Button>
          </ToolCard>
        )}

        {courseKey === "shanhaijing" && (
          <ToolCard>
            <BeastSelector
              selectedBeast={selectedBeast}
              selectedId={beastId}
              openGroup={openBeastGroup}
              onOpenGroup={setOpenBeastGroup}
              onSelect={setBeastId}
            />
            <OptionGroup title="气质选择" options={beastMoods} value={beastMood} onChange={setBeastMood} />
            <Button
              className="h-12 rounded-xl border border-[#76552e] bg-[#6f4b28] bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_7px)] text-[#fff3d7] shadow-sm hover:bg-[#7d5730]"
              onClick={() => runBeastGenerate(false)}
            >
              生成神兽版画
            </Button>
            <div ref={resultRef} className="scroll-mt-6 space-y-5">
              {initialBeastResult && (
                <BeastResultCompare initialResult={initialBeastResult} revisedResult={revisedBeastResult} />
              )}
              {initialBeastResult && (
                <RevisionPanel
                  selectedEdits={selectedEdits}
                  notes={editNotes}
                  onSelectedEditsChange={setSelectedEdits}
                  onNotesChange={setEditNotes}
                  onRegenerate={() => runBeastGenerate(true)}
                />
              )}
            </div>
            <footer className="text-sm text-stone-500">
              提示：生成结果仅供学习参考，请结合课堂指导与实际刻制需求进行创作。
            </footer>
          </ToolCard>
        )}

        {courseKey === "free" && (
          <ToolCard>
            <OptionGroup title="生成方式选择" options={[{ value: "text", label: "文生图" }, { value: "image", label: "图生图" }]} value={freeMode} onChange={(v) => setFreeMode(v as "text" | "image")} />
            {freeMode === "text" ? (
              <TextField label="主题/关键词" value={freeKeyword} onChange={setFreeKeyword} placeholder="例如：校园里的树、家乡河流、未来城市" />
            ) : (
              <UploadField label="上传图片" value={freeImage} onChange={setFreeImage} />
            )}
            <OptionGroup title="风格选择" options={freeStyles} value={freeStyle} onChange={setFreeStyle} />
            <OptionGroup title="构图选择" options={compositions} value={composition} onChange={setComposition} />
            <OptionGroup title="元素选择" options={elements} value={element} onChange={setElement} />
            <Button onClick={() => runGenerate("generate", { mode: freeMode, keyword: freeKeyword, imageData: freeImage, style: freeStyle, composition, element })}>
              生成参考图
            </Button>
          </ToolCard>
        )}

        {courseKey === "color" && (
          <ToolCard>
            <div className="rounded-xl bg-[#fffaf2] p-4 text-sm leading-6 text-[#7a6040]">
              上传你的黑白底稿，AI 将为你生成适合版画套印的配色方案与效果预览，可作为分版与印制的参考。
            </div>
            <UploadField label="上传黑白底稿" value={colorImage} onChange={setColorImage} />
            <OptionGroup title="色调选择" options={colorTones} value={tone} onChange={setTone} />
            <OptionGroup title="氛围选择" options={colorMoods} value={atmosphere} onChange={setAtmosphere} />
            <OptionGroup title="套色数量" options={colorCounts} value={colorCount} onChange={setColorCount} />
            <Button className="h-12 rounded-xl bg-[#27221c] text-[#f6e2b8] hover:bg-[#3b3025]" onClick={() => runColorPalette(false)}>
              生成配色方案
            </Button>
            {colorPaletteResult?.palette && (
              <ColorPalettePanel palette={colorPaletteResult.palette} count={colorCount} onRefresh={() => runColorPalette(true)} onConfirm={runColorEffect} />
            )}
            {colorEffectResult?.images[0] && colorPaletteResult?.palette && (
              <ColorEffectPanel image={colorEffectResult.images[0]} palette={colorPaletteResult.palette} count={colorCount} onRegenerate={runColorEffect} />
            )}
            {colorEffectResult?.images[0] && (
              <footer className="text-sm text-stone-500">
                提示：生成结果仅供学习参考，请结合课堂指导与实际印制需求进行创作。
              </footer>
            )}
          </ToolCard>
        )}

        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}
        {result && courseKey !== "shanhaijing" && courseKey !== "color" && <ResultPanel result={result} fallbackPalette={colorPalettes[tone]} />}
      </div>
    </main>
  );
}

function ToolCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="border-[#eadcc8] bg-white/90 shadow-sm">
      <CardContent className="grid gap-5 p-5">{children}</CardContent>
    </Card>
  );
}

function BeastSelector({
  selectedBeast,
  selectedId,
  openGroup,
  onOpenGroup,
  onSelect,
}: {
  selectedBeast: Beast;
  selectedId: string;
  openGroup: string;
  onOpenGroup: (name: string) => void;
  onSelect: (id: string) => void;
}) {
  const visibleGroup = BEAST_GROUPS.find((group) => group.name === openGroup) || BEAST_GROUPS[0];
  const visibleBeasts = visibleGroup.ids
    .map((id) => beastLibrary.find((beast) => beast.id === id))
    .filter((beast): beast is Beast => Boolean(beast));

  return (
    <section>
      <h2 className="font-heading text-2xl font-bold text-[#6f4b28]">神兽选择</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {BEAST_GROUPS.map((group) => (
          <button
            key={group.name}
            type="button"
            onClick={() => onOpenGroup(group.name)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium shadow-sm transition ${
              group.name === openGroup ? "border-[#8a6a43] bg-[#efe0c8] text-[#4f341b]" : "border-[#e6d7c4] bg-white text-stone-600 hover:bg-[#fffaf2]"
            }`}
          >
            {group.name}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {visibleBeasts.map((beast) => (
            <button
              key={beast.id}
              type="button"
              onClick={() => onSelect(beast.id)}
              className={`overflow-hidden rounded-2xl border p-2 text-left transition ${
                beast.id === selectedId
                  ? "border-[#8a6a43] bg-[#f3e5cf] shadow-[0_10px_26px_rgba(111,75,40,0.14)]"
                  : "border-[#e7d7c2] bg-white hover:border-[#c9ad88] hover:bg-[#fffaf2]"
              }`}
            >
              <BeastThumbnail beast={beast} className="h-32 w-full rounded-xl" />
              <div className="px-2 pb-2 pt-3">
                <div className="font-heading text-lg font-bold text-[#5c3d20]">{beast.name}</div>
                <div className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">{beast.story}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-[#eadcc8] bg-[#f6ecdc] p-5 shadow-sm">
          <BeastThumbnail beast={selectedBeast} className="h-72 w-full rounded-xl" large />
          <div className="mt-3">
            <h3 className="font-heading text-3xl font-bold text-[#6f4b28]">{selectedBeast.name}</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">{selectedBeast.story}</p>
            <div className="mt-3 rounded-lg bg-white/70 p-3 text-sm leading-6 text-stone-600">
              <div><span className="font-semibold text-stone-800">外形：</span>{selectedBeast.appearance}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BeastThumbnail({ beast, className, large = false }: { beast: Beast; className?: string; large?: boolean }) {
  return (
    <div className={`relative overflow-hidden border border-[#eadcc8] bg-[#fbf3e7] ${className || ""}`}>
      <img
        src={beast.image}
        alt={`${beast.name}参考图`}
        className="h-full w-full object-contain p-2"
        loading={large ? "eager" : "lazy"}
      />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#fbf3e7]/95 via-[#fbf3e7]/55 to-transparent" />
      <div className="absolute bottom-2 right-3 rounded-md bg-white/85 px-2 py-1 font-heading text-sm font-bold text-[#6f4b28]">{beast.name}</div>
    </div>
  );
}

function RevisionPanel({
  selectedEdits,
  notes,
  onSelectedEditsChange,
  onNotesChange,
  onRegenerate,
}: {
  selectedEdits: string[];
  notes: string;
  onSelectedEditsChange: (value: string[]) => void;
  onNotesChange: (value: string) => void;
  onRegenerate: () => void;
}) {
  const applyQuickEdit = (edit: string) => {
    const active = selectedEdits.includes(edit);
    onSelectedEditsChange(active ? selectedEdits.filter((item) => item !== edit) : [...selectedEdits, edit]);
    if (!active && !notes.includes(edit)) {
      const next = notes.trim() ? `${notes.trim()}；${edit}` : edit;
      onNotesChange(next.slice(0, 200));
    }
  };

  return (
    <section className="rounded-xl border border-[#eadcc8] bg-white p-5">
      <h2 className="font-heading text-2xl font-bold text-[#6f4b28]">二次修改区</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {beastEdits.map((edit) => {
          const active = selectedEdits.includes(edit);
          return (
            <button
              key={edit}
              type="button"
              onClick={() => applyQuickEdit(edit)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                active ? "border-[#6f4b28] bg-[#ead8bc] text-[#4f341b] shadow-sm" : "border-[#e6d7c4] bg-[#fffaf2] text-stone-600 hover:border-[#c9ad88]"
              }`}
            >
              {edit}
            </button>
          );
        })}
      </div>
      <label className="mt-4 block">
        <span className="text-sm font-semibold text-stone-700">修改说明</span>
        <textarea
          value={notes}
          onChange={(event) => onNotesChange(event.target.value.slice(0, 200))}
          maxLength={200}
          placeholder="例如：让鹿角更夸张一些，背景加更多云纹，整体更有压迫感"
          className="mt-2 h-28 w-full resize-none rounded-xl border border-stone-200 bg-[#fffaf2] p-3 text-sm outline-none focus:border-[#9c7b4f]"
        />
      </label>
      <div className="text-right text-sm text-stone-400">{notes.length}/200</div>
      <Button className="mt-3 h-12 w-full rounded-xl border border-[#76552e] bg-[#6f4b28] bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.08)_0,rgba(255,255,255,0.08)_1px,transparent_1px,transparent_7px)] text-[#fff3d7] shadow-sm hover:bg-[#7d5730]" onClick={onRegenerate}>
        重新生成
      </Button>
    </section>
  );
}

function BeastResultCompare({
  initialResult,
  revisedResult,
}: {
  initialResult: CourseGenerateResponse;
  revisedResult: CourseGenerateResponse | null;
}) {
  const initialImage = initialResult.images[0];
  const revisedImage = revisedResult?.images[0] || null;

  return (
    <Card className="border-[#eadcc8] bg-white/90 shadow-sm">
      <CardContent className="space-y-5 p-5">
        <h2 className="font-heading text-2xl font-bold text-[#6f4b28]">生成结果</h2>
        <div className={`grid gap-4 ${revisedImage ? "lg:grid-cols-2" : ""}`}>
          {initialImage && <BeastResultImage title="初稿" image={initialImage} />}
          {revisedImage && <BeastResultImage title="修改版" image={revisedImage} />}
        </div>
        <div className="rounded-xl border border-stone-200 bg-[#fffaf2] p-4 text-sm leading-6 text-stone-700">
          {revisedResult?.description || initialResult.description}
        </div>
      </CardContent>
    </Card>
  );
}

function BeastResultImage({ title, image }: { title: string; image: { label: string; url: string } }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-[#fffaf2] p-3">
      <h3 className="mb-3 text-center font-heading text-2xl font-bold text-[#6f4b28]">{title}</h3>
      <div className="relative overflow-hidden rounded-xl border border-stone-800 bg-[#111] p-3">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="relative overflow-hidden rounded-lg bg-[#191510]">
          <img src={image.url} alt={title} className="h-auto w-full" />
        </div>
      </div>
      <a
        href={image.url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex rounded-lg bg-[#6f4b28] px-4 py-2 text-sm font-medium text-[#fff3d7]"
      >
        下载图片
      </a>
    </div>
  );
}

function ColorPalettePanel({
  palette,
  count,
  onRefresh,
  onConfirm,
}: {
  palette: string[];
  count: string;
  onRefresh: () => void;
  onConfirm: () => void;
}) {
  return (
    <section className="rounded-xl border border-[#eadcc8] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">配色方案</h2>
          <p className="mt-1 text-sm text-stone-500">确认这组颜色后，再生成套色效果图。</p>
        </div>
        <Button variant="outline" className="border-stone-200 bg-[#f4eadc]" onClick={onRefresh}>
          换一组
        </Button>
      </div>
      <PaletteSwatches palette={palette} count={count} className="mt-4" />
      <Button className="mt-5 h-12 w-full rounded-xl bg-[#27221c] text-[#f6e2b8] hover:bg-[#3b3025]" onClick={onConfirm}>
        确认配色，生成效果图
      </Button>
    </section>
  );
}

function ColorEffectPanel({
  image,
  palette,
  count,
  onRegenerate,
}: {
  image: { label: string; url: string };
  palette: string[];
  count: string;
  onRegenerate: () => void;
}) {
  return (
    <section className="rounded-xl border border-[#eadcc8] bg-white p-5">
      <h2 className="text-xl font-bold">套色效果图</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-stone-200 bg-[#fffaf2]">
        <img src={image.url} alt={image.label} className="w-full" />
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <PaletteSwatches palette={palette} count={count} compact />
        <a
          href={image.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-lg bg-[#27221c] px-4 py-2 text-sm font-medium text-[#f6e2b8]"
        >
          下载图片
        </a>
      </div>
      <Button variant="outline" className="mt-5 h-11 w-full rounded-xl border-stone-200 bg-[#f4eadc]" onClick={onRegenerate}>
        不满意，重新生成效果图
      </Button>
    </section>
  );
}

function PaletteSwatches({
  palette,
  count,
  compact = false,
  className = "",
}: {
  palette: string[];
  count: string;
  compact?: boolean;
  className?: string;
}) {
  const roles = getColorRoles(count);
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {palette.map((color, index) => (
        <div key={`${color}-${index}`} className={`rounded-lg border border-stone-200 bg-[#fffaf2] ${compact ? "p-2" : "p-3"}`}>
          <div className={`rounded border border-stone-200 ${compact ? "h-8 w-14" : "h-14 w-24"}`} style={{ backgroundColor: color }} />
          <div className="mt-2 text-xs font-semibold text-stone-700">{roles[index] || `颜色${index + 1}`}</div>
          <div className="mt-0.5 text-xs text-stone-500">{color}</div>
        </div>
      ))}
    </div>
  );
}

function getColorRoles(count: string) {
  if (count.startsWith("2")) return ["主色·深色", "亮色·浅色"];
  if (count.startsWith("4")) return ["主色·深色", "叠色·中深", "叠色·中浅", "亮色·浅色"];
  return ["主色·深色", "叠色·中色", "亮色·浅色"];
}

function OptionGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: Array<string | { value: string; label: string; description?: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <section>
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const item = typeof option === "string" ? { value: option, label: option } : option;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(item.value)}
              className={`rounded-lg border px-4 py-2 text-left text-sm font-medium ${
                value === item.value ? "border-[#8a6a43] bg-[#f4eadc] text-stone-900" : "border-stone-200 bg-white text-stone-600"
              }`}
            >
              <span className="block">{item.label}</span>
              {item.description && <span className="mt-1 block text-xs font-normal leading-5 text-stone-500">{item.description}</span>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CheckboxGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <section>
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(active ? value.filter((item) => item !== option) : [...value, option])}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                active ? "border-[#8a6a43] bg-[#f4eadc] text-stone-900" : "border-stone-200 bg-white text-stone-600"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-lg font-bold">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-3 h-28 w-full resize-none rounded-xl border border-stone-200 bg-[#fffaf2] p-3 outline-none focus:border-[#9c7b4f]"
      />
    </label>
  );
}

function UploadField({
  label,
  value,
  onChange,
  helperText = "支持 JPG / PNG，建议上传清晰图片",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
}) {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploadError(null);
    try {
      onChange(await fileToDataUrl(file));
    } catch (err) {
      onChange("");
      setUploadError(err instanceof Error ? err.message : "图片读取失败");
    }
  };

  return (
    <section>
      <h2 className="text-lg font-bold">{label}</h2>
      <label
        className={`mt-3 flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#d8c7ae] bg-[#fffaf2] text-center transition hover:border-[#9c7b4f] hover:bg-[#fff7eb] ${
          value ? "p-0" : "min-h-56 p-5"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
      >
        <input
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
        {value ? (
          <div className="w-full bg-[#fbf3e7]">
            <div className="flex max-h-80 min-h-48 items-center justify-center p-3">
              <img
                src={value}
                alt="上传预览"
                className="max-h-72 w-auto max-w-full rounded-lg object-contain shadow-sm"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="border-t border-[#eadcc8] bg-[#fffaf2] px-3 py-2 text-sm font-medium text-[#8a6a43]">点击或拖拽可重新选择照片</div>
          </div>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#d8c7ae] bg-white text-3xl font-semibold text-[#8a6a43]">
              ↑
            </div>
            <div className="mt-4 text-base font-semibold text-stone-800">拖拽照片到此处，或点击选择文件</div>
            <div className="mt-2 text-sm text-stone-500">{helperText}</div>
          </>
        )}
      </label>
      {uploadError && <div className="mt-2 text-sm text-red-600">{uploadError}</div>}
    </section>
  );
}

function ResultPanel({
  result,
  fallbackPalette,
}: {
  result: CourseGenerateResponse;
  fallbackPalette: string[];
}) {
  const palette = result.palette || fallbackPalette;
  return (
    <Card className="border-[#eadcc8] bg-white/90 shadow-sm">
      <CardContent className="space-y-5 p-5">
        <h2 className="text-xl font-bold">生成结果</h2>
        {palette.length > 0 && result.action === "palette" && (
          <div className="flex flex-wrap gap-3">
            {palette.map((color) => (
              <div key={color} className="flex items-center gap-2 rounded-lg border border-stone-200 bg-[#fffaf2] p-2">
                <span className="h-10 w-10 rounded border border-stone-200" style={{ backgroundColor: color }} />
                <span className="text-sm font-medium text-stone-600">{color}</span>
              </div>
            ))}
          </div>
        )}
        {result.images.length > 0 && (
          <div className={`grid gap-4 ${result.courseKey === "shanhaijing" ? "" : "md:grid-cols-2"}`}>
            {result.images.map((image) => (
              <div key={image.label} className="rounded-xl border border-stone-200 bg-[#fffaf2] p-3">
                <h3 className={`mb-3 text-center font-bold text-[#8a6a43] ${result.courseKey === "shanhaijing" ? "text-xl" : ""}`}>
                  {result.courseKey === "shanhaijing" ? "AI 生成版画" : image.label}
                </h3>
                {result.courseKey === "shanhaijing" ? (
                  <div className="relative overflow-hidden rounded-xl border border-stone-800 bg-[#111] p-3">
                    <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:18px_18px]" />
                    <div className="relative overflow-hidden rounded-lg bg-[#191510]">
                      <img src={image.url} alt={image.label} className="h-auto w-full" />
                    </div>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg bg-white">
                    <img src={image.url} alt={image.label} className="w-full" />
                  </div>
                )}
                {result.courseKey === "black-white" && (
                  <div className="mt-3 rounded-lg border border-[#eadcc8] bg-[#fff7eb] p-3 text-sm leading-6 text-[#6f5434]">
                    📌 拿到这张图之后，请不要直接照着刻。试着在纸上画一版属于你的草图：哪些元素你想保留？哪里你想改动？有没有什么是你想加进去但AI没有的？这张草图就是你这件作品真正的起点。
                  </div>
                )}
                <a
                  href={image.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex rounded-lg bg-[#27221c] px-4 py-2 text-sm font-medium text-[#f6e2b8]"
                >
                  下载图片
                </a>
              </div>
            ))}
          </div>
        )}
        <div className="rounded-xl border border-stone-200 bg-[#fffaf2] p-4 text-sm leading-6 text-stone-700">
          {result.description}
        </div>
      </CardContent>
    </Card>
  );
}

function downloadAll(images: Array<{ label: string; url: string }>) {
  images.forEach((image) => window.open(image.url, "_blank", "noopener,noreferrer"));
}

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1600;
const JPEG_QUALITY = 0.82;

async function fileToDataUrl(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("请上传图片文件");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("图片不能超过20MB，请先压缩后再上传");
  }
  if (typeof createImageBitmap !== "function") {
    return readOriginalDataUrl(file);
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("图片处理失败，请重试");
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

function readOriginalDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}
