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

## 作为 Harness 插件

插件文件：

| 文件 | 作用 |
|---|---|
| `package.json` | bundle patch、Client 入口、locale 与图标导出 |
| `cordis.patch.yml` | 插入 `vision-model` 插件行 |
| `index.js` | Host 侧注册 `/dsh-vision-model` 静态页面路由 |
| `client.js` | Client 侧注册侧边栏入口与主页面预览 |
| `locale/*.json` | 中英文插件标题、描述与详情路径 |
| `docs/DETAIL.md` | 插件详情页文档 |
| `icon.svg` | 插件图标 |

安装方式：在 Harness 的 **Plugins** 中选择 **Add plugin** 并指向本目录，或使用 `plugin_manager` 的 `install_bundle` 安装本地目录。安装后在侧边栏打开「视觉模型」。

## 验证

```sh
npm install --ignore-scripts --cache .npm-cache
npm run check
npm test
```

浏览器交互检查覆盖模型测试、组件类型联动、API 示例与移动端布局。截图由测试生成（`preview-*.png`）。
