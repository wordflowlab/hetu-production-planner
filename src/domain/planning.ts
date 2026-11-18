import {requireValue as need} from '../../vendor/project-store.ts';
export const find=(rows:any[],id:string,label:string)=>{const v=rows.find(x=>x.id===id);need(v,label+'不存在。');return v;};
export const unique=(ids:any[],label:string)=>need(new Set(ids).size===ids.length,label+'重复。');
export function sum(values:number[]){let total=0;for(const n of values){total+=n;need(Number.isSafeInteger(total),'估算合计超出安全整数。');}return total;}
export function taskOrder(p:any){
 const state=new Map<string,number>(),order:any[]=[];
 function visit(id:string){need(state.get(id)!==1,'准备任务存在依赖环。');if(state.get(id)===2)return;state.set(id,1);const task=find(p.tasks,id,'准备任务');for(const dep of task.depends_on)visit(dep);state.set(id,2);order.push(task);}
 for(const task of p.tasks)visit(task.id);return order;
}
export function estimate(rows:any[]){
 const unknown_minutes=rows.filter(t=>t.estimated_minutes===null).map(t=>({id:t.id,title:t.title})),unknown_cost=rows.filter(t=>t.estimated_cost_minor===null).map(t=>({id:t.id,title:t.title})),known_minutes=sum(rows.map(t=>t.estimated_minutes??0)),known_cost_minor=sum(rows.map(t=>t.estimated_cost_minor??0));
 return {known_minutes,total_minutes:unknown_minutes.length?null:known_minutes,unknown_minutes,known_cost_minor,total_cost_minor:unknown_cost.length?null:known_cost_minor,unknown_cost};
}
export function plan(p:any){
 const ordered=taskOrder(p),blocked=new Map<string,string[]>();
 for(const t of ordered){const reasons=[...(t.state==='blocked'?[t.blocked_reason]:[]),...t.requirement_ids.map((id:string)=>find(p.requirements,id,'任务需求')).filter((r:any)=>r.state==='blocked').map((r:any)=>'资源待准备：'+r.name),...t.depends_on.filter((id:string)=>find(p.tasks,id,'前置任务').state!=='done').map((id:string)=>'前置未完成：'+find(p.tasks,id,'前置任务').title),...t.depends_on.flatMap((id:string)=>blocked.get(id)??[])];blocked.set(t.id,[...new Set(reasons)]);}
 const blocks=[...p.blocks].sort((a,b)=>a.order-b.order).map(b=>{const tasks=ordered.filter(t=>b.task_ids.includes(t.id)),e=estimate(tasks);return {id:b.id,title:b.title,order:b.order,tasks:tasks.map(t=>({id:t.id,title:t.title})),capacity_minutes:b.capacity_minutes,...e,over_capacity:b.capacity_minutes===null?null:e.known_minutes>b.capacity_minutes?true:e.total_minutes===null?null:false};});
 return {currency:p.currency,currency_unit:'minor',...estimate(p.tasks),dependency_order:ordered.map(t=>({id:t.id,title:t.title,state:t.state,depends_on:t.depends_on,ready_to_prepare:t.state!=='done'&&!(blocked.get(t.id)?.length),blockers:blocked.get(t.id)??[]})),blocks,unassigned_tasks:p.tasks.filter((t:any)=>!p.blocks.some((b:any)=>b.task_ids.includes(t.id))).map((t:any)=>({id:t.id,title:t.title})),note:'工时为单通道串行准备的声明估算；费用为分或cent，未知未补零。不是拍摄时长、真实报价、演员档期、付费授权或最优排期。'};
}
