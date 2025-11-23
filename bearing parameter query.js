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