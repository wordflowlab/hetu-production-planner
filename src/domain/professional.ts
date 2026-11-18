import {requireValue as need} from '../../vendor/project-store.ts';
import {artifact,escapeHTML as esc,htmlPage} from './artifact.ts';
import {sourceText} from './text.ts';
import {parseScenes} from './breakdown.ts';
import {plan} from './planning.ts';
import {check,matrix,sourceImpact,sceneDigest,sceneSheet,departmentHandoff,departmentNames} from './production.ts';
export {validateDomain,checkSources} from './production.ts';
export function validateTransition(_next:any,_previous:any,_action?:string){}
export async function pureAction(_a:string,_i:any){return undefined;}
export async function writeProfessional(a:string,p:any,s:any[],i:any,_request:any){
 need(a==='import_scenes','未知专业写动作。');const parsed=parseScenes(sourceText(s[i.source_index]),i.source_index,i.id_prefix);need(!parsed.unterminated_comment,'固定剧本包含未结束注释，请先核对来源。');need(parsed.scenes.length,'没有识别到明确Fountain场景标题，请由Agent准备有据场次。');
 const start=Math.max(0,...p.scenes.map((v:any)=>v.order));for(const scene of parsed.scenes){need(!p.scenes.some((v:any)=>v.id===scene.id),'导入场次ID已存在，请核对原操作或换明确前缀。');p.scenes.push({...scene,order:start+scene.order});}
}
export function summaries(p:any){const pl=plan(p);return [{title:'场次',lines:[...p.scenes].sort((a,b)=>a.order-b.order).map(s=>`${s.order} ${s.title}：${s.synopsis}`)},{title:'制作需求',lines:p.requirements.map((r:any)=>`${r.name}（${departmentNames[r.department]}）：${({needed:'待准备',prepared:'已声明准备',blocked:'受阻'} as any)[r.state]} ${r.notes}`)},{title:'准备任务',lines:p.tasks.map((t:any)=>`${t.title}：${({planned:'待开始',in_progress:'进行中',done:'已完成',blocked:'受阻'} as any)[t.state]}；工时${t.estimated_minutes===null?'未知':t.estimated_minutes+'分钟'}；费用${t.estimated_cost_minor===null?'未知':(t.estimated_cost_minor/100).toFixed(2)+' '+p.currency}`)},{title:'估算边界',lines:[pl.note]}];}
export function preparationHTML(p:any){const pl=plan(p),sections=summaries(p),body=sections.map(s=>'<section><h2>'+esc(s.title)+'</h2>'+s.lines.map((l:string)=>'<p>'+esc(l)+'</p>').join('')+'</section>').join('')+'<h2>场次制作单</h2>'+[...p.scenes].sort((a,b)=>a.order-b.order).map(scene=>{const s=sceneSheet(p,scene.id);return '<section><h3>'+esc(scene.title)+'</h3><p>'+esc(scene.synopsis)+'</p>'+s.requirements.map((r:any)=>'<p>'+esc(r.name)+'：'+r.quantity+' '+esc(r.unit)+'　'+esc(r.scene_notes)+'</p>').join('')+scene.ranges.map((r:any)=>'<blockquote><pre>'+esc(r.quote)+'</pre></blockquote>').join('')+'</section>';}).join('')+'<h2>准备批次</h2>'+pl.blocks.map((b:any)=>'<section><h3>'+esc(b.title)+'</h3><p>工时：'+(b.total_minutes===null?'未知（已知'+b.known_minutes+'分钟）':b.total_minutes+'分钟')+'</p><ol>'+b.tasks.map((t:any)=>'<li>'+esc(t.title)+'</li>').join('')+'</ol></section>').join('')+'<h2>意见</h2>'+p.notes.map((n:any)=>'<p>'+esc(n.comment)+'</p>').join('');return htmlPage(p.title,'<h1>'+esc(p.title)+'</h1>'+body+'<p>固定专业筹备工程，不包含真实交易或作者定稿。</p>');}
export async function readProfessional(a:string,p:any,s:any[],i:any,_request:any):Promise<any>{
 if(a==='preview_breakdown')return parseScenes(sourceText(s[i.source_index]),i.source_index);
 if(a==='check_production')return check(p);
 if(a==='requirements_matrix')return matrix(p);
 if(a==='calculate_plan')return plan(p);
 if(a==='preview_source_change')return sourceImpact(p,s,i.from_source_index,i.to_source_index);
 if(a==='scene_digest')return {scene_sha256:sceneDigest(p,i.scene_id)};
 if(a==='scene_sheet')return {...sceneSheet(p,i.scene_id),source_refs:sceneSheet(p,i.scene_id).scene.ranges.map((r:any)=>s[r.source_index].source_ref)};
 if(a==='department_handoff')return {...departmentHandoff(p,i.scene_ids,i.department),source_refs:s.map(v=>v.source_ref)};
 if(a==='export_preparation')return artifact(preparationHTML(p),'制片筹备包.html','text/html',i);
}
