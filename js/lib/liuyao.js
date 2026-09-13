/**
 * js/lib/liuyao.js — 六爻（纳甲筮法）纯算法库（LY2）
 * 唯一权威副本。页面只引此文件做渲染，禁止再内嵌一份算法副本。
 * 同构导出：Node 用 module.exports，浏览器挂 window.Liuyao。
 *
 * 底本：《增删卜易》（野鹤老人）——八宫章/浑天甲子章/六亲歌章/世应章/动变章/六神章。
 * 约定：爻线自下而上编号 0..5；爻值 6=老阴(动) 7=少阳 8=少阴 9=老阳(动)；
 *       卦的二进制 bin 亦自下而上，1=阳 0=阴；经卦(三爻)用自下而上的三位字符串。
 *
 * 回归锚点：天风姤装卦（底本浑天甲子章自带示例）、乾为天、老阳动爻变卦。
 */
(function(global){
'use strict';

/* ---------- 基础表 ---------- */
const GAN=['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const ZHI=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const ZHI_WX=['水','土','木','木','土','火','火','土','金','金','土','水'];
const GAN_WX=['木','木','火','火','土','土','金','金','水','水'];

/* 经卦（自下而上三位）：乾111 兑110 离101 震100 巽011 坎010 艮001 坤000 */
const TRIGRAMS={'111':'乾','110':'兑','101':'离','100':'震','011':'巽','010':'坎','001':'艮','000':'坤'};
const TRIGRAM_ORDER=['111','110','101','100','011','010','001','000']; /* 乾兑离震巽坎艮坤（先小后大，仅列举用） */

/* 浑天甲子纳甲表：经卦 → 内卦三爻干支 / 外卦三爻干支（自下而上）
   底本浑天甲子章给出支与五行；天干依通行本京房纳甲（乾内甲外壬、坎戊、艮丙、震庚、
   巽辛、离己、坤内乙外癸、兑丁）。底本"辰在内"为"艮在内"之讹，建表以通行本为准。 */
const NAJIA={
  '111':{inner:['甲子','甲寅','甲辰'],outer:['壬午','壬申','壬戌']}, /* 乾 */
  '110':{inner:['丁巳','丁卯','丁丑'],outer:['丁亥','丁酉','丁未']}, /* 兑 */
  '101':{inner:['己卯','己丑','己亥'],outer:['己酉','己未','己巳']}, /* 离 */
  '100':{inner:['庚子','庚寅','庚辰'],outer:['庚午','庚申','庚戌']}, /* 震 */
  '011':{inner:['辛丑','辛亥','辛酉'],outer:['辛未','辛巳','辛卯']}, /* 巽 */
  '010':{inner:['戊寅','戊辰','戊午'],outer:['戊申','戊戌','戊子']}, /* 坎 */
  '001':{inner:['丙辰','丙午','丙申'],outer:['丙戌','丙子','丙寅']}, /* 艮 */
  '000':{inner:['乙未','乙巳','乙卯'],outer:['癸丑','癸亥','癸酉']}  /* 坤 */
};

/* 八宫（京房序：乾震坎艮坤巽离兑——依《说卦》家人伦序，检索与底本世应章一致）
   每宫：本宫卦 + 一~五世 + 游魂 + 归魂，[上卦,下卦,卦名] */
const GONG_DEF=[
  {gong:'乾', tri:'111', wx:'金', seq:[
    ['111','111','乾为天'],['111','011','天风姤'],['111','001','天山遁'],['111','000','天地否'],
    ['011','000','风地观'],['001','000','山地剥'],['101','000','火地晋'],['101','111','火天大有']]},
  {gong:'震', tri:'100', wx:'木', seq:[
    ['100','100','震为雷'],['100','000','雷地豫'],['100','010','雷水解'],['100','011','雷风恒'],
    ['000','011','地风升'],['010','011','水风井'],['110','011','泽风大过'],['110','100','泽雷随']]},
  {gong:'坎', tri:'010', wx:'水', seq:[
    ['010','010','坎为水'],['010','110','水泽节'],['010','100','水雷屯'],['010','101','水火既济'],
    ['110','101','泽火革'],['100','101','雷火丰'],['000','101','地火明夷'],['000','010','地水师']]},
  {gong:'艮', tri:'001', wx:'土', seq:[
    ['001','001','艮为山'],['001','101','山火贲'],['001','111','山天大畜'],['001','110','山泽损'],
    ['101','110','火泽睽'],['111','110','天泽履'],['011','110','风泽中孚'],['011','001','风山渐']]},
  {gong:'坤', tri:'000', wx:'土', seq:[
    ['000','000','坤为地'],['000','100','地雷复'],['000','110','地泽临'],['000','111','地天泰'],
    ['100','111','雷天大壮'],['110','111','泽天夬'],['010','111','水天需'],['010','000','水地比']]},
  {gong:'巽', tri:'011', wx:'木', seq:[
    ['011','011','巽为风'],['011','111','风天小畜'],['011','101','风火家人'],['011','100','风雷益'],
    ['111','100','天雷无妄'],['101','100','火雷噬嗑'],['001','100','山雷颐'],['001','011','山风蛊']]},
  {gong:'离', tri:'101', wx:'火', seq:[
    ['101','101','离为火'],['101','001','火山旅'],['101','011','火风鼎'],['101','010','火水未济'],
    ['001','010','山水蒙'],['011','010','风水涣'],['111','010','天水讼'],['111','101','天火同人']]},
  {gong:'兑', tri:'110', wx:'金', seq:[
    ['110','110','兑为泽'],['110','010','泽水困'],['110','000','泽地萃'],['110','001','泽山咸'],
    ['010','001','水山蹇'],['000','001','地山谦'],['100','001','雷山小过'],['100','110','雷泽归妹']]}
];

/* 六十四卦名表：键 = 上卦:下卦（由八宫序列在模块加载时构建，天然覆盖全部 64 卦且不重复） */
const NAME64={};
GONG_DEF.forEach(g=>{
  g.seq.forEach((s,idx)=>{ NAME64[s[0]+':'+s[1]]={name:s[2],gong:g.gong,idx:idx,wx:g.wx}; });
});

/* 六神（六神章）：顺序木火土土金水；日干起初爻 */
const SIX_BEASTS=['青龙','朱雀','勾陈','螣蛇','白虎','玄武'];
const BEAST_START={甲:0,乙:0,丙:1,丁:1,戊:2,己:3,庚:4,辛:4,壬:5,癸:5};

/* ---------- 工具 ---------- */
function binOf(triUp,triLow){ return (triLow+triUp).split('').map(Number); }        /* 自下而上 6 位 */
function trigramOf(bin,upper){ const s=(upper?bin.slice(3):bin.slice(0,3)).join(''); return s; }
function nameOf(bin){ return NAME64[bin.slice(3).join('')+':'+bin.slice(0,3).join('')]; }

/* 八宫定位 + 世应：查 NAME64（表由八宫序构建），世位由宫内序号定：
   本宫世6爻、一~五世世1~5爻、游魂世4爻、归魂世3爻（世应章："隔世爻两位即是应爻"） */
function gongOf(bin){
  const info=nameOf(bin);
  const shi = info.idx===0?5 : info.idx<=5?info.idx-1 : info.idx===6?3:2;  /* 0-based 爻位 */
  return {gong:info.gong, wx:info.wx, name:info.name, idx:info.idx,
          shi:shi, ying:(shi+3)%6};
}

/* 纳甲装卦：返回每爻 {gz, zhi, wx, liuqin} */
function najia(bin){
  const out=[];
  const low=NAJIA[bin.slice(0,3).join('')].inner;
  const up =NAJIA[bin.slice(3).join('')].outer;
  for(let i=0;i<3;i++) out.push(low[i]);
  for(let i=0;i<3;i++) out.push(up[i]);
  return out;
}

/* 六亲：以宫五行为"我"：同我兄弟、生我父母、我生子孙、克我官鬼、我克妻财 */
function liuqinOf(gongWx, zhi){
  const wx=ZHI_WX[ZHI.indexOf(zhi)];
  const sheng={木:'火',火:'土',土:'金',金:'水',水:'木'};
  if(wx===gongWx) return '兄弟';
  if(sheng[wx]===gongWx) return '父母';   /* 该爻生宫 → 生我者父母 */
  if(sheng[gongWx]===wx) return '子孙';   /* 宫生该爻 → 我生者子孙 */
  const ke={木:'土',土:'水',水:'火',火:'金',金:'木'};
  if(ke[wx]===gongWx) return '官鬼';      /* 该爻克宫 → 克我者官鬼 */
  if(ke[gongWx]===wx) return '妻财';      /* 宫克该爻 → 我克者妻财 */
  return '?';
}

/* 六兽：日干起初爻，逐爻上行 */
function liushou(dayGan){
  const s=BEAST_START[dayGan];
  return [0,1,2,3,4,5].map(i=>SIX_BEASTS[(s+i)%6]);
}

/* 旬空：日干支 → 旬空两支（与 liuren.js 同规则） */
function xunkong(dayGZ){
  const gi=GAN.indexOf(dayGZ[0])*12+((ZHI.indexOf(dayGZ[1])-GAN.indexOf(dayGZ[0]))%12+12)%12;
  /* 甲子起甲：序 = 日干序；旬首支 = 支序-干序（mod 12） */
  const zhi0=ZHI.indexOf(dayGZ[1]), gan0=GAN.indexOf(dayGZ[0]);
  const start=(zhi0-gan0%12+12)%12; /* 甲日甲子:zhi0-0=0 → 旬首子 */
  const xunStart=((zhi0-gan0)%12+12)%12;
  return [ZHI[(xunStart+10)%12],ZHI[(xunStart+11)%12]];
}

/* 起卦：lines = 自下而上六爻值（6/7/8/9，或直接给三枚背数 0-3 数组按爻给）
   coinToss[i] ∈ {1:单(少阳7), 2:拆(少阴8), 3:重(老阳9), 0:交(老阴6)} */
function fromCoins(coinToss){
  return coinToss.map(b=>b===3?9:b===2?8:b===1?7:6);
}

function zhuanggua(lines,dayGZ){
  const bin=lines.map(v=>(v===7||v===9)?1:0);
  const bian=lines.map((v,i)=>{
    if(v===9)return 0; if(v===6)return 1; return bin[i];
  });
  const g=gongOf(bin);
  const njs=najia(bin);
  const beasts=dayGZ?liushou(dayGZ[0]):null;
  const kong=dayGZ?xunkong(dayGZ):null;
  const rows=bin.map((_,i)=>({
    pos:i, yinYang:bin[i]===1?'阳':'阴', dong:lines[i]===9||lines[i]===6,
    lao:lines[i]===9?'老阳':lines[i]===6?'老阴':lines[i]===7?'少阳':'少阴',
    bianYinYang:bian[i]===1?'阳':'阴',
    gz:njs[i], zhi:njs[i].slice(1), wx:ZHI_WX[ZHI.indexOf(njs[i].slice(1))],
    liuqin:liuqinOf(g.wx,njs[i].slice(1)),
    beast:beasts?beasts[i]:null,
    shi:i===g.shi, ying:i===g.ying,
    kong: kong? kong.includes(njs[i].slice(1)) : null
  }));
  const bInfo=nameOf(bian);
  return {ben:{bin:bin,name:g.name,gong:g.gong,wx:g.wx,shi:g.shi,ying:g.ying},
          bian:bian.join('')!==bin.join('')?{bin:bian,name:bInfo.name,gong:bInfo.gong}:null,
          rows:rows, dayGZ:dayGZ||null, kong:kong};
}

const GZ60=Array.from({length:60},(_,i)=>GAN[i%10]+ZHI[i%12]);
const api={zhuanggua,fromCoins,gongOf,najia,liuqinOf,liushou,xunkong,nameOf,GZ60,
           GAN,ZHI,ZHI_WX,TRIGRAMS,GONG_DEF,NAME64,SIX_BEASTS,BEAST_START};
if(typeof module!=='undefined'&&module.exports){module.exports=api;}
else{global.Liuyao=api;}
})(typeof window!=='undefined'?window:globalThis);
