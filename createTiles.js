/**
 * 切图
 * https://www.cnblogs.com/zhangbig/p/17439290.html  参考
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { bondLatlng, pngName, zoomRange, baseOneTileSize, limitInputPixels, format, quality  } = require('./config.js');


/// 输出目录
const outputDir = path.join(__dirname, 'tiles');


function latLngToTileXY(lat, lng, zoom) {

  // 经纬度转Web Mercator
  const siny = Math.sin((lat * Math.PI) / 180);
  const worldCoordinateX = (lng + 180) / 360;
  const worldCoordinateY = (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI));

  // !!!! 航拍图西北角瓦片X Y坐标  向下取整就能得到瓦片图的X Y坐标
  const scale = 1 << zoom;
  const tileX = worldCoordinateX * scale;
  const tileY = worldCoordinateY * scale;

  return { tileX, tileY };
}


async function createTiles(zoomRange) {
  
  const [startZoom, endZoom] = zoomRange

  for (let currentZoom = endZoom; currentZoom >= startZoom; currentZoom--) {
    
    // 左上角经纬度到瓦片坐标
    const topLeft = latLngToTileXY(bondLatlng.topLeft.lat, bondLatlng.topLeft.lng, currentZoom);

    // 右下角经纬度到瓦片坐标
    const bottomRight = latLngToTileXY(bondLatlng.bottomRight.lat, bondLatlng.bottomRight.lng, currentZoom);

    // 获取当前zoom下瓦片图的开始到结束x, y
    const tileXYRange = {
      x: [topLeft.tileX, bottomRight.tileX],
      y: [topLeft.tileY, bottomRight.tileY]
    }


    // 分级压缩图像
    const compressedImagePath = path.join(__dirname, `compressed-image-${pngName}-${currentZoom}.png`);

    // 获取压缩后的图像尺寸
    const compressedMetadata = await sharp(compressedImagePath, { limitInputPixels }).metadata();
    const imageWidth = compressedMetadata.width;
    const imageHeight = compressedMetadata.height;


    // 输出当前zoom下的文件
    const {x:xRange, y:yRange } = tileXYRange

    // 遍历给定的 x 和 y 范围，切割图片
    let baseOneTileSizeX = 0
    let baseOneTileSizeY = 0
    let top = 0
    let left = 0
    let i = 0;

    // 真实地图西北角与瓦片的起始4角的偏移量
    const offsetX = (xRange[0] - Math.floor(xRange[0])) * baseOneTileSize
    const offsetY = (yRange[0] - Math.floor(yRange[0])) * baseOneTileSize


    // console.log('offset', Math.floor(yRange[0]), Math.floor(yRange[1]));
    // 总瓦片数量
    const totalTiles = (Math.floor(xRange[1]) - Math.floor(xRange[0]) + 1) * (Math.floor(yRange[1]) - Math.floor(yRange[0]) + 1);

    for (let x = Math.floor(xRange[0]); x <= Math.floor(xRange[1]); x++) {
      let ii = 0
      for (let y = Math.floor(yRange[0]); y <= Math.floor(yRange[1]); y++) {

        // 计算该瓦片在图片中的像素坐标
        left = Math.floor((baseOneTileSize - offsetX) + (x -  Math.floor(xRange[0]) - 1) * baseOneTileSize)
        top = Math.floor((baseOneTileSize - offsetY) + (y -  Math.floor(yRange[0]) - 1) * baseOneTileSize)
        ii++

        
        
        // 如果瓦片超出图像边界，用透明像素填充
        let extendOptions = {
          top: 0,
          left: 0,
          bottom: 0, // 如果瓦片的高度不足 256 像素，填充底部
          right: 0, // 如果瓦片的宽度不足 256 像素，填充右侧
          extendWith: 'background',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // 使用透明像素填充
        };
        
        if (x === Math.floor(xRange[0])) {
          // 处理第一列
          baseOneTileSizeX =  Math.floor(baseOneTileSize - offsetX)
          left = 0
          // 补充左边的空白
          extendOptions = {
            ...extendOptions, 
            left: baseOneTileSize - baseOneTileSizeX,
            right: 0,
          }
        } else if (x === Math.floor(xRange[1])) {
          // 处理最后一排
          // 跟图片像素对比，谁小取谁
          baseOneTileSizeX = Math.floor(Math.min((xRange[1] - Math.floor(xRange[1])) * baseOneTileSize, imageWidth - left));
          // 补充右边的空白像素
          extendOptions = {
            ...extendOptions, 
            left: 0,
            right:  baseOneTileSize - baseOneTileSizeX,
          };
        } else {
          baseOneTileSizeX = baseOneTileSize
          // x轴不需要补充像素
          extendOptions = {
            ...extendOptions,
            left: 0,
            right: 0
          };
        }
        

        if (y === Math.floor(yRange[0])) {
           // 处理第一行
          baseOneTileSizeY = Math.floor(baseOneTileSize - offsetY);
          top = 0
          // 补充上边的空白像素
          extendOptions = {
            ...extendOptions, 
            top: baseOneTileSize - baseOneTileSizeY,
            bottom: 0,
          }
        } else if (y === Math.floor(yRange[1])) {
          // 处理最后一行
          // 跟图片像素对比，谁小取谁
          baseOneTileSizeY = Math.floor(Math.min((yRange[1] - Math.floor(yRange[1])) * baseOneTileSize, imageHeight - top));
          // console.log('处理最后一行', (yRange[1] - Math.floor(yRange[1])) * baseOneTileSize);
          
          // 补充下边的空白像素
          extendOptions = {
            ...extendOptions, 
            top: 0,
            bottom: baseOneTileSize - baseOneTileSizeY,
          }
        } else {
          baseOneTileSizeY = baseOneTileSize
          // 上下不需要补充像素
          extendOptions = {
            ...extendOptions, 
            top: 0,
            bottom: 0,
          }
        }

        // const tilePath = path.join(outputDir, `${currentZoom}/${x}`);

        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        // 计算进度
        // 当前瓦片数量
        const currentTiles = (x -  Math.floor(xRange[0])) * (Math.floor(yRange[1]) - Math.floor(yRange[0]) + 1) + (y - Math.floor(yRange[0])) + 1;
        const progress = `${((currentTiles / totalTiles) * 100).toFixed(2)}%`;
        
        // 生成瓦片文件名
        let fileName = `${currentZoom}_${x}_${y}.${format}`;
        let filePath = path.join(outputDir, fileName);

        // 计算瓦片在图片中的坐标范围
        let xyRangeProgress = `X: ${left} ~ ${left + baseOneTileSizeX}, Y: ${top} ~ ${top + baseOneTileSizeY})`

        let consoleText = `${progress} ${currentZoom}级/${totalTiles}片  ${xyRangeProgress}  ${fileName}`;

        // // 如果重复文件名  加后缀，为了手动处理两个航拍图切片公用一个瓦片的情况
        // if (fs.existsSync(filePath)) {
        //   fileName = `${currentZoom}_${x}_${y}_repet.${format}`;
        //   filePath = path.join(outputDir, fileName);
        // }

        // 如果重复文件名 代表已经切割过
        if (fs.existsSync(filePath)) {
          // 跳过
          continue
        }
        
        // 使用 sharp 进行裁剪
        sharp(compressedImagePath, { limitInputPixels })
          .extract({ left: left, top: top, width: baseOneTileSizeX, height: baseOneTileSizeY })
          .extend(extendOptions) // 填充不足的部分
          .webp({ quality }) // 输出为 webp 格式
          .toFile(filePath)
          .then(() => {
            console.log(consoleText);
          })
          .catch((err) => {
            console.error(err, consoleText);
          });
      }
      i++
    }
  }
}

module.exports = createTiles;
