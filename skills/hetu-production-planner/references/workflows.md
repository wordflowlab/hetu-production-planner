# 专业流程

## 从固定剧本开始

读取原稿、已读范围与现有工程。明确Fountain标题可preview_breakdown，核对识别覆盖后import_scenes；无标题或复杂格式由Agent提供有据场次，不把空结果当成没有场景。BOM、CRLF保留原字节，范围为UTF-8半开区间。

按场次维护requirement与usage，明确部门、数量和单位。同一非消耗资源跨场复用不等于采购量累加；正式人物以固定设定来源核验，图片按固定素材关联。

## 准备计划与未知估算

任务关联场次及需求，先说明前置和完成标准，再准备串行批次。calculate_plan展示拓扑顺序、阻塞传递、工时／费用已知部分和未知项、批次容量。费用最小单位为分或cent，同工程单币种；估算不能作为付费批准。

## 剧本变更与意见

旧原稿和来源索引保持。把新固定稿追加到来源，preview_source_change比较同范围字节；变化、删去或位置漂移都交给Agent复读。preview不能自动更新工程。意见用scene_digest固定场次及其关联，返工后check_production提示stale，不自动标解决。

## 交接与继续创作

department_handoff按明确scene_ids与art／stage／video输出当前专业需求，连同固定object_ref交给实际发现的下游包。下游保留此专业basis_ref，读取自己的包内Skill后准备成果；没有安装就说明具体缺项，不伪造成功。需要新稿时沿宿主创作任务准备候选，不直接改正式正文。

export_preparation交付完整离线HTML，分块核对offset、总字节、分块和完整摘要。回读工程继续下一轮，不以一次导出为完成。未知写操作先get_operation，明确未落盘才原键原输入恢复。

原文件导入后先回读固定文稿，重新依据实际字节定位；宿主格式转换可能产生Markdown转义，不能沿用未核对的原文件坐标。
