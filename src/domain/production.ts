import {canonical,requireValue as need,data} from '../../vendor/project-store.ts';
import {hash} from './artifact.ts';
import {span,sourceText} from './text.ts';
import {find,unique,taskOrder,plan} from './planning.ts';
export const departmentNames:Record<string,string>={cast:'人物',location:'场景',costume:'服装',prop:'道具',makeup:'妆造',effects:'效果',sound:'声音',equipment:'设备',other:'其他'};
export function validateDomain(p:any){
 unique(p.scenes.map((s:any)=>s.order),'场次顺序');unique(p.blocks.map((b:any)=>b.order),'批次顺序');
 for(const s of p.scenes)for(const range of s.ranges)need(range.byte_end>range.byte_start&&Buffer.byteLength(range.quote)===range.byte_end-range.byte_start,'场次引文长度或范围无效。');
 for(const r of p.requirements){need((r.entity_ref===null)===(r.entity_source_index===null),'实体与固定设定来源须成对提供。');unique(r.asset_source_indices,'需求素材');need(r.state!=='blocked'||r.notes.trim(),'阻塞需求须说明原因。');}
 unique(p.usages.map((u:any)=>canonical([u.scene_id,u.requirement_id])),'同场次需求关联');
 for(const u of p.usages){find(p.scenes,u.scene_id,'关联场次');find(p.requirements,u.requirement_id,'关联需求');need(u.unit.trim(),'数量单位不能为空白。');}
 for(const t of p.tasks){unique(t.scene_ids,'任务场次');unique(t.requirement_ids,'任务需求');unique(t.depends_on,'前置任务');need(t.state!=='blocked'||t.blocked_reason.trim(),'阻塞任务须说明原因。');for(const id of t.scene_ids)find(p.scenes,id,'任务场次');for(const id of t.requirement_ids)find(p.requirements,id,'任务需求');for(const id of t.depends_on){const dep=find(p.tasks,id,'前置任务');need(t.state!=='done'||dep.state==='done','已完成任务的前置必须全部完成。');}}
 taskOrder(p);const assigned=new Map<string,number>();
 for(const b of p.blocks){unique(b.task_ids,'批次任务');for(const id of b.task_ids){find(p.tasks,id,'批次任务');need(!assigned.has(id),'同一准备任务不能重复安排批次。');assigned.set(id,b.order);}}
 for(const t of p.tasks)if(assigned.has(t.id))for(const dep of t.depends_on){need(assigned.has(dep),'已排入批次的任务仍有未排入批次的前置。');need(assigned.get(dep)!<=assigned.get(t.id)!,'前置任务不能排在后续批次。');}
 for(const n of p.notes){find(p.scenes,n.scene_id,'意见场次');need(n.status!=='resolved'||n.resolution.trim(),'解决意见须说明处理结果。');}
}
export async function checkSources(p:any,s:any[],request:any){
 for(const r of p.requirements){
  for(const index of r.asset_source_indices)need(s[index]?.source_ref?.kind==='asset','需求素材须是当前作品固定asset来源。');
  if(r.entity_ref!==null){const source=s[r.entity_source_index]?.source_ref;need(source?.kind==='blueprint','实体须引用当前作品的固定设定。');const entity=data(await request('hetu.extensions.sources.inspect',{source_ref:source,entity_ref:r.entity_ref}));const expected=r.department==='cast'||r.department==='costume'||r.department==='makeup'?'character':r.department==='location'?'location':null;need(expected?entity.entity_kind===expected:['character','location','world_entry'].includes(entity.entity_kind),'需求部门与固定实体类型不对应。');}
 }
}
export function sceneSheet(p:any,id:string){
 const scene=find(p.scenes,id,'场次'),usages=p.usages.filter((u:any)=>u.scene_id===id),requirements=usages.map((u:any)=>({...find(p.requirements,u.requirement_id,'制作需求'),quantity:u.quantity,unit:u.unit,scene_notes:u.notes})),ids=new Set(requirements.map((r:any)=>r.id));
 return {scene,requirements,tasks:p.tasks.filter((t:any)=>t.scene_ids.includes(id)||t.requirement_ids.some((r:string)=>ids.has(r)))};
}
export const sceneDigest=(p:any,id:string)=>hash(canonical(sceneSheet(p,id)));
export function matrix(p:any){return {scenes:[...p.scenes].sort((a,b)=>a.order-b.order).map(s=>({id:s.id,title:s.title,...sceneSheet(p,s.id)})),resources:p.requirements.map((r:any)=>({...r,appearances:p.usages.filter((u:any)=>u.requirement_id===r.id).map((u:any)=>({scene_id:u.scene_id,title:find(p.scenes,u.scene_id,'场次').title,quantity:u.quantity,unit:u.unit,notes:u.notes}))})),note:'数量按场次和单位展示；复用资源不合计为采购量。prepared只表示专业工程声明。'};}
export function check(p:any){const pl=plan(p);return {scene_count:p.scenes.length,unlocated_scenes:p.scenes.filter((s:any)=>!s.ranges.length).map((s:any)=>({id:s.id,title:s.title})),scenes_without_requirements:p.scenes.filter((s:any)=>!p.usages.some((u:any)=>u.scene_id===s.id)).map((s:any)=>({id:s.id,title:s.title})),resource_gaps:p.requirements.filter((r:any)=>r.state!=='prepared').map((r:any)=>({id:r.id,name:r.name,state:r.state,notes:r.notes})),blocked_tasks:pl.dependency_order.filter(t=>t.blockers.length),unused_requirements:p.requirements.filter((r:any)=>!p.usages.some((u:any)=>u.requirement_id===r.id)&&!p.tasks.some((t:any)=>t.requirement_ids.includes(r.id))).map((r:any)=>({id:r.id,name:r.name})),stale_note_ids:p.notes.filter((n:any)=>n.scene_sha256!==sceneDigest(p,n.scene_id)).map((n:any)=>n.id),unknown_minutes:pl.unknown_minutes,unknown_cost:pl.unknown_cost,over_capacity_blocks:pl.blocks.filter((b:any)=>b.over_capacity===true),note:'检查已登记结构及声明状态，未登记的专业需求与语义影响仍由Agent复读。'};}
export function sourceImpact(p:any,s:any[],from:number,to:number){
 need(from!==to,'请明确选择不同的新旧固定来源。');sourceText(s[from]);const newer=sourceText(s[to]),bytes=Buffer.from(newer),changed=new Set<string>(),unchanged:any[]=[];
 for(const scene of p.scenes){const ranges=scene.ranges.filter((r:any)=>r.source_index===from);if(!ranges.length)continue;const stable=ranges.every((r:any)=>{try{return r.byte_end<=bytes.length&&span(newer,r.byte_start,r.byte_end)===r.quote;}catch{return false;}});if(stable)unchanged.push({id:scene.id,title:scene.title});else changed.add(scene.id);}
 const requirements=new Set(p.usages.filter((u:any)=>changed.has(u.scene_id)).map((u:any)=>u.requirement_id)),tasks=new Set(p.tasks.filter((t:any)=>t.scene_ids.some((id:string)=>changed.has(id))||t.requirement_ids.some((id:string)=>requirements.has(id))).map((t:any)=>t.id));
 let grow=true;while(grow){grow=false;for(const t of p.tasks)if(!tasks.has(t.id)&&t.depends_on.some((id:string)=>tasks.has(id))){tasks.add(t.id);grow=true;}}
 return {from_source_index:from,to_source_index:to,unchanged,scenes_to_recheck:p.scenes.filter((v:any)=>changed.has(v.id)).map((v:any)=>({id:v.id,title:v.title})),affected_requirements:p.requirements.filter((v:any)=>requirements.has(v.id)).map((v:any)=>({id:v.id,name:v.name})),affected_tasks:p.tasks.filter((v:any)=>tasks.has(v.id)).map((v:any)=>({id:v.id,title:v.title})),not_compared_scenes:p.scenes.filter((v:any)=>!v.ranges.some((r:any)=>r.source_index===from)).map((v:any)=>({id:v.id,title:v.title})),note:'只比较相同UTF-8字节范围，变化或位移都需要复读；显式依赖外的影响未知。工程与旧来源未被更新。'};
}
export function departmentHandoff(p:any,ids:string[],department:string){
 need(ids.length>0,'请选择至少一个明确场次。');unique(ids,'交接场次');const sheets=ids.map(id=>sceneSheet(p,id)),allowed=department==='art'?new Set(['cast','location','costume','prop','makeup']):department==='stage'?new Set(['cast','location','prop','equipment']):null,requirementIDs=new Set(sheets.flatMap(s=>s.requirements.filter((r:any)=>!allowed||allowed.has(r.department)).map((r:any)=>r.id)));
 return {department,scenes:sheets.map(s=>({scene:s.scene,requirements:s.requirements.filter((r:any)=>requirementIDs.has(r.id))})),tasks:p.tasks.filter((t:any)=>t.scene_ids.some((id:string)=>ids.includes(id))||t.requirement_ids.some((id:string)=>requirementIDs.has(id))),currency:p.currency,note:'根据固定场次与制作需求准备专业候选；回读目标插件Skill后执行。此交接不自动生成素材、支付、正式选用或定稿。'};
}
