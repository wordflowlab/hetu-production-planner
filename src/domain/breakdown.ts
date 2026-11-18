import {requireValue as need} from '../../vendor/project-store.ts';
/** 仅识别明确Fountain场景标题，保存原字节；人物和制作需求由Agent核对。 */
export function parseScenes(text:string,source_index:number,prefix='scene'){
 const headings:{start:number;title:string;setting:string;time_of_day:string}[]=[];
 let at=0,comment=false,note=false,previousBlank=true;
 for(const raw of text.match(/[^\r\n]*(?:\r\n|\r|\n|$)/g)??[]){
  if(!raw.length)continue;let visible='';
  for(let n=0;n<raw.length;n++){
   if(comment){if(raw.slice(n,n+2)==='*/'){comment=false;n++;}continue;}
   if(note){if(raw.slice(n,n+2)===']]'){note=false;n++;}continue;}
   if(raw.slice(n,n+2)==='/*'){comment=true;n++;continue;}
   if(raw.slice(n,n+2)==='[['){note=true;n++;continue;}
   visible+=raw[n];
  }
  const clean=visible.replace(/^\uFEFF/,'').trim(),forced=/^\.[^.\s]/.test(clean),title=forced?clean.slice(1):clean;
  if((previousBlank||forced)&&title&&(forced||/^(?:INT\.?\s*\/\s*EXT\.?|EXT\.?\s*\/\s*INT\.?|I\/E\.|INT\.|EXT\.|INT\s|EXT\s)(?:\s|$)/i.test(title))){
   const displayTitle=title.replace(/\\-/g,'-');const mixed=/^(?:INT\.?\s*\/\s*EXT|EXT\.?\s*\/\s*INT|I\/E)/i.test(title),setting=mixed?'mixed':/^INT(?:\.|\s)/i.test(title)?'interior':/^EXT(?:\.|\s)/i.test(title)?'exterior':'unspecified';
   need(title.length<=200,'场景标题超过200字符。');headings.push({start:at,title:displayTitle,setting,time_of_day:displayTitle.includes(' - ')?displayTitle.split(' - ').at(-1)!:''});
  }
  previousBlank=!clean;at+=raw.length;
 }
 need(headings.length<=300,'场次数超过300，请按分集拆分筹备工程。','hetu.budget_exceeded');
 const scenes=headings.map((h,n)=>{const end=headings[n+1]?.start??text.length,quote=text.slice(h.start,end);need(quote.length<=16000,'单场来源超过16000字符，请按固定范围手动拆解。','hetu.budget_exceeded');return {id:prefix+'-'+(n+1),title:h.title,order:n+1,setting:h.setting,time_of_day:h.time_of_day,synopsis:'',ranges:[{source_index,byte_start:Buffer.byteLength(text.slice(0,h.start)),byte_end:Buffer.byteLength(text.slice(0,end)),quote}]};});
 return {scenes,recognized_scenes:scenes.length,unparsed_prefix_bytes:Buffer.byteLength(text.slice(0,headings[0]?.start??text.length)),unterminated_comment:comment||note,note:'仅按明确Fountain标题分场；标题以外的语义、人物、需求及遗漏由Agent复读，不表示完整抽取。'};
}
