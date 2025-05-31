库存管理系统开发计划
项目概述: 开发一个库存管理系统，本地使用 Docker、PostgreSQL 和 Next.js 进行开发。生产环境将部署在 Cloudflare Pages，数据库使用 Cloudflare D1，图片存储使用 Cloudflare R2。

技术栈:

前端 & 后端: Next.js (App Router 或 Pages Router)
本地数据库: PostgreSQL (通过 Docker)
生产数据库: Cloudflare D1 (SQLite API 兼容)
图片存储: Cloudflare R2
本地开发环境: Docker
部署: Cloudflare Pages
(可选) UI 框架: Tailwind CSS, Shadcn/ui, Material-UI, Ant Design 等
(可选) ORM: Prisma (有助于在 PostgreSQL 和 D1 之间切换，并简化数据库操作)
(可选) 状态管理: Zustand, Redux Toolkit (如果前端复杂)
(可选) 认证: NextAuth.js (与 Cloudflare D1 配合使用)
阶段一：项目初始化与基础架构 (预计时间：1-2 周)
目标: 搭建开发环境，完成数据库设计，并构建项目基本骨架。

任务 1.1: 开发环境搭建

✅ 初始化 Next.js 项目。
✅ 配置 Docker Compose，包含 Next.js 应用服务和 PostgreSQL 数据库服务。
✅ 初始化 Git 仓库，并进行首次提交。
✅ 配置 ESLint, Prettier 等代码规范工具。
任务 1.2: 数据库设计 (ERD)

核心表:
Products (商品表): id, name, description, sku (库存单位), category_id, supplier_id, purchase_price, selling_price, image_url, created_at, updated_at
InventoryItems (库存项目/批次表): id, product_id, quantity, location (库位), entry_date (入库日期), expiry_date (有效期, 可选), cost_price (该批次成本), created_at, updated_at
StockMovements (库存流水表): id, inventory_item_id, type ('IN', 'OUT', 'ADJUSTMENT'), quantity_change, reason, movement_date, user_id (操作员), created_at
Categories (商品分类表): id, name, description, created_at, updated_at
Suppliers (供应商表): id, name, contact_person, phone, email, address, created_at, updated_at
Users (用户表, 如果需要多用户和权限管理): id, name, email, password_hash, role ('ADMIN', 'STAFF'), created_at, updated_at
使用 ERD 工具绘制实体关系图。
在本地 PostgreSQL 中创建初始表结构 (可以使用 SQL 文件或 ORM 的 migration 功能)。
任务 1.3: Next.js 项目结构与后端基础

✅ 确定使用 App Router 还是 Pages Router。
✅ 设置 API 路由的基本结构 (/api/...)。
✅ 实现本地 PostgreSQL 数据库连接模块。
✅ (可选) 引入 Prisma ORM 并生成初始 Prisma schema，配置 PostgreSQL provider。
阶段二：核心功能开发 - 商品与库存管理 (预计时间：3-4 周)
目标: 实现商品信息的增删改查，以及库存的入库、出库和盘点功能。

任务 2.1: 商品管理模块

API 端点:
POST /api/products (创建商品)
GET /api/products (获取商品列表，支持分页和搜索)
GET /api/products/[id] (获取单个商品详情)
PUT /api/products/[id] (更新商品信息)
DELETE /api/products/[id] (删除商品)
前端页面:
商品列表页 (表格展示，带搜索、筛选、分页)
商品添加/编辑表单页
商品详情页
图片处理 (本地):
实现本地图片上传接口 (暂时存储在本地 public 目录或临时目录)。
任务 2.2: 库存管理模块

API 端点:
POST /api/stock/in (商品入库)
POST /api/stock/out (商品出库)
POST /api/stock/adjust (库存调整/盘点)
GET /api/stock/movements?productId=[id] (获取商品库存流水)
GET /api/stock/summary (获取库存概览，例如各商品当前库存量)
前端页面:
入库操作界面
出库操作界面
库存盘点界面
库存流水查看界面
库存概览/报表界面
任务 2.3: 分类与供应商管理 (可选，但推荐)

类似商品管理的 CRUD 操作和对应的前端页面。
阶段三：用户认证与高级功能 (预计时间：2-3 周)
目标: 实现用户登录认证，并根据需求添加高级功能。

任务 3.1: 用户认证与授权 (如果需要)

✅ 引入 NextAuth.js。
✅ 配置 NextAuth.js 的 Credentials Provider (用户名密码登录) 或其他 Provider。
✅ 实现用户注册、登录、登出 API 和前端页面。
✅ 实现受保护的路由和 API 端点 (基于用户登录状态和角色)。
✅ 在 Users 表中管理用户信息。
任务 3.2: 高级搜索与筛选

✅ 在商品列表和库存视图中实现更复杂的搜索条件 (如按分类、供应商、价格区间、库存量范围等)。
✅ 实现结果排序功能。
任务 3.3: 报表与分析 (基础)

