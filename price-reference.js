// 价格查询功能模块

// 销售价数据处理变量
let fD_S = [], sCol_S = -1, sAsc_S = true, curPage_S = 1, ps_S = 50;
// 采购价数据处理变量
let fD_P = [], sCol_P = -1, sAsc_P = true, curPage_P = 1, ps_P = 50;

/**
 * 创建价格查询模态窗口
 */
function createPriceRefModal() {
  const modal = document.createElement('div');
  modal.id = 'priceRefModal';
  modal.className = 'price-ref-modal';
  modal.innerHTML = `
    <div class="price-ref-content">
      <div class="price-ref-header" style="padding: 10px 20px;">
        <button class="price-ref-close" onclick="closePriceRefModal()">&times;</button>
      </div>
      <div class="price-ref-tabs" style="background: linear-gradient(135deg, var(--primary-blue), var(--secondary-blue)); color: var(--text-light); padding: 0 50px;">
        <button class="price-ref-tab active" id="tab-sales" onclick="switchPriceTab('sales')">📊 销售价</button>
        <button class="price-ref-tab" id="tab-purchase" onclick="switchPriceTab('purchase')">📦 采购价</button>
      </div>
      <div id="panel-sales" class="price-ref-panel active">
        <div class="price-ref-search">
          <div class="price-ref-filter" style="flex: 1;">
            <input type="text" id="sSearch" placeholder="搜索客户名称、产品型号、销售员（空格或+分隔多个条件，=开头精确匹配）" oninput="applySales()" onkeydown="applySales()">
          </div>
          <div class="price-ref-btn-group">
            <button class="btn-secondary" onclick="resetSales()">⟳ 重置</button>
          </div>
        </div>
        <div class="price-ref-stats">
          筛选出 <strong id="rCount">0</strong> 条，均价 <span class="price-ref-red"><strong id="avgP">-</strong> 元</span>
          <select class="price-ref-page-size" id="pgSize" onchange="changePS()">
            <option value="50" selected>50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
          </select> 条/页
        </div>
        <div class="price-ref-table-wrap">
          <table>
            <thead>
              <tr>
                <th onclick="sortBy('sales',0)" data-c="0">配套客户 <span class="price-ref-si"></span></th>
                <th onclick="sortBy('sales',1)" data-c="1">产品型号 <span class="price-ref-si"></span></th>
                <th onclick="sortBy('sales',2)" data-c="2">单价 (元) <span class="price-ref-si"></span></th>
                <th onclick="sortBy('sales',3)" data-c="3">销售人员 <span class="price-ref-si"></span></th>
                <th style="cursor:default">备注</th>
              </tr>
            </thead>
            <tbody id="tb-sales"></tbody>
          </table>
        </div>
        <div class="price-ref-pagination">
          <div class="pagination" id="pg-sales"></div>
        </div>
      </div>
      <div id="panel-purchase" class="price-ref-panel">
        <div class="price-ref-search">
          <div class="price-ref-filter" style="flex: 1;">
            <input type="text" id="pSearch" placeholder="搜索供应商名称、货物名称、规格型号（空格或+分隔多个条件，=开头精确匹配）" oninput="applyPurchase()" onkeydown="applyPurchase()">
          </div>
          <div class="price-ref-btn-group">
            <button class="btn-secondary" onclick="resetPurchase()">⟳ 重置</button>
          </div>
        </div>
        <div class="price-ref-stats">
          筛选出 <strong id="prCount">0</strong> 条，均价 <span class="price-ref-red"><strong id="prAvg">-</strong> 元</span>
          <select class="price-ref-page-size" id="prPgSize" onchange="changePrPS()">
            <option value="50" selected>50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
          </select> 条/页
        </div>
        <div class="price-ref-table-wrap">
          <table>
            <thead>
              <tr>
                <th onclick="sortBy('purchase',0)" data-c="0">销方名称 <span class="price-ref-si"></span></th>
                <th onclick="sortBy('purchase',1)" data-c="1">货物名称 <span class="price-ref-si"></span></th>
                <th onclick="sortBy('purchase',2)" data-c="2">规格型号 <span class="price-ref-si"></span></th>
                <th onclick="sortBy('purchase',3)" data-c="3">含税采购价 (元) <span class="price-ref-si"></span></th>
              </tr>
            </thead>
            <tbody id="tb-purchase"></tbody>
          </table>
        </div>
        <div class="price-ref-pagination">
          <div class="pagination" id="pg-purchase"></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

/**
 * 关闭价格查询模态窗口
 */
function closePriceRefModal() {
  const modal = document.getElementById('priceRefModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * 切换价格标签页
 * @param {string} tab - 标签页名称 ('sales' 或 'purchase')
 */
function switchPriceTab(tab) {
  document.querySelectorAll('.price-ref-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.price-ref-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');
}

/**
 * 转义HTML特殊字符
 * @param {string} s - 要转义的字符串
 * @returns {string} 转义后的字符串
 */
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * 应用销售价筛选（支持多条件搜索）
 */
function applySales() {
  console.log('applySales 函数被调用');

  // 检查数据是否已加载
  if (typeof D_SALES === 'undefined') {
    console.error('销售数据 D_SALES 未定义');
    return;
  }

  const searchInput = document.getElementById('sSearch');
  if (!searchInput) {
    console.error('未找到 sSearch 搜索框');
    return;
  }

  const searchValue = searchInput.value.trim();
  console.log('搜索值:', searchValue);

  fD_S = [...D_SALES];

  if (searchValue) {
    const keywords = searchValue.split(/[+\s]+/).filter(k => k.trim());
    keywords.forEach(keyword => {
      const isExact = keyword.startsWith('=');
      const searchTerm = isExact ? keyword.substring(1).toLowerCase() : keyword.toLowerCase();
      fD_S = fD_S.filter(r => {
        // 遍历所有字段进行搜索
        const values = Object.values(r).map(v => String(v || '').toLowerCase());
        if (isExact) {
          // 精确匹配：任意字段完全等于搜索词
          return values.some(v => v === searchTerm);
        } else {
          // 模糊匹配：任意字段包含搜索词
          return values.some(v => v.includes(searchTerm));
        }
      });
    });
  }
  if (sCol_S >= 0) doSortSales(sCol_S);
  curPage_S = 1;
  updateSalesStats(); renderSales();
}

/**
 * 按指定列排序
 * @param {string} panel - 面板名称 ('sales' 或 'purchase')
 * @param {number} col - 列索引
 */
function sortBy(panel, col) {
  if (panel === 'sales') {
    document.querySelectorAll('#panel-sales th[data-c]').forEach(th => th.classList.remove('asc', 'desc'));
    if (sCol_S === col) sAsc_S = !sAsc_S; else { sCol_S = col; sAsc_S = true; }
    document.querySelector(`#panel-sales th[data-c="${col}"]`).classList.add(sAsc_S ? 'asc' : 'desc');
    doSortSales(col); renderSales();
  } else {
    document.querySelectorAll('#panel-purchase th[data-c]').forEach(th => th.classList.remove('asc', 'desc'));
    if (sCol_P === col) sAsc_P = !sAsc_P; else { sCol_P = col; sAsc_P = true; }
    document.querySelector(`#panel-purchase th[data-c="${col}"]`).classList.add(sAsc_P ? 'asc' : 'desc');
    doSortPurchase(col); renderPurchase();
  }
}

