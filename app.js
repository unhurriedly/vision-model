const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const icons = {
scan:'M4 8V4h4m8 0h4v4m0 8v4h-4m-8 0H4v-4M8 8h8v8H8z', blocks:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z', code:'m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16', history:'M3 4v5h5M3 9a9 9 0 1 1 1 9m8-12v6l4 2', folder:'M3 7V5h6l2 2h10v13H3z', book:'M12 6q-5-4-9-1v14q4-3 9 0 5-3 9 0V5q-4-3-9 1v13', bell:'M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zm5 3h4', save:'M4 3h13l4 4v14H3V3zm3 0v6h10V3M7 21v-8h10v8', reset:'M3 4v5h5m-5 0a9 9 0 1 1 1 9', upload:'M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6', video:'M3 5h13v14H3zm13 5 5-3v10l-5-3', sparkles:'m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z', sliders:'M4 3v18M12 3v18m8-18v18M1 8h6m2 8h6m2-10h6', play:'m8 5 11 7-11 7Z', pause:'M8 5v14M16 5v14', expand:'M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5', filter:'M3 5h18l-7 8v6l-4 2v-8Z', previous:'M5 5v14m13-14L7 12l11 7Z', next:'M19 5v14M6 5l11 7-11 7Z', volume:'m11 4-6 5H2v6h3l6 5Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14', info:'M12 11v6m0-10v.1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0', download:'M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4', copy:'M8 8h13v13H8zM16 8V3H3v13h5', person:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-3a8 8 0 0 1 16 0v3'
};
function icon(name) { return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${icons[name] || icons.info}"/></svg>`; }
function hydrate(root = document) { $$('[data-icon]', root).forEach(el => { el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)); el.removeAttribute('data-icon'); }); }
hydrate();
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state = { page:'test', input:'video', result:'logs', selected:'12', time:12.48, duration:90, playing:false, speed:1, overlay:true, running:false, custom:false, version:0, runCount:8, objectURL:null, language:'curl', response:null, history:[] };
const sampleImageSource = $('#scene-image').getAttribute('src');
const previewTypes={ImagePreview:'图片预览',VideoPreview:'视频预览',LinkPreview:'媒体链接',StreamPreview:'实时流预览'};
const defaultComponentConfig = {component:'VideoPreview',theme:'light',showBoxes:true,showTimeline:true};
let componentConfig = {...defaultComponentConfig};
const people = [{id:'12',risk:true,box:[.33,.31,.14,.52],label:'未佩戴安全帽'},{id:'08',risk:false,box:[.61,.36,.11,.43],label:'已佩戴安全帽'},{id:'15',risk:false,box:[.79,.38,.08,.34],label:'已佩戴安全帽'}];
const events = [{id:'event_01',start:10,end:18,person:'12'},{id:'event_02',start:40,end:46,person:'12'},{id:'event_03',start:68.5,end:74,person:'12'}];
const imageSamples=[
 {name:'园区东侧施工区',size:'2.4 MB',resolution:'1920 × 1080',filter:'',duration:'0.4s',prompt:'画面中共有 3 名施工人员。画面左侧人员未佩戴安全帽，正在施工道路旁作业；右侧两名人员已佩戴安全帽。整体存在 1 处安全风险。'},
 {name:'西门人员通道',size:'1.8 MB',resolution:'2560 × 1440',filter:'saturate(.78) hue-rotate(-10deg) contrast(1.04)',duration:'0.5s',prompt:'画面中检测到 3 名人员通过西门通道，其中 1 人未佩戴安全帽。人员分布较集中，建议关注通道通行安全。'},
 {name:'材料堆场',size:'3.1 MB',resolution:'1920 × 1080',filter:'sepia(.22) brightness(.97)',duration:'0.4s',prompt:'材料堆场区域检测到 3 名人员，1 人未佩戴安全帽。人员位于材料堆垛与施工道路之间，存在物体坠落风险。'}
];
const framePrompts=[
 '画面中有 3 名施工人员，左侧人员未佩戴安全帽。',
 '人员 #12 位于画面左侧，头部区域未检测到安全帽。',
 '检测到 2 名已佩戴安全帽人员，1 名人员存在安全风险。',
 '人员 #12 持续在施工道路旁活动，风险状态未变化。',
 '画面整体人员分布稳定，跟踪 ID 保持连续。'
];
function promptTextForFrame(frame){return framePrompts[Math.abs(frame)%framePrompts.length];}
let activeImage=0;
let toastTimer, playbackTimer, runTimer, previewLogTimer, modelOutputTimer, lastPromptFrame;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3000); }
function formatTime(seconds) { seconds = Math.max(0, Number(seconds) || 0); return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(Math.floor(seconds%60)).padStart(2,'0')}`; }
function currentMode(){return $('.viewer-panel').dataset.mode||'video';}
function currentPrompt(){
 if(currentMode()==='image')return state.custom?'上传图片分析：画面中检测到 3 名人员，其中 1 人未佩戴安全帽，位于画面左侧，建议现场核验。':imageSamples[activeImage].prompt;
 return promptTextForFrame(Math.floor(state.time*0.5));
}
function resultData(){
 const frame=Math.floor(state.time*2)+1;
 const model=$('#model').value;
 return {
  run_id:'run_demo_008',
  model,
  config_version:state.version?`v${state.version}`:'draft',
  type:'frame.result',
  sequence:frame,
  frame:{id:`frame_${frame}`,timestamp_ms:Math.round(state.time*1000),width:1920,height:1080},
  objects:people.map(person=>({id:`obj_${person.id}`,track_id:`person_${person.id}`,label:'person',confidence:person.risk?.94:.97,bbox:person.box,attributes:{wearing_helmet:!person.risk}})),
  prompt_result:{model,text:currentPrompt()},
  events:[{id:'event_01',type:'missing_helmet',object_ids:['obj_12'],summary:'检测到未佩戴安全帽的人员'}]
 };
}
function logsHTML(){
 const mode=currentMode();
 const model=$('#model').value;
 const media={image:'图片',video:'视频',link:'媒体链接',stream:'实时流'}[state.input]||'视频';
 const format={image:'JPG',video:'MP4',link:'MP4',stream:'RTSP'}[state.input]||'MP4';
 const check={
  image:{start:'10:20:03.010',complete:'10:20:03.430',end:'10:20:03.440',duration:'0.43s'},
  video:{start:'10:20:01.120',complete:'10:20:18.600',end:'10:20:18.620',duration:'18.6s'},
  link:{start:'10:20:01.120',complete:'10:20:17.200',end:'10:20:17.220',duration:'16.2s'},
  stream:{start:'10:20:01.120',complete:'10:20:05.420',end:'—',duration:'持续运行'}
 }[mode];
 const result=mode==='stream'?'最近一帧分析完成，持续接收中':'检测到 3 个目标，其中 1 个风险目标';
 const rows=[
  {t:check.start,s:'开始处理',d:`素材类型：${media}（${format}）· 模型：${model}`},
  {t:check.complete,s:'分析完成',d:result},
  {t:check.end,s:'处理结束',d:mode==='stream'?'会话持续运行中，尚未结束 · 状态：正常':`总耗时：${check.duration} · 状态：正常`}
 ];
 return `<div class="log-health"><span class="health-dot"></span><b>运行状态 · 正常</b><span>网络连接正常 · 无处理超时 · Token 有效</span></div>`+rows.map(row=>`<div class="log-row"><time>${row.t}</time><b>${row.s}</b><p>${row.d}</p></div>`).join('');
}
function renderResults() {
 const root=$('#result-content');
 if(state.result==='json'){root.innerHTML=`<div class="frame-header"><b>frame.result</b><button data-copy="result">复制 JSON</button></div><pre class="json-output">${escapeHTML(JSON.stringify(resultData(),null,2))}</pre>`;return;}
 root.innerHTML='<div class="frame-header"><b>模型状态</b><span>处理时间线与异常检查</span></div>'+logsHTML();
}
function selectObject(id){state.selected=id;$$('.detection-box',$('#media-stage')).forEach(el=>el.classList.toggle('selected',el.dataset.object===id));}
function setTime(time, syncVideo = true) { state.time=Math.max(0,Math.min(state.duration,time)); $('#timeline-input').value=state.time; $('#timeline-progress').style.width=`${state.time/state.duration*100}%`; $('#current-time').textContent=formatTime(state.time); updateFrameLabel(); if(syncVideo && !$('#user-video').hidden) $('#user-video').currentTime=state.time; updateModelOutput(false); if(state.result==='json'||state.result==='logs') renderResults(); }
function setPlaying(playing) { state.playing=playing; $('#play-button').innerHTML=icon(playing?'pause':'play'); $('#play-button').setAttribute('aria-label',playing?'暂停':'播放'); clearInterval(playbackTimer); const video=$('#user-video'); if(!video.hidden) { if(playing)video.play().catch(()=>toast('浏览器未能播放此视频，请更换支持的格式')); else video.pause(); } const liveMode=$('.viewer-panel').dataset.mode==='stream'; if(playing) { if(!liveMode&&state.time>=state.duration)setTime(0); playbackTimer=setInterval(()=>{setTime(!video.hidden?video.currentTime:state.time+.25*state.speed,false); if(state.time>=state.duration){ if(liveMode){state.time=state.duration;updateFrameLabel();} else setPlaying(false); }},250); } }
function goPage(page) {
 if (!['test','components','api'].includes(page)) return;
 if (page !== 'test') setPlaying(false);
 if (page !== 'components') stopPreviewLogStream();
 if (page !== 'test') stopModelOutput();
 state.page=page;
 $$('.page').forEach(panel=>{const active=panel.id===`${page}-page`;panel.hidden=!active;panel.classList.toggle('active',active);});
 $$('.module-tabs [role="tab"]').forEach(tab=>{const active=tab.dataset.page===page;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
 if(page==='test')renderModelOutput();
 if(page==='components')renderComponent();
 if(page==='api')renderAPI();
}
$('.module-tabs').addEventListener('keydown',event=>{
 const tabs=$$('[role="tab"]',$('.module-tabs'));
 const current=tabs.indexOf(event.target);
 if(current<0||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
 event.preventDefault();
 const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(current+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
 goPage(tabs[next].dataset.page);tabs[next].focus();
});
function openModal(title,content) { $('#modal-title').textContent=title; $('#modal-content').innerHTML=content; $('#modal').showModal(); }
function persist() { try {localStorage.setItem('lens-config',JSON.stringify({prompt:$('#prompt').value,model:$('#model').value}));} catch {} renderAPI(); }
function stopModelOutput(){clearInterval(modelOutputTimer);modelOutputTimer=null;}
function renderModelOutput(){
 stopModelOutput();lastPromptFrame=undefined;
 const mode=currentMode();
 const body=$('#model-output-body');
 const title=$('#model-output-title');
 if(!body)return;
 if(mode==='image'){
  const image=state.custom?{name:$('#file-name').textContent,prompt:currentPrompt(),resolution:state.imageStats?.resolution||'1920 × 1080'}:imageSamples[activeImage];
  title.textContent='模型输出';
  body.innerHTML=`<article class="prompt-card"><p>${escapeHTML(image.prompt)}</p></article>`;
  return;
 }
 if(mode==='stream'){
  title.textContent='模型输出';
  body.innerHTML='<div class="yolo-stream" id="yolo-stream"></div>';
  state.yoloTick=Math.floor(state.time*2)+1;
  for(let i=0;i<3;i++)appendYoloLine(false);
  modelOutputTimer=setInterval(()=>appendYoloLine(true),900);
  return;
 }
 title.textContent='模型输出';
 body.innerHTML='<div class="prompt-stream" id="prompt-stream"></div>';
 rebuildPromptStream();
}
function rebuildPromptStream(){
 const stream=$('#prompt-stream');if(!stream)return;
 const current=Math.floor(state.time*0.5);
 const start=Math.max(0,current-5);
 stream.innerHTML='';
 for(let frame=start;frame<=current;frame++)appendPromptEntry(frame,false);
 lastPromptFrame=current;
}
function appendPromptEntry(frame,animate){
 const stream=$('#prompt-stream');if(!stream)return;
 const entry=document.createElement('div');
 entry.className='prompt-line'+(animate?' prompt-enter':'');
 entry.innerHTML=`<span class="prompt-frame">F${String(frame).padStart(3,'0')} · ${formatTime(frame*0.5)}</span><span class="prompt-text">${promptTextForFrame(frame)}</span>`;
 stream.append(entry);
 while(stream.children.length>12)stream.firstElementChild.remove();
}
function appendYoloLine(animate){
 const stream=$('#yolo-stream');if(!stream)return;
 const frame=state.yoloTick||1;state.yoloTick=frame+1;
 const risk=frame%4!==0;
 const line=document.createElement('div');
 line.className='yolo-line'+(animate?' yolo-enter':'');
 line.innerHTML=`<span>frame ${String(frame).padStart(4,'0')}</span> person × 3 · conf ${risk?'0.94':'0.92'} · bbox [0.33, 0.31, 0.14, 0.52] · helmet: ${risk?'no':'yes'}`;
 stream.append(line);
 while(stream.children.length>24)stream.firstElementChild.remove();
}
function updateModelOutput(reset){
 if(currentMode()!=='video')return;
 if(reset||lastPromptFrame===undefined){rebuildPromptStream();return;}
 const frame=Math.floor(state.time*0.5);
 if(frame===lastPromptFrame)return;
 if(frame<lastPromptFrame||frame-lastPromptFrame>3){rebuildPromptStream();return;}
 for(let next=lastPromptFrame+1;next<=frame;next++)appendPromptEntry(next,true);
 lastPromptFrame=frame;
}
function applyViewerMode(){
 const mode=state.input==='link'?'video':state.input;
 $('.viewer-panel').dataset.mode=mode;
 $('#image-strip').hidden=mode!=='image';
 $('#stage-live').hidden=mode!=='stream';
 $('.demo-label').textContent=mode==='image'?'图片预览':mode==='stream'?'直播预览':'示例演示';
 if(mode!=='image'&&state.duration<=1&&$('#user-video').hidden){state.duration=90;$('#timeline-input').max=90;$('#duration').textContent='01:30';setTime(12.48);}
 updateFrameLabel();
 if(mode==='image')renderImageStrip();
 updateSummary();
 renderModelOutput();
 if(state.result==='logs')renderResults();
}
function updateFrameLabel(){
 const mode=$('.viewer-panel').dataset.mode||'video';
 const stamp=String(Math.round((state.time%1)*1000)).padStart(3,'0');
 let label;
 if(mode==='image')label='IMAGE · 单帧';
 else if(mode==='stream')label=`LIVE · ${formatTime(state.time)}.${stamp}`;
 else label=`FRAME ${String(Math.floor(state.time*2)+1).padStart(3,'0')} · ${formatTime(state.time)}.${stamp}`;
 $('#frame-tag').textContent=label;
}
function currentStats(){
 const mode=$('.viewer-panel').dataset.mode||'video';
 if(mode==='stream')return null;
 if(mode==='image'){
  if(state.custom&&state.imageStats)return state.imageStats;
  const sample=imageSamples[activeImage]||imageSamples[0];
  return {frames:1,size:sample.size,resolution:sample.resolution,duration:sample.duration};
 }
 if(state.input==='link')return {frames:Math.ceil(state.duration*2),size:'18.2 MB',resolution:'1280 × 720',duration:'16.2s'};
 if(state.custom&&state.videoStats)return {frames:Math.ceil(state.duration*2),size:state.videoStats.size,resolution:state.videoStats.resolution,duration:'18.6s'};
 return {frames:Math.ceil(state.duration*2),size:'24.6 MB',resolution:'1920 × 1080',duration:'18.6s'};
}
function updateSummary(){
 const stats=currentStats();
 const summary=$('#analysis-summary');
 summary.hidden=!stats;
 $('.resolution').textContent=stats?stats.resolution:'1920 × 1080';
 if(!stats)return;
 $('#summary-frames').textContent=`${stats.frames} 帧`;
 $('#summary-size').textContent=stats.size;
 $('#summary-resolution').textContent=stats.resolution;
 $('#summary-duration').textContent=`耗时 ${stats.duration}`;

}
function renderImageStrip(){
 const strip=$('#image-strip');
 if(!strip)return;
 strip.innerHTML=imageSamples.map((image,index)=>`<button type="button" class="image-thumb${index===activeImage&&!state.custom?' active':''}" data-image-index="${index}" title="${image.name} · ${image.size} · ${image.resolution}"><span class="thumb-frame" style="background-image:url('${sampleImageSource}')${image.filter?`;filter:${image.filter}`:''}"></span><span class="thumb-caption">${image.name}</span></button>`).join('')+'<button type="button" class="image-thumb image-add" id="add-image" title="添加图片"><span class="thumb-frame">＋</span><span class="thumb-caption">添加图片</span></button>';
}
function selectImage(index){
 const image=imageSamples[index];
 if(!image)return;
 activeImage=index;state.custom=false;state.imageStats=null;
 const scene=$('#scene-image');
 scene.src=sampleImageSource;scene.style.filter=image.filter;scene.hidden=false;
 $('#user-video').hidden=true;
 $('#camera-name').textContent=image.name;
 $('#analysis-state').textContent='分析完成';
 renderImageStrip();updateSummary();renderModelOutput();
 toast(`已切换图片：${image.name}`);
}
function setInput(type) {if(state.playing)setPlaying(false);state.input=type; $$('.input-tabs button').forEach(el=>el.classList.toggle('active',el.dataset.input===type)); const remote=['link','stream'].includes(type); $('#upload-box').hidden=remote; $('#url-box').hidden=!remote; $('#file-input').accept=type==='image'?'image/*':'video/*'; $('#format-hint').textContent=type==='image'?'支持 JPG、PNG、WebP，最大 20 MB':'支持 MP4、MOV、WebM，最大 500 MB'; $('#source-url').placeholder=type==='stream'?'rtsp://192.168.1.100:554/live':'https://example.com/video.mp4'; $('#connect-source').textContent=type==='stream'?'测试连接（模拟）':'解析素材（模拟）'; $('#url-hint').textContent=type==='stream'?'原型使用示例画面模拟连接，不会访问真实流地址':'原型仅校验地址格式，使用示例素材展示结果'; $('#run-estimate').textContent=type==='image'?'单张图片 · 模拟分析':type==='stream'?'持续会话 · 演示每帧分析过程':'预计消耗 180 帧 · 约 0.3 分钟'; applyViewerMode(); }
function loadSample() { if(state.objectURL)URL.revokeObjectURL(state.objectURL); state.objectURL=null; state.custom=false; state.imageStats=null; state.videoStats=null; activeImage=0; state.duration=90; $('#user-video').pause(); $('#user-video').hidden=true; const scene=$('#scene-image'); scene.hidden=false; scene.src=sampleImageSource; scene.style.filter=''; $('#timeline-input').max=90; $('#duration').textContent='01:30'; $('#file-name').textContent=state.input==='image'?'园区巡检示例.jpg':'园区巡检示例.mp4'; $('#file-meta').textContent='01:30 · 1920 × 1080 · 示例素材'; $('#camera-name').textContent='CAM 01 · 园区东侧施工区'; $('#detection-layer').hidden=!state.overlay; setPlaying(false); setTime(12.48); $('#analysis-state').textContent='分析完成'; renderImageStrip(); updateSummary(); renderModelOutput(); toast('已载入园区安全巡检示例'); }
function loadFile(file) {if(!file)return; const isImage=file.type.startsWith('image/'),isVideo=file.type.startsWith('video/'); if(!isImage&&!isVideo)return toast('请选择图片或视频文件'); if(file.size>(isImage?20:500)*1024*1024)return toast('文件超过支持的大小'); setPlaying(false); if(state.objectURL)URL.revokeObjectURL(state.objectURL); state.objectURL=URL.createObjectURL(file); state.custom=true; setInput(isImage?'image':'video'); $('#file-name').textContent=file.name; $('#file-meta').textContent=`${(file.size/1024/1024).toFixed(1)} MB · 本地素材`; $('#camera-name').textContent='本地素材 · 模拟检测结果'; $('#detection-layer').hidden=true; $('#analysis-state').textContent='准备分析'; const sizeText=`${(file.size/1024/1024).toFixed(1)} MB`; if(isImage){state.imageStats={frames:1,size:sizeText,resolution:'读取中',duration:'0.4s'};state.videoStats=null;activeImage=-1;const scene=$('#scene-image');scene.style.filter='';scene.src=state.objectURL;scene.hidden=false;scene.onload=()=>{if(!state.imageStats)return;state.imageStats.resolution=`${scene.naturalWidth} × ${scene.naturalHeight}`;updateSummary();};$('#user-video').hidden=true;state.duration=1;$('#duration').textContent='图片';$('#timeline-input').max=1;renderImageStrip();setTime(0);}else{$('#scene-image').hidden=true;state.imageStats=null;state.videoStats={size:sizeText,resolution:'1920 × 1080'};const v=$('#user-video'); v.src=state.objectURL;v.hidden=false;v.onloadedmetadata=()=>{state.duration=v.duration||90;$('#duration').textContent=formatTime(state.duration);$('#timeline-input').max=state.duration;if(v.videoWidth&&state.videoStats)state.videoStats.resolution=`${v.videoWidth} × ${v.videoHeight}`;setTime(0);updateSummary();};}updateSummary();renderModelOutput();toast('素材已加载；分析结果为前端模拟数据'); }
function runAnalysis() {if(state.running)return; if(!$('#prompt').value.trim())return toast('请先输入分析目标'); if(['link','stream'].includes(state.input)&&!validSource())return; setPlaying(false); state.running=true; $('#run-button').disabled=true; $('#analysis-overlay').hidden=false; $('#analysis-state').textContent='正在分析'; const stages={image:['正在读取图片…','正在识别画面目标…','正在生成结构化结果…'],stream:['正在连接视频流…','正在识别画面目标…','正在生成事件与结构化结果…'],link:['正在解析媒体地址…','正在提取关键帧…','正在识别画面目标…']}[state.input]||['正在提取关键帧…','正在识别画面目标…','正在生成事件与结构化结果…']; let index=0; $('#analysis-progress').textContent=stages[0]; runTimer=setInterval(()=>{index++;if(index<stages.length){$('#analysis-progress').textContent=stages[index];return;}clearInterval(runTimer);state.running=false;$('#run-button').disabled=false;$('#analysis-overlay').hidden=true;$('#detection-layer').hidden=!state.overlay;$('#analysis-state').textContent='分析完成';updateSummary();renderModelOutput();state.runCount++;state.history.unshift({name:$('#file-name').textContent,time:new Date().toLocaleTimeString('zh-CN'),id:`run_demo_${state.runCount}`});if($('.count'))$('.count').textContent=state.runCount;renderResults();toast('模拟分析完成，可查看结果或获取集成代码');},900); }
function validSource(){const value=$('#source-url').value.trim();if(!(state.input==='stream'?/^rtmps?:\/\/.+|^rtsps?:\/\/.+/i:/^https?:\/\/.+/i).test(value)){toast(state.input==='stream'?'请输入有效的 RTMP / RTSP 地址':'请输入有效的 HTTP / HTTPS 地址');return false;}return true;}
const previewLogScript=[
 '第 {frame} 帧分析完成，检测到 3 个目标',
 '人员 #12 持续跟踪中，未佩戴安全帽',
 '人员 #08 已佩戴安全帽，状态正常',
 '生成风险事件 event_02，持续跟踪人员 #12',
 '第 {frame} 帧结构化结果已生成',
 '检测到 2 个已佩戴安全帽目标，1 个风险目标'
];
function stopPreviewLogStream(){clearInterval(previewLogTimer);previewLogTimer=null;}
function startPreviewLogStream(){stopPreviewLogStream();const stream=$('.preview-log .log-stream');if(!stream)return;let tick=0;const append=animate=>{const wall=$('.preview-log .log-stream');if(!wall||state.page!=='components'||!componentConfig.showLogs){stopPreviewLogStream();return;}const frame=Math.floor(state.time*2)+1+tick;const clock=formatTime(state.time+tick*.5)+'.'+String(Math.round((state.time%1)*1000)).padStart(3,'0');const text=previewLogScript[tick%previewLogScript.length].replace('{frame}',frame);const entry=document.createElement('div');entry.className='log-entry'+(animate?' log-enter':'');entry.innerHTML=`<span>${String(tick+1).padStart(2,'0')}:${clock}</span> ${text}`;wall.append(entry);while(wall.children.length>24)wall.firstElementChild.remove();tick++;};[0,1,2,3].forEach(i=>append(false));previewLogTimer=setInterval(()=>append(true),1400);}
function renderComponent(){
 const type=componentConfig.component;
 const dark=componentConfig.theme==='dark';
 const isPlayer=type==='VideoPreview'||type==='LinkPreview';
 $('.component-preview').classList.toggle('dark',dark);
 $('.component-preview').classList.toggle('fill-media',isPlayer&&!componentConfig.showTimeline);
 const root=$('#component-preview-content');
 const stage=$('#media-stage').cloneNode(true);
 stage.removeAttribute('id');
 $$('[id]',stage).forEach(node=>node.removeAttribute('id'));
 $('video',stage).remove();
 $('.analysis-overlay',stage)?.remove();
 const image=$('img',stage);
 image.hidden=false;image.src=sampleImageSource;
 image.style.filter=type==='ImagePreview'?imageSamples[activeImage].filter:'';
 const live=$('.stage-live',stage);
 if(live)live.hidden=type!=='StreamPreview';
 const frame=$('.frame-tag',stage);
 if(frame)frame.textContent=type==='ImagePreview'?'IMAGE · 单帧':type==='StreamPreview'?'LIVE · 00:12.480':'FRAME 025 · 00:12.480';
 if(type==='ImagePreview'){const caption=$('.camera-label span:last-child',stage);if(caption)caption.textContent=imageSamples[activeImage].name;}
 $$('.detection-box',stage).forEach(box=>box.hidden=!componentConfig.showBoxes);
 root.replaceChildren(stage);
 if(type==='ImagePreview')root.insertAdjacentHTML('beforeend',previewImageStripHTML());
 if(isPlayer){
  const playback=$('.playback').cloneNode(true);$$('[id]',playback).forEach(node=>node.removeAttribute('id'));root.append(playback);
  if(componentConfig.showTimeline){const timeline=$('.timeline-wrap').cloneNode(true);$$('[id]',timeline).forEach(node=>node.removeAttribute('id'));root.append(timeline);}
 }
 const props=[`  source={mediaUrl}`,`  results={analysisResults}`,`  theme="${dark?'dark':'light'}"`,`  showBoxes={${componentConfig.showBoxes}}`];
 if(isPlayer)props.push(`  showTimeline={${componentConfig.showTimeline}}`);
 $('#component-code').textContent=`// SDK 接口设计示例，当前未发布安装包
