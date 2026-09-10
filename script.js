:root {
    --mono-bg: #09090b;
    --mono-card: rgba(24, 24, 27, 0.75);
    --mono-card-solid: #18181b;
    --mono-border: rgba(255, 255, 255, 0.08);
    --mono-border-light: rgba(255, 255, 255, 0.16);
    --mono-text: #f4f4f5;
    --mono-text-dim: #a1a1aa;
    --mono-accent: #3b82f6;
    --mono-accent-btn: #ffffff;
    --mono-accent-text: #09090b;
    --danger-color: #ef4444;
    --danger-bg: rgba(239, 68, 68, 0.12);
    --success-color: #10b981;
    --success-bg: rgba(16, 185, 129, 0.12);
    --warning-color: #f59e0b;
    --warning-bg: rgba(245, 158, 11, 0.12);
    --radius: 12px;
    --touch-size: 44px;
}
[data-theme="light"] {
    --mono-bg: #f4f4f5;
    --mono-card: rgba(255, 255, 255, 0.85);
    --mono-card-solid: #ffffff;
    --mono-border: rgba(0, 0, 0, 0.08);
    --mono-border-light: rgba(0, 0, 0, 0.16);
    --mono-text: #09090b;
    --mono-text-dim: #71717a;
    --mono-accent: #2563eb;
    --mono-accent-btn: #09090b;
    --mono-accent-text: #ffffff;
}
* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", Helvetica, Arial, sans-serif; }
body {
    background-color: var(--mono-bg);
    background-image: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.05), transparent 40%);
    color: var(--mono-text); min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 24px 14px; background-attachment: fixed; transition: background-color 0.3s, color 0.3s; position: relative;
}
body.has-custom-bg::before { content: ""; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(4px); z-index: -1; }
#app { width: 100%; max-width: 560px; }
.card { background: var(--mono-card); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid var(--mono-border); border-radius: var(--radius); padding: 18px; margin-bottom: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15); transition: border-color 0.2s; }
.top-bar { display: flex; justify-content: flex-end; align-items: center; margin-bottom: 12px; gap: 8px; }
.right-group { display: flex; align-items: center; gap: 8px; }
.btn-sm { background: var(--mono-card-solid); border: 1px solid var(--mono-border); color: var(--mono-text); padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 500; cursor: pointer; transition: all 0.2s; min-height: 36px; display: inline-flex; align-items: center; justify-content: center; }
.btn-sm:hover { border-color: var(--mono-border-light); transform: translateY(-1px); }
.select-custom { background: var(--mono-card-solid); border: 1px solid var(--mono-border); color: var(--mono-text); padding: 6px 10px; border-radius: 8px; font-size: 0.8rem; outline: none; min-height: 36px; cursor: pointer; }
.header { text-align: center; margin: 8px 0 16px 0; }
.header h1 { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; background: linear-gradient(180deg, var(--mono-text) 0%, var(--mono-text-dim) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.header p { font-size: 0.82rem; color: var(--mono-text-dim); margin-top: 4px; }
.dropzone { border: 2px dashed var(--mono-border-light); border-radius: var(--radius); padding: 28px 16px; text-align: center; cursor: pointer; transition: all 0.25s ease; background: rgba(255, 255, 255, 0.01); }
.dropzone:hover, .dropzone.dragover { border-color: var(--mono-text); background: rgba(255, 255, 255, 0.04); transform: translateY(-2px); }
.dropzone h3 { font-size: 1rem; font-weight: 600; margin-bottom: 6px; }
.dropzone p { font-size: 0.78rem; color: var(--mono-text-dim); }
.demo-btn { margin-top: 12px; background: none; border: none; color: var(--mono-text-dim); font-size: 0.78rem; text-decoration: underline; cursor: pointer; padding: 6px 12px; transition: color 0.2s; }
.demo-btn:hover { color: var(--mono-text); }
.features-merged { display: flex; flex-wrap: nowrap; background: var(--mono-card); backdrop-filter: blur(12px); border: 1px solid var(--mono-border); border-radius: var(--radius); margin-bottom: 16px; overflow: hidden; }
.feature-item-merged { flex: 1 1 0; text-align: center; padding: 12px 4px; border-right: 1px solid var(--mono-border); min-width: 0; cursor: pointer; transition: background-color 0.2s, transform 0.2s; user-select: none; }
.feature-item-merged:hover { background: rgba(255, 255, 255, 0.05); }
.feature-item-merged:active { transform: scale(0.98); }
.feature-item-merged:last-child { border-right: none; }
.feature-item-merged .icon { font-size: 1.2rem; display: block; margin-bottom: 4px; }
.feature-item-merged h4 { font-size: 0.75rem; font-weight: 600; margin-bottom: 2px; white-space: nowrap; }
.feature-item-merged p { font-size: 0.65rem; color: var(--mono-text-dim); line-height: 1.3; margin: 0; white-space: nowrap; }
@media (max-width: 420px) {
    .feature-item-merged { padding: 8px 2px; }
    .feature-item-merged h4 { font-size: 0.65rem; }
    .feature-item-merged p { font-size: 0.55rem; }
    .feature-item-merged .icon { font-size: 1rem; }
}
.accordion { cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 600; padding: 2px 0; user-select: none; }
.accordion-content { display: none; margin-top: 12px; font-size: 0.78rem; color: var(--mono-text-dim); line-height: 1.6; border-top: 1px solid var(--mono-border); padding-top: 12px; }
.world-header-box { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
.world-icon-img { width: 52px; height: 52px; border-radius: 10px; border: 1px solid var(--mono-border-light); object-fit: cover; display: none; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
.info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.info-item { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--mono-border); padding: 10px 12px; border-radius: 8px; }
.info-item label { display: block; font-size: 0.68rem; color: var(--mono-text-dim); margin-bottom: 2px; }
.info-item span { font-size: 0.85rem; font-weight: 600; word-break: break-all; }
.status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
.status-card-item { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--mono-border); border-radius: 8px; padding: 10px 8px; text-align: center; }
.status-card-item .key { font-size: 0.65rem; color: var(--mono-text-dim); display: block; margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.badge { padding: 3px 8px; border-radius: 6px; font-size: 0.72rem; font-weight: 600; background: var(--mono-border); color: var(--mono-text-dim); display: inline-block; }
.badge-good { background: var(--success-bg); color: var(--success-color); border: 1px solid rgba(16, 185, 129, 0.2); }
.badge-bad { background: var(--danger-bg); color: var(--danger-color); border: 1px solid rgba(239, 68, 68, 0.2); }
.badge-warn { background: var(--warning-bg); color: var(--warning-color); border: 1px solid rgba(245, 158, 11, 0.2); }
.fix-options { margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--mono-border); }
.fix-options h4 { font-size: 0.85rem; font-weight: 600; margin-bottom: 10px; }
.option-grid { display: flex; flex-direction: column; gap: 8px; }
.option-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--mono-border); border-radius: 8px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; }
.option-row:hover { border-color: var(--mono-border-light); background: rgba(255, 255, 255, 0.04); }
.option-left { display: flex; align-items: center; gap: 10px; flex: 1; }
.option-row input[type="checkbox"] { width: 18px; height: 18px; accent-color: var(--mono-text); cursor: pointer; flex-shrink: 0; }
.option-row label { cursor: pointer; flex: 1; font-weight: 500; }
.option-row .status-hint { font-size: 0.72rem; padding: 2px 8px; border-radius: 4px; font-weight: 500; }
.progress-area { margin: 14px 0 6px 0; }
.progress-bar { width: 100%; height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: 3px; overflow: hidden; display: none; }
.progress-fill { height: 100%; width: 0%; background: var(--mono-text); transition: width 0.3s ease; border-radius: 3px; }
.progress-text { font-size: 0.75rem; color: var(--mono-text-dim); text-align: center; margin-bottom: 6px; display: none; }
.progress-actions { display: none; justify-content: center; gap: 12px; margin-top: 8px; }
.compare-box { margin-top: 14px; padding: 12px; border-radius: 8px; background: rgba(0, 0, 0, 0.2); border: 1px solid var(--mono-border); display: none; }
.compare-box h4 { font-size: 0.8rem; margin-bottom: 8px; color: var(--mono-text-dim); }
.compare-row { display: grid; grid-template-columns: 1fr 30px 1fr; gap: 6px; align-items: center; font-size: 0.78rem; padding: 4px 0; }
.compare-old { color: var(--danger-color); background: var(--danger-bg); padding: 2px 6px; border-radius: 4px; text-align: center; font-weight: 600; }
.compare-arrow { text-align: center; color: var(--mono-text-dim); }
.compare-new { color: var(--success-color); background: var(--success-bg); padding: 2px 6px; border-radius: 4px; text-align: center; font-weight: 600; }
.btn-group { display: flex; gap: 10px; }
.btn-primary { flex: 2; background: var(--mono-accent-btn); color: var(--mono-accent-text); border: none; padding: 12px; border-radius: var(--radius); font-size: 0.92rem; font-weight: 600; cursor: pointer; transition: all 0.2s; min-height: var(--touch-size); box-shadow: 0 2px 10px rgba(255, 255, 255, 0.1); }
.btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }
.btn-secondary { flex: 1; background: transparent; color: var(--mono-text); border: 1px solid var(--mono-border); padding: 12px; border-radius: var(--radius); font-size: 0.92rem; font-weight: 500; cursor: pointer; min-height: var(--touch-size); transition: all 0.2s; }
.btn-secondary:hover { border-color: var(--mono-border-light); background: rgba(255, 255, 255, 0.03); }
.history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 6px; }
.history-actions { display: flex; gap: 6px; }
.history-actions .btn-sm { padding: 2px 8px; font-size: 0.72rem; min-height: 28px; }
.history-list { max-height: 160px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
.history-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.02); border: 1px solid var(--mono-border); padding: 8px 10px; border-radius: 8px; font-size: 0.78rem; }
.history-name { font-weight: 600; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.history-time { font-size: 0.68rem; color: var(--mono-text-dim); margin-top: 1px; }
.tip-box { background: rgba(255, 255, 255, 0.02); border-left: 3px solid var(--mono-text); padding: 12px 14px; font-size: 0.78rem; color: var(--mono-text-dim); border-radius: 0 8px 8px 0; margin-bottom: 16px; line-height: 1.5; }
.footer { text-align: center; font-size: 0.72rem; color: var(--mono-text-dim); margin-top: 16px; line-height: 1.5; }
.footer a { color: var(--mono-text); text-decoration: underline; transition: opacity 0.2s; }
.footer a:hover { opacity: 0.8; }
.log-box { font-family: monospace; font-size: 0.7rem; background: #000; color: #10b981; padding: 10px; border-radius: 8px; max-height: 120px; overflow-y: auto; display: none; white-space: pre-wrap; margin-bottom: 16px; }
.toast-container { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; max-width: 90%; }
.toast { padding: 10px 18px; border-radius: 20px; font-size: 0.82rem; font-weight: 500; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3); animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1); pointer-events: auto; backdrop-filter: blur(8px); }
.toast-success { background: #10b981; color: #fff; }
.toast-error { background: #ef4444; color: #fff; }
.toast-warning { background: #f59e0b; color: #fff; }
@keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-mask { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); z-index: 9998; display: none; align-items: center; justify-content: center; padding: 20px; }
.modal { background: var(--mono-card-solid); border: 1px solid var(--mono-border-light); border-radius: var(--radius); padding: 22px; width: 100%; max-width: 420px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: modalIn 0.2s ease; }
.modal h3 { font-size: 1.05rem; margin-bottom: 10px; }
.modal p { font-size: 0.82rem; color: var(--mono-text-dim); margin-bottom: 12px; line-height: 1.5; }
.modal-list { margin: 12px 0; padding-left: 20px; font-size: 0.82rem; line-height: 1.6; max-height: 180px; overflow-y: auto; color: var(--warning-color); }
.modal-btns { display: flex; gap: 10px; margin-top: 18px; }
.modal-btns button { flex: 1; padding: 10px; border-radius: 8px; font-size: 0.85rem; cursor: pointer; border: none; font-weight: 600; min-height: var(--touch-size); }
.btn-cancel { background: var(--mono-border); color: var(--mono-text); }
.btn-confirm { background: var(--mono-accent-btn); color: var(--mono-accent-text); }
.modal-info-box { background: rgba(255, 255, 255, 0.03); border: 1px solid var(--mono-border); border-radius: 8px; padding: 12px; margin-top: 10px; font-size: 0.78rem; color: var(--mono-text-dim); line-height: 1.6; }
.modal-info-box strong { color: var(--mono-text); display: block; margin-bottom: 4px; }
@keyframes modalIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@media (max-width: 480px) {
    .btn-group { flex-direction: column; }
    .info-grid { grid-template-columns: 1fr; }
    .status-grid { grid-template-columns: 1fr; }
}