// ================================================================
// 1. 工具函数：Toast、进度、弹窗、画中画展示
// ================================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function setProgress(percent, text) {
    const bar = document.getElementById('progressBar');
    const fill = document.getElementById('progressFill');
    const textEl = document.getElementById('progressText');
    const actions = document.getElementById('progressActions');
    if (percent === 0) {
        bar.style.display = 'none';
        textEl.style.display = 'none';
        actions.style.display = 'none';
        return;
    }
    bar.style.display = 'block';
    textEl.style.display = 'block';
    actions.style.display = 'flex';
    fill.style.width = Math.min(percent, 100) + '%';
    if (text) textEl.textContent = text;
}

function showConfirm(title, desc, list, callback) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalDesc').textContent = desc;
    
    const listEl = document.getElementById('modalList');
    const infoBox = document.getElementById('modalInfoBox');
    const confirmBtn = document.getElementById('modalConfirm');
    
    listEl.style.display = 'block';
    infoBox.style.display = 'none';
    confirmBtn.style.display = 'inline-block';
    confirmBtn.textContent = translations[currentLang].btnConfirmText || '确认修复';

    listEl.innerHTML = '';
    list.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        listEl.appendChild(li);
    });
    modal.style.display = 'flex';
    document.getElementById('modalCancel').onclick = () => { modal.style.display = 'none'; };
    confirmBtn.onclick = () => {
        modal.style.display = 'none';
        callback();
    };
}

// 宣传特性画中画弹窗
function showFeatureModal(type) {
    const modal = document.getElementById('confirmModal');
    const listEl = document.getElementById('modalList');
    const infoBox = document.getElementById('modalInfoBox');
    const confirmBtn = document.getElementById('modalConfirm');
    const cancelBtn = document.getElementById('modalCancel');

    listEl.style.display = 'none';
    infoBox.style.display = 'block';
    confirmBtn.style.display = 'none';
    cancelBtn.textContent = currentLang === 'en' ? 'Got it' : '我知道了';

    const t = translations[currentLang].featureModals[type];
    document.getElementById('modalTitle').textContent = t.title;
    document.getElementById('modalDesc').textContent = t.subtitle;

    const lab1 = currentLang === 'en' ? '💡 Feature Overview:' : '💡 功能解读：';
    const lab2 = currentLang === 'en' ? '⚙️ Technical Principle:' : '⚙️ 技术原理：';

    infoBox.innerHTML = `
        <strong>${lab1}</strong>
        <p style="margin-bottom:8px;">${t.desc}</p>
        <strong>${lab2}</strong>
        <p>${t.tech}</p>
    `;

    modal.style.display = 'flex';
    cancelBtn.onclick = () => { modal.style.display = 'none'; };
}

function formatBytes(bytes) {
    if (bytes === 0 || !bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function toggleAccordion(id) {
    const el = document.getElementById(id);
    const arrow = document.getElementById(id + 'Arrow');
    if (el.style.display === 'block') {
        el.style.display = 'none';
        arrow.textContent = '▼';
    } else {
        el.style.display = 'block';
        arrow.textContent = '▲';
    }
}

function readInt64LE(view, offset) {
    const low = view.getUint32(offset, true);
    const high = view.getInt32(offset + 4, true);
    if (typeof BigInt !== 'undefined') {
        return (BigInt(high) << BigInt(32)) | BigInt(low);
    }
    return high * 0x100000000 + low;
}

// ================================================================
// 2. 历史记录
// ================================================================
function getHistory() {
    try { return JSON.parse(localStorage.getItem('mcsr_fixer_history') || '[]'); } catch (e) { return []; }
}

function saveHistoryItem(item) {
    const history = getHistory();
    history.unshift(item);
    if (history.length > 30) history.pop();
    localStorage.setItem('mcsr_fixer_history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('historyContainer');
    container.textContent = '';
    const history = getHistory();
    const t = translations[currentLang];
    if (history.length === 0) {
        const div = document.createElement('div');
        div.style.cssText = 'text-align: center; color: var(--mono-text-dim); padding: 12px; font-size: 0.72rem;';
        div.textContent = t.noHistoryText || '暂无历史记录';
        container.appendChild(div);
        return;
    }
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        const left = document.createElement('div');
        const name = document.createElement('div');
        name.className = 'history-name';
        name.title = item.worldName;
        name.textContent = item.worldName;
        const time = document.createElement('div');
        time.className = 'history-time';
        time.textContent = `${item.timestamp} · ${item.fileName}`;
        left.appendChild(name);
        left.appendChild(time);
        const right = document.createElement('div');
        const badge = document.createElement('span');
        badge.className = `badge ${item.status === 'Fixed' ? 'badge-good' : 'badge-bad'}`;
        badge.textContent = item.status;
        right.appendChild(badge);
        div.appendChild(left);
        div.appendChild(right);
        container.appendChild(div);
    });
}

// ================================================================
// 3. 主题 / 语言
// ================================================================
const themeSelect = document.getElementById('themeSelect');
const savedTheme = localStorage.getItem('mcsr_fixer_theme_mode') || 'system';

function applyTheme(theme) {
    if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

function setTheme(theme) {
    localStorage.setItem('mcsr_fixer_theme_mode', theme);
    themeSelect.value = theme;
    applyTheme(theme);
}
setTheme(savedTheme);
themeSelect.addEventListener('change', (e) => setTheme(e.target.value));
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if ((localStorage.getItem('mcsr_fixer_theme_mode') || 'system') === 'system') applyTheme('system');
});