/**
 * 销售价排序
 * @param {number} col - 列索引
 */
function doSortSales(col) {
  const keys = ['配套客户', '产品型号', '单价', '销售人员'];
  const k = keys[col];
  fD_S.sort((a, b) => {
    let va = a[k], vb = b[k];
    if (k === '单价') { va = parseFloat(va) || 0; vb = parseFloat(vb) || 0; return sAsc_S ? va - vb : vb - va; }
    return sAsc_S ? String(va || '').localeCompare(String(vb || ''), 'zh-CN') : String(vb || '').localeCompare(String(va || ''), 'zh-CN');
  });
}

/**
 * 更新销售价统计信息
 */
function updateSalesStats() {
  document.getElementById('rCount').textContent = fD_S.length;
  const prices = fD_S.map(r => parseFloat(r['单价'])).filter(v => !isNaN(v));
  document.getElementById('avgP').textContent = prices.length ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : '-';
}

/**
 * 渲染销售价表格
 */
function renderSales() {
  const tb = document.getElementById('tb-sales');
  const tp = Math.ceil(fD_S.length / ps_S) || 1;
  if (curPage_S > tp) curPage_S = tp;
  const st = (curPage_S - 1) * ps_S, pd = fD_S.slice(st, st + ps_S);
  if (!pd.length) {
    tb.innerHTML = '<tr><td colspan="5" class="price-ref-no-data">🔍 暂无符合条件的数据</td></tr>';
  } else {
    tb.innerHTML = pd.map((r, i) => {
      const pv = parseFloat(r['单价']),
        ps2 = isNaN(pv) ? esc(r['单价'] || '-') : '¥ ' + pv.toFixed(2),
        sp = esc(String(r['销售人员'] || '').trim());
      return `<tr><td class="price-ref-cust">${esc(r['配套客户'] || '')}</td><td class="price-ref-prod">${esc(r['产品型号'] || '')}</td><td class="price-ref-price">${ps2}</td><td class="price-ref-sp"><span class="price-ref-sp-badge">${sp || '-'}</span></td><td class="price-ref-remark">${esc(r['备注'] || '')}</td></tr>`;
    }).join('');
  }
  renderPg_S(tp);
}

