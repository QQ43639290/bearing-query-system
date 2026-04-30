// 轴承系列映射配置 - 将具体系列映射到基础系列
const seriesMap = {
    "8": "0", "9": "0", "0": "0", "1": "0",  // 8/9/0/1系列映射到0系列
    "2": "2", "3": "3", "4": "3"            // 2系列保持，3/4系列映射到3系列
};

// 轴承型号前缀匹配规则 - 用于识别轴承的直径系列
const bearingSeriesRules = [
    { patterns: [/^60/], series: "0" },      // 60xx系列 -> 0系列
    { patterns: [/^62/], series: "2" },      // 62xx系列 -> 2系列  
    { patterns: [/^63/], series: "3" },      // 63xx系列 -> 3系列
    { patterns: [/^64/], series: "4" },      // 64xx系列 -> 4系列
    { patterns: [/^16/], series: "1" },      // 16xx系列 -> 1系列
    { patterns: [/^19/, /^619/, /^69/], series: "9" },  // 19xx/619xx/69xx系列 -> 9系列
    { patterns: [/^618/, /^68/], series: "8" }         // 618xx/68xx系列 -> 8系列
];

/**
 * 获取映射后的基础系列
 * @param {string} series - 具体系列号
 * @returns {string} 基础系列号
 */
function getBaseSeries(series) {
    return seriesMap[series] || series;
}

/**
 * 根据轴承型号获取直径系列
 * @param {string} model - 轴承型号
 * @returns {string} 直径系列号，默认返回"234"
 */
function getBearingSeries(model) {
    if (!model) return "234";
    for (const rule of bearingSeriesRules) {
        if (rule.patterns.some(pattern => pattern.test(model))) {
            return rule.series;
        }
    }
    return "234"; // 默认2系列
}

/**
 * 根据轴承型号获取基础直径系列
 * @param {string} model - 轴承型号
 * @returns {string} 基础直径系列号
 */
function getDiameterSeries(model) {
    return getBaseSeries(getBearingSeries(model));
}

/**
 * 在范围数据中查找匹配的值
 * @param {number} value - 要查找的数值
 * @param {Array} ranges - 范围数组，每个元素包含min/max属性
 * @param {string} key - 要返回的属性名，空字符串返回整个对象
 * @returns {*} 匹配的值或对象，未找到返回null
 */
function findInRanges(value, ranges, key) {
    const found = ranges.find(r => value > r.min && value <= r.max);
    return found ? (key === "" ? found : found[key] || null) : null;
}

/**
 * 轴承型号格式转换与候选生成
 * 为68xx生成618xx版本，为69xx生成619xx版本
 * @param {string} input - 输入的轴承型号
 * @returns {Array} 候选型号数组
 */
function generateCandidateModels(input) {
    const candidates = new Set([input]);
    if (input.includes('68')) candidates.add(input.replace('68', '618'));
    if (input.includes('69')) candidates.add(input.replace('69', '619'));
    return Array.from(candidates);
}

/**
 * 轴承公差数据处理函数
 * 根据内外径标识生成结构化的公差数据对象
 * 
 * @param {boolean} isInner - 是否为内径(true)或外径(false)
 * @param {number} min - 最小尺寸
 * @param {number} max - 最大尺寸  
 * @param {number} tU - 上偏差
 * @param {number} tL - 下偏差
 * @param {number} tBsU - 内径上偏差(仅内径使用)
 * @param {number} tBsL - 内径下偏差(仅内径使用)
 * @param {number} oval89 - 8/9系列椭圆度
 * @param {number} oval01 - 0/1系列椭圆度
 * @param {number} oval234 - 2/3/4系列椭圆度
 * @param {number} taper - 锥度
 * @param {number} runout - 圆跳动
 * @param {number} parallelism - 平行度(仅内径使用)
 * @param {number} ovalClosed - 闭式椭圆度(仅外径使用)
 * @returns {Object} 结构化的公差数据对象
 */
function createToleranceData(isInner, min, max, tU, tL, tBsU = 0, tBsL = 0,
    oval89, oval01, oval234, taper, runout, parallelism = null, ovalClosed = null) {

    // 构建椭圆度对象 - 外径包含闭式产品的特殊处理
    const oval = isInner
        ? { "8/9": oval89, "01": oval01, "234": oval234 }
        : {
            "8/9": oval89, "01": oval01, "234": oval234,
            "closed": {
                "234": ovalClosed,
                "8/9": Math.max(oval89, ovalClosed || 0),  // 取开式和闭式的较大值
                "01": Math.max(oval01, ovalClosed || 0)
            }
        };

    return {
        min, max, taper, runout, oval,
        t: isInner ? { U: tU, L: tL, BsU: tBsU, BsL: tBsL } : { U: tU, L: tL },
        // 条件添加平行度(仅内径)
        ...(isInner && parallelism !== null && { parallelism })
    };
}