// ================================================================
// 4. 多语言配置（包含画中画 Modal 内容与扩展后的 FAQ 6条）
// ================================================================
const translations = {
    en: {
        appTitle: 'Achievement Fixer',
        appDesc: 'Archive Detection and Repair Tool',
        dropTitle: 'Click or Drag File / Folder Here',
        dropSub: 'Supports .mcworld / .zip / Folder / level.dat',
        loadDemoBtn: '🧪 No world file? Click to load demo preview',
        theme_system: 'System',
        theme_dark: 'Dark',
        theme_light: 'Light',
        f1_title: '100% Local',
        f1_desc: 'No server uploads<br>Processed in browser',
        f2_title: 'Auto Backup',
        f2_desc: 'Auto-creates<br>.dat.bak file',
        f3_title: 'Safe Edit',
        f3_desc: 'Clears locks only<br>Preserves builds & items',
        btnConfirmText: 'Confirm Fix',
        featureModals: {
            f1: {
                title: '🔒 100% Local Processing',
                subtitle: 'Your world files never touch any third-party servers.',
                desc: 'Your files remain completely on your local device. Zero data upload guarantee.',
                tech: 'Uses browser-native File API and JSZip libraries in client memory. Works completely offline with zero privacy leak risks.'
            },
            f2: {
                title: '💾 Automatic Backup',
                subtitle: 'Zero-risk modification with instant recovery.',
                desc: 'Generates a timestamped backup before writing changes, allowing easy rollback if needed.',
                tech: 'Creates a level.dat.bak inside the package before modifying NBT buffers. Simply remove .bak to restore original state.'
            },
            f3: {
                title: '🎯 Lossless Modification',
                subtitle: 'Precision NBT tag clearing without touching world data.',
                desc: 'Only removes achievement lock flags. Your buildings, inventory, and chunk data stay untouched.',
                tech: 'Precision targeting of hasBeenLoadedInCreative, cheatsEnabled, and GameType tags. Maintains 100% file integrity.'
            }
        },
        pathTitle: '📖 How to export world files? (.mcworld)',
        pathContent: `<b>📱 iOS (iPhone/iPad):</b> Open "Files" app ➔ On My iPhone ➔ Minecraft ➔ games ➔ com.mojang ➔ minecraftWorlds, compress the world folder and rename it to <code>.mcworld</code>.<br><b>🤖 Android:</b> Navigate to <code>Android/data/com.mojang.minecraftpe/files/games/com.mojang/minecraftWorlds</code> to compress.<br><b>💻 Windows:</b> Press <code>Win + R</code> and paste: <code>%localappdata%\\Packages\\Microsoft.MinecraftUWP_8wekyb3d8bbwe\\LocalState\\games\\com.mojang\\minecraftWorlds</code>`,
        faqTitle: '❓ FAQ & Important Details',
        faqContent: `<b>1. What should I avoid after fixing?</b><br>Do NOT enable "Activate Cheats" or switch to "Creative Mode" in-game, otherwise achievements will be automatically locked again.<br><br><b>2. Why did importing fail after fixing?</b><br>If manually zipping, ensure you compress the <b>contents inside</b> the world folder, rather than creating a nested folder structure. level.dat must be in the zip root.<br><br><b>3. Cannot open .mcworld directly on iOS / iPadOS?</b><br>Save the file to "Files" app first, long press and tap "Share" ➔ select "Minecraft"; or rename .mcworld to .zip, extract it and place into minecraftWorlds.<br><br><b>4. Achievements didn't unlock immediately after entering the world?</b><br>This tool restores achievement eligibility rather than forcing unlock. Perform an achievement action in-game (e.g., craft an item) to trigger Xbox unlock notifications.<br><br><b>5. "level.dat not found" error when loading folder/zip?</b><br>Check if the folder path is nested too deep. Ensure level.dat is in lowercase at the root folder level without duplicate suffixes like level.dat (1).<br><br><b>6. Can I use the fixed world in Realms or multiplayer servers?</b><br>Yes! Fix the world locally first, then upload it to your Realm or server. All players will regain achievement eligibility.`,
        infoCardTitle: '🗺️ World Overview',
        k_name: 'World Name',
        k_mode: 'Game Mode',
        k_diff: 'Difficulty',
        k_seed: 'World Seed',
        k_time: 'In-Game Time',
        k_size: 'File Size',
        k_format: 'File Format',
        statusCardTitle: '🔒 Achievement Lock Status',
        fixOptionsTitle: '🛠️ Fix Options (Auto-detected)',
        label_creative: 'Clear creative mode record',
        label_cheats: 'Clear cheats enabled flag',
        label_commands: 'Clear commands enabled flag',
        label_gametype: 'Force game mode to Survival',
        resetBtn: 'Reset',
        fixBtn: 'Fix & Export World',
        exportCsvBtn: 'Export CSV',
        exportJsonBtn: 'Export JSON',
        clearHistoryBtn: 'Clear',
        tipText: "<strong style='color:var(--mono-text);'>Tips:</strong> After re-entering the world, do NOT enable cheats or enter creative mode again, otherwise achievements will be locked once more.",
        footerTag: 'Minecraft Bedrock NBT Tool · Pure Client-Side Process<br>Not affiliated with Mojang Studios or Microsoft',
        historyTitle: '📜 History Log',
        noHistoryText: 'No history found',
        badgeNormal: '0 (OK)',
        badgeAbnormal: '1 (Locked)',
        badgeNotFound: 'N/A',
        nbtNormal: 'Parsed OK',
        nbtError: 'Parse Error',
        summaryWarn: '⚠️ Locks or non-survival mode detected! Click fix to restore survival mode & achievements.',
        summaryOk: '✅ World status is clean! Achievements are active.',
        modes: { 0: 'Survival', 1: 'Creative', 2: 'Adventure', 3: 'Spectator' },
        diffs: { 0: 'Peaceful', 1: 'Easy', 2: 'Normal', 3: 'Hard' },
        timeFormat: (m, d) => `${m} mins (Day ${d})`,
        confirmTitle: 'Confirm Fix?',
        confirmDesc: 'The following flags will be modified:',
        compareTitle: '📊 Before → After Comparison',
        progress_unzip: 'Unzipping archive...',
        progress_parse: 'Parsing NBT data...',
        progress_fix: 'Fixing achievement locks...',
        progress_pack: 'Rebuilding world file...',
        fix_success: '🎉 Fix completed! File downloaded.',
        parse_error: 'File parse error',
        no_leveldat: 'level.dat not found!',
        no_history: 'No history to export',
        clear_history_confirm: 'Clear all history logs?',
        cancel_fix: 'Cancel Fix'
    },
    zh: {
        appTitle: '成就资格修复器',
        appDesc: '存档检测与修复工具',
        dropTitle: '点击或将 文件 / 文件夹 拖拽至此',
        dropSub: '支持 .mcworld / .zip / 文件夹 / level.dat',
        loadDemoBtn: '🧪 没有存档？点击加载示例预览',
        theme_system: '系统',
        theme_dark: '深色',
        theme_light: '浅色',
        f1_title: '纯本地解析',
        f1_desc: '文件零上传<br>浏览器本地处理',
        f2_title: '自动备份',
        f2_desc: '自动生成原包<br>.dat.bak 备份',
        f3_title: '无损修改',
        f3_desc: '只清空限制标记<br>不影响建筑物品',
        btnConfirmText: '确认修复',
        featureModals: {
            f1: {
                title: '🔒 纯本地解析',
                subtitle: '你的存档文件绝不会被上传到任何第三方服务器。',
                desc: '文件的读取、解压、level.dat 数据分析与修改，全部在设备的内存中完成。开启飞行模式断网也能正常使用。',
                tech: '完全基于前端 JavaScript 与浏览器 Web API（如 JSZip、NBT 节点解析库）运行，彻底保障地图隐私与数据安全。'
            },
            f2: {
                title: '💾 自动备份',
                subtitle: '修改过程零风险，遭遇意外也能一键还原。',
                desc: '工具在执行 NBT 属性写回之前，会在包内自动为原始 level.dat 生成一份 .dat.bak 备份。',
                tech: '若导出或导入过程发生意外中断，只需将备份文件的 .bak 后缀抹掉即可恢复原状，绝不破坏原存档。'
            },
            f3: {
                title: '🎯 无损修改',
                subtitle: '精准擦除作弊标记，不破坏建筑、背包与区块数据。',
                desc: '工具仅精准定位并重置与成就资格锁定相关的核心 NBT 节点，修改前后地图体积与内容保持 100% 一致。',
                tech: '仅重置 hasBeenLoadedInCreative、cheatsEnabled、GameType 等控制节点，绝不改动区块（Chunk）或玩家背包（Player Data）。'
            }
        },
        pathTitle: '📖 如何导出存档文件？(.mcworld)',
        pathContent: `<b>📱 iOS (iPhone/iPad):</b> 打开“文件”App ➔ 我的 iPhone ➔ Minecraft ➔ games ➔ com.mojang ➔ minecraftWorlds，找到对应文件夹压缩并重命名为 <code>.mcworld</code>。<br><b>🤖 Android:</b> 进入目录 <code>Android/data/com.mojang.minecraftpe/files/games/com.mojang/minecraftWorlds</code> 打包压缩。<br><b>💻 Windows:</b> 按 <code>Win + R</code> 粘贴路径：<code>%localappdata%\\Packages\\Microsoft.MinecraftUWP_8wekyb3d8bbwe\\LocalState\\games\\com.mojang\\minecraftWorlds</code>`,
        faqTitle: '❓ 常见问题与注意细节',
        faqContent: `<b>1. 修复后进游戏还需要注意什么？</b><br>进游戏后千万不要开启“激活作弊”或切换到“创造模式”，否则 Minecraft 系统会自动再次锁定该存档的成就资格。<br><br><b>2. 为什么修复后导入游戏提示失败？</b><br>如果是手动打包的 .zip，请确认是把<b>存档文件夹内部的文件</b>进行压缩，而不是把外层文件夹打了一个“双层包”。存档根目录下必须能直接看到 level.dat。<br><br><b>3. 在 iOS / iPadOS 上点击导出的 .mcworld 无法直接唤醒游戏？</b><br>部分移动端浏览器（如 Safari/Chrome）下载文件后无法直接关联游戏。请先将文件保存到系统“文件”APP 中，长按该文件点击“共享”，选择“Minecraft”图标导入；或者尝试把 .mcworld 后缀重命名为 .zip 解压后放入游戏存档目录。<br><br><b>4. 修复成功后进入游戏，为什么成就没有立刻解锁？</b><br>本工具是“恢复成就获取资格”，而非直接暴力修改玩家的成就进度。进入游戏后，你需要手动去完成对应的成就任务（例如重新合成一次物品或重新击杀特定生物），微软/Xbox 账号验证成功后才会正常弹窗解锁。<br><br><b>5. 导入 .zip 压缩包或文件夹时提示“未找到 level.dat”？</b><br>这通常是因为解压路径嵌套过深。请检查存档目录结构，确保 level.dat 处于第一级根目录下，且文件名小写无误，没有多余的副本后缀（如 level.dat (1)）。<br><br><b>6. 修复后的存档可以用在 Realms 领域服或多人联机吗？</b><br>完全可以。先在本地使用本工具将地图的成就资格修复完成，再将该存档上传至 Realm 领域服务器，即可恢复所有玩家在该服务器地图中解锁成就的资格。`,
        infoCardTitle: '🗺️ 存档概览信息',
        k_name: '🌍 世界名称',
        k_mode: '🎮 游戏模式',
        k_diff: '🎚️ 难度',
        k_seed: '🌱 地图种子',
        k_time: '⏱️ 游戏时间 / 天数',
        k_size: '📦 存档大小',
        k_format: '📄 文件格式',
        statusCardTitle: '🔒 成就限制状态',
        fixOptionsTitle: '🛠️ 修复选项（自动预检）',
        label_creative: '清除创造模式记录',
        label_cheats: '清除作弊开启标记',
        label_commands: '清除命令启用标记',
        label_gametype: '强制改回生存模式',
        resetBtn: '重置',
        fixBtn: '一键修复并导出',
        exportCsvBtn: '导出 CSV',
        exportJsonBtn: '导出 JSON',
        clearHistoryBtn: '清空',
        tipText: "<strong style='color:var(--mono-text);'>温馨提示：</strong>修复后再次进入游戏时，请勿重新勾选“开启作弊”或切入创造模式，否则系统将再次锁定成就。",
        footerTag: 'Minecraft Bedrock NBT Tool · 纯前端本地处理<br>与 Mojang Studios 或 Microsoft 无关',
        historyTitle: '📜 修改历史日志',
        noHistoryText: '暂无处理记录',
        badgeNormal: '0 (正常)',
        badgeAbnormal: '1 (异常)',
        badgeNotFound: '未找到',
        nbtNormal: '解析正常',
        nbtError: '解析异常',
        summaryWarn: '⚠️ 检测到限制标记或非生存模式！点击修复将自动重置并恢复生存模式。',
        summaryOk: '✅ 存档状态正常，成就资格完好！',
        modes: { 0: '生存 (Survival)', 1: '创造 (Creative)', 2: '冒险 (Adventure)', 3: '旁观 (Spectator)' },
        diffs: { 0: '和平 (Peaceful)', 1: '简单 (Easy)', 2: '普通 (Normal)', 3: '困难 (Hard)' },
        timeFormat: (m, d) => `${m} 分钟 (第 ${d} 天)`,
        confirmTitle: '确认修复？',
        confirmDesc: '即将修改以下存档标记：',
        compareTitle: '📊 修改前后对比',
        progress_unzip: '正在解压存档...',
        progress_parse: '正在解析 NBT 数据...',
        progress_fix: '正在修复成就锁定...',
        progress_pack: '正在重新打包文件...',
        fix_success: '🎉 修复完成！文件已下载。',
        parse_error: '文件解析失败',
        no_leveldat: '未找到 level.dat！',
        no_history: '暂无历史记录可导出',
        clear_history_confirm: '确定要清空修改日志吗？',
        cancel_fix: '取消修复'
    }
};

