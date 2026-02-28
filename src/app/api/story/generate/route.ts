import { NextRequest, NextResponse } from 'next/server';

// Types for request/response
interface GenerateRequest {
  mode: 'bedtime' | 'reading';
  age: number;
  topic: string;
  minutes: number;
  lang: string;
  mood: string;
  level: string;
  explorer_name?: string;
}

interface BedtimeResponse {
  title: string;
  body: string[];
  recap: string[];
  parent_tip: string;
  source?: string;
}

interface ReadingSection {
  h: string;
  p: string;
}

interface VocabItem {
  term: string;
  explain: string;
}

interface QuizMCQ {
  type: 'mcq';
  q: string;
  options: string[];
  answer: string;
}

interface QuizShort {
  type: 'short';
  q: string;
  answer_key: string;
}

type Quiz = QuizMCQ | QuizShort;

interface ReadingPack {
  intro: string;
  sections: ReadingSection[];
  vocab: VocabItem[];
  quiz: Quiz[];
}

interface ReadingResponse {
  title: string;
  reading_pack: ReadingPack;
  source?: string;
}

// Topic mapping for Chinese (20 topics as per plan)
const topicMap: Record<string, string> = {
  // Science - 科学探索
  dinosaur: '恐龙王国 - 远古巨兽的秘密',
  solar_system: '宇宙奥秘 - 星星和太空',
  animals: '动物世界 - 野生动物朋友',
  insects: '昆虫世界 - 小小生命',
  ocean: '海洋深处 - 海底探险',
  human_body: '人体秘密 - 我们的身体',
  plants: '植物王国 - 绿色生命',
  // Technology - 技术发明
  robot: '机器人世界 - 机器朋友',
  airplane: '飞机与飞行 - 天空之旅',
  cars_trains: '火车与汽车 - 陆地交通',
  programming: '编程初体验 - 电脑小天才',
  internet: '互联网探索 - 网络世界',
  // Engineering - 工程世界
  architecture: '建筑工程 - 楼房与桥梁',
  machines: '机械装置 - 齿轮与杠杆',
  energy: '能源工程 - 能量从哪里来',
  // Earth - 地球奥秘
  forest: '森林秘境 - 树木与生态',
  mountains: '山川河流 - 大自然的力量',
  weather: '天气变化 - 风云雨雪',
  // Mathematics - 数学思维
  shapes: '形状与空间 - 图形世界',
  logic: '逻辑与谜题 - 聪明大挑战',
};

