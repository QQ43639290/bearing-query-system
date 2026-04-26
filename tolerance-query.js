/**
 * tolerance-query.js - 公差配合尺寸查询工具
 * 基于 GB/T 1800.1-2009 标准
 * 整合到轴承工艺查询系统
 */

// ============================================================
// 打开公差配合查询工具
// ============================================================
function openToleranceQuery() {
  let modal = document.getElementById('toleranceQueryModal');
  if (!modal) {
    createToleranceQueryModal();
    modal = document.getElementById('toleranceQueryModal');
  }
  modal.style.display = 'flex';
  initToleranceQuery();
}

/** 关闭模态窗口 */
function closeToleranceQuery() {
  const modal = document.getElementById('toleranceQueryModal');
  if (modal) modal.style.display = 'none';
}

/** 创建模态窗口 */
function createToleranceQueryModal() {
  const modal = document.createElement('div');
  modal.id = 'toleranceQueryModal';
  modal.className = 'tolerance-query-modal';
  modal.innerHTML = getToleranceQueryHTML();
  document.body.appendChild(modal);

  // 添加样式
  const style = document.createElement('style');
  style.id = 'tolerance-query-styles';
  style.textContent = getToleranceQueryStyles();
  document.head.appendChild(style);

  // 绑定事件
  setTimeout(bindToleranceQueryEvents, 100);
}