let currentLang = 'zh';

function setLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    document.getElementById('langSelect').value = lang;
    const map = {
        appTitle: 'appTitle',
        appDesc: 'appDesc',
        fileTitle: 'fileTitle',
        fileSub: 'fileSub',
        f1_title: 'f1_title',
        f2_title: 'f2_title',
        f3_title: 'f3_title',
        pathTitle: 'pathTitle',
        faqTitle: 'faqTitle',
        infoCardTitle: 'infoCardTitle',
        k_name: 'k_name',
        k_mode: 'k_mode',
        k_diff: 'k_diff',
        k_seed: 'k_seed',
        k_time: 'k_time',
        k_size: 'k_size',
        k_format: 'k_format',
        statusCardTitle: 'statusCardTitle',
        fixOptionsTitle: 'fixOptionsTitle',
        label_creative: 'label_creative',
        label_cheats: 'label_cheats',
        label_commands: 'label_commands',
        label_gametype: 'label_gametype',
        resetBtn: 'resetBtn',
        fixBtn: 'fixBtn',
        exportCsvBtn: 'exportCsvBtn',
        exportJsonBtn: 'exportJsonBtn',
        clearHistoryBtn: 'clearHistoryBtn',
        historyTitle: 'historyTitle',
        compareTitle: 'compareTitle',
        cancelFixBtn: 'cancel_fix',
        theme_system: 'theme_system',
        theme_dark: 'theme_dark',
        theme_light: 'theme_light'
    };
    for (let id in map) {
        const el = document.getElementById(map[id]);
        if (el && t[id] !== undefined) el.textContent = t[id];
    }
    // 示例按钮动态多语言
    const demoBtn = document.getElementById('loadDemoBtn');
    if (demoBtn && t.loadDemoBtn) {
        demoBtn.innerHTML = t.loadDemoBtn;
    }

    document.getElementById('f1_desc').innerHTML = t.f1_desc;
    document.getElementById('f2_desc').innerHTML = t.f2_desc;
    document.getElementById('f3_desc').innerHTML = t.f3_desc;
    document.getElementById('pathGuide').innerHTML = t.pathContent;
    document.getElementById('faqGuide').innerHTML = t.faqContent;
    document.getElementById('tipText').innerHTML = t.tipText;
    document.getElementById('footerTag').innerHTML = t.footerTag;

    if (!window.selectedFileObj && !window.isDemoMode) {
        document.getElementById('fileTitle').textContent = t.dropTitle;
        document.getElementById('fileSub').textContent = t.dropSub;
    }
    renderHistory();
    if (window.parsedNBT_data) analyzeAndRender();
}

