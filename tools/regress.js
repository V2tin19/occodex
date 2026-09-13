/**
 * tools/regress.js — 算法库回归测试（node 直跑，无浏览器依赖）
 * 用法：node tools/regress.js   （或由 tools/check.py 调用）
 *
 * 六壬锚点全部取自古籍/《六壬断案》实占例（duanan-cases.json 编号标注），
 * 覆盖九宗门：知一 / 涉害 / 蒿矢 / 弹射 / 昴星（虎视·冬蛇掩目）/
 * 别责 / 八专（独足）/ 伏吟（自任自信·自刑）/ 返吟（无依·井栏射）。
 */
const assert=require('assert');
const L=require('../js/lib/liuren.js');
const Y=require('../js/lib/liuyao.js');

/* ---------- 六壬：九宗门全门锚点 ---------- */
/* 每条：名称、日干支/月将/时/昼夜、期望（men 课体名 / chuan 三传 / dun 遁干 / tjiang 天将 / kw 空亡） */
const cases=[
  {name:'韩太守占祈雪 · 知一课（断案1）',args:['己卯','寅','酉','night'],exp:{
    chuan:['巳','戌','卯'],dun:['辛','甲','己'],tjiang:['玄','朱','虎'],kw:['申','酉'],men:'知一课'}},
  {name:'涉害取受克深者（毕法诀一：丁卯日丑加卯亥加丑，取亥）',args:['丁卯','亥','丑','day'],exp:{
    men:'涉害课',chuan:['亥','酉','未']}},
  {name:'蒿矢课 · 三传稼穑（断案80：壬戌日亥将申时）',args:['壬戌','亥','申','day'],exp:{
    men:'蒿矢课',chuan:['丑','辰','未']}},
  {name:'弹射课 · 三传从革（断案18：丙戌日子将辰时）',args:['丙戌','子','辰','day'],exp:{
    men:'弹射课',chuan:['酉','巳','丑']}},
  {name:'弹射课 · 三传玄胎（断案45：庚辰日子将酉时）',args:['庚辰','子','酉','day'],exp:{
    men:'弹射课',chuan:['寅','巳','申']}},
  {name:'昴星阳日虎视（断案56：戊申日酉将申时，初戌）',args:['戊申','酉','申','day'],exp:{
    men:'虎视转蓬',chuan:['戌','酉','午']}},
  {name:'昴星阴日冬蛇掩目（毕法诀七：丁亥日昴星三传午戌寅）',args:['丁亥','午','卯','day'],exp:{
    men:'冬蛇掩目',chuan:['午','戌','寅']}},
  {name:'别责课刚日干合上神（《六壬大全》课例：丙辰日辰将卯时）',args:['丙辰','辰','卯','day'],exp:{
    men:'别责课',chuan:['亥','午','午']}},
  {name:'八专课阳日顺数三位（断案88/大全课例：甲寅日丑将辰时，初丑）',args:['甲寅','丑','辰','day'],exp:{
    men:'八专课',chuan:['丑','亥','亥']}},
  {name:'八专独足格（断案210：己未日卯将丑时，三传归一）',args:['己未','卯','丑','day'],exp:{
    men:'八专课',chuan:['酉','酉','酉']}},
  {name:'伏吟自任·初传自刑取支上（断案28：壬午日子将子时）',args:['壬午','子','子','day'],exp:{
    men:'伏吟',chuan:['亥','午','子']}},
  {name:'伏吟自信·递刑玄胎（断案73：丁巳日未将未时）',args:['丁巳','未','未','day'],exp:{
    men:'伏吟',chuan:['巳','申','寅']}},
  {name:'伏吟自任·中传支上末刑（断案13：壬子日卯将卯时，中传支子/末卯）',args:['壬子','卯','卯','day'],exp:{
    men:'伏吟',chuan:['亥','子','卯']}},
  {name:'伏吟自任·递刑元胎（断案55：庚辰日子将子时，庚禄申/寅上青龙/末巳朱雀）',args:['庚辰','子','子','day'],exp:{
    men:'伏吟',chuan:['申','寅','巳']}},
  {name:'返吟有克知一·初末同字（断案84：戊寅日子将午时，无依格）',args:['戊寅','子','午','day'],exp:{
    men:'返吟',chuan:['寅','申','寅']}},
  {name:'返吟重审·巳亥巳（断案86：辛巳日申将寅时，邵公曰大凡巳亥巳）',args:['辛巳','申','寅','day'],exp:{
    men:'返吟',chuan:['巳','亥','巳']}},
  {name:'返吟无克井栏射（断案93：丁未日午将子时，驿马巳发用）',args:['丁未','午','子','day'],exp:{
    men:'井栏射',chuan:['巳','丑','丑']}},
];