/** 获取公差配合查询HTML */
function getToleranceQueryHTML() {
  return `
    <div class="tq-content">
      <div class="tq-header">
        <h3>公差配合尺寸查询</h3>
        <button class="tq-close" onclick="closeToleranceQuery()">&times;</button>
      </div>
      <div class="tq-body">
        <!-- 查询参数 -->
        <div class="tq-param-section">
          <!-- 基准制和配合类型 -->
          <div class="tq-param-row">
            <div class="tq-param-group">
              <div class="tq-param-label">基准制</div>
              <div class="tq-btn-group">
                <label class="tq-btn"><input type="radio" name="tfqBasisMode" value="hole_basis" checked><span>基孔制</span></label>
                <label class="tq-btn"><input type="radio" name="tfqBasisMode" value="shaft_basis"><span>基轴制</span></label>
                <label class="tq-btn"><input type="radio" name="tfqBasisMode" value="custom"><span>自定义</span></label>
              </div>
            </div>
            <div class="tq-param-group">
              <div class="tq-param-label">配合类型</div>
              <div class="tq-btn-group">
                <label class="tq-btn"><input type="radio" name="tfqFitClass" value="clearance" checked><span>间隙</span></label>
                <label class="tq-btn"><input type="radio" name="tfqFitClass" value="transition"><span>过渡</span></label>
                <label class="tq-btn"><input type="radio" name="tfqFitClass" value="interference"><span>过盈</span></label>
              </div>
            </div>
          </div>
          
          <!-- 基本尺寸和公差带 -->
          <div id="tfqToleranceRow" class="tq-param-row" style="margin-top:12px;">
            <div class="tq-param-group">
              <div class="tq-param-label">基本尺寸</div>
              <div class="tq-input-group">
                <input type="number" id="tfqInputD" class="tq-input" min="0" max="10000" step="5" placeholder="输入数值">
                <span class="tq-input-unit">mm</span>
              </div>
            </div>
            <div class="tq-param-group">
              <div class="tq-param-label">公差带</div>
              <div class="tq-tolerance-group">
                <div class="tq-tolerance-item">
                  <span class="tq-tolerance-label">孔</span>
                  <select id="tfqSelectH" class="tq-select"></select>
                </div>
                <div class="tq-tolerance-item">
                  <span class="tq-tolerance-label">轴</span>
                  <select id="tfqSelectS" class="tq-select"></select>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 自定义公差带 -->
          <div id="tfqCustomRow" class="tq-param-row" style="margin-top:12px;display:none;">
            <div class="tq-param-group">
              <div class="tq-param-label">基本尺寸</div>
              <div class="tq-input-group">
                <input type="number" id="tfqInputDCustom" class="tq-input" min="0" max="10000" step="5" placeholder="输入数值">
                <span class="tq-input-unit">mm</span>
              </div>
            </div>
            <div class="tq-param-group">
              <div class="tq-param-label">公差带</div>
              <div class="tq-tolerance-group">
                <div class="tq-tolerance-item">
                  <span class="tq-tolerance-label">孔</span>
                  <input type="text" id="tfqInputH" class="tq-input" placeholder="H7" maxlength="6">
                </div>
                <div class="tq-tolerance-item">
                  <span class="tq-tolerance-label">轴</span>
                  <input type="text" id="tfqInputS" class="tq-input" placeholder="k6" maxlength="6">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 偏差结果 -->
        <div class="tq-dev-container">
          <div class="tq-dev-panel tq-dev-panel-hole">
            <div class="tq-dev-panel-header">
              <div class="tq-dev-panel-title">孔偏差</div>
              <span class="tq-dev-code-badge" id="tfqLabelHCode">H7</span>
            </div>
            <div class="tq-dev-value invalid" id="tfqHoleDevDisplay"></div>
          </div>
          <div class="tq-dev-panel tq-dev-panel-shaft">
            <div class="tq-dev-panel-header">
              <div class="tq-dev-panel-title">轴偏差</div>
              <span class="tq-dev-code-badge" id="tfqLabelSCode">g6</span>
            </div>
            <div class="tq-dev-value invalid" id="tfqShaftDevDisplay"></div>
          </div>
        </div>

        <!-- 配合结果 -->
        <div class="tq-fit-result">
          <div class="tq-section-title">配合结果</div>
          <div class="tq-fit-numbers">
            <div class="tq-fit-num-item">
              <div class="tq-fit-num-label" id="tfqFitLabel1">最大间隙</div>
              <div class="tq-fit-num-value invalid" id="tfqFitLabel3">---</div>
            </div>
            <div class="tq-fit-num-item">
              <div class="tq-fit-num-label" id="tfqFitLabel2">最小间隙</div>
              <div class="tq-fit-num-value invalid" id="tfqFitLabel4">---</div>
            </div>
          </div>
          <div id="tfqInterferencePanel" style="display:none;">
            <div class="tq-row" style="margin-top:14px;gap:10px;">
              <div class="tq-label">
                <span class="tq-label-icon" style="background:#d07020;">★</span>
                <span class="tq-label-text">装配温度</span>
              </div>
              <select id="tfqMaterialSel" class="tq-select"></select>
              <input type="number" id="tfqInputCoeff" class="tq-input" step="0.1" placeholder="线膨胀系数" style="width:120px;">
              <span class="tq-unit" style="color:#888;font-weight:normal;">×10⁻⁶/℃</span>
            </div>
            <div class="tq-temp-result" id="tfqTempResult"></div>
          </div>
        </div>

        <!-- 公差配合键盘 -->
        <div class="tq-keyboard-section">
          <div class="tq-section-title">公差配合键盘</div>
          <div class="tq-row" style="margin-bottom:16px;">
            <div class="tq-btn-group">
              <label class="tq-btn"><input type="radio" name="tfqKeyboardType" value="shaft" checked><span>轴公差</span></label>
              <label class="tq-btn"><input type="radio" name="tfqKeyboardType" value="hole"><span>孔公差</span></label>
              <label class="tq-btn"><input type="radio" name="tfqKeyboardType" value="shaft_basis"><span>基轴制</span></label>
              <label class="tq-btn"><input type="radio" name="tfqKeyboardType" value="hole_basis"><span>基孔制</span></label>
            </div>
          </div>
          <div class="tq-keyboard-container">
            <!-- 轴公差带键盘 -->
            <div id="tfqShaftKeyboard" class="tq-keyboard-content">
              <div class="tq-keyboard-header"><h3>轴公差带键盘</h3></div>
              <div class="tq-keyboard-table">
                <table>
                  <thead>
                    <tr>
                      <th>等级</th>
                      <th colspan="18">公差代号</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>IT5</td>
                      <td></td><td></td><td></td><td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">g5</button></td>
                      <td><button class="tq-key priority-2">h5</button></td>
                      <td><button class="tq-key priority-2">js5</button></td>
                      <td><button class="tq-key priority-2">k5</button></td>
                      <td><button class="tq-key priority-2">m5</button></td>
                      <td><button class="tq-key priority-2">n5</button></td>
                      <td><button class="tq-key priority-2">p5</button></td>
                      <td><button class="tq-key priority-2">r5</button></td>
                      <td><button class="tq-key priority-2">s5</button></td>
                      <td><button class="tq-key priority-2">t5</button></td>
                      <td></td><td></td>
                    </tr>
                    <tr>
                      <td>IT6</td>
                      <td></td><td></td><td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">f6</button></td>
                      <td><button class="tq-key priority-1">g6</button></td>
                      <td><button class="tq-key priority-1">h6</button></td>
                      <td><button class="tq-key priority-1">js6</button></td>
                      <td><button class="tq-key priority-1">k6</button></td>
                      <td><button class="tq-key priority-2">m6</button></td>
                      <td><button class="tq-key priority-1">n6</button></td>
                      <td><button class="tq-key priority-1">p6</button></td>
                      <td><button class="tq-key priority-1">r6</button></td>
                      <td><button class="tq-key priority-1">s6</button></td>
                      <td><button class="tq-key priority-2">t6</button></td>
                      <td><button class="tq-key priority-2">u6</button></td>
                      <td><button class="tq-key priority-2">x6</button></td>
                    </tr>
                    <tr>
                      <td>IT7</td>
                      <td></td><td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">e7</button></td>
                      <td><button class="tq-key priority-1">f7</button></td>
                      <td></td>
                      <td><button class="tq-key priority-1">h7</button></td>
                      <td><button class="tq-key priority-2">js7</button></td>
                      <td><button class="tq-key priority-2">k7</button></td>
                      <td><button class="tq-key priority-2">m7</button></td>
                      <td><button class="tq-key priority-2">n7</button></td>
                      <td><button class="tq-key priority-2">p7</button></td>
                      <td><button class="tq-key priority-2">r7</button></td>
                      <td><button class="tq-key priority-2">s7</button></td>
                      <td><button class="tq-key priority-2">t7</button></td>
                      <td><button class="tq-key priority-2">u7</button></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>IT8</td>
                      <td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">d8</button></td>
                      <td><button class="tq-key priority-1">e8</button></td>
                      <td><button class="tq-key priority-2">f8</button></td>
                      <td></td>
                      <td><button class="tq-key priority-2">h8</button></td>
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr>
                      <td>IT9</td>
                      <td></td>
                      <td><button class="tq-key priority-2">b9</button></td>
                      <td><button class="tq-key priority-2">c9</button></td>
                      <td><button class="tq-key priority-1">d9</button></td>
                      <td><button class="tq-key priority-2">e9</button></td>
                      <td></td><td></td>
                      <td><button class="tq-key priority-1">h9</button></td>
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr>
                      <td>IT10</td>
                      <td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">d10</button></td>
                      <td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">h10</button></td>
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr>
                      <td>IT11</td>
                      <td><button class="tq-key priority-1">a11</button></td>
                      <td><button class="tq-key priority-1">b11</button></td>
                      <td><button class="tq-key priority-1">c11</button></td>
                      <td></td><td></td><td></td><td></td>
                      <td><button class="tq-key priority-1">h11</button></td>
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="tq-keyboard-legend">
                <div class="tq-legend-item"><span class="tq-legend-color priority-1"></span> 特别优先</div>
                <div class="tq-legend-item"><span class="tq-legend-color priority-2"></span> 优先选择</div>
                <div class="tq-legend-item"><span class="tq-legend-color priority-3"></span> 备用选择</div>
              </div>
            </div>

            <!-- 基孔制优先配合键盘 -->
            <div id="tfqHoleBasisKeyboard" class="tq-keyboard-content" style="display:none;">
              <div class="tq-keyboard-header"><h3>基孔制优先配合键盘</h3></div>
              <div class="tq-keyboard-table">
                <table>
                  <thead>
                    <tr>
                      <th>孔</th>
                      <th colspan="7" class="tq-fit-type clearance">间隙配合</th>
                      <th colspan="4" class="tq-fit-type transition">过渡配合</th>
                      <th colspan="7" class="tq-fit-type interference">过盈配合</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>H6</td>
                      <td></td><td></td><td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">g5</button></td>
                      <td><button class="tq-key priority-2">h5</button></td>
                      <td><button class="tq-key priority-2">js5</button></td>
                      <td><button class="tq-key priority-2">k5</button></td>
                      <td><button class="tq-key priority-2">m5</button></td>
                      <td></td>
                      <td><button class="tq-key priority-2">n5</button></td>
                      <td><button class="tq-key priority-2">p5</button></td>
                      <td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr>
                      <td style="background-color: #409eff; color: white;">H7</td>
                      <td></td><td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">f6</button></td>
                      <td><button class="tq-key priority-1">g6</button></td>
                      <td><button class="tq-key priority-1">h6</button></td>
                      <td><button class="tq-key priority-1">js6</button></td>
                      <td><button class="tq-key priority-1">k6</button></td>
                      <td><button class="tq-key priority-2">m6</button></td>
                      <td><button class="tq-key priority-1">n6</button></td>
                      <td></td>
                      <td><button class="tq-key priority-1">p6</button></td>
                      <td><button class="tq-key priority-1">r6</button></td>
                      <td><button class="tq-key priority-1">s6</button></td>
                      <td><button class="tq-key priority-2">t6</button></td>
                      <td><button class="tq-key priority-2">u6</button></td>
                      <td><button class="tq-key priority-2">x6</button></td>
                    </tr>
                    <tr>
                      <td style="background-color: #409eff; color: white;">H8</td>
                      <td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">e7</button></td>
                      <td><button class="tq-key priority-1">f7</button></td>
                      <td></td>
                      <td><button class="tq-key priority-1">h7</button></td>
                      <td><button class="tq-key priority-2">js7</button></td>
                      <td><button class="tq-key priority-2">k7</button></td>
                      <td><button class="tq-key priority-2">m7</button></td>
                      <td></td><td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">s7</button></td>
                      <td></td>
                      <td><button class="tq-key priority-2">u7</button></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td style="background-color: #409eff; color: white;">H8</td>
                      <td></td><td></td>
                      <td><button class="tq-key priority-2">d8</button></td>
                      <td><button class="tq-key priority-1">e8</button></td>
                      <td><button class="tq-key priority-2">f8</button></td>
                      <td></td>
                      <td><button class="tq-key priority-2">h8</button></td>
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr>
                      <td style="background-color: #409eff; color: white;">H9</td>
                      <td></td><td></td>
                      <td><button class="tq-key priority-2">d8</button></td>
                      <td><button class="tq-key priority-1">e8</button></td>
                      <td><button class="tq-key priority-2">f8</button></td>
                      <td></td>
                      <td><button class="tq-key priority-2">h8</button></td>
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr>
                      <td>H10</td>
                      <td><button class="tq-key priority-2">b9</button></td>
                      <td><button class="tq-key priority-2">c9</button></td>
                      <td><button class="tq-key priority-1">d9</button></td>
                      <td><button class="tq-key priority-2">e9</button></td>
                      <td></td><td></td>
                      <td><button class="tq-key priority-1">h9</button></td>
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr>
                      <td style="background-color: #409eff; color: white;">H11</td>
                      <td><button class="tq-key priority-1">b11</button></td>
                      <td><button class="tq-key priority-1">c11</button></td>
                      <td><button class="tq-key priority-2">d10</button></td>
                      <td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">h10</button></td>
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="tq-keyboard-legend">
                <div class="tq-legend-item"><span class="tq-legend-color priority-1"></span> 优先配合</div>
                <div class="tq-legend-item"><span class="tq-legend-color priority-2"></span> 可用配合</div>
              </div>
            </div>

            <!-- 基轴制优先配合键盘 -->
            <div id="tfqShaftBasisKeyboard" class="tq-keyboard-content" style="display:none;">
              <div class="tq-keyboard-header"><h3>基轴制优先配合键盘</h3></div>
              <div class="tq-keyboard-table">
                <table>
                  <thead>
                    <tr>
                      <th>轴</th>
                      <th colspan="7" class="tq-fit-type clearance">间隙配合</th>
                      <th colspan="4" class="tq-fit-type transition">过渡配合</th>
                      <th colspan="7" class="tq-fit-type interference">过盈配合</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>h5</td>
                      <td></td><td></td><td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">G6</button></td>
                      <td><button class="tq-key priority-2">H6</button></td>
                      <td><button class="tq-key priority-2">JS6</button></td>
                      <td><button class="tq-key priority-2">K6</button></td>
                      <td><button class="tq-key priority-2">M6</button></td>
                      <td></td>
                      <td><button class="tq-key priority-2">N6</button></td>
                      <td><button class="tq-key priority-2">P6</button></td>
                      <td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr>
                      <td style="background-color: #409eff; color: white;">h6</td>
                      <td></td><td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">F7</button></td>
                      <td><button class="tq-key priority-1">G7</button></td>
                      <td><button class="tq-key priority-1">H7</button></td>
                      <td><button class="tq-key priority-1">JS7</button></td>
                      <td><button class="tq-key priority-1">K7</button></td>
                      <td><button class="tq-key priority-2">M7</button></td>
                      <td><button class="tq-key priority-1">N7</button></td>
                      <td></td>
                      <td><button class="tq-key priority-1">P7</button></td>
                      <td><button class="tq-key priority-1">R7</button></td>
                      <td><button class="tq-key priority-1">S7</button></td>
                      <td><button class="tq-key priority-2">T7</button></td>
                      <td><button class="tq-key priority-2">U7</button></td>
                      <td><button class="tq-key priority-2">X7</button></td>
                    </tr>
                    <tr>
                      <td style="background-color: #409eff; color: white;">h7</td>
                      <td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">E8</button></td>
                      <td><button class="tq-key priority-1">F8</button></td>
                      <td></td>
                      <td><button class="tq-key priority-1">H8</button></td>
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr>
                      <td>h8</td>
                      <td></td><td></td>
                      <td><button class="tq-key priority-2">D9</button></td>
                      <td><button class="tq-key priority-1">E9</button></td>
                      <td><button class="tq-key priority-2">F9</button></td>
                      <td></td>
                      <td><button class="tq-key priority-1">H9</button></td>
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr>
                      <td style="background-color: #409eff; color: white;">h9</td>
                      <td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">E8</button></td>
                      <td><button class="tq-key priority-1">F8</button></td>
                      <td></td>
                      <td><button class="tq-key priority-1">H8</button></td>
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr>
                      <td style="background-color: #409eff; color: white;">h9</td>
                      <td></td><td></td>
                      <td><button class="tq-key priority-2">D9</button></td>
                      <td><button class="tq-key priority-1">E9</button></td>
                      <td><button class="tq-key priority-2">F9</button></td>
                      <td></td>
                      <td><button class="tq-key priority-1">H9</button></td>
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr>
                      <td style="background-color: #409eff; color: white;">h9</td>
                      <td><button class="tq-key priority-1">B11</button></td>
                      <td><button class="tq-key priority-2">C10</button></td>
                      <td><button class="tq-key priority-1">D10</button></td>
                      <td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">H10</button></td>
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="tq-keyboard-legend">
                <div class="tq-legend-item"><span class="tq-legend-color priority-1"></span> 优先配合</div>
                <div class="tq-legend-item"><span class="tq-legend-color priority-2"></span> 可用配合</div>
              </div>
            </div>

            <!-- 孔公差带键盘 -->
            <div id="tfqHoleKeyboard" class="tq-keyboard-content" style="display:none;">
              <div class="tq-keyboard-header"><h3>孔公差带键盘</h3></div>
              <div class="tq-keyboard-table">
                <table>
                  <thead>
                    <tr>
                      <th>等级</th>
                      <th colspan="18">公差代号</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>IT6</td>
                      <td></td><td></td><td></td><td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">G6</button></td>
                      <td><button class="tq-key priority-2">H6</button></td>
                      <td><button class="tq-key priority-2">JS6</button></td>
                      <td><button class="tq-key priority-2">K6</button></td>
                      <td><button class="tq-key priority-2">M6</button></td>
                      <td><button class="tq-key priority-2">N6</button></td>
                      <td><button class="tq-key priority-2">P6</button></td>
                      <td><button class="tq-key priority-2">R6</button></td>
                      <td><button class="tq-key priority-2">S6</button></td>
                      <td><button class="tq-key priority-2">T6</button></td>
                      <td></td><td></td>
                    </tr>
                    <tr>
                      <td>IT7</td>
                      <td></td><td></td><td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">F7</button></td>
                      <td><button class="tq-key priority-1">G7</button></td>
                      <td><button class="tq-key priority-1">H7</button></td>
                      <td><button class="tq-key priority-1">JS7</button></td>
                      <td><button class="tq-key priority-1">K7</button></td>
                      <td><button class="tq-key priority-2">M7</button></td>
                      <td><button class="tq-key priority-1">N7</button></td>
                      <td><button class="tq-key priority-1">P7</button></td>
                      <td><button class="tq-key priority-1">R7</button></td>
                      <td><button class="tq-key priority-1">S7</button></td>
                      <td><button class="tq-key priority-2">T7</button></td>
                      <td><button class="tq-key priority-2">U7</button></td>
                      <td><button class="tq-key priority-2">X7</button></td>
                    </tr>
                    <tr>
                      <td>IT8</td>
                      <td></td><td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">E8</button></td>
                      <td><button class="tq-key priority-1">F8</button></td>
                      <td></td>
                      <td><button class="tq-key priority-1">H8</button></td>
                      <td><button class="tq-key priority-2">JS8</button></td>
                      <td><button class="tq-key priority-2">K8</button></td>
                      <td><button class="tq-key priority-2">M8</button></td>
                      <td><button class="tq-key priority-2">N8</button></td>
                      <td><button class="tq-key priority-2">P8</button></td>
                      <td><button class="tq-key priority-2">R8</button></td>
                      <td></td><td></td><td></td><td></td>
                    </tr>
                    <tr>
                      <td>IT9</td>
                      <td></td><td></td><td></td>
                      <td><button class="tq-key priority-2">D9</button></td>
                      <td><button class="tq-key priority-1">E9</button></td>
                      <td><button class="tq-key priority-2">F9</button></td>
                      <td></td>
                      <td><button class="tq-key priority-1">H9</button></td>
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr>
                      <td>IT10</td>
                      <td></td><td></td>
                      <td><button class="tq-key priority-2">C10</button></td>
                      <td><button class="tq-key priority-1">D10</button></td>
                      <td><button class="tq-key priority-2">E10</button></td>
                      <td></td><td></td>
                      <td><button class="tq-key priority-2">H10</button></td>
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                    <tr>
                      <td>IT11</td>
                      <td><button class="tq-key priority-1">A11</button></td>
                      <td><button class="tq-key priority-1">B11</button></td>
                      <td><button class="tq-key priority-1">C11</button></td>
                      <td><button class="tq-key priority-2">D11</button></td>
                      <td></td><td></td><td></td>
                      <td><button class="tq-key priority-1">H11</button></td>
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="tq-keyboard-legend">
                <div class="tq-legend-item"><span class="tq-legend-color priority-1"></span> 特别优先</div>
                <div class="tq-legend-item"><span class="tq-legend-color priority-2"></span> 优先选择</div>
                <div class="tq-legend-item"><span class="tq-legend-color priority-3"></span> 备用选择</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 公差带图示 -->
        <div class="tq-diagram-section">
          <div class="tq-section-title">公差带图示</div>
          <canvas id="tfqToleranceCanvas" width="420" height="220"></canvas>
        </div>
      </div>
    </div>
  `;
}