document.getElementById('langSelect').addEventListener('change', (e) => setLanguage(e.target.value));

// ================================================================
// 5. NBT 解析与修复核心逻辑
// ================================================================
const TAG_END = 0, TAG_BYTE = 1, TAG_SHORT = 2, TAG_INT = 3, TAG_LONG = 4;
const TAG_FLOAT = 5, TAG_DOUBLE = 6, TAG_BYTE_ARRAY = 7, TAG_STRING = 8;
const TAG_LIST = 9, TAG_COMPOUND = 10, TAG_INT_ARRAY = 11, TAG_LONG_ARRAY = 12;

let zipInstance = null, targetLevelDatPath = null, rawLevelDat = null;
let originalBackup = null, isSingleDat = false;
window.selectedFileObj = null;
window.zipRootPrefix = "";
const targetKeys = ['hasBeenLoadedInCreative', 'cheatsEnabled', 'commandsEnabled'];
let isCancelled = false;

document.getElementById('cancelFixBtn').addEventListener('click', function() {
    if (confirm(currentLang === 'en' ? 'Are you sure you want to cancel the current operation?' : '确定要取消当前修复操作吗？')) {
        isCancelled = true;
        showToast(currentLang === 'en' ? 'Cancellation requested, cleaning up...' : '已请求取消，正在清理...', 'warning');
    }
});

function skipTagBody(type, view, offset) {
    if (offset >= view.byteLength) return 0;
    switch (type) {
        case TAG_BYTE: return 1;
        case TAG_SHORT: return 2;
        case TAG_INT: return 4;
        case TAG_LONG: return 8;
        case TAG_FLOAT: return 4;
        case TAG_DOUBLE: return 8;
        case TAG_BYTE_ARRAY: return 4 + view.getInt32(offset, true);
        case TAG_STRING: return 2 + view.getUint16(offset, true);
        case TAG_INT_ARRAY: return 4 + view.getInt32(offset, true) * 4;
        case TAG_LONG_ARRAY: return 4 + view.getInt32(offset, true) * 8;
        default: return 0;
    }
}

function traverseNBT(view, offset, isFixing = false, fixOptions = {}) {
    while (offset < view.byteLength) {
        if (isCancelled) throw new Error('Cancelled by user');
        const tagType = view.getUint8(offset++);
        if (tagType === TAG_END) break;
        const nameLen = view.getUint16(offset, true);
        offset += 2;
        const name = new TextDecoder().decode(new Uint8Array(view.buffer, view.byteOffset + offset, nameLen));
        offset += nameLen;

        if (tagType === TAG_BYTE) {
            if (targetKeys.includes(name)) {
                if (isFixing && fixOptions[name] && view.getInt8(offset) !== 0) {
                    view.setInt8(offset, 0);
                    console.log(`   ✓ ${name} → 0`);
                }
                window.parsedNBT_data[name] = view.getInt8(offset);
            }
            offset += 1;
        } else if (tagType === TAG_INT) {
            if (name === 'GameType') {
                if (isFixing && fixOptions.GameType && view.getInt32(offset, true) !== 0) {
                    view.setInt32(offset, 0, true);
                    console.log('   ✓ GameType → 0 (Restored to Survival)');
                }
                window.parsedNBT_data[name] = view.getInt32(offset, true);
            } else if (name === 'Difficulty') {
                window.parsedNBT_data[name] = view.getInt32(offset, true);
            }
            offset += 4;
        } else if (tagType === TAG_STRING && name === 'LevelName') {
            const sLen = view.getUint16(offset, true);
            window.parsedNBT_data[name] = new TextDecoder().decode(new Uint8Array(view.buffer, view.byteOffset + offset + 2, sLen));
            offset += 2 + sLen;
        } else if (tagType === TAG_LONG && name === 'RandomSeed') {
            window.parsedNBT_data[name] = readInt64LE(view, offset).toString();
            offset += 8;
        } else if (tagType === TAG_LONG && name === 'Time') {
            window.parsedNBT_data[name] = readInt64LE(view, offset);
            offset += 8;
        } else if (tagType === TAG_COMPOUND) {
            offset = traverseNBT(view, offset, isFixing, fixOptions);
        } else if (tagType === TAG_LIST) {
            const subType = view.getUint8(offset++);
            const listLen = view.getInt32(offset, true);
            offset += 4;
            for (let i = 0; i < listLen; i++) {
                if (isCancelled) throw new Error('Cancelled by user');
                if (subType === TAG_COMPOUND) {
                    offset = traverseNBT(view, offset, isFixing, fixOptions);
                } else {
                    offset += skipTagBody(subType, view, offset);
                }
            }
        } else {
            offset += skipTagBody(tagType, view, offset);
        }
    }
    return offset;
}

