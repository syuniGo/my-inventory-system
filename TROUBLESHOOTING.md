# 故障排除指南

## npm install 错误解决方案

### 问题1：找不到 package.json 文件

**错误信息：**
```
npm error code ENOENT
npm error syscall open
npm error path D:\Project\cloudfare\package.json
npm error errno -4058
npm error enoent Could not read package.json
```

**原因：** 您在错误的目录中运行了npm命令。

**解决方案：**

1. **确保在正确的目录中运行命令**
   ```bash
   # 进入项目目录
   cd D:\Project\cloudfare\my-inventory-system
   
   # 然后运行npm命令
   npm install
   ```

2. **使用提供的脚本**
   
   **方法A：使用批处理脚本**
   ```bash
   # 在 my-inventory-system 目录中运行
   .\install-and-run.bat
   ```
   
   **方法B：使用PowerShell脚本**
   ```powershell
   # 在 my-inventory-system 目录中运行
   .\install-and-run.ps1
   ```

### 问题2：PowerShell执行策略限制

**错误信息：**
```
无法加载文件，因为在此系统上禁止运行脚本
```

**解决方案：**
```powershell
# 临时允许脚本执行
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 然后运行脚本
.\install-and-run.ps1
```

### 问题3：网络连接问题

**解决方案：**

1. **检查npm配置**
   ```bash
   npm config list
   ```

2. **使用淘宝镜像（如果在中国）**
   ```bash
   npm config set registry https://registry.npmmirror.com
   ```

3. **清除npm缓存**
   ```bash
   npm cache clean --force
   ```

### 问题4：依赖版本冲突

**解决方案：**

1. **删除node_modules和package-lock.json**
   ```bash
   rm -rf node_modules
   rm package-lock.json
   ```

2. **重新安装**
   ```bash
   npm install
   ```

## 手动安装步骤

如果自动脚本不工作，请按以下步骤手动操作：

### 步骤1：确认目录
```bash
# 确保您在正确的目录
cd D:\Project\cloudfare\my-inventory-system

# 检查package.json是否存在
dir package.json
# 或者
ls package.json
```

### 步骤2：安装Material UI依赖
```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material @mui/lab
```

### 步骤3：启动开发服务器
```bash
npm run dev
```

## 验证安装

安装完成后，您应该能看到：

1. **依赖已添加到package.json**
   - @mui/material
   - @emotion/react
   - @emotion/styled
   - @mui/icons-material
   - @mui/lab

2. **node_modules目录包含MUI文件夹**
   ```bash
   dir node_modules\@mui
   ```

3. **开发服务器成功启动**
   ```
   ▲ Next.js 15.3.3
   - Local:        http://localhost:3000
   ```

## 常见问题

### Q: TypeScript错误 "Cannot find module '@mui/material'"
**A:** 确保依赖已正确安装，重启VS Code或TypeScript服务器

### Q: 样式不显示
**A:** 确保ThemeProvider正确配置在layout.tsx中

### Q: 图标不显示
**A:** 确保@mui/icons-material已安装并正确导入

## 联系支持

如果问题仍然存在，请提供：
1. 完整的错误信息
2. npm版本：`npm --version`
3. Node.js版本：`node --version`
4. 操作系统信息 