/** 获取公差配合查询样式 */
function getToleranceQueryStyles() {
  return `
    .tolerance-query-modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 10000; align-items: center; justify-content: center; padding: 10px; font-family: "Microsoft YaHei", "微软雅黑", Arial, sans-serif; }
    .tq-content { background: var(--card-bg, #fff); border-radius: 10px; width: 99%; max-width: 1400px; max-height: 95vh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
    .tq-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: linear-gradient(135deg, #2c6fad 0%, #1a4a80 100%); color: #fff; }
    .tq-header h3 { margin: 0; font-size: 18px; }
    .tq-close { background: rgba(255,255,255,0.2); border: none; color: #fff; font-size: 24px; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .tq-close:hover { background: rgba(255,255,255,0.3); }
    .tq-body { padding: 15px; overflow-y: auto; max-height: calc(95vh - 60px); }
    .tq-row { display: flex; align-items: center; gap: 4px; margin-bottom: 6px; flex-wrap: wrap; }
    .tq-row:last-child { margin-bottom: 0; }
    .tq-block { flex: 1; min-width: 120px; }
    /* 查询参数部分样式 */
    .tq-param-section { padding: 0 0 10px 0; margin-bottom: 10px; }
    .tq-param-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-start; }
    .tq-param-group { flex: 1; min-width: 200px; }
    .tq-param-label { font-size: 15px; font-weight: 500; color: #333; margin-bottom: 8px; }
    
    /* 按钮组样式 */
    .tq-btn-group { display: flex; gap: 8px; flex-wrap: wrap; }
    .tq-btn { cursor: pointer; display: flex; align-items: center; }
    .tq-btn input[type="radio"] { display: none; }
    .tq-btn span { display: inline-block; padding: 8px 16px; font-size: 15px; color: #495057; background: #fff; border: 1px solid #ced4da; border-radius: 6px; transition: all .2s; white-space: nowrap; }
    .tq-btn input[type="radio"]:checked+span { background: #2c6fad; border-color: #2c6fad; color: #fff; font-weight: 500; }
    .tq-btn:hover span { border-color: #2c6fad; color: #2c6fad; }
    
    /* 输入组样式 */
    .tq-input-group { display: flex; align-items: center; gap: 8px; }
    .tq-input { flex: 1; max-width: 220px; border: 1px solid #ced4da; border-radius: 6px; padding: 8px 14px; font-size: 15px; background: #fff; outline: none; height: 40px; color: #333; }
    .tq-input:focus { border-color: #2c6fad; box-shadow: 0 0 0 2px rgba(44,111,173,.15); }
    .tq-input::placeholder { color: #6c757d; }
    .tq-input-unit { font-size: 15px; color: #6c757d; font-weight: 500; white-space: nowrap; }
    
    /* 公差带组样式 */
    .tq-tolerance-group { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
    .tq-tolerance-item { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 140px; }
    .tq-tolerance-label { font-size: 15px; font-weight: 500; color: #333; white-space: nowrap; }
    .tq-select { border: 1px solid #ced4da; border-radius: 6px; padding: 8px 14px; font-size: 15px; background: #fff; outline: none; height: 40px; color: #333; cursor: pointer; min-width: 100px; }
    .tq-select:focus { border-color: #2c6fad; box-shadow: 0 0 0 2px rgba(44,111,173,.15); }
    
    .tq-label { display: flex; align-items: center; gap: 4px; min-width: 70px; }
    .tq-label-icon { width: 18px; height: 18px; background: #2c6fad; color: #fff; border-radius: 50%; font-size: 9px; font-weight: bold; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .tq-label-text { font-size: 11px; color: #333; font-weight: 500; white-space: nowrap; }
    .tq-dev-container { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: nowrap; }
    .tq-dev-panel { flex: 1; padding: 8px 12px; position: relative; border-radius: 6px; min-width: 0; border: 1px solid #e9ecef; }
    .tq-dev-panel-hole { background: #e8f0fb; }
    .tq-dev-panel-shaft { background: #fff3e8; }
    .tq-dev-panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .tq-dev-panel-title { font-size: 13px; font-weight: bold; }
    .tq-dev-panel-hole .tq-dev-panel-title { color: #2c6fad; }
    .tq-dev-panel-shaft .tq-dev-panel-title { color: #d07020; }
    .tq-dev-code-badge { display: inline-block; font-size: 14px; font-weight: bold; padding: 1px 6px; border-radius: 10px; }
    .tq-dev-panel-hole .tq-dev-code-badge { background: #2c6fad; color: #fff; }
    .tq-dev-panel-shaft .tq-dev-code-badge { background: #d07020; color: #fff; }
    .tq-dev-value { font-family: "Consolas", "Courier New", monospace; font-size: 15px; font-weight: bold; line-height: 1.2; padding: 4px 8px; border-radius: 3px; min-height: 36px; display: flex; flex-direction: column; justify-content: center; }
    .tq-dev-panel-hole .tq-dev-value { color: #1a4a80; }
    .tq-dev-panel-shaft .tq-dev-value { color: #8a4000; }
    .tq-dev-value.invalid { color: #bbb; font-size: 14px; font-weight: normal; background: #f5f5f5; }
    .tq-dv-es, .tq-dv-ei { display: block; font-family: "Consolas", "Courier New", monospace; font-weight: bold; line-height: 1.3; text-align: left; }
    .tq-dv-es { font-size: 16px; color: #5a8ac0; }
    .tq-dv-ei { font-size: 16px; color: #5a8ac0; }
    .tq-dev-panel-shaft .tq-dv-es, .tq-dev-panel-shaft .tq-dv-ei { color: #c07840; }
    .tq-fit-result { margin-bottom: 10px; }
    .tq-keyboard-section { margin-bottom: 10px; }
    .tq-diagram-section { margin-bottom: 10px; }
    
    /* 通用标题样式 */
    .tq-section-title {
      font-size: 15px; 
      font-weight: 500; 
      color: #2c6fad; 
      margin-bottom: 8px; 
      text-align: center; 
      position: relative; 
      padding: 0 20px;
    }
    .tq-section-title::before,
    .tq-section-title::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 40%;
      height: 1px;
      background-color: #409eff;
    }
    .tq-section-title::before {
      left: 0;
    }
    .tq-section-title::after {
      right: 0;
    }
    .tq-fit-numbers { display: flex; gap: 6px; flex-wrap: nowrap; }
    .tq-fit-num-item { flex: 1; min-width: 70px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 6px 10px; }
    .tq-fit-num-label { font-size: 12px; color: #6c757d; margin-bottom: 4px; font-weight: 500; }
    .tq-fit-num-value { font-size: 18px; font-weight: bold; font-family: "Courier New", Courier, monospace; color: #1a4a80; line-height: 1.2; margin-bottom: 1px; text-align: center; }
    .tq-fit-num-value.invalid { color: #bbb; font-size: 18px; }
    .tq-temp-result { margin-top: 10px; padding: 8px 12px; background: #fffbf0; border: 1px solid #f0d060; border-radius: 4px; font-size: 11px; color: #7a5800; line-height: 1.5; }
    
    /* 公差配合键盘样式 */
    .tq-keyboard-container { margin-top: 12px; border: 1px solid #e4e7ed; border-radius: 6px; overflow: hidden; }
    .tq-keyboard-content { padding: 12px; }
    .tq-keyboard-header h3 { margin: 0 0 12px 0; font-size: 14px; font-weight: 500; color: #303133; }
    .tq-keyboard-table { overflow-x: auto; margin-bottom: 12px; }
    .tq-keyboard-table table { width: 100%; border-collapse: collapse; text-align: center; }
    .tq-keyboard-table th, .tq-keyboard-table td { padding: 4px; border: 1px solid #e4e7ed; }
    .tq-keyboard-table th { background-color: #f5f7fa; font-weight: 500; }
    .tq-key { border: none; border-radius: 3px; padding: 8px 4px; font-size: 11px; cursor: pointer; transition: all 0.2s; width: 100%; text-align: center; background: none !important; }
    .tq-key:hover { transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    
    /* 优先级样式 - 完整的三级优先级 */
    .tq-key.priority-1 { background-color: #409eff !important; color: white !important; }
    .tq-key.priority-2 { background-color: #f7ba2a !important; color: black !important; }
    .tq-key.priority-3 { background-color: #c0c4cc !important; color: white !important; }
    
    /* 配合类型样式 */
    .tq-fit-type { font-weight: 500; }
    .tq-fit-type.clearance { background-color: #ecf5ff; color: #409eff; }
    .tq-fit-type.transition { background-color: #fefce8; color: #e6a23c; }
    .tq-fit-type.interference { background-color: #fef0f0; color: #f56c6c; }
    
    /* 图例样式 */
    .tq-keyboard-legend { display: flex; gap: 20px; margin-top: 12px; flex-wrap: wrap; }
    .tq-legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #606266; }
    .tq-legend-color { width: 16px; height: 16px; border-radius: 4px; }
    .tq-legend-color.priority-1 { background-color: #409eff; }
    .tq-legend-color.priority-2 { background-color: #f7ba2a; }
    .tq-legend-color.priority-3 { background-color: #c0c4cc; }
    
    #tfqToleranceCanvas { display: block; max-width: 100%; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px; min-height: 220px; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
    
    @media (max-width: 580px) {
      .tq-dev-panel+.tq-dev-panel { border-left: 1px solid #e9ecef; border-top: none; }
      .tq-param-row { flex-direction: row; gap: 12px; flex-wrap: wrap; }
      .tq-param-group { flex: 1; min-width: 150px; }
      .tq-param-label { font-size: 15px; }
      .tq-btn-group { gap: 4px; }
      .tq-btn span { padding: 4px 8px; font-size: 13px; }
      .tq-input-group { display: flex; gap: 6px; align-items: center; }
      .tq-input { flex: 1; padding: 6px 12px; font-size: 15px; height: 36px; min-width: 0; }
      .tq-input-unit { font-size: 15px; white-space: nowrap; }
      .tq-tolerance-group { display: flex; gap: 10px; align-items: center; flex-wrap: nowrap; }
      .tq-tolerance-item { display: flex; gap: 6px; align-items: center; flex: 1; min-width: 0; }
      .tq-tolerance-label { font-size: 15px; white-space: nowrap; }
      .tq-select { flex: 1; font-size: 15px; padding: 6px 12px; height: 36px; min-width: 0; }
    }
    @media (max-width: 768px) {
      .tq-keyboard-legend { gap: 12px; }
    }
    @media (max-width: 480px) {
      .tq-keyboard-content { padding: 5px; }
      .tq-keyboard-table th, .tq-keyboard-table td { padding: 5px 3px; font-size: 10px; }
      .tq-fit-type { font-size: 10px; }
      .tq-key { padding: 5px 5px; font-size: 10px; }
    }
  `;
}