// npm install @lens-vision/react
import { ${type} } from '@lens-vision/react';

<${type}\n${props.join('\n')}\n  onObjectClick={(object) => console.log(object)}\n/>`;
}
function previewImageStripHTML(){
 return '<div class="image-strip preview-image-strip">'+imageSamples.map((image,index)=>`<button type="button" class="image-thumb${index===activeImage?' active':''}" data-preview-image="${index}" title="${image.name} · ${image.size} · ${image.resolution}"><span class="thumb-frame" style="background-image:url('${sampleImageSource}')${image.filter?`;filter:${image.filter}`:''}"></span><span class="thumb-caption">${image.name}</span></button>`).join('')+'</div>';
}
$('#component-preview-content').addEventListener('click',event=>{
 const thumb=event.target.closest('[data-preview-image]');
 if(!thumb)return;
 const index=Number(thumb.dataset.previewImage);
 const image=imageSamples[index];
 if(!image)return;
 activeImage=index;
 const preview=$('#component-preview-content');
 const scene=$('.media-stage img',preview);
 if(scene)scene.style.filter=image.filter;
 const caption=$('.media-stage .camera-label span:last-child',preview);
 if(caption)caption.textContent=image.name;
 $$('[data-preview-image]',preview).forEach(item=>item.classList.toggle('active',item===thumb));
});
function applyComponentConfig(config){
 if(!config||Array.isArray(config)||!previewTypes[config.component])throw Error('component 支持 '+Object.keys(previewTypes).join('、'));
 if(!['light','dark'].includes(config.theme))throw Error('theme 必须为 light 或 dark');
 for(const key of ['showBoxes','showTimeline'])if(typeof config[key]!=='boolean')throw Error(key+' 必须为布尔值');
 componentConfig={component:config.component,theme:config.theme,showBoxes:config.showBoxes,showTimeline:config.showTimeline};
 $('#component-type').value=componentConfig.component;
 renderComponent();
}
function apiBody(){return {input:{type:$('#api-type').value,url:$('#api-url').value},config:{version:state.version?`v${state.version}`:'draft',prompt:$('#prompt').value,model:$('#model').value}};}
function renderAPI(){const body=JSON.stringify(apiBody(),null,2);const endpoint=`https://api.example.com/v1/${$('#api-type').value==='stream'?'sessions':'analyses'}`;const code=state.language==='curl'?`# 接口设计示例 · 请替换为实际服务地址\ncurl -X POST '${endpoint}' \\\n  -H 'Authorization: Bearer YOUR_API_KEY' \\\n  -H 'Content-Type: application/json' \\\n  --data '${body.replace(/'/g,"'\\''")}'`:state.language==='python'?`# 接口设计示例\nimport requests\nimport os\n\nresponse = requests.post(\n    "${endpoint}",\n    headers={"Authorization": f"Bearer {os.environ['LENS_API_KEY']}"},\n    json=${body}\n)\nprint(response.json())`:`// 接口设计示例 · 请在服务端使用密钥\nconst response = await fetch('${endpoint}', {\n  method: 'POST',\n  headers: {\n    Authorization: \`Bearer \${process.env.LENS_API_KEY}\`,\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify(${body})\n});\nconst result = await response.json();`;$('#api-code').textContent=code;}
async function copyText(text){try{await navigator.clipboard.writeText(text);toast('已复制到剪贴板');}catch{openModal('复制内容',`<p>浏览器限制了自动复制，请选择下方文本复制。</p><textarea style="width:100%;height:260px">${escapeHTML(text)}</textarea>`);}}
function download(){const blob=new Blob([JSON.stringify(resultData(),null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='lens-analysis-result.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('结构化结果已导出');}
document.addEventListener('click',e=>{const b=e.target.closest('button,[data-select],[data-seek]');if(!b)return;if(b.dataset.page)goPage(b.dataset.page);if(b.dataset.input)setInput(b.dataset.input);if(b.dataset.result){state.result=b.dataset.result;$$('.result-tabs button').forEach(el=>el.classList.toggle('active',el===b));renderResults();}if(b.dataset.object)selectObject(b.dataset.object);if(b.dataset.select)selectObject(b.dataset.select);if(b.dataset.seek){setTime(Number(b.dataset.seek));if(state.page==='components')goPage('test');toast('已定位到事件发生时间');}if(b.dataset.view){state.overlay=b.dataset.view==='overlay';$$('[data-view]').forEach(el=>el.classList.toggle('active',el===b));$('#detection-layer').hidden=!state.overlay;}if(b.dataset.language){state.language=b.dataset.language;$$('[data-language]').forEach(el=>el.classList.toggle('active',el===b));renderAPI();}if(b.dataset.copy){const map={component:()=>$('#component-code').textContent,api:()=>$('#api-code').textContent,response:()=>$('#api-response').textContent,result:()=>JSON.stringify(resultData(),null,2)};copyText(map[b.dataset.copy]());}switch(b.dataset.action){case'integrate':goPage('api');break;case'sample':loadSample();break;case'download':download();break;case'template':openModal('选择提示词模板',`<p>选择一个任务作为起点，继续修改分析要求。</p>${['检测画面中未佩戴安全帽的人员，框出人员位置。持续跟踪同一人员，返回事件发生时间，并简要说明判断依据。','识别画面中的车辆，输出车辆位置、类型和跨帧跟踪 ID，统计通过入口的车辆数量。','检测人员是否进入指定的危险区域，返回目标位置与进入、离开的时间，并生成告警事件。'].map((text,i)=>`<button class="event-card" style="width:100%;text-align:left" data-template="${i}"><b>${['园区安全帽检测','车辆识别与计数','危险区域入侵'][i]}</b><p>${text}</p></button>`).join('')}`);break;case'history':openModal('运行记录',`<p>本次会话的模拟运行记录</p>${state.history.length?state.history.map(r=>`<div class="history-row"><span>${escapeHTML(r.name)}<small>${r.id}</small></span><span>${r.time} · 已完成</span></div>`).join(''):'<div class="empty-state">尚未运行分析。点击「开始分析」创建一条记录。</div>'}`);break;case'configs':openModal('已保存配置',`<div class="history-row"><span>园区安全帽检测<small>${state.version?'v'+state.version:'当前草稿'} · 本地配置</small></span><span>${escapeHTML($('#model').value)}</span></div><p style="margin-top:18px">${escapeHTML($('#prompt').value)}</p>`);break;case'docs':openModal('开发指南','<p>1. 在模型测试中选择素材，填写分析目标。</p><p>2. 点击开始分析，查看模拟检测框、事件、日志及 JSON。</p><p>3. 在前端组件页配置样式，复制 SDK 接口示例。</p><p>4. 在 API 集成页选择请求类型，发送模拟请求。</p><div class="integration-note">当前为独立前端原型。模型推理、媒体流接入、托管播放和 SDK 服务均需后续接入真实后端。</div>');break;case'usage':openModal('开发者计划','<p>免费开发空间 · 示例用量</p><div class="history-row"><span>本月分析分钟数</span><b>128 / 1,000 分钟</b></div><div class="history-row"><span>本次会话模拟运行</span><b>'+state.history.length+' 次</b></div><p style="margin-top:18px">本页面不产生实际模型费用。</p>');break;case'notifications':openModal('通知','<div class="empty-state">暂无新通知。系统运行正常。</div>');break;case'reset':$('#prompt').value='检测画面中未佩戴安全帽的人员，框出人员位置。持续跟踪同一人员，返回事件发生时间，并简要说明判断依据。';$('.prompt-wrap textarea').dispatchEvent(new Event('input'));setInput('video');loadSample();break;}});
document.addEventListener('click',e=>{const t=e.target.closest('[data-template]');if(t){$('#prompt').value=$('p',t).textContent;$('#prompt').dispatchEvent(new Event('input'));$('#modal').close();toast('已应用提示词模板');}});
$('#modal-close').onclick=()=>$('#modal').close();$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#modal').close();}});
$('#prompt').addEventListener('input',()=>{
$('#prompt-count').textContent=`${$('#prompt').value.length} / 2000`;persist();});$('#model').onchange=()=>{persist();renderComponent();};$('#browse').onclick=()=>$('#file-input').click();$('#file-input').onchange=e=>loadFile(e.target.files[0]);const upload=$('#upload-box');upload.ondragover=e=>{e.preventDefault();upload.classList.add('dragging');};upload.ondragleave=()=>upload.classList.remove('dragging');upload.ondrop=e=>{e.preventDefault();upload.classList.remove('dragging');loadFile(e.dataTransfer.files[0]);};$('#connect-source').onclick=()=>{if(validSource()){$('#file-name').textContent=state.input==='stream'?'实时流演示会话':'媒体链接演示';$('#file-meta').textContent='地址格式有效 · 示例画面模拟';toast('地址格式校验通过；使用示例素材模拟接入');}};$('#run-button').onclick=runAnalysis;$('#play-button').onclick=()=>setPlaying(!state.playing);$('#step-back').onclick=()=>{setPlaying(false);setTime(state.time-.5);};$('#step-forward').onclick=()=>{setPlaying(false);setTime(state.time+.5);};$('#timeline-input').oninput=e=>setTime(Number(e.target.value));$('#speed-button').onclick=()=>{state.speed=state.speed===1?1.5:state.speed===1.5?2:.5;$('#speed-button').textContent=state.speed+'×';$('#user-video').playbackRate=state.speed;};$('#sound-button').onclick=()=>{$('#user-video').muted=!$('#user-video').muted;toast($('#user-video').muted?'已静音':'声音已开启；示例画面无音轨');};$('#fullscreen').onclick=()=>$('#media-stage').classList.toggle('expanded');
$('#image-strip').addEventListener('click',event=>{const add=event.target.closest('#add-image');if(add){$('#file-input').click();return;}const thumb=event.target.closest('[data-image-index]');if(thumb)selectImage(Number(thumb.dataset.imageIndex));});document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#media-stage').classList.remove('expanded');if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();runAnalysis();}if(e.target.matches('[data-select],[data-seek]')&&e.key==='Enter')e.target.click();});
$$('#api-type,#api-url,#api-version').forEach(el=>el.addEventListener('input',renderAPI));$('#send-request').onclick=()=>{if(!/^https?:\/\/.+|^rtmps?:\/\/.+|^rtsps?:\/\/.+/i.test($('#api-url').value))return toast('请输入有效媒体地址');$('#send-request').disabled=true;$('#response-status').textContent='请求中…';$('#api-response').textContent='// 正在模拟提交分析请求…';setTimeout(()=>{const type=$('#api-type').value;state.response=type==='image'?{status:'completed',...resultData()}:{id:type==='stream'?'session_demo_001':'run_demo_009',status:type==='stream'?'running':'queued',config_version:state.version?'v'+state.version:'draft',input:apiBody().input,results_url:'/v1/analyses/run_demo_009/results',demo:true};$('#api-response').textContent=JSON.stringify(state.response,null,2);$('#response-status').textContent=type==='image'?'200 OK · 模拟响应':'202 Accepted · 模拟响应';$('#send-request').disabled=false;toast('模拟请求已完成');},1100);};
try{const saved=JSON.parse(localStorage.getItem('lens-config')||'null');if(saved){$('#prompt').value=saved.prompt||$('#prompt').value;state.version=saved.version||0;if(['vlx-seek-v1.5-max','vlx-seek-v1.5-pro'].includes(saved.model))$('#model').value=saved.model;}}catch{}
applyViewerMode();$('#prompt-count').textContent=`${$('#prompt').value.length} / 2000`;renderResults();renderAPI();renderComponent();

$('#component-config').value=JSON.stringify(componentConfig,null,2);
$('#apply-component').onclick=()=>{
 try {
  const config=JSON.parse($('#component-config').value);
  applyComponentConfig(config);
  $('#component-config').value=JSON.stringify(componentConfig,null,2);
  $('#component-config-status').textContent='配置已应用，预览与集成代码已更新';$('#component-config-status').classList.remove('error');
 } catch(error){$('#component-config-status').textContent='配置错误：'+error.message;$('#component-config-status').classList.add('error');}
};
$('#component-type').onchange=()=>{componentConfig.component=$('#component-type').value;$('#component-config').value=JSON.stringify(componentConfig,null,2);renderComponent();$('#component-config-status').textContent='已切换组件类型';$('#component-config-status').classList.remove('error');};
$('#reset-component').onclick=()=>{componentConfig={...defaultComponentConfig};$('#component-config').value=JSON.stringify(componentConfig,null,2);$('#component-type').value=componentConfig.component;renderComponent();$('#component-config-status').textContent='已恢复默认配置';$('#component-config-status').classList.remove('error');};
