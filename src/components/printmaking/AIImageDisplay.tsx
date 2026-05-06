"use client";

export default function AIImageDisplay({
  imageUrl,
  origin,
  mood,
}: {
  imageUrl: string;
  origin: string;
  mood: string;
}) {
  const handleDownload = async () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `版画_${origin}_${mood}_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-[#fffaf2] p-3">
      <h3 className="mb-3 text-center text-xl font-bold text-[#8a6a43]">AI 生成版画</h3>
      <div className="relative overflow-hidden rounded-xl border border-stone-200 bg-[#111]">
        <img
          src={imageUrl}
          alt={`AI生成的${origin}${mood}风格版画`}
          className="h-auto w-full"
        />
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm text-stone-500">AI 基于版画风格 Prompt 生成</p>
        <button
          onClick={handleDownload}
          className="rounded-lg bg-[#f3eadf] px-4 py-2 text-sm font-medium text-stone-700 hover:bg-[#ead8c2]"
        >
          下载图片
        </button>
      </div>
    </div>
  );
}
