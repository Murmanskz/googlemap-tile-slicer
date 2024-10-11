/**
 * 获取多个图片经纬度合并后的 经纬度bound
 */
const { bounds, zoomRange, limitInputPixels } = require('./config.js');

const satelliteImagesBounds = Object.values(bounds);

function latLngToTileXY(lat, lng, zoom) {
  const siny = Math.sin((lat * Math.PI) / 180);
  const worldCoordinateX = (lng + 180) / 360;
  const worldCoordinateY = 0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI);

  const scale = 1 << zoom;
  const tileX = Math.floor(worldCoordinateX * scale);
  const tileY = Math.floor(worldCoordinateY * scale);

  return { tileX, tileY };
}

function getTileBounds(latLngBounds, zoom) {
  const { minLat, minLng, maxLat, maxLng } = latLngBounds;

  const topLeftTile = latLngToTileXY(maxLat, minLng, zoom);
  const bottomRightTile = latLngToTileXY(minLat, maxLng, zoom);

  return {
    xRange: [topLeftTile.tileX, bottomRightTile.tileX],
    yRange: [topLeftTile.tileY, bottomRightTile.tileY]
  };
}

// 合并所有卫星图的边界
function mergeBounds(bounds) {
  let minLat = bounds[0].bottomRight.lat, minLng = bounds[0].topLeft.lng;
  let maxLat = bounds[0].topLeft.lat, maxLng = bounds[0].bottomRight.lng;

  bounds.forEach(b => {
    minLat = Math.min(minLat, b.bottomRight.lat);
    minLng = Math.min(minLng, b.topLeft.lng);
    maxLat = Math.max(maxLat, b.topLeft.lat);
    maxLng = Math.max(maxLng, b.bottomRight.lng);
  });

  return { minLat, minLng, maxLat, maxLng };
}

// 获取所有图片的合并边界
const latLngBounds = mergeBounds(satelliteImagesBounds);

const [startZoom, endZoom] = zoomRange

js = ''

for (let i = startZoom; i <= endZoom; i++) {
  const zoom = i
  // 计算 zoom 级别下的瓦片坐标范围
  const tileBounds = getTileBounds(latLngBounds, zoom);
  console.log(`ZOOM: ${zoom}`, `瓦片范围 X: ${tileBounds.xRange[0]} - ${tileBounds.xRange[1]}, Y: ${tileBounds.yRange[0]} - ${tileBounds.yRange[1]}`);
  js += `${i === startZoom ? 'if' : 'else if'} (zoom === ${zoom} && coord.x >= ${tileBounds.xRange[0]} && coord.x <= ${tileBounds.xRange[1]} && coord.y >= ${tileBounds.yRange[0]} && coord.y <= ${tileBounds.yRange[1]}) {
          return url2;
        }`
}

js += 'else {return null}'

console.log(js);


