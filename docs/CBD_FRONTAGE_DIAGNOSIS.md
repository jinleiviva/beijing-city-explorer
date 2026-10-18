# CBD 首层与绿地候选诊断

2026-10-17。范围只限独立 CBD 街景，冻结首轮工程只读。当前状态：**原创几何候选 + CPU 检查通过；新版浏览器视觉未验收**。未启动浏览器、渲染器、WebGL、Blender 或服务器；未下载贴图或复制模型。新版真实浏览器质量门仍受预览环境阻塞；用户已要求暂停登录，另有独立环境修复核查。

## 1. 已直接观察的图像

以下均为既有研究缓存，只读查看像素，不进入运行时资产：

- 原视频 `beijing_city_8h/reference/frames/frame_03.jpg`：近地层有体积明确的树冠、低灌、草层，建筑门窗和屋檐形成遮挡与凹深，路径、台阶和基座的接触清楚。可借用层级和尺度组织，不能把乡村植被密度或建筑外形直接套到国贸。
- `phase48_final_runtime_zip_smoke__cbd_hero.jpg` 与 `phase38c_facade_ground_station__cbd_2050_surface.jpg`：旧版大视域可辨塔楼轮廓，地面大量浅色硬质平面，树木在该视距非常细小，首层门厅读不出来。这是旧图观察，不能代替新版近景评审；也不能由远景推断模型完全没有首层细节。
- SOM 国贸 3A 既有官方远景 `assets/architecture/research/china_world_3.jpg`：确认塔身、裙房关系；该图不足以数清西侧门数或测量入口。官方项目源：[SOM 3A](https://www.som.com/projects/china-world-trade-center-3a/)。本轮该英文页返回 403；使用已缓存官方图研究，没有绕过登录或权限限制。
- SOM 国贸 3B `docs/geography/cbd-context-references/cwtc_3b_03.jpg`、`cwtc_3b_01.jpg`，以及 `assets/architecture/research/china_world_3b.jpg`：实看见通高玻璃首层、细金属竖框、向外伸出的浅色玻璃/金属雨棚、独立低裙房及沿街树冠/低篱。照片 © Tim Griffith，拍摄年月未核实。[SOM 3B](https://www.som.com/projects/china-world-trade-center-3b/)。3B 照片只作构造类型参照，不能当作 3A 精确入口照片。
- 国贸北商城 `docs/geography/modern-street-references/guanghua.jpg`：浅石材大框、上部玻璃盒、向后退的首层玻璃、商城前低篱、成排行道树、屋顶种植。TurnOnTheNight，2026-07-19，CC BY-SA 4.0。[原始照片说明页](https://commons.wikimedia.org/wiki/File:Intersection_of_Guanghua_Road_and_Jintong_East_Road_20260719151718.jpg)。照片中可见店标，但本模块不复刻任何店标或商业租户。
- 光华路西段 `guanghua_west.jpg`：成熟冠层可形成连续林荫，且两侧是院落街墙，不应把这张图的整段林荫密度推给国贸路口。N509FZ，2022-09-09。[来源](https://commons.wikimedia.org/wiki/File:Guanghua_Rd_east_of_Jianhua_Rd_(20220909152621).jpg)。
- 嘉里 `kerry_facade.jpg`：浅石材、深色/铜色格栅、凹入首层与树干/树冠叠合；原项目来源 4travel，拍摄年代不详，仅作材料与近景参照。[原引用](https://4travel.jp/os_shisetsu/10548266)。`kerry_owner_complex.jpg` 为业主官方全貌，办公塔、裙房与道路关系可辨，不能拿其中办公塔当酒店高度依据。[Kerry 官方](https://www.kerryprops.com/en/property-details/68/beijing-kerry-centre?location=1)。

## 2. 优先问题和候选策略

1. **有玻璃底座，缺可识别的门厅层级。** 既有 `chinaWorldRefined` 的 0–18 m 塔基主要是整块玻璃足迹；本模块增加门扇、门楣、两侧固定窗、实几何窗洞侧壁、门厅顶壁、雨棚支撑与落地脚座。不会改塔楼、裙房的原高度、方位或足迹。
2. **首层和地面接触弱。** 用轻微抬高的门厅台面、两级各 12 cm 的视觉台阶、侧向坡面、排水条与断开的局部缘石建立接触。尺寸为原创候选，不能称测绘或无障碍合规证明；真实地面高差、门口是否确有台阶仍须照片/现场核实。
3. **浅色玻璃/石材对比低。** 仅复用既有 `glassDark / glassPale / silverFacade / stoneLight / paving / metalDark`；凹处更暗、门框与遮棚较浅，金属保持克制，不新增共享材质、不泛化铜色、不添加品牌。
4. **绿化只有树位/大块绿地时，近景缺少低层。** 北商城照片明确见树、低篱与屋顶绿化，现有模型本身已经有小型屋顶花槽，但不足以形成地面植被层级。本候选只补两组低篱/地被叶簇，分别有底层、主体和较小顶冠；不增加树数。集成者在已有真实树位中替换 8 棵 hero 树即可，不应凭空铺满广场。

## 3. 两处真实足迹绑定

### A. 国贸 3A 西侧办公入口

- sourceId `osm-way-116944490`，anchor `[116.4523655, 39.9109755]`。
- 继续使用 `MASSING_LAYOUT.china_world_3` 的原四边形、330 m 高、世界 rotation 0。
- 入口依附西边长边中部，local origin `[-26.406, 0.05565]`；24 m 宽的首层局部，整体覆盖宽 24.7 m，未延伸到原边端之外。
- “办公入口在西、酒店入口在东”有 [SOM 中文说明](https://www.somchina.cn/story/%E7%94%A8%E4%B8%80%E5%BA%A7%E6%A5%BC%EF%BC%8C%E5%AE%9A%E4%B9%89%E4%B8%80%E5%BA%A7%E5%9F%8E%EF%BC%9Asom%E5%85%A8%E7%90%83%E6%91%A9%E5%A4%A9%E5%A4%A7%E6%A5%BC%E5%B7%A1%E7%A4%BC/) 支持；边中点、门数、雨棚和台阶是原创建模推断。
- 门相对新门框后退 0.675 m；固定窗后退 0.79 m；雨棚净高约 4.88 m。

### B. 国贸北商城西北凹进北立面

- sourceId `osm-way-660651177`，anchor `[116.4523622, 39.9115578]`。
- 使用 `CBD_CONTEXT_SITES.cwtc_mall_north` 的原 L 形足迹、27.5 m 原估算高度、世界 rotation 0。
- 选择西半部真正向北的短边，不把东侧较长的北屋面边误当入口。Local origin `[-17.890395, -16.10406]`，覆盖宽 16.7 m，保持原凹进。
- 首层通高玻璃、石材框和西北朝向由街口照片支持；入口中心、门数及小雨棚为候选，未宣称真实商户入口。
- 门凹深 0.515 m；固定窗凹深 0.63 m；雨棚净高约 4.13 m。

**重要构造边界：** 这是附加浅门厅，凹深相对于新门框平面建立。深色背板在原实体外侧，遮挡连续玻璃底座；没有布尔切除原塔基，也没有虚构可穿行的真实室内。主楼占地边界未改；雨棚、台阶与小型入口平台最多向外 3.70 m，另作附属构件范围。若后续要让人物进入建筑，需要另行建立可行走地面/门碰撞逻辑。

3B 保留原 296 m，不因 SOM 主项目页 288 m 与其奖项页/中文资料 296 m 的既有冲突修改高度。本轮没有新增 3B 门厅，避免把未确认朝向写死。

## 4. 两组低篱的放置与边界

`CBD_SHRUB_BEDS` 绑定北商城 anchor 的当地坐标：中心 `[11.5,-32.4]` 与 `[22.5,-32.4]`，每组长度 5.8 m，层叠叶簇高度约 0.5–0.8 m，底层地被约 0.1–0.2 m。没有绿色 box；使用少量低分段椭球冠团和藏在冠内的细茎，复用 `foliage / grass`。

照片支持“商城北侧有连续低篱”的类型和区域，**不支持上述精确花床位置、长度、株数或品种**。这两个位置为有约束的候选：

- 对独立数据 `web/data/cbd-scene.json` 的 200 个建筑足迹、277 条地面道路逐顶点检查；地下/高架路线不当作地面车道。
- std + low 共检查 4,644 个叶簇/茎顶点，未落入建筑或车行道缓冲。
- 叶簇外缘至商城原足迹最少 3.179 m；至最近光华路车道边最少 14.161 m；至该候选入口中心最少 30.806 m，未占入口坡道/台阶或正面通道。
- 该数据未提供所有消防、管线、临时单车/街具或现场人流；CPU 间距不等于现实场地许可。必须用实际新版街景检查树、交通设施与转角视线。
- 不修改现有 landscape 模块，不增加树木总数，不把两处小样当作完整景观完成。

## 5. 接入 API 与资源

入口文件：`project/web/src/round2/cbd-frontages/index.js`。

```js
import {buildCbdFrontages} from './round2/cbd-frontages/index.js';
const candidates=buildCbdFrontages(kit,{quality:'std'}); // 'low' 同样保首层结构
scene.add(candidates); // 只有集成方决定加入；模块不会自动改变场景
```

参数：`includeShrubs:false` 可只看入口；`ids:[...]` 可只看一处；`projectPoint` 允许独立场景改用局部投影；`groundWorldY` 可为数字或接收 binding 的函数。默认使用既有 geo.js 投影和 world ground **-0.02 m**，候选 apron 顶面为 0 m。已按实际 landuseOverrides 检查所有候选顶点：均位于 commercial 地表 -0.02 m，无 park=.23 覆盖或 -1 底板落点；命中 context-osm-way-233523264 与 context-osm-way-1197842042。旧 host 的塔基 1.0 m / 商城 .8 m 原样保留，新门厅基座独立落地。**不能把 host base .8 m 当作地面；若集成场景更改地表，需重新核实。** 两个既有商业面同高重叠，是否实际闪烁须浏览器观察。

可单独获取 `cbdFrontageRecipe(id,{quality})`、`cbdMallLowShrubRecipe({quality})` 和 `getCBDFrontageBinding(id)`。这些 Recipe 坐标以各自既有 host anchor 为原点。`buildCbdFrontages` 一次合并到现有 `kit.buildMergedRecipe`。

CPU 实测包括两个入口和两组植被：

| 级别 | 部件 | 三角形 | 合批 draw calls | GPU 几何字节 |
|---|---:|---:|---:|---:|
| std | 362 | 6,792 | 8 | 365,296 |
| low | 262 | 4,184 | 8 | 246,992 |

8 种材质；4 个投影批次；0 贴图字节；新增树数 0。均低于 15k 三角形 / 12 材质批次。low 去掉把手、细分框、部分雨棚肋和密集叶簇，仍保留实际门窗凹深、雨棚、门楣、支撑脚、台阶、坡面、缘石。

## 6. CPU 验收与下一步视觉门槛

运行：`node project/web/src/round2/cbd-frontages/frontage.test.mjs > qa/cbd-frontage-tests.json`。

8 项 CPU 检查通过：足迹绑定及源对象不变、两个质量档首层结构、实际合批预算、确定性与坐标控制、阴影分组、实际地表覆盖与默认 datum、低篱足迹/道路/通道、入口附属构件道路间距。入口附属构件距地面车道边最少 20.567 m。输出包含源代码/场景数据 SHA-256，`visualAcceptance:false`。

下一步只在新版云浏览器解除登录阻挡后执行：

1. 3A 西侧：host local camera `[-75,18,13]`，target `[-27,4,0]`；北商城：local camera `[-56,19,-57]`，target `[-18,3.5,-17]`。均为候选视角，尚未渲染或视觉认可。
2. 检查阴影是否堵死门洞、浅玻璃是否仍过亮、雨棚是否压住门楣、垂直框是否闪烁；确认旧塔基没有穿出新门框。
3. 用 groundWorldY 对齐地面，低视角查看脚座/台阶/坡道是否接地，入口不应悬浮或埋入人行道。再查北商城裙房上部框与新首层是否对齐。
4. 在同一机位切换 std/low：先看首层轮廓与步行通道是否保留，再评估树冠/低篱的相对比例；不要用航拍截图替代首层检查。
5. 树位替换由集成者负责；确认 8 棵替换不增加总树数，不能遮完门厅、斑马线或交通信号。

本轮可确认候选模块、证据边界与 CPU 数值。地面 Y 已按几何数据与源代码确认，仍不能确认新版实际接触观感、浏览器着色或最终可交付状态。
