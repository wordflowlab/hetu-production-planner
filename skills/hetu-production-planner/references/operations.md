# 操作地图

由正式清单生成，执行前发现当前安装版Schema。

| 动作 | 用途 | 必填参数 | 效果 |
| --- | --- | --- | --- |
| list_projects | 查找筹备工程 |  | read |
| get_project | 读取固定筹备工程 | object_id | read |
| save_project | 保存完整筹备工程 | expected_revision, expected_sha256, operation_key, content | managed_write |
| put_scene | 维护场次 | object_id, expected_revision, expected_sha256, operation_key, scene | managed_write |
| remove_scene | 移除场次 | object_id, expected_revision, expected_sha256, operation_key, scene_id | managed_write |
| put_requirement | 维护制作需求 | object_id, expected_revision, expected_sha256, operation_key, requirement | managed_write |
| remove_requirement | 移除制作需求 | object_id, expected_revision, expected_sha256, operation_key, requirement_id | managed_write |
| put_usage | 维护场次需求关联 | object_id, expected_revision, expected_sha256, operation_key, usage | managed_write |
| remove_usage | 移除场次需求关联 | object_id, expected_revision, expected_sha256, operation_key, usage_id | managed_write |
| put_task | 维护准备任务 | object_id, expected_revision, expected_sha256, operation_key, task | managed_write |
| remove_task | 移除准备任务 | object_id, expected_revision, expected_sha256, operation_key, task_id | managed_write |
| put_block | 维护准备批次 | object_id, expected_revision, expected_sha256, operation_key, block | managed_write |
| remove_block | 移除准备批次 | object_id, expected_revision, expected_sha256, operation_key, block_id | managed_write |
| put_note | 维护场次意见 | object_id, expected_revision, expected_sha256, operation_key, note | managed_write |
| remove_note | 移除场次意见 | object_id, expected_revision, expected_sha256, operation_key, note_id | managed_write |
| preview_breakdown | 预览固定Fountain场次 | object_id, source_index | read |
| import_scenes | 从固定Fountain添加场次 | object_id, expected_revision, expected_sha256, operation_key, source_index, id_prefix | managed_write |
| check_production | 检查筹备缺口与旧意见 | object_id | read |
| requirements_matrix | 读取场次与制作需求矩阵 | object_id | read |
| calculate_plan | 计算准备依赖、批次与估算 | object_id | read |
| preview_source_change | 预览固定剧本修订影响 | object_id, from_source_index, to_source_index | read |
| scene_digest | 读取场次意见固定摘要 | object_id, scene_id | read |
| scene_sheet | 读取场次制作单及来源 | object_id, scene_id | read |
| department_handoff | 准备专业制作交接 | object_id, department, scene_ids | read |
| export_preparation | 导出固定离线筹备包 | object_id | read |
| get_source | 分块读取固定来源 | object_id, source_index | read |
| get_basis | 读取固定专业依据 | object_id, basis_index | read |
| compare_versions | 比较固定筹备修订 | object_id, from_revision, to_revision | read |
| export_project | 分块导出完整筹备数据 | object_id, format | read |
| build_context | 准备有界创作上下文 | object_id, goal, max_chars | read |
| create_handoff | 准备本工程AI接续 | object_id, goal | read |
| get_operation | 回读原操作 | operation_key | read |
