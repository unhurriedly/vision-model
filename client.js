window.__ModuleLoader__.load({
  id: 'dsh-vision-model',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useEffect, useRef, useState } = React

    const NS = 'vision.model'
    const PANEL_ID = 'vision-model'
    const PAGE_URL = '/dsh-vision-model/'

    const zh = {
      panel: '视觉模型',
      frameTitle: 'Vision Model · 视觉分析工作台',
      loading: '正在载入视觉模型工作台…',
      failedTitle: '工作台页面没有载入',
      failedBody: '宿主没有在 /dsh-vision-model 返回页面。请重试；如果仍然失败，请确认「视觉模型」插件已启用且 index.html 仍位于插件目录。',
      retry: '重试',
      openExternal: '在新标签打开',
    }

    const en = {
      panel: 'Vision model',
      frameTitle: 'Vision Model · Analysis workbench',
      loading: 'Loading the vision model workbench…',
      failedTitle: 'The workbench page did not load',
      failedBody: 'The host did not return the page at /dsh-vision-model. Retry; if it keeps failing, check that the “Vision model” plugin is enabled and index.html is still in its package directory.',
      retry: 'Retry',
      openExternal: 'Open in new tab',
    }

    const CSS = `
.vm-root{position:relative;box-sizing:border-box;display:flex;flex-direction:column;width:100%;height:100%;min-width:0;min-height:0;overflow:hidden;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}
.vm-root *,.vm-root *::before,.vm-root *::after{box-sizing:border-box}
.vm-frame{display:block;flex:1;width:100%;height:100%;min-width:0;min-height:0;border:0;background:#f7f9fd}
.vm-center{display:flex;flex:1;align-items:center;justify-content:center;padding:28px;overflow:auto}
.vm-loading{display:flex;flex-direction:column;align-items:center;gap:12px;font-size:12.5px;color:var(--dsw-alias-label-secondary)}
.vm-spin{width:20px;height:20px;border-radius:50%;border:2px solid var(--dsw-alias-border-l2);border-top-color:var(--dsw-alias-brand-primary);animation:vm-spin .8s linear infinite}
@keyframes vm-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.vm-spin{animation-duration:2s}}
.vm-card{width:100%;max-width:460px}
.vm-card-title{margin:0 0 8px;font-size:15px;font-weight:600;line-height:1.4}
.vm-card-body{margin:0;font-size:12.5px;line-height:1.75;color:var(--dsw-alias-label-secondary)}
.vm-card-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
.vm-btn{display:inline-flex;align-items:center;height:30px;padding:0 12px;border:1px solid var(--dsw-alias-border-l1);border-radius:7px;background:var(--dsw-alias-brand-primary);color:#fff;font:inherit;font-size:12px;line-height:1;cursor:pointer}
.vm-btn:hover{filter:brightness(1.06)}
.vm-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.vm-btn.ghost{border-color:var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-primary)}
.vm-btn.ghost:hover{background:var(--dsw-alias-bg-layer-2)}
`

    function VisionPage({ t }) {
      const [status, setStatus] = useState('checking')
      const [nonce, setNonce] = useState(0)
      const alive = useRef(true)

      useEffect(() => {
        alive.current = true
        setStatus('checking')
        fetch(PAGE_URL, { method: 'HEAD', cache: 'no-store', credentials: 'same-origin' })
          .then((response) => {
            if (alive.current) setStatus(response.ok ? 'ready' : 'error')
          })
          .catch(() => {
            if (alive.current) setStatus('error')
          })
        return () => {
          alive.current = false
        }
      }, [nonce])

      const openExternal = () => {
        window.open(PAGE_URL, '_blank', 'noopener,noreferrer')
      }

      let body
      if (status === 'ready') {
        body = h('iframe', {
          key: nonce,
          className: 'vm-frame',
          src: PAGE_URL,
          title: t('frameTitle'),
          referrerPolicy: 'no-referrer',
          allow: 'fullscreen; clipboard-write',
        })
      } else if (status === 'checking') {
        body = h(
          'div',
          { className: 'vm-center' },
          h('div', { className: 'vm-loading' }, h('span', { className: 'vm-spin' }), h('span', null, t('loading'))),
        )
      } else {
        body = h(
          'div',
          { className: 'vm-center' },
          h(
            'div',
            { className: 'vm-card' },
            h('p', { className: 'vm-card-title' }, t('failedTitle')),
            h('p', { className: 'vm-card-body' }, t('failedBody')),
            h(
              'div',
              { className: 'vm-card-actions' },
              h('button', { type: 'button', className: 'vm-btn', onClick: () => setNonce((n) => n + 1) }, t('retry')),
              h('button', { type: 'button', className: 'vm-btn ghost', onClick: openExternal }, t('openExternal')),
            ),
          ),
        )
      }

      return h(
        React.Fragment,
        null,
        h('style', { 'data-vision-model': '' }, CSS),
        h('div', { className: 'vm-root' }, body),
      )
    }

    function VisionIcon({ size = 20 }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': 'true',
          style: { display: 'block' },
        },
        h('path', {
          d: 'M3.5 8V5.2c0-.9.7-1.7 1.7-1.7H8M16 3.5h2.8c.9 0 1.7.7 1.7 1.7V8M20.5 16v2.8c0 .9-.7 1.7-1.7 1.7H16M8 20.5H5.2c-.9 0-1.7-.7-1.7-1.7V16',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
        }),
        h('rect', { x: 7.2, y: 8.1, width: 9.6, height: 7.9, rx: 1.4, stroke: 'currentColor', strokeWidth: 1.5 }),
        h('circle', { cx: 10.6, cy: 11.1, r: 1.25, fill: 'currentColor' }),
        h('path', { d: 'M8.4 15.2c.5-1.4 1.6-2.1 2.8-2.1s2.2.7 2.7 2.1', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' }),
      )
    }

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'vision-model: dictionaries')
      const t = ctx.locale.bind(NS)

      ctx.slots.inject('main', () =>
        ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS, inject: () => ({ t }) }, VisionPage),
      )

      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          { name: 'sidebar.panellist', id: PANEL_ID, order: 31, locale: NS, label: () => t('panel') },
          VisionIcon,
        ),
      )
    }

    return { inject: ['slots', 'locale'], apply }
  },
})
