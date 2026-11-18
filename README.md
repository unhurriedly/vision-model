# Vision Model

多模态视觉分析工作台，既可作为独立前端页面运行，也可作为 DeepSeek Harness 插件安装。

## 独立运行

直接用浏览器打开 `index.html`，无需安装依赖或构建。

## 功能概览

- **模型测试**：图片 / 视频 / 链接 / 实时流输入，提示词与模型版本配置，模拟分析。
- **效果预览**：按输入类型切换预览形态，支持检测框、多图切换、播放与时间轴、直播标识。
- **模型输出**：图片显示单帧 Prompt；视频 / 链接随播放逐帧输出；实时流滚动输出模型结果。
- **分析结果**：模型状态日志与 JSON（含 bounding box、`prompt_result`）。
- **前端组件**：四种预览组件，组件类型下拉与 JSON 代码双向同步。
- **API 集成**：请求配置、多语言示例与模拟响应。

所有分析数据均为前端模拟，不连接真实模型或媒体服务。

## 在 DeepSeek Harness 中安装

### 前置条件

- 已安装支持插件的 DeepSeek Harness（桌面端或 CLI）。
- 本仓库为公开仓库，可直接从 GitHub 安装；当前版本为前端原型，不依赖后端服务。

### 方式一：从 GitHub 安装（推荐）

如果你的 Harness 提供 `dsh` 命令行：

```bash
dsh plugin --profile web add github:unhurriedly/vision-model
```

安装后插件会出现在当前 profile 中，无需手动复制文件。

### 方式二：通过 Plugins 界面安装本地目录

```bash
git clone https://github.com/unhurriedly/vision-model.git
```

然后打开 Harness 的 **Plugins**，选择 **Add plugin**，指向克隆下来的 `vision-model` 目录并确认安装。

如果使用支持 `install_bundle` 的集成环境，也可以传入该目录的绝对路径。安装完成后，在 **Plugins** 列表中确认「视觉模型」已启用。

### 方式三：使用源码包

在 GitHub 仓库页面选择 **Code → Download ZIP**，解压后按方式二选择目录。压缩包包含页面、插件清单、locale、图标与详情文档。

### 打开工作台

- 安装并启用后，左侧边栏会出现 **视觉模型**；点击即可在主区域打开工作台。
- 如果侧边栏没有立即出现，刷新 Harness 页面或重新启用插件。
- 插件页面由宿主提供 `/dsh-vision-model/` 路由；若主区域提示页面未载入，先确认插件已启用，再检查该路由是否可访问。

### 更新

```bash
cd vision-model
git pull
```

然后在 **Plugins** 中重新加载或重装「视觉模型」。只修改 `index.html`、`style.css`、`app.js`、`scene.svg` 时，刷新页面即可；修改 `index.js`、`client.js`、locale 或图标后，需要重新加载插件。

### 卸载

在 **Plugins** 中找到「视觉模型」并移除即可；不会影响其他插件或 Harness 配置。

## 验证

```sh
npm install --ignore-scripts --cache .npm-cache
npm run check
npm test
```

浏览器交互检查覆盖模型测试、组件类型联动、API 示例与移动端布局。截图由测试生成（`preview-*.png`）。