let fail=0;
for(const c of cases){
  const r=L.liuren(...c.args);
  const e=c.exp;
  const checks=[
    ['课体',!e.men||r.men===e.men, r.men+(e.men?' / 应 '+e.men:'')],
    ['三传',!e.chuan||JSON.stringify(r.chuan)===JSON.stringify(e.chuan),
      JSON.stringify(r.chuan)+' / 应 '+JSON.stringify(e.chuan||[])],
    ['遁干',!e.dun||JSON.stringify(r.dun)===JSON.stringify(e.dun),''],
    ['天将',!e.tjiang||JSON.stringify(r.tjiang)===JSON.stringify(e.tjiang),''],
    ['空亡',!e.kw||JSON.stringify(r.kongwang)===JSON.stringify(e.kw),''],
  ];
  for(const [n,ok,got] of checks){
    if(!e[chName(n)]&&n!=='课体'&&n!=='三传')continue; /* 未声明期望的项跳过 */
    console.log((ok?'✓':'✗')+' '+c.name+' · '+n+(ok?'':'：'+got));
    if(!ok)fail++;
  }
}
function chName(n){return {课体:'men',三传:'chuan',遁干:'dun',天将:'tjiang',空亡:'kw'}[n];}

/* ---------- 六壬：健全性扫描（全 8640 盘三传结构合法） ---------- */
{
  let bad=0,total=0;
  const menSeen=new Set();
  for(const gz of L.GZ60) for(const j of L.ZHI) for(const s of L.ZHI) for(const yy of ['day','night']){
    const r=L.liuren(gz,j,s,yy);
    total++;menSeen.add(r.men);
    if(r.chuan.length!==3||r.chuan.some(x=>!x))bad++;
  }
  const need=['知一课','涉害课','蒿矢课','弹射课','虎视转蓬','冬蛇掩目','别责课','八专课','伏吟','返吟','井栏射','重审课','元首课'];
  const missing=need.filter(m=>!menSeen.has(m));
  console.log((bad===0&&missing.length===0?'✓':'✗')+' 全盘扫描 '+total+' 盘：三传结构合法，宗门覆盖 '+menSeen.size+' 种');
  if(bad){console.log('  异常盘数 '+bad);fail++;}
  if(missing.length){console.log('  缺失宗门: '+missing.join('、'));fail++;}
}

/* ---------- 六爻（liuyao.js） ---------- */
const lyCases=[
  {name:'天风姤装卦（底本浑天甲子章示例）',r:Y.zhuanggua([8,7,7,7,7,7],'甲子'),exp:{
    name:'天风姤',gong:'乾',shi:0,ying:3,
    gz:['辛丑','辛亥','辛酉','壬午','壬申','壬戌'],
    lq:['父母','子孙','兄弟','官鬼','兄弟','父母']}},
  {name:'乾为天（六爻皆阳）',r:Y.zhuanggua([7,7,7,7,7,7],'壬子'),exp:{
    name:'乾为天',gong:'乾',shi:5,ying:2,
    gz:['甲子','甲寅','甲辰','壬午','壬申','壬戌'],
    lq:['子孙','妻财','父母','官鬼','兄弟','父母'],
    beasts:['玄武','青龙','朱雀','勾陈','螣蛇','白虎']}},
  {name:'老阳动爻变卦（乾之初九动→姤）',r:Y.zhuanggua([9,7,7,7,7,7],null),exp:{
    name:'乾为天',gong:'乾',bianName:'天风姤',bianGong:'乾'}},
  {name:'八宫覆盖 64 卦',r:Y,exp:{count:64}},
];
for(const c of lyCases){
  const e=c.exp;
  const checks=[];
  if(e.count){ checks.push(['卦名表',Object.keys(Y.NAME64).length===64]); }
  else{
    checks.push(['卦名',c.r.ben.name===e.name]);
    checks.push(['宫',c.r.ben.gong===e.gong]);
    if(e.shi!==undefined){
      checks.push(['世应',(c.r.ben.shi===e.shi&&c.r.ben.ying===e.ying)]);
      checks.push(['纳甲',JSON.stringify(c.r.rows.map(x=>x.gz))===JSON.stringify(e.gz)]);
      checks.push(['六亲',JSON.stringify(c.r.rows.map(x=>x.liuqin))===JSON.stringify(e.lq)]);
    }
    if(e.bianName) checks.push(['变卦',c.r.bian&&c.r.bian.name===e.bianName&&c.r.bian.gong===e.bianGong]);
    if(e.beasts) checks.push(['六兽',JSON.stringify(c.r.rows.map(x=>x.beast))===JSON.stringify(e.beasts)]);
  }
  for(const [n,ok] of checks){
    console.log((ok?'✓':'✗')+' 六爻 '+c.name+' · '+n);
    if(!ok)fail++;
  }
}
console.log(fail===0?'回归全部通过':'回归失败 '+fail+' 项');
process.exit(fail===0?0:1);
