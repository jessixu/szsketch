import BrandMark from "@/components/BrandMark";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbf6ee] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <BrandMark size="lg" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">印刻奇旅 · 版画创意智造工坊</h1>
          <p className="mt-1 text-stone-500">请登录以开启版画创意工坊</p>
        </div>

        <form
          action={loginAction}
          className="rounded-2xl border border-[#eadcc8] bg-white p-8 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1 block text-sm font-semibold text-stone-700">用户名</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="请输入用户名"
                required
                className="w-full rounded-lg border border-stone-200 bg-[#fffaf2] px-4 py-3 outline-none focus:border-[#9c7b4f]"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-semibold text-stone-700">密码</label>
              <input
                id="password"
                name="password"
                type="password"
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
            className="mt-6 h-12 w-full rounded-xl bg-[#27221c] text-lg font-medium text-[#f6e2b8] hover:bg-[#3b3025] disabled:opacity-50"
          >
            登 录
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-400">
          提示：如有账号问题请联系老师
        </p>
      </div>
    </main>
  );
}