function quickValidateNBT(buf) {
    if (!buf || buf.length < 8) return false;
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    let offset = 0;
    if (buf.length > 8 && view.getUint8(8) === TAG_COMPOUND) offset = 8;
    if (view.getUint8(offset) !== TAG_COMPOUND) return false;
    return true;
}

function parseNBT(buf) {
    if (!quickValidateNBT(buf)) {
        throw new Error('Invalid NBT structure: not a valid level.dat');
    }
    window.parsedNBT_data = {};
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    let offset = 0;
    if (buf.length > 8 && view.getUint8(8) === TAG_COMPOUND) offset = 8;
    offset++;
    const rootNameLen = view.getUint16(offset, true);
    offset += 2 + rootNameLen;
    traverseNBT(view, offset, false);
    analyzeAndRender();
}

function analyzeAndRender() {
    const parsed = window.parsedNBT_data;
    if (!parsed) return;
    const t = translations[currentLang];

    document.getElementById('infoCard').style.display = 'block';
    document.getElementById('info_name').textContent = parsed.LevelName || 'Unknown';
    document.getElementById('info_mode').textContent = t.modes[parsed.GameType] ?? `Mode (${parsed.GameType})`;
    document.getElementById('info_difficulty').textContent = t.diffs[parsed.Difficulty] ?? `Unknown (${parsed.Difficulty ?? '-'})`;
    document.getElementById('info_seed').textContent = parsed.RandomSeed || 'Unknown';
    if (parsed.Time !== undefined) {
        const ticks = Number(parsed.Time);
        const minutes = (ticks / 20 / 60).toFixed(1);
        const days = Math.floor(ticks / 24000);
        document.getElementById('info_time').textContent = t.timeFormat(minutes, days);
    } else {
        document.getElementById('info_time').textContent = 'N/A';
    }
    if (window.selectedFileObj) {
        document.getElementById('info_size').textContent = formatBytes(window.selectedFileObj.size);
        const ext = window.selectedFileObj.name.substring(window.selectedFileObj.name.lastIndexOf('.')).toLowerCase();
        document.getElementById('info_format').textContent = `${ext} file`;
    } else {
        document.getElementById('info_size').textContent = '50 KB';
        document.getElementById('info_format').textContent = '.mcworld';
    }
    document.getElementById('info_nbt_status').textContent = t.nbtNormal;
    document.getElementById('info_nbt_status').className = 'badge badge-good';

    document.getElementById('statusCard').style.display = 'block';
    document.getElementById('actionGroup').style.display = 'flex';

    const needsFix = targetKeys.some(k => parsed[k] === 1) || parsed.GameType !== 0;

    function updateBadge(id, val) {
        const el = document.getElementById(id);
        if (val === 1) { 
            el.textContent = t.badgeAbnormal;
            el.className = 'badge badge-bad'; 
        } else if (val === 0) { 
            el.textContent = t.badgeNormal;
            el.className = 'badge badge-good'; 
        } else { 
            el.textContent = t.badgeNotFound;
            el.className = 'badge'; 
        }
    }
    updateBadge('val_creative', parsed.hasBeenLoadedInCreative);
    updateBadge('val_cheats', parsed.cheatsEnabled);
    updateBadge('val_commands', parsed.commandsEnabled);

    const optCreative = document.getElementById('opt_creative');
    const optCheats = document.getElementById('opt_cheats');
    const optCommands = document.getElementById('opt_commands');
    const optGametype = document.getElementById('opt_gametype');
    const hintCreative = document.getElementById('hint_creative');
    const hintCheats = document.getElementById('hint_cheats');
    const hintCommands = document.getElementById('hint_commands');
    const hintGametype = document.getElementById('hint_gametype');

    const isEn = currentLang === 'en';
    const creativeVal = parsed.hasBeenLoadedInCreative;
    optCreative.checked = (creativeVal === 1);
    hintCreative.textContent = creativeVal !== undefined ? (creativeVal === 1 ? (isEn ? '⚠️ Fix Needed' : '⚠️ 需修复') : (isEn ? '✅ OK' : '✅ 正常')) : '❓';
    hintCreative.className = `status-hint ${creativeVal === 1 ? 'badge-bad' : 'badge-good'}`;

    const cheatsVal = parsed.cheatsEnabled;
    optCheats.checked = (cheatsVal === 1);
    hintCheats.textContent = cheatsVal !== undefined ? (cheatsVal === 1 ? (isEn ? '⚠️ Fix Needed' : '⚠️ 需修复') : (isEn ? '✅ OK' : '✅ 正常')) : '❓';
    hintCheats.className = `status-hint ${cheatsVal === 1 ? 'badge-bad' : 'badge-good'}`;

    const commandsVal = parsed.commandsEnabled;
    optCommands.checked = (commandsVal === 1);
    hintCommands.textContent = commandsVal !== undefined ? (commandsVal === 1 ? (isEn ? '⚠️ Fix Needed' : '⚠️ 需修复') : (isEn ? '✅ OK' : '✅ 正常')) : '❓';
    hintCommands.className = `status-hint ${commandsVal === 1 ? 'badge-bad' : 'badge-good'}`;

    const gameTypeVal = parsed.GameType;
    optGametype.checked = (gameTypeVal !== undefined && gameTypeVal !== 0);
    hintGametype.textContent = gameTypeVal !== undefined ? (gameTypeVal !== 0 ? `⚠️ ${t.modes[gameTypeVal]}` : (isEn ? '✅ Survival' : '✅ 生存')) : '❓';
    hintGametype.className = `status-hint ${gameTypeVal !== 0 ? 'badge-bad' : 'badge-good'}`;

    const box = document.getElementById('summaryBox'), text = document.getElementById('summaryText');
    if (needsFix) {
        box.style.cssText = 'background:var(--warning-bg); border:1px solid rgba(245, 158, 11, 0.3)';
        text.style.color = 'var(--warning-color)';
        text.textContent = t.summaryWarn;
        document.getElementById('fixBtn').disabled = false;
    } else {
        box.style.cssText = 'background:var(--success-bg); border:1px solid rgba(16, 185, 129, 0.3)';
        text.style.color = 'var(--success-color)';
        text.textContent = t.summaryOk;
        document.getElementById('fixBtn').disabled = true;
    }
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ================================================================
// 6. 事件绑定：拖拽 / 点击 / 修复 / 重置 / 示例
// ================================================================
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');

dropzone.addEventListener('click', () => fileInput.click());

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => {
    dropzone.addEventListener(ev, e => {
        e.preventDefault();
        e.stopPropagation();
        if (ev === 'dragenter' || ev === 'dragover') dropzone.classList.add('dragover');
        else dropzone.classList.remove('dragover');
    });
});

