#!/usr/bin/env node


const readline = require('readline');
const processImages = require('./index.js');  // 引入处理逻辑

// 创建命令行输入输出接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const config = {};

// 逐步引导用户输入
rl.question('请输入图片地址: ', (imagePath) => {
  config.imagePath = imagePath;
  
  rl.question('请输入图片左上角的经纬度 (格式: 纬度, 经度): ', (topLeft) => {
    const [lat1, lon1] = topLeft.split(',').map(Number);
    config.topLeft = { lat: lat1, lon: lon1 };

    rl.question('请输入图片右下角的经纬度 (格式: 纬度, 经度): ', (bottomRight) => {
      const [lat2, lon2] = bottomRight.split(',').map(Number);
      config.bottomRight = { lat: lat2, lon: lon2 };

      rl.question('请输入Google Maps的缩放范围 (格式: 最小zoom, 最大zoom): ', (zoomRange) => {
        const [minZoom, maxZoom] = zoomRange.split(',').map(Number);
        config.zoomRange = { min: minZoom, max: maxZoom };

        // 调用处理函数生成瓦片图
        processImages(config)
          .then((outputFolder) => {
            console.log(`瓦片已生成，输出目录为: ${outputFolder}`);
            rl.close();
          })
          .catch((err) => {
            console.error('处理图片时出错:', err);
            rl.close();
          });
      });
    });
  });
});
