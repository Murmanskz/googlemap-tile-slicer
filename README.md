# GoogleMap Tile Slicer

googlemap-tile-slicer 是一个googlemap瓦片切割工具，将输入的图片切割为 Google Maps 瓦片图。该工具通过图片路径、地图的经纬度范围、Google Maps 的缩放级别，最终输出瓦片图。以及可以获取瓦片图范围

## 功能

- 逐步引导用户输入配置
- 按照给定的 Google Maps 缩放范围生成瓦片图
- 自定义输入图片的左上角与右下角经纬度
- 输出切割好的瓦片到指定目录

## 环境要求

- node: 20.X
- sharp: [0.33.5](https://github.com/lovell/sharp)



## 安装依赖

```
nvm use

yarn
```

## 使用

> 配置 config.js 后
```
node index
```

### 断点续切
> 由于某些未知错误或者断电导致计算机退出切图程序，该工具支持断点续切，重新运行程序会从上次切图的位置继续切图（考虑到可能多次执行切图，目前只推荐手动修改配置续切）

1. 找到tiles文件里最新的一个文件 拿到文件名  / 18_123456_789039.webp
2. 编辑 `config.js` 文件中的  `breakpointZoomRange` `breakpointStart`变量

````
// 剩余需要切图的zoom范围
breakpointZoomRange = [12, 18]

// 对应最后一个文件名的x y瓦片坐标
breakpointStart = [123456, 789039]

````
### 执行续切

```
node createTilesStartFromBreakpoint
```


 

## 瓦片坐标范围

> 获取瓦片坐标范围 让googleMap在此区域内才请求自定义瓦片图
```
node mergeBounds
```

## FEATURES ✅

⬜️ 支持命令行执行

⬜️ 逐步引导用户输入配置


