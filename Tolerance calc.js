/**
 * calc.js - 公差计算核心逻辑
 * 实现 GB/T 1800.1-2009 公差计算
 */

// ============================================================
// 工具函数
// ============================================================

/** 从公差代号中提取数字部分，如 "H7" -> "7", "IT01" -> "01" */
function getNumbers(str) {
  return str.replace(/[a-zA-Z]/g, '').trim();
}

/** 从公差代号中提取字母部分，如 "H7" -> "H", "zc6" -> "zc" */
function getString(str) {
  return str.replace(/[0-9]/g, '').trim();
}

/** 
 * 查表获取 IT 标准公差值
 * @param {string} level  - "IT01","IT0","IT1"..."IT18"
 * @param {number} D      - 公称尺寸 mm
 * @returns {number|null}
 */
function getITValue(level, D) {
  D = parseFloat(D);
  for (const row of IT_TABLE) {
    if (parseFloat(row.dia_lower) < D && parseFloat(row.dia_upper) >= D) {
      const v = row[level];
      return (v !== undefined && v !== null) ? parseFloat(v) : null;
    }
  }
  return null;
}

/**
 * 查表获取轴基本偏差（ei 或 es，取决于公差带字母）
 * 对 a~h 返回 es（上偏差），对 k~zc 返回 ei（下偏差）
 * @param {string} field  - 字段名，如 "a","k4_7","j6" 等
 * @param {number} D
 * @returns {number|null}
 */
function getShaftFundDev(field, D) {
  D = parseFloat(D);
  for (const row of SHAFT_TABLE) {
    if (parseFloat(row.dia_lower) < D && parseFloat(row.dia_upper) >= D) {
      const v = row[field];
      return (v !== undefined && v !== null) ? parseFloat(v) : null;
    }
  }
  return null;
}

/**
 * 查表获取孔基本偏差
 * @param {string} field  - 字段名，如 "A","K01_8","tri_it7" 等
 * @param {number} D
 * @returns {number|null}
 */
function getHoleFundDev(field, D) {
  D = parseFloat(D);
  for (const row of HOLE_TABLE) {
    if (parseFloat(row.dia_lower) < D && parseFloat(row.dia_upper) >= D) {
      const v = row[field];
      return (v !== undefined && v !== null) ? parseFloat(v) : null;
    }
  }
  return null;
}

// ============================================================
// 格式化输出
// ============================================================

/**
 * 将偏差数值格式化为带符号的字符串，并使两个偏差小数位对齐
 * @param {number} es
 * @param {number} ei
 * @returns {{esStr: string, eiStr: string}}
 */
function formatDeviation(es, ei) {
  // 保留足够精度后去掉多余0
  function numToStr(v) {
    if (v === 0) return '0';
    // 最多保留6位小数
    let s = parseFloat(v.toFixed(6)).toString();
    return s;
  }

  let _es = numToStr(es);
  let _ei = numToStr(ei);

  // 补充符号
  function withSign(s, v) {
    if (v > 0) return '+' + s;
    if (v < 0) return s; // 已含负号
    return ' 0';
  }

  if (es === 0) _es = '0';
  if (ei === 0) _ei = '0';

  // 统一小数位数
  function getDecimals(s) {
    const idx = s.indexOf('.');
    return idx >= 0 ? s.length - idx - 1 : 0;
  }

  // 先加符号
  let esS = (es > 0 ? '+' : (es < 0 ? '' : ' ')) + _es;
  let eiS = (ei > 0 ? '+' : (ei < 0 ? '' : ' ')) + _ei;

  // 对齐小数位
  function alignDecimals(a, b) {
    const da = getDecimals(a);
    const db = getDecimals(b);
    if (da === db) {
      // 检查末尾是否都是0可以消除
      while (a.endsWith('0') && b.endsWith('0') && getDecimals(a) > 0) {
        a = a.slice(0, -1);
        b = b.slice(0, -1);
      }
      // 如果末尾是小数点，去掉
      if (a.endsWith('.')) { a = a.slice(0, -1); b = b.slice(0, -1); }
    } else if (da > db) {
      if (a.endsWith('0')) {
        a = a.slice(0, -1);
        if (a.endsWith('.')) a = a.slice(0, -1);
        return alignDecimals(a, b);
      } else {
        b = b.indexOf('.') < 0 ? b + '.0' : b + '0';
        return alignDecimals(a, b);
      }
    } else {
      if (b.endsWith('0')) {
        b = b.slice(0, -1);
        if (b.endsWith('.')) b = b.slice(0, -1);
        return alignDecimals(a, b);
      } else {
        a = a.indexOf('.') < 0 ? a + '.0' : a + '0';
        return alignDecimals(a, b);
      }
    }
    return [a, b];
  }

  [esS, eiS] = alignDecimals(esS, eiS);

  return { esStr: esS, eiStr: eiS };
}

