# 库存管理表格功能说明

## 🎯 功能概述

已成功实现从数据库获取数据并用表格显示的库存管理功能，包含完整的搜索、过滤、分页和权限控制。

## 📋 主要功能

### 1. 数据展示
- **完整的库存信息**：商品名称、SKU、分类、库存数量、可用库存、预留数量等
- **实时统计**：总商品数、低库存商品数、总库存价值
- **状态标识**：低库存商品会用红色警告标识
- **价格格式化**：自动格式化为人民币显示

### 2. 搜索和过滤
- **全文搜索**：支持按商品名称、SKU、描述搜索
- **分类过滤**：按商品分类筛选
- **位置过滤**：按存储位置筛选
- **低库存过滤**：一键查看所有低库存商品
- **实时刷新**：手动刷新数据

### 3. 分页功能
- **灵活分页**：支持5、10、25、50条每页
- **页面导航**：完整的分页控件
- **中文标签**：本地化的分页标签

### 4. 权限控制
- **角色权限**：根据用户角色显示不同操作按钮
- **操作权限**：管理员和经理可以编辑/删除，普通用户只能查看

## 🗂️ 数据结构

### 库存表格显示字段
| 字段 | 说明 | 数据来源 |
|------|------|----------|
| 商品信息 | 商品名称和描述 | products表 |
| SKU | 商品编码 | products表 |
| 分类 | 商品分类 | categories表 |
| 库存数量 | 当前库存 | inventory_items表 |
| 可用库存 | 库存-预留 | 计算字段 |
| 预留数量 | 已预留库存 | inventory_items表 |
| 存储位置 | 仓库位置 | inventory_items表 |
| 批次号 | 商品批次 | inventory_items表 |
| 过期日期 | 商品过期时间 | inventory_items表 |
| 单价 | 销售价格 | products表 |
| 库存价值 | 数量×单价 | 计算字段 |
| 状态 | 正常/低库存 | 基于阈值计算 |

## 🚀 使用方法

### 快速启动

#### 方法1：Docker容器测试（推荐）
```powershell
# PowerShell版本
.\start-with-docker.ps1

# 批处理版本
start-with-docker.bat
```
**优势**：
- 完全隔离的环境
- 自动处理所有依赖
- 在容器内执行测试命令
- 更稳定可靠

#### 方法2：本地环境测试
```powershell
# PowerShell版本
.\start-with-test-data.ps1

# 批处理版本
start-with-test-data.bat
```

#### 方法3：手动启动
```bash
# 本地环境
docker-compose up db -d
$env:DATABASE_URL="postgresql://user:password@localhost:15432/inventory_db"
npx prisma db push
npm run db:seed-test
npm run dev

# Docker环境
docker-compose up -d
docker-compose exec next-app npx prisma db push
docker-compose exec next-app npm run db:seed-test
```

### 访问系统
1. 打开浏览器访问 http://localhost:3000
2. 点击"测试模式（无需登录）"按钮
3. 点击"进入管理"查看库存表格

### 测试数据
系统包含以下测试数据：
- **3个分类**：电子产品、办公用品、服装
- **2个供应商**：科技有限公司、办公设备供应商
- **6个产品**：笔记本电脑、无线鼠标、机械键盘、A4复印纸、圆珠笔、商务衬衫
- **6个库存项目**：包含正常库存和低库存商品

### 功能测试
1. **搜索功能**：在搜索框输入"鼠标"或"MOUSE"
2. **低库存过滤**：点击"低库存"按钮查看库存不足的商品
3. **分页功能**：修改每页显示数量，翻页测试
4. **权限测试**：使用不同角色账户登录查看权限差异

## 🐳 Docker容器测试

### 容器内命令执行
```bash
# 进入容器shell
docker-compose exec next-app /bin/bash

# 在容器内测试API
docker-compose exec next-app node docker-test-api.js

# 在容器内添加测试数据
docker-compose exec next-app npm run db:seed-test

# 查看容器日志
docker-compose logs -f next-app
```

