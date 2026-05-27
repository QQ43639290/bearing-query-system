#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
产品工艺管理数据更新脚本
用法: python3 update_data.py [excel文件路径]

功能:
  - 读取Excel文件中的所有工作表
  - 生成 Basic product process data.js 数据文件
  - 更新 bearing-data.js 中的 bearingProcessData 数据
  - HTML文件无需修改，自动加载新数据

示例:
  python3 update_data.py                                    # 使用默认路径
  python3 update_data.py /path/to/产品工艺管理.xlsx         # 指定Excel文件
"""

import pandas as pd
import json
import os
import sys
import re
from datetime import datetime

# ============ 配置 ============
# 默认Excel文件路径（修改为您的实际路径）
DEFAULT_EXCEL = '产品工艺管理.xlsx'
# 输出的data.js路径
DATA_JS_PATH = 'Basic product process data.js'
# bearing-data.js路径
BEARING_DATA_JS_PATH = 'bearing-data.js'
# ==============================


def get_excel_path():
    """获取Excel文件路径"""
    if len(sys.argv) > 1:
        return sys.argv[1]
    return DEFAULT_EXCEL


def format_decimal_value(value):
    """格式化数值，最多保留四位小数"""
    try:
        if value == '' or value is None:
            return ''
        num = float(value)
        # 四舍五入到四位小数
        rounded = round(num, 4)
        # 如果是整数则返回整数
        if rounded == int(rounded):
            return int(rounded)
        return rounded
    except:
        return value


def read_excel_data(excel_path):
    """读取Excel所有工作表数据"""
    print(f"正在读取: {excel_path}")
    
    # 需要格式化为最多四位小数的列
    decimal_columns = [
        '油脂价格', '包装筒价', '纸箱价格', '物流费用',
        '公用系统5%', '管理费用5%', '增值税费13%',
        '制造成本', '外协成本', '含税成本', '净利润率',
        '钢球质量/g', '每吨价格', '润滑脂单价/g',
        '外径尺寸', '内径尺寸'
    ]
    
    xls = pd.ExcelFile(excel_path)
    print(f"工作表数量: {len(xls.sheet_names)}")
    
    data = {}
    total_records = 0
    
    for sheet_name in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet_name)
        df = df.fillna('')  # 填充空值
        
        columns = df.columns.tolist()
        rows = df.values.tolist()
        
        # 转换numpy类型为Python原生类型
        clean_rows = []
        for row in rows:
            clean_row = []
            for idx, cell in enumerate(row):
                if hasattr(cell, 'item'):
                    cell = cell.item()
                elif cell != cell:  # NaN检查
                    cell = ''
                
                # 对需要格式化的列进行处理
                col_name = columns[idx] if idx < len(columns) else ''
                if col_name in decimal_columns and cell != '':
                    cell = format_decimal_value(cell)
                
                clean_row.append(cell)
            clean_rows.append(clean_row)
        
        data[sheet_name] = {
            "columns": columns,
            "data": clean_rows
        }
        
        total_records += len(clean_rows)
        print(f"  - {sheet_name}: {len(columns)}列, {len(clean_rows)}条")
    
    print(f"总记录数: {total_records}")
    return data, len(xls.sheet_names), total_records


def generate_data_js(data, sheet_count, total_records):
    """生成data.js文件"""
    data_json = json.dumps(data, ensure_ascii=False, default=str, indent=2)
    
    content = f"""// 产品工艺管理数据
// 生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
// 工作表数量: {sheet_count}
// 总记录数: {total_records}
// 文件大小: {len(data_json):,} 字符