// ============================================================
// 孔偏差计算
// ============================================================

/**
 * 计算孔的上偏差(ES)和下偏差(EI)
 * @param {string} hCode  - 孔公差代号，如 "H7","K6","JS5"
 * @param {number} D      - 公称尺寸
 * @returns {{es: number, ei: number}|null}
 */
function calcHoleDeviation(hCode, D) {
  hCode = hCode.toUpperCase().trim();
  D = parseFloat(D);
  if (!hCode || isNaN(D) || D <= 0) return null;

  const letter = getString(hCode);   // 字母部分，如 "H"
  const numStr = getNumbers(hCode);  // 数字部分，如 "7"
  const grade  = parseInt(numStr);   // 公差等级数字

  // 获取IT值
  const ITV = getITValue('IT' + numStr, D);
  if (ITV === null) return null;

  // ---- A~H (间隙配合孔，EI为基本偏差，ES = EI + IT) ----
  if (['A','B','C','CD','D','E','EF','F','FG','G','H'].includes(letter)) {
    const EI = getHoleFundDev(letter, D);
    if (EI === null) return null;
    return { es: EI + ITV, ei: EI };
  }

  // ---- J / JS ----
  if (letter === 'JS') {
    return { es: ITV / 2, ei: -(ITV / 2) };
  }
  if (letter === 'J') {
    // J6,J7,J8 有专用数据
    if (numStr === '6' || numStr === '7' || numStr === '8') {
      const ES = getHoleFundDev('J' + numStr, D);
      if (ES === null) return null;
      return { es: ES, ei: ES - ITV };
    }
    // 其他J级，同JS
    return { es: ITV / 2, ei: -(ITV / 2) };
  }

  // ---- K ----
  if (letter === 'K') {
    let ES;
    if (['01','0','1','2','3','4','5','6','7','8'].includes(numStr)) {
      ES = getHoleFundDev('K01_8', D);
      if (ES === null) return null;
      // 3~8级且D>3时加修正量
      if (D > 3 && grade >= 3 && grade <= 8) {
        const tri = getHoleFundDev('tri_it' + numStr, D);
        if (tri !== null) ES = ES + tri;
      }
    } else {
      ES = getHoleFundDev('K9_18', D);
      if (ES === null) return null;
    }
    return { es: ES, ei: ES - ITV };
  }

  // ---- M ----
  if (letter === 'M') {
    let ES;
    if (['01','0','1','2','3','4','5','6','7','8'].includes(numStr)) {
      ES = getHoleFundDev('M01_8', D);
      if (ES === null) return null;
      if (D > 3 && grade >= 3 && grade <= 8) {
        const tri = getHoleFundDev('tri_it' + numStr, D);
        if (tri !== null) ES = ES + tri;
      }
    } else {
      ES = getHoleFundDev('M9_18', D);
      if (ES === null) return null;
    }
    return { es: ES, ei: ES - ITV };
  }

  // ---- N ----
  if (letter === 'N') {
    let ES;
    if (['01','0','1','2','3','4','5','6','7','8'].includes(numStr)) {
      ES = getHoleFundDev('N01_8', D);
      if (ES === null) return null;
      if (D > 3 && grade >= 3 && grade <= 8) {
        const tri = getHoleFundDev('tri_it' + numStr, D);
        if (tri !== null) ES = ES + tri;
      }
    } else {
      ES = getHoleFundDev('N9_18', D);
      if (ES === null) return null;
    }
    return { es: ES, ei: ES - ITV };
  }

  // ---- P ~ ZC (过盈配合孔，ES为基本偏差，EI = ES - IT) ----
  // 这些字母在3~8级时需要加修正量(D>3时)
  const upperLetters = ['P','R','S','T','U','V','X','Y','Z','ZA','ZB','ZC'];
  if (upperLetters.includes(letter)) {
    let ES = getHoleFundDev(letter, D);
    if (ES === null) return null;
    if (D > 3 && grade >= 3 && grade <= 8) {
      const tri = getHoleFundDev('tri_it' + numStr, D);
      if (tri !== null) ES = ES + tri;
    }
    return { es: ES, ei: ES - ITV };
  }

  return null;
}

// ============================================================
// 轴偏差计算
// ============================================================

/**
 * 计算轴的上偏差(es)和下偏差(ei)
 * @param {string} sCode  - 轴公差代号，如 "h6","k5","zc8"
 * @param {number} D
 * @returns {{es: number, ei: number}|null}
 */