/**
 * 复制查询结果到剪贴板
 * 支持两种模式：复制全部内容或复制单行内容
 * 
 * @param {boolean} fullContent - 是否复制全部内容(true)或单行内容(false)
 * @param {HTMLElement} rowElement - 行元素DOM对象(单行复制时使用)
 */
function copyToClipboard(fullContent = true, rowElement = null) {
    const table = document.querySelector('#result .result-table');
    if (!table) return alert("没有可复制的内容！");

    /**
     * 提取表格行的文本内容
     * @param {HTMLElement} row - 表格行元素
     * @returns {string} 格式化的行内容
     */
    const extractRowContent = (row) => {
        const label = row.querySelector('.param-label').textContent.replace('：', '');
        const value = row.querySelector('.param-value').textContent;
        return `${label}: ${value}`;
    };

    /**
     * 构建完整的查询结果内容
     * @returns {string} 完整的格式化文本内容
     */
    const buildFullContent = () => {
        let content = "深沟球轴承基本尺寸查询结果\n" + "=".repeat(30) + "\n\n";

        // 添加主要参数
        table.querySelectorAll('tr').forEach(row => {
            content += extractRowContent(row) + '\n';
        });

        // 添加更多参数（如果显示）
        const moreParamsResults = document.getElementById('moreParamsResults');
        if (moreParamsResults?.style.display !== 'none') {
            const moreParamsTable = moreParamsResults.querySelector('.result-table');
            if (moreParamsTable) {
                content += "\n更多参数计算结果\n" + "-".repeat(30) + "\n\n";
                // 从第二行开始（跳过标题行）
                Array.from(moreParamsTable.querySelectorAll('tr')).slice(1).forEach(row => {
                    content += extractRowContent(row) + '\n';
                });
            }
        }

        return content + `\n查询时间: ${new Date().toLocaleString()}`;
    };

    /**
     * 显示复制成功的视觉反馈
     * @param {boolean} isFullContent - 是否为全部内容复制
     * @param {HTMLElement} element - 行元素（单行复制时使用）
     */
    const showCopyFeedback = (isFullContent, element) => {
        if (isFullContent) {
            const copyBtn = document.querySelector('.copy-btn');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span class="icon">✓</span> 已复制到剪贴板';
            copyBtn.classList.add('copy-success');
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('copy-success');
            }, 2000);
        } else {
            // 单行复制成功反馈 - 添加临时样式类
            element.classList.add('row-copied');
            setTimeout(() => element.classList.remove('row-copied'), 1000);
        }
    };

    // 执行复制操作
    const textContent = fullContent ? buildFullContent() : extractRowContent(rowElement);

    navigator.clipboard.writeText(textContent)
        .then(() => showCopyFeedback(fullContent, rowElement))
        .catch(err => {
            console.error('复制失败:', err);
            alert('复制失败，请手动选择文本复制');
        });
}

/**
 * 线性插值函数
 * 根据比值在fc和f0数据表中进行线性插值
 * @param {number} ratio - 比值
 * @param {string} type - 数据类型（'fc'或'f0'）
 * @returns {number|null} 插值结果
 */
function linearInterpolate(ratio, type) {
    if (!window.BearingData || !window.BearingData.fcF0Data || window.BearingData.fcF0Data.length === 0) {
        return null;
    }

    if (ratio < window.BearingData.fcF0Data[0].ratio) return window.BearingData.fcF0Data[0][type];
    if (ratio > window.BearingData.fcF0Data[window.BearingData.fcF0Data.length - 1].ratio) return window.BearingData.fcF0Data[window.BearingData.fcF0Data.length - 1][type];

    for (let i = 0; i < window.BearingData.fcF0Data.length - 1; i++) {
        const current = window.BearingData.fcF0Data[i];
        const next = window.BearingData.fcF0Data[i + 1];

        if (ratio >= current.ratio && ratio <= next.ratio) {
            const t = (ratio - current.ratio) / (next.ratio - current.ratio);
            const value = current[type] + t * (next[type] - current[type]);
            return value;
        }
    }

    return null;
}

/**
 * 查找最接近的钢球尺寸
 * 从标准钢球尺寸列表中找到最接近目标值的尺寸
 * @param {number} target - 目标钢球尺寸
 * @returns {number} 最接近的钢球尺寸
 */
function findClosestBallSize(target) {
    if (!window.BearingData || !window.BearingData.ballSizes || window.BearingData.ballSizes.length === 0) {
        return null;
    }

    return window.BearingData.ballSizes.reduce((prev, curr) => {
        return (Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev);
    });
}