const DATA = {data_json};
"""
    return content


def generate_process_records(excel_path):
    """生成工艺管理数据的记录列表"""
    print(f"\n正在生成工艺管理数据...")
    
    sheet_name = '1-工艺管理'
    df = pd.read_excel(excel_path, sheet_name=sheet_name)
    
    # 需要排除的列
    exclude_columns = [
        '保持架', '密封件', '生产方式', '型号简称', 
        '毛坯型号', '包装筒', '密封价格', '查询数据编号',
        '外径', '宽度'
    ]
    
    # 需要格式化为最多四位小数的列
    decimal_columns = [
        '油脂价格', '包装筒价', '纸箱价格', '物流费用',
        '公用系统5%', '管理费用5%', '增值税费13%',
        '制造成本', '外协成本', '含税成本', '净利润率',
        '钢球质量/g', '每吨价格', '润滑脂单价/g',
        '外径尺寸', '内径尺寸'
    ]
    
    def format_decimal(value):
        """格式化数值，最多保留四位小数"""
        try:
            if pd.isna(value) or value == '':
                return ''
            num = float(value)
            # 四舍五入到四位小数
            rounded = round(num, 4)
            # 如果是整数则返回整数
            if rounded == int(rounded):
                return int(rounded)
            return rounded
        except:
            return value
    
    # 将 DataFrame 转换为字典列表
    records = []
    for _, row in df.iterrows():
        record = {}
        
        # 计算外形尺寸
        inner_dia = row.get('内径', None)
        outer_dia = row.get('外径', None)
        width = row.get('宽度', None)
        
        if pd.notna(inner_dia) and pd.notna(outer_dia) and pd.notna(width):
            # 格式化数值，如果是整数则显示为整数，否则保留小数
            def format_num(x):
                try:
                    if pd.isna(x):
                        return ''
                    num = float(x)
                    if num.is_integer():
                        return str(int(num))
                    return str(num)
                except:
                    return str(x)
            
            inner_val = format_num(inner_dia)
            outer_val = format_num(outer_dia)
            width_val = format_num(width)
            external_dimension = f"Φ{inner_val}*Φ{outer_val}*{width_val}"
        else:
            external_dimension = ""
        
        # 处理其他列，保持原始顺序
        for col in df.columns:
            if col in exclude_columns:
                continue
            
            if col == '内径':
                # 将内径替换为外形尺寸
                record['外形尺寸'] = external_dimension
            else:
                value = row[col]
                # 转换 numpy 类型为 Python 原生类型
                if hasattr(value, 'item'):
                    value = value.item()
                elif pd.isna(value):
                    value = ''
                
                # 对需要格式化的列进行处理
                if col in decimal_columns and value != '':
                    value = format_decimal(value)
                
                record[col] = value
        
        records.append(record)
    
    return records


def update_bearing_data_js(records, bearing_data_js_path):
    """更新 bearing-data.js 中的 bearingProcessData"""
    print(f"正在更新 {bearing_data_js_path}...")
    
    # 读取文件
    with open(bearing_data_js_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 生成新的数据 JSON
    data_json = json.dumps(records, ensure_ascii=False, default=str, indent=4)
    
    # 使用正则表达式替换 bearingProcessData 部分
    # 匹配模式：bearingProcessData: [ ... ],
    # 我们需要找到正确的部分并替换
    pattern = r'bearingProcessData:\s*\[[\s\S]*?\n\s*\]'
    
    # 检查是否存在这个键
    if re.search(pattern, content):
        # 替换数据
        new_content = re.sub(
            pattern,
            'bearingProcessData: ' + data_json,
            content
        )
    else:
        # 如果不存在，尝试在末尾的 } 前面添加
        print("未找到 bearingProcessData，尝试在文件末尾添加...")
        # 在最后一个 } 之前添加
        add_str = f',\n\n  // 轴承工艺参数数据（如果有）\n  bearingProcessData: {data_json}'
        # 找到最后一个 }
        last_brace_pos = content.rfind('}')
        if last_brace_pos != -1:
            new_content = content[:last_brace_pos] + add_str + content[last_brace_pos:]
        else:
            new_content = content
    
    # 写入文件
    with open(bearing_data_js_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return len(records)


def main():
    excel_path = get_excel_path()
    
    # 检查文件是否存在
    if not os.path.exists(excel_path):
        print(f"错误: 文件不存在 - {excel_path}")
        print("\n用法: python3 update_data.py [excel文件路径]")
        sys.exit(1)
    
    # 检查 1-工艺管理 工作表是否存在
    xls = pd.ExcelFile(excel_path)
    has_process_sheet = '1-工艺管理' in xls.sheet_names
    
    # 读取数据
    data, sheet_count, total_records = read_excel_data(excel_path)
    
    # 生成data.js
    content = generate_data_js(data, sheet_count, total_records)
    
    # 写入文件
    with open(DATA_JS_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
    
    file_size = os.path.getsize(DATA_JS_PATH)
    print(f"\n✓ 数据已更新: {DATA_JS_PATH}")
    print(f"✓ 文件大小: {file_size:,} 字节 ({file_size/1024:.1f} KB)")
    
    # 更新 bearing-data.js 中的 bearingProcessData
    if has_process_sheet:
        if os.path.exists(BEARING_DATA_JS_PATH):
            records = generate_process_records(excel_path)
            process_count = update_bearing_data_js(records, BEARING_DATA_JS_PATH)
            
            process_file_size = os.path.getsize(BEARING_DATA_JS_PATH)
            print(f"✓ bearingProcessData 已更新到: {BEARING_DATA_JS_PATH}")
            print(f"✓ 记录数: {process_count}")
            print(f"✓ 文件大小: {process_file_size:,} 字节 ({process_file_size/1024:.1f} KB)")
        else:
            print(f"\n警告: 未找到文件 {BEARING_DATA_JS_PATH}，跳过更新")
    else:
        print(f"\n警告: 未找到 '1-工艺管理' 工作表，跳过更新 bearingProcessData")
    
    print("\n请刷新浏览器查看最新数据")


if __name__ == '__main__':
    main()