// ============================================================
// 全局状态
// ============================================================
let tfqCurrentHole = { es: null, ei: null };
let tfqCurrentShaft = { es: null, ei: null };
let tfqCurrentFitType = 'hole_basis';
let tfqCurrentFitClass = 'clearance';
let tfqMaxGyl = 0;

// 材料线膨胀系数表
const TFQ_MATERIAL_COEFF = {
  '碳钢': 13.0, '紫铜': 17.5, '黄铜': 16.8, '锡青铜': 17.9,
  '铝合金': 24.8, '铬钢': 11.8, '1Cr18Ni9Ti': 17.0,
};

// 优先配合列表
const TFQ_FIT_LISTS = {
  hole_basis_clearance: ["e6", "f6", "g6", "h6"],
  hole_basis_transition: ["j6", "js6", "k6", "m6", "n6"],
  hole_basis_interference: ["p6", "r6", "s6", "t6", "u6", "v6", "x6", "z6"],
  shaft_basis_clearance: ["D7", "E7", "F7", "G7", "H7"],
  shaft_basis_transition: ["J7", "JS7", "K7", "M7", "N7"],
  shaft_basis_interference: ["P7", "R7", "S7", "T7", "U7", "V7", "X7", "Y7", "Z7"],
  hole_H_list: ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "H11", "H12", "H13"],
  shaft_h_list: ["h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", "h10", "h11", "h12", "h13"],
};