/**
 * 简化钢球数量计算公式（作为备选）
 * @param {number} centerDiameter - 中心圆直径
 * @param {number} ballSize - 钢球尺寸
 * @param {number} kd - 外圈挡边系数
 * @returns {number|null} 钢球数量
 */
function calculateBallCountOld(centerDiameter, ballSize, kd) {
    const ratio = ballSize / (centerDiameter * (1 - kd));
    if (ratio >= 1) return null;
    return Math.floor(Math.PI / Math.asin(ratio));
}

/**
 * 精确钢球数量计算公式
 * @param {number} centerDiameter - 中心圆直径
 * @param {number} ballSize - 钢球尺寸
 * @param {number} kd - 外圈挡边系数
 * @returns {number|null} 钢球数量
 */
function calculateBallCount(centerDiameter, ballSize, kd) {
    const Dm = centerDiameter;
    const Dw = ballSize;
    const KD = kd;

    if (Dm <= 0 || Dw <= 0 || KD <= 0 || KD >= 1) {
        return null;
    }

    try {
        const acosPart1 = Dm / (4 * (1 - KD) * Dw);
        const acosPart2 = 1 - (Math.pow(Dm, 2) - 4 * Math.pow((1 - KD) * Dw, 2)) / Math.pow(Dm, 2);
        const acosParam = acosPart1 * acosPart2;

        if (Math.abs(acosParam) > 1) {
            return null;
        }

        const acosValue = Math.acos(acosParam) * 180 / Math.PI;

        const asinParam = Dw / Dm;
        if (Math.abs(asinParam) > 1) {
            return null;
        }
        const asinValue = Math.asin(asinParam);

        const numerator = (180 - acosValue) * 2 * Math.PI;
        const denominator = 2 * 180 * asinValue;
        const ballCount = (numerator / denominator + 2 + Math.PI *180 / denominator) / 2;

        return Math.round(ballCount);

    } catch (error) {
        console.error("钢球数量计算错误:", error);
        return null;
    }
}

/**
 * 尺寸匹配度计算
 * @param {number} d - 输入内径
 * @param {number} D - 输入外径
 * @param {number} B - 输入宽度
 * @param {number} bd - 轴承内径
 * @param {number} bD - 轴承外径
 * @param {number} bB - 轴承宽度
 * @returns {number} 匹配度分数（0-100）
 */
function calculateDimensionMatch(d, D, B, bd, bD, bB) {
    const dimensions = [
        { input: d, actual: bd, tolerance: 0.15, name: '内径' },
        { input: D, actual: bD, tolerance: 0.15, name: '外径' },
        { input: B, actual: bB, tolerance: 0.15, name: '宽度' }
    ];

    let validCount = 0;
    let totalDiff = 0;
    let debugInfo = [];

    for (const dim of dimensions) {
        if (isNaN(dim.input)) continue;

        const diff = Math.abs(dim.input - dim.actual) / dim.input;
        debugInfo.push(`${dim.name}: ${dim.input} vs ${dim.actual}, diff: ${(diff * 100).toFixed(1)}%`);

        if (diff > dim.tolerance) {
            console.log(`匹配失败: ${dim.name}差异${(diff * 100).toFixed(1)}% > 容差${(dim.tolerance * 100).toFixed(1)}%`);
            return 0;
        }

        totalDiff += diff;
        validCount++;
    }

    const score = validCount === 0 ? 0 : Math.max(0, 100 - (totalDiff / validCount * 100));
    console.log(`匹配度计算: ${debugInfo.join(' | ')}, 最终得分: ${score.toFixed(1)}`);

    return score;
}

/**
 * 根据匹配度分数获取匹配等级
 * @param {number} score - 匹配度分数
 * @returns {string} 匹配等级（'perfect'/'good'/'fair'）
 */
function getMatchLevel(score) {
    if (score >= 99) return 'perfect';
    if (score >= 90) return 'good';
    return 'fair';
}

/**
 * 型号匹配
 * @param {string} inputModel - 输入的型号（可能包含=前缀）
 * @param {string} targetModel - 目标型号
 * @returns {boolean} 是否匹配
 */
function matchModel(inputModel, targetModel) {
    if (!inputModel) return true;

    if (inputModel.startsWith('=')) {
        const exactModel = inputModel.substring(1);
        return targetModel === exactModel;
    } else {
        return targetModel.includes(inputModel);
    }
}

/**
 * 生成型号匹配的条件描述
 * @param {string} model - 输入的型号（可能包含=前缀）
 * @returns {string} 条件描述文本
 */
function getModelConditionDesc(model) {
    if (!model) return '';

    if (model.startsWith('=')) {
        return `产品型号等于"${model.substring(1)}"`;
    } else {
        return `产品型号包含"${model}"`;
    }
}
