// 轴承型号对照表功能
let bearingRefFiltered = [];
let bearingRefSortKey = '';
let bearingRefSortDir = 1;
let bearingRefCurrentPage = 1;
let bearingRefPageSize = 50;

// 解包轴承数据
function getBearingRefData() {
  return BD.map(r => ({
    d: r[0], D: r[1], B: r[2],
    newNo: r[3], oldNo: r[4], refNo: r[5],
    brand: BRANDS[r[6]], desc: DESCS[r[7]], type: TYPES[r[8]],
    remark: r[9] || ''
  }));
}

// 打开轴承型号对照表
function openBearingReference() {
  // 创建或显示模态窗口
  let modal = document.getElementById('bearingRefModal');
  if (!modal) {
    createBearingRefModal();
    modal = document.getElementById('bearingRefModal');
  }
  modal.style.display = 'flex';

  // 初始化数据
  bearingRefFiltered = getBearingRefData();
  bearingRefCurrentPage = 1;
  bearingRefSortKey = '';
  bearingRefSortDir = 1;

  // 构建筛选器
  buildBearingRefFilters();
  renderBearingRefPage();
}

// 创建模态窗口
function createBearingRefModal() {
  const modal = document.createElement('div');
  modal.id = 'bearingRefModal';
  modal.className = 'bearing-ref-modal';
  modal.innerHTML = `
    <div class="bearing-ref-content">
      <div class="bearing-ref-header">
        <h3>常用轴承型号对照表</h3>
        <button class="bearing-ref-close" onclick="closeBearingRefModal()">&times;</button>
      </div>
      <div class="bearing-ref-search">
        <input type="text" id="brQ" placeholder="新型号 / 旧型号 / 对照型号..." onkeydown="if(event.key==='Enter')brDoSearch()">
        <input type="text" id="brDRange" placeholder="内径 如：10 或 10~50">
        <input type="text" id="brDRange2" placeholder="外径 如：10 或 10~50">
        <input type="text" id="brBRange" placeholder="高度 如：10 或 10~50">
        <select id="brTypeFilter"><option value="">全部类型</option></select>
        <select id="brBrandFilter"><option value="">全部品牌</option></select>
        <div class="br-btn-group">
          <button class="btn-primary" onclick="brDoSearch()">查询</button>
          <button class="btn-secondary" onclick="brDoReset()">重置</button>
        </div>
      </div>
      <div class="bearing-ref-stats">
        共找到 <strong id="brTotalCount">-</strong> 条记录
        <select id="brPageSize" onchange="brOnPageSizeChange()">
          <option value="20">20</option><option value="50" selected>
          50</option>
          <option value="100">100</option><option value="200">200</option>
        </select> 条/页
      </div>
      <div class="bearing-ref-table-wrap">
        <table>
          <thead>
            <tr>
              <th onclick="brSortBy('newNo')">新型号</th>
              <th onclick="brSortBy('oldNo')">旧型号</th>
              <th onclick="brSortBy('refNo')">对照型号</th>
              <th onclick="brSortBy('d')">内径</th>
              <th onclick="brSortBy('D')">外径</th>
              <th onclick="brSortBy('B')">高度</th>
              <th onclick="brSortBy('type')">类型</th>
              <th onclick="brSortBy('brand')">品牌</th>
              <th>描述</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody id="brTableBody"></tbody>
        </table>
      </div>
      <div id="brPagination" class="pagination"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // 添加样式
  const style = document.createElement('style');
  style.textContent = `
    .bearing-ref-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 10000; align-items: center; justify-content: center; padding: 6px; }
    .bearing-ref-content { background: var(--card-bg); border-radius: 8px; width: 99%; max-width: 1400px; max-height: 100vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
    .bearing-ref-header { display: flex; justify-content: center; align-items: center; padding: 15px 20px; background: linear-gradient(135deg, var(--primary-blue), var(--secondary-blue)); color: var(--text-light); position: relative; }
    .bearing-ref-header h3 { margin: 0; font-size: 18px; }
    .bearing-ref-close { position: absolute; right: 10px; top: 15px; background: none; border: none; color: var(--text-light); font-size: 26px; cursor: pointer; padding: 0 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }
    .bearing-ref-close:hover { background: rgba(255,255,255,0.1); border-radius: 4px; }
    .bearing-ref-search { display: flex; flex-wrap: wrap; gap: 10px; padding: 15px 10px; background: var(--bg-light); border-bottom: 1px solid var(--border-dark); align-items: center; }
    .bearing-ref-search input, .bearing-ref-search select { height: 36px; padding: 0 10px; border: 1px solid var(--border-dark); border-radius: 4px; font-size: 13px; background: var(--input-bg); color: var(--text-light); }
    .bearing-ref-search input[type="text"] { flex: 1; min-width: 150px; }
    .br-btn-group { display: flex; gap: 8px; margin-left: auto; }
    
    /* 响应式布局 */
    @media (max-width: 768px) {
      .bearing-ref-search {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        gap: 3px;
      }
      .bearing-ref-search input[type="text"],
      .bearing-ref-search select {
        flex: 1;
        min-width: calc(33.33% - 2px);
        max-width: calc(33.33% - 2px);
      }
      .br-btn-group {
        width: 100%;
        flex-direction: row;
        justify-content: center;
        margin-left: 0;
        gap: 10px;
        margin-top: 5px;
      }
      .btn-primary,
      .btn-secondary {
        flex: 1;
        max-width: 120px;
      }
    }
    .btn-primary { background: linear-gradient(135deg, var(--primary-blue), var(--secondary-blue)); color: var(--text-light); border: none; border-radius: 4px; padding: 0 16px; cursor: pointer; font-weight: 600; height: 36px; transition: all .3s ease; white-space: nowrap; min-width: 60px; }
    .btn-primary:hover { background: linear-gradient(135deg, var(--secondary-blue), var(--primary-blue)); }
    .btn-secondary { background: var(--bg-light); color: var(--text-light); border: 1px solid var(--border-dark); border-radius: 4px; padding: 0 16px; cursor: pointer; height: 34px; transition: all .3s ease; white-space: nowrap; min-width: 60px; }
    .btn-secondary:hover { background: var(--bg-hover); }
    .bearing-ref-stats { padding: 10px 20px; font-size: 13px; color: var(--text-muted); display: flex; align-items: center; gap: 10px; }
    .bearing-ref-stats strong { color: var(--primary-blue); }
    .bearing-ref-stats select { height: 28px; padding: 0 6px; border: 1px solid var(--border-dark); border-radius: 4px; background: var(--input-bg); color: var(--text-light); }
    .bearing-ref-table-wrap { flex: 1; overflow: auto; padding: 0 20px; }
    .bearing-ref-table-wrap table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .bearing-ref-table-wrap thead { background: var(--bg-light); color: var(--text-light); position: sticky; top: 0; }
    .bearing-ref-table-wrap th { padding: 10px 12px; text-align: left; font-weight: 600; cursor: pointer; white-space: nowrap; border-bottom: 1px solid var(--border-dark); }
    .bearing-ref-table-wrap th:hover { background: var(--bg-hover); }
    .bearing-ref-table-wrap th.sorted-asc::after { content: ' ▲'; font-size: 10px; }
    .bearing-ref-table-wrap th.sorted-desc::after { content: ' ▼'; font-size: 10px; }
    .bearing-ref-table-wrap td { padding: 8px 12px; border-bottom: 1px solid var(--border-dark); color: var(--text-light); }
    .bearing-ref-table-wrap tbody tr:nth-child(even) { background: var(--bg-light); }
    .bearing-ref-table-wrap tbody tr:hover { background: var(--bg-hover); }
    .br-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; background: rgba(76, 209, 55, 0.2); color: var(--accent-blue); }
    .br-badge-type { background: rgba(255, 149, 0, 0.2); color: var(--primary-orange); }
    .br-no-data { text-align: center; padding: 40px; color: var(--text-muted); }
    .pagination { display: flex; justify-content: center; gap: 4px; padding: 12px 20px; }
    .pagination button { min-width: 32px; height: 32px; border: 1px solid var(--border-dark); border-radius: 4px; background: var(--input-bg); color: var(--text-light); cursor: pointer; font-size: 13px; display: inline-flex; align-items: center; justify-content: center; transition: all .3s ease; }
    .pagination button:hover:not(:disabled) { border-color: var(--primary-blue); color: var(--primary-blue); }
    .pagination button.active { background: var(--primary-blue); border-color: var(--primary-blue); color: var(--text-light); font-weight: 600; }
    .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
    mark { background: rgba(255, 149, 0, 0.3); color: var(--primary-orange); padding: 0 2px; }
    
    /* 浅色主题适配 */
    .light-theme .bearing-ref-content { background: var(--light-card-bg); }
    .light-theme .bearing-ref-search { background: var(--light-bg-light); border-bottom-color: var(--light-border-dark); }
    .light-theme .bearing-ref-search input, .light-theme .bearing-ref-search select { border-color: var(--light-border-dark); background: #fff; color: var(--light-text-light); }
    .light-theme .btn-secondary { background: var(--light-bg-light); color: var(--light-text-light); border-color: var(--light-border-dark); }
    .light-theme .btn-secondary:hover { background: var(--light-bg-hover); }
    .light-theme .bearing-ref-stats { color: var(--light-text-muted); }
    .light-theme .bearing-ref-stats select { border-color: var(--light-border-dark); background: #fff; color: var(--light-text-light); }
    .light-theme .bearing-ref-table-wrap thead { background: var(--light-bg-light); color: var(--light-text-light); }
    .light-theme .bearing-ref-table-wrap th { border-bottom-color: var(--light-border-dark); }
    .light-theme .bearing-ref-table-wrap th:hover { background: var(--light-bg-hover); }
    .light-theme .bearing-ref-table-wrap td { border-bottom-color: var(--light-border-dark); color: var(--light-text-light); }
    .light-theme .bearing-ref-table-wrap tbody tr:nth-child(even) { background: var(--light-bg-light); }
    .light-theme .bearing-ref-table-wrap tbody tr:hover { background: var(--light-bg-hover); }
    .light-theme .br-badge { background: rgba(76, 209, 55, 0.2); color: #2e7d32; }
    .light-theme .br-badge-type { background: rgba(255, 149, 0, 0.2); color: #e65100; }
    .light-theme .br-no-data { color: var(--light-text-muted); }
    .light-theme .pagination button { border-color: var(--light-border-dark); background: #fff; color: var(--light-text-light); }
    .light-theme .pagination button:hover:not(:disabled) { border-color: var(--primary-blue); color: var(--primary-blue); }
    .light-theme .mark { background: rgba(255, 149, 0, 0.3); color: #e65100; }
  `;
  document.head.appendChild(style);
}

// 关闭模态窗口
function closeBearingRefModal() {
  const modal = document.getElementById('bearingRefModal');
  if (modal) modal.style.display = 'none';
}

// 点击模态框外部关闭
document.addEventListener('click', function (e) {
  const modal = document.getElementById('bearingRefModal');
  if (modal && e.target === modal) closeBearingRefModal();
});

// 构建筛选器
function buildBearingRefFilters() {
  const types = [...TYPES].sort();
  const brands = BRANDS.filter(b => b && b !== '-').sort();

  const typeSelect = document.getElementById('brTypeFilter');
  if (typeSelect) {
    typeSelect.innerHTML = '<option value="">全部类型</option>';
    types.forEach(t => { const o = document.createElement('option'); o.value = t; o.textContent = t; typeSelect.appendChild(o); });
  }

  const brandSelect = document.getElementById('brBrandFilter');
  if (brandSelect) {
    brandSelect.innerHTML = '<option value="">全部品牌</option>';
    brands.forEach(b => { const o = document.createElement('option'); o.value = b; o.textContent = b; brandSelect.appendChild(o); });
  }
}

// 解析范围
function brParseRange(str) {
  str = (str || '').trim();
  if (!str) return { min: null, max: null };
  const parts = str.split('~');
  if (parts.length === 1) {
    const v = parseFloat(parts[0]);
    return isNaN(v) ? { min: null, max: null } : { min: v, max: v };
  }
  const min = parseFloat(parts[0]);
  const max = parseFloat(parts[1]);
  return { min: isNaN(min) ? null : min, max: isNaN(max) ? null : max };
}

// 范围判断
function brInRange(val, min, max) {
  if (min === null && max === null) return true;
  const n = parseFloat(val);
  if (isNaN(n)) return false;
  if (min !== null && n < min) return false;
  if (max !== null && n > max) return false;
  return true;
}

// 搜索
function brDoSearch() {
  const q = (document.getElementById('brQ')?.value || '').trim().toUpperCase();
  const typeF = document.getElementById('brTypeFilter')?.value || '';
  const brandF = document.getElementById('brBrandFilter')?.value || '';
  const dR = brParseRange(document.getElementById('brDRange')?.value || '');
  const DR = brParseRange(document.getElementById('brDRange2')?.value || '');
  const BR = brParseRange(document.getElementById('brBRange')?.value || '');

  bearingRefFiltered = getBearingRefData().filter(row => {
    if (q) {
      const hay = (row.newNo + row.oldNo + row.refNo).toUpperCase();
      if (!hay.includes(q)) return false;
    }
    if (typeF && row.type !== typeF) return false;
    if (brandF && row.brand !== brandF) return false;
    if (!brInRange(row.d, dR.min, dR.max)) return false;
    if (!brInRange(row.D, DR.min, DR.max)) return false;
    if (!brInRange(row.B, BR.min, BR.max)) return false;
    return true;
  });

  if (bearingRefSortKey) brApplySort();
  bearingRefCurrentPage = 1;
  renderBearingRefPage();
}

// 重置
function brDoReset() {
  document.getElementById('brQ').value = '';
  document.getElementById('brDRange').value = '';
  document.getElementById('brDRange2').value = '';
  document.getElementById('brBRange').value = '';
  document.getElementById('brTypeFilter').value = '';
  document.getElementById('brBrandFilter').value = '';
  bearingRefFiltered = getBearingRefData();
  bearingRefSortKey = '';
  bearingRefSortDir = 1;
  document.querySelectorAll('.bearing-ref-table-wrap th').forEach(th => th.className = '');
  bearingRefCurrentPage = 1;
  renderBearingRefPage();
}

// 排序
function brSortBy(key) {
  if (bearingRefSortKey === key) bearingRefSortDir = -bearingRefSortDir;
  else { bearingRefSortKey = key; bearingRefSortDir = 1; }
  document.querySelectorAll('.bearing-ref-table-wrap th').forEach(th => th.className = '');
  const thEl = document.querySelector(`.bearing-ref-table-wrap th[onclick="brSortBy('${key}')"]`);
  if (thEl) thEl.className = bearingRefSortDir === 1 ? 'sorted-asc' : 'sorted-desc';
  brApplySort();
  bearingRefCurrentPage = 1;
  renderBearingRefPage();
}

function brApplySort() {
  const isNumKey = ['d', 'D', 'B'].includes(bearingRefSortKey);
  bearingRefFiltered.sort((a, b) => {
    let va = a[bearingRefSortKey] || '', vb = b[bearingRefSortKey] || '';
    if (isNumKey) { va = parseFloat(va) || 0; vb = parseFloat(vb) || 0; return bearingRefSortDir * (va - vb); }
    return bearingRefSortDir * va.localeCompare(vb, 'zh-CN');
  });
}

// 渲染分页
function renderBearingRefPage() {
  const total = bearingRefFiltered.length;
  document.getElementById('brTotalCount').textContent = total.toLocaleString();
  const totalPages = Math.max(1, Math.ceil(total / bearingRefPageSize));
  if (bearingRefCurrentPage > totalPages) bearingRefCurrentPage = totalPages;
  const start = (bearingRefCurrentPage - 1) * bearingRefPageSize;
  const end = Math.min(start + bearingRefPageSize, total);
  renderBearingRefTable(bearingRefFiltered.slice(start, end));
  renderBrPagination(totalPages);
}

function brOnPageSizeChange() {
  bearingRefPageSize = parseInt(document.getElementById('brPageSize').value);
  bearingRefCurrentPage = 1;
  renderBearingRefPage();
}

function brGoPage(n) {
  const totalPages = Math.ceil(bearingRefFiltered.length / bearingRefPageSize);
  if (n < 1 || n > totalPages) return;
  bearingRefCurrentPage = n;
  renderBearingRefPage();
  document.querySelector('.bearing-ref-table-wrap').scrollTop = 0;
}

function renderBrPagination(totalPages) {
  const pg = document.getElementById('brPagination');
  if (!pg) return;
  if (totalPages <= 1) { pg.innerHTML = ''; return; }
  const q = bearingRefCurrentPage;
  let html = `<button ${q === 1 ? 'disabled' : ''} onclick="brGoPage(${q - 1})">‹</button>`;
  const delta = 2;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= q - delta && i <= q + delta)) {
      html += `<button class="${i === q ? 'active' : ''}" onclick="brGoPage(${i})">${i}</button>`;
    } else if (i === q - delta - 1 || i === q + delta + 1) {
      html += `<span style="padding:0 4px;color:#64748b">…</span>`;
    }
  }
  html += `<button ${q === totalPages ? 'disabled' : ''} onclick="brGoPage(${q + 1})">›</button>`;
  pg.innerHTML = html;
}

function brEsc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function brHl(text) {
  const kw = (document.getElementById('brQ')?.value || '').trim().toUpperCase();
  if (!kw || !text) return brEsc(text);
  const upper = text.toUpperCase();
  const idx = upper.indexOf(kw);
  if (idx < 0) return brEsc(text);
  return brEsc(text.slice(0, idx)) + '<mark>' + brEsc(text.slice(idx, idx + kw.length)) + '</mark>' + brEsc(text.slice(idx + kw.length));
}

function renderBearingRefTable(data) {
  const tbody = document.getElementById('brTableBody');
  if (!data.length) { tbody.innerHTML = '<tr><td colspan="10" class="br-no-data">未找到符合条件的轴承数据</td></tr>'; return; }
  let html = '';
  for (const r of data) {
    html += `<tr>
      <td><b>${brHl(r.newNo)}</b></td>
      <td>${brHl(r.oldNo)}</td>
      <td>${brHl(r.refNo)}</td>
      <td>${brEsc(r.d)}</td>
      <td>${brEsc(r.D)}</td>
      <td>${brEsc(r.B)}</td>
      <td><span class="br-badge br-badge-type">${brEsc(r.type)}</span></td>
      <td><span class="br-badge">${brEsc(r.brand)}</span></td>
      <td style="font-size:12px;color:#475569">${brEsc(r.desc)}</td>
      <td style="font-size:12px;color:#94a3b8">${brEsc(r.remark)}</td>
    </tr>`;
  }
  tbody.innerHTML = html;
}
