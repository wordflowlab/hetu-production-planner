import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {start} from './support/machine.ts';
import {fixedScript} from './support/fixed-script.ts';
import {candidate} from './support/creative.ts';
import {scenario,original,selection,base} from './support/scenario.ts';
const peers=JSON.parse(await readFile('peer-lock.json','utf8')).peers;
test('独立视频固定脚本到美术、导演和视听，改稿复核与候选接续',{timeout:1200000},async t=>{
 const c=await start('video'),stages:string[]=[],peerResults:any[]=[];
 async function connect(slug:string){
  const peer=peers.find((v:any)=>v.slug===slug),directory=path.resolve('output/peers',slug,'package'),pkg=await c.ok('hetu_plugins_inspect_package',{package_directory:directory});assert.equal(pkg.package_sha256,peer.package_sha256);
  await c.ok('hetu_plugins_apply',{action:'install',plugin_id:pkg.manifest.id,package_directory:directory,package_sha256:pkg.package_sha256,expected_sha256:(await c.ok('hetu_plugins_inspect')).state_sha256,authorization_note:'用户要求专业链路完整验收，仅限隔离作品和固定公开包',operation_key:'cross-install-'+slug});
  const binding={...c.binding,plugin_id:pkg.manifest.id,package_sha256:pkg.package_sha256},cap=await c.ok('hetu_plugins_capabilities',binding);
  const invoke=async(action:string,args:any)=>{const r=await c.ok('hetu_plugins_invoke',{...binding,capabilities_sha256:cap.capabilities_sha256,action,arguments:args});assert.equal(r.result.status,'succeeded',JSON.stringify(r));return r.result.data;};
  await invoke('skills.read',{skill_id:pkg.manifest.contributions.skills[0].id});return {pkg,invoke};
 }
 try{
  const source=await fixedScript(c,original,'cross-fixed-script'),refs=[source.source_ref],p=scenario(c.work,source.content);
  let production=await c.invoke('save_project',{content:p,source_refs:refs,expected_revision:0,expected_sha256:'',operation_key:'cross-production'});const originalHead=await c.ok('hetu_read_work',{management_ref:c.management,work_ref:c.work});
  stages.push('独立视频建立固定脚本参考稿，回读实际字节后拆解制作需求');
  const art=await connect('art-direction'),ah=await c.invoke('department_handoff',{...selection(production),department:'art',scene_ids:['harbour-1']});
  const ap={format_version:1,title:'雨港外套与钥匙专业方案',basis_refs:[ah.basis_ref],references:[],boards:[],palettes:[],designs:ah.scenes.flatMap((s:any)=>s.requirements.filter((r:any)=>r.department==='costume'||r.department==='prop').map((r:any)=>({id:r.id,title:r.name,kind:r.department==='costume'?'costume':'prop',entity_ref:null,entity_source_index:null,reference_ids:[],palette_id:null,requirements:[r.notes],status:'proposed'}))),notes:[]};
  const ar=await art.invoke('save_project',{content:ap,source_refs:refs,expected_revision:0,expected_sha256:'',operation_key:'cross-art'});assert.equal((await art.invoke('get_basis',{...selection(ar),basis_index:0})).basis.sha256,production.sha256);await art.invoke('check_designs',selection(ar));peerResults.push({owner_plugin_id:art.pkg.manifest.id,object_id:ar.object.object_id,revision:ar.object.revision,sha256:ar.sha256});
  stages.push('美术设定台接收固定筹备依据并保存服装和道具要求，不伪造图像');
  const stage=await connect('director-stage'),sh=await c.invoke('department_handoff',{...selection(production),department:'stage',scene_ids:['harbour-1']}),sp=JSON.parse(await readFile('tests/fixtures/director-stage.json','utf8'));sp.description='固定制片筹备：'+JSON.stringify(sh.basis_ref)+'\n'+sh.tasks.map((v:any)=>v.title).join('；');
  const sr=await stage.invoke('save_scene',{content:sp,source_refs:refs,expected_revision:0,expected_sha256:'',operation_key:'cross-stage'});await stage.invoke('check_scene',selection(sr));assert.equal((await stage.invoke('get_scene',selection(sr))).sha256,sr.sha256);peerResults.push({owner_plugin_id:stage.pkg.manifest.id,object_id:sr.object.object_id,revision:sr.object.revision,sha256:sr.sha256});
  stages.push('导演布景台保存人物、旧桌和带固定脚本来源的镜头，回读真实专业工程');
  const video=await connect('video-studio'),vh=await c.invoke('department_handoff',{...selection(production),department:'video',scene_ids:['harbour-1','harbour-2']}),vp=JSON.parse(await readFile('tests/fixtures/video-studio.json','utf8'));vp.constraints='固定制片筹备：'+JSON.stringify(vh.basis_ref);vp.nodes[1].detail=vh.tasks.map((v:any)=>v.title).join('；');
  const vr=await video.invoke('save_project',{content:vp,source_refs:refs,expected_revision:0,expected_sha256:'',operation_key:'cross-video'});await video.invoke('check_project',selection(vr));assert.equal((await video.invoke('get_project',selection(vr))).sha256,vr.sha256);peerResults.push({owner_plugin_id:video.pkg.manifest.id,object_id:vr.object.object_id,revision:vr.object.revision,sha256:vr.sha256});
  production=await c.invoke('save_project',{...base(production,'cross-produced-basis'),content:{...production.object.content,basis_refs:peerResults}});
  for(let n=0;n<3;n++)assert.equal((await c.invoke('get_basis',{...selection(production),basis_index:n})).basis.sha256,peerResults[n].sha256);
  stages.push('视听制作接收两场动作与声音要求；筹备新修订固定回读三个下游成果');
  const next=await fixedScript(c,original.replace('撑伞等候','提灯等候'),'cross-revision');refs.push(next.source_ref);production=await c.invoke('save_project',{...base(production,'cross-new-script'),content:production.object.content,source_refs:refs});
  const impact=await c.invoke('preview_source_change',{...selection(production),from_source_index:0,to_source_index:1});assert.deepEqual(impact.scenes_to_recheck.map((v:any)=>v.id),['harbour-2']);assert.ok(impact.affected_tasks.some((v:any)=>v.id==='video'));
  const p2={...production.object.content.scenes[1],synopsis:'新稿改为提灯等候，先复核妆造与光源。'};production=await c.invoke('put_scene',{...base(production,'cross-scene-note'),scene:p2});await candidate(c,'INT. 雨港邮局 - NIGHT\n\n林溪拿起钥匙。窗外的雨声渐弱。\n\nEXT. 旧站门外 - DAWN\n\n守站人提灯等候。\n','cross-following-candidate','outline','outline');
  assert.equal((await c.ok('hetu_read_work',{management_ref:c.management,work_ref:c.work})).sha256,originalHead.sha256);assert.equal((await c.invoke('get_source',{...selection(production),source_index:0})).source.content,original);
  stages.push('新固定脚本先预览影响，复读第二场再准备后续候选，原作品正文保持');
  const drama=await start('drama');try{const d=await candidate(drama,original,'drama-script','drama_draft','text','fountain'),dp=scenario(drama.work,d.draft.content);const saved=await drama.invoke('save_project',{content:dp,source_refs:[d.source_ref],expected_revision:0,expected_sha256:'',operation_key:'drama-production'});assert.equal(saved.object.work_ref.kind,'drama');assert.notEqual((await drama.call('hetu_read_work',{management_ref:c.management,work_ref:drama.work})).status,'succeeded');stages.push('独立剧本以自身Fountain候选和管理引用完整保存，跨作品错误引用拒绝');}finally{await drama.client.close();}
  const dir=process.env.HETU_RECEIPT_DIRECTORY??'docs/research';await mkdir(dir,{recursive:true});await writeFile(path.join(dir,'cross-acceptance.json'),JSON.stringify({recorded_at:new Date().toISOString(),host_version:c.coreVersion,package_sha256:c.pkg.package_sha256,peers,stages,downstream_fixed_results:peerResults,original_sha256:originalHead.sha256,adopted:false,finalized:false,limits:['专业工程接续不等于真实拍摄、图像生成或成片认可','未执行付费生成、外部发送、采纳或定稿']},null,2)+'\n');t.diagnostic(c.directory);
 }finally{await c.client.close();}
});