### Docker管理
```bash
# 查看运行状态
docker-compose ps

# 重启应用
docker-compose restart next-app

# 停止所有容器
docker-compose down
```

详细的Docker命令参考请查看：[DOCKER-COMMANDS.md](./DOCKER-COMMANDS.md)

## 🔧 技术实现

### 前端组件
- **InventoryTable.tsx**：主要的库存表格组件
- **Material-UI**：使用Table、TablePagination等组件
- **TypeScript**：完整的类型定义
- **React Hooks**：useState、useEffect管理状态

### 后端API
- **GET /api/inventory**：获取库存列表
- **支持参数**：分页、搜索、过滤、排序
- **权限验证**：需要登录才能访问
- **数据关联**：自动关联商品、分类信息

### 数据库查询
- **Prisma ORM**：类型安全的数据库操作
- **关联查询**：一次查询获取所有相关数据
- **分页优化**：服务端分页减少数据传输
- **搜索优化**：支持模糊搜索和多字段搜索

## 📊 界面预览

### 主要界面元素
1. **统计卡片**：显示总商品数、低库存数、总价值
2. **搜索栏**：全文搜索、分类筛选、位置筛选
3. **数据表格**：完整的库存信息展示
4. **分页控件**：页面导航和每页数量选择
5. **操作按钮**：编辑、删除（根据权限显示）

### 状态指示
- **正常库存**：绿色"正常"标签
- **低库存**：红色"低库存"标签，带警告图标
- **数量显示**：低库存商品的数量用红色粗体显示

## 🔐 权限说明

### 用户角色权限
- **ADMIN（管理员）**：查看、编辑、删除所有数据
- **MANAGER（经理）**：查看、编辑、删除库存数据
- **USER（普通用户）**：仅查看库存数据

### 测试账户
- **管理员**：admin / admin
- **经理**：manager / manager
- **用户**：user1 / user1
- **测试模式**：无需密码，自动设置为普通用户

## 🎨 界面特色

### 响应式设计
- **移动端适配**：表格在小屏幕上可横向滚动
- **灵活布局**：搜索栏自动换行适应屏幕
- **Material Design**：遵循Google Material设计规范

### 用户体验
- **加载状态**：数据加载时显示进度指示器
- **错误处理**：网络错误时显示友好提示
- **即时反馈**：搜索和过滤立即生效
- **本地化**：完全中文界面

## 🚀 扩展功能

### 可以继续添加的功能
1. **导出功能**：导出Excel、PDF格式
2. **批量操作**：批量编辑、删除
3. **库存预警**：邮件/短信通知
4. **历史记录**：库存变动历史
5. **图表统计**：可视化数据分析
6. **条码扫描**：移动端扫码入库
7. **库存盘点**：定期盘点功能
8. **供应商管理**：供应商信息维护

## 🛠️ 故障排除

### 常见问题

#### 1. 数据库连接失败
```
Error: Can't reach database server at localhost:15432
```
**解决方案**：
- 确保Docker已安装并运行
- 运行 `docker-compose up db -d` 启动数据库
- 检查端口15432是否被占用

#### 2. Prisma模型错误
```
Property 'supplier' does not exist on type 'PrismaClient'
```
**解决方案**：
- 运行 `npx prisma generate` 重新生成客户端
- 确保schema.prisma文件正确

#### 3. 环境变量未设置
**解决方案**：
- 使用PowerShell：`$env:DATABASE_URL="postgresql://user:password@localhost:15432/inventory_db"`
- 或创建.env文件（如果允许）

#### 4. 端口冲突
如果3000端口被占用，Next.js会自动使用3001端口。

#### 5. Docker容器问题
**解决方案**：
- 查看容器状态：`docker-compose ps`
- 查看日志：`docker-compose logs next-app`
- 重新构建：`docker-compose build --no-cache next-app`

#### 6. API认证失败
**解决方案**：
- 确保使用测试模式或有效的登录凭据
- 检查auth.ts中的测试token处理
- 重启应用服务器

现在你可以运行 `.\start-with-docker.ps1` 来在Docker容器内体验完整的库存管理表格功能！ 