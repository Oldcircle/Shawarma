# 🥙 Tasty Shawarma Master | 美味沙威玛传奇

**Tasty Shawarma Master** is an addictive time-management cooking game built with **React**, **Tailwind CSS**, and **Google Gemini AI**. Step into the shoes of a street food chef, slice meat, assemble delicious wraps, and serve hungry customers before they lose their patience!

**美味沙威玛传奇** 是一款使用 **React**、**Tailwind CSS** 和 **Google Gemini AI** 构建的令人上瘾的时间管理烹饪游戏。扮演一名街头美食大厨，切肉、制作美味的卷饼，并在饥肠辘辘的顾客失去耐心之前为他们上菜！

---

## 🎮 Gameplay Features | 游戏特色

### 🇬🇧 English
- **Authentic Preparation**: Slice meat from the rotating spit to replenish your stock.
- **Assembly Line**: Combine Pita, Meat, Cucumber, Fries, Cheese, and Sauce to match customer orders.
- **Dynamic Difficulty**: As days progress, customers become faster and more impatient.
- **AI Food Critic**: At the end of every day, **Google Gemini 2.5 Flash** acts as a food blogger, generating a unique, funny, and context-aware review of your shop based on your performance.
- **Visuals**: A warm, appetizing "street food" aesthetic using Tailwind CSS.

### 🇨🇳 中文
- **拟真制作**: 从旋转烤肉架上切下肉片以补充库存。
- **流水线组装**: 组合饼皮、烤肉、黄瓜、薯条、芝士和秘制酱料来满足顾客订单。
- **动态难度**: 随着天数增加，顾客的耐心会下降得更快，点单也会更复杂。
- **AI 美食探店**: 每一天结束时，**Google Gemini 2.5 Flash** 会化身“毒舌”美食博主，根据你的营业数据（赚钱多少、气走几个客人）生成一段独一无二的探店点评。
- **视觉风格**: 使用 Tailwind CSS 打造的温暖、诱人的街头小吃摊风格。

---

## 🛠️ Tech Stack | 技术栈

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **AI**: Google Gemini API (`@google/genai`)
- **Fonts**: Google Fonts (Fredoka, Nunito)

---

## 🚀 Getting Started | 开始游戏

### Prerequisites | 前置条件
You need a Google Gemini API Key to enable the AI review feature.
你需要一个 Google Gemini API Key 来启用 AI 点评功能。

### Installation | 安装

1. **Clone the repository | 克隆仓库**
   ```bash
   git clone https://github.com/yourusername/tasty-shawarma-master.git
   cd tasty-shawarma-master
   ```

2. **Install dependencies | 安装依赖**
   ```bash
   npm install
   ```

3. **Configure API Key | 配置 API Key**
   Set your environment variable `API_KEY`.
   设置你的环境变量 `API_KEY`。

   *(Note: In a local development environment like Vite, create a `.env` file)*
   *(注意：在 Vite 等本地开发环境中，请创建 `.env` 文件)*

   ```env
   VITE_API_KEY=your_gemini_api_key_here
   ```

4. **Run the app | 运行应用**
   ```bash
   npm start
   ```

---

## 🕹️ How to Play | 操作指南

1. **Start Day**: Click "Open Shop" on the main menu.
2. **Slice Meat**: Tap the rotating meat spit on the left to build up your meat stock. You cannot serve meat if the stock is 0!
3. **Check Orders**: Look at the bubble above the customer's head.
4. **Assemble**: 
   - Click ingredients in the bottom bins.
   - Order usually starts with **Pita**, then **Meat**, then toppings, and ends with **Sauce**.
   - Make sure the order matches exactly!
5. **Serve**: Click the Green Plate button to serve.
6. **Trash**: If you made a mistake, click the Red Trash button to clear the current wrap.
7. **End of Day**: Read your AI-generated daily review and check your earnings!

1. **开始营业**: 点击主菜单上的 "Open Shop"。
2. **切肉**: 点击左侧旋转的烤肉架积攒肉片库存。如果库存为 0，你将无法添加烤肉！
3. **看单**: 观察顾客头顶的气泡。
4. **制作**: 
   - 点击底部的食材盒。
   - 顺序通常是：**饼皮** -> **烤肉** -> 配菜 -> **酱料**。
   - 确保食材与订单完全一致！
5. **上菜**: 点击绿色的餐盘按钮上菜。
6. **丢弃**: 如果做错了，点击红色的垃圾桶按钮清空当前卷饼。
7. **结业**: 阅读 AI 生成的每日探店评价并查看你的收入！

---

## 📄 License

MIT License
