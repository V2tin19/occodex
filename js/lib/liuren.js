/**
 * js/lib/liuren.js — 大六壬起课纯算法库（LR-M1 · 九宗门全）
 * 唯一权威副本。页面只引此文件做渲染，禁止再内嵌一份算法副本。
 * 同构导出：Node 用 module.exports，浏览器挂 window.Liuren。
 *
 * 九宗门取三传，底本：《大六壬指南》《六壬大全·课经》《大六壬心镜》，规则要点：
 *   贼克（重审/元首）→ 比用（知一）→ 涉害（见机）→ 遥克（蒿矢/弹射）→
 *   昴星（虎视转蓬/冬蛇掩目）→ 别责 → 八专（独足）→ 伏吟（自任/自信）→ 返吟（无依/井栏射）。
 *   伏吟（月将加时同位）与返吟（对冲）为结构门，优先于九门常规次序判定。
 * 简化处（note 中如实标注）：
 *   - 涉害深浅按地盘支本气计受克（含起讫）；古法有计藏干者，深浅相对次序不受影响。
 *   - 四课克分析按支的本气五行；邵彦和个别断例用藏干论不克（如卯/辰），属流派差异。
 *   - 遥克多候选取课序在前者；未再做比用细分。
 *
 * 回归锚点（tools/regress.js）：
 *   己卯日寅将酉时（夜）→ 知一课，三传巳戌卯 / 遁干辛甲己 / 天将玄朱虎 /
 *   空亡申酉——韩太守占祈雪，《六壬断案》第 1 则。
 */
(function(global){
'use strict';

const GAN=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const GAN_WX=['木','木','火','火','土','土','金','金','水','水'];
const ZHI_WX=['水','土','木','木','土','火','火','土','金','金','土','水'];
const KE={木:'土',土:'水',水:'火',火:'金',金:'木'};
const JIGONG={甲:'寅',乙:'辰',丙:'巳',丁:'未',戊:'巳',己:'未',庚:'申',辛:'戌',壬:'亥',癸:'丑'};
const HEGAN={甲:'己',乙:'庚',丙:'辛',丁:'壬',戊:'癸',己:'甲',庚:'乙',辛:'丙',壬:'丁',癸:'戊'};
const GZ60=Array.from({length:60},(_,i)=>GAN[i%10]+ZHI[i%12]);
const ZX=z=>ZHI.indexOf(z);
/* 贵人表：甲戊庚昼丑夜未；乙己昼子夜申；丙丁昼亥夜酉；壬癸昼卯夜巳；辛昼午夜寅 */
const GUI_DAY={甲:'丑',戊:'丑',庚:'丑',乙:'子',己:'子',丙:'亥',丁:'亥',壬:'卯',癸:'卯',辛:'午'};
const GUI_NIGHT={甲:'未',戊:'未',庚:'未',乙:'申',己:'申',丙:'酉',丁:'酉',壬:'巳',癸:'巳',辛:'寅'};
/* 三刑与自刑、冲、驿马 */
const XING={寅:'巳',巳:'申',申:'寅',丑:'戌',戌:'未',未:'丑',子:'卯',卯:'子'};
const ZI_XING=['辰','午','酉','亥'];
const MENG=['寅','申','巳','亥'];
const YIMA={子:'寅',辰:'寅',申:'寅',寅:'申',午:'申',戌:'申',巳:'亥',酉:'亥',丑:'亥',亥:'巳',卯:'巳',未:'巳'};

function liuren(dayGZ,jiang,shi,yy){
  const dg=dayGZ[0],dz=dayGZ[1];
  const off=((ZX(jiang)-ZX(shi))%12+12)%12;
  const tp=di=>ZHI[(di+off)%12];                              /* 地盘 di 位上的天盘神 */
  const tpInv=t=>ZHI[((ZX(t)-off)%12+12)%12];                 /* 天盘神 t 所坐的地盘位 */
  const gi=GZ60.indexOf(dayGZ);
  const xunStart=gi-(gi%10);
  const kw=[ZHI[(xunStart+10)%12],ZHI[(xunStart+11)%12]];
  const gang=(GAN.indexOf(dg)%2===0);                         /* 阳日（刚日） */
  const ganWx=GAN_WX[GAN.indexOf(dg)];
  const ganzhong=tp(ZX(JIGONG[dg]));                          /* 干上神（第一课上神） */
  const zhishang=tp(ZX(dz));                                  /* 支上神（第三课上神） */

  /* 四课（下=地盘，上=天盘）与去重（课序优先，重复课只计一处） */
  const jgIdx=ZX(JIGONG[dg]);
  const ke=[
    {di:JIGONG[dg],tian:tp(jgIdx)},
    {di:tp(jgIdx),tian:tp((jgIdx+off)%12)},
    {di:dz,tian:zhishang},
    {di:zhishang,tian:tp((ZX(dz)+off)%12)}
  ];
  const uniq=[];
  ke.forEach(k=>{ if(!uniq.some(u=>u.di===k.di&&u.tian===k.tian)) uniq.push(k); });

  /* 克分析（去重后的四课） */
  const xia=uniq.filter(k=>KE[ZHI_WX[ZX(k.di)]]===ZHI_WX[ZX(k.tian)]);   /* 下贼上 */
  const shang=uniq.filter(k=>KE[ZHI_WX[ZX(k.tian)]]===ZHI_WX[ZX(k.di)]); /* 上克下 */
  const hao=uniq.filter(k=>KE[ZHI_WX[ZX(k.tian)]]===ganWx);              /* 神克日（蒿矢） */
  const tan=uniq.filter(k=>KE[ganWx]===ZHI_WX[ZX(k.tian)]);              /* 日克神（弹射） */

  const chuanOf=c1=>{const c2=tp(ZX(c1)),c3=tp(ZX(c2));return [c1,c2,c3];};
  let men=null,chuan=null,note='';

  /* 比用 → 涉害：对同一组克候选取传。比用唯一者用之（知一）；
     俱比或俱不比则涉害——受克深者为用，深浅同取四孟上神，又同取干上/支上神（阳日/阴日）。 */
  /* 返回内部宗门名（'知一课'/'涉害课'），men/note 由本函数赋值，调用方可改写外层课体 */
  function biOrShe(group){
    const bi=group.filter(k=>((ZX(k.tian)%2===0)===gang));
    if(bi.length===1){
      men='知一课';chuan=chuanOf(bi[0].tian);
      note='两课以上'+(group===xia?'下贼上':'上克下')+'，取与日干阴阳俱比者（知一课）';
      return men;
    }
    const cand0=bi.length>0?bi:group;
    const seen=new Set(),cand=[];
    cand0.forEach(k=>{ if(!seen.has(k.tian)){seen.add(k.tian);cand.push(k);} });
    const depth=k=>{
      const seat=ZX(k.di),home=ZX(k.tian),wx=ZHI_WX[ZX(k.tian)];
      let d=0;
      for(let p=seat;;p=(p+1)%12){ if(KE[ZHI_WX[p]]===wx)d++; if(p===home)break; }
      return d;
    };
    const maxD=Math.max.apply(null,cand.map(depth));
    let fin=cand.filter(k=>depth(k)===maxD);
    if(fin.length>1){ const m=fin.filter(k=>MENG.includes(k.di)); if(m.length)fin=m; }
    if(fin.length>1){ const p=fin.find(k=>k.tian===(gang?ganzhong:zhishang)); if(p)fin=[p]; }
    men='涉害课';chuan=chuanOf(fin[0].tian);
    note='涉害课：俱'+(bi.length>0?'比':'不比')+'，涉害深者为用（'+fin[0].tian+
      '受克'+maxD+'重'+(fin.length<cand.length?'，深浅同取孟位':'')+'）——见机而作';
    return men;
  }

  if(off===0){
    /* —— 伏吟门：天地盘同位。有克（神克日干）取为初传；无克刚日取干上神（自任）、
          柔日取支上神（自信）；中末递刑，遇自刑：初传自刑刚日取支上神/柔日取干上神
          为中传，中传自刑取冲为末传。 —— */
    men='伏吟';
    const keRi=uniq.filter(k=>KE[ZHI_WX[ZX(k.tian)]]===ganWx);
    const mid=c1=>{
      if(!ZI_XING.includes(c1))return XING[c1];
      return gang?zhishang:ganzhong;
    };
    let c1;
    if(keRi.length){ c1=keRi[0].tian; note='伏吟有克（神克日干），取为初传，中末递刑'; }
    else if(gang){ c1=ganzhong; note='伏吟无克，刚日取干上神发用（自任课），中末递刑'; }
    else{ c1=zhishang; note='伏吟无克，柔日取支上神发用（自信课），中末递刑'; }
    const c2=mid(c1), c3=ZI_XING.includes(c2)?ZHI[(ZX(c2)+6)%12]:XING[c2];
    chuan=[c1,c2,c3];
    if(ZI_XING.includes(c1))note+='；初传自刑'+(ZI_XING.includes(c2)?'，中传又自刑取冲':'，取'+(gang?'支':'干')+'上神为中传');
  }else if(off===6){
    /* —— 返吟门：天地盘对冲。有克照常取克为初传（无依格），中传初传之冲、
          末传初传上神（初末同字）；无克（丁己辛之丑未六日）取驿马发用，
          中传支上神、末传干上神（井栏射/无亲格）。 —— */
    if(xia.length===1){ men='返吟';chuan=chuanOf(xia[0].tian);note='返吟有克（重审），初传取下贼上，中末递冲，初末同字（无依格）'; }
    else if(xia.length>1){ const inner=biOrShe(xia);const d=note;men='返吟';note='返吟有克（'+inner+'），中末递冲，初末同字（无依格）——'+d; }
    else if(shang.length===1){ men='返吟';chuan=chuanOf(shang[0].tian);note='返吟有克（元首），初传取上克下，中末递冲，初末同字（无依格）'; }
    else if(shang.length>1){ const inner=biOrShe(shang);const d=note;men='返吟';note='返吟有克（'+inner+'），中末递冲，初末同字（无依格）——'+d; }
    else{
      const c1=YIMA[dz];
      men='井栏射';chuan=[c1,zhishang,ganzhong];
      note='返吟无克（井栏射/无亲格），取驿马'+c1+'为初传，中传支上神、末传干上神';
    }
  }else if(xia.length===1){
    men='重审课';chuan=chuanOf(xia[0].tian);
    note='四课仅一课下贼上（重审课）：卑犯尊，须重复审详';
  }else if(xia.length>1){
    biOrShe(xia);
  }else if(shang.length===1){
    men='元首课';chuan=chuanOf(shang[0].tian);
    note='四课仅一课上克下（元首课）：尊制卑，理顺自然';
  }else if(shang.length>1){
    biOrShe(shang);
  }else if(JIGONG[dg]===dz){
    /* —— 八专门：干支同位日（甲寅丁未己未庚申癸丑），四课实为两课。
          有克已在上取；无克不取遥克：阳日干上神顺数三神（连本位）、
          阴日第四课上神逆数三神为初传，中末俱干上神。三传归一为独足格。 —— */
    const c1=gang?ZHI[(ZX(ganzhong)+2)%12]:ZHI[(ZX(ke[3].tian)-2+24)%12];
    men='八专课';chuan=[c1,ganzhong,ganzhong];
    note='八专课：干支同位只有两课，'+(gang?'阳日干上神顺数三位':'阴日第四课上神逆数三位')+'为初传，中末俱干上神'+
      (c1===ganzhong?'——三传归一，独足格':'');
  }else if(hao.length){
    men='蒿矢课';chuan=chuanOf(hao[0].tian);
    note='四课无克，神遥克日干（蒿矢课）：箭无镞，力微而事远，祸自外来';
  }else if(tan.length){
    men='弹射课';chuan=chuanOf(tan[0].tian);
    note='四课无克，日干遥克神（弹射课）：弹丸射鸟，力更微，我欲图彼而力不足';
  }else if(uniq.length===3){
    /* —— 别责门：四课不全三课备，无遥无克。刚日取干合寄宫上神、
          柔日取支前三合（三合顺行下一位）上神为初传，中末俱干上神。 —— */
    const c1=gang?tp(ZX(JIGONG[HEGAN[dg]])):tp((ZX(dz)+4)%12);
    men='别责课';chuan=[c1,ganzhong,ganzhong];
    note='别责课：四课不全三课备，无遥无克，'+(gang?'刚日取干合上神':'柔日取支前三合上神')+'为初传，中末俱干上神';
  }else{
    /* —— 昴星门：四课全备，无遥无克。阳日取地盘酉上神发用（虎视转蓬），
          中传支上神、末传干上神；阴日取天盘酉所坐地盘位（冬蛇掩目），
          中传干上神、末传支上神。 —— */
    let c1,c2,c3;
    if(gang){ c1=tp(ZX('酉'));c2=zhishang;c3=ganzhong; }
    else{ c1=tpInv('酉');c2=ganzhong;c3=zhishang; }
    men=gang?'虎视转蓬':'冬蛇掩目';chuan=[c1,c2,c3];
    note='昴星课（'+men+'）：四课无遥无克，'+(gang?'阳日取酉上神发用，中支上、末干上':'阴日取酉下神发用，中干上、末支上');
  }

  const dunOf=z=>{
    const i=((ZX(z)-ZX(ZHI[xunStart%12]))%12+12)%12;
    return i<10?GAN[i]:null;  /* 空亡支不在旬内，无遁干 */
  };
  const isNight=(yy==='night')||(yy!=='day'&&(ZX(shi)>=9||ZX(shi)<=1));
  const gui=isNight?GUI_NIGHT[dg]:GUI_DAY[dg];
  let guiSeatDi=0;
  for(let d=0;d<12;d++){ if(tp(d)===gui){guiSeatDi=d;break;} }
  const shun=(guiSeatDi>=ZX('亥'))||(guiSeatDi<=ZX('辰'));
  const tjiangOf=z=>{
    let seatDi=0;
    for(let d=0;d<12;d++){ if(tp(d)===z){seatDi=d;break;} }
    let step=(seatDi-guiSeatDi+12)%12; if(!shun)step=(12-step)%12;
    return ['贵','蛇','朱','合','勾','龙','空','虎','常','玄','阴','后'][step];
  };
  return {off:off,tp:tp,tpInv:tpInv,kongwang:kw,ke:ke,uniq:uniq,
    men:men,chuan:chuan,note:note,gang:gang,ganzhong:ganzhong,zhishang:zhishang,
    dun:chuan.map(z=>dunOf(z)),
    tjiang:chuan.map(z=>tjiangOf(z)),
    gui:gui,guiSeat:ZHI[guiSeatDi],shun:shun,isNight:isNight};
}

const api={liuren,GAN,ZHI,GAN_WX,ZHI_WX,KE,JIGONG,HEGAN,GZ60,GUI_DAY,GUI_NIGHT,XING,ZI_XING,YIMA};
if(typeof module!=='undefined'&&module.exports){module.exports=api;}
else{global.Liuren=api;}
})(typeof window!=='undefined'?window:globalThis);
