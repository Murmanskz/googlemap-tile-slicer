/**
 * 图像重采样
 * 将原图放大到目标zoom所需的尺寸，再压缩到各个zoom所需的尺寸
 * 配置config.js  执行入口  index.js 
 * 获取瓦片范围 mergeBounds.js
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { bondLatlng, pngName, baseZoom, baseOneTileSize, zoomRange, limitInputPixels } = require('./config.js');
const createTiles =  require('./createTiles.js');


// 本地高清图片路径
const imagePath = path.join(__dirname, `./${pngName}.png`)

let originalWidth, originalHeight;

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




async function resizeOrgImg(zoomRange) {
  // 获取原始图片的尺寸
  const metadata = await sharp(imagePath).metadata();
  originalWidth = metadata.width;
  originalHeight = metadata.height;

  
  // 左上角经纬度到瓦片坐标
  const baseTopLeft = latLngToTileXY(bondLatlng.topLeft.lat, bondLatlng.topLeft.lng, baseZoom);

  // 右下角经纬度到瓦片坐标
  const baseBottomRight = latLngToTileXY(bondLatlng.bottomRight.lat, bondLatlng.bottomRight.lng, baseZoom);


  const baseImageSizeInTile = {
    x: baseBottomRight.tileX - baseTopLeft.tileX + 1,
    y: baseBottomRight.tileY - baseTopLeft.tileY + 1,
  }
  
  
  const compressedImageBase = path.join(__dirname, `compressed-image-base-${pngName}.png`);

  

  // -------------------------------------------------------------------------

  // 计算放大到basezoom时的航拍图分辨率
  // 为了保证提供的经纬度完美贴合地图，放大缩小时候，不能直接按照宽度等比例放大！！！，适当的变形来适合地图
  const imgWidthInBaseZoom = baseImageSizeInTile.x * baseOneTileSize
  const imgHeightInBaseZoom = baseImageSizeInTile.y * baseOneTileSize


  // 如果重复文件名 代表已经处理过
  if (!fs.existsSync(compressedImageBase)) {
    // 放大到基于baseZoom * 256
    // 强行根据宽高缩放，使用fill填充比例，可能会轻微变形 但是这是保证贴图吻合地图的重要处理逻辑
    await sharp(imagePath)
    .resize(Math.floor(imgWidthInBaseZoom), Math.floor(imgHeightInBaseZoom), {fit: 'fill'})
    .png()
    .toFile(path.join(compressedImageBase));
  }

  console.log('放大到baseZoom', `${originalWidth} -> ${Math.floor(imgWidthInBaseZoom)}`);
  // console.log('floor', `${imgWidthInBaseZoom}*${imgHeightInBaseZoom} -> ${Math.floor(imgWidthInBaseZoom)}*${Math.floor(imgHeightInBaseZoom)}`);

  // -------------------------------------------------------------------------
  

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

    // console.log(currentZoom, tileXYRange);
    

    // 分级压缩图像
    const compressedImagePath = path.join(__dirname, `compressed-image-${pngName}-${currentZoom}.png`);

    // 如果重复文件名 代表已经切割过
    if (fs.existsSync(compressedImagePath)) {
      // 跳过
      continue
    }


    const scaledWidth = (tileXYRange.x[1] - tileXYRange.x[0]) * baseOneTileSize
    const scaledHeight = (tileXYRange.y[1] - tileXYRange.y[0]) * baseOneTileSize

    console.log(currentZoom, `${Math.floor(scaledWidth)} * ${Math.floor(scaledHeight)}`);
    

    // 压缩结果
    // 强行根据宽高缩放，使用fill填充比例，可能会轻微变形 但是这是保证贴图吻合地图的重要处理逻辑
    await sharp(compressedImageBase, { limitInputPixels })
      .resize(Math.floor(scaledWidth), Math.floor(scaledHeight), {fit: 'fill'}) 
      .png()
      .toFile(compressedImagePath);

    
  }
}

async function main() {
  // 剪裁 分辨率重采样
  await resizeOrgImg(zoomRange)
  // 切图
  createTiles(zoomRange)
}

main()

