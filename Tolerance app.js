/**
 * app.js - UI交互与公差带图示
 */

// ============================================================
// 全局状态
// ============================================================
let currentHole = { es: null, ei: null };
let currentShaft = { es: null, ei: null };
let currentFitType = 'hole_basis'; // 'hole_basis' | 'shaft_basis' | 'custom'
let currentFitClass = 'clearance'; // 'clearance' | 'transition' | 'interference'
let max_gyl = 0;

// ============================================================
// 初始化
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initMaterialSelect();
  initFitSelectors();
  bindEvents();
  // 默认值
  document.getElementById('inputD').value = '100';
  switchMode('hole_basis');
  switchFitClass('clearance');
});

function initMaterialSelect() {
  const sel = document.getElementById('materialSel');
  sel.innerHTML = '';
  for (const name of Object.keys(MATERIAL_COEFF)) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  }
  sel.value = '碳钢';
  document.getElementById('inputCoeff').value = MATERIAL_COEFF['碳钢'];
}

function initFitSelectors() {
  updateFitSelectors();
}

// ============================================================
// 事件绑定
// ============================================================
function bindEvents() {
  document.getElementById('inputD').addEventListener('input', onParamChange);
  document.getElementById('inputH').addEventListener('input', onParamChange);
  document.getElementById('inputS').addEventListener('input', onParamChange);
  document.getElementById('inputDCustom').addEventListener('input', onCustomInputChange);
  document.getElementById('selectH').addEventListener('change', onSelectChange);
  document.getElementById('selectS').addEventListener('change', onSelectChange);
  document.getElementById('materialSel').addEventListener('change', onMaterialChange);
  document.getElementById('inputCoeff').addEventListener('input', onParamChange);

  // 模式切换
  document.querySelectorAll('input[name="basisMode"]').forEach(r => {
    r.addEventListener('change', () => {
      const mode = document.querySelector('input[name="basisMode"]:checked').value;
      switchMode(mode);
    });
  });

  // 配合类型切换
  document.querySelectorAll('input[name="fitClass"]').forEach(r => {
    r.addEventListener('change', () => {
      const fc = document.querySelector('input[name="fitClass"]:checked').value;
      switchFitClass(fc);
      updateFitSelectors();
      onSelectChange();
    });
  });

  // 键盘类型切换
  document.querySelectorAll('input[name="keyboardType"]').forEach(r => {
    r.addEventListener('change', () => {
      const keyboardType = document.querySelector('input[name="keyboardType"]:checked').value;
      switchKeyboard(keyboardType);
    });
  });

  // 绑定键盘按钮点击事件
  bindKeyboardEvents();
}

// 键盘类型切换
function switchKeyboard(keyboardType) {
  // 隐藏所有键盘
  document.getElementById('shaftKeyboard').style.display = 'none';
  document.getElementById('holeBasisKeyboard').style.display = 'none';
  document.getElementById('shaftBasisKeyboard').style.display = 'none';
  document.getElementById('holeKeyboard').style.display = 'none';

  // 显示选中的键盘
  if (keyboardType === 'shaft') {
    document.getElementById('shaftKeyboard').style.display = '';
  } else if (keyboardType === 'hole_basis') {
    document.getElementById('holeBasisKeyboard').style.display = '';
  } else if (keyboardType === 'shaft_basis') {
    document.getElementById('shaftBasisKeyboard').style.display = '';
  } else if (keyboardType === 'hole') {
    document.getElementById('holeKeyboard').style.display = '';
  }
}

// 绑定键盘按钮点击事件
function bindKeyboardEvents() {
  // 轴公差带键盘
  document.querySelectorAll('#shaftKeyboard .keyboard-key').forEach(btn => {
    btn.addEventListener('click', function () {
      const toleranceCode = this.textContent;
      document.getElementById('inputS').value = toleranceCode;
      document.getElementById('inputS').dispatchEvent(new Event('input'));
    });
  });

  // 基孔制优先配合键盘
  document.querySelectorAll('#holeBasisKeyboard .keyboard-key').forEach(btn => {
    btn.addEventListener('click', function () {
      const toleranceCode = this.textContent;
      document.getElementById('inputS').value = toleranceCode;
      document.getElementById('inputS').dispatchEvent(new Event('input'));
    });
  });

  // 基轴制优先配合键盘
  document.querySelectorAll('#shaftBasisKeyboard .keyboard-key').forEach(btn => {
    btn.addEventListener('click', function () {
      const toleranceCode = this.textContent;
      document.getElementById('inputH').value = toleranceCode;
      document.getElementById('inputH').dispatchEvent(new Event('input'));
    });
  });

  // 孔公差带键盘
  document.querySelectorAll('#holeKeyboard .keyboard-key').forEach(btn => {
    btn.addEventListener('click', function () {
      const toleranceCode = this.textContent;
      document.getElementById('inputH').value = toleranceCode;
      document.getElementById('inputH').dispatchEvent(new Event('input'));
    });
  });
}

function onSelectChange() {
  const mode = document.querySelector('input[name="basisMode"]:checked').value;
  if (mode === 'hole_basis') {
    const selH = document.getElementById('selectH').value;
    const selS = document.getElementById('selectS').value;
    const cleanH = selH.replace(/[*']/g, '');
    const cleanS = selS.replace(/[*']/g, '');
    document.getElementById('inputH').value = cleanH;
    document.getElementById('inputS').value = cleanS;
  } else if (mode === 'shaft_basis') {
    const selH = document.getElementById('selectH').value;
    const selS = document.getElementById('selectS').value;
    const cleanH = selH.replace(/[*']/g, '');
    const cleanS = selS.replace(/[*']/g, '');
    document.getElementById('inputH').value = cleanH;
    document.getElementById('inputS').value = cleanS;
  }
  onParamChange();
}

function onMaterialChange() {
  const name = document.getElementById('materialSel').value;
  if (MATERIAL_COEFF[name] !== undefined) {
    document.getElementById('inputCoeff').value = MATERIAL_COEFF[name];
  }
  onParamChange();
}

function onParamChange() {
  calculate();
}

function onCustomInputChange() {
  const customD = document.getElementById('inputDCustom').value;
  document.getElementById('inputD').value = customD;
  calculate();
}

// ============================================================
// 模式切换
// ============================================================
function switchMode(mode) {
  currentFitType = mode;
  const customRow = document.getElementById('customRow');
  const toleranceRow = document.getElementById('toleranceRow');

  if (mode === 'custom') {
    toleranceRow.style.display = 'none';
    customRow.style.display = '';
    document.getElementById('inputDCustom').value = document.getElementById('inputD').value;
    document.getElementById('inputH').value = 'H7';
    document.getElementById('inputS').value = 'k6';
  } else {
    toleranceRow.style.display = '';
    customRow.style.display = 'none';
    updateFitSelectors();
    onSelectChange();
  }
  calculate();
}

function switchFitClass(fc) {
  currentFitClass = fc;
  const interferencePanel = document.getElementById('interferencePanel');
  interferencePanel.style.display = (fc === 'interference') ? '' : 'none';
}

function updateFitSelectors() {
  const mode = document.querySelector('input[name="basisMode"]:checked').value;
  const fc = document.querySelector('input[name="fitClass"]:checked').value;

  const selectH = document.getElementById('selectH');
  const selectS = document.getElementById('selectS');

  if (mode === 'hole_basis') {
    // 孔固定H系列，轴下拉切换
    populateSelect(selectH, FIT_LISTS.hole_H_list, 'H7');
    selectH.disabled = false;

    let shaftList;
    if (fc === 'clearance') shaftList = FIT_LISTS.hole_basis_clearance;
    else if (fc === 'transition') shaftList = FIT_LISTS.hole_basis_transition;
    else shaftList = FIT_LISTS.hole_basis_interference;
    populateSelect(selectS, shaftList, shaftList[0]);

  } else if (mode === 'shaft_basis') {
    // 轴固定h系列，孔下拉切换
    populateSelect(selectS, FIT_LISTS.shaft_h_list, 'h6');
    selectS.disabled = false;

    let holeList;
    if (fc === 'clearance') holeList = FIT_LISTS.shaft_basis_clearance;
    else if (fc === 'transition') holeList = FIT_LISTS.shaft_basis_transition;
    else holeList = FIT_LISTS.shaft_basis_interference;
    populateSelect(selectH, holeList, holeList[0]);
  }
}

function populateSelect(sel, items, defaultVal) {
  sel.innerHTML = '';
  for (const item of items) {
    const opt = document.createElement('option');
    opt.value = item;
    opt.textContent = item;
    sel.appendChild(opt);
  }
  if (defaultVal) sel.value = defaultVal;
}

// ============================================================
// 主计算函数
// ============================================================
function calculate() {
  const D = parseFloat(document.getElementById('inputD').value);
  let hCode = document.getElementById('inputH').value.trim().toUpperCase();
  let sCode = document.getElementById('inputS').value.trim().toLowerCase();

  // 重置显示
  setHoleDisplay(null);
  setShaftDisplay(null);
  setFitResult(null);
  setTempResult(null);

  if (isNaN(D) || D <= 0) return;

  // 计算孔
  if (hCode) {
    const hDev = calcHoleDeviation(hCode, D);
    currentHole = hDev;
    setHoleDisplay(hDev);
  }

  // 计算轴
  if (sCode) {
    const sDev = calcShaftDeviation(sCode, D);
    currentShaft = sDev;
    setShaftDisplay(sDev);
  }

  // 计算配合
  if (currentHole && currentShaft) {
    const fitResult = calcFitResult(currentHole, currentShaft);
    setFitResult(fitResult);

    // 过盈配合温度计算
    if (fitResult.type === 'interference') {
      max_gyl = fitResult.max;
    } else if (fitResult.type === 'transition') {
      max_gyl = fitResult.maxInterference || 0;
    } else {
      max_gyl = 0;
    }
    calcAndShowTemp(D);
  }

  // 绘制公差带图
  drawToleranceDiagram();
}

// ============================================================
// 显示更新函数
// ============================================================
function setHoleDisplay(dev) {
  const el = document.getElementById('holeDevDisplay');
  const labelH = document.getElementById('labelHCode');
  const hCode = document.getElementById('inputH').value.trim().toUpperCase();
  labelH.textContent = hCode || 'H';

  if (!dev) {
    el.innerHTML = '<span style="color:#bbb;font-size:16px;">---</span>';
    el.classList.add('invalid');
    return;
  }
  el.classList.remove('invalid');
  const { esStr, eiStr } = formatDeviation(dev.es, dev.ei);
  el.innerHTML = '<span class="dv-es">ES &nbsp;' + esStr + '</span>'
    + '<span class="dv-ei">EI &nbsp;' + eiStr + '</span>';
}

function setShaftDisplay(dev) {
  const el = document.getElementById('shaftDevDisplay');
  const labelS = document.getElementById('labelSCode');
  const sCode = document.getElementById('inputS').value.trim().toLowerCase();
  labelS.textContent = sCode || 'h';

  if (!dev) {
    el.innerHTML = '<span style="color:#bbb;font-size:16px;">---</span>';
    el.classList.add('invalid');
    return;
  }
  el.classList.remove('invalid');
  const { esStr, eiStr } = formatDeviation(dev.es, dev.ei);
  el.innerHTML = '<span class="dv-es">es &nbsp;' + esStr + '</span>'
    + '<span class="dv-ei">ei &nbsp;' + eiStr + '</span>';
}

function setFitResult(result) {
  const el1 = document.getElementById('fitLabel1');
  const el2 = document.getElementById('fitLabel2');
  const el3 = document.getElementById('fitLabel3');
  const el4 = document.getElementById('fitLabel4');

  if (!result) {
    el1.textContent = '最大间隙';
    el2.textContent = '最小间隙';
    el3.textContent = '---';
    el4.textContent = '---';
    el3.classList.add('invalid');
    el4.classList.add('invalid');
    return;
  }
  el3.classList.remove('invalid');
  el4.classList.remove('invalid');

  if (result.type === 'clearance') {
    el1.textContent = '最大间隙';
    el2.textContent = '最小间隙';
    el3.textContent = fmtNum(result.max);
    el4.textContent = fmtNum(result.min);
  } else if (result.type === 'interference') {
    el1.textContent = '最大过盈';
    el2.textContent = '最小过盈';
    el3.textContent = fmtNum(result.max);
    el4.textContent = fmtNum(result.min);
  } else {
    el1.textContent = '最大间隙';
    el2.textContent = '最大过盈';
    el3.textContent = fmtNum(result.maxClearance);
    el4.textContent = fmtNum(result.maxInterference);
  }
}

function setTempResult(text) {
  const el = document.getElementById('tempResult');
  el.textContent = text || '';
}

function calcAndShowTemp(D) {
  const fc = document.querySelector('input[name="fitClass"]:checked').value;
  if (fc !== 'interference') { setTempResult(''); return; }
  if (max_gyl <= 0) { setTempResult(''); return; }

  const coeff = parseFloat(document.getElementById('inputCoeff').value);
  if (isNaN(coeff) || coeff <= 0) { setTempResult(''); return; }

  const res = calcAssemblyTemp(D, max_gyl, coeff);
  if (res.error) {
    setTempResult(res.error);
  } else {
    setTempResult(
      '孔零件加热至 ' + res.heatTemp + ' ℃，或轴零件冷缩至 -' + Math.abs(res.coolTemp) + ' ℃，温差需满足 ' + res.deltaT + ' ℃'
    );
  }
}

function fmtNum(v) {
  if (v === null || v === undefined) return '---';
  return parseFloat(v.toFixed(6)).toString();
}

// ============================================================
// 公差带图示绘制（Canvas）
// ============================================================
function drawToleranceDiagram() {
  const canvas = document.getElementById('toleranceCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // 布局参数
  const zeroY = H / 2;       // 零线 Y 坐标
  const holeX = W * 0.22;    // 孔公差带中心X
  const shaftX = W * 0.72;   // 轴公差带中心X
  const barW = 60;            // 公差带宽度

  // 绘制背景和零线
  drawBackground(ctx, W, H, zeroY, holeX, shaftX, barW);

  // 计算统一的缩放比例，确保孔和轴同步缩放
  let scale = 300; // 默认缩放比例
  if (currentHole || currentShaft) {
    // 计算所有偏差的最大值
    let maxDeviation = 0;
    if (currentHole) {
      maxDeviation = Math.max(maxDeviation, Math.abs(currentHole.es), Math.abs(currentHole.ei));
    }
    if (currentShaft) {
      maxDeviation = Math.max(maxDeviation, Math.abs(currentShaft.es), Math.abs(currentShaft.ei));
    }

    // 计算基于最大偏差值的缩放比例
    if (maxDeviation > 0) {
      const requiredScale = (H * 0.4) / maxDeviation;
      scale = Math.min(requiredScale, 5000);
    }
  }

  // 孔公差带
  if (currentHole) {
    drawBar(ctx, holeX, barW, zeroY, currentHole.es, currentHole.ei, H,
      '#4a90d9', '#2c6fad', '孔', scale);
  }

  // 轴公差带
  if (currentShaft) {
    drawBar(ctx, shaftX, barW, zeroY, currentShaft.es, currentShaft.ei, H,
      '#e8734a', '#c25630', '轴', scale);
  }
}

function drawBackground(ctx, W, H, zeroY, holeX, shaftX, barW) {
  // 背景
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, W, H);

  // 区域分隔
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(holeX - barW / 2 - 30, 5, barW + 60, H - 10);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(shaftX - barW / 2 - 30, 5, barW + 60, H - 10);

  // 零线
  ctx.save();
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 3]);
  ctx.beginPath();
  ctx.moveTo(10, zeroY);
  ctx.lineTo(W - 10, zeroY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // 零线标注
  ctx.fillStyle = '#555';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('0', 12, zeroY - 4);
}

function drawBar(ctx, cx, barW, zeroY, es, ei, H, fillColor, strokeColor, label, scale) {
  // 使用传入的统一缩放比例

  const esY = zeroY - es * scale;
  const eiY = zeroY - ei * scale;
  const barH = Math.abs(esY - eiY);
  const barTop = Math.min(esY, eiY);

  // 绘制公差带矩形
  ctx.save();
  ctx.fillStyle = fillColor + 'cc';  // 半透明
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.fillRect(cx - barW / 2, barTop, barW, barH);
  ctx.strokeRect(cx - barW / 2, barTop, barW, barH);
  ctx.restore();

  // 标签（居中）
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const midY = barTop + barH / 2;
  ctx.fillText(label, cx, midY);
  ctx.restore();

  // 偏差标注
  ctx.save();
  ctx.fillStyle = '#333';
  ctx.font = '11px Arial';
  ctx.textAlign = 'left';
  const { esStr, eiStr } = formatDeviation(es, ei);
  ctx.fillText(esStr, cx + barW / 2 + 4, esY + 3);
  ctx.fillText(eiStr, cx + barW / 2 + 4, eiY + 3);
  ctx.restore();

  // 上下偏差横线
  ctx.save();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - barW / 2 - 6, esY);
  ctx.lineTo(cx + barW / 2 + 6, esY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - barW / 2 - 6, eiY);
  ctx.lineTo(cx + barW / 2 + 6, eiY);
  ctx.stroke();
  ctx.restore();
}

/**
 * 根据公差范围和可用高度计算合适的缩放比例
 */
function getScale(range, maxPx) {
  if (!range || range === 0) return 300;
  const raw = maxPx / range;
  // 防止过大
  return Math.min(raw, 5000);
}


