// 企业微信配置信息 - 注意：实际部署时应从安全渠道获取这些信息
const WECOM_CONFIG = {
  // 以下为示例配置，请在实际环境中替换为真实值
  corpId: process.env.WECOM_CORP_ID || 'YOUR_CORP_ID',
  agentId: process.env.WECOM_AGENT_ID || 'YOUR_AGENT_ID',
  // secret不应直接存储在前端代码中，应通过后端API获取
  secret: ''
};

// 安全注意事项：
// 1. 生产环境中，敏感信息应通过环境变量或后端API获取
// 2. 不要在前端代码中硬编码secret等敏感信息
// 3. 建议实现一个后端接口来处理JSSDK签名等安全操作

// 环境检测函数：判断是否在企业微信环境中
function isWecomEnv() {
  // 检查UA是否包含企业微信的特征字符串
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('wxwork') > -1 || ua.indexOf('micromessenger') > -1;
}

// 企业微信JSSDK初始化函数
function initWecomSDK() {
  if (!isWecomEnv()) {
    console.log('非企业微信环境，跳过JSSDK初始化');
    return;
  }

  // 动态加载JSSDK
  const script = document.createElement('script');
  script.src = 'https://res.wx.qq.com/open/js/jweixin-1.2.0.js';
  script.onload = function() {
    // JSSDK加载完成后进行初始化
    // 注意：这里通常需要一个后端接口来获取签名信息
    // 简化版示例，实际使用时需要替换为真实的签名获取逻辑
    wx.config({
      beta: true,
      debug: false, // 调试模式，生产环境请设置为false
      appId: WECOM_CONFIG.corpId,
      timestamp: Math.floor(Date.now() / 1000),
      nonceStr: 'nonceStr',
      signature: 'signature', // 需要从后端获取
      jsApiList: [
        'checkJsApi',
        'onMenuShareAppMessage'
        // 这里可以添加需要的其他API
      ]
    });

    wx.ready(function() {
      console.log('企业微信JSSDK初始化成功');
      // 这里可以调用企业微信的各种API
    });

    wx.error(function(res) {
      console.error('企业微信JSSDK初始化失败:', res);
    });
  };
  document.head.appendChild(script);
}

// 企业微信存储适配：解决localStorage限制问题
const wecomStorage = {
  // 存储数据
  setItem: function(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('localStorage存储失败，尝试使用备用方案', e);
      // 备用方案：使用cookie
      try {
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000`;
        return true;
      } catch (e2) {
        console.error('所有存储方案均失败', e2);
        return false;
      }
    }
  },

  // 获取数据
  getItem: function(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage读取失败，尝试使用备用方案', e);
      // 备用方案：从cookie获取
      try {
        const cookieValue = document.cookie
          .split('; ')
          .find(row => row.startsWith(`${key}=`))
          ?.split('=')[1];
        return cookieValue ? decodeURIComponent(cookieValue) : null;
      } catch (e2) {
        console.error('所有读取方案均失败', e2);
        return null;
      }
    }
  },

  // 删除数据
  removeItem: function(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('localStorage删除失败，尝试使用备用方案', e);
      // 备用方案：删除cookie
      try {
        document.cookie = `${key}=; path=/; max-age=0`;
        return true;
      } catch (e2) {
        console.error('所有删除方案均失败', e2);
        return false;
      }
    }
  }
};

// 主题检测函数 - 适配企业微信环境
function detectTheme() {
  try {
    const savedTheme = wecomStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    }
  } catch (e) {
    // 如果存储不可用，默认为亮色主题以适配企业微信
    document.documentElement.classList.add('light-theme');
  }
}

// 页面加载完成后执行的初始化函数
document.addEventListener('DOMContentLoaded', function() {
  // 检测主题
  detectTheme();
  
  // 如果在企业微信环境中，初始化JSSDK
  if (isWecomEnv()) {
    initWecomSDK();
  }

  // 添加响应式适配
  function adaptToWecom() {
    if (isWecomEnv()) {
      // 调整样式以适应企业微信
      document.body.style.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif';
      document.body.style.margin = '0';
      document.body.style.padding = '10px';
      document.body.style.backgroundColor = '#f8f8f8';
      
      const container = document.querySelector('.container');
      if (container) {
        container.style.maxWidth = '100%';
        container.style.padding = '0';
      }
    }
  }

  // 执行适配
  adaptToWecom();
  
  // 监听窗口大小变化
  window.addEventListener('resize', adaptToWecom);
});

// 导出需要暴露的函数和对象
window.WECOM_CONFIG = WECOM_CONFIG;
window.isWecomEnv = isWecomEnv;
window.initWecomSDK = initWecomSDK;
window.wecomStorage = wecomStorage;