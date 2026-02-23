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

// Topic mapping for Chinese
const topicMap: Record<string, string> = {
  dinosaur: '恐龙',
  space: '宇宙',
  airplane: '飞机',
  insect: '昆虫',
  robot: '机器人',
  ocean: '海洋',
  forest: '森林',
  animal: '动物',
};

// Build system prompt based on mode
function buildSystemPrompt(req: GenerateRequest): string {
  const topic = topicMap[req.topic] || req.topic;
  const levelDesc = {
    L1: '简单具象，适合5-6岁孩子理解',
    L2: '逻辑关联，适合7-9岁孩子理解',
    L3: '系统原理，适合10-12岁孩子理解',
  }[req.level] || '简单具象';

  // Explorer identity handling
  const finalName = req.explorer_name || '你';
  const identitySection = `
# Explorer Identity (探险家身份)
- 本故事的主角设定为：${finalName}。
- 叙事视角：请严格使用**第二人称**。如果主角设定是'你'，请直接用'你'来展开叙述。如果提供了名字（如'小明'），请使用'小明，你...'或直接在动作描述中使用名字来增强代入感。
- STEM 互动：确保主角（${finalName}）是科学探索的执行者。例如：'${finalName}，当你拨动实验开关时，你观察到...'，让科学原理通过主角的实际操作展现出来。
`;

  if (req.mode === 'bedtime') {
    return `# Role
你是一位专业的儿童 STEM 教育专家和金牌童书编辑，擅长将复杂的科学知识转化为生动有趣的睡前故事。

# Output Format
严格输出 JSON 格式，不得包含任何 Markdown 转义符或多余解释。

${identitySection}
# Bedtime Mode (睡前听)

目标：安稳、催眠、启发好奇心。

## Structure
- 标题：简洁温馨
- 正文：5个段落，每段 150-200 字
- 复盘：3个反思提问
- 亲子互动：1条建议

## 字数
总计约 900-1000 字。

## JSON 字段
{ "title", "body": ["段落1", "段落2", "段落3", "段落4", "段落5"], "recap": ["问题1", "问题2", "问题3"], "parent_tip": "" }

# Language & Tone
- 使用简体中文
- 针对 ${req.age} 岁孩子的认知水平 (${levelDesc})
- 语言温馨、柔和、有想象力
- STEM 知识点必须准确
- 参考 Kiddle 词条风格：简洁、有趣、适合儿童

# Topic
请围绕「${topic}」主题创作一个睡前科学故事。`;
  } else {
    return `# Role
你是一位专业的儿童 STEM 教育专家和金牌童书编辑，擅长将复杂的科学知识转化为适合儿童阅读的科普文章。

# Output Format
严格输出 JSON 格式，不得包含任何 Markdown 转义符或多余解释。

${identitySection}
# Reading Mode (阅读材料)

目标：知识获取、阅读训练、适合 A4 纸打印。

## 字数控制 (极其重要)
总字数严格控制在 600-800 字，以确保 14pt 字体下能排进一页 A4。

## Structure
- 标题：简洁有力
- 导语：1 句话引出问题
- 正文：3 个带小标题的短小节（每节不超过 150 字）
- 词汇盒：3 个关键词，每个解释不超过 12 字
- 测验：3道选择题（每题3个选项）+ 2道开放简答题

## 拼音标注
- **不需要手动标注拼音**，前端会自动为所有中文添加拼音
- 保持纯中文文本输出即可

## JSON 字段
{ "title", "intro", "reading_pack": { "sections": [{ "h": "小标题", "p": "内容" }], "vocab": [{ "term": "", "explain": "" }], "quiz": [{ "type": "mcq", "q": "", "options": [], "answer": "" }, { "type": "short", "q": "", "answer_key": "" }] } }

# Language & Tone
- 使用简体中文
- 针对 ${req.age} 岁孩子的认知水平 (${levelDesc})
- 语言生动、鼓励探索
- STEM 知识点必须准确
- 参考 Kiddle 词条风格：简洁、有趣、适合儿童

# Topic
请围绕「${topic}」主题创作一篇适合打印的科普短文。`;
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
