"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.login(username, password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbf6ee] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl border-2 border-[#8a6a43] bg-[#efe3d0] text-lg font-bold text-[#8a6a43] shadow-sm">
            版画
          </div>
          <h1 className="text-2xl font-bold text-stone-900">深中高中园版画素材助手</h1>
          <p className="mt-1 text-stone-500">请登录以使用版画设计工具</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#eadcc8] bg-white p-8 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-stone-700">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
                className="w-full rounded-lg border border-stone-200 bg-[#fffaf2] px-4 py-3 outline-none focus:border-[#9c7b4f]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-stone-700">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                className="w-full rounded-lg border border-stone-200 bg-[#fffaf2] px-4 py-3 outline-none focus:border-[#9c7b4f]"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 h-12 w-full rounded-xl bg-[#27221c] text-lg font-medium text-[#f6e2b8] hover:bg-[#3b3025] disabled:opacity-50"
          >
            {loading ? "登录中…" : "登 录"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-400">
          提示：如有账号问题请联系老师
        </p>
      </div>
    </main>
  );
}
