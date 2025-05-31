# Material UI 迁移指南

## 概述

项目已从 Tailwind CSS 迁移到 Material UI (MUI)，提供更丰富的组件库和更好的用户体验。

## 安装依赖

请运行以下命令安装 Material UI 相关依赖：

```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material @mui/lab
```

## 主要变更

### 1. 依赖变更
- ✅ 添加了 Material UI 核心库
- ✅ 添加了 Emotion 样式引擎
- ✅ 添加了 Material UI 图标库
- ❌ 移除了 Tailwind CSS 相关依赖

### 2. 文件变更
- `src/theme/theme.ts` - 新增 Material UI 主题配置
- `app/layout.tsx` - 更新为使用 ThemeProvider 和 CssBaseline
- `app/globals.css` - 移除 Tailwind CSS，添加基础样式
- `app/page.tsx` - 新增使用 Material UI 的首页
- `app/login/page.tsx` - 重写为使用 Material UI 组件
- `app/register/page.tsx` - 重写为使用 Material UI 组件
- `postcss.config.mjs` - 已删除（不再需要）

### 3. 组件迁移

#### 原 Tailwind CSS 类名 → Material UI 组件

| Tailwind 类名 | Material UI 组件 |
|--------------|------------------|
| `btn btn-primary` | `<Button variant="contained">` |
| `input` | `<TextField variant="outlined">` |
| `card` | `<Card><CardContent>` |
| `bg-blue-600` | `sx={{ bgcolor: 'primary.main' }}` |
| `text-white` | `sx={{ color: 'white' }}` |
| `flex items-center` | `<Box sx={{ display: 'flex', alignItems: 'center' }}>` |

#### 常用 Material UI 组件

```tsx
import {
  Box,           // 布局容器
  Container,     // 响应式容器
  Typography,    // 文本组件
  Button,        // 按钮
  TextField,     // 输入框
  Card,          // 卡片
  CardContent,   // 卡片内容
  Grid,          // 网格布局
  Avatar,        // 头像
  Alert,         // 警告提示
  CircularProgress, // 加载指示器
} from '@mui/material';

import {
  Visibility,    // 眼睛图标
  VisibilityOff, // 眼睛关闭图标
  Inventory,     // 库存图标
  Login,         // 登录图标
  PersonAdd,     // 添加用户图标
} from '@mui/icons-material';
```

## 主题配置

项目使用自定义主题配置 (`src/theme/theme.ts`)：

```tsx
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',    // 主色调
      light: '#42a5f5',   // 浅色
      dark: '#1565c0',    // 深色
    },
    secondary: {
      main: '#dc004e',    // 次要色调
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    // 组件样式覆盖
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // 禁用大写转换
          borderRadius: 8,       // 圆角
        },
      },
    },
  },
});
```

## 样式系统

### sx 属性
Material UI 使用 `sx` 属性进行样式定制：

```tsx
<Box sx={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: 'primary.main',
  color: 'white',
  p: 2,  // padding: 16px
  m: 1,  // margin: 8px
  borderRadius: 2,
}}>
  内容
</Box>
```

### 响应式设计
```tsx
<Box sx={{
  width: { xs: '100%', sm: '50%', md: '33%' },
  fontSize: { xs: '0.875rem', md: '1rem' },
}}>
  响应式内容
</Box>
```

## 运行项目

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 访问 http://localhost:3000

## 页面功能

### 首页 (/)
- 展示系统介绍和功能特性
- 提供登录和注册入口
- 使用渐变背景和卡片布局

### 登录页面 (/login)
- Material UI 表单组件
- 密码可见性切换
- 错误提示和加载状态
- 演示账户信息

### 注册页面 (/register)
- 完整的表单验证
- 实时错误提示
- 响应式布局

## 开发建议

1. **使用 sx 属性**：优先使用 `sx` 属性而不是 CSS 类名
2. **主题一致性**：使用主题中定义的颜色和间距
3. **响应式设计**：利用 Material UI 的响应式工具
4. **组件复用**：创建自定义组件封装常用模式
5. **图标使用**：从 `@mui/icons-material` 导入图标

## 故障排除

如果遇到 TypeScript 错误，请确保：
1. 已安装所有 Material UI 依赖
2. 重启 TypeScript 服务器
3. 清除 `.next` 缓存：`rm -rf .next`

## 下一步

- 创建仪表板页面
- 实现数据表格组件
- 添加更多业务页面
- 优化主题和样式 