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

### 方式一：在 Plugins 中直接填 GitHub 地址（推荐）

不需要克隆仓库：

1. 打开 Harness 左侧的 **Plugins**。
2. 点击 **Add plugin**；也可以点右侧箭头，选择 **Install a third-party plugin**。
3. 在包名字段填入：

   ```text
   git+https://github.com/unhurriedly/vision-model.git
   ```

4. **Registry** 保持默认即可，点击 **Install**。
5. 等待安装完成；如果出现 **Enable now**，点击启用。
6. 左侧边栏出现 **视觉模型**，点击打开工作台。

安装过程由 Harness 的 Plugin Manager 执行，输入框还支持 npm 包名、tarball 和本地绝对路径。

### 方式二：使用 dsh 命令行

```bash
dsh plugin --profile web add "git+https://github.com/unhurriedly/vision-model.git"
```

- `web` 是 profile 名；桌面端或其他启动方式请替换成实际 profile（可用 `dsh plugin --help` 查看）。
- 命令执行后刷新 Harness 页面，侧边栏出现 **视觉模型**。
- 若当前 Harness 没有把 `dsh` 加入 PATH，优先使用方式一。

### 方式三：克隆后从本地目录安装

```bash
git clone https://github.com/unhurriedly/vision-model.git
```

然后 **Plugins → Add plugin**，填入克隆目录的绝对路径，例如：

```text
/Users/you/vision-model
```

也可以在支持 `install_bundle` 的环境里传入该绝对路径。安装完成后，在 **Plugins** 列表中确认「视觉模型」已启用。

### 方式四：使用源码包

在 GitHub 仓库页面选择 **Code → Download ZIP**，解压后按方式三选择目录。压缩包包含页面、插件清单、locale、图标与详情文档。

### 打开工作台

- 安装并启用后，左侧边栏会出现 **视觉模型**；点击即可在主区域打开工作台。
- 如果侧边栏没有立即出现，刷新 Harness 页面，或在 **Plugins** 中确认插件已启用。
- 插件页面由宿主提供 `/dsh-vision-model/` 路由；若主区域提示页面未载入，先确认插件已启用，再检查该路由是否可访问。

### 更新

从 Git 安装的插件不会在 **Plugins** 页面显示版本列表，更新方式是先移除再安装：

1. **Plugins** 中找到「视觉模型」，选择移除/卸载；
2. 重新执行方式一，或使用新的 commit：

   ```text
   git+https://github.com/unhurriedly/vision-model.git#<40位commit>
   ```

如果是本地目录安装，执行 `git pull` 后重新加载/重装插件即可。只修改 `index.html`、`style.css`、`app.js`、`scene.svg` 时，刷新页面即可；修改 `index.js`、`client.js`、locale 或图标后，需要重新加载插件。

### 卸载

在 **Plugins** 中找到「视觉模型」并移除即可；不会影响其他插件或 Harness 配置。

### 安装失败排查

- **提示 Cannot access GitHub / GitHub connection timed out**：Git 安装要求 Harness 所在机器能访问 `github.com:443`。可配置代理后重试，或改用 **Code → Download ZIP** 下载源码，再通过本地目录安装。
- **提示不是 bundle / not a bundle**：确认 `package.json` 声明了 `dsh.bundle`；本项目已包含，通常是把目录指错到了子目录。
- **安装成功但侧边栏没有「视觉模型」**：在 **Plugins** 中确认插件已启用，然后刷新 Harness 页面。
- **主区域页面空白或提示页面未载入**：确认插件已启用，并检查 `/dsh-vision-model/` 路由；重新启用插件或重启 Harness 后再试。
- **页面能打开但字体不对**：Google Fonts 被网络拦截时会回退到系统字体，不影响功能。

## 验证

```sh
npm install --ignore-scripts --cache .npm-cache
npm run check
npm test
```

浏览器交互检查覆盖模型测试、组件类型联动、API 示例与移动端布局。截图由测试生成（`preview-*.png`）。
