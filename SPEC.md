# Image Background Remover - 项目规格

## 技术栈
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- remove.bg API
- Cloudflare Pages 部署

## 功能
1. 拖拽/选择图片上传
2. 调用 remove.bg API 去除背景
3. 预览并下载结果

## 页面
- 首页：上传区域 + 预览对比

## API
- POST /api/remove-bg: 处理图片