// ============================================================
// 初始化
// ============================================================
function initToleranceQuery() {
  initMaterialSelect();
  updateFitSelectors();
  document.getElementById('tfqInputD').value = '100';
  tfqSwitchMode('hole_basis');
  tfqSwitchFitClass('clearance');
  tfqCalculate();
}

function initMaterialSelect() {
  const sel = document.getElementById('tfqMaterialSel');
  if (!sel) return;
  sel.innerHTML = '';
  for (const name of Object.keys(TFQ_MATERIAL_COEFF)) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  }
  sel.value = '碳钢';
  const coeffInput = document.getElementById('tfqInputCoeff');
  if (coeffInput) coeffInput.value = TFQ_MATERIAL_COEFF['碳钢'];
}

// ============================================================
// 事件绑定
// ============================================================
function bindToleranceQueryEvents() {
  const inputD = document.getElementById('tfqInputD');
  const inputH = document.getElementById('tfqInputH');
  const inputS = document.getElementById('tfqInputS');
  const inputDCustom = document.getElementById('tfqInputDCustom');
  const selectH = document.getElementById('tfqSelectH');
  const selectS = document.getElementById('tfqSelectS');
  const materialSel = document.getElementById('tfqMaterialSel');
  const inputCoeff = document.getElementById('tfqInputCoeff');

  if (inputD) inputD.addEventListener('input', tfqOnParamChange);
  if (inputH) {
    inputH.addEventListener('input', tfqOnParamChange);
    inputH.addEventListener('input', function () { this.value = this.value.toUpperCase(); });
  }
  if (inputS) {
    inputS.addEventListener('input', tfqOnParamChange);
    inputS.addEventListener('input', function () { this.value = this.value.toLowerCase(); });
  }
  if (inputDCustom) inputDCustom.addEventListener('input', tfqOnCustomInputChange);
  if (selectH) selectH.addEventListener('change', tfqOnSelectChange);
  if (selectS) selectS.addEventListener('change', tfqOnSelectChange);
  if (materialSel) materialSel.addEventListener('change', tfqOnMaterialChange);
  if (inputCoeff) inputCoeff.addEventListener('input', tfqOnParamChange);

  // 模式切换
  document.querySelectorAll('input[name="tfqBasisMode"]').forEach(r => {
    r.addEventListener('change', () => {
      const mode = document.querySelector('input[name="tfqBasisMode"]:checked').value;
      tfqSwitchMode(mode);
    });
  });

  // 配合类型切换
  document.querySelectorAll('input[name="tfqFitClass"]').forEach(r => {
    r.addEventListener('change', () => {
      const fc = document.querySelector('input[name="tfqFitClass"]:checked').value;
      tfqSwitchFitClass(fc);
      updateFitSelectors();
      tfqOnSelectChange();
    });
  });

  // 键盘类型切换
  document.querySelectorAll('input[name="tfqKeyboardType"]').forEach(r => {
    r.addEventListener('change', () => {
      const keyboardType = document.querySelector('input[name="tfqKeyboardType"]:checked').value;
      tfqSwitchKeyboard(keyboardType);
    });
  });

  // 绑定键盘按钮点击事件
  tfqBindKeyboardEvents();
}

