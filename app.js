// ================================================================
// NBT 常量与核心解析逻辑
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
    if (confirm('确定要取消当前修复操作吗？')) {
        isCancelled = true;
        showToast('已请求取消，正在清理...', 'warning');
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

    const creativeVal = parsed.hasBeenLoadedInCreative;
    optCreative.checked = (creativeVal === 1);
    hintCreative.textContent = creativeVal !== undefined ? (creativeVal === 1 ? '⚠️ 需修复' : '✅ 正常') : '❓';
    hintCreative.className = `status-hint ${creativeVal === 1 ? 'badge-bad' : 'badge-good'}`;

    const cheatsVal = parsed.cheatsEnabled;
    optCheats.checked = (cheatsVal === 1);
    hintCheats.textContent = cheatsVal !== undefined ? (cheatsVal === 1 ? '⚠️ 需修复' : '✅ 正常') : '❓';
    hintCheats.className = `status-hint ${cheatsVal === 1 ? 'badge-bad' : 'badge-good'}`;

    const commandsVal = parsed.commandsEnabled;
    optCommands.checked = (commandsVal === 1);
    hintCommands.textContent = commandsVal !== undefined ? (commandsVal === 1 ? '⚠️ 需修复' : '✅ 正常') : '❓';
    hintCommands.className = `status-hint ${commandsVal === 1 ? 'badge-bad' : 'badge-good'}`;

    const gameTypeVal = parsed.GameType;
    optGametype.checked = (gameTypeVal !== undefined && gameTypeVal !== 0);
    hintGametype.textContent = gameTypeVal !== undefined ? (gameTypeVal !== 0 ? `⚠️ ${t.modes[gameTypeVal]}` : '✅ 生存') : '❓';
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

// ================================================================
// 事件绑定：拖拽 / 文件上传 / 文件夹读取
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

// ================================================================
// 按钮事件处理（示例、重置、修复、日志导出）
// ================================================================

document.getElementById('loadDemoBtn').addEventListener('click', function() {
    const t = translations[currentLang];
    document.getElementById('introGuides').style.display = 'none';
    document.getElementById('fileTitle').textContent = '示例测试存档.mcworld';
    document.getElementById('fileSub').textContent = '50 KB (Demo Mode)';
    this.style.display = 'none';
    document.getElementById('compareBox').style.display = 'none';
    setProgress(0);
    window.isDemoMode = true;
    window.parsedNBT_data = {
        LevelName: '我的生存世界 (示例)',
        GameType: 1,
        Difficulty: 2,
        RandomSeed: '-7363735107005477438',
        Time: 576000,
        hasBeenLoadedInCreative: 1,
        cheatsEnabled: 0,
        commandsEnabled: 0
    };
    analyzeAndRender();
    showToast('示例数据已加载', 'success');
});

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
    showToast('已重置', 'success');
});

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
        showToast('请至少选择一项修复内容', 'warning');
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
        showToast('当前无需修复', 'info');
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
            showToast('修复已取消', 'warning');
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
            showToast('修复已取消', 'warning');
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
                showToast('修复已取消', 'warning');
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
            showToast('修复已取消', 'warning');
        } else {
            showToast('修复失败: ' + err.message, 'error');
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
// 日志导出/清空与系统初始化
// ================================================================

document.getElementById('exportJsonBtn').addEventListener('click', () => {
    const history = getHistory();
    if (history.length === 0) return showToast(translations[currentLang].no_history, 'warning');
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    downloadFile(blob, `mcsr_fixer_history_${Date.now()}.json`);
    showToast('JSON 已导出', 'success');
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
    showToast('CSV 已导出', 'success');
});

document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (confirm(translations[currentLang].clear_history_confirm || '确定要清空修改日志吗？')) {
        localStorage.removeItem('mcsr_fixer_history');
        renderHistory();
        showToast('历史记录已清空', 'success');
    }
});

// 监听语言与主题切换
document.getElementById('langSelect').addEventListener('change', (e) => setLanguage(e.target.value));
themeSelect.addEventListener('change', (e) => setTheme(e.target.value));
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if ((localStorage.getItem('mcsr_fixer_theme_mode') || 'system') === 'system') applyTheme('system');
});

// 项目初始化启动
setTheme(savedTheme);
setLanguage('zh');
renderHistory();