dropzone.addEventListener('drop', async e => {
    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
        const entry = items[0].webkitGetAsEntry ? items[0].webkitGetAsEntry() : null;
        if (entry && entry.isDirectory) {
            await handleFolderDrop(entry);
            return;
        }
    }
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
    }
});

async function handleFolderDrop(directoryEntry) {
    window.isDemoMode = false;
    zipInstance = new JSZip();
    setProgress(0);
    document.getElementById('compareBox').style.display = 'none';
    const filesMap = {};

    async function readEntriesRecursively(entry, path = "") {
        if (entry.isFile) {
            const file = await new Promise(resolve => entry.file(resolve));
            filesMap[path + entry.name] = file;
        } else if (entry.isDirectory) {
            const dirReader = entry.createReader();
            const entries = await new Promise(resolve => dirReader.readEntries(resolve));
            for (const sub of entries) {
                await readEntriesRecursively(sub, path + entry.name + "/");
            }
        }
    }
    await readEntriesRecursively(directoryEntry);

    targetLevelDatPath = null;
    let iconFile = null, totalSize = 0;
    for (const relPath in filesMap) {
        const file = filesMap[relPath];
        totalSize += file.size;
        zipInstance.file(relPath, file);
        if (relPath.toLowerCase().endsWith('level.dat')) targetLevelDatPath = relPath;
        if (relPath.toLowerCase().endsWith('world_icon.jpeg') || relPath.toLowerCase().endsWith('world_icon.png'))
            iconFile = file;
    }
    if (!targetLevelDatPath) {
        showToast(translations[currentLang].no_leveldat, 'error');
        return;
    }
    const lastSlash = targetLevelDatPath.lastIndexOf('/');
    window.zipRootPrefix = lastSlash !== -1 ? targetLevelDatPath.substring(0, lastSlash + 1) : "";
    window.selectedFileObj = { name: directoryEntry.name + '.mcworld', size: totalSize };
    isSingleDat = false;
    document.getElementById('introGuides').style.display = 'none';
    document.getElementById('loadDemoBtn').style.display = 'none';
    document.getElementById('fileTitle').textContent = directoryEntry.name;
    document.getElementById('fileSub').textContent = formatBytes(totalSize) + ' (Folder)';

    const datFile = filesMap[targetLevelDatPath];
    const arrayBuf = await datFile.arrayBuffer();
    rawLevelDat = new Uint8Array(arrayBuf);
    originalBackup = new Uint8Array(rawLevelDat);
    if (iconFile) {
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('worldIcon').src = e.target.result;
            document.getElementById('worldIcon').style.display = 'block';
        };
        reader.readAsDataURL(iconFile);
    }
    parseNBT(rawLevelDat);
}

fileInput.addEventListener('change', async e => {
    window.selectedFileObj = e.target.files[0];
    if (!window.selectedFileObj) return;
    window.isDemoMode = false;
    setProgress(0);
    document.getElementById('compareBox').style.display = 'none';
    const t = translations[currentLang];
    document.getElementById('introGuides').style.display = 'none';
    document.getElementById('loadDemoBtn').style.display = 'none';
    document.getElementById('fileTitle').textContent = window.selectedFileObj.name;
    document.getElementById('fileSub').textContent = formatBytes(window.selectedFileObj.size);

    try {
        if (window.selectedFileObj.name.toLowerCase().endsWith('.dat')) {
            isSingleDat = true;
            zipInstance = null;
            targetLevelDatPath = window.selectedFileObj.name;
            window.zipRootPrefix = "";
            const buf = await window.selectedFileObj.arrayBuffer();
            rawLevelDat = new Uint8Array(buf);
            originalBackup = new Uint8Array(rawLevelDat);
            parseNBT(rawLevelDat);
        } else {
            isSingleDat = false;
            zipInstance = new JSZip();
            setProgress(10, t.progress_unzip);
            const zipContent = await zipInstance.loadAsync(window.selectedFileObj);
            targetLevelDatPath = null;
            window.zipRootPrefix = "";
            let iconEntry = null;
            zipContent.forEach((path, entry) => {
                if (!entry.dir && path.toLowerCase().endsWith('level.dat')) targetLevelDatPath = path;
                if (!entry.dir && (path.toLowerCase().endsWith('world_icon.jpeg') || path.toLowerCase().endsWith('world_icon.png'))) iconEntry = entry;
            });
            if (!targetLevelDatPath) {
                showToast(t.no_leveldat, 'error');
                return;
            }
            const lastSlash = targetLevelDatPath.lastIndexOf('/');
            window.zipRootPrefix = lastSlash !== -1 ? targetLevelDatPath.substring(0, lastSlash + 1) : "";
            if (iconEntry) {
                const base64 = await iconEntry.async('base64');
                const ext = iconEntry.name.endsWith('.png') ? 'png' : 'jpeg';
                document.getElementById('worldIcon').src = `data:image/${ext};base64,${base64}`;
                document.getElementById('worldIcon').style.display = 'block';
            }
            const levelDatEntry = zipContent.file(targetLevelDatPath);
            if (!levelDatEntry) {
                showToast(t.no_leveldat, 'error');
                return;
            }
            setProgress(30, t.progress_parse);
            rawLevelDat = await levelDatEntry.async('uint8array');
            originalBackup = new Uint8Array(rawLevelDat);
            parseNBT(rawLevelDat);
            setProgress(0);
        }
    } catch (err) {
        showToast(t.parse_error + ': ' + err.message, 'error');
        document.getElementById('info_nbt_status').textContent = t.nbtError;
        document.getElementById('info_nbt_status').className = 'badge badge-bad';
        setProgress(0);
    }
});