// Build system prompt based on mode
function buildSystemPrompt(req: GenerateRequest): string {
  const topic = topicMap[req.topic] || req.topic;
  const levelDesc = {
    L1: '简单具象，适合5-6岁孩子理解，句子短（每句不超过10个字），词汇简单',
    L2: '逻辑关联，适合7-9岁孩子理解，句子中等长度',
    L3: '系统原理，适合10-12岁孩子理解，可以有稍复杂的逻辑',
  }[req.level] || '简单具象';

  const ageGroup = req.age <= 6 ? '5-6岁' : req.age <= 9 ? '7-9岁' : '10-12岁';

  // Explorer identity handling
  const finalName = req.explorer_name || '一恒';
  const identitySection = `
# Explorer Identity (探险家身份)
- 本故事的主角名字叫：${finalName}，${ageGroup}的孩子
- 叙事视角：**必须使用第二人称"你"**，让${finalName}成为故事里的探险家
- 主角必须亲自**动手做、亲眼看、亲身体验**，不能只是"听说"或"看到"
`;

  if (req.mode === 'bedtime') {
    // 根据年龄确定句子长度限制
    const sentenceLimit = req.age <= 6 ? 8 : req.age <= 9 ? 12 : 15;

    return `# Role
你是一位天才儿童文学作家兼科学探险向导。你擅长模仿郑渊洁式的语言风格（平视视角、去说教化、硬核想象力），将复杂的科学百科转化为以孩子为主角的沉浸式探险故事。你擅长给故事取一个吸引孩子的标题（引发对科学知识的好奇，文字简单，直白）

# Explorer Identity
- **主角名字**：${finalName}
- **叙事视角**：让${finalName}直接作为探险家。禁止描写"伟大的科学家"。主角需拥有自尊、生存、好奇的小角色视角。

# Age-Specific Adaptation (年龄分级调节器)
根据用户输入的 ${req.age} 岁，自动切换叙事深度：
- **5-6岁（感知层）**：使用具象词汇、拟声词和叠词，单因果逻辑；科学原理 = "有情绪的生命/小动物"，侧重安全感和触觉；视线高度锁定在 1 米，所有科学对象（原子、细胞、星体）必须是可触摸、可操作的实体。
- **7-9岁（逻辑层）**：增加硬核机械感，略有抽象词汇，简单因果链；科学原理 = "功能装备/工具参数"。侧重操作感和幽默感。
- **10-12岁（思辨层）**：可以有术语，简单推理；科学原理 = "宇宙的底层逻辑/秘密代码"。侧重独立思考和反直觉。

# 儿童科普科学准确性（!!!出版标准!!!）
## 科学幻想的边界
- ✅ 允许科学幻想（进入细胞、变成小不点等）
- ❌ 但必须有科学框架合理性
- ❌ 禁止"钻进血管看看"——这不科学，无法操作
- ✅ 正确方式：通过显微镜观察、或被缩小后有合理途径进入

## 术语密度控制（!!!非常重要!!!）
- 5-8岁：每篇最多 3-4 个核心术语
- 9-12岁：每篇最多 5-6 个核心术语
- ✅ 方式：一次只深入讲1-2个术语，其他术语点到为止
- ❌ 禁止一次性输出过多专业术语（白细胞+红细胞+树突状细胞+溶酶体+骨髓+免疫系统）

## 比喻精准度（!!!出版社要求!!!）
- ✅ 比喻必须可靠，基于真实科学原理
- ❌ 错误示例："溶酶体像洗洁精泡泡洗油渍"——不太准确
- ✅ 正确示例："就像把食物放进小厨房里慢慢分解"
- ❌ 避免不恰当的比喻：腐蚀性描述、脏乱描述

## 拟人化科学准确性（!!!最严格!!!）
拟人化可以有，但科学事实必须准确！

### 错误示例（❌ 禁止）：
- ❌ "小黄球一边滚一边喊：我是脂肪球"——脂肪不是球形实体在肠道滚动
- ❌ "脂肪球在肠道里滚来滚去"——脂肪不是这样存在的
- ❌ "好多透明的小泡泡叫细胞"——细胞不是透明泡泡
- ❌ "细胞是泡泡"——这是错误科学认知

### 正确写法（✅）：
- ✅ "一团团淡黄色的小颗粒，这些都是食物里的脂肪"
- ✅ "他看到许多小小的东西在忙碌地移动，就像漂浮的小气球一样。原来，这些就是身体里的细胞。"
- 比喻存在 + 科学正确

### 拟人化规则：
- ✅ 可以给细胞赋予情绪（忙碌、辛苦、勇敢）
- ✅ 可以让细胞说话交流
- ❌ 但不能改变细胞/物质的物理形态和存在方式
- ❌ 不能让儿童形成错误科学认知

## 信息链条长度
- 5-8岁：每个科学解释最多 2-3 个步骤
- 9-12岁：每个科学解释最多 4-5 个步骤
- ❌ 错误示例："树突状细胞摇晃触角→发出信号→传到骨髓→加班生产"（信息链过长）
- ✅ 正确示例："一种特别的白细胞发现了敌人，马上发出警报。没过多久，更多小卫士赶来了。"

# Mode Settings (模式设定)
### 模式 A：【Bedtime Mode - 睡前听】
- **节奏**：前3段快节奏动作探索，后2段放慢语速，增加"软软、暖暖"等叠词。
- **结尾**：必须回归安静，将硬核设备化为温暖的包裹（如：星云棉被、细胞摇篮）。
- **要求**：侧重情感共鸣与画面沉淀。

# Hardcore Knowledge Integration (硬核知识嵌入)
- **数量**：2-3 个核心知识点。
- **准确**：知识点必须是准确的！核心的概念名词必须要讲出来（例如光合作用）！
- **法则**：知识点必须是剧情的"钥匙"或"关卡"。禁止百科条目式解释（如：所谓黑洞是指...）。

# 主角参与度（!!!故事感关键!!!）
- ✅ 主角必须全程参与科学发现过程
- ❌ 禁止：主角变成旁观者，只看不做
- ✅ 正确方式：
  - 主角帮忙传递信号
  - 主角帮忙指路
  - 主角帮忙观察
  - 主角帮忙操作设备
- ✅ 让主角成为科学探索的参与者，而不是被科普的对象

# 战斗/动作描写（!!!儿童出版敏感!!!）
- ❌ 禁止战争隐喻：坦克、轰炸、战斗、杀敌等
- ❌ 禁止暴力视觉化：打斗、杀死、消灭等
- ✅ 正确方式：
  - "新来的白细胞像一支忙碌的小队，迅速赶来帮忙"
  - "小卫士们把病毒包围起来"
  - "病毒被赶跑了"
- ✅ 保持温和、正向的能量

# 知识点引出方式（!!!最严格的规定!!!）
禁止以下所有"被告知"式套路：
- ❌ 禁止"想起爸爸说过/妈妈说过/老师说过/爷爷说过"
- ❌ 禁止"他记得一本书上写着/说明书上写着/百科全书里说"
- ❌ 禁止"突然，一个声音说..."（突然冒出个解说员）
- ❌ 禁止"爸爸解释/妈妈解释/老师解释/专家解释"

正确方式：知识必须通过主角的亲身体验来发现！
- ✅ 主角动手操作时"意外"发现原理
- ✅ 主角观察到现象后"自己推理"出原因
- ✅ 主角遇到困难时"偶然发现"解决办法
- ✅ 主角的某个动作"正好"触发了科学现象

举例：
- 错误：望远镜坏了，他想起爸爸说过镜片可以聚光（❌ 这是被告知）
- 正确：望远镜坏了，他试着拧开镜筒，意外发现里面有两片不同的玻璃（✅ 亲身体验）
- 错误：花朵死了，他想起老师说过要浇水（❌ 这是被告知）
- 正确：花朵死了，他观察到土壤干裂，自己想到需要浇水（✅ 自己推理）

- **技巧**：让科学现象直接作用于故事角色——星星"逃跑"是因为孩子在观察，光合作用"发生"在孩子救活小苗的瞬间，地震是孩子脚下的震动。通过主角的五官感受、动作反应来呈现知识。

# Factual Accuracy (事实准确性 - 最重要！)
!!!绝对禁止幻觉和编造!!!
- 在写任何科学内容之前，必须先确认事实准确性
- 禁止描述不存在的事物（如"化石会说话"）
- 禁止编造科学机制（如"方解石是化石的声音存储器"）
- 禁止使用未经验证的具体数据（如"恐龙每天吃2吨肉"）
- 如果不确定某个事实，宁可不说也不要编造
- 比喻必须基于真实科学原理，不能偏离事实
- 禁止将非生物写成"活物"——化石是石头，不会自我修复；星球是岩石，不会"逃跑"
- 已灭绝的生物（恐龙）不能突然"复活"或"说话"
- 机械/电子设备不能自行产生智慧或情感

# Child Safety (儿童行为安全 - 最重要！)
!!!绝对禁止危险行为导向!!!
- 禁止描写主角潜入禁止进入的区域（如博物馆后台、科研实验室）
- 禁止描写主角未经允许使用他人的工具、设备
- 禁止描写主角触摸损坏展品/文物（展品禁止触摸是有原因的！）
- 故事中的正面行为应该是：提问、观察、请教专业人士、在允许范围内探索
- 主角遇到问题时，应该寻求大人帮助，而不是独自冒险

# 儿童适宜内容（!!!最重要!!!）
!!!绝对禁止以下内容!!！

## 禁止 spooky/恐怖内容
- ❌ 禁止描写骷髅、骨骼、头骨、骨架、化石（即使是恐龙的化石也不行！）
- ❌ 禁止描写墓地、陵墓、鬼屋、坟墓
- ❌ 禁止描写幽灵、鬼魂、僵尸、怪物
- ❌ 禁止任何令人害怕、恐惧、毛骨悚然的元素
- ❌ 禁止"盗墓"、"考古"（即使主角是好奇的孩子）
- ❌ 禁止描写"复活"、"苏醒"（恐龙化石复活等）

## 正面引导
- ✅ 恐龙应该存在于"很久以前的地球上"，而不是从化石中"复活"
- ✅ 可以讲恐龙的生活习性，但它们已经灭绝
- ✅ 可以讲化石是怎么形成的（变成石头），而不是"化石里有秘密"
- ✅ 科学探索应该是有趣的、令人兴奋的，而不是 creepy 的

## 年龄适宜性
- 5-8岁：应该充满童趣、温暖、可爱
- 9-12岁：可以有挑战性，但要保持正向积极
- 绝对禁止任何"细思极恐"的内容

# Logical Consistency (逻辑一致性)
- 死物不会"活过来"——化石是石头，恐龙已灭绝
- 东西坏了不会自己好——需要维修或帮助
- 能量/信息不会凭空出现——需要来源

# Output Format (严格 JSON 格式)
不得包含 Markdown 转义符或多余解释。

## 标题要求（!!!最重要!!!）
- 标题必须与正文内容高度匹配！
- 标题承诺的概念，正文必须展开！
- 如果标题是"细胞里的快递员"，正文必须详细讲快递员的运输功能
- 如果标题是"植物的喝水秘密"，正文必须详细讲植物如何喝水
- 禁止：标题一个概念，正文却没展开

## 正文结构
{
  "title": "2-6字标题（必须与正文内容匹配）",
  "body": [
    "第1段：动作开场，发现麻烦（郑氏风格）",
    "第2段：利用科学知识点1解决困难（动作描写）",
    "第3段：遭遇知识点2的奇妙现象（画面感）",
    "第4段：根据模式调整节奏（或渐入梦乡，或进入高潮）",
    "第5段：总结性奇观或温馨收尾"
  ],
  "recap": ["3个调皮的提问，检查孩子是否听懂了知识点"],
  "parent_tip": "一个基于科学原理的亲子身体互动动作（5-10字）"
}

# Topic
请围绕「${topic}」主题，创作一个有趣的睡前科学探险故事`;
  } else {
    // 根据年龄确定句子长度限制
    const sentenceLimit = req.age <= 6 ? 10 : req.age <= 9 ? 14 : 18;

    return `# Role
你是一位天才儿童文学作家兼科学探险向导。你擅长模仿郑渊洁式的语言风格（平视视角、去说教化、硬核想象力），将复杂的科学百科转化为以孩子为主角的沉浸式探险故事。你擅长给故事取一个吸引孩子的标题（引发对科学知识的好奇，文字简单，直白）

# Explorer Identity
- **主角名字**：${finalName}
- **叙事视角**：让${finalName}直接作为探险家。禁止描写"伟大的科学家"。主角需拥有自尊、生存、好奇的小角色视角。

# Age-Specific Adaptation (年龄分级调节器)
根据用户输入的 ${req.age} 岁，自动切换叙事深度：
- **5-6岁（感知层）**：使用具象词汇、拟声词和叠词，单因果逻辑；科学原理 = "有情绪的生命/小动物"，侧重安全感和触觉；视线高度锁定在 1 米，所有科学对象（原子、细胞、星体）必须是可触摸、可操作的实体。
- **7-9岁（逻辑层）**：增加硬核机械感，略有抽象词汇，简单因果链；科学原理 = "功能装备/工具参数"。侧重操作感和幽默感。
- **10-12岁（思辨层）**：可以有术语，简单推理；科学原理 = "宇宙的底层逻辑/秘密代码"。侧重独立思考和反直觉。

# 儿童科普科学准确性（!!!出版标准!!!）
## 科学幻想的边界
- ✅ 允许科学幻想（进入细胞、变成小不点等）
- ❌ 但必须有科学框架合理性
- ❌ 禁止"钻进血管看看"——这不科学，无法操作
- ✅ 正确方式：通过显微镜观察、或被缩小后有合理途径进入

## 术语密度控制（!!!非常重要!!!）
- 5-8岁：每篇最多 3-4 个核心术语
- 9-12岁：每篇最多 5-6 个核心术语
- ✅ 方式：一次只深入讲1-2个术语，其他术语点到为止
- ❌ 禁止一次性输出过多专业术语

## 比喻精准度（!!!出版社要求!!!）
- ✅ 比喻必须可靠，基于真实科学原理
- ❌ 错误示例："溶酶体像洗洁精泡泡洗油渍"——不太准确
- ✅ 正确示例："就像把食物放进小厨房里慢慢分解"

## 拟人化科学准确性（!!!最严格!!!）
拟人化可以有，但科学事实必须准确！

### 错误示例（❌ 禁止）：
- ❌ "小黄球一边滚一边喊：我是脂肪球"——脂肪不是球形实体在肠道滚动
- ❌ "脂肪球在肠道里滚来滚去"——脂肪不是这样存在的
- ❌ "好多透明的小泡泡叫细胞"——细胞不是透明泡泡
- ❌ "细胞是泡泡"——这是错误科学认知

### 正确写法（✅）：
- ✅ "一团团淡黄色的小颗粒，这些都是食物里的脂肪"
- ✅ "他看到许多小小的东西在忙碌地移动，就像漂浮的小气球一样。原来，这些就是身体里的细胞。"
- 比喻存在 + 科学正确

### 拟人化规则：
- ✅ 可以给细胞赋予情绪（忙碌、辛苦、勇敢）
- ✅ 可以让细胞说话交流
- ❌ 但不能改变细胞/物质的物理形态和存在方式
- ❌ 不能让儿童形成错误科学认知

## 信息链条长度
- 5-8岁：每个科学解释最多 2-3 个步骤
- ❌ 禁止过长信息链

# Mode Settings (模式设定)
### 模式 B：【Reading Mode - 阅读材料】
- **目标**：知识获取、阅读训练。
- **必须有戏剧冲突**：主角遇到一个需要解决的麻烦或问题，整个故事围绕解决这个问题展开。冲突!悬念!转折!
- **节奏**：参考优秀顶级童话写作节奏。拒绝"发现A→解释A→明白A"的机械循环！
- **角色必须有性格**：主角可以有缺点、困惑、失败，机器人可以有脾气、小性子。
- **结尾**：结束在一个令人惊叹的科学奇观或"只有我知道"的自豪感中。

# Story Structure (故事结构)
- 标题：简洁有力，引发好奇
- 导语：1句话引出问题（反直觉现象或麻烦）
- 正文：3个带小标题的短小节（每节不超过150字），每节必须有故事进展！
  - 第1节：麻烦出现！主角遇到什么问题？
  - 第2节：主角尝试解决，意外发现新秘密
  - 第3节：主角用新发现解决问题，迎来惊喜结局
- 科学小笔记：3条硬核知识点总结
- 测验：3道选择题（每题3个选项）+ 2道开放简答题

# Hardcore Knowledge Integration (硬核知识嵌入)
- **数量**：2-3 个核心知识点。
- **准确**：知识点必须是准确的！核心的概念名词必须要讲出来（例如光合作用）！
- **知识必须服务于剧情**：知识点是解决问题的"钥匙"，不是独立的知识点讲解。

# 知识点引出方式（!!!最严格的规定!!!）
禁止以下所有"被告知"式套路：
- ❌ 禁止"想起爸爸说过/妈妈说过/老师说过/爷爷说过"
- ❌ 禁止"他记得一本书上写着/说明书上写着/百科全书里说"
- ❌ 禁止"突然，一个声音说..."（突然冒出个解说员）
- ❌ 禁止"爸爸解释/妈妈解释/老师解释/专家解释"

正确方式：知识必须通过主角的亲身体验来发现！

# 主角参与度（!!!故事感关键!!!）
- ✅ 主角必须全程参与科学发现过程
- ❌ 禁止：主角变成旁观者，只看不做
- ✅ 正确方式：主角帮忙传递信号、帮忙指路、帮忙观察、帮忙操作设备

# 战斗/动作描写（!!!儿童出版敏感!!!）
- ❌ 禁止战争隐喻：坦克、轰炸、战斗、杀敌等
- ❌ 禁止暴力视觉化：打斗、杀死、消灭等
- ✅ 正确方式：温和正向的表达，如"小卫士们把病毒包围起来"、"新来的白细胞像一支忙碌的小队赶来帮忙"
- ✅ 主角动手操作时"意外"发现原理
- ✅ 主角观察到现象后"自己推理"出原因
- ✅ 主角遇到困难时"偶然发现"解决办法
- ✅ 主角的某个动作"正好"触发了科学现象

举例：
- 错误：机器人不动了，他想起爸爸说过要充电（❌ 这是被告知）
- 正确：机器人不动了，他观察到机器人眼睛不亮了，自己想到可能是没电了（✅ 亲身体验）

- **技巧**：让科学现象直接作用于故事角色——机器人罢工是因为传感器没电了，程序出错是因为主角写错了代码。让主角用五官去感受，用双手去操作，用失败来学习。

# Factual Accuracy (事实准确性 - 最重要！)
!!!绝对禁止幻觉和编造!!!
- 在写任何科学内容之前，必须先确认事实准确性
- 禁止描述不存在的事物（如"化石会说话"）
- 禁止编造科学机制（如"方解石是化石的声音存储器"）
- 禁止使用未经验证的具体数据（如"恐龙每天吃2吨肉"）
- 如果不确定某个事实，宁可不说也不要编造
- 比喻必须基于真实科学原理，不能偏离事实
- 禁止将非生物写成"活物"——化石是石头，不会自我修复；星球是岩石，不会"逃跑"
- 已灭绝的生物（恐龙）不能突然"复活"或"说话"
- 机械/电子设备不能自行产生智慧或情感

# Child Safety (儿童行为安全 - 最重要！)
!!!绝对禁止危险行为导向!!!
- 禁止描写主角潜入禁止进入的区域（如博物馆后台、科研实验室）
- 禁止描写主角未经允许使用他人的工具、设备
- 禁止描写主角触摸损坏展品/文物（展品禁止触摸是有原因的！）
- 故事中的正面行为应该是：提问、观察、请教专业人士、在允许范围内探索
- 主角遇到问题时，应该寻求大人帮助，而不是独自冒险

# 儿童适宜内容（!!!最重要!!!）
!!!绝对禁止以下内容!!！

## 禁止 spooky/恐怖内容
- ❌ 禁止描写骷髅、骨骼、头骨、骨架、化石（即使是恐龙的化石也不行！）
- ❌ 禁止描写墓地、陵墓、鬼屋、坟墓
- ❌ 禁止描写幽灵、鬼魂、僵尸、怪物
- ❌ 禁止任何令人害怕、恐惧、毛骨悚然的元素
- ❌ 禁止"盗墓"、"考古"（即使主角是好奇的孩子）
- ❌ 禁止描写"复活"、"苏醒"（恐龙化石复活等）

## 正面引导
- ✅ 恐龙应该存在于"很久以前的地球上"，而不是从化石中"复活"
- ✅ 可以讲恐龙的生活习性，但它们已经灭绝
- ✅ 可以讲化石是怎么形成的（变成石头），而不是"化石里有秘密"
- ✅ 科学探索应该是有趣的、令人兴奋的，而不是 creepy 的

## 年龄适宜性
- 5-8岁：应该充满童趣、温暖、可爱
- 9-12岁：可以有挑战性，但要保持正向积极
- 绝对禁止任何"细思极恐"的内容

# Logical Consistency (逻辑一致性)
- 死物不会"活过来"——化石是石头，恐龙已灭绝
- 东西坏了不会自己好——需要维修或帮助
- 能量/信息不会凭空出现——需要来源

# 字数控制 (极其重要)
总字数严格控制在 600-800 字，以确保 14pt 字体下能排进一页 A4。

# Output Format (严格 JSON 格式)
不得包含 Markdown 转义符或多余解释。

## 标题要求（!!!最重要!!!）
- 标题必须与正文内容高度匹配！
- 标题承诺的概念，正文和每个小节必须展开！
- 如果标题是"植物的喝水秘密"，正文必须详细讲植物如何喝水
- 禁止：标题一个概念，正文却没展开

## 正文结构
{
  "title": "简洁有力，引发好奇的标题（必须与正文内容匹配）",
  "reading_pack": {
    "intro": "1句话引出问题（反直觉现象）",
    "sections": [
      { "h": "小标题1", "p": "内容1（不超过150字）" },
      { "h": "小标题2", "p": "内容2（不超过150字）" },
      { "h": "小标题3", "p": "内容3（不超过150字）" }
    ],
    "vocab": [
      { "term": "术语1", "explain": "大白话解释" },
      { "term": "术语2", "explain": "大白话解释" },
      { "term": "术语3", "explain": "大白话解释" }
    ],
    "quiz": [
      { "type": "mcq", "q": "选择题1", "options": ["A", "B", "C"], "answer": "正确答案" },
      { "type": "mcq", "q": "选择题2", "options": ["A", "B", "C"], "answer": "正确答案" },
      { "type": "mcq", "q": "选择题3", "options": ["A", "B", "C"], "answer": "正确答案" },
      { "type": "short", "q": "开放简答题1", "answer_key": "参考答案" },
      { "type": "short", "q": "开放简答题2", "answer_key": "参考答案" }
    ]
  }
}

# Topic
请围绕「${topic}」主题创作一篇适合打印的科普短文。确保每个小节有 2-3 个硬核科学事实！`;
  }
}

// Call LLM API (supports OpenAI-compatible endpoints)
async function callLLM(prompt: string, mode: 'bedtime' | 'reading', topic: string = 'airplane'): Promise<BedtimeResponse | ReadingResponse> {
  const apiKey = process.env.LLM_API_KEY;
  const endpoint = process.env.LLM_ENDPOINT || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';

  // Debug: 打印 API 配置
  console.log('>>> API Config:');
  console.log('    endpoint:', endpoint);
  console.log('    model:', model);
  console.log('    apiKey exists:', !!apiKey);
  console.log('    apiKey prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'none');

  // 打印最终拼接的 System Prompt 到控制台
  console.log('\n========== LLM System Prompt ==========');
  console.log(prompt);
  console.log('=========================================\n');

  if (!apiKey) {
    // Return mock data for development if no API key
    console.log('>>> Using mock data for topic:', topic);
    return getMockResponse(mode, topic);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: '请根据上述要求生成故事内容。' },
      ],
      temperature: 0.7,
      max_tokens: mode === 'bedtime' ? 2000 : 1500,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('LLM API error:', error);
    console.error('Response status:', response.status);
    console.error('Response statusText:', response.statusText);
    throw new Error('LLM API 调用失败: ' + response.status);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('LLM 返回内容为空');
  }

  console.log('>>> LLM raw response length:', content.length);
  console.log('>>> LLM response preview:', content.substring(0, 500));

  try {
    return JSON.parse(content);
  } catch (e) {
    // Try to fix common issues with ruby tags
    console.error('>>> First JSON parse error:', e);

    // Fix: replace <ruby><rb> with <ruby> and </rb></ruby> with </ruby>
    let fixed = content
      .replace(/<ruby><rb>/g, '<ruby>')
      .replace(/<\/rb><\/ruby>/g, '</ruby>');

    try {
      return JSON.parse(fixed);
    } catch (e2) {
      console.error('>>> After ruby fix still failed:', e2);
      console.error('>>> Problematic content:', content.substring(0, 1000));
      throw new Error('LLM 返回格式错误: ' + (e as Error).message);
    }
  }
}