/**
 * 渲染销售价分页
 * @param {number} tp - 总页数
 */
function renderPg_S(tp) {
  const el = document.getElementById('pg-sales');
  if (tp <= 1) { el.innerHTML = ''; return; }
  const q = curPage_S;
  let h = `<button ${q === 1 ? 'disabled' : ''} onclick="gp_S(${q - 1})">&lt;</button>`;
  const delta = 2;
  for (let i = 1; i <= tp; i++) {
    if (i === 1 || i === tp || (i >= q - delta && i <= q + delta)) {
      h += `<button class="${i === q ? 'active' : ''}" onclick="gp_S(${i})")">${i}</button>`;
    } else if (i === q - delta - 1 || i === q + delta + 1) {
      h += `<span style="padding:0 4px;color:var(--text-muted)">…</span>`;
    }
  }
  h += `<button ${q === tp ? 'disabled' : ''} onclick="gp_S(${q + 1})">&gt;</button>`;
  el.innerHTML = h;
}

/**
 * 跳转到指定销售价页码
 * @param {number} p - 页码
 */
function gp_S(p) {
  const tp = Math.ceil(fD_S.length / ps_S) || 1;
  if (p < 1 || p > tp) return;
  curPage_S = p;
  renderSales();
  document.querySelector('#panel-sales .price-ref-table-wrap').scrollIntoView({ behavior: 'smooth' });
}

/**
 * 改变销售价每页显示数量
 */
function changePS() {
  ps_S = parseInt(document.getElementById('pgSize').value);
  curPage_S = 1;
  renderSales();
}

/**
 * 重置销售价筛选
 */
function resetSales() {
  const searchInput = document.getElementById('sSearch');
  if (searchInput) searchInput.value = '';
  sCol_S = -1; sAsc_S = true;
  document.querySelectorAll('#panel-sales th[data-c]').forEach(th => th.classList.remove('asc', 'desc'));
  fD_S = [...D_SALES]; curPage_S = 1; updateSalesStats(); renderSales();
}

/**
 * 应用采购价筛选（支持多条件搜索）
 */
