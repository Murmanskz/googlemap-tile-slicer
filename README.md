# GoogleMap Tile Slicer

googlemap-tile-slicer 是一个googlemap瓦片切割工具，将输入的图片切割为 Google Maps 瓦片图。该工具通过图片路径、地图的经纬度范围、Google Maps 的缩放级别，最终输出瓦片图。以及可以获取瓦片图范围

## 功能

- 逐步引导用户输入配置
- 按照给定的 Google Maps 缩放范围生成瓦片图
- 自定义输入图片的左上角与右下角经纬度
- 输出切割好的瓦片到指定目录

## 环境要

- node: 20.X
- sharp: [0.33.5](https://github.com/lovell/sharp)



## 安装依赖

```
nvm use

yarn
```

## 使用

```
// 配置 config.js 后

//切图
node index.js
```

## 瓦片坐标范围

```
// 获取瓦片坐标范围 让googleMap在此区域内才请求自定义瓦片图
node mergeBounds.js
```

## TODO

1. 支持命令行执行
2. 逐步引导用户输入配置