✅ 开发简单的报表功能，例如：
畅销商品排行
低库存预警列表
库存周转率 (基础计算)
阶段四：Cloudflare 集成与部署准备 (预计时间：2-3 周)
目标: 将应用与 Cloudflare D1 和 R2 集成，并为 Cloudflare Pages 部署做准备。

任务 4.1: Cloudflare D1 集成

✅ 在 Cloudflare Dashboard 创建 D1 数据库。
✅ 使用 Wrangler CLI 将本地 PostgreSQL 的表结构迁移到 D1 (可能需要手动调整 SQL 语句，因为 D1 基于 SQLite)。
注意: PostgreSQL 和 SQLite 的 SQL 方言存在差异。如果使用 Prisma，可以更改 provider 为 sqlite 并重新生成/调整 migration。
✅ 在 Next.js 项目中配置 D1 数据库绑定 (通过 wrangler.toml 或 Cloudflare Pages 的环境变量)。
✅ 修改数据库连接代码，使其在生产环境中使用 D1。测试 API 是否能正常读写 D1。
任务 4.2: Cloudflare R2 集成 (图片存储)

✅ 在 Cloudflare Dashboard 创建 R2 存储桶。
✅ 配置 R2 存储桶的公开访问权限 (如果需要直接从 URL 访问图片) 或使用签名 URL。
✅ 图片上传逻辑:
前端: 用户选择图片。
后端 (Next.js API Route):
接收图片上传请求 (multipart/form-data)。
(可选，推荐) 生成一个到 R2 的预签名 URL (presigned URL)，允许客户端直接上传到 R2。
如果后端代理上传：使用 Cloudflare SDK 或 aws-sdk (配置 R2 的 S3 兼容 API) 将图片上传到 R2。
前端 (如果使用预签名 URL): 使用获取到的预签名 URL 直接将图片 PUT 到 R2。
后端: 图片上传成功后，将 R2 中的图片 URL (或对象键) 保存到 Products 表的 image_url 字段。
✅ 修改前端图片显示逻辑，从 R2 加载图片。
任务 4.3: Cloudflare Pages 部署配置

✅ 确保 Next.js 项目适配 Cloudflare Pages 的构建环境 (通常是 Node.js)。
✅ 配置 wrangler.toml (如果使用 Wrangler CLI 部署) 或在 Cloudflare Pages UI 中设置构建命令和输出目录 (.next 或 out 取决于构建方式)。
✅ 设置环境变量 (数据库连接信息、API密钥、NextAuth.js 密钥等) 到 Cloudflare Pages。
任务 4.4: 本地与生产环境配置分离

✅ 使用 .env.local, .env.development, .env.production 等文件管理不同环境的配置。
✅ 确保敏感信息 (如数据库密码、API 密钥) 不被提交到 Git 仓库。
阶段五：测试、优化与文档 (预计时间：2-3 周)
目标: 进行全面测试，优化性能，并编写必要的文档。

任务 5.1: 测试

✅ 单元测试: 使用 Jest, React Testing Library 测试关键组件和函数。
✅ 集成测试: 测试 API 端点的正确性 (可以使用 Postman 或编写测试脚本)。
✅ 端到端测试 (可选): 使用 Cypress 或 Playwright 模拟用户操作流程。
✅ 用户验收测试 (UAT): 邀请实际用户测试系统功能。
任务 5.2: 性能优化

✅ Next.js 构建优化 (代码分割、动态导入、图片优化 <Image /> 组件)。
✅ 数据库查询优化 (索引、避免 N+1 问题)。
✅ 前端资源加载优化 (懒加载、CDN 利用)。Cloudflare Pages 自动处理部分 CDN。
任务 5.3: 安全加固

✅ 输入验证 (前端和后端)。
✅ 防止 XSS, CSRF 攻击。
✅ API 限流 (如果需要)。
✅ 依赖项安全扫描。
任务 5.4: 文档编写

✅ API 文档: 使用 Swagger/OpenAPI 或其他工具生成 API 文档。
✅ 开发文档: 项目结构、环境搭建、部署流程。
✅ 用户手册: 系统主要功能的使用说明。
阶段六：上线与后续维护 (预计时间：1 周 + 持续进行)
目标: 正式上线系统，并进行持续监控和维护。

任务 6.1: 生产环境部署

✅ 执行最终测试。
✅ 通过 Cloudflare Pages 将应用部署到生产环境。
✅ 配置自定义域名和 SSL (Cloudflare 自动处理)。
任务 6.2: 监控与日志

✅ 利用 Cloudflare Analytics 查看网站流量和性能。
✅ 配置错误监控服务 (如 Sentry)。
✅ 查看 Cloudflare Pages 和 D1 的日志。
任务 6.3: 数据迁移/初始化 (如果需要)

✅ 如果有现有数据，制定迁移计划并执行。
任务 6.4: 培训与支持

✅ 对系统操作员进行培训。
✅ 建立问题反馈和支持渠道。
任务 6.5: 持续迭代

✅ 根据用户反馈和业务需求，进行功能迭代和优化。
✅ 定期更新依赖库，保持系统安全。