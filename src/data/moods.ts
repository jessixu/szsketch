export const moods = ["威严", "神秘", "灵动", "凶猛", "祥瑞", "宁静", "飘逸", "磅礴"];
export const edits = ["主体造型", "纹样风格", "纹样类型", "构图布局", "线条粗细", "黑白对比"];

export const patternMap: Record<string, string[]> = {
  威严: ["雷纹", "山纹", "甲骨纹"],
  神秘: ["云纹", "星纹", "旋涡纹"],
  灵动: ["羽纹", "水纹", "流线纹"],
  凶猛: ["火纹", "齿纹", "裂石纹"],
  祥瑞: ["祥云纹", "莲纹", "鳞纹"],
  宁静: ["水波纹", "月纹", "竹叶纹"],
  飘逸: ["云气纹", "风纹", "羽纹"],
  磅礴: ["雷纹", "浪纹", "山岳纹"],
};

export function getMainType(origin: string): string {
  if (origin.includes("鸟") || origin.includes("凤")) return "bird";
  if (origin.includes("虎") || origin.includes("兽") || origin.includes("鹿")) return "tiger";
  if (origin.includes("鱼") || origin.includes("鲲")) return "fish";
  return "god";
}

export function getPatterns(mood: string): string[] {
  return patternMap[mood] || ["云纹", "水纹", "雷纹"];
}
