// 产品工艺基础数据表
// 功能：显示和管理产品工艺数据

function openProductProcessTable() {
    // 检查是否已经验证过密码
    if (typeof isPricePasswordVerified === 'undefined' || !isPricePasswordVerified) {
        // 显示密码输入界面
        showPricePasswordInput(function () {
            // 密码验证成功后打开产品工艺基础数据表
            if (!document.getElementById('productProcessModal')) {
                createProductProcessModal();
            }
            document.getElementById('productProcessModal').style.display = 'flex';
            initializeProductProcessTable();
        });
    } else {
        // 密码已经验证过，直接打开
        if (!document.getElementById('productProcessModal')) {
            createProductProcessModal();
        }
        document.getElementById('productProcessModal').style.display = 'flex';
        initializeProductProcessTable();
    }
}

function closeProductProcessModal() {
    const modal = document.getElementById('productProcessModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function createProductProcessModal() {
    const modal = document.createElement('div');
    modal.id = 'productProcessModal';
    modal.className = 'price-ref-modal';
    modal.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 10000;
    align-items: stretch;
    justify-content: stretch;
  `;

    modal.innerHTML = `
    <div class="price-ref-content" style="width: 100vw; height: 100vh; max-width: none; max-height: none; display: flex; flex-direction: column;">
      <div style="position: relative; background: linear-gradient(135deg, #00a8ff, #0066cc); color: white; padding: 0 20px; flex-shrink: 0;">
        <h2 style="margin: 0; padding: 15px 0; font-size: 18px; text-align: center; font-weight: 600; letter-spacing: 1px;">产品工艺基础数据表</h2>
        <button class="price-ref-close" onclick="closeProductProcessModal()" style="
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">&times;</button>
      </div>

      <!-- 搜索和筛选区 -->
      <div style="padding: 12px; background: var(--bg-light); border-bottom: 1px solid var(--border-dark); flex-shrink: 0;">
        <div style="display: flex; gap: 10px; align-items: center; flex-wrap: nowrap;">
          <input type="text" id="pptSearchInput" placeholder="搜索型号、客户、尺寸..." style="
            flex: 1;
            padding: 10px 14px;
            border: 1px solid var(--border-dark);
            border-radius: 8px;
            background: var(--input-bg);
            color: var(--text-light);
            font-size: 14px;
            outline: none;
            min-width: 0;
          ">
          <select id="pptSheetSelect" style="
            padding: 10px 30px 10px 14px;
            border: 1px solid var(--border-dark);
            border-radius: 8px;
            background: var(--input-bg);
            color: var(--text-light);
            font-size: 14px;
            outline: none;
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 10px center;
            min-width: 120px;
            flex-shrink: 0;
          ">
          </select>
          <span id="pptResultCount" style="color: var(--text-muted); font-size: 13px; white-space: nowrap; flex-shrink: 0;"></span>
        </div>
      </div>

      <!-- 工作表标签 -->
      <div id="pptSheetTabs" style="padding: 8px 12px; background: var(--card-bg); border-bottom: 1px solid var(--border-dark); overflow-x: auto; flex-shrink: 0; display: flex; gap: 6px;">
      </div>

      <!-- 数据表格区 -->
      <div style="flex: 1; overflow: auto; padding: 8px; background: var(--card-bg); display: flex; flex-direction: column;" id="pptTableContainer">
        <div id="pptLoading" style="text-align: center; padding: 40px; color: var(--text-muted);">
          正在加载数据...
        </div>
      </div>

      <!-- 加载更多按钮 -->
      <div id="pptLoadMore" style="padding: 12px; text-align: center; border-top: 1px solid var(--border-dark); background: var(--card-bg); flex-shrink: 0; display: none;">
        <button onclick="pptLoadMore()" style="
          padding: 10px 24px;
          background: var(--primary-blue);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
        ">加载更多</button>
        <span id="pptLoadInfo" style="margin-left: 10px; color: var(--text-muted); font-size: 13px;"></span>
      </div>
    </div>
  `;

    document.body.appendChild(modal);

    // 添加ESC关闭功能
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeProductProcessModal();
    });

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeProductProcessModal();
    });
}

// 全局状态
let pptData = null;
let pptCurrentSheet = '';
let pptSortCol = -1;
let pptSortAsc = true;
let pptDisplayedRows = 0;
let pptAllFilteredRows = [];
const PPT_BATCH = 50;

function initializeProductProcessTable() {
    // 确保模态框已创建
    const tableContainer = document.getElementById('pptTableContainer');
    if (!tableContainer) {
        console.error('表格容器未找到');
        return;
    }

    // 如果已有数据，直接渲染
    if (pptData) {
        renderProductProcessSheets();
        return;
    }

    // 检查 DATA 是否已加载
    if (typeof DATA !== 'undefined' && DATA) {
        pptData = DATA;
        renderProductProcessSheets();
    } else {
        // 动态加载数据文件
        const script = document.createElement('script');
        script.src = 'Basic product process data.js';
        script.onload = function () {
            if (typeof DATA !== 'undefined') {
                pptData = DATA;
                renderProductProcessSheets();
            } else {
                tableContainer.innerHTML =
                    '<div style="text-align: center; padding: 40px; color: #ff6b6b;">数据加载失败</div>';
            }
        };
        script.onerror = function () {
            tableContainer.innerHTML =
                '<div style="text-align: center; padding: 40px; color: #ff6b6b;">数据文件加载失败，请检查文件是否存在</div>';
        };
        document.head.appendChild(script);
    }

    // 绑定搜索事件
    const searchInput = document.getElementById('pptSearchInput');
    if (searchInput && !searchInput.hasAttribute('data-bound')) {
        searchInput.setAttribute('data-bound', 'true');
        let searchTimer = null;
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                pptDisplayedRows = 0;
                renderProductProcessData();
            }, 300);
        });
    }

    // 绑定工作表选择事件
    const sheetSelect = document.getElementById('pptSheetSelect');
    if (sheetSelect && !sheetSelect.hasAttribute('data-bound')) {
        sheetSelect.setAttribute('data-bound', 'true');
        sheetSelect.addEventListener('change', function () {
            switchProductProcessSheet(this.value);
        });
    }
}

function renderProductProcessSheets() {
    if (!pptData) {
        console.error('pptData 为空');
        return;
    }

    const keys = Object.keys(pptData);
    const sheetSelect = document.getElementById('pptSheetSelect');
    const sheetTabs = document.getElementById('pptSheetTabs');

    if (!sheetSelect || !sheetTabs) {
        console.error('sheetSelect 或 sheetTabs 元素未找到');
        return;
    }

    // 清空
    sheetSelect.innerHTML = '';
    sheetTabs.innerHTML = '';

    if (keys.length === 0) {
        console.error('没有工作表数据');
        return;
    }

    keys.forEach((name, i) => {
        const count = pptData[name].data.length;

        // 下拉选项
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name + ' (' + count + '条)';
        sheetSelect.appendChild(opt);

        // 标签
        const tab = document.createElement('div');
        tab.className = 'sheet-item' + (i === 0 ? ' active' : '');
        tab.dataset.sheet = name;
        tab.innerHTML = name + '<span class="badge">' + count + '</span>';
        tab.style.cssText = `
      padding: 6px 14px;
      border-radius: 18px;
      background: var(--bg-light);
      color: var(--text-secondary);
      font-size: 12px;
      cursor: pointer;
      border: 1.5px solid var(--border-dark);
      user-select: none;
      white-space: nowrap;
    `;
        tab.addEventListener('click', () => switchProductProcessSheet(name));
        sheetTabs.appendChild(tab);
    });

    // 初始显示第一个工作表
    switchProductProcessSheet(keys[0]);
}

function switchProductProcessSheet(name) {
    if (!name || !pptData[name]) return;
    pptCurrentSheet = name;
    pptSortCol = -1;
    pptSortAsc = true;
    pptDisplayedRows = 0;
    pptAllFilteredRows = [];

    // 更新标签样式
    document.querySelectorAll('#pptSheetTabs .sheet-item').forEach(t => {
        const isActive = t.dataset.sheet === name;
        if (isActive) {
            t.style.background = 'var(--primary-blue)';
            t.style.color = '#fff';
            t.style.borderColor = 'var(--primary-blue)';
        } else {
            t.style.background = 'var(--bg-light)';
            t.style.color = 'var(--text-secondary)';
            t.style.borderColor = 'var(--border-dark)';
        }
    });

    // 更新下拉框
    document.getElementById('pptSheetSelect').value = name;

    renderProductProcessData();
}

function renderProductProcessData() {
    const container = document.getElementById('pptTableContainer');
    const loadMore = document.getElementById('pptLoadMore');
    const loadInfo = document.getElementById('pptLoadInfo');
    const resultCount = document.getElementById('pptResultCount');

    if (!pptData || !pptData[pptCurrentSheet]) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">暂无数据</div>';
        return;
    }

    const sheet = pptData[pptCurrentSheet];
    const cols = sheet.columns;
    let rows = sheet.data.map((r, i) => [...r, i]);

    // 全局搜索（支持多条件搜索，用空格或+分隔；支持精确查找：以=开头时进行精确匹配）
    const searchValue = document.getElementById('pptSearchInput').value.trim();
    if (searchValue) {
        // 按空格或 + 分割多个搜索条件
        const keywords = searchValue.split(/[+\s]+/).filter(k => k.trim());

        // 依次应用每个搜索条件（AND逻辑）
        keywords.forEach(keyword => {
            if (keyword.startsWith('=')) {
                // 精确匹配
                const exactQ = keyword.substring(1).toLowerCase();
                rows = rows.filter(r => r.slice(0, -1).some(c => String(c).toLowerCase() === exactQ));
            } else {
                // 模糊匹配
                const q = keyword.toLowerCase();
                rows = rows.filter(r => r.slice(0, -1).some(c => String(c).toLowerCase().includes(q)));
            }
        });
    }

    // 排序
    if (pptSortCol >= 0) {
        rows.sort((a, b) => {
            let va = a[pptSortCol], vb = b[pptSortCol];
            const na = parseFloat(va), nb = parseFloat(vb);
            if (!isNaN(na) && !isNaN(nb) && String(va).match(/^-?\d+(\.\d+)?$/)) {
                va = na; vb = nb;
            }
            if (va < vb) return pptSortAsc ? -1 : 1;
            if (va > vb) return pptSortAsc ? 1 : -1;
            return 0;
        });
    }

    pptAllFilteredRows = rows;
    resultCount.textContent = rows.length + '/' + sheet.data.length;

    // 显示数量
    const showCount = Math.min(pptDisplayedRows + PPT_BATCH, rows.length);
    pptDisplayedRows = showCount;

    if (rows.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">未找到匹配结果</div>';
        loadMore.style.display = 'none';
        return;
    }

    // 构建表格
    let html = `<div style="flex: 1; overflow: auto; min-height: 0;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; min-width: 800px;">
      <thead>
        <tr style="background: var(--bg-light); position: sticky; top: 0; z-index: 1;">`;
    cols.forEach((c, i) => {
        const sorted = pptSortCol === i;
        const icon = sorted ? (pptSortAsc ? '▲' : '▼') : '↕';
        html += `<th style="padding: 10px 8px; text-align: left; font-weight: 600; color: var(--text-light); border-bottom: 2px solid var(--border-dark); cursor: pointer; white-space: nowrap; user-select: none;"
      onclick="pptToggleSort(${i})" title="点击排序">${c} <span style="opacity:0.5; font-size:11px;">${icon}</span></th>`;
    });
    html += `</tr></thead><tbody>`;

    for (let i = 0; i < showCount; i++) {
        const r = rows[i];
        html += `<tr style="border-bottom: 1px solid var(--border-dark);">`;
        cols.forEach((c, ci) => {
            let v = r[ci];
            const displayVal = (v !== '' && v !== null && v !== undefined) ? v : '-';
            html += `<td style="padding: 8px; color: var(--text-light); white-space: nowrap;">${displayVal}</td>`;
        });
        html += '</tr>';
    }
    html += '</tbody></table></div>';

    container.innerHTML = html;

    // 加载更多按钮
    if (showCount < rows.length) {
        loadMore.style.display = 'block';
        loadInfo.textContent = `已显示 ${showCount} / ${rows.length} 条`;
    } else {
        loadMore.style.display = 'none';
    }
}

function pptToggleSort(colIndex) {
    if (pptSortCol === colIndex) {
        pptSortAsc = !pptSortAsc;
    } else {
        pptSortCol = colIndex;
        pptSortAsc = true;
    }
    pptDisplayedRows = 0;
    renderProductProcessData();
}

function pptLoadMore() {
    const showCount = Math.min(pptDisplayedRows + PPT_BATCH, pptAllFilteredRows.length);
    pptDisplayedRows = showCount;
    renderProductProcessData();
}
