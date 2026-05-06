"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/printmaking/Icon";
import ExampleGallery from "@/components/printmaking/ExampleGallery";
import OriginSelector from "@/components/printmaking/OriginSelector";
import MoodSelector from "@/components/printmaking/MoodSelector";
import GenerateResultPanel from "@/components/printmaking/GenerateResultPanel";
import EditPanel from "@/components/printmaking/EditPanel";
import LoadingOverlay from "@/components/LoadingOverlay";
import { api } from "@/lib/api";

interface UserInfo {
  id: string;
  username: string;
  displayName: string;
}

export default function GeneratorPage() {
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);

  const [user, setUser] = useState<UserInfo | null>(null);
  const [origin, setOrigin] = useState("鹿隐");
  const [mood, setMood] = useState("神秘");
  const [generated, setGenerated] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [aiAvailable, setAiAvailable] = useState(false);

  useEffect(() => {
    api.me().then(setUser).catch(() => {});
    api.status().then((s) => setAiAvailable(s.aiAvailable)).catch(() => {});
  }, []);

  const handleGenerate = useCallback(async () => {
    setGenerated(true);
    setImageUrl(null);
    setDescription(null);
    setLoading(true);

    try {
      const result = await api.generate(origin, mood, notes || undefined);
      if (result.imageUrl) setImageUrl(result.imageUrl);
      if (result.description) setDescription(result.description);
      setAiAvailable(result.aiAvailable);
    } catch (err) {
      console.error("Generate failed:", err);
    } finally {
      setLoading(false);
    }
  }, [origin, mood, notes]);

  const handleRegenerate = useCallback(() => {
    setGenerated(false);
    setTimeout(() => handleGenerate(), 120);
  }, [handleGenerate]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  const handleLogout = useCallback(async () => {
    await api.logout();
    router.push("/login");
    router.refresh();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#fbf6ee] p-6 text-stone-900">
      {loading && <LoadingOverlay onCancel={handleCancel} />}

      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-[#8a6a43] bg-[#efe3d0] text-sm font-bold text-[#8a6a43] shadow-sm">
              版画
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">深中高中园版画素材助手</h1>
              <p className="mt-1 text-lg text-stone-600">
                {user ? `${user.displayName}，欢迎使用` : "传统纹样与版画设计生成工具"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="gap-2 border-stone-200 bg-[#f4eadc]"
              onClick={() => router.push("/history")}
            >
              <Icon name="history" size={16} />
              生成记录
            </Button>
            {user && (
              <Button
                variant="outline"
                className="border-stone-200 bg-[#f4eadc] text-stone-600"
                onClick={handleLogout}
              >
                退出
              </Button>
            )}
          </div>
        </header>

        {/* Example Gallery */}
        <ExampleGallery />

        {/* Configuration Panel */}
        <Card className="border-[#eadcc8] bg-white/80 shadow-sm">
          <CardContent className="grid gap-6 p-5 lg:grid-cols-[1fr_280px]">
            <section className="grid gap-6 rounded-xl border border-stone-100 bg-white p-4 lg:grid-cols-2">
              <OriginSelector value={origin} onChange={setOrigin} />
              <MoodSelector value={mood} onChange={setMood} />
            </section>
            <section className="flex items-center justify-center rounded-xl bg-[#fffaf2] p-4">
              <div className="text-center">
                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="h-16 w-64 gap-3 rounded-xl bg-[#27221c] text-lg text-[#f6e2b8] hover:bg-[#3b3025] disabled:opacity-50"
                >
                  <Icon name="sparkles" size={22} />
                  生成版画素材
                </Button>
                <p className="mt-4 text-stone-500">智能匹配纹样，生成版画元素</p>
              </div>
            </section>
          </CardContent>
        </Card>

        {/* Results */}
        {generated && (
          <GenerateResultPanel
            origin={origin}
            mood={mood}
            imageUrl={imageUrl}
            description={description}
            aiAvailable={aiAvailable}
          />
        )}

        {/* Edit Panel */}
        {generated && (
          <EditPanel
            notes={notes}
            onNotesChange={setNotes}
            onRegenerate={handleRegenerate}
            loading={loading}
          />
        )}

        {/* Footer */}
        <footer className="text-sm text-stone-500">
          提示：生成结果仅供学习参考，请结合课堂指导与实际刻制需求进行创作。
        </footer>
      </div>
    </main>
  );
}
