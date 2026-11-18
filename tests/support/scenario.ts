import {createHash} from 'node:crypto';
import {newProject} from '../../src/domain/model.ts';
import {parseScenes} from '../../src/domain/breakdown.ts';
export const original='INT. 雨港邮局 - NIGHT\n\n林溪拆开旧信，取出一把钥匙。\n\n林溪\n谁留下了它？\n\nEXT. 旧站门外 - DAWN\n\n守站人撑伞等候，林溪把钥匙交给他。\n';
export const sha=(v:string|Uint8Array)=>createHash('sha256').update(v).digest('hex');
export const sourceRef={kind:'document',work_ref:{workspace_id:'workspace_test',kind:'novel',object_id:'novel_test'},document_id:'doc_11111111-1111-4111-8111-111111111111',revision_id:'rev_11111111-1111-4111-8111-111111111111',sha256:sha(original)};
export const base=(r:any,key:string)=>({object_id:r.object.object_id,expected_revision:r.object.revision,expected_sha256:r.sha256,operation_key:key});
export const selection=(r:any)=>({object_id:r.object.object_id,revision:r.object.revision});
export function scenario(_work?:any,fixedText=original):any{
 const p=newProject('雨港来信');p.scenes=parseScenes(fixedText,0,'harbour').scenes;p.scenes[0].synopsis='林溪发现旧钥匙，保留寄信人的悬念。';p.scenes[1].synopsis='黎明，守站人接过钥匙。';
 p.requirements=[{id:'lin',name:'林溪',department:'cast',state:'prepared',notes:'旅人，人物事实以宿主设定为准。',entity_ref:null,entity_source_index:null,asset_source_indices:[]},{id:'coat',name:'雨夜外套',department:'costume',state:'needed',notes:'保持雨夜与黎明造型连续。',entity_ref:null,entity_source_index:null,asset_source_indices:[]},{id:'key',name:'旧站钥匙',department:'prop',state:'needed',notes:'铜色，第二场交给守站人。',entity_ref:null,entity_source_index:null,asset_source_indices:[]},{id:'rain',name:'雨声',department:'sound',state:'needed',notes:'作为声景，不遮盖关键对白。',entity_ref:null,entity_source_index:null,asset_source_indices:[]}];
 p.usages=[{id:'u1',scene_id:'harbour-1',requirement_id:'lin',quantity:1,unit:'人',notes:'拆信的人'},{id:'u2',scene_id:'harbour-1',requirement_id:'coat',quantity:1,unit:'套',notes:'衣角微湿'},{id:'u3',scene_id:'harbour-1',requirement_id:'key',quantity:1,unit:'把',notes:'放在信封内'},{id:'u4',scene_id:'harbour-2',requirement_id:'key',quantity:1,unit:'把',notes:'与第一场同一把'},{id:'u5',scene_id:'harbour-1',requirement_id:'rain',quantity:1,unit:'段',notes:'雨夜背景'}];
 p.tasks=[{id:'design',title:'准备外套与钥匙方案',scene_ids:['harbour-1'],requirement_ids:['coat','key'],depends_on:[],state:'planned',blocked_reason:'',estimated_minutes:30,estimated_cost_minor:10000},{id:'stage',title:'核对邮局走位与交钥匙动作',scene_ids:['harbour-1','harbour-2'],requirement_ids:['key'],depends_on:['design'],state:'planned',blocked_reason:'',estimated_minutes:60,estimated_cost_minor:5000},{id:'video',title:'准备两场的视听候选',scene_ids:['harbour-1','harbour-2'],requirement_ids:['rain'],depends_on:['stage'],state:'planned',blocked_reason:'',estimated_minutes:null,estimated_cost_minor:null}];
 p.blocks=[{id:'first',title:'美术准备',order:1,task_ids:['design'],capacity_minutes:45},{id:'second',title:'动作核对',order:2,task_ids:['stage'],capacity_minutes:50}];return p;
}

export const range={source_index:0,byte_start:0,byte_end:Buffer.byteLength(original),quote:original};
