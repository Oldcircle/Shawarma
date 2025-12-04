import { GoogleGenAI } from "@google/genai";
import { DayStats } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("No API KEY found");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateDailyReview = async (stats: DayStats): Promise<string> => {
  const ai = getClient();
  if (!ai) return "美食评论员正在休息...";

  const prompt = `
    你是一个嘴刁但有趣的美食探店博主。玩家在经营一家 "美味沙威玛" 小吃摊。
    今天是第 ${stats.dayNumber} 天。
    数据如下:
    - 接待客人: ${stats.servedCount}
    - 愤怒离开的客人: ${stats.failedCount}
    - 赚取金额: $${stats.moneyEarned}
    - 完美订单: ${stats.perfectOrders}

    请写一段简短的评价 (100字以内)。
    如果赚钱多且失败少，夸奖他们是 "街头厨神"，做出来的肉卷让人流口水。
    如果失败多，调侃他们的手忙脚乱，比如 "这是在做菜还是在打架？"。
    如果是第一天，给予鼓励。
    请用中文回答，风格要轻松、有食欲，像大众点评或小红书的探店文案。
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "评论加载失败...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "网络连接导致评论丢失...";
  }
};