// 深沟球轴承有效游隙计算工具
// 加载材料数据
if (typeof materialsDB === 'undefined') {
    const script = document.createElement('script');
    script.src = 'materials.js';
    script.onload = function () {
        console.log('材料数据加载完成');
    };
    script.onerror = function () {
        console.error('材料数据加载失败');
    };
    document.head.appendChild(script);
}

function createDeepGrooveClearanceModal() {
    // 创建模态框容器
    const modal = document.createElement('div');
    modal.id = 'deepGrooveClearanceModal';
    modal.className = 'price-ref-modal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.6);
        z-index: 10000;
        align-items: center;
        justify-content: center;
        padding: 6px;
    `;

    // 模态框内容
    modal.innerHTML = `
        <div class="price-ref-content">
            <div style="position: relative; background: linear-gradient(135deg, #00a8ff, #0066cc); color: white; padding: 0 20px;">
                <h2 style="margin: 0; padding: 15px 0; font-size: 18px; text-align: center; font-weight: 600; letter-spacing: 1px;">深沟球轴承有效游隙计算（未考虑载荷）</h2>
                <button class="price-ref-close" onclick="closeDeepGrooveClearanceModal()" style="
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
            <div class="price-ref-panel active" style="display: flex; flex-direction: column; height: calc(100vh - 120px);">
                <div style="flex-shrink: 0;">
                    <style>
                        .deep-groove-table tr {
                            height: 30px;
                        }
                        .deep-groove-table td,
                        .deep-groove-table th {
                            padding: 0 5px;
                            vertical-align: middle;
                        }
                        .deep-groove-table input,
                        .deep-groove-table select {
                            height: 30px;
                            box-sizing: border-box;
                            margin: 0;
                            padding: 0 5px;
                            border: 1px solid #ddd;
                        }
                    </style>
                    <table class="deep-groove-table" style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 0;">
                        <colgroup>
                            <col style="width:80px">
                            <col style="width:120px">
                            <col style="width:80px">
                            <col style="width:100px">
                            <col style="width:80px">
                            <col>
                        </colgroup>
                        <thead>
                            <tr>
                                <th style="background: #f0f4fb; color: #1a3a6b; font-weight: 600; white-space: nowrap; text-align: center; border: 1px solid #dde3ed; padding: 0 5px; font-size: 13px; width: 80px;">轴承型号</th>
                                <th style="border: 1px solid #dde3ed; padding: 0 5px; text-align: left;"><input type="text" id="dg_bearingModel" value="6004" style="width:100%; font-size: 13px;"></th>
                                <th style="background: #f0f4fb; color: #1a3a6b; font-weight: 600; white-space: nowrap; text-align: center; border: 1px solid #dde3ed; padding: 0 5px; font-size: 13px;">精度等级</th>
                                <th style="border: 1px solid #dde3ed; padding: 0 5px; width: 80px;">
                                    <select id="dg_precision" style="width:100%; font-size: 13px;">
                                        <option value="P0">P0</option>
                                        <option value="P6">P6</option>
                                        <option value="P5">P5</option>
                                        <option value="P4">P4</option>
                                    </select>
                                </th>
                                <th style="background: #f0f4fb; color: #1a3a6b; font-weight: 600; white-space: nowrap; text-align: center; border: 1px solid #dde3ed; padding: 5px; font-size: 13px;">游隙组别</th>
                                <th style="border: 1px solid #dde3ed; padding: 5px; width: 80px;">
                                    <select id="dg_clearanceGroup" style="width:100%; font-size: 13px;">
                                        <option value="C2">C2</option>
                                        <option value="CM">CM</option>
                                        <option value="C0">C0</option>
                                        <option value="C3">C3</option>
                                        <option value="C4">C4</option>
                                        <option value="C5">C5</option>
                                    </select>
                                </th>
                            </tr>
                        </thead>
                    </table>
                </div>
                <div style="flex: 1; overflow-y: auto; padding: 20px 0;">
                <table class="deep-groove-table" style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
                    <colgroup>
                        <col style="width:50px">
                        <col style="width:80px">
                        <col style="width:90px">
                        <col style="width:90px">
                        <col style="width:90px">
                        <col>
                    </colgroup>
                    <thead>
                        <tr>
                            <th style="background: #f0f4fb; color: #1a3a6b; font-weight: 600; white-space: nowrap; text-align: center; border: 1px solid #dde3ed; padding: 8px 5px; font-size: 13px;">分类</th>
                                    <th style="background: #f0f4fb; color: #1a3a6b; font-weight: 600; white-space: nowrap; text-align: center; border: 1px solid #dde3ed; padding: 8px 5px; font-size: 13px;">项目/mm</th>
                                    <th style="background: #f0f4fb; color: #1a3a6b; font-weight: 600; white-space: nowrap; text-align: center; border: 1px solid #dde3ed; padding: 8px 5px; font-size: 13px;">基本尺寸</th>
                                    <th style="background: #f0f4fb; color: #1a3a6b; font-weight: 600; white-space: nowrap; text-align: center; border: 1px solid #dde3ed; padding: 8px 5px; font-size: 13px;">公差 MIN</th>
                                    <th style="background: #f0f4fb; color: #1a3a6b; font-weight: 600; white-space: nowrap; text-align: center; border: 1px solid #dde3ed; padding: 8px 5px; font-size: 13px;">公差 MAX</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="group" rowspan="7" style="background: #edf1f8; color: #1a3a6b; font-weight: 600; text-align: center; vertical-align: middle; border: 1px solid #dde3ed; padding: 5px; font-size: 13px;">轴承</td>
                            <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 5px; font-size: 13px;">原始游隙</td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_clearance_min" step="0.001" style="font-size: 13px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_clearance_max" step="0.001" style="font-size: 13px;"></td>
                        </tr>
                        <tr>
                            <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 5px; font-size: 13px;">内径尺寸</td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_bore_d" step="0.001" style="font-size: 13px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_bore_tol_min" step="0.001" style="font-size: 13px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_bore_tol_max" step="0.001" style="font-size: 13px;"></td>
                        </tr>
                        <tr>
                            <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 5px; font-size: 13px;">中心径</td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_center_diameter" step="0.001" style="font-size: 13px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"></td>
                        </tr>
                        <tr>
                            <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 5px; font-size: 13px;">钢球直径</td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_ball_d" step="0.001" style="font-size: 13px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"></td>
                        </tr>
                        <tr>
                            <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 5px; font-size: 13px;">内圈沟径</td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_inner_groove_d" step="0.001" style="font-size: 13px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"></td>
                        </tr>
                        <tr>
                            <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 5px; font-size: 13px;">外径尺寸</td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_outer_D" step="0.001" style="font-size: 13px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_outer_tol_min" step="0.001" style="font-size: 13px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_outer_tol_max" step="0.001" style="font-size: 13px;"></td>
                        </tr>
                        <tr>
                            <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 5px; font-size: 13px;">外圈沟径</td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_outer_groove_D" step="0.001" style="font-size: 13px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"></td>
                        </tr>
                        <tr>
                            <td class="group" rowspan="2" style="background: #edf1f8; color: #1a3a6b; font-weight: 600; text-align: center; vertical-align: middle; border: 1px solid #dde3ed; padding: 5px; font-size: 13px;">轴</td>
                            <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 5px; font-size: 13px;">轴外径</td>
                            <td style="border: 1px solid #dde3ed; padding: 5px; font-size: 13px; color: #555; text-align: left;" id="dg_shaft_d_display">20.000</td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_shaft_tol_min" value="-0.006" step="0.001" style="font-size: 13px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_shaft_tol_max" value="0.006" step="0.001" style="font-size: 13px;"></td>
                            <input type="hidden" id="dg_shaft_d" value="20">
                        </tr>
                        <tr>
                            <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 5px; font-size: 13px;">轴孔径</td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_shaft_hole_d" value="0" step="0.001" style="font-size: 13px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;">
                                <select id="dg_shaft_roughness_type" style="width:100%; font-size: 13px;">
                                    <option value="grinding">磨削轴</option>
                                    <option value="turning">车削轴</option>
                                </select>
                            </td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;">
                                <select id="dg_shaft_tolerance" style="width:100%; font-size: 13px;">
                                    <option value="custom">选公差</option>
                                    <option value="g6">g6</option>
                                    <option value="h6">h6</option>
                                    <option value="js5">js5</option>
                                    <option value="js6">js6</option>
                                    <option value="j6">j6</option>
                                    <option value="k5">k5</option>
                                    <option value="k6">k6</option>
                                    <option value="m5">m5</option>
                                    <option value="m6">m6</option>
                                    <option value="n6">n6</option>
                                    <option value="p6">p6</option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td class="group" rowspan="2" style="background: #edf1f8; color: #1a3a6b; font-weight: 600; text-align: center; vertical-align: middle; border: 1px solid #dde3ed; padding: 5px; font-size: 13px;">壳体</td>
                            <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 5px; font-size: 13px;">壳体孔径</td>
                            <td style="border: 1px solid #dde3ed; padding: 5px; font-size: 13px; color: #555; text-align: left;" id="dg_housing_D_display">42.000</td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_housing_tol_min" value="0" step="0.001" style="font-size: 13px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_housing_tol_max" value="0.025" step="0.001" style="font-size: 13px;"></td>
                            <input type="hidden" id="dg_housing_D" value="42">
                        </tr>
                        <tr>
                            <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 5px; font-size: 13px;">壳体外径</td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_housing_outer_D" value="48" step="0.001" style="font-size: 13px;"></td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;">
                                <select id="dg_housing_roughness_type" style="width:100%; font-size: 13px;">
                                    <option value="turning">车削孔</option>
                                    <option value="grinding">磨削孔</option>
                                </select>
                            </td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;">
                                <select id="dg_housing_tolerance" style="width:100%; font-size: 13px;">
                                    <option value="custom">选公差</option>
                                    <option value="G7">G7</option>
                                    <option value="H6">H6</option>
                                    <option value="H7">H7</option>
                                    <option value="H8">H8</option>
                                    <option value="JS6">JS6</option>
                                    <option value="JS7">JS7</option>
                                    <option value="J6">J6</option>
                                    <option value="J7">J7</option>
                                    <option value="K6">K6</option>
                                    <option value="K7">K7</option>
                                    <option value="M6">M6</option>
                                    <option value="M7">M7</option>
                                    <option value="N6">N6</option>
                                    <option value="N7">N7</option>
                                    <option value="P7">P7</option>
                                </select>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table class="deep-groove-table" style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
                    <colgroup>
                        <col style="width:80px">
                        <col style="width:120px">
                        <col style="width:80px">
                        <col style="width:120px">
                        <col style="width:80px">
                        <col style="width:120px">
                    </colgroup>
                    <tbody>
                        <tr>
                            <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 5px; font-size: 13px; text-align: center;">基准温度</td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_temp_ref" value="25" step="1" style="font-size: 13px;"></td>
                            <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 5px; font-size: 13px; text-align: center;">轴温度</td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_temp_shaft" value="90" step="1" style="font-size: 13px;"></td>
                            <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 5px; font-size: 13px; text-align: center;">壳体温度</td>
                            <td style="border: 1px solid #dde3ed; padding: 5px;"><input type="number" id="dg_temp_housing" value="25" step="1" style="font-size: 13px;"></td>
                        </tr>
                    </tbody>
                </table>

                <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px; padding: 8px 0; border-bottom: 2px solid #1a3a6b;">
                    <span style="font-weight: 700; font-size: 14px; color: #1a3a6b; letter-spacing: 2px;">材料属性</span>
                    <button class="btn-secondary" style="font-size:11px;padding:3px 10px; background: #edf1f8; color: #1a3a6b; border: 1px solid #c5d3e8; white-space: nowrap; width: auto; margin-left: 20px;" onclick="showDeepGrooveMaterialTable()">查看材料属性表</button>
                </div>
                <table class="deep-groove-table" style="width:100%; border-collapse: collapse; font-size: 13px; margin-bottom: 15px;">
                    <colgroup>
                        <col style="width:80px">
                        <col style="width:200px">
                        <col style="width:80px">
                        <col style="width:80px">
                        <col style="width:80px">
                    </colgroup>
                    <thead>
                        <tr>
                            <th style="background: #f0f4fb; color: #1a3a6b; font-weight: 600; white-space: nowrap; text-align: center; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 13px;">分类</th>
                            <th style="background: #f0f4fb; color: #1a3a6b; font-weight: 600; white-space: nowrap; text-align: center; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 13px;">材料名称</th>
                            <th style="background: #f0f4fb; color: #1a3a6b; font-weight: 600; white-space: nowrap; text-align: center; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 13px;">弹性模量</th>
                            <th style="background: #f0f4fb; color: #1a3a6b; font-weight: 600; white-space: nowrap; text-align: center; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 13px;">泊松比</th>
                            <th style="background: #f0f4fb; color: #1a3a6b; font-weight: 600; white-space: nowrap; text-align: center; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 13px;">热膨胀系数</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 13px; text-align: center;">套圈材料</td>
                            <td style="border: 1px solid #dde3ed; padding: 6px 10px;"><input type="text" id="dg_ring_material" list="dg_ring_material_list" value="GCr15" oninput="onDeepGrooveMaterialInput('ring')" onchange="updateDeepGrooveMaterialDisplay('ring')" style="width:95%; font-size: 13px;"><datalist id="dg_ring_material_list"></datalist></td>
                            <td style="background: #f0f7ff; color: #1565c0; text-align: center; font-family: monospace; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 13px;" id="dg_ring_E">—</td>
                            <td style="background: #f0f7ff; color: #1565c0; text-align: center; font-family: monospace; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 13px;" id="dg_ring_v">—</td>
                            <td style="background: #f0f7ff; color: #1565c0; text-align: center; font-family: monospace; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 13px;" id="dg_ring_alpha">—</td>
                        </tr>
                        <tr>
                            <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 13px; text-align: center;">座孔材料</td>
                            <td style="border: 1px solid #dde3ed; padding: 6px 10px;"><input type="text" id="dg_housing_material" list="dg_housing_material_list" value="YL113丨ADC12丨YZAlSi11Cu3" oninput="onDeepGrooveMaterialInput('housing')" onchange="updateDeepGrooveMaterialDisplay('housing')" style="width:95%; font-size: 13px;"><datalist id="dg_housing_material_list"></datalist></td>
                            <td style="background: #f0f7ff; color: #1565c0; text-align: center; font-family: monospace; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 13px;" id="dg_housing_E">—</td>
                            <td style="background: #f0f7ff; color: #1565c0; text-align: center; font-family: monospace; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 13px;" id="dg_housing_v">—</td>
                            <td style="background: #f0f7ff; color: #1565c0; text-align: center; font-family: monospace; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 13px;" id="dg_housing_alpha">—</td>
                        </tr>
                        <tr>
                            <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 13px; text-align: center;">轴材料</td>
                            <td style="border: 1px solid #dde3ed; padding: 6px 10px;"><input type="text" id="dg_shaft_material" list="dg_shaft_material_list" value="20CrMnTi" oninput="onDeepGrooveMaterialInput('shaft')" onchange="updateDeepGrooveMaterialDisplay('shaft')" style="width:95%; font-size: 13px;"><datalist id="dg_shaft_material_list"></datalist></td>
                            <td style="background: #f0f7ff; color: #1565c0; text-align: center; font-family: monospace; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 13px;" id="dg_shaft_E">—</td>
                            <td style="background: #f0f7ff; color: #1565c0; text-align: center; font-family: monospace; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 13px;" id="dg_shaft_v">—</td>
                            <td style="background: #f0f7ff; color: #1565c0; text-align: center; font-family: monospace; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 13px;" id="dg_shaft_alpha">—</td>
                        </tr>
                    </tbody>
                </table>

                <div class="btn-row">
                    <button class="btn-secondary" onclick="resetDeepGrooveDefaults()">重置默认值</button>
                    <button class="btn-primary" onclick="calculateDeepGrooveClearance()">立即计算</button>
                </div>

                <div class="card" id="dg_factors-card" style="display:none; margin-bottom: 18px;">
                    <div class="card-header" style="background: #edf1f8; border-bottom: 1px solid #dde3ed; padding: 9px 16px; font-weight: 600; font-size: 13px; color: #1a3a6b; display: flex; align-items: center; gap: 6px;">
                        <span>影响因素</span>
                    </div>
                    <div class="card-body">
                        <table style="width:100%; border-collapse: collapse; font-size: 12px;">
                            <colgroup>
                                <col style="width:260px">
                                <col style="width:150px">
                                <col>
                            </colgroup>
                            <tbody>
                                <tr>
                                    <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 6px 10px;">轴的粗糙度引起过盈量减小系数λRai</td>
                                    <td style="border: 1px solid #dde3ed; padding: 6px 10px;" id="dg_f_shaft_rough_type">—</td>
                                    <td style="text-align: right; font-family: monospace; color: #555; border: 1px solid #dde3ed; padding: 6px 10px;" id="dg_f_lambda_i">—</td>
                                </tr>
                                <tr>
                                    <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 6px 10px;">壳体的粗糙度引起过盈量减小系数λRae</td>
                                    <td style="border: 1px solid #dde3ed; padding: 6px 10px;" id="dg_f_housing_rough_type">—</td>
                                    <td style="text-align: right; font-family: monospace; color: #555; border: 1px solid #dde3ed; padding: 6px 10px;" id="dg_f_lambda_e">—</td>
                                </tr>
                                <tr>
                                    <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 6px 10px;">过盈量引起内圈滚道膨胀率 λi</td>
                                    <td style="border: 1px solid #dde3ed; padding: 6px 10px;"></td>
                                    <td style="text-align: right; font-family: monospace; color: #555; border: 1px solid #dde3ed; padding: 6px 10px;" id="dg_f_lambda_i2">—</td>
                                </tr>
                                <tr>
                                    <td style="background: #f8f9fc; color: #555; white-space: nowrap; border: 1px solid #dde3ed; padding: 6px 10px;">过盈量引起外圈滚道膨胀率 λe</td>
                                    <td style="border: 1px solid #dde3ed; padding: 6px 10px;"></td>
                                    <td style="text-align: right; font-family: monospace; color: #555; border: 1px solid #dde3ed; padding: 6px 10px;" id="dg_f_lambda_e2">—</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div id="dg_result-card" style="display:none;">
                    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px; padding: 8px 0; border-bottom: 2px solid #1a3a6b;">
                        <span style="font-weight: 700; font-size: 14px; color: #1a3a6b; letter-spacing: 2px;">计算结果</span>
                    </div>
                    <table class="deep-groove-table" style="width:100%; border-collapse: collapse; font-size: 12px; margin-bottom: 15px;">
                        <colgroup>
                            <col style="width:80px">
                            <col style="width:120px">
                            <col style="width:80px">
                            <col style="width:80px">
                            <col style="width:80px">
                        </colgroup>
                        <thead>
                            <tr>
                                <th style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center; background: #f8f9fc; color: #555;">分类</th>
                                <th style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center; background: #f8f9fc; color: #555;">方法</th>
                                <th style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center; background: #f8f9fc; color: #555;">Min</th>
                                <th style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center; background: #f8f9fc; color: #555;">Mean</th>
                                <th style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center; background: #f8f9fc; color: #555;">Max</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; background: #f8f9fc; color: #555;" rowspan="2">过盈量</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px;">内圈过盈量</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center;" id="dg_r_inner_int_min">—</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center;" id="dg_r_inner_int_mean">—</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center;" id="dg_r_inner_int_max">—</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px;">外圈过盈量</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center;" id="dg_r_outer_int_min">—</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center;" id="dg_r_outer_int_mean">—</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center;" id="dg_r_outer_int_max">—</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; background: #f8f9fc; color: #555;" rowspan="2">安装游隙</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px;">6σ公差法</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center;" id="dg_r_6sig_inst_min">—</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center;" id="dg_r_6sig_inst_mean">—</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center;" id="dg_r_6sig_inst_max">—</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; background: #f0f4f8;">原始公差法</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center; background: #f0f4f8;" id="dg_r_raw_inst_min">—</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center; background: #f0f4f8;" id="dg_r_raw_inst_mean">—</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center; background: #f0f4f8;" id="dg_r_raw_inst_max">—</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; background: #f8f9fc; color: #555;" rowspan="2">有效游隙</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px;">6σ公差法</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center;" id="dg_r_6sig_eff_min">—</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center;" id="dg_r_6sig_eff_mean">—</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center;" id="dg_r_6sig_eff_max">—</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; background: #f0f4f8;">原始公差法</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center; background: #f0f4f8;" id="dg_r_raw_eff_min">—</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center; background: #f0f4f8;" id="dg_r_raw_eff_mean">—</td>
                                <td style="border: 1px solid #dde3ed; padding: 6px 10px; text-align: center; background: #f0f4f8;" id="dg_r_raw_eff_max">—</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <!-- 材料属性表弹窗 -->
            <div class="material-modal-overlay" id="deepGrooveMaterialModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.45); z-index: 10001; align-items: center; justify-content: center;">
                <div class="material-modal" style="background: #fff; border-radius: 8px; padding: 24px 28px; max-width: 900px; width: 95%; max-height: 80vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);">
                    <div style="position: relative; background: linear-gradient(135deg, #00a8ff, #0066cc); color: white; padding: 0 20px; margin-bottom: 14px;">
                        <h2 style="margin: 0; padding: 12px 0; font-size: 15px; text-align: center; font-weight: 600; letter-spacing: 1px;">常用工程材料属性表</h2>
                        <button class="close-btn" onclick="hideDeepGrooveMaterialTable()" style="
                            position: absolute;
                            top: 8px;
                            right: 10px;
                            background: none;
                            border: none;
                            color: white;
                            font-size: 18px;
                            cursor: pointer;
                            padding: 0;
                            width: 25px;
                            height: 25px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">✕</button>
                    </div>
                    <div id="deepGrooveMaterialTableContent">加载中...</div>
                </div>
            </div>
        </div>
    `;

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
        .price-ref-content .card {
            background: #fff;
            border-radius: 6px;
            border: 1px solid #dde3ed;
            margin-bottom: 18px;
            overflow: hidden;
        }
        .price-ref-content .card-header {
            background: #edf1f8;
            border-bottom: 1px solid #dde3ed;
            padding: 9px 16px;
            font-weight: 600;
            font-size: 13px;
            color: #1a3a6b;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .price-ref-content .card-header::before {
            content: "";
            display: inline-block;
            width: 3px;
            height: 14px;
            background: #1a3a6b;
            border-radius: 2px;
        }
        .price-ref-content .card-body {
            padding: 16px;
        }
        .price-ref-content .card-body table {
            width: 100%;
            border-collapse: collapse;
        }
        .price-ref-content .card-body th, .price-ref-content .card-body td {
            border: 1px solid #dde3ed;
            padding: 6px 10px;
            text-align: left;
            vertical-align: middle;
        }
        .price-ref-content .card-body th {
            background: #f0f4fb;
            color: #1a3a6b;
            font-weight: 600;
            white-space: nowrap;
            text-align: center;
        }
        .price-ref-content .card-body table td.label {
            background: #f8f9fc !important;
            color: #555 !important;
            white-space: nowrap !important;
        }
        .price-ref-content .card-body table th {
            background: #f0f4fb !important;
            color: #1a3a6b !important;
            font-weight: 600 !important;
            white-space: nowrap !important;
            text-align: center !important;
        }
        .price-ref-content .card-body table td.group {
            background: #edf1f8 !important;
            color: #1a3a6b !important;
            font-weight: 600 !important;
            text-align: center !important;
            vertical-align: middle !important;
        }
        .price-ref-content .card-body td.calc {
            background: #f0f7ff;
            color: #1565c0;
            text-align: right;
            font-family: monospace;
        }
        .price-ref-content .card-body td.result-min {
            color: #c62828;
            text-align: center;
            font-family: monospace;
            font-weight: 600;
        }
        .price-ref-content .card-body td.result-mean {
            color: #2e7d32;
            text-align: center;
            font-family: monospace;
            font-weight: 600;
        }
        .price-ref-content .card-body td.result-max {
            color: #1565c0;
            text-align: center;
            font-family: monospace;
            font-weight: 600;
        }
        .price-ref-content .card-body td.center {
            text-align: center;
        }
        .price-ref-content .card-body td.val {
            text-align: right;
            font-family: monospace;
            color: #555;
        }
        .price-ref-content .card-body input[type="number"],
        .price-ref-content .card-body input[type="text"],
        .price-ref-content .card-body select {
            width: 100%;
            padding: 4px 7px;
            border: 1px solid #c5d3e8;
            border-radius: 3px;
            font-size: 13px;
            background: #fff;
            color: #333;
            outline: none;
            transition: border-color 0.15s;
        }
        .price-ref-content .card-body input[type="number"]:focus,
        .price-ref-content .card-body input[type="text"]:focus,
        .price-ref-content .card-body select:focus {
            border-color: #1a3a6b;
        }
        .price-ref-content .btn-row {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-bottom: 14px;
        }
        .price-ref-content button {
            padding: 8px 22px;
            border: none;
            border-radius: 4px;
            font-size: 13px;
            cursor: pointer;
            font-family: inherit;
        }
        .price-ref-content .btn-primary {
            background: #1a3a6b;
            color: #fff;
        }
        .price-ref-content .btn-primary:hover {
            background: #163260;
        }
        .price-ref-content .btn-secondary {
            background: #edf1f8;
            color: #1a3a6b;
            border: 1px solid #c5d3e8;
        }
        .price-ref-content .btn-secondary:hover {
            background: #dde3ed;
        }
        .price-ref-content .process-table td {
            font-size: 12px;
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(modal);
}

function openDeepGrooveBearingClearanceCalculator() {
    // 检查模态框是否已存在，不存在则创建
    let modal = document.getElementById('deepGrooveClearanceModal');
    if (!modal) {
        createDeepGrooveClearanceModal();
        modal = document.getElementById('deepGrooveClearanceModal');
        initDeepGrooveCalculator();
    }
    modal.style.display = 'flex';
}

function closeDeepGrooveClearanceModal() {
    const modal = document.getElementById('deepGrooveClearanceModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 更新内圈沟径和外圈沟径
function updateDeepGrooveGrooveDiameters() {
    // 获取当前输入值
    const centerDiameter = parseFloat(document.getElementById('dg_center_diameter').value) || 0;
    const ballSize = parseFloat(document.getElementById('dg_ball_d').value) || 0;
    const clearanceMin = parseFloat(document.getElementById('dg_clearance_min').value) || 0;
    const clearanceMax = parseFloat(document.getElementById('dg_clearance_max').value) || 0;

    // 计算内圈沟径和外圈沟径
    if (centerDiameter && ballSize) {
        // 计算游隙平均值的1/4
        const clearanceAvgQuarter = (clearanceMin + clearanceMax) / 4;

        // 计算内圈沟径和外圈沟径
        const innerGrooveD = centerDiameter - ballSize - clearanceAvgQuarter;
        const outerGrooveD = centerDiameter + ballSize + clearanceAvgQuarter;

        document.getElementById('dg_inner_groove_d').value = innerGrooveD.toFixed(3);
        document.getElementById('dg_outer_groove_D').value = outerGrooveD.toFixed(3);
    } else {
        document.getElementById('dg_inner_groove_d').value = 0;
        document.getElementById('dg_outer_groove_D').value = 0;
    }
}

function initDeepGrooveCalculator() {
    // 调用重置默认值函数来设置初始默认值
    resetDeepGrooveDefaults();

    updateDeepGrooveMaterialDisplay('ring');
    updateDeepGrooveMaterialDisplay('housing');
    updateDeepGrooveMaterialDisplay('shaft');

    // 添加精度等级和游隙组别的事件监听器
    const precisionEl = document.getElementById('dg_precision');
    const clearanceGroupEl = document.getElementById('dg_clearanceGroup');
    const bearingModelEl = document.getElementById('dg_bearingModel');

    if (precisionEl) {
        precisionEl.addEventListener('change', function () {
            updateDeepGrooveBearingParameters();
        });
    }

    if (clearanceGroupEl) {
        clearanceGroupEl.addEventListener('change', function () {
            updateDeepGrooveBearingParameters();
        });
    }

    if (bearingModelEl) {
        bearingModelEl.addEventListener('change', function () {
            updateDeepGrooveBearingParameters();
        });
    }

    // 添加原始游隙输入框的事件监听器，修改时重新计算沟径（不调用updateDeepGrooveBearingParameters以免覆盖用户输入）
    const clearanceMinEl = document.getElementById('dg_clearance_min');
    const clearanceMaxEl = document.getElementById('dg_clearance_max');

    if (clearanceMinEl) {
        clearanceMinEl.addEventListener('change', function () {
            updateDeepGrooveGrooveDiameters();
        });
    }

    if (clearanceMaxEl) {
        clearanceMaxEl.addEventListener('change', function () {
            updateDeepGrooveGrooveDiameters();
        });
    }

    // 添加中心径和钢球直径输入框的事件监听器，当它们变化时重新计算沟径
    const centerDiameterEl = document.getElementById('dg_center_diameter');
    const ballSizeEl = document.getElementById('dg_ball_d');

    if (centerDiameterEl) {
        centerDiameterEl.addEventListener('change', function () {
            updateDeepGrooveGrooveDiameters();
        });
    }

    if (ballSizeEl) {
        ballSizeEl.addEventListener('change', function () {
            updateDeepGrooveGrooveDiameters();
        });
    }

    // 添加公差带选择的事件监听器
    const shaftToleranceEl = document.getElementById('dg_shaft_tolerance');
    if (shaftToleranceEl) {
        shaftToleranceEl.addEventListener('change', function () {
            const toleranceCode = this.value;
            if (toleranceCode !== 'custom') {
                // 获取轴外径尺寸
                const shaftD = parseFloat(document.getElementById('dg_shaft_d').value) || 0;
                if (shaftD > 0) {
                    // 使用tolerance-query.js中的函数计算轴的偏差
                    const shaftDev = tfqCalcShaftDeviation(toleranceCode, shaftD);
                    if (shaftDev) {
                        // 填充轴外径的公差值
                        document.getElementById('dg_shaft_tol_min').value = shaftDev.ei.toFixed(3);
                        document.getElementById('dg_shaft_tol_max').value = shaftDev.es.toFixed(3);
                    }
                }
            }
        });
    }

    // 添加壳体外径公差带选择的事件监听器
    const housingToleranceEl = document.getElementById('dg_housing_tolerance');
    if (housingToleranceEl) {
        housingToleranceEl.addEventListener('change', function () {
            const toleranceCode = this.value;
            if (toleranceCode !== 'custom') {
                // 获取壳体孔径尺寸
                const housingD = parseFloat(document.getElementById('dg_housing_D').value) || 0;
                if (housingD > 0) {
                    // 使用tolerance-query.js中的函数计算孔的偏差
                    const holeDev = tfqCalcHoleDeviation(toleranceCode, housingD);
                    if (holeDev) {
                        // 填充壳体孔径的公差值
                        document.getElementById('dg_housing_tol_min').value = holeDev.ei.toFixed(3);
                        document.getElementById('dg_housing_tol_max').value = holeDev.es.toFixed(3);
                    }
                }
            }
        });
    }
}

function updateDeepGrooveBearingParameters() {
    const bearingModel = document.getElementById('dg_bearingModel').value;
    const precision = document.getElementById('dg_precision').value;
    const clearanceGroup = document.getElementById('dg_clearanceGroup').value;

    // 从轴承数据中获取轴承参数
    if (window.BearingData && window.BearingData.bearingData) {
        const bearing = window.BearingData.bearingData[bearingModel];
        if (bearing) {
            // 设置基本尺寸
            const boreD = bearing.d || 0;
            const outerD = bearing.D || 0;
            // 计算中心径：如果数据库中有定义则使用，否则使用(外径+内径)/2
            const centerDiameter = bearing.centerDiameter || (boreD + outerD) / 2;

            document.getElementById('dg_bore_d').value = boreD;
            document.getElementById('dg_outer_D').value = outerD;
            document.getElementById('dg_center_diameter').value = centerDiameter.toFixed(3);
            document.getElementById('dg_ball_d').value = (bearing.ballSize || 0).toFixed(3);

            // 更新轴外径和壳体孔径（固定值）
            document.getElementById('dg_shaft_d').value = boreD;
            // 轴外径的小数位数与内径尺寸一致
            const boreDValue = document.getElementById('dg_bore_d').value;
            const boreDecimalPlaces = boreDValue.toString().includes('.') ? boreDValue.split('.')[1].length : 0;
            document.getElementById('dg_shaft_d_display').textContent = boreD.toFixed(boreDecimalPlaces);

            document.getElementById('dg_housing_D').value = outerD;
            // 壳体孔径的小数位数与外径尺寸一致
            const outerDValue = document.getElementById('dg_outer_D').value;
            const outerDecimalPlaces = outerDValue.toString().includes('.') ? outerDValue.split('.')[1].length : 0;
            document.getElementById('dg_housing_D_display').textContent = outerD.toFixed(outerDecimalPlaces);

            // 计算并更新壳体外径：外径尺寸+6
            const housingOuterD = outerD + 6;
            document.getElementById('dg_housing_outer_D').value = housingOuterD.toFixed(outerDecimalPlaces);

            // 计算内圈沟径和外圈沟径
            if (centerDiameter && bearing.ballSize) {
                // 获取原始游隙值
                const clearanceMin = parseFloat(document.getElementById('dg_clearance_min').value) || 0;
                const clearanceMax = parseFloat(document.getElementById('dg_clearance_max').value) || 0;

                // 计算游隙平均值的1/4
                const clearanceAvgQuarter = (clearanceMin + clearanceMax) / 4;

                // 计算内圈沟径和外圈沟径
                const innerGrooveD = centerDiameter - bearing.ballSize - clearanceAvgQuarter;
                const outerGrooveD = centerDiameter + bearing.ballSize + clearanceAvgQuarter;

                document.getElementById('dg_inner_groove_d').value = innerGrooveD.toFixed(3);
                document.getElementById('dg_outer_groove_D').value = outerGrooveD.toFixed(3);
            } else {
                document.getElementById('dg_inner_groove_d').value = 0;
                document.getElementById('dg_outer_groove_D').value = 0;
            }

            // 获取公差数据
            if (window.BearingData.innerTol && window.BearingData.outerTol) {
                const innerTolData = window.BearingData.innerTol[precision];
                const outerTolData = window.BearingData.outerTol[precision];

                if (innerTolData) {
                    // 查找内径公差
                    for (const tol of innerTolData) {
                        if (bearing.d > tol.min && bearing.d <= tol.max) {
                            document.getElementById('dg_bore_tol_min').value = (tol.t.L / 1000).toFixed(3);
                            document.getElementById('dg_bore_tol_max').value = (tol.t.U / 1000).toFixed(3);
                            break;
                        }
                    }
                }

                if (outerTolData) {
                    // 查找外径公差
                    for (const tol of outerTolData) {
                        if (bearing.D > tol.min && bearing.D <= tol.max) {
                            document.getElementById('dg_outer_tol_min').value = (tol.t.L / 1000).toFixed(3);
                            document.getElementById('dg_outer_tol_max').value = (tol.t.U / 1000).toFixed(3);
                            break;
                        }
                    }
                }
            }

            // 获取游隙数据
            if (window.BearingData.clearanceRanges) {
                for (const range of window.BearingData.clearanceRanges) {
                    if (bearing.d > range.min && bearing.d <= range.max) {
                        const clearanceStr = range[clearanceGroup];
                        if (clearanceStr) {
                            const [min, max] = clearanceStr.split('～').map(val => parseFloat(val) / 1000);
                            document.getElementById('dg_clearance_min').value = min.toFixed(3);
                            document.getElementById('dg_clearance_max').value = max.toFixed(3);
                        }
                        break;
                    }
                }
            }
        }
    }


}

function getMatE(name) {
    if (typeof getMaterialProperty === 'function') {
        return getMaterialProperty(name, 'elasticModulus') / 1e9;
    }
    const material = materialsDB.find(m => m['材料名称'] === name);
    return material ? material['弹性模量(N/m^2)'] / 1e9 : NaN;
}

function getMatV(name) {
    if (typeof getMaterialProperty === 'function') {
        return getMaterialProperty(name, 'poissonRatio');
    }
    const material = materialsDB.find(m => m['材料名称'] === name);
    return material ? material['泊松比'] : NaN;
}

function getMatAlpha(name) {
    if (typeof getMaterialProperty === 'function') {
        return getMaterialProperty(name, 'thermalExpansion');
    }
    const material = materialsDB.find(m => m['材料名称'] === name);
    if (!material) return NaN;
    const key = Object.keys(material).find(k => k.includes('膨胀') || k.includes('扩张'));
    if (!key) return NaN;
    const v = material[key];
    return (v === null || v === undefined) ? NaN : Number(v);
}

function updateDeepGrooveMaterialDisplay(type) {
    const idMap = { ring: 'dg_ring_material', housing: 'dg_housing_material', shaft: 'dg_shaft_material' };
    const name = document.getElementById(idMap[type]).value;
    const E = getMatE(name);
    const v = getMatV(name);
    const alpha = getMatAlpha(name);
    document.getElementById('dg_' + type + '_E').textContent = isNaN(E) ? '—' : E.toFixed(1);
    document.getElementById('dg_' + type + '_v').textContent = isNaN(v) ? '—' : v.toFixed(3);
    document.getElementById('dg_' + type + '_alpha').textContent = isNaN(alpha) ? '—' : alpha.toExponential(3).replace('e-', 'e-0');
}

function onDeepGrooveMaterialInput(type) {
    const input = document.getElementById('dg_' + type + '_material');
    const datalist = document.getElementById('dg_' + type + '_material_list');
    const query = input.value.toLowerCase();

    datalist.innerHTML = '';

    if (typeof materialsDB !== 'undefined') {
        if (!query) {
            materialsDB.forEach(m => {
                const name = m['材料名称'];
                if (typeof name === 'string' && name.trim()) {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    datalist.appendChild(option);
                }
            });
        } else {
            materialsDB.forEach(m => {
                const name = m['材料名称'];
                if (typeof name === 'string' && name.trim() && name.toLowerCase().includes(query)) {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    datalist.appendChild(option);
                }
            });
        }
    }

    updateDeepGrooveMaterialDisplay(type);
}

function calculateDeepGrooveClearance() {
    const v = (id) => parseFloat(document.getElementById(id).value) || 0;

    const Gr_min = v('dg_clearance_min');
    const Gr_max = v('dg_clearance_max');
    const d = v('dg_bore_d');
    const bd_min = v('dg_bore_tol_min');
    const bd_max = v('dg_bore_tol_max');
    const di = v('dg_inner_groove_d');
    const D = v('dg_outer_D');
    const bD_min = v('dg_outer_tol_min');
    const bD_max = v('dg_outer_tol_max');
    const De = v('dg_outer_groove_D');
    const Dw = v('dg_ball_d');
    const ds = v('dg_shaft_d');
    const ds_min = v('dg_shaft_tol_min');
    const ds_max = v('dg_shaft_tol_max');
    const dh = v('dg_shaft_hole_d');
    const Dh = v('dg_housing_D');
    const Dh_min = v('dg_housing_tol_min');
    const Dh_max = v('dg_housing_tol_max');
    const Dhe = v('dg_housing_outer_D');

    const T0 = v('dg_temp_ref');
    const Ts = v('dg_temp_shaft');
    const Tb = v('dg_temp_shaft');
    const To = v('dg_temp_housing');
    const Ti = v('dg_temp_shaft');
    const Th = v('dg_temp_housing');

    const ringMatName = document.getElementById('dg_ring_material').value;
    const housingMatName = document.getElementById('dg_housing_material').value;
    const shaftMatName = document.getElementById('dg_shaft_material').value;
    const E_ring = getMatE(ringMatName);
    const v_ring = getMatV(ringMatName);
    const a_ring = getMatAlpha(ringMatName);
    const E_housing = getMatE(housingMatName);
    const v_housing = getMatV(housingMatName);
    const a_housing = getMatAlpha(housingMatName);
    const E_shaft = getMatE(shaftMatName);
    const v_shaft = getMatV(shaftMatName);
    const a_shaft = getMatAlpha(shaftMatName);

    if ([E_ring, v_ring, a_ring, E_housing, v_housing, a_housing, E_shaft, v_shaft, a_shaft].some(isNaN)) {
        alert('材料属性数据缺失，请检查材料选择！');
        return;
    }

    const shaftRoughType = document.getElementById('dg_shaft_roughness_type').value;
    const lambda_Rai = (shaftRoughType === 'grinding') ? ds / (ds + 2) : ds / (ds + 3);
    const housingRoughType = document.getElementById('dg_housing_roughness_type').value;
    const lambda_Rae = (housingRoughType === 'turning') ? Dh / (Dh + 3) : Dh / (Dh + 2);

    let lambda_i;
    const ri = di / d;
    const factorRingInner = ((ri * ri + 1) / (ri * ri - 1)) + v_ring;
    if (dh > 0) {
        const rs = ds / dh;
        const factorShaft = ((rs * rs + 1) / (rs * rs - 1)) - v_shaft;
        lambda_i = 2 * di / (d * (ri * ri - 1) * (factorRingInner + factorShaft * (E_ring / E_shaft)));
    } else {
        const factorShaft = 1 - v_shaft;
        lambda_i = 2 * di / (d * (ri * ri - 1) * (factorRingInner + factorShaft * (E_ring / E_shaft)));
    }

    const re = D / De;
    const rhe = Dhe / Dh;
    const factorRingOuter = ((re * re + 1) / (re * re - 1)) + v_ring;
    const factorHousing = ((rhe * rhe + 1) / (rhe * rhe - 1)) - v_housing;
    const lambda_e = 2 * D / (De * (re * re - 1) * (factorRingOuter + factorHousing * (E_ring / E_housing)));

    const delta_di = (ds_min + ds_max) / 2 - (bd_min + bd_max) / 2;
    const sigma_fi = delta_di < 0 ? 0 : Math.sqrt(Math.pow((bd_max - bd_min) / 6, 2) + Math.pow((ds_max - ds_min) / 6, 2));
    const delta_De = (bD_min + bD_max) / 2 - (Dh_min + Dh_max) / 2;
    const sigma_fe = delta_De < 0 ? 0 : Math.sqrt(Math.pow((bD_max - bD_min) / 6, 2) + Math.pow((Dh_max - Dh_min) / 6, 2));

    const Delta_Dt_raw = (a_ring * (To - T0) - a_housing * (Th - T0)) * D;
    const Delta_Dt = Delta_Dt_raw < 0 ? 0 : Delta_Dt_raw;
    const Delta_dt_raw = (a_shaft * (Ts - T0) - a_ring * (Ti - T0)) * d;
    const Delta_dt = Delta_dt_raw < 0 ? 0 : Delta_dt_raw;
    const delta_T = lambda_e * Delta_Dt + lambda_i * Delta_dt;

    let delta_t;
    if (Dw === 0) {
        delta_t = a_ring * Math.abs(Ti - To) * De;
    } else {
        delta_t = a_ring * (Dw * (Tb - T0) * 2 + di * (Ti - T0) - De * (To - T0));
    }

    const temp_total = delta_t + delta_T;

    const sigma_f = Math.sqrt(
        Math.pow((Gr_max - Gr_min) / 6, 2) +
        Math.pow(lambda_i * lambda_Rai * sigma_fi, 2) +
        Math.pow(lambda_e * lambda_Rae * sigma_fe, 2)
    );

    const inner_int_mean = delta_di < 0 ? 0 : lambda_i * lambda_Rai * delta_di;
    const inner_int_min = inner_int_mean - 3 * (lambda_i * lambda_Rai * sigma_fi);
    const inner_int_max = inner_int_mean + 3 * (lambda_i * lambda_Rai * sigma_fi);

    const outer_int_mean = delta_De < 0 ? 0 : lambda_e * lambda_Rae * delta_De;
    const outer_int_min = outer_int_mean - 3 * (lambda_e * lambda_Rae * sigma_fe);
    const outer_int_max = outer_int_mean + 3 * (lambda_e * lambda_Rae * sigma_fe);

    const Gr_avg = (Gr_min + Gr_max) / 2;
    const inst_6sig_mean = Gr_avg - inner_int_mean - outer_int_mean;
    const inst_6sig_min = inst_6sig_mean - 3 * sigma_f;
    const inst_6sig_max = inst_6sig_mean + 3 * sigma_f;
    const eff_6sig_min = inst_6sig_min - temp_total;
    const eff_6sig_max = inst_6sig_max - temp_total;
    const eff_6sig_mean = (eff_6sig_min + eff_6sig_max) / 2;

    const inst_raw_min = Gr_min - inner_int_mean - outer_int_mean;
    const inst_raw_max = Gr_max - inner_int_mean - outer_int_mean;
    const inst_raw_mean = (inst_raw_min + inst_raw_max) / 2;
    const eff_raw_min = inst_raw_min - temp_total;
    const eff_raw_max = inst_raw_max - temp_total;
    const eff_raw_mean = (eff_raw_min + eff_raw_max) / 2;

    const fmt = (x) => isNaN(x) ? '—' : x.toFixed(3);

    const shaftTypeName = shaftRoughType === 'grinding' ? '磨削轴' : '车削轴';
    const housingTypeName = housingRoughType === 'turning' ? '车削孔' : '磨削孔';

    dgSet('dg_f_shaft_rough_type', shaftTypeName);
    dgSet('dg_f_housing_rough_type', housingTypeName);
    dgSet('dg_f_lambda_i', lambda_Rai.toFixed(6));
    dgSet('dg_f_lambda_e', lambda_Rae.toFixed(6));
    dgSet('dg_f_lambda_i2', lambda_i.toFixed(6));
    dgSet('dg_f_lambda_e2', lambda_e.toFixed(6));

    dgSet('dg_r_inner_int_min', fmt(inner_int_min));
    dgSet('dg_r_inner_int_mean', fmt(inner_int_mean));
    dgSet('dg_r_inner_int_max', fmt(inner_int_max));
    dgSet('dg_r_outer_int_min', fmt(outer_int_min));
    dgSet('dg_r_outer_int_mean', fmt(outer_int_mean));
    dgSet('dg_r_outer_int_max', fmt(outer_int_max));
    dgSet('dg_r_6sig_inst_min', fmt(inst_6sig_min));
    dgSet('dg_r_6sig_inst_mean', fmt(inst_6sig_mean));
    dgSet('dg_r_6sig_inst_max', fmt(inst_6sig_max));
    dgSet('dg_r_6sig_eff_min', fmt(eff_6sig_min));
    dgSet('dg_r_6sig_eff_mean', fmt(eff_6sig_mean));
    dgSet('dg_r_6sig_eff_max', fmt(eff_6sig_max));
    dgSet('dg_r_raw_inst_min', fmt(inst_raw_min));
    dgSet('dg_r_raw_inst_mean', fmt(inst_raw_mean));
    dgSet('dg_r_raw_inst_max', fmt(inst_raw_max));
    dgSet('dg_r_raw_eff_min', fmt(eff_raw_min));
    dgSet('dg_r_raw_eff_mean', fmt(eff_raw_mean));
    dgSet('dg_r_raw_eff_max', fmt(eff_raw_max));

    document.getElementById('dg_factors-card').style.display = 'none';
    document.getElementById('dg_result-card').style.display = '';
}

function dgSet(id, val) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = val;
        // 设置颜色：正值红色，负值蓝色
        if (!isNaN(val) && val !== '—') {
            const num = parseFloat(val);
            if (num > 0) {
                el.style.color = 'red';
            } else if (num < 0) {
                el.style.color = 'blue';
            } else {
                el.style.color = '';
            }
        } else {
            el.style.color = '';
        }
    }
}

function resetDeepGrooveDefaults() {
    const defaults = {
        'dg_clearance_min': 0.000, 'dg_clearance_max': 0.010,
        'dg_bore_d': 20.000, 'dg_bore_tol_min': -0.010, 'dg_bore_tol_max': 0.000,
        'dg_center_diameter': 31.000, 'dg_ball_d': 6.350,
        'dg_inner_groove_d': 24.647, 'dg_outer_D': 42.000, 'dg_outer_tol_min': -0.011, 'dg_outer_tol_max': 0.000,
        'dg_outer_groove_D': 37.352,
        'dg_shaft_d': 20, 'dg_shaft_tol_min': -0.006, 'dg_shaft_tol_max': 0.006, 'dg_shaft_hole_d': 0,
        'dg_housing_D': 42, 'dg_housing_tol_min': 0, 'dg_housing_tol_max': 0.025,
        'dg_temp_ref': 25, 'dg_temp_shaft': 90, 'dg_temp_housing': 25
    };

    Object.keys(defaults).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = defaults[id];
    });

    // 更新轴外径和壳体孔径的显示值
    const boreD = defaults['dg_bore_d'];
    const outerD = defaults['dg_outer_D'];
    // 轴外径的小数位数与内径尺寸一致
    const boreDValue = defaults['dg_bore_d'].toString();
    const boreDecimalPlaces = boreDValue.includes('.') ? boreDValue.split('.')[1].length : 0;
    document.getElementById('dg_shaft_d_display').textContent = boreD.toFixed(boreDecimalPlaces);

    // 壳体孔径的小数位数与外径尺寸一致
    const outerDValue = defaults['dg_outer_D'].toString();
    const outerDecimalPlaces = outerDValue.includes('.') ? outerDValue.split('.')[1].length : 0;
    document.getElementById('dg_housing_D_display').textContent = outerD.toFixed(outerDecimalPlaces);

    // 计算并更新壳体外径：外径尺寸+6
    const housingOuterD = outerD + 6;
    document.getElementById('dg_housing_outer_D').value = housingOuterD.toFixed(outerDecimalPlaces);

    document.getElementById('dg_bearingModel').value = '6004';
    document.getElementById('dg_precision').value = 'P0';
    document.getElementById('dg_clearanceGroup').value = 'C2';
    document.getElementById('dg_shaft_roughness_type').value = 'grinding';
    document.getElementById('dg_housing_roughness_type').value = 'turning';
    document.getElementById('dg_ring_material').value = 'GCr15';
    document.getElementById('dg_housing_material').value = 'YL113丨ADC12丨YZAlSi11Cu3';
    document.getElementById('dg_shaft_material').value = '20CrMnTi';

    // 不需要再调用initDeepGrooveCalculator，避免无限递归
    // 直接更新材料显示即可
    updateDeepGrooveMaterialDisplay('ring');
    updateDeepGrooveMaterialDisplay('housing');
    updateDeepGrooveMaterialDisplay('shaft');

    ['dg_factors-card', 'dg_result-card'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
}

function showDeepGrooveMaterialTable() {
    const modal = document.getElementById('deepGrooveMaterialModal');
    const content = document.getElementById('deepGrooveMaterialTableContent');

    if (!modal || !content) return;

    // 显示模态框
    modal.style.display = 'flex';

    // 生成材料属性表
    if (materialsDB && materialsDB.length > 0) {
        let html = `
            <table style="width:100%; border-collapse: collapse; font-family: Arial, sans-serif;">
                <thead>
                    <tr>
                        <th style="background: #f0f4fb; color: #1a3a6b; font-weight: 600; white-space: nowrap; text-align: left; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 11px;">材料名称</th>
                        <th style="background: #f0f4fb; color: #1a3a6b; font-weight: 600; white-space: nowrap; text-align: right; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 11px;">弹性模量(GPa)</th>
                        <th style="background: #f0f4fb; color: #1a3a6b; font-weight: 600; white-space: nowrap; text-align: right; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 11px;">泊松比</th>
                        <th style="background: #f0f4fb; color: #1a3a6b; font-weight: 600; white-space: nowrap; text-align: right; border: 1px solid #dde3ed; padding: 6px 10px; font-size: 11px;">热膨胀系数(×10⁻⁶/K)</th>
                    </tr>
                </thead>
                <tbody>
        `;

        materialsDB.forEach(m => {
            const E = m['弹性模量(N/m^2)'] ? (m['弹性模量(N/m^2)'] / 1e9).toFixed(1) : '—';
            const v = m['泊松比'] ? m['泊松比'].toFixed(3) : '—';

            let alpha = '—';
            const key = Object.keys(m).find(k => k.includes('膨胀') || k.includes('扩张'));
            if (key && m[key]) {
                alpha = Number(m[key]).toExponential(3).replace('e-', 'e-0');
            }

            html += `
                <tr>
                    <td style="border: 1px solid #dde3ed; padding: 6px 10px; font-size: 11px; text-align: left;">${m['材料名称']}</td>
                    <td style="border: 1px solid #dde3ed; padding: 6px 10px; font-size: 11px; text-align: right;">${E}</td>
                    <td style="border: 1px solid #dde3ed; padding: 6px 10px; font-size: 11px; text-align: right;">${v}</td>
                    <td style="border: 1px solid #dde3ed; padding: 6px 10px; font-size: 11px; text-align: right;">${alpha}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        content.innerHTML = html;
    } else {
        content.innerHTML = '材料数据未加载';
    }
}

function hideDeepGrooveMaterialTable() {
    const modal = document.getElementById('deepGrooveMaterialModal');
    if (modal) {
        modal.style.display = 'none';
    }
}