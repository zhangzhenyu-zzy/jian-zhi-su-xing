const meal = (id, title, description, note = "") => ({ id, title, description, note });
const exercise = (id, name, sets, reps, tip, restSeconds = 75) => ({
  id,
  name,
  sets,
  reps,
  tip,
  restSeconds,
});

export const DIET_PLAN = Object.freeze([
  {
    id: "monday",
    weekday: 1,
    label: "周一",
    meals: {
      breakfast: meal("monday-breakfast", "早餐", "鸡蛋 1 个、纯牛奶 300 ml、全麦面包 80–100 g"),
      lunch: meal("monday-lunch", "午间熟食", "原味或黑胡椒鸡胸肉 1 袋"),
      fruit: meal("monday-fruit", "下午水果", "15:30–16:30 苹果 1 个"),
      dinner: meal("monday-dinner", "美宜佳晚餐", "即食鸡胸肉 100–150 g、真空玉米 1 根、纯牛奶 250 ml、蔬菜沙拉或小番茄"),
    },
  },
  {
    id: "tuesday",
    weekday: 2,
    label: "周二",
    meals: {
      breakfast: meal("tuesday-breakfast", "早餐", "鸡蛋 1 个、无糖豆浆 400 ml、真空玉米 200 g"),
      lunch: meal("tuesday-lunch", "午间熟食", "袋装瘦牛肉或牛腱 1 袋"),
      fruit: meal("tuesday-fruit", "下午水果", "15:30–16:30 香蕉 1 根"),
      dinner: meal("tuesday-dinner", "美宜佳晚餐", "酱牛肉 100–150 g、饭团 1 个、黄瓜/小番茄/蔬菜沙拉"),
    },
  },
  {
    id: "wednesday",
    weekday: 3,
    label: "周三",
    meals: {
      breakfast: meal("wednesday-breakfast", "早餐", "鸡蛋 1 个、纯牛奶 300 ml、全麦馒头 100 g"),
      lunch: meal("wednesday-lunch", "午间熟食", "即食鸡胸肉 1 袋"),
      fruit: meal("wednesday-fruit", "下午水果", "15:30–16:30 橙子 1 个"),
      dinner: meal("wednesday-dinner", "美宜佳晚餐", "即食鸡胸肉 100 g、金枪鱼饭团 1 个、纯牛奶 250 ml、蔬菜沙拉"),
    },
  },
  {
    id: "thursday",
    weekday: 4,
    label: "周四",
    meals: {
      breakfast: meal("thursday-breakfast", "早餐", "鸡蛋 1 个、无糖豆浆 400 ml、红薯 250 g"),
      lunch: meal("thursday-lunch", "午间熟食", "袋装去皮鸡腿肉或鸡胸肉 1 袋"),
      fruit: meal("thursday-fruit", "下午水果", "15:30–16:30 猕猴桃 2 个"),
      dinner: meal("thursday-dinner", "美宜佳晚餐", "即食鸡胸肉 100 g、关东煮豆腐/白萝卜/海带/魔芋、饭团 1 个，不喝汤"),
    },
  },
  {
    id: "friday",
    weekday: 5,
    label: "周五",
    meals: {
      breakfast: meal("friday-breakfast", "早餐", "鸡蛋 1 个、纯牛奶 300 ml、全麦面包 80–100 g"),
      lunch: meal("friday-lunch", "午间熟食", "即食鸡胸肉 1 袋"),
      fruit: meal("friday-fruit", "下午水果", "15:30–16:30 梨 1 个"),
      dinner: meal("friday-dinner", "美宜佳晚餐", "即食鸡胸肉 100–150 g、真空玉米 1 根、无糖酸奶 200 g、蔬菜沙拉"),
    },
  },
  {
    id: "saturday",
    weekday: 6,
    label: "周六",
    meals: {
      breakfast: meal("saturday-breakfast", "早餐", "鸡蛋 1 个、无糖豆浆 400 ml、真空玉米 200 g"),
      lunch: meal("saturday-lunch", "午间熟食", "袋装瘦牛肉或牛腱 1 袋"),
      fruit: meal("saturday-fruit", "下午水果", "15:30–16:30 苹果 1 个"),
      dinner: meal("saturday-dinner", "美宜佳晚餐", "酱牛肉 100 g、真空玉米 1 根、关东煮豆腐/白萝卜/海带，不喝汤"),
    },
  },
  {
    id: "sunday",
    weekday: 0,
    label: "周日",
    meals: {
      breakfast: meal("sunday-breakfast", "早餐", "鸡蛋 1 个、纯牛奶 300 ml、全麦馒头 100 g"),
      lunch: meal("sunday-lunch", "午间熟食", "即食鸡胸肉 1 袋"),
      fruit: meal("sunday-fruit", "下午水果", "15:30–16:30 香蕉 1 根"),
      dinner: meal("sunday-dinner", "美宜佳晚餐", "即食鸡胸肉 100 g、饭团 1 个、纯牛奶 250 ml、蔬菜沙拉或小番茄"),
    },
  },
]);

