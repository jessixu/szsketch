export type CourseKey = "black-white" | "shanhaijing" | "free" | "color";

export interface OutputImage {
  label: string;
  url: string;
}

export const courseList: Array<{
  key: CourseKey;
  stage: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
}> = [
  {
    key: "black-white",
    stage: "第一阶段",
    title: "黑白版画转换器",
    subtitle: "技法奠基 · 认识黑白",
    description: "上传一张你拍的风景照片，AI将它转化为版画风格的黑白稿。拿到结果后，先在纸上画出你想保留和改动的部分，再上板刻制。",
    href: "/courses/black-white",
  },
  {
    key: "shanhaijing",
    stage: "第二阶段",
    title: "山海经神兽创作器",
    subtitle: "主题创作 · 审美养成",
    description: "从山海经神兽图谱中选择你感兴趣的形象，结合气质关键词生成专属版画初稿。AI提供的是\"砖瓦\"，如何构筑属于你的画面，由你决定。",
    href: "/courses/shanhaijing",
  },
  {
    key: "free",
    stage: "第三阶段",
    title: "自由主题版画生成器",
    subtitle: "思维拓展 · 自主创作",
    description: "输入你自己的主题和创意关键词，AI生成对应的版画构图参考。这一阶段没有固定答案，你的想法就是起点。",
    href: "/courses/free",
  },
  {
    key: "color",
    stage: "第四阶段",
    title: "套色版画辅助器",
    subtitle: "综合提升 · 套色创作",
    description: "上传你的黑白底稿，AI为你生成适合版画套印的配色方案与效果预览。色彩如何叠印、层次如何分配，最终由你的刻刀来决定。",
    href: "/courses/color",
  },
];

export const blackWhiteStyles = [
  {
    key: "clean",
    label: "简洁黑白风",
    description: "线条清晰，适合构图简单、主体明确的场景",
    prompt:
      "将这张风景照片转化为黑白凸版画效果，黑白对比强烈，轮廓清晰，简化细节，保留大形，适合初学者临摹，画面干净，无渐变，无杂色。",
  },
  {
    key: "woodcut",
    label: "强对比木刻风",
    description: "黑白对比强烈，适合情绪饱满、层次丰富的画面",
    prompt:
      "转化为经典黑白木刻效果，强化明暗对比，线条概括，大块面黑白分割，适合刻刀练习，符合新兴木刻语言。",
  },
  {
    key: "outline",
    label: "简约轮廓风",
    description: "保留边缘线条，适合希望自己填充明暗关系的练习",
    prompt:
      "提取主体轮廓，简化内部细节，黑白关系清晰，适合吹塑板笔针戳刻练习，突出“刻白留白”逻辑。",
  },
];