function tfqSwitchKeyboard(keyboardType) {
  const keyboards = ['tfqShaftKeyboard', 'tfqHoleBasisKeyboard', 'tfqShaftBasisKeyboard', 'tfqHoleKeyboard'];
  keyboards.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  if (keyboardType === 'shaft') {
    const el = document.getElementById('tfqShaftKeyboard');
    if (el) el.style.display = '';
  } else if (keyboardType === 'hole_basis') {
    const el = document.getElementById('tfqHoleBasisKeyboard');
    if (el) el.style.display = '';
  } else if (keyboardType === 'shaft_basis') {
    const el = document.getElementById('tfqShaftBasisKeyboard');
    if (el) el.style.display = '';
  } else if (keyboardType === 'hole') {
    const el = document.getElementById('tfqHoleKeyboard');
    if (el) el.style.display = '';
  }
}

function tfqBindKeyboardEvents() {
  // 轴公差带键盘 - 点击设置轴公差
  document.querySelectorAll('#tfqShaftKeyboard .tq-key, #tfqHoleBasisKeyboard .tq-key').forEach(btn => {
    btn.addEventListener('click', function () {
      const toleranceCode = this.textContent;
      const inputS = document.getElementById('tfqInputS');
      if (inputS) {
        inputS.value = toleranceCode;
        inputS.dispatchEvent(new Event('input'));
      }
    });
  });

  // 孔公差带键盘 - 点击设置孔公差
  document.querySelectorAll('#tfqHoleKeyboard .tq-key, #tfqShaftBasisKeyboard .tq-key').forEach(btn => {
    btn.addEventListener('click', function () {
      const toleranceCode = this.textContent;
      const inputH = document.getElementById('tfqInputH');
      if (inputH) {
        inputH.value = toleranceCode;
        inputH.dispatchEvent(new Event('input'));
      }
    });
  });
}