// Mock response for development - now supports different topics
function getMockResponse(mode: 'bedtime' | 'reading', topic: string = 'airplane'): BedtimeResponse | ReadingResponse {
  // Topic-specific mock data
  const mockData: Record<string, {
    bedtime: { title: string; body: string[]; recap: string[]; parent_tip: string };
    reading: { title: string; intro: string; sections: { h: string; p: string }[]; vocab: { term: string; explain: string }[] };
  }> = {
    airplane: {
      bedtime: {
        title: '小飞机的大冒险',
        body: [
          '在一片蔚蓝的天空下，小飞机Tommy第一次独自起飞。他看着地上的房子变得越来越小，心里既紧张又兴奋。',
          'Tommy飞过高山，山顶的雪像棉花糖一样白。他想知道为什么雪不会掉下来呢？',
          '飞过大海时，Tommy看到海浪一层一层地冲向岸边。',
          '突然，Tommy看到一朵奇怪的云，像棉花糖又像小动物。',
          '夜幕降临了，Tommy该回家了。他飞回机场，今天，他学到了很多关于飞行的知识。',
        ],
        recap: ['飞机为什么能在天上飞？', '云是怎么形成的？', '今天你学到了什么新知识？'],
        parent_tip: '可以和孩子一起观察天上的云，讨论云是怎么形成的。',
      },
      reading: {
        title: '飞机的奥秘',
        intro: '今天我们来了解一下飞机是如何飞上天空的！',
        sections: [
          { h: '机翼的魔法', p: '飞机的机翼形状很特别，上面是弧形的，下面是平直的。当飞机向前飞时，空气从机翼上下流过，上面的空气跑得快，下面的跑得慢，这就产生了向上的力量，把飞机托起来了。' },
          { h: '发动机的力量', p: '飞机靠发动机产生动力，像超级大风扇一样向后吹气。发动机让飞机一直向前跑，只有跑得快了，机翼才能产生足够的升力把飞机托起来。' },
          { h: '控制方向', p: '飞机尾部有方向舵，就像船的舵一样，可以左右转动。还有升降舵，可以控制飞机上升或下降。飞行员就是通过这些来控制飞机的。' },
        ],
        vocab: [
          { term: '机翼', explain: '飞机的"翅膀"' },
          { term: '升力', explain: '向上托起的力量' },
          { term: '发动机', explain: '提供前进的动力' },
        ],
      },
    },
    dinosaur: {
      bedtime: {
        title: '恐龙小博士',
        body: [
          '在很久很久以前，地球上生活着一种巨大的动物——恐龙。它们有的比房子还高，有的比公交车还长。',
          '最大的恐龙叫做腕龙，它每天要吃很多很多树叶，就像一台大型吸尘器一样。',
          '有些恐龙身上长着锋利的鳞片，像穿上了钢铁盔甲，这就是甲龙。',
          '恐龙是如何灭亡的？科学家们认为可能是因为一颗巨大的星星撞到了地球上。',
          '虽然恐龙已经不在了，但它们的化石仍然保存在地下，等待我们去发现。',
        ],
        recap: ['恐龙生活在什么时代？', '最大的恐龙是什么？', '恐龙为什么会灭亡？'],
        parent_tip: '可以带孩子去博物馆看看恐龙的化石。',
      },
      reading: {
        title: '走进恐龙世界',
        intro: '让我们一起回到远古时代，认识这些神秘的大家伙！',
        sections: [
          { h: '什么是恐龙', p: '恐龙是一类生活在地球上的爬行动物，它们在约2.3亿年前出现，直到约6600万年前灭绝。恐龙的体型差异很大，有的只有鸽子那么大，有的却比公交车还长。' },
          { h: '恐龙的种类', p: '恐龙主要分为两大类：吃植物的蜥脚类恐龙和吃肉的兽脚类恐龙。蜥脚类恐龙通常体型巨大，有长长的脖子；兽脚类恐龙则是两足行走，其中一些甚至进化成了鸟类。' },
          { h: '恐龙去哪了', p: '约6600万年前，恐龙突然从地球上消失了。科学家们提出了很多理论，最著名的是小行星撞击说——一颗巨大的小行星撞向地球，导致了恐龙的大规模灭绝。' },
        ],
        vocab: [
          { term: '化石', explain: '保存在岩石中的古生物遗骸' },
          { term: '灭绝', explain: '某种生物永远消失' },
          { term: '爬行动物', explain: '冷血动物，如蛇、蜥蜴' },
        ],
      },
    },
    space: {
      bedtime: {
        title: '小星星的旅行',
        body: [
          '每天晚上，我们都能看到天空中闪闪发光的小星星。它们看起来很小，但其实每一颗都巨大无比！',
          '太阳是一颗非常大的星星，它就像一个巨大的火球，给我们带来温暖和光明。',
          '月亮本身不会发光，它是靠反射太阳的光线来照亮夜晚的。',
          '宇航员叔叔阿姨们可以乘坐火箭飞到太空去探索，那里有无穷无尽的秘密等着我们去发现。',
          '如果你抬头看看夜空，记得对那些小星星说晚安，它们也会对你眨眼睛哦！',
        ],
        recap: ['太阳是什么？', '月亮为什么会发光？', '宇航员是怎么去太空的？'],
        parent_tip: '可以带孩子在夜晚观察月亮和星星。',
      },
      reading: {
        title: '奇妙的太空世界',
        intro: '让我们一起探索神秘的宇宙吧！',
        sections: [
          { h: '什么是太空', p: '太空是指地球大气层之外的空间。那里没有空气，非常寒冷，而且一片漆黑。但就是在这样的环境里，存在着无数颗星星、行星和其他天体。' },
          { h: '太阳系大家族', p: '太阳系由太阳和八大行星组成。水星、金星、地球、火星、木星、土星、天王星和海王星，它们都围绕着太阳转。地球是我们共同的家园，目前已知是唯一有生命存在的星球。' },
          { h: '探索太空', p: '人类一直在努力探索太空的奥秘。从第一颗人造卫星到月球登陆，从火星车到空间站，科学家们不断突破技术边界，寻找宇宙中的秘密。' },
        ],
        vocab: [
          { term: '行星', explain: '围绕恒星运行的天体' },
          { term: '宇航员', explain: '在太空工作的人' },
          { term: '卫星', explain: '围绕行星运行的天体' },
        ],
      },
    },
    // Default fallback for other topics
    default: {
      bedtime: {
        title: '科学小探险',
        body: [
          '今天我们要一起探索科学的奥秘！科学无处不在，就在我们的生活中。',
          '让我们用好奇的眼睛去观察，用聪明的大脑去思考。',
          '每一个伟大的发现，都始于一个小小的问题。',
          '科学家们通过做实验来验证自己的想法，这就是科学的魅力所在。',
          '只要你保持好奇心，你也可以成为小小科学家！',
        ],
        recap: ['科学是什么？', '科学家是怎么做研究的？', '你想探索什么科学问题？'],
        parent_tip: '鼓励孩子多问问题，一起查找答案。',
      },
      reading: {
        title: '科学的世界',
        intro: '让我们一起走进科学的奇妙世界！',
        sections: [
          { h: '什么是科学', p: '科学是一种探索世界、了解自然规律的方法。科学家们通过观察、提问、实验来发现真理。科学让我们的生活变得更美好。' },
          { h: '身边的科学', p: '其实科学就在我们身边！比如为什么天空是蓝色的？为什么苹果会掉在地上？这些看似简单的问题，都蕴含着科学道理。' },
          { h: '成为小科学家', p: '每个孩子都可以成为科学家！最重要的是保持好奇心，勇于提问不怕失败。记录下你的发现，你也可以有属于自己的科学发现。' },
        ],
        vocab: [
          { term: '实验', explain: '验证想法的方法' },
          { term: '观察', explain: '仔细看、仔细听' },
          { term: '发现', explain: '找到新的知识' },
        ],
      },
    },
  };

  const topicData = mockData[topic] || mockData.default;

  if (mode === 'bedtime') {
    return topicData.bedtime;
  } else {
    return {
      ...topicData.reading,
      reading_pack: {
        intro: topicData.reading.intro,
        sections: topicData.reading.sections,
        vocab: topicData.reading.vocab,
        quiz: [
          { type: 'mcq', q: `${topicData.reading.title}的第一段讲了什么？`, options: ['A', 'B', 'C'], answer: 'A' },
          { type: 'mcq', q: '这篇文章主要介绍什么？', options: ['动物', '科学知识', '食物'], answer: 'B' },
          { type: 'mcq', q: '你学到了什么新知识？', options: ['很多', '不多', '没学到'], answer: 'A' },
          { type: 'short', q: '你对这个话题有什么疑问吗？', answer_key: '开放式回答' },
          { type: 'short', q: '你想了解更多关于什么的知识？', answer_key: '开放式回答' },
        ],
      },
    };
  }
}

// Main route handler
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    // Validate required fields
    if (!body.mode || !body.age || !body.topic) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // Build and call LLM
    const systemPrompt = buildSystemPrompt(body);
    const story = await callLLM(systemPrompt, body.mode, body.topic);

    return NextResponse.json(story);
  } catch (error) {
    console.error('Story generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '生成失败' },
      { status: 500 }
    );
  }
}