function calcShaftDeviation(sCode, D) {
  sCode = sCode.toLowerCase().trim();
  D = parseFloat(D);
  if (!sCode || isNaN(D) || D <= 0) return null;

  const letter = getString(sCode);
  const numStr = getNumbers(sCode);
  const grade  = parseInt(numStr);

  const ITV = getITValue('IT' + numStr, D);
  if (ITV === null) return null;

  // ---- a~h (间隙配合轴，es为基本偏差，ei = es - IT) ----
  if (['a','b','c','cd','d','e','ef','f','fg','g','h'].includes(letter)) {
    const es = getShaftFundDev(letter, D);
    if (es === null) return null;
    return { es: es, ei: es - ITV };
  }

  // ---- j / js ----
  if (letter === 'js') {
    return { es: ITV / 2, ei: -(ITV / 2) };
  }
  if (letter === 'j') {
    // j5,j6 共用 j6 数据；j7、j8 各有数据
    if (numStr === '5' || numStr === '6') {
      const ei = getShaftFundDev('j6', D);
      if (ei === null) return null;
      return { es: ITV + ei, ei: ei };
    }
    if (numStr === '7') {
      const ei = getShaftFundDev('j7', D);
      if (ei === null) return null;
      return { es: ITV + ei, ei: ei };
    }
    if (numStr === '8') {
      const ei = getShaftFundDev('j8', D);
      if (ei === null) return null;
      return { es: ITV + ei, ei: ei };
    }
    // 其他j级同js
    return { es: ITV / 2, ei: -(ITV / 2) };
  }

  // ---- k ----
  if (letter === 'k') {
    let ei;
    if (['4','5','6','7'].includes(numStr)) {
      ei = getShaftFundDev('k4_7', D);
    } else {
      ei = getShaftFundDev('k01_3_k8_18', D);
    }
    if (ei === null) return null;
    return { es: ITV + ei, ei: ei };
  }

  // ---- m~zc (过盈配合轴，ei为基本偏差，es = ei + IT) ----
  const lowerLetters = ['m','n','p','r','s','t','u','v','x','y','z','za','zb','zc'];
  if (lowerLetters.includes(letter)) {
    const ei = getShaftFundDev(letter, D);
    if (ei === null) return null;
    return { es: ITV + ei, ei: ei };
  }

  return null;
}

// ============================================================
// 配合计算（最大最小间隙/过盈）
// ============================================================

/**
 * 计算孔轴配合结果
 * @param {{es,ei}} holeDeviation  - 孔偏差
 * @param {{es,ei}} shaftDeviation - 轴偏差
 * @returns {{type:'clearance'|'interference'|'transition', max: number, min: number}}
 */
function calcFitResult(holeDeviation, shaftDeviation) {
  const { es: HES, ei: HEI } = holeDeviation;
  const { es: SES, ei: SEI } = shaftDeviation;

  // 最大间隙 = HES - SEI（孔最大 - 轴最小）
  const maxClearance = HES - SEI;
  // 最小间隙 = HEI - SES（孔最小 - 轴最大）
  const minClearance = HEI - SES;

  if (minClearance >= 0) {
    // 间隙配合
    return { type: 'clearance', max: maxClearance, min: minClearance };
  } else if (maxClearance <= 0) {
    // 过盈配合
    return { type: 'interference', max: -minClearance, min: -maxClearance };
  } else {
    // 过渡配合
    return { type: 'transition', maxClearance: maxClearance, maxInterference: -minClearance };
  }
}

// ============================================================
// 过盈配合温度计算
// ============================================================

/**
 * 计算过盈配合装配温度
 * @param {number} D         - 公称尺寸 mm
 * @param {number} maxGyl    - 最大过盈量 mm
 * @param {number} coeff     - 线膨胀系数 (×10⁻⁶/℃)
 * @returns {{heatTemp: number, coolTemp: number, deltaT: number}|{error:string}}
 */
function calcAssemblyTemp(D, maxGyl, coeff) {
  D = parseFloat(D);
  maxGyl = parseFloat(maxGyl);
  coeff = parseFloat(coeff);

  // 安全系数
  let safetyFactor = 0.2;
  if (maxGyl > 0.5)      safetyFactor = 0.3;
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
  return {
    heatTemp:  wdpp + 25,
    coolTemp: -(wdpp - 25),
    deltaT:    wdpp,
  };
}

// ============================================================
// 验证公差代号格式
// ============================================================

/** 验证孔公差代号（大写字母+数字）*/
function isValidHoleCode(code) {
  return /^[A-Z]{1,2}(01|0|[1-9]|1[0-8])$/.test(code.trim().toUpperCase());
}

/** 验证轴公差代号（小写字母+数字）*/
function isValidShaftCode(code) {
  return /^[a-z]{1,2}(01|0|[1-9]|1[0-8])$/.test(code.trim().toLowerCase());
}
