// 钢球价格吨粒换算器
function openBallPriceCalculator() {
  // 检查是否已存在模态框
  let modal = document.getElementById('ballPriceModal');
  if (!modal) {
    createBallPriceModal();
    modal = document.getElementById('ballPriceModal');
  }
  modal.style.display = 'flex';

  // 初始化钢球数据和事件监听器
  initializeBallPriceCalculator();
}

function createBallPriceModal() {
  const modalHTML = `
    <div id="ballPriceModal" class="price-ref-modal">
      <div class="price-ref-content">
        <div class="price-ref-header" style="padding: 10px 20px;">
          <button class="price-ref-close" onclick="closeBallPriceModal()">&times;</button>
        </div>
        <div class="price-ref-tabs" style="background: linear-gradient(135deg, var(--primary-blue), var(--secondary-blue)); color: var(--text-light); padding: 0 20px; justify-content: center;">
          <h2 style="margin: 0; padding: 15px 0; font-size: 18px; text-align: center;">钢球价格吨粒换算器</h2>
        </div>
        
        <div class="price-ref-panel active" style="padding: 20px;">
          <!-- ① 选直径 -->
          <div style="margin-bottom: 20px;">
            <div class="section-label" style="font-size: 14px; font-weight: 600; margin-bottom: 10px; color: var(--text-light);">① 选择钢球直径（mm）</div>
            <div class="diameter-list" id="diameterList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px; max-height: 200px; overflow-y: auto; border: 1px solid var(--primary-blue); border-radius: 8px; padding: 12px; background: rgba(255, 255, 255, 0.05);"></div>
          </div>
          
          <!-- ② 算价格 -->
          <div style="margin-bottom: 20px;">
            <div class="section-label" style="font-size: 14px; font-weight: 600; margin-bottom: 10px; color: var(--text-light);">② 钢球价格换算</div>
            
            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
              <div style="flex: 1; background: rgba(0, 168, 255, 0.1); border: 1px solid var(--primary-blue); border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <div style="font-size: 12px; color: var(--text-secondary);">直径：</div>
                <div style="font-size: 18px; font-weight: 700; color: var(--text-light);" id="selDw">—</div>
              </div>
              <div style="flex: 1; background: rgba(0, 168, 255, 0.1); border: 1px solid var(--primary-blue); border-radius: 8px; padding: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <div style="font-size: 12px; color: var(--text-secondary);">重量/g：</div>
                <div style="font-size: 18px; font-weight: 700; color: var(--text-light);" id="selWeight">—</div>
              </div>
            </div>
            
            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
              <div style="flex: 1;">
                <label style="font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 5px;">每吨价格（元）</label>
                <input type="number" id="tonPrice" placeholder="输入每吨价格" min="0" step="100" style="width: 100%; padding: 10px; border: 1px solid var(--primary-blue); border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: var(--text-light); font-size: 14px;">
              </div>
              <div style="flex: 1;">
                <label style="font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 5px;">万粒价格（元）</label>
                <input type="number" id="wanPrice" placeholder="输入万粒价格" min="0" step="1" style="width: 100%; padding: 10px; border: 1px solid var(--primary-blue); border-radius: 8px; background: rgba(255, 255, 255, 0.1); color: var(--text-light); font-size: 14px;">
              </div>
            </div>
            
            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
              <button id="calcTon2Wan" class="btn-secondary" style="flex: 1; padding: 10px; background: var(--primary-blue); color: var(--text-light); border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">计算万粒价格</button>
              <button id="calcWan2Ton" class="btn-secondary" style="flex: 1; padding: 10px; background: var(--primary-blue); color: var(--text-light); border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease;">计算每吨价格</button>
            </div>
            
            <div style="background: rgba(0, 168, 255, 0.1); border: 1px solid var(--primary-blue); border-radius: 8px; padding: 16px; display: flex; align-items: center; justify-content: center; gap: 10px;">
              <div style="font-size: 14px; color: var(--text-secondary);" id="resultLabel">计算结果</div>
              <div style="font-size: 24px; font-weight: 800; color: var(--primary-blue);" id="resultValue">—</div>
              <div style="font-size: 14px; color: var(--text-secondary);" id="resultUnit"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // 添加模态框样式
  const style = document.createElement('style');
  style.textContent = `
    .diameter-list button {
      padding: 6px 12px;
      border: 1px solid var(--primary-blue);
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.1);
      font-size: 13px;
      color: var(--text-light);
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 60px;
      text-align: center;
    }
    .diameter-list button:hover {
      background: rgba(0, 168, 255, 0.3);
      border-color: var(--primary-blue);
    }
    .diameter-list button.selected {
      background: var(--primary-blue);
      color: var(--text-light);
      border-color: var(--primary-blue);
    }
    .btn-secondary:hover {
      background: var(--secondary-blue) !important;
    }
  `;
  document.head.appendChild(style);
}

function closeBallPriceModal() {
  const modal = document.getElementById('ballPriceModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function initializeBallPriceCalculator() {
  const DIAMETERS = [
    4.7625, 5.95312, 6.35, 6.74688, 7.9375, 8.73125, 9.525, 10.31875,
    11.1125, 11.90625, 12, 12.30312, 12.7, 13.49375, 14.2875, 15.08125, 17.4625
  ];

  let selectedDw = null;
  let selectedWeight = null;

  // 计算钢球重量：7.81*4/3*圆周率Π*(钢球直径/2)^3/1000
  function calculateWeight(dw) {
    return 7.81 * 4 / 3 * Math.PI * Math.pow(dw / 2, 3) / 1000;
  }

  // 构建直径列表
  const list = document.getElementById('diameterList');
  if (list) {
    list.innerHTML = ''; // 清空现有内容
    DIAMETERS.forEach(dw => {
      const btn = document.createElement('button');
      btn.textContent = dw;
      btn.dataset.dw = dw;
      btn.addEventListener('click', () => select(dw, btn));
      list.appendChild(btn);
    });

    // 添加自定义输入选项
    const customInputDiv = document.createElement('div');
    customInputDiv.style.display = 'flex';
    customInputDiv.style.gap = '8px';
    customInputDiv.style.alignItems = 'center';

    const input = document.createElement('input');
    input.type = 'number';
    input.placeholder = '自定义直径';
    input.min = '0';
    input.step = '0.0001';
    input.style.flex = '1';
    input.style.minWidth = '100px';
    input.style.height = '30px';
    input.style.padding = '0 12px';
    input.style.border = '1px solid var(--primary-blue)';
    input.style.borderRadius = '6px';
    input.style.background = 'rgba(255, 255, 255, 0.1)';
    input.style.fontSize = '13px';
    input.style.color = 'var(--text-light)';
    input.style.boxSizing = 'border-box';

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '确认';
    confirmBtn.style.height = '30px';
    confirmBtn.style.padding = '0 12px';
    confirmBtn.style.border = '1px solid var(--primary-blue)';
    confirmBtn.style.borderRadius = '6px';
    confirmBtn.style.background = 'var(--primary-blue)';
    confirmBtn.style.fontSize = '13px';
    confirmBtn.style.color = 'var(--text-light)';
    confirmBtn.style.cursor = 'pointer';
    confirmBtn.style.minWidth = '60px';
    confirmBtn.style.textAlign = 'center';
    confirmBtn.style.boxSizing = 'border-box';

    confirmBtn.addEventListener('click', () => {
      const customDw = parseFloat(input.value);
      if (!isNaN(customDw) && customDw > 0) {
        // 移除其他按钮的选中状态
        document.querySelectorAll('#diameterList button').forEach(b => b.classList.remove('selected'));

        // 计算并显示结果
        selectedDw = customDw;
        selectedWeight = calculateWeight(customDw);
        document.getElementById('selDw').textContent = customDw;
        document.getElementById('selWeight').textContent = selectedWeight.toFixed(3);
        document.getElementById('resultValue').textContent = '—';
        document.getElementById('resultLabel').textContent = '计算结果';
        document.getElementById('resultUnit').textContent = '';

        // 高亮确认按钮
        confirmBtn.classList.add('selected');
      } else {
        alert('请输入有效的直径值');
      }
    });

    customInputDiv.appendChild(input);
    customInputDiv.appendChild(confirmBtn);
    list.appendChild(customInputDiv);
  }

  function select(dw, btn) {
    // 移除所有按钮的选中状态，包括自定义输入的确认按钮
    document.querySelectorAll('#diameterList button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedDw = dw;
    selectedWeight = calculateWeight(dw);
    document.getElementById('selDw').textContent = dw;
    document.getElementById('selWeight').textContent = selectedWeight.toFixed(3);
    document.getElementById('resultValue').textContent = '—';
    document.getElementById('resultLabel').textContent = '计算结果';
    document.getElementById('resultUnit').textContent = '';
  }

  // 万粒价格转每吨价格
  document.getElementById('calcWan2Ton').addEventListener('click', function () {
    if (!selectedWeight) { alert('请先选择钢球直径'); return; }
    const v = parseFloat(document.getElementById('wanPrice').value);
    if (isNaN(v) || v <= 0) { alert('请输入有效的万粒价格'); return; }
    const result = v / selectedWeight * 100;
    document.getElementById('resultLabel').textContent = '每吨价格：';
    document.getElementById('resultValue').textContent = result.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    document.getElementById('resultUnit').textContent = '元 / 吨';
  });

  // 每吨价格转万粒价格
  document.getElementById('calcTon2Wan').addEventListener('click', function () {
    if (!selectedWeight) { alert('请先选择钢球直径'); return; }
    const v = parseFloat(document.getElementById('tonPrice').value);
    if (isNaN(v) || v <= 0) { alert('请输入有效的每吨价格'); return; }
    const result = v * selectedWeight / 100;
    document.getElementById('resultLabel').textContent = '万粒价格：';
    document.getElementById('resultValue').textContent = result.toLocaleString('zh-CN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    document.getElementById('resultUnit').textContent = '元 / 万粒';
  });
}