// 示例数据
document.getElementById('loadDemoBtn').addEventListener('click', function() {
    const t = translations[currentLang];
    document.getElementById('introGuides').style.display = 'none';
    document.getElementById('fileTitle').textContent = currentLang === 'en' ? 'Demo_Survival_World.mcworld' : '示例测试存档.mcworld';
    document.getElementById('fileSub').textContent = '50 KB (Demo Mode)';
    this.style.display = 'none';
    document.getElementById('compareBox').style.display = 'none';
    setProgress(0);
    window.isDemoMode = true;
    window.parsedNBT_data = {
        LevelName: currentLang === 'en' ? 'My Survival World (Demo)' : '我的生存世界 (示例)',
        GameType: 1,
        Difficulty: 2,
        RandomSeed: '-7363735107005477438',
        Time: 576000,
        hasBeenLoadedInCreative: 1,
        cheatsEnabled: 0,
        commandsEnabled: 0
    };
    analyzeAndRender();
    showToast(currentLang === 'en' ? 'Demo data loaded successfully' : '示例数据已加载', 'success');
});

// 重置
document.getElementById('resetBtn').addEventListener('click', function() {
    isCancelled = false;
    zipInstance = null;
    targetLevelDatPath = null;
    rawLevelDat = null;
    window.selectedFileObj = null;
    window.parsedNBT_data = null;
    originalBackup = null;
    isSingleDat = false;
    window.isDemoMode = false;
    window.zipRootPrefix = "";
    fileInput.value = '';
    const t = translations[currentLang];
    document.getElementById('fileTitle').textContent = t.dropTitle;
    document.getElementById('fileSub').textContent = t.dropSub;
    document.getElementById('worldIcon').style.display = 'none';
    document.getElementById('worldIcon').src = '';
    document.getElementById('introGuides').style.display = 'flex';
    document.getElementById('loadDemoBtn').style.display = 'inline-block';
    document.getElementById('infoCard').style.display = 'none';
    document.getElementById('statusCard').style.display = 'none';
    document.getElementById('actionGroup').style.display = 'none';
    document.getElementById('compareBox').style.display = 'none';
    setProgress(0);
    document.getElementById('log').textContent = '';
    document.getElementById('log').style.display = 'none';
    showToast(currentLang === 'en' ? 'Reset completed' : '已重置', 'success');
});

// 修复按钮
document.getElementById('fixBtn').addEventListener('click', function() {
    const parsed = window.parsedNBT_data;
    const t = translations[currentLang];
    const fixOptions = {
        hasBeenLoadedInCreative: document.getElementById('opt_creative').checked,
        cheatsEnabled: document.getElementById('opt_cheats').checked,
        commandsEnabled: document.getElementById('opt_commands').checked,
        GameType: document.getElementById('opt_gametype').checked
    };
    const hasSelection = Object.values(fixOptions).some(v => v);
    if (!hasSelection) {
        showToast(currentLang === 'en' ? 'Please select at least one fix option' : '请至少选择一项修复内容', 'warning');
        return;
    }
    const confirmList = [];
    if (fixOptions.hasBeenLoadedInCreative && parsed.hasBeenLoadedInCreative === 1)
        confirmList.push(`hasBeenLoadedInCreative: 1 → 0`);
    if (fixOptions.cheatsEnabled && parsed.cheatsEnabled === 1)
        confirmList.push(`cheatsEnabled: 1 → 0`);
    if (fixOptions.commandsEnabled && parsed.commandsEnabled === 1)
        confirmList.push(`commandsEnabled: 1 → 0`);
    if (fixOptions.GameType && parsed.GameType !== 0)
        confirmList.push(`GameType: ${t.modes[parsed.GameType]} → Survival`);

    if (confirmList.length === 0) {
        showToast(currentLang === 'en' ? 'No fix required for current state' : '当前无需修复', 'info');
        return;
    }
    showConfirm(t.confirmTitle, t.confirmDesc, confirmList, () => {
        isCancelled = false;
        executeFix(fixOptions);
    });
});