function tfqOnSelectChange() {
  const mode = document.querySelector('input[name="tfqBasisMode"]:checked').value;
  if (mode === 'hole_basis' || mode === 'shaft_basis') {
    const selH = document.getElementById('tfqSelectH');
    const selS = document.getElementById('tfqSelectS');
    const inputH = document.getElementById('tfqInputH');
    const inputS = document.getElementById('tfqInputS');
    if (selH && selS && inputH && inputS) {
      inputH.value = selH.value.replace(/[*']/g, '');
      inputS.value = selS.value.replace(/[*']/g, '');
    }
  }
  tfqOnParamChange();
}

function tfqOnMaterialChange() {
  const name = document.getElementById('tfqMaterialSel').value;
  if (TFQ_MATERIAL_COEFF[name] !== undefined) {
    document.getElementById('tfqInputCoeff').value = TFQ_MATERIAL_COEFF[name];
  }
  tfqOnParamChange();
}

function tfqOnParamChange() {
  tfqCalculate();
}

function tfqOnCustomInputChange() {
  const customD = document.getElementById('tfqInputDCustom').value;
  const inputD = document.getElementById('tfqInputD');
  if (inputD) inputD.value = customD;
  tfqCalculate();
}

// ============================================================
// 模式切换
// ============================================================
function tfqSwitchMode(mode) {
  tfqCurrentFitType = mode;
  const customRow = document.getElementById('tfqCustomRow');
  const toleranceRow = document.getElementById('tfqToleranceRow');

  if (mode === 'custom') {
    if (toleranceRow) toleranceRow.style.display = 'none';
    if (customRow) customRow.style.display = '';
    const inputD = document.getElementById('tfqInputD');
    const inputDCustom = document.getElementById('tfqInputDCustom');
    const inputH = document.getElementById('tfqInputH');
    const inputS = document.getElementById('tfqInputS');
    if (inputDCustom && inputD) inputDCustom.value = inputD.value;
    if (inputH) inputH.value = 'H7';
    if (inputS) inputS.value = 'k6';
  } else {
    if (toleranceRow) toleranceRow.style.display = '';
    if (customRow) customRow.style.display = 'none';
    updateFitSelectors();
    tfqOnSelectChange();
  }
  tfqCalculate();
}

function tfqSwitchFitClass(fc) {
  tfqCurrentFitClass = fc;
  const interferencePanel = document.getElementById('tfqInterferencePanel');
  if (interferencePanel) interferencePanel.style.display = (fc === 'interference') ? '' : 'none';
}

function updateFitSelectors() {
  const mode = document.querySelector('input[name="tfqBasisMode"]:checked').value;
  const fc = document.querySelector('input[name="tfqFitClass"]:checked').value;
  const selectH = document.getElementById('tfqSelectH');
  const selectS = document.getElementById('tfqSelectS');

  if (mode === 'hole_basis') {
    populateSelect(selectH, TFQ_FIT_LISTS.hole_H_list, 'H7');
    let shaftList;
    if (fc === 'clearance') shaftList = TFQ_FIT_LISTS.hole_basis_clearance;
    else if (fc === 'transition') shaftList = TFQ_FIT_LISTS.hole_basis_transition;
    else shaftList = TFQ_FIT_LISTS.hole_basis_interference;
    populateSelect(selectS, shaftList, shaftList[0]);
  } else if (mode === 'shaft_basis') {
    populateSelect(selectS, TFQ_FIT_LISTS.shaft_h_list, 'h6');
    let holeList;
    if (fc === 'clearance') holeList = TFQ_FIT_LISTS.shaft_basis_clearance;
    else if (fc === 'transition') holeList = TFQ_FIT_LISTS.shaft_basis_transition;
    else holeList = TFQ_FIT_LISTS.shaft_basis_interference;
    populateSelect(selectH, holeList, holeList[0]);
  }
}

function populateSelect(sel, items, defaultVal) {
  if (!sel) return;
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
function tfqCalculate() {
  const D = parseFloat(document.getElementById('tfqInputD').value);
  let hCode = document.getElementById('tfqInputH').value.trim().toUpperCase();
  let sCode = document.getElementById('tfqInputS').value.trim().toLowerCase();

  tfqSetHoleDisplay(null);
  tfqSetShaftDisplay(null);
  tfqSetFitResult(null);
  tfqSetTempResult(null);

  if (isNaN(D) || D <= 0) return;

  // 计算孔
  if (hCode) {
    const hDev = tfqCalcHoleDeviation(hCode, D);
    tfqCurrentHole = hDev;
    tfqSetHoleDisplay(hDev);
  }

  // 计算轴
  if (sCode) {
    const sDev = tfqCalcShaftDeviation(sCode, D);
    tfqCurrentShaft = sDev;
    tfqSetShaftDisplay(sDev);
  }

  // 计算配合
  if (tfqCurrentHole && tfqCurrentShaft) {
    const fitResult = tfqCalcFitResult(tfqCurrentHole, tfqCurrentShaft);
    tfqSetFitResult(fitResult);

    if (fitResult.type === 'interference') {
      tfqMaxGyl = fitResult.max;
    } else if (fitResult.type === 'transition') {
      tfqMaxGyl = fitResult.maxInterference || 0;
    } else {
      tfqMaxGyl = 0;
    }
    tfqCalcAndShowTemp(D);
  }

  tfqDrawToleranceDiagram();
}

// ============================================================
// 显示更新函数
// ============================================================
function tfqSetHoleDisplay(dev) {
  const el = document.getElementById('tfqHoleDevDisplay');
  const labelH = document.getElementById('tfqLabelHCode');
  const hCode = document.getElementById('tfqInputH').value.trim().toUpperCase();
  if (labelH) labelH.textContent = hCode || 'H';

  if (!dev) {
    if (el) { el.innerHTML = '<span style="color:#bbb;font-size:16px;">---</span>'; el.classList.add('invalid'); }
    return;
  }
  if (el) {
    el.classList.remove('invalid');
    const { esStr, eiStr } = tfqFormatDeviation(dev.es, dev.ei);
    el.innerHTML = '<span class="tq-dv-es">ES &nbsp;' + esStr + '</span><span class="tq-dv-ei">EI &nbsp;' + eiStr + '</span>';
  }
}

function tfqSetShaftDisplay(dev) {
  const el = document.getElementById('tfqShaftDevDisplay');
  const labelS = document.getElementById('tfqLabelSCode');
  const sCode = document.getElementById('tfqInputS').value.trim().toLowerCase();
  if (labelS) labelS.textContent = sCode || 'h';

  if (!dev) {
    if (el) { el.innerHTML = '<span style="color:#bbb;font-size:16px;">---</span>'; el.classList.add('invalid'); }
    return;
  }
  if (el) {
    el.classList.remove('invalid');
    const { esStr, eiStr } = tfqFormatDeviation(dev.es, dev.ei);
    el.innerHTML = '<span class="tq-dv-es">es &nbsp;' + esStr + '</span><span class="tq-dv-ei">ei &nbsp;' + eiStr + '</span>';
  }
}

function tfqSetFitResult(result) {
  const el1 = document.getElementById('tfqFitLabel1');
  const el2 = document.getElementById('tfqFitLabel2');
  const el3 = document.getElementById('tfqFitLabel3');
  const el4 = document.getElementById('tfqFitLabel4');

  if (!result) {
    if (el1) el1.textContent = '最大间隙';
    if (el2) el2.textContent = '最小间隙';
    if (el3) { el3.textContent = '---'; el3.classList.add('invalid'); }
    if (el4) { el4.textContent = '---'; el4.classList.add('invalid'); }
    return;
  }
  if (el3) el3.classList.remove('invalid');
  if (el4) el4.classList.remove('invalid');

  if (result.type === 'clearance') {
    if (el1) el1.textContent = '最大间隙';
    if (el2) el2.textContent = '最小间隙';
    if (el3) el3.textContent = tfqFmtNum(result.max);
    if (el4) el4.textContent = tfqFmtNum(result.min);
  } else if (result.type === 'interference') {
    if (el1) el1.textContent = '最大过盈';
    if (el2) el2.textContent = '最小过盈';
    if (el3) el3.textContent = tfqFmtNum(result.max);
    if (el4) el4.textContent = tfqFmtNum(result.min);
  } else {
    if (el1) el1.textContent = '最大间隙';
    if (el2) el2.textContent = '最大过盈';
    if (el3) el3.textContent = tfqFmtNum(result.maxClearance);
    if (el4) el4.textContent = tfqFmtNum(result.maxInterference);
  }
}

function tfqSetTempResult(text) {
  const el = document.getElementById('tfqTempResult');
  if (el) el.textContent = text || '';
}

function tfqCalcAndShowTemp(D) {
  const fc = document.querySelector('input[name="tfqFitClass"]:checked').value;
  if (fc !== 'interference') { tfqSetTempResult(''); return; }
  if (tfqMaxGyl <= 0) { tfqSetTempResult(''); return; }

  const coeff = parseFloat(document.getElementById('tfqInputCoeff').value);
  if (isNaN(coeff) || coeff <= 0) { tfqSetTempResult(''); return; }

  const res = tfqCalcAssemblyTemp(D, tfqMaxGyl, coeff);
  if (res.error) {
    tfqSetTempResult(res.error);
  } else {
    tfqSetTempResult('孔零件加热至 ' + res.heatTemp + ' ℃，或轴零件冷缩至 -' + Math.abs(res.coolTemp) + ' ℃，温差需满足 ' + res.deltaT + ' ℃');
  }
}

function tfqFmtNum(v) {
  if (v === null || v === undefined) return '---';
  return parseFloat(v.toFixed(6)).toString();
}

// ============================================================
// 公差带图示绘制
// ============================================================
function tfqDrawToleranceDiagram() {
  const canvas = document.getElementById('tfqToleranceCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const zeroY = H / 2;
  const holeX = W * 0.22;
  const shaftX = W * 0.72;
  const barW = 60;

  // 背景和零线
  ctx.fillStyle = '#f8f9fa';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(holeX - barW / 2 - 30, 5, barW + 60, H - 10);
  ctx.fillRect(shaftX - barW / 2 - 30, 5, barW + 60, H - 10);

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

  ctx.fillStyle = '#555';
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('0', 12, zeroY - 4);

  // 计算缩放比例
  let scale = 300;
  if (tfqCurrentHole || tfqCurrentShaft) {
    let maxDeviation = 0;
    if (tfqCurrentHole) {
      maxDeviation = Math.max(maxDeviation, Math.abs(tfqCurrentHole.es), Math.abs(tfqCurrentHole.ei));
    }
    if (tfqCurrentShaft) {
      maxDeviation = Math.max(maxDeviation, Math.abs(tfqCurrentShaft.es), Math.abs(tfqCurrentShaft.ei));
    }
    if (maxDeviation > 0) {
      const requiredScale = (H * 0.8) / maxDeviation;
      scale = Math.min(requiredScale, 5000);
    }
  }

  if (tfqCurrentHole) {
    tfqDrawBar(ctx, holeX, barW, zeroY, tfqCurrentHole.es, tfqCurrentHole.ei, H, '#4a90d9', '#2c6fad', '孔', scale);
  }
  if (tfqCurrentShaft) {
    tfqDrawBar(ctx, shaftX, barW, zeroY, tfqCurrentShaft.es, tfqCurrentShaft.ei, H, '#e8734a', '#c25630', '轴', scale);
  }
}

function tfqDrawBar(ctx, cx, barW, zeroY, es, ei, H, fillColor, strokeColor, label, scale) {
  const esY = zeroY - es * scale;
  const eiY = zeroY - ei * scale;
  const barH = Math.abs(esY - eiY);
  const barTop = Math.min(esY, eiY);

  ctx.save();
  ctx.fillStyle = fillColor + 'cc';
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.fillRect(cx - barW / 2, barTop, barW, barH);
  ctx.strokeRect(cx - barW / 2, barTop, barW, barH);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const midY = barTop + barH / 2;
  ctx.fillText(label, cx, midY);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#333';
  ctx.font = '11px Arial';
  ctx.textAlign = 'left';
  const { esStr, eiStr } = tfqFormatDeviation(es, ei);
  ctx.fillText(esStr, cx + barW / 2 + 4, esY + 3);
  ctx.fillText(eiStr, cx + barW / 2 + 4, eiY + 3);
  ctx.restore();

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

// ============================================================
// 公差计算核心函数 (内联版本)
// ============================================================

function tfqGetNumbers(str) { return str.replace(/[a-zA-Z]/g, '').trim(); }
function tfqGetString(str) { return str.replace(/[0-9]/g, '').trim(); }

function tfqGetITValue(level, D) {
  D = parseFloat(D);
  for (const row of IT_TABLE) {
    if (parseFloat(row.dia_lower) < D && parseFloat(row.dia_upper) >= D) {
      const v = row[level];
      return (v !== undefined && v !== null) ? parseFloat(v) : null;
    }
  }
  return null;
}

function tfqGetShaftFundDev(field, D) {
  D = parseFloat(D);
  for (const row of SHAFT_TABLE) {
    if (parseFloat(row.dia_lower) < D && parseFloat(row.dia_upper) >= D) {
      const v = row[field];
      return (v !== undefined && v !== null) ? parseFloat(v) : null;
    }
  }
  return null;
}

function tfqGetHoleFundDev(field, D) {
  D = parseFloat(D);
  for (const row of HOLE_TABLE) {
    if (parseFloat(row.dia_lower) < D && parseFloat(row.dia_upper) >= D) {
      const v = row[field];
      return (v !== undefined && v !== null) ? parseFloat(v) : null;
    }
  }
  return null;
}

function tfqFormatDeviation(es, ei) {
  function numToStr(v) {
    if (v === 0) return '0';
    return parseFloat(v.toFixed(6)).toString();
  }
  let _es = numToStr(es);
  let _ei = numToStr(ei);
  let esS = (es > 0 ? '+' : (es < 0 ? '' : ' ')) + _es;
  let eiS = (ei > 0 ? '+' : (ei < 0 ? '' : ' ')) + _ei;
  return { esStr: esS, eiStr: eiS };
}

function tfqCalcHoleDeviation(hCode, D) {
  hCode = hCode.toUpperCase().trim();
  D = parseFloat(D);
  if (!hCode || isNaN(D) || D <= 0) return null;
  const letter = tfqGetString(hCode);
  const numStr = tfqGetNumbers(hCode);
  const grade = parseInt(numStr);
  const ITV = tfqGetITValue('IT' + numStr, D);
  if (ITV === null) return null;

  if (['A', 'B', 'C', 'CD', 'D', 'E', 'EF', 'F', 'FG', 'G', 'H'].includes(letter)) {
    const EI = tfqGetHoleFundDev(letter, D);
    if (EI === null) return null;
    return { es: EI + ITV, ei: EI };
  }
  if (letter === 'JS') return { es: ITV / 2, ei: -(ITV / 2) };
  if (letter === 'J') {
    if (numStr === '6' || numStr === '7' || numStr === '8') {
      const ES = tfqGetHoleFundDev('J' + numStr, D);
      if (ES === null) return null;
      return { es: ES, ei: ES - ITV };
    }
    return { es: ITV / 2, ei: -(ITV / 2) };
  }
  if (letter === 'K') {
    let ES;
    if (['01', '0', '1', '2', '3', '4', '5', '6', '7', '8'].includes(numStr)) {
      ES = tfqGetHoleFundDev('K01_8', D);
      if (ES !== null && D > 3 && grade >= 3 && grade <= 8) {
        const tri = tfqGetHoleFundDev('tri_it' + numStr, D);
        if (tri !== null) ES = ES + tri;
      }
    } else {
      ES = tfqGetHoleFundDev('K9_18', D);
    }
    if (ES === null) return null;
    return { es: ES, ei: ES - ITV };
  }
  if (letter === 'M') {
    let ES;
    if (['01', '0', '1', '2', '3', '4', '5', '6', '7', '8'].includes(numStr)) {
      ES = tfqGetHoleFundDev('M01_8', D);
      if (ES !== null && D > 3 && grade >= 3 && grade <= 8) {
        const tri = tfqGetHoleFundDev('tri_it' + numStr, D);
        if (tri !== null) ES = ES + tri;
      }
    } else {
      ES = tfqGetHoleFundDev('M9_18', D);
    }
    if (ES === null) return null;
    return { es: ES, ei: ES - ITV };
  }
  if (letter === 'N') {
    let ES;
    if (['01', '0', '1', '2', '3', '4', '5', '6', '7', '8'].includes(numStr)) {
      ES = tfqGetHoleFundDev('N01_8', D);
      if (ES !== null && D > 3 && grade >= 3 && grade <= 8) {
        const tri = tfqGetHoleFundDev('tri_it' + numStr, D);
        if (tri !== null) ES = ES + tri;
      }
    } else {
      ES = tfqGetHoleFundDev('N9_18', D);
    }
    if (ES === null) return null;
    return { es: ES, ei: ES - ITV };
  }
  const upperLetters = ['P', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z', 'ZA', 'ZB', 'ZC'];
  if (upperLetters.includes(letter)) {
    let ES = tfqGetHoleFundDev(letter, D);
    if (ES === null) return null;
    if (D > 3 && grade >= 3 && grade <= 8) {
      const tri = tfqGetHoleFundDev('tri_it' + numStr, D);
      if (tri !== null) ES = ES + tri;
    }
    return { es: ES, ei: ES - ITV };
  }
  return null;
}

function tfqCalcShaftDeviation(sCode, D) {
  sCode = sCode.toLowerCase().trim();
  D = parseFloat(D);
  if (!sCode || isNaN(D) || D <= 0) return null;
  const letter = tfqGetString(sCode);
  const numStr = tfqGetNumbers(sCode);
  const ITV = tfqGetITValue('IT' + numStr, D);
  if (ITV === null) return null;

  if (['a', 'b', 'c', 'cd', 'd', 'e', 'ef', 'f', 'fg', 'g', 'h'].includes(letter)) {
    const es = tfqGetShaftFundDev(letter, D);
    if (es === null) return null;
    return { es: es, ei: es - ITV };
  }
  if (letter === 'js') return { es: ITV / 2, ei: -(ITV / 2) };
  if (letter === 'j') {
    if (numStr === '5' || numStr === '6') {
      const ei = tfqGetShaftFundDev('j6', D);
      if (ei === null) return null;
      return { es: ITV + ei, ei: ei };
    }
    if (numStr === '7') {
      const ei = tfqGetShaftFundDev('j7', D);
      if (ei === null) return null;
      return { es: ITV + ei, ei: ei };
    }
    if (numStr === '8') {
      const ei = tfqGetShaftFundDev('j8', D);
      if (ei === null) return null;
      return { es: ITV + ei, ei: ei };
    }
    return { es: ITV / 2, ei: -(ITV / 2) };
  }
  if (letter === 'k') {
    let ei;
    if (['4', '5', '6', '7'].includes(numStr)) {
      ei = tfqGetShaftFundDev('k4_7', D);
    } else {
      ei = tfqGetShaftFundDev('k01_3_k8_18', D);
    }
    if (ei === null) return null;
    return { es: ITV + ei, ei: ei };
  }
  const lowerLetters = ['m', 'n', 'p', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', 'za', 'zb', 'zc'];
  if (lowerLetters.includes(letter)) {
    const ei = tfqGetShaftFundDev(letter, D);
    if (ei === null) return null;
    return { es: ITV + ei, ei: ei };
  }
  return null;
}

function tfqCalcFitResult(holeDeviation, shaftDeviation) {
  const { es: HES, ei: HEI } = holeDeviation;
  const { es: SES, ei: SEI } = shaftDeviation;
  const maxClearance = HES - SEI;
  const minClearance = HEI - SES;
  if (minClearance >= 0) {
    return { type: 'clearance', max: maxClearance, min: minClearance };
  } else if (maxClearance <= 0) {
    return { type: 'interference', max: -minClearance, min: -maxClearance };
  } else {
    return { type: 'transition', maxClearance: maxClearance, maxInterference: -minClearance };
  }
}

function tfqCalcAssemblyTemp(D, maxGyl, coeff) {
  D = parseFloat(D);
  maxGyl = parseFloat(maxGyl);
  coeff = parseFloat(coeff);
  let safetyFactor = 0.2;
  if (maxGyl > 0.5) safetyFactor = 0.3;
  else if (maxGyl > 0.3) safetyFactor = 0.2;
  else if (maxGyl > 0.2) safetyFactor = 0.1;
  else if (maxGyl < 0.2) safetyFactor = 0;
  let wdpp = 1;
  let pz;
  while (true) {
    pz = 0.000001 * coeff * D * wdpp;
    if (pz >= maxGyl + safetyFactor) break;
    wdpp++;
    if (wdpp > 400) {
      return { error: '出于安全考虑，系统无法给出合理可参照的加热或冷缩温度。' };
    }
  }
  return { heatTemp: wdpp + 25, coolTemp: -(wdpp - 25), deltaT: wdpp };
}