export const TRAINING_PLAN = Object.freeze([
  {
    id: "monday",
    weekday: 1,
    label: "周一",
    title: "推力与核心 A",
    focus: "胸、肩、肱三头肌、腹部",
    durationMinutes: 40,
    rest: false,
    warmup: "肩绕环、扩胸运动、猫牛式和轻松上斜俯卧撑，共 5 分钟。",
    cooldown: "胸肩拉伸与缓慢呼吸 3–5 分钟。",
    exercises: [
      exercise("pushup", "俯卧撑", 4, "6–12 次", "做不了标准动作时改为稳固桌边或椅背上斜俯卧撑。"),
      exercise("backpack-overhead-press", "背包推举", 3, "8–12 次", "收紧腹部，背包从肩部垂直向上推。"),
      exercise("close-grip-pushup", "窄距俯卧撑", 3, "6–12 次", "双手略窄于肩，手肘靠近身体。"),
      exercise("bottle-lateral-raise", "水瓶侧平举", 3, "12–20 次", "肩膀下沉，抬至与肩同高即可。", 60),
      exercise("reverse-crunch", "反向卷腹", 3, "10–15 次", "骨盆轻轻卷起，不借助摆腿。", 60),
      exercise("plank", "平板支撑", 3, "20–45 秒", "保持头、背和髋部成一直线。", 60),
    ],
  },
  {
    id: "tuesday",
    weekday: 2,
    label: "周二",
    title: "腿臀 A",
    focus: "大腿、臀部、小腿",
    durationMinutes: 40,
    rest: false,
    warmup: "原地踏步、髋部绕环、徒手深蹲和踝关节活动，共 5 分钟。",
    cooldown: "大腿前后侧、臀部与小腿拉伸 3–5 分钟。",
    exercises: [
      exercise("backpack-squat", "背包深蹲", 4, "10–15 次", "膝盖方向与脚尖一致，背部保持中立。"),
      exercise("reverse-lunge", "后撤弓步", 3, "每侧 8–12 次", "向后迈步并垂直下沉，前脚全脚掌着地。"),
      exercise("backpack-rdl", "背包罗马尼亚硬拉", 3, "10–15 次", "髋部向后推，感受大腿后侧拉伸。"),
      exercise("glute-bridge", "臀桥", 3, "12–20 次", "顶端收紧臀部，不要过度挺腰。", 60),
      exercise("calf-raise", "站姿提踵", 3, "15–25 次", "缓慢下降，必要时扶墙保持平衡。", 60),
    ],
  },
  {
    id: "wednesday",
    weekday: 3,
    label: "周三",
    title: "拉力与核心 A",
    focus: "背部、肱二头肌、腹部",
    durationMinutes: 40,
    rest: false,
    warmup: "肩胛后缩、手臂画圈、鸟狗式和空背包划船，共 5 分钟。",
    cooldown: "背部、肱二头肌和侧腰拉伸 3–5 分钟。",
    exercises: [
      exercise("single-arm-backpack-row", "单臂背包划船", 4, "每侧 10–15 次", "肘部向髋部方向拉，避免耸肩。"),
      exercise("towel-isometric-row", "毛巾等长划船", 3, "20–30 秒", "毛巾套住脚掌，双手后拉并用双脚向前抵住。", 60),
      exercise("backpack-curl", "背包弯举", 3, "10–15 次", "固定上臂，仅让前臂移动。", 60),
      exercise("reverse-snow-angel", "俯卧反向雪天使", 3, "12–15 次", "额头轻触垫面，双臂贴近地面缓慢画弧。", 60),
      exercise("dead-bug", "死虫", 3, "每侧 10–15 次", "腰部贴地，手脚缓慢伸展。", 60),
      exercise("side-plank", "侧平板支撑", 3, "每侧 20–40 秒", "髋部抬起并保持身体成直线。", 60),
    ],
  },
  {
    id: "thursday",
    weekday: 4,
    label: "周四",
    title: "推力与核心 B",
    focus: "胸、肩、肱三头肌、腹部",
    durationMinutes: 40,
    rest: false,
    warmup: "肩绕环、墙面俯卧撑、猫牛式和躯干转动，共 5 分钟。",
    cooldown: "胸肩和肱三头肌拉伸 3–5 分钟。",
    exercises: [
      exercise("pike-pushup", "臀部抬高式俯卧撑", 4, "6–12 次", "臀部抬高，头部向双手之间下降。"),
      exercise("wide-pushup", "宽距俯卧撑", 3, "8–15 次", "双手略宽于肩，身体保持一条直线。"),
      exercise("backpack-floor-press", "仰卧背包推胸", 3, "10–15 次", "仰卧抱稳背包，从胸前向上推起。"),
      exercise("backpack-overhead-triceps", "背包过顶臂屈伸", 3, "10–15 次", "保持上臂稳定，动作缓慢。", 60),
      exercise("tuck-hollow-hold", "屈膝中空支撑", 3, "15–30 秒", "腰部贴地，肋骨向下收紧。", 60),
      exercise("slow-mountain-climber", "慢速登山跑", 3, "每侧 15–20 次", "膝盖缓慢靠近胸部，髋部保持稳定。", 60),
    ],
  },
  {
    id: "friday",
    weekday: 5,
    label: "周五",
    title: "腿臀 B",
    focus: "腿部、臀部、短时心肺",
    durationMinutes: 40,
    rest: false,
    warmup: "原地踏步、髋踝活动、徒手弓步和臀桥，共 5 分钟。",
    cooldown: "大腿、臀部和小腿拉伸 3–5 分钟。",
    exercises: [
      exercise("bulgarian-split-squat", "保加利亚分腿蹲", 3, "每侧 8–12 次", "后脚椅子必须稳固并靠墙；不稳时改普通分腿蹲。"),
      exercise("backpack-sumo-squat", "背包相扑深蹲", 3, "12–15 次", "脚尖略向外，膝盖沿脚尖方向打开。"),
      exercise("single-leg-glute-bridge", "单腿臀桥", 3, "每侧 10–15 次", "保持骨盆水平，顶端收紧臀部。", 60),
      exercise("backpack-rdl", "背包罗马尼亚硬拉", 3, "10–15 次", "髋部向后推，背部保持中立。"),
      exercise("single-leg-calf-raise", "单腿提踵", 3, "每侧 12–20 次", "扶墙保持平衡，完整抬起和下降。", 60),
      exercise("fast-march", "原地快速踏步", 4, "40 秒，间歇 20 秒", "保持呼吸节奏，避免跳跃冲击。", 20),
    ],
  },
  {
    id: "saturday",
    weekday: 6,
    label: "周六",
    title: "拉力与核心 B",
    focus: "背部、肱二头肌、腹部",
    durationMinutes: 40,
    rest: false,
    warmup: "肩胛后缩、手臂画圈、鸟狗式和轻重量划船，共 5 分钟。",
    cooldown: "背部、手臂和腹部拉伸 3–5 分钟。",
    exercises: [
      exercise("backpack-bent-row", "双臂背包俯身划船", 4, "10–15 次", "髋部后移，背部中立，将背包拉向腹部。"),
      exercise("bottle-reverse-fly", "水瓶反向飞鸟", 3, "12–20 次", "使用轻重量，肩胛骨向中间靠拢。", 60),
      exercise("bottle-hammer-curl", "水瓶锤式弯举", 3, "10–15 次", "掌心相对，固定上臂。", 60),
      exercise("towel-pull-apart", "毛巾拉开等长收缩", 3, "20–30 秒", "双手持续向外拉紧毛巾，肩膀不要耸起。", 60),
      exercise("bird-dog", "鸟狗式", 3, "每侧 10–15 次", "骨盆保持稳定，手脚缓慢伸直。", 60),
      exercise("bicycle-crunch", "自行车卷腹", 3, "每侧 10–15 次", "缓慢转动躯干，不用手拉颈部。", 60),
    ],
  },
  {
    id: "sunday",
    weekday: 0,
    label: "周日",
    title: "恢复日",
    focus: "休息、轻松散步或拉伸",
    durationMinutes: 0,
    rest: true,
    warmup: "",
    cooldown: "",
    exercises: [],
  },
]);

export const PROGRESSION_RULES = Object.freeze([
  { week: 1, title: "动作适应", description: "所有动作做 2 组，熟悉动作并保留约 3 次余力。" },
  { week: 2, title: "增加训练量", description: "增加到计划中的 3 组；标注 4 组的动作暂做 3 组。" },
  { week: 3, title: "执行完整组数", description: "执行计划完整组数，在动作标准的前提下逐步增加次数。" },
  { week: 4, title: "渐进负荷", description: "达到最高次数后，背包增加 1–2 kg，或选择更难动作变式。" },
]);

export function getDietDay(weekday) {
  return DIET_PLAN.find((day) => day.weekday === weekday) ?? DIET_PLAN[0];
}

export function getTrainingDay(weekday) {
  return TRAINING_PLAN.find((day) => day.weekday === weekday) ?? TRAINING_PLAN[0];
}
