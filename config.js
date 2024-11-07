const bounds = {
  // '20240222-2': {
  //   topLeft: { lat: 0.629532, lng: 127.917396 }, // 左上角经纬度
  //   bottomRight: { lat: 0.601535, lng: 128.015329 } // 右下角经纬度
  // },
  // '20240222-1': {
  //   topLeft: { lat: 0.703402, lng: 127.961286 }, // 左上角经纬度
  //   bottomRight: { lat: 0.643271, lng: 127.992412 } // 右下角经纬度
  // },
  // '202407qcgx-south-all2': {
  //   topLeft: { lat: 0.554159, lng: 127.883903 }, // 左上角经纬度
  //   bottomRight: { lat: 0.462128, lng: 128.047638 } // 右下角经纬度
  // }
  '20241022': {
    topLeft: { lat: 0.828743, lng: 127.862529 }, // 左上角经纬度
    bottomRight: { lat: 0.458371, lng: 128.073281 } // 右下角经纬度
  }
}

/**
 * 当前处理图片的name
 */
const currentImg = '20241022'

/**
 * ！！特别重要 认为原始图片在baseZoom 下是全分辨率展示
 */
const baseZoom = 17;

/**
 * 图片要处理的缩放范围
 */
const zoomRange = [12, baseZoom]

// 瓦片分辨率
const baseOneTileSize = 256;

// 图片质量 0-100
const quality = 80

// 图片格式
const format = 'webp'


module.exports = {
  // 图片精确经纬度
  bondLatlng: bounds[currentImg],
  pngName: currentImg,
  bounds,
  zoomRange,
  baseOneTileSize,
  baseZoom,
  limitInputPixels: 10000000000, // 限制输入图片像素数量
  format,
  quality,
}