function applyPurchase() {
  console.log('applyPurchase 函数被调用');

  // 检查数据是否已加载
  if (typeof D_PURCH === 'undefined') {
    console.error('采购数据 D_PURCH 未定义');
    return;
  }

  const searchInput = document.getElementById('pSearch');
  if (!searchInput) {
    console.error('未找到 pSearch 搜索框');
    return;
  }

  const searchValue = searchInput.value.trim();
  console.log('搜索值:', searchValue);

  fD_P = [...D_PURCH];

  if (searchValue) {
    const keywords = searchValue.split(/[+\s]+/).filter(k => k.trim());
    keywords.forEach(keyword => {
      const isExact = keyword.startsWith('=');
      const searchTerm = isExact ? keyword.substring(1).toLowerCase() : keyword.toLowerCase();
      fD_P = fD_P.filter(r => {
        // 遍历所有字段进行搜索
        const values = Object.values(r).map(v => String(v || '').toLowerCase());
        if (isExact) {
          // 精确匹配：任意字段完全等于搜索词
          return values.some(v => v === searchTerm);
        } else {
          // 模糊匹配：任意字段包含搜索词
          return values.some(v => v.includes(searchTerm));
        }
      });
    });
  }
  if (sCol_P >= 0) doSortPurchase(sCol_P);
  curPage_P = 1; updatePurchaseStats(); renderPurchase();
}

/**
 * 采购价排序
 * @param {number} col - 列索引
 */
function doSortPurchase(col) {
  const keys = ['销方名称', '货物名称', '规格型号', '含税采购价'];
  const k = keys[col];
  fD_P.sort((a, b) => {
    let va = a[k], vb = b[k];
    if (k === '含税采购价') { va = parseFloat(va) || 0; vb = parseFloat(vb) || 0; return sAsc_P ? va - vb : vb - va; }
    return sAsc_P ? String(va || '').localeCompare(String(vb || ''), 'zh-CN') : String(vb || '').localeCompare(String(va || ''), 'zh-CN');
  });
}

/**
 * 更新采购价统计信息
 */
function updatePurchaseStats() {
  document.getElementById('prCount').textContent = fD_P.length;
  const prices = fD_P.map(r => parseFloat(r['含税采购价'])).filter(v => !isNaN(v));
  document.getElementById('prAvg').textContent = prices.length ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : '-';
}

/**
 * 渲染采购价表格
 */
function renderPurchase() {
  const tb = document.getElementById('tb-purchase');
  const tp = Math.ceil(fD_P.length / ps_P) || 1;
  if (curPage_P > tp) curPage_P = tp;
  const st = (curPage_P - 1) * ps_P, pd = fD_P.slice(st, st + ps_P);
  if (!pd.length) {
    tb.innerHTML = '<tr><td colspan="4" class="price-ref-no-data">🔍 暂无符合条件的数据</td></tr>';
  } else {
    tb.innerHTML = pd.map((r, i) => {
      const pv = parseFloat(r['含税采购价']),
        pvStr = isNaN(pv) ? esc(r['含税采购价'] || '-') : '¥ ' + pv.toFixed(2);
      return `<tr><td class="price-ref-supplier">${esc(r['销方名称'] || '')}</td><td class="price-ref-goods">${esc(r['货物名称'] || '')}</td><td class="price-ref-spec">${esc(r['规格型号'] || '')}</td><td class="price-ref-price">${pvStr}</td></tr>`;
    }).join('');
  }
  renderPg_P(tp);
}

/**
 * 渲染采购价分页
 * @param {number} tp - 总页数
 */
function renderPg_P(tp) {
  const el = document.getElementById('pg-purchase');
  if (tp <= 1) { el.innerHTML = ''; return; }
  const q = curPage_P;
  let h = `<button ${q === 1 ? 'disabled' : ''} onclick="gp_P(${q - 1})">&lt;</button>`;
  const delta = 2;
  for (let i = 1; i <= tp; i++) {
    if (i === 1 || i === tp || (i >= q - delta && i <= q + delta)) {
      h += `<button class="${i === q ? 'active' : ''}" onclick="gp_P(${i})")">${i}</button>`;
    } else if (i === q - delta - 1 || i === q + delta + 1) {
      h += `<span style="padding:0 4px;color:var(--text-muted)">…</span>`;
    }
  }
  h += `<button ${q === tp ? 'disabled' : ''} onclick="gp_P(${q + 1})">&gt;</button>`;
  el.innerHTML = h;
}