export const beastLibrary = [
  {
    id: "qiangliang",
    name: "强良",
    story: "上古凶神，住北极天柜山，主驱邪逐怪。",
    appearance: "虎首人身，肘操双蛇，足似兽蹄。",
    patterns: "粗犷几何纹、雷纹、蛇形卷草纹，狞厉原始",
    image: "/animal_img/qiangliang.png",
  },
  {
    id: "xiezhi",
    name: "獬豸",
    story: "司法神兽，辨是非曲直，象征公正。",
    appearance: "独角神兽，似麟似羊，鳞毛分明，神态威严。",
    patterns: "云纹、回纹、对称卷草纹，庄重秩序",
    image: "/animal_img/xiezhi.png",
  },
  {
    id: "baize",
    name: "白泽",
    story: "上古瑞兽，通万物、知鬼神，象征智慧祥瑞。",
    appearance: "狮身虎首，鬃毛张扬，体态矫健，神态灵动。",
    patterns: "火焰纹、祥云纹、波浪纹，飘逸仙气",
    image: "/animal_img/baize.png",
  },
  {
    id: "lushu",
    name: "鹿蜀",
    story: "南山瑞兽，主子孙昌盛，象征吉祥繁衍。",
    appearance: "似马，白首赤尾，身有虎纹，神态温顺。",
    patterns: "卷草纹、水波纹、植物纹，柔和温婉",
    image: "/animal_img/lushu.png",
  },
  {
    id: "yinglong",
    name: "应龙",
    story: "上古神龙，助黄帝、大禹平乱治水，象征力量守护。",
    appearance: "有翼神龙，鳞身矫健，体态威严霸气。",
    patterns: "鳞纹、云纹、水波纹、火焰纹，刚柔并济",
    image: "/animal_img/yinglong.png",
  },
  {
    id: "zhongshan",
    name: "钟山神",
    story: "钟山山神，掌昼夜寒暑，维系大荒秩序。",
    appearance: "人面龙身，红发鳞身，神态肃穆威严。",
    patterns: "鳞纹、云纹、雷纹、火焰纹，厚重有神性",
    image: "/animal_img/zhongshan.png",
  },
  {
    id: "dijiang",
    name: "帝江",
    story: "上古神鸟，住天山，混沌的象征。",
    appearance: "无面无目，六足四翼，圆浑敦实。",
    patterns: "卷云纹、水波纹、几何回纹，圆润神秘",
    image: "/animal_img/dijiang.png",
  },
  {
    id: "hechu",
    name: "猲（貙）",
    story: "山林猛兽，性情凶猛，以虎豹为食。",
    appearance: "似猫似豹，身带斑纹，尾大如扇。",
    patterns: "火焰纹、斑点纹、卷草纹，野性灵动",
    image: "/animal_img/hechu.png",
  },
  {
    id: "dahan",
    name: "大旱",
    story: "旱神，出现则天下大旱，凶神。",
    appearance: "似犬似狐，背生双翼，身带虎纹。",
    patterns: "雷纹、火焰纹、粗犷几何纹，狞厉原始",
    image: "/animal_img/dahan.png",
  },
  {
    id: "zhujian",
    name: "诸犍",
    story: "山林神兽，善射，吼声如雷，行走衔尾。",
    appearance: "似豹，人面牛耳，身带斑纹。",
    patterns: "回纹、云雷纹、兽面纹，威严厚重",
    image: "/animal_img/zhujian.png",
  },
  {
    id: "longzhi",
    name: "蠪蛭",
    story: "九头神兽，住凫丽山，食人。",
    appearance: "九尾九头，状如狐，多头齐生。",
    patterns: "波浪纹、火焰纹、多头对称纹，诡谲神秘",
    image: "/animal_img/longzhi.png",
  },
  {
    id: "machang",
    name: "马肠",
    story: "山中异兽，状如虎，食人。",
    appearance: "似虎，身有条纹，鬃毛张扬，神态凶悍。",
    patterns: "虎皮纹、火焰纹、卷云纹，威猛粗犷",
    image: "/animal_img/machang.png",
  },
  {
    id: "chenghuang",
    name: "乘黄",
    story: "祥瑞异兽，见之国盛，乘之寿两千岁。",
    appearance: "状如狐，背有两角，尾如马尾。",
    patterns: "卷草纹、云纹、水波纹，飘逸祥瑞",
    image: "/animal_img/chenghuang.png",
  },
  {
    id: "tianwu",
    name: "天吴",
    story: "水伯，八首人面，八足八尾，司水神。",
    appearance: "八首人面，虎身八尾，气势磅礴。",
    patterns: "水波纹、云纹、回纹，磅礴大气",
    image: "/animal_img/tianwu.png",
  },
  {
    id: "zhuyin",
    name: "烛阴",
    story: "钟山山神，睁眼为昼、闭眼为夜，掌昼夜寒暑。",
    appearance: "人面蛇身，鳞纹清晰，神态肃穆。",
    patterns: "鳞纹、云纹、火焰纹，神秘威严",
    image: "/animal_img/zhuyin.png",
  },
  {
    id: "feiyu",
    name: "飞鱼",
    story: "水中异兽，鱼身鸟翼，能飞。",
    appearance: "鱼身带翅，身有鳞纹，灵动轻盈。",
    patterns: "水波纹、鱼鳞纹、波浪纹，飘逸灵动",
    image: "/animal_img/feiyu.png",
  },
  {
    id: "fuxi",
    name: "凫溪",
    story: "人面鸟身异兽，住鸟山。",
    appearance: "人面鸟身，羽衣华茂，神态温婉。",
    patterns: "卷草纹、云纹、羽毛纹，柔美雅致",
    image: "/animal_img/fuxi.png",
  },
  {
    id: "danghu",
    name: "当扈",
    story: "山林神鸟，生而不飞，振翅而翔。",
    appearance: "状如雉，羽毛华丽，神态昂扬。",
    patterns: "羽毛纹、火焰纹、卷云纹，昂扬华丽",
    image: "/animal_img/danghu.png",
  },
  {
    id: "chigui",
    name: "鸱龟",
    story: "水泽神兽，龟身，镇水护河。",
    appearance: "龟身，背甲规整，神态沉稳。",
    patterns: "龟甲纹、水波纹、回纹，沉稳古朴",
    image: "/animal_img/chigui.png",
  },
  {
    id: "queshen",
    name: "鹊神",
    story: "鹊山山系山神，鸟身龙首，掌管山林风雨。",
    appearance: "鸟身龙首，体态矫健，龙首威严，羽衣华茂。",
    patterns: "羽毛纹、云纹、火焰纹，兼具神性与灵动",
    image: "/animal_img/queshen.png",
  },
];

export const beastMoods = ["凶猛", "温柔", "飘逸", "神秘", "古朴"];
export const beastEdits = [
  "主体更粗壮",
  "线条更粗粝",
  "背景简化",
  "构图左上留白",
  "构图右下包围",
  "构图中心聚焦",
  "纹样更疏朗",
];

export const freeStyles = ["传统装饰风", "简约现代风", "童趣稚拙风", "粗犷木刻风"];
export const compositions = ["居中构图", "对称构图", "对角线构图", "大面积留白"];
export const elements = ["自然元素", "几何纹样", "传统纹饰"];

export const colorTones = ["暖色调", "冷色调", "对比色调", "和谐色调"];
export const colorMoods = ["古朴", "明亮", "沉静", "神秘"];
export const colorCounts = ["2色", "3色", "4色"];

export const colorPalettes: Record<string, string[]> = {
  暖色调: ["#9b1c1f", "#e2a23a", "#f3d7a4", "#2a241d"],
  冷色调: ["#173f5f", "#2f6f73", "#b8d8d8", "#1f2933"],
  对比色调: ["#8b1a1a", "#1f6f5b", "#f2d492", "#202020"],
  和谐色调: ["#6f4e37", "#a8703a", "#d8b985", "#2f2a24"],
};

export function findLabel<T extends { key: string; label: string }>(items: T[], key: string) {
  return items.find((item) => item.key === key)?.label || items[0]?.label || key;
}

export function getCourseTitle(courseKey: string) {
  return courseList.find((course) => course.key === courseKey)?.title || "版画创意工具";
}