async function executeFix(fixOptions) {
    const parsed = window.parsedNBT_data;
    const t = translations[currentLang];
    const beforeData = { ...parsed };

    if (window.isDemoMode) {
        setProgress(20, t.progress_parse);
        setProgress(50, t.progress_fix);
        if (fixOptions.hasBeenLoadedInCreative) window.parsedNBT_data.hasBeenLoadedInCreative = 0;
        if (fixOptions.cheatsEnabled) window.parsedNBT_data.cheatsEnabled = 0;
        if (fixOptions.commandsEnabled) window.parsedNBT_data.commandsEnabled = 0;
        if (fixOptions.GameType) window.parsedNBT_data.GameType = 0;
        setProgress(80, t.progress_pack);
        saveHistoryItem({
            worldName: parsed.LevelName || 'Unknown',
            fileName: 'Demo.mcworld',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'Fixed',
            creative: beforeData.hasBeenLoadedInCreative ?? 0,
            cheats: beforeData.cheatsEnabled ?? 0
        });
        setProgress(100, t.fix_success);
        showCompare(beforeData, window.parsedNBT_data, fixOptions);
        analyzeAndRender();
        showToast(t.fix_success, 'success');
        setTimeout(() => setProgress(0), 2000);
        return;
    }

    try {
        setProgress(30, t.progress_fix);
        const view = new DataView(rawLevelDat.buffer, rawLevelDat.byteOffset, rawLevelDat.byteLength);
        let offset = 0;
        if (rawLevelDat.length > 8 && view.getUint8(8) === TAG_COMPOUND) offset = 8;
        offset++;
        const rootNameLen = view.getUint16(offset, true);
        offset += 2 + rootNameLen;
        traverseNBT(view, offset, true, fixOptions);

        if (isCancelled) {
            showToast(currentLang === 'en' ? 'Fix operation cancelled' : '修复已取消', 'warning');
            setProgress(0);
            return;
        }

        setProgress(50, t.progress_parse);
        let verifyOff = 0;
        if (rawLevelDat.length > 8 && view.getUint8(8) === TAG_COMPOUND) verifyOff = 8;
        verifyOff++;
        const vRootLen = view.getUint16(verifyOff, true);
        verifyOff += 2 + vRootLen;
        window.parsedNBT_data = {};
        traverseNBT(view, verifyOff, false);

        if (isCancelled) {
            showToast(currentLang === 'en' ? 'Fix operation cancelled' : '修复已取消', 'warning');
            setProgress(0);
            return;
        }

        if (isSingleDat) {
            setProgress(70, t.progress_pack);
            const blob = new Blob([rawLevelDat], { type: 'application/octet-stream' });
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
            downloadFile(blob, `level.dat_${timestamp}.dat`);
            saveHistoryItem({
                worldName: parsed.LevelName || 'Unknown',
                fileName: window.selectedFileObj.name,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'Fixed',
                creative: beforeData.hasBeenLoadedInCreative ?? 0,
                cheats: beforeData.cheatsEnabled ?? 0
            });
            setProgress(100, t.fix_success);
            showCompare(beforeData, window.parsedNBT_data, fixOptions);
            analyzeAndRender();
            showToast(t.fix_success, 'success');
            setTimeout(() => setProgress(0), 2000);
            return;
        }

        setProgress(70, t.progress_pack);
        const newZip = new JSZip();
        const prefix = window.zipRootPrefix || "";
        const entries = [];
        zipInstance.forEach((relativePath, entry) => {
            if (entry.dir) return;
            let clean = relativePath;
            if (prefix && relativePath.startsWith(prefix)) clean = relativePath.substring(prefix.length);
            entries.push({ original: relativePath, clean, entry });
        });
        for (const item of entries) {
            if (isCancelled) {
                showToast(currentLang === 'en' ? 'Fix operation cancelled' : '修复已取消', 'warning');
                setProgress(0);
                return;
            }
            if (item.original === targetLevelDatPath) {
                newZip.file('level.dat', rawLevelDat);
                newZip.file('level.dat.bak', originalBackup);
            } else {
                const content = await item.entry.async('uint8array');
                newZip.file(item.clean, content);
            }
        }
        const blob = await newZip.generateAsync({
            type: 'blob',
            mimeType: 'application/x-minecraft-world',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
        });
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
        const outName = `Fixed_${window.selectedFileObj.name.replace(/\.(zip|mcworld)$/i, '')}_${timestamp}.mcworld`;
        downloadFile(blob, outName);
        saveHistoryItem({
            worldName: parsed.LevelName || 'Unknown',
            fileName: window.selectedFileObj.name,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'Fixed',
            creative: beforeData.hasBeenLoadedInCreative ?? 0,
            cheats: beforeData.cheatsEnabled ?? 0
        });
        setProgress(100, t.fix_success);
        showCompare(beforeData, window.parsedNBT_data, fixOptions);
        analyzeAndRender();
        showToast(t.fix_success, 'success');
        setTimeout(() => setProgress(0), 2000);
    } catch (err) {
        if (err.message === 'Cancelled by user') {
            showToast(currentLang === 'en' ? 'Fix operation cancelled' : '修复已取消', 'warning');
        } else {
            showToast((currentLang === 'en' ? 'Fix failed: ' : '修复失败: ') + err.message, 'error');
        }
        setProgress(0);
    }
}

function showCompare(before, after, options) {
    const t = translations[currentLang];
    const box = document.getElementById('compareBox');
    const content = document.getElementById('compareContent');
    document.getElementById('compareTitle').textContent = t.compareTitle;
    content.innerHTML = '';
    const items = [];
    if (options.hasBeenLoadedInCreative && before.hasBeenLoadedInCreative !== after.hasBeenLoadedInCreative) {
        items.push({ label: 'hasBeenLoadedInCreative', old: before.hasBeenLoadedInCreative, new: after.hasBeenLoadedInCreative });
    }
    if (options.cheatsEnabled && before.cheatsEnabled !== after.cheatsEnabled) {
        items.push({ label: 'cheatsEnabled', old: before.cheatsEnabled, new: after.cheatsEnabled });
    }
    if (options.commandsEnabled && before.commandsEnabled !== after.commandsEnabled) {
        items.push({ label: 'commandsEnabled', old: before.commandsEnabled, new: after.commandsEnabled });
    }
    if (options.GameType && before.GameType !== after.GameType) {
        items.push({ label: 'GameType', old: t.modes[before.GameType], new: t.modes[after.GameType] });
    }
    items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'compare-row';
        row.innerHTML = `
        <div class="compare-old">${item.old}</div>
        <div class="compare-arrow">→</div>
        <div class="compare-new">${item.new}</div>
      `;
        content.appendChild(row);
    });
    box.style.display = 'block';
}

// ================================================================
// 7. 历史导出 / 清空
// ================================================================
document.getElementById('exportJsonBtn').addEventListener('click', () => {
    const history = getHistory();
    if (history.length === 0) return showToast(translations[currentLang].no_history, 'warning');
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    downloadFile(blob, `mcsr_fixer_history_${Date.now()}.json`);
    showToast(currentLang === 'en' ? 'JSON exported' : 'JSON 已导出', 'success');
});
document.getElementById('exportCsvBtn').addEventListener('click', () => {
    const history = getHistory();
    if (history.length === 0) return showToast(translations[currentLang].no_history, 'warning');
    let csv = '\uFEFF';
    csv += 'World Name,File Name,Time,Status,Creative Flag,Cheats Flag\n';
    history.forEach(h => {
        csv += `"${(h.worldName || '').replace(/"/g, '""')}","${(h.fileName || '').replace(/"/g, '""')}","${h.timestamp}","${h.status}",${h.creative},${h.cheats}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `mcsr_fixer_history_${Date.now()}.csv`);
    showToast(currentLang === 'en' ? 'CSV exported' : 'CSV 已导出', 'success');
});
document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (confirm(translations[currentLang].clear_history_confirm || '确定要清空修改日志吗？')) {
        localStorage.removeItem('mcsr_fixer_history');
        renderHistory();
        showToast(currentLang === 'en' ? 'History cleared' : '历史记录已清空', 'success');
    }
});

// ================================================================
// 8. 初始化
// ================================================================
setLanguage('zh');
renderHistory();