/**
 * 跳转到指定采购价页码
 * @param {number} p - 页码
 */
function gp_P(p) {
  const tp = Math.ceil(fD_P.length / ps_P) || 1;
  if (p < 1 || p > tp) return;
  curPage_P = p;
  renderPurchase();
  document.querySelector('#panel-purchase .price-ref-table-wrap').scrollIntoView({ behavior: 'smooth' });
}

/**
 * 改变采购价每页显示数量
 */
function changePrPS() {
  ps_P = parseInt(document.getElementById('prPgSize').value);
  curPage_P = 1;
  renderPurchase();
}

/**
 * 重置采购价筛选
 */
function resetPurchase() {
  const searchInput = document.getElementById('pSearch');
  if (searchInput) searchInput.value = '';
  sCol_P = -1; sAsc_P = true;
  document.querySelectorAll('#panel-purchase th[data-c]').forEach(th => th.classList.remove('asc', 'desc'));
  fD_P = [...D_PURCH]; curPage_P = 1; updatePurchaseStats(); renderPurchase();
}

/**
 * 初始化价格查询数据
 */
function initPriceReference() {
  createPriceRefModal();

  // 初始化数据
  if (typeof D_SALES !== 'undefined') {
    fD_S = [...D_SALES];
    console.log('销售数据加载成功，共', D_SALES.length, '条');
  } else {
    console.error('销售数据 D_SALES 未定义');
    fD_S = [];
  }
  if (typeof D_PURCH !== 'undefined') {
    fD_P = [...D_PURCH];
    console.log('采购数据加载成功，共', D_PURCH.length, '条');
  } else {
    console.error('采购数据 D_PURCH 未定义');
    fD_P = [];
  }

  // 绑定事件
  const sSearchInput = document.getElementById('sSearch');
  if (sSearchInput) {
    sSearchInput.addEventListener('input', applySales);
    sSearchInput.addEventListener('change', applySales);
    console.log('销售搜索框事件绑定成功');
  } else {
    console.error('未找到 sSearch 元素');
  }
  const pSearchInput = document.getElementById('pSearch');
  if (pSearchInput) {
    pSearchInput.addEventListener('input', applyPurchase);
    pSearchInput.addEventListener('change', applyPurchase);
    console.log('采购搜索框事件绑定成功');
  } else {
    console.error('未找到 pSearch 元素');
  }

  // 初始渲染
  applySales();
  applyPurchase();
}

/**
 * 打开价格查询
 */
function openPriceReference() {
  // 检查是否已经验证过密码
  if (typeof isPricePasswordVerified === 'undefined' || !isPricePasswordVerified) {
    // 显示密码输入界面
    showPricePasswordInput(function () {
      // 密码验证成功后打开价格参考
      if (!document.getElementById('priceRefModal')) {
        initPriceReference();
      }
      document.getElementById('priceRefModal').style.display = 'flex';
    });
  } else {
    // 密码已经验证过，直接打开
    if (!document.getElementById('priceRefModal')) {
      initPriceReference();
    }
    document.getElementById('priceRefModal').style.display = 'flex';
  }
}

// 导出全局函数
window.openPriceReference = openPriceReference;
window.closePriceRefModal = closePriceRefModal;
window.switchPriceTab = switchPriceTab;
window.sortBy = sortBy;
window.gp_S = gp_S;
window.changePS = changePS;
window.resetSales = resetSales;
window.gp_P = gp_P;
window.changePrPS = changePrPS;
window.resetPurchase = resetPurchase;