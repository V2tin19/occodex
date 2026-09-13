/**
 * js/lib/mystic-ui.js — 沉浸式神秘学交互组件库
 * 包含：
 *   1. 逆流时钟与实时干支罗盘 (Chrono & Ganzhi Terminal)
 *   2. 小六壬「掐指一算」逐位步进动画与朱砂落印推演室 (Xiao Liu Ren Palm Oracle)
 *   3. 大六壬「天工浑天仪」天地盘交互旋转与三传流线 (Da Liu Ren Celestial Astrolabe)
 *   4. 六爻「三钱演易」铜钱物理抛掷与逐爻成卦仪式 (Liu Yao 3-Coin Oracle)
 */
(function(global) {
  'use strict';

  const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const GAN_WX_ARR = ['木','木','火','火','土','土','金','金','水','水'];
  const ZHI_WX_ARR = ['水','土','木','木','土','火','火','土','金','金','土','水'];
  const SX = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
  const GAN_WX = { '甲':'mu','乙':'mu','丙':'huo','丁':'huo','戊':'tu','己':'tu','庚':'jin','辛':'jin','壬':'shui','癸':'shui' };
  const ZHI_WX = { '子':'shui','丑':'tu','寅':'mu','卯':'mu','辰':'tu','巳':'huo','午':'huo','未':'tu','申':'jin','酉':'jin','戌':'tu','亥':'shui' };
  const WX_NAMES = { mu:'木', huo:'火', tu:'土', jin:'金', shui:'水' };
  const WX_CLASSES = { '木':'wx-mu', '火':'wx-huo', '土':'wx-tu', '金':'wx-jin', '水':'wx-shui' };
  const SHENG_MAP = { '木':'火', '火':'土', '土':'金', '金':'水', '水':'木' };
  const KE_MAP = { '木':'土', '土':'水', '水':'火', '火':'金', '金':'木' };

  const GAN_XIANG_DICT = {
    '甲': '参天乔木 · 栋梁阳木',
    '乙': '花草藤蔓 · 柔韧阴木',
    '丙': '太阳烈火 · 光明普照',
    '丁': '灯烛星火 · 温润专一',
    '戊': '城墙厚土 · 承载万物',
    '己': '田园沃土 · 滋养蕴藉',
    '庚': '刀剑金石 · 刚健肃杀',
    '辛': '珠玉美金 · 温润精粹',
    '壬': '江河大水 · 奔流不息',
    '癸': '雨露泉甘 · 潜沉润物'
  };

  const SHENGCHEN_INFO = {
    '子': { title: '晚子时 (23:00-01:00)', meridian: '胆经当令 · 一阳初生', phase: '夜半深藏' },
    '丑': { title: '丑时 (01:00-03:00)', meridian: '肝经当令 · 藏血排毒', phase: '鸡鸣破晓' },
    '寅': { title: '寅时 (03:00-05:00)', meridian: '肺经当令 · 朝百脉始', phase: '平旦初光' },
    '卯': { title: '卯时 (05:00-07:00)', meridian: '大肠经当令 · 清宿纳新', phase: '日出扶桑' },
    '辰': { title: '辰时 (07:00-09:00)', meridian: '胃经当令 · 运化水谷', phase: '食时晨炊' },
    '巳': { title: '巳时 (09:00-11:00)', meridian: '脾经当令 · 气血精微', phase: '隅中日照' },
    '午': { title: '午时 (11:00-13:00)', meridian: '心经当令 · 一阴初萌', phase: '日中极阳' },
    '未': { title: '未时 (13:00-15:00)', meridian: '小肠经当令 · 分清泌浊', phase: '日昳斜照' },
    '申': { title: '申时 (15:00-17:00)', meridian: '膀胱经当令 · 水府流转', phase: '晡时西倾' },
    '酉': { title: '酉时 (17:00-19:00)', meridian: '肾经当令 · 封藏元精', phase: '日入黄昏' },
    '戌': { title: '戌时 (19:00-21:00)', meridian: '心包经当令 · 护心怡情', phase: '黄昏定志' },
    '亥': { title: '亥时 (21:00-23:00)', meridian: '三焦经当令 · 百脉归息', phase: '人定安眠' }
  };

  const NAYIN = [
    '海中金','海中金','炉中火','炉中火','大林木','大林木','路旁土','路旁土','剑锋金','剑锋金',
    '山头火','山头火','涧下水','涧下水','城头土','城头土','白蜡金','白蜡金','杨柳木','杨柳木',
    '泉中水','泉中水','屋上土','屋上土','霹雳火','霹雳火','松柏木','松柏木','长流水','长流水',
    '沙中金','沙中金','山下火','山下火','平地木','平地木','壁上土','壁上土','金箔金','金箔金',
    '覆灯火','覆灯火','天河水','天河水','大驿土','大驿土','钗钏金','钗钏金','桑柘木','桑柘木',
    '大溪水','大溪水','沙中土','沙中土','天上火','天上火','石榴木','石榴木','大海水','大海水'
  ];

  const CANGGAN = [
    ['癸'],                  // 子
    ['己','癸','辛'],        // 丑
    ['甲','丙','戊'],        // 寅
    ['乙'],                  // 卯
    ['戊','乙','癸'],        // 辰
    ['丙','庚','戊'],        // 巳
    ['丁','己'],            // 午
    ['己','丁','乙'],        // 未
    ['庚','壬','戊'],        // 申
    ['辛'],                  // 酉
    ['戊','辛','丁'],        // 戌
    ['壬','甲']              // 亥
  ];

  const JIANCHU_NAMES = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'];
  const JIANCHU_DESC = [
    '万物创生 · 健旺之始',
    '去旧迎新 · 祓除滞碍',
    '丰满充盈 · 蓄势待发',
    '均等齐平 · 执中守正',
    '定局安邦 · 确立基业',
    '固执守常 · 操持不坠',
    '破旧立新 · 冲决窒碍',
    '知危履险 · 慎密周详',
    '成就大业 · 水到渠成',
    '归藏收聚 · 纳福聚财',
    '开启鸿蒙 · 豁然开朗',
    '深藏潜伏 · 涵养元精'
  ];

  const MANSIONS = [
    { name: '角木蛟', palace: '东方青龙', nature: '吉', desc: '春木萌动，开端肇启' },
    { name: '亢金龙', palace: '东方青龙', nature: '凶', desc: '金声清越，肃穆整肃' },
    { name: '氐土貉', palace: '东方青龙', nature: '凶', desc: '土厚根深，守静待机' },
    { name: '房日兔', palace: '东方青龙', nature: '吉', desc: '太阳正曜，四海通达' },
    { name: '心月狐', palace: '东方青龙', nature: '凶', desc: '潜龙腾跃，内修谨饬' },
    { name: '尾火虎', palace: '东方青龙', nature: '吉', desc: '焰火腾跃，光明显达' },
    { name: '箕水豹', palace: '东方青龙', nature: '吉', desc: '风起云涌，行云布雨' },
    { name: '斗木獬', palace: '北方玄武', nature: '吉', desc: '北斗柄杓，纲维天下' },
    { name: '牛金牛', palace: '北方玄武', nature: '凶', desc: '沉厚力行，任重致远' },
    { name: '女土蝠', palace: '北方玄武', nature: '凶', desc: '织锦裁云，密意内敛' },
    { name: '虚日鼠', palace: '北方玄武', nature: '凶', desc: '虚室生白，静笃自持' },
    { name: '危月燕', palace: '北方玄武', nature: '凶', desc: '高阁临风，审慎观变' },
    { name: '室火猪', palace: '北方玄武', nature: '吉', desc: '筑室安邦，基业笃实' },
    { name: '壁水貐', palace: '北方玄武', nature: '吉', desc: '图书秘府，文华斐然' },
    { name: '奎木狼', palace: '西方白虎', nature: '凶', desc: '文曲垂光，武备修整' },
    { name: '娄金狗', palace: '西方白虎', nature: '吉', desc: '聚众成林，仓廪充实' },
    { name: '胃土雉', palace: '西方白虎', nature: '吉', desc: '蓄藏五谷，富庶安康' },
    { name: '昴日鸡', palace: '西方白虎', nature: '凶', desc: '晨鸣破晓，万物昭彰' },
    { name: '毕月乌', palace: '西方白虎', nature: '吉', desc: '月华澄澈，雨露丰沛' },
    { name: '觜火猴', palace: '西方白虎', nature: '凶', desc: '灵动通微，机巧应变' },
    { name: '参水猿', palace: '西方白虎', nature: '吉', desc: '渊深广大，才智充沛' },
    { name: '井木犴', palace: '南方朱雀', nature: '吉', desc: '清泉润泽，法度清明' },
    { name: '鬼金羊', palace: '南方朱雀', nature: '凶', desc: '幽微潜隐，敬慎修身' },
    { name: '柳土獐', palace: '南方朱雀', nature: '凶', desc: '轻柔顺随，顺天应时' },
    { name: '星日马', palace: '南方朱雀', nature: '凶', desc: '星火辉映，奔驰不息' },
    { name: '张月鹿', palace: '南方朱雀', nature: '吉', desc: '张罗万象，光彩斐然' },
    { name: '翼火蛇', palace: '南方朱雀', nature: '凶', desc: '羽翼舒展，高飞远举' },
    { name: '轸水蚓', palace: '南方朱雀', nature: '吉', desc: '载物致远，吉庆攸同' }
  ];

  const SOLAR_TERMS = [
    { name: '小寒', month: 1, day: 6, pentads: ['鸿雁北乡', '鹊始巢', '雉始雊'] },
    { name: '大寒', month: 1, day: 20, pentads: ['鸡始乳', '征鸟厉疾', '水泽腹坚'] },
    { name: '立春', month: 2, day: 4, pentads: ['东风解冻', '蛰虫始振', '鱼陟负冰'] },
    { name: '雨水', month: 2, day: 19, pentads: ['獭祭鱼', '候雁北', '草木萌动'] },
    { name: '惊蛰', month: 3, day: 6, pentads: ['桃始华', '仓庚鸣', '鹰化为鸠'] },
    { name: '春分', month: 3, day: 21, pentads: ['玄鸟至', '雷乃发声', '始电'] },
    { name: '清明', month: 4, day: 5, pentads: ['桐始华', '田鼠化为鴽', '虹始见'] },
    { name: '谷雨', month: 4, day: 20, pentads: ['萍始生', '鸣鸠拂其羽', '戴胜降于桑'] },
    { name: '立夏', month: 5, day: 6, pentads: ['蝼蝈鸣', '蚯蚓出', '王瓜生'] },
    { name: '小满', month: 5, day: 21, pentads: ['苦菜秀', '靡草死', '麦秋至'] },
    { name: '芒种', month: 6, day: 6, pentads: ['螳螂生', '鵙始鸣', '反舌无声'] },
    { name: '夏至', month: 6, day: 21, pentads: ['鹿角解', '蝉始鸣', '半夏生'] },
    { name: '小暑', month: 7, day: 7, pentads: ['温风至', '蟋蟀居壁', '鹰始挚'] },
    { name: '大暑', month: 7, day: 23, pentads: ['腐草为萤', '土润溽暑', '大雨时行'] },
    { name: '立秋', month: 8, day: 8, pentads: ['凉风至', '白露降', '寒蝉鸣'] },
    { name: '处暑', month: 8, day: 23, pentads: ['鹰乃祭鸟', '天地始肃', '禾乃登'] },
    { name: '白露', month: 9, day: 8, pentads: ['鸿雁来', '玄鸟归', '群鸟养羞'] },
    { name: '秋分', month: 9, day: 23, pentads: ['雷始收声', '蛰虫坯户', '水始涸'] },
    { name: '寒露', month: 10, day: 8, pentads: ['鸿雁来宾', '雀入大水为蛤', '菊有黄华'] },
    { name: '霜降', month: 10, day: 23, pentads: ['豺乃祭兽', '草木黄落', '蛰虫咸俯'] },
    { name: '立冬', month: 11, day: 7, pentads: ['水始冰', '地始冻', '雉入大水为蜃'] },
    { name: '小雪', month: 11, day: 22, pentads: ['虹藏不见', '天腾地降', '闭塞成冬'] },
    { name: '大雪', month: 12, day: 7, pentads: ['鹖鴠不鸣', '虎始交', '荔挺出'] },
    { name: '冬至', month: 12, day: 22, pentads: ['蚯蚓结', '麋角解', '水泉动'] }
  ];

  /* ------------------------------------------------------------
     西方占星与赫尔密斯传统数据 (Western Hermetic Data)
     ------------------------------------------------------------ */
  const CHALDEAN_PLANETS = [
    { name: '土星', sym: '♄', en: 'Saturn', metal: '重铅', desc: '筑造结构、沉思、时间与边界之主' },
    { name: '木星', sym: '♃', en: 'Jupiter', metal: '青锡', desc: '扩张、丰饶、秩序、智慧与公义之主' },
    { name: '火星', sym: '♂', en: 'Mars', metal: '钢铁', desc: '意志、决断、破阵与驱策之主' },
    { name: '太阳', sym: '☉', en: 'Sun', metal: '黄金', desc: '神圣意志、生命之源、创造与核心光明' },
    { name: '金星', sym: '♀', en: 'Venus', metal: '黄铜', desc: '和谐、爱欲、美感、艺术与凝聚之主' },
    { name: '水星', sym: '☿', en: 'Mercury', metal: '水银', desc: '智识、传导、商贸、灵感与思辨之主' },
    { name: '月亮', sym: '☽', en: 'Moon', metal: '白银', desc: '直觉、潮汐、潜意识、反思与净化之主' }
  ];

  const DAY_RULER_INDICES = [3, 6, 2, 5, 1, 4, 0]; // Sun(☉), Mon(☽), Tue(♂), Wed(☿), Thu(♃), Fri(♀), Sat(♄)

  const ZODIAC_DECANS = [
    { sign: '白羊座', en: 'Aries', sym: '♈', elem: 'Fire', startM: 3, startD: 21, endM: 4, endD: 19,
      decans: [
        { num: '第 Ⅰ 分度 (0°-10°)', ruler: '火星 ♂', tarot: '权杖二 · 主宰', tarotEn: 'Two of Wands (Dominion)', title: '主宰与远大意志' },
        { num: '第 Ⅱ 分度 (10°-20°)', ruler: '太阳 ☉', tarot: '权杖三 · 远瞻', tarotEn: 'Three of Wands (Established Strength)', title: '出航的先驱与宏观构想' },
        { num: '第 Ⅲ 分度 (20°-30°)', ruler: '金星 ♀', tarot: '权杖四 · 完善', tarotEn: 'Four of Wands (Perfected Work)', title: '秩序的筑造与凯旋之宴' }
      ]
    },
    { sign: '金牛座', en: 'Taurus', sym: '♉', elem: 'Earth', startM: 4, startD: 20, endM: 5, endD: 20,
      decans: [
        { num: '第 Ⅰ 分度 (0°-10°)', ruler: '水星 ☿', tarot: '星币五 · 匮乏', tarotEn: 'Five of Pentacles (Material Trouble)', title: '风雪的试炼与内求之光' },
        { num: '第 Ⅱ 分度 (10°-20°)', ruler: '月亮 ☽', tarot: '星币六 · 施予', tarotEn: 'Six of Pentacles (Material Success)', title: '资源的均输与慈惠天平' },
        { num: '第 Ⅲ 分度 (20°-30°)', ruler: '土星 ♄', tarot: '星币七 · 守候', tarotEn: 'Seven of Pentacles (Success Unfulfilled)', title: '耐心的耕耘与收成沉淀' }
      ]
    },
    { sign: '双子座', en: 'Gemini', sym: '♊', elem: 'Air', startM: 5, startD: 21, endM: 6, endD: 20,
      decans: [
        { num: '第 Ⅰ 分度 (0°-10°)', ruler: '木星 ♃', tarot: '宝剑八 · 束缚', tarotEn: 'Eight of Swords (Shortened Force)', title: '认知的茧房与突围觉知' },
        { num: '第 Ⅱ 分度 (10°-20°)', ruler: '火星 ♂', tarot: '宝剑九 · 绝望', tarotEn: 'Nine of Swords (Despair & Cruelty)', title: '长夜的省思与心魔照彻' },
        { num: '第 Ⅲ 分度 (20°-30°)', ruler: '太阳 ☉', tarot: '宝剑十 · 倾覆', tarotEn: 'Ten of Swords (Ruin / Dawn)', title: '旧局的终结与初阳新生' }
      ]
    },
    { sign: '巨蟹座', en: 'Cancer', sym: '♋', elem: 'Water', startM: 6, startD: 21, endM: 7, endD: 22,
      decans: [
        { num: '第 Ⅰ 分度 (0°-10°)', ruler: '金星 ♀', tarot: '圣杯二 · 契合', tarotEn: 'Two of Cups (Love)', title: '两心的共鸣与神圣联结' },
        { num: '第 Ⅱ 分度 (10°-20°)', ruler: '水星 ☿', tarot: '圣杯三 · 庆贺', tarotEn: 'Three of Cups (Abundance)', title: '情谊的丰盈与欣乐共享' },
        { num: '第 Ⅲ 分度 (20°-30°)', ruler: '月亮 ☽', tarot: '圣杯四 · 倦怠', tarotEn: 'Four of Cups (Blended Pleasure)', title: '内省的沉淀与虚室生白' }
      ]
    },
    { sign: '狮子座', en: 'Leo', sym: '♌', elem: 'Fire', startM: 7, startD: 23, endM: 8, endD: 22,
      decans: [
        { num: '第 Ⅰ 分度 (0°-10°)', ruler: '土星 ♄', tarot: '权杖五 · 纷争', tarotEn: 'Five of Wands (Strife)', title: '激荡的竞逐与力量淬炼' },
        { num: '第 Ⅱ 分度 (10°-20°)', ruler: '木星 ♃', tarot: '权杖六 · 胜利', tarotEn: 'Six of Wands (Victory)', title: '荣光的冠冕与群情景仰' },
        { num: '第 Ⅲ 分度 (20°-30°)', ruler: '火星 ♂', tarot: '权杖七 · 勇毅', tarotEn: 'Seven of Wands (Valour)', title: '孤高的坚守与不屈意志' }
      ]
    },
    { sign: '处女座', en: 'Virgo', sym: '♍', elem: 'Earth', startM: 8, startD: 23, endM: 9, endD: 22,
      decans: [
        { num: '第 Ⅰ 分度 (0°-10°)', ruler: '太阳 ☉', tarot: '星币八 · 谨饬', tarotEn: 'Eight of Pentacles (Prudence)', title: '匠心的打磨与精湛技艺' },
        { num: '第 Ⅱ 分度 (10°-20°)', ruler: '金星 ♀', tarot: '星币九 · 丰饶', tarotEn: 'Nine of Pentacles (Material Gain)', title: '庄园的自足与优雅余裕' },
        { num: '第 Ⅲ 分度 (20°-30°)', ruler: '水星 ☿', tarot: '星币十 · 传承', tarotEn: 'Ten of Pentacles (Wealth)', title: '宗族的基业与物质长青' }
      ]
    },
    { sign: '天秤座', en: 'Libra', sym: '♎', elem: 'Air', startM: 9, startD: 23, endM: 10, endD: 22,
      decans: [
        { num: '第 Ⅰ 分度 (0°-10°)', ruler: '月亮 ☽', tarot: '宝剑二 · 均势', tarotEn: 'Two of Swords (Peace Restored)', title: '静默的权衡与直觉天平' },
        { num: '第 Ⅱ 分度 (10°-20°)', ruler: '土星 ♄', tarot: '宝剑三 · 悲怆', tarotEn: 'Three of Swords (Sorrow)', title: '锋刃的洞穿与理性觉悟' },
        { num: '第 Ⅲ 分度 (20°-30°)', ruler: '木星 ♃', tarot: '宝剑四 · 止息', tarotEn: 'Four of Swords (Truce)', title: '圣所的休战与神思澄澈' }
      ]
    },
    { sign: '天蝎座', en: 'Scorpio', sym: '♏', elem: 'Water', startM: 10, startD: 23, endM: 11, endD: 21,
      decans: [
        { num: '第 Ⅰ 分度 (0°-10°)', ruler: '火星 ♂', tarot: '圣杯五 · 哀恸', tarotEn: 'Five of Cups (Loss in Pleasure)', title: '倾覆的余波与希望余存' },
        { num: '第 Ⅱ 分度 (10°-20°)', ruler: '太阳 ☉', tarot: '圣杯六 · 欢欣', tarotEn: 'Six of Cups (Pleasure)', title: '童年的花园与温存回响' },
        { num: '第 Ⅲ 分度 (20°-30°)', ruler: '金星 ♀', tarot: '圣杯七 · 幻象', tarotEn: 'Seven of Cups (Illusionary Success)', title: '万象的诱惑与明辨本真' }
      ]
    },
    { sign: '射手座', en: 'Sagittarius', sym: '♐', elem: 'Fire', startM: 11, startD: 22, endM: 12, endD: 21,
      decans: [
        { num: '第 Ⅰ 分度 (0°-10°)', ruler: '水星 ☿', tarot: '权杖八 · 迅捷', tarotEn: 'Eight of Wands (Swiftness)', title: '疾驰的矢石与灵感迸发' },
        { num: '第 Ⅱ 分度 (10°-20°)', ruler: '月亮 ☽', tarot: '权杖九 · 固守', tarotEn: 'Nine of Wands (Great Strength)', title: '终线的前哨与坚毅防线' },
        { num: '第 Ⅲ 分度 (20°-30°)', ruler: '土星 ♄', tarot: '权杖十 · 负重', tarotEn: 'Ten of Wands (Oppression)', title: '重担的承荷与登顶在望' }
      ]
    },
    { sign: '摩羯座', en: 'Capricorn', sym: '♑', elem: 'Earth', startM: 12, startD: 22, endM: 1, endD: 19,
      decans: [
        { num: '第 Ⅰ 分度 (0°-10°)', ruler: '木星 ♃', tarot: '星币二 · 流转', tarotEn: 'Two of Pentacles (Harmonious Change)', title: '动态的平衡与无穷变化' },
        { num: '第 Ⅱ 分度 (10°-20°)', ruler: '火星 ♂', tarot: '星币三 · 筑造', tarotEn: 'Three of Pentacles (Material Works)', title: '圣殿的营构与团队精工' },
        { num: '第 Ⅲ 分度 (20°-30°)', ruler: '太阳 ☉', tarot: '星币四 · 固执', tarotEn: 'Four of Pentacles (Earthly Power)', title: '疆域的固守与资财护持' }
      ]
    },
    { sign: '水瓶座', en: 'Aquarius', sym: '♒', elem: 'Air', startM: 1, startD: 20, endM: 2, endD: 18,
      decans: [
        { num: '第 Ⅰ 分度 (0°-10°)', ruler: '金星 ♀', tarot: '宝剑五 · 溃败', tarotEn: 'Five of Swords (Defeat)', title: '胜负的虚妄与独存傲骨' },
        { num: '第 Ⅱ 分度 (10°-20°)', ruler: '水星 ☿', tarot: '宝剑六 · 渡越', tarotEn: 'Six of Swords (Earned Success)', title: '静水行舟与横渡彼岸' },
        { num: '第 Ⅲ 分度 (20°-30°)', ruler: '月亮 ☽', tarot: '宝剑七 · 潜行', tarotEn: 'Seven of Swords (Unstable Effort)', title: '机巧的谋划与暗度陈仓' }
      ]
    },
    { sign: '双鱼座', en: 'Pisces', sym: '♓', elem: 'Water', startM: 2, startD: 19, endM: 3, endD: 20,
      decans: [
        { num: '第 Ⅰ 分度 (0°-10°)', ruler: '土星 ♄', tarot: '圣杯八 · 舍离', tarotEn: 'Eight of Cups (Abandoned Success)', title: '红尘的告别与朝圣之旅' },
        { num: '第 Ⅱ 分度 (10°-20°)', ruler: '木星 ♃', tarot: '圣杯九 · 愿遂', tarotEn: 'Nine of Cups (Material Happiness)', title: '心愿的达成与自得其乐' },
        { num: '第 Ⅲ 分度 (20°-30°)', ruler: '火星 ♂', tarot: '圣杯十 · 完满', tarotEn: 'Ten of Cups (Perfect Success)', title: '彩虹的应许与阖家安乐' }
      ]
    }
  ];

  const ELEM_PROPS = {
    Fire: { name: '火元素', sym: '🜂', quality: '热与燥 (Hot & Dry)', humor: '胆汁质 (Choleric)', focus: '意志、决断、行动力与创造烈焰' },
    Earth: { name: '土元素', sym: '🜃', quality: '冷与燥 (Cold & Dry)', humor: '忧郁质 (Melancholic)', focus: '结构、沉思、物质筑基与耐力' },
    Air: { name: '风元素', sym: '🜁', quality: '热与湿 (Hot & Moist)', humor: '多血质 (Sanguine)', focus: '理性、传达、关系联结与灵感' },
    Water: { name: '水元素', sym: '🜄', quality: '冷与湿 (Cold & Moist)', humor: '粘液质 (Phlegmatic)', focus: '直觉、情感、潜意识与净化' }
  };

  /* ============================================================
     算法辅助函数
     ============================================================ */
  function jdn(y, m, d) {
    return Math.floor(Date.UTC(y, m - 1, d) / 86400000) + 2440588;
  }

  function getGanzhiIdx(gan, zhi) {
    return ((6 * gan - 5 * zhi) % 60 + 60) % 60;
  }

  function dayPillar(y, m, d) {
    const idx = ((jdn(y, m, d) + 49) % 60 + 60) % 60;
    return { gan: idx % 10, zhi: idx % 12, idx };
  }

  const TERM_TAB = [[1,6,1],[2,4,2],[3,6,3],[4,5,4],[5,6,5],[6,6,6],[7,7,7],[8,8,8],[9,8,9],[10,8,10],[11,7,11],[12,7,0]];
  function monthBranch(y, m, d) {
    let b = 0;
    for (const [tm, td, tb] of TERM_TAB) {
      if (m > tm || (m === tm && d >= td)) b = tb;
    }
    return b;
  }

  function getTenGod(dayGanIdx, targetGanIdx) {
    if (targetGanIdx === dayGanIdx) return '日元';
    const dWx = GAN_WX_ARR[dayGanIdx];
    const tWx = GAN_WX_ARR[targetGanIdx];
    const sameYY = (dayGanIdx % 2) === (targetGanIdx % 2);
    if (dWx === tWx) return sameYY ? '比肩' : '劫财';
    if (SHENG_MAP[dWx] === tWx) return sameYY ? '食神' : '伤官';
    if (SHENG_MAP[tWx] === dWx) return sameYY ? '偏印' : '正印';
    if (KE_MAP[dWx] === tWx) return sameYY ? '偏财' : '正财';
    if (KE_MAP[tWx] === dWx) return sameYY ? '七杀' : '正官';
    return '比肩';
  }

  function getXunKong(ganIdx, zhiIdx) {
    const diff = (zhiIdx - ganIdx + 12) % 12;
    const k1 = (diff + 10) % 12;
    const k2 = (diff + 11) % 12;
    return `${ZHI[k1]}${ZHI[k2]}空`;
  }

  function getCurrentSolarTermInfo(m, d) {
    let activeTerm = SOLAR_TERMS[SOLAR_TERMS.length - 1];
    for (let i = 0; i < SOLAR_TERMS.length; i++) {
      const t = SOLAR_TERMS[i];
      if (m > t.month || (m === t.month && d >= t.day)) {
        activeTerm = t;
      }
    }
    let dayDiff = d - activeTerm.day;
    if (dayDiff < 0) dayDiff += 30;
    const pIdx = Math.min(2, Math.floor(dayDiff / 5));
    const pName = ['初候', '二候', '三候'][pIdx];
    const pPhenology = activeTerm.pentads[pIdx] || activeTerm.pentads[0];
    return {
      termName: activeTerm.name,
      pentadLabel: `${pName} · ${pPhenology}`
    };
  }

  function getZodiacAndDecan(m, d) {
    let match = ZODIAC_DECANS[0];
    for (const z of ZODIAC_DECANS) {
      if (z.startM === z.endM) {
        if (m === z.startM && d >= z.startD && d <= z.endD) { match = z; break; }
      } else if (z.startM > z.endM) {
        if ((m === z.startM && d >= z.startD) || (m === z.endM && d <= z.endD)) { match = z; break; }
      } else {
        if ((m === z.startM && d >= z.startD) || (m === z.endM && d <= z.endD)) { match = z; break; }
      }
    }

    let daysIn = 0;
    if (m === match.startM) {
      daysIn = d - match.startD;
    } else {
      const prevMonthDays = new Date(2026, match.startM, 0).getDate();
      daysIn = (prevMonthDays - match.startD) + d;
    }
    const degree = Math.min(29, Math.max(0, daysIn));
    const decanIdx = Math.min(2, Math.floor(degree / 10));
    const decan = match.decans[decanIdx];
    const elemProp = ELEM_PROPS[match.elem] || ELEM_PROPS.Earth;

    return {
      sign: match.sign,
      en: match.en,
      sym: match.sym,
      elem: match.elem,
      degree: degree + 1,
      decan,
      elemProp
    };
  }

  function getMoonPhase(now) {
    const epoch = Date.UTC(2000, 0, 6, 18, 14);
    const diffDays = (now.getTime() - epoch) / 86400000;
    const cycle = 29.530588853;
    const age = ((diffDays % cycle) + cycle) % cycle;

    let name, en, sym, illum;
    if (age < 1.84 || age >= 27.69) {
      name = '新月 · 朔'; en = 'New Moon'; sym = '🌑'; illum = '0% ~ 2%';
    } else if (age < 5.53) {
      name = '蛾眉月'; en = 'Waxing Crescent'; sym = '🌒'; illum = '3% ~ 25%';
    } else if (age < 9.23) {
      name = '上弦月'; en = 'First Quarter'; sym = '🌓'; illum = '50%';
    } else if (age < 12.92) {
      name = '盈凸月'; en = 'Waxing Gibbous'; sym = '🌔'; illum = '51% ~ 98%';
    } else if (age < 16.61) {
      name = '满月 · 望'; en = 'Full Moon'; sym = '🌕'; illum = '99% ~ 100%';
    } else if (age < 20.30) {
      name = '亏凸月'; en = 'Waning Gibbous'; sym = '🌖'; illum = '98% ~ 51%';
    } else if (age < 24.00) {
      name = '下弦月'; en = 'Last Quarter'; sym = '🌗'; illum = '50%';
    } else {
      name = '残月'; en = 'Waning Crescent'; sym = '🌘'; illum = '49% ~ 3%';
    }

    return { name, en, sym, illum, age: age.toFixed(1) };
  }

  function getPlanetaryInfo(dayOfWeek, hour) {
    const dayRulerIdx = DAY_RULER_INDICES[dayOfWeek];
    const dayPlanet = CHALDEAN_PLANETS[dayRulerIdx];
    const hourOffset = (hour - 6 + 24) % 24;
    const hourRulerIdx = (dayRulerIdx + hourOffset) % 7;
    const hourPlanet = CHALDEAN_PLANETS[hourRulerIdx];
    return { dayPlanet, hourPlanet, hourOrder: hourOffset + 1 };
  }

  /* ============================================================
     1. 东西方双轨时空参详仪 (East-West Esoteric Chrono-Deck)
     ============================================================ */
  function calculateChronoData() {
    const now = new Date();
    let Y = now.getFullYear();
    let M = now.getMonth() + 1;
    let D = now.getDate();
    const h = now.getHours();
    const dayOfWeek = now.getDay();

    // 四柱排盘
    let adv = false;
    if (h >= 23) {
      adv = true;
      const t = new Date(Date.UTC(Y, M - 1, D));
      t.setUTCDate(t.getUTCDate() + 1);
      Y = t.getUTCFullYear();
      M = t.getUTCMonth() + 1;
      D = t.getUTCDate();
    }
    const fy = (M < 2 || (M === 2 && D < 4)) ? Y - 1 : Y;
    const yIdx = (((fy - 4) % 60) + 60) % 60;
    const yGan = yIdx % 10;
    const yZhi = yIdx % 12;

    const mb = monthBranch(Y, M, D);
    const mGan = ((2 + (yGan % 5) * 2 + ((mb - 2 + 12) % 12)) % 10 + 10) % 10;
    const mIdx = getGanzhiIdx(mGan, mb);

    const dp = dayPillar(Y, M, D);
    const dGan = dp.gan;
    const dZhi = dp.zhi;
    const dIdx = dp.idx;

    const hb = Math.floor((h + 1) % 24 / 2);
    const hGan = ((dGan % 5) * 2 + hb) % 10;
    const hIdx = getGanzhiIdx(hGan, hb);

    const pillarsRaw = [
      { name: '年柱 · 岁首', shortName: '年柱', gan: yGan, zhi: yZhi, idx: yIdx, isDay: false },
      { name: '月柱 · 提纲', shortName: '月柱', gan: mGan, zhi: mb, idx: mIdx, isDay: false },
      { name: '日柱 · 日元 (主)', shortName: '日元', gan: dGan, zhi: dZhi, idx: dIdx, isDay: true },
      { name: '时柱 · 归宿', shortName: '时柱', gan: hGan, zhi: hb, idx: hIdx, isDay: false }
    ];

    const pillars = pillarsRaw.map(p => {
      const ganChar = GAN[p.gan];
      const zhiChar = ZHI[p.zhi];
      const ganWx = GAN_WX_ARR[p.gan];
      const zhiWx = ZHI_WX_ARR[p.zhi];
      const ganWxClass = WX_CLASSES[ganWx];
      const zhiWxClass = WX_CLASSES[zhiWx];
      const nayin = NAYIN[p.idx];
      const sxChar = SX[p.zhi];
      const yyStr = (p.gan % 2 === 0) ? '阳' : '阴';
      const tenGod = p.isDay ? '日元' : getTenGod(dGan, p.gan);
      const xunKong = getXunKong(p.gan, p.zhi);
      const cgs = CANGGAN[p.zhi];
      const canggan = cgs.map(g => {
        const gIdx = GAN.indexOf(g);
        const tg = getTenGod(dGan, gIdx);
        const wx = GAN_WX_ARR[gIdx];
        return { g, tg, wx, wxClass: WX_CLASSES[wx] };
      });
      const cangganSummary = cgs.join('');

      return {
        ...p,
        ganChar, zhiChar, ganWx, zhiWx, ganWxClass, zhiWxClass,
        nayin, sxChar, yyStr, tenGod, xunKong, canggan, cangganSummary
      };
    });

    const jianchuIdx = (dZhi - mb + 12) % 12;
    const jianchuName = JIANCHU_NAMES[jianchuIdx];
    const jianchuDesc = JIANCHU_DESC[jianchuIdx];

    const currentJdn = jdn(Y, M, D);
    const mansionIdx = (currentJdn + 18) % 28;
    const mansion = MANSIONS[mansionIdx];

    const solarTerm = getCurrentSolarTermInfo(M, D);
    const shengchen = SHENGCHEN_INFO[ZHI[hb]] || SHENGCHEN_INFO['子'];
    const planetary = getPlanetaryInfo(dayOfWeek, h);
    const zodiac = getZodiacAndDecan(M, D);
    const moon = getMoonPhase(now);

    return {
      now, Y, M, D, h, dayOfWeek, adv,
      pillars,
      dGan, dZhi,
      dayMasterGan: GAN[dGan],
      dayMasterXiang: GAN_XIANG_DICT[GAN[dGan]],
      jianchuName, jianchuDesc,
      mansion,
      solarTerm,
      shengchen,
      planetary,
      zodiac,
      moon
    };
  }

  function renderCompactDeck(el, data) {
    const { pillars, solarTerm, jianchuName, mansion, shengchen } = data;

    const cardsHtml = pillars.map(p => {
      const cardClass = p.isDay ? 'ccc-p-item ccc-p-main' : 'ccc-p-item';
      const tagText = p.isDay ? '日元(主)' : p.shortName;
      const godText = p.isDay ? `${p.ganChar}金` : p.tenGod;
      const subInfo = p.isDay ? `空: ${p.xunKong.replace('空','')}` : `藏: ${p.cangganSummary}`;

      return `
        <div class="${cardClass}">
          <div class="ccc-p-head">
            <span class="ccc-p-tag">${tagText}</span>
            <span class="ccc-p-god">${godText}</span>
          </div>
          <div class="ccc-p-gz">
            <span class="cpc-char ${p.ganWxClass}">${p.ganChar}</span>
            <span class="cpc-char ${p.zhiWxClass}">${p.zhiChar}</span>
          </div>
          <div class="ccc-p-foot">
            <span class="ccc-nayin">${p.nayin}</span>
            <span class="ccc-cg">${subInfo}</span>
          </div>
        </div>
      `;
    }).join('');

    el.innerHTML = `
      <div class="chrono-compact-card">
        <div class="ccc-topbar">
          <div class="ccc-title-group">
            <span class="tech-chip"><span class="dot"></span>东玄 // 皇极四柱历标</span>
            <span class="ccc-term-badge"><strong>${solarTerm.termName}</strong> <small>(${solarTerm.pentadLabel})</small></span>
            <span class="ccc-mini-pill">${jianchuName}日值守</span>
            <span class="ccc-mini-pill">${mansion.name}宿</span>
            <span class="ccc-mini-pill">${shengchen.title.split(' ')[0]}·${shengchen.meridian.split('·')[0]}</span>
          </div>
          <div class="ccc-right-actions">
            <span class="cdt-sync-pill"><span class="pulse-dot"></span>四柱同步</span>
            <a href="#portalFullChrono" class="ccc-full-link">全息双轨星历 ↓</a>
          </div>
        </div>
        <div class="ccc-pillars-row">
          ${cardsHtml}
        </div>
      </div>
    `;
  }

  function renderFullDeck(el, data) {
    const { Y, M, D, pillars, solarTerm, jianchuName, jianchuDesc, mansion, shengchen, planetary, zodiac, moon, dayMasterGan, dayMasterXiang } = data;

    function formatCanggan(cangganList) {
      return cangganList.map(item => {
        return `<span class="cg-pill"><b class="${item.wxClass}">${item.g}</b><small>(${item.tg})</small></span>`;
      }).join('');
    }

    const pillarsHtml = pillars.map(p => {
      const cardClass = p.isDay ? 'chrono-pillar-card p-main' : 'chrono-pillar-card';
      return `
        <div class="${cardClass}">
          <div class="cpc-header">
            <span class="cpc-name">${p.name}</span>
            <span class="cpc-nayin">${p.nayin}</span>
          </div>
          <div class="cpc-ganzhi-block">
            <div class="cpc-gz-row">
              <span class="cpc-char ${p.ganWxClass}">${p.ganChar}</span>
              <span class="cpc-subtag">${p.yyStr}${p.ganWx} · ${p.tenGod}</span>
            </div>
            <div class="cpc-gz-row">
              <span class="cpc-char ${p.zhiWxClass}">${p.zhiChar}</span>
              <span class="cpc-subtag">${p.zhiWx} · 肖${p.sxChar}</span>
            </div>
          </div>
          <div class="cpc-meta-section">
            <div class="cpc-meta-line">
              <span class="cpc-lbl">藏干十神</span>
              <div class="cpc-cg-wrap">${formatCanggan(p.canggan)}</div>
            </div>
            <div class="cpc-meta-line">
              <span class="cpc-lbl">旬空所在</span>
              <span class="cpc-val">${p.xunKong}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    el.innerHTML = `
      <div class="chrono-deck-container">
        <div class="chrono-deck-topbar">
          <div class="cdt-left">
            <span class="tech-chip"><span class="dot"></span>CHRONO // 东西方双轨时空参详仪 · 全息星历</span>
            <span class="cdt-subtitle">CELESTIAL CHRONO-DECK & HERMETIC EPHEMERIS</span>
          </div>
          <div class="cdt-right">
            <span class="cdt-date-badge">${Y}年${M}月${D}日 · 律历静息流转</span>
            <span class="cdt-sync-pill"><span class="pulse-dot"></span>四柱星轨同步中</span>
          </div>
        </div>

        <div class="chrono-twin-grid">
          <!-- 左栏：东玄·皇极四柱干支历 -->
          <div class="chrono-deck-panel east-panel">
            <div class="cdp-head">
              <div class="cdp-title">
                <span class="cdp-icon">☯</span>
                <span class="cdp-main-title">东玄 · 皇极四柱历标</span>
                <span class="cdp-en">FOUR PILLARS OF DESTINY</span>
              </div>
              <div class="cdp-desc">
                以立春定岁首，节气定提纲。日主 <strong>${dayMasterGan}金 (${dayMasterXiang})</strong> 当令参详。
              </div>
            </div>

            <div class="chrono-pillars-matrix">
              ${pillarsHtml}
            </div>

            <div class="east-ephemeris-ribbon">
              <div class="eer-item">
                <span class="eer-tag">廿四节气与七十二候</span>
                <span class="eer-val"><strong>${solarTerm.termName}</strong> <small>(${solarTerm.pentadLabel})</small></span>
              </div>
              <div class="eer-item">
                <span class="eer-tag">建除十二神</span>
                <span class="eer-val"><strong>${jianchuName}日</strong> <small>(${jianchuDesc})</small></span>
              </div>
              <div class="eer-item">
                <span class="eer-tag">二十八宿值日</span>
                <span class="eer-val"><strong>${mansion.name}</strong> <small>(${mansion.palace} · ${mansion.nature})</small></span>
              </div>
              <div class="eer-item">
                <span class="eer-tag">时辰经络与物候</span>
                <span class="eer-val"><strong>${shengchen.title}</strong> <small>(${shengchen.meridian})</small></span>
              </div>
            </div>
          </div>

          <!-- 右栏：西玄·赫尔密斯七曜与黄道分度 -->
          <div class="chrono-deck-panel west-panel">
            <div class="cdp-head">
              <div class="cdp-title">
                <span class="cdp-icon">🜂</span>
                <span class="cdp-main-title">西玄 · 赫尔密斯七曜与黄道分度</span>
                <span class="cdp-en">HERMETIC ASTROLOGY & DECANS</span>
              </div>
              <div class="cdp-desc">
                迦勒底行星时阶 · 黄道十分度守护塔罗 · 月相潮汐与赫尔密斯四原质。
              </div>
            </div>

            <div class="chrono-west-matrix">
              <div class="west-matrix-card">
                <div class="wmc-header">
                  <span class="wmc-badge">PLANETARY RULERS</span>
                  <span class="wmc-sym">${planetary.dayPlanet.sym} / ${planetary.hourPlanet.sym}</span>
                </div>
                <div class="wmc-body">
                  <div class="wmc-title">
                    ${planetary.dayPlanet.name}日 <small>· ${planetary.dayPlanet.en}</small>
                  </div>
                  <div class="wmc-highlight">
                    当前时辰：<strong>${planetary.hourPlanet.name}时</strong> <small>(${planetary.hourPlanet.en} Hour · 第 ${planetary.hourOrder} 阶)</small>
                  </div>
                  <div class="wmc-detail">
                    日主掌控 <strong>${planetary.dayPlanet.metal}</strong>（${planetary.dayPlanet.desc}）；当前时阶引动 <strong>${planetary.hourPlanet.name}</strong> 之能（${planetary.hourPlanet.desc}）。
                  </div>
                </div>
              </div>

              <div class="west-matrix-card">
                <div class="wmc-header">
                  <span class="wmc-badge">TROPICAL ZODIAC & DECAN</span>
                  <span class="wmc-sym">${zodiac.sym} ${zodiac.degree}°</span>
                </div>
                <div class="wmc-body">
                  <div class="wmc-title">
                    ${zodiac.sign} · ${zodiac.decan.num} <small>· ${zodiac.en}</small>
                  </div>
                  <div class="wmc-highlight">
                    分度主星：<strong>${zodiac.decan.ruler}</strong> <small>(Decan Ruler)</small>
                  </div>
                  <div class="wmc-detail">
                    黄道行经 <strong>${zodiac.degree}°</strong>；由 <strong>${zodiac.decan.ruler}</strong> 赋予 ${zodiac.decan.title} 之象。
                  </div>
                </div>
              </div>

              <div class="west-matrix-card wmc-tarot-highlight">
                <div class="wmc-header">
                  <span class="wmc-badge">MINOR ARCANA DECAN RULER</span>
                  <span class="wmc-sym">🎴</span>
                </div>
                <div class="wmc-body">
                  <div class="wmc-title">
                    ${zodiac.decan.tarot} <small>· ${zodiac.decan.tarotEn}</small>
                  </div>
                  <div class="wmc-highlight">
                    黄金黎明秘义：<strong>${zodiac.decan.title}</strong>
                  </div>
                  <div class="wmc-detail">
                    对应 ${zodiac.elemProp.name} 之精微演化，指示当前时空之深层修习课题与精神照彻。
                  </div>
                </div>
              </div>

              <div class="west-matrix-card">
                <div class="wmc-header">
                  <span class="wmc-badge">LUNAR PHASE & 4 HUMORS</span>
                  <span class="wmc-sym">${moon.sym} ${zodiac.elemProp.sym}</span>
                </div>
                <div class="wmc-body">
                  <div class="wmc-title">
                    ${moon.name} <small>· ${moon.en} (月龄 ${moon.age} 天 · 光照 ${moon.illum})</small>
                  </div>
                  <div class="wmc-highlight">
                    主导原质：<strong>${zodiac.elemProp.name} · ${zodiac.elemProp.quality}</strong>
                  </div>
                  <div class="wmc-detail">
                    气质对应：<strong>${zodiac.elemProp.humor}</strong>；气场侧重 <em>${zodiac.elemProp.focus}</em>。
                  </div>
                </div>
              </div>
            </div>

            <div class="west-quote-ribbon">
              <div class="wqr-text">
                "As above, so below; as within, so without; as the universe, so the soul."
              </div>
              <div class="wqr-sub">
                —— 赫尔密斯·特里斯墨吉斯忒斯《翡翠石板》· 天人同构法则
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function initChronoClock(containerId, options) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const mode = (options && options.mode) ? options.mode : (containerId === 'portalChrono' ? 'compact' : 'full');

    function update() {
      const data = calculateChronoData();
      if (mode === 'compact') {
        renderCompactDeck(el, data);
      } else {
        renderFullDeck(el, data);
      }
    }

    update();
    setInterval(update, 60000);
  }

  /* ============================================================
     2. 小六壬「掐指一算」逐位步进动画与朱砂落印推演室
     ============================================================ */
  const XLR_PALACES = [
    { id: 0, name: '大安', wx: '木', beast: '青龙', nature: '吉', pos: '食指根', desc: '身不动时，五行属木，颜色青色，方位东方。谋事在初，贵人可倚。' },
    { id: 1, name: '留连', wx: '水', beast: '玄武', nature: '凶', pos: '食指尖', desc: '人未归时，五行属水，颜色黑色，方位北方。纠缠暗昧，迁延反复。' },
    { id: 2, name: '速喜', wx: '火', beast: '朱雀', nature: '吉', pos: '中指尖', desc: '人便至时，五行属火，颜色红色，方位南方。喜讯速至，立见分晓。' },
    { id: 3, name: '赤口', wx: '金', beast: '白虎', nature: '凶', pos: '无名指尖', desc: '官事凶时，五行属金，颜色白色，方位西方。口舌是非，争斗冲突。' },
    { id: 4, name: '小吉', wx: '水', beast: '六合', nature: '吉', pos: '无名指根', desc: '人来喜时，五行属水，颜色青白，方位西北。和合美满，小有财利。' },
    { id: 5, name: '空亡', wx: '土', beast: '勾陈', nature: '凶', pos: '中指根', desc: '音信稀时，五行属土，颜色黄色，方位中央。落空无果，谋事难成。' }
  ];

  // 掌诀图穴位坐标映射 (SVG viewBox="0 0 360 400")
  const PALM_NODES = [
    { cx: 130, cy: 204 }, // 0 大安 (食指根)
    { cx: 126, cy: 112 }, // 1 留连 (食指尖)
    { cx: 179, cy: 95 },  // 2 速喜 (中指尖)
    { cx: 227, cy: 112 }, // 3 赤口 (无名指尖)
    { cx: 226, cy: 205 }, // 4 小吉 (无名指根)
    { cx: 180, cy: 205 }  // 5 空亡 (中指根)
  ];

  function runXiaoLiuRenAnimation(M, D, H, onStep, onComplete) {
    // 口诀：月初起大安，日从月上起，时从日上起
    const monthTarget = (M - 1) % 6;
    const dayTarget = (monthTarget + D - 1) % 6;
    const hourTarget = (dayTarget + H - 1) % 6;

    const steps = [];
    // 阶段1：数月 (从大安 0 开始数 M 次)
    for (let i = 0; i < M; i++) {
      steps.push({ phase: '月', count: i + 1, total: M, palace: i % 6, label: `数月：第 ${i + 1} 步（${XLR_PALACES[i % 6].name}）` });
    }
    // 阶段2：数日 (从 monthTarget 开始数 D-1 次)
    for (let i = 1; i < D; i++) {
      const p = (monthTarget + i) % 6;
      steps.push({ phase: '日', count: i + 1, total: D, palace: p, label: `数日：初 ${i + 1}（${XLR_PALACES[p].name}）` });
    }
    // 阶段3：数时 (从 dayTarget 开始数 H-1 次)
    for (let i = 1; i < H; i++) {
      const p = (dayTarget + i) % 6;
      steps.push({ phase: '时', count: i + 1, total: H, palace: p, label: `数时：${ZHI[i]}时（${XLR_PALACES[p].name}）` });
    }

    let stepIdx = 0;
    const interval = Math.max(80, Math.min(220, 2400 / steps.length));

    const timer = setInterval(() => {
      if (stepIdx < steps.length) {
        const s = steps[stepIdx];
        if (onStep) onStep(s);
        if (window.MysticAudio) {
          window.MysticAudio.tick(900 + (s.palace * 100));
        }
        stepIdx++;
      } else {
        clearInterval(timer);
        const finalResult = {
          monthPalace: XLR_PALACES[monthTarget],
          dayPalace: XLR_PALACES[dayTarget],
          hourPalace: XLR_PALACES[hourTarget],
          final: XLR_PALACES[hourTarget]
        };
        if (window.MysticAudio) {
          window.MysticAudio.stamp();
        }
        if (onComplete) onComplete(finalResult);
      }
    }, interval);

    return timer;
  }

  /* ============================================================
     3. 大六壬「天工浑天仪」天地盘 360° 交互浑天仪
     ============================================================ */
  function renderLiurenAstrolabe(containerEl, jiang, shi) {
    if (!containerEl) return;
    const jiangIdx = ZHI.indexOf(jiang);
    const shiIdx = ZHI.indexOf(shi);
    const off = ((jiangIdx - shiIdx) % 12 + 12) % 12;

    let itemsHtml = '';
    // 12 地盘固定，天盘旋转
    for (let di = 0; di < 12; di++) {
      const tianZhi = ZHI[(di + off) % 12];
      const diZhi = ZHI[di];
      const angle = (di * 30 - 90) * (Math.PI / 180);
      const rOuter = 135;
      const rInner = 85;
      const xOuter = 160 + rOuter * Math.cos(angle);
      const yOuter = 160 + rOuter * Math.sin(angle);
      const xInner = 160 + rInner * Math.cos(angle);
      const yInner = 160 + rInner * Math.sin(angle);

      itemsHtml += `
        <g class="astrolabe-node" data-di="${di}">
          <circle cx="${xOuter}" cy="${yOuter}" r="17" class="di-circle" />
          <text x="${xOuter}" y="${yOuter + 5}" class="di-text">${diZhi}</text>
          <line x1="${xOuter}" y1="${yOuter}" x2="${xInner}" y2="${yInner}" class="orbit-ray" />
          <circle cx="${xInner}" cy="${yInner}" r="15" class="tian-circle" />
          <text x="${xInner}" y="${yInner + 5}" class="tian-text">${tianZhi}</text>
        </g>
      `;
    }

    containerEl.innerHTML = `
      <svg class="astrolabe-svg" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
        <circle cx="160" cy="160" r="148" class="astro-ring outer" />
        <circle cx="160" cy="160" r="102" class="astro-ring middle" />
        <circle cx="160" cy="160" r="54" class="astro-ring inner" />
        <text x="160" y="156" class="astro-center-title">璇玑盘</text>
        <text x="160" y="174" class="astro-center-sub">${jiang}将加${shi}</text>
        ${itemsHtml}
      </svg>
    `;
  }

  /* ============================================================
     4. 六爻「三钱演易」铜钱物理抛掷仪式
     ============================================================ */
  function castLiuYaoCoinToss() {
    // 抛 3 枚铜钱：每枚正面=3（阳），反面=2（阴）
    const c1 = Math.random() > 0.5 ? 3 : 2;
    const c2 = Math.random() > 0.5 ? 3 : 2;
    const c3 = Math.random() > 0.5 ? 3 : 2;
    const sum = c1 + c2 + c3;
    // 6=老阴(动), 7=少阳, 8=少阴, 9=老阳(动)
    const typeMap = {
      6: { val: 6, name: '老阴 (⚏ 动)', isYang: false, isDong: true, symbol: '⚋ ✕' },
      7: { val: 7, name: '少阳 (⚊)', isYang: true, isDong: false, symbol: '⚊' },
      8: { val: 8, name: '少阴 (⚋)', isYang: false, isDong: false, symbol: '⚋' },
      9: { val: 9, name: '老阳 (⚊ 动)', isYang: true, isDong: true, symbol: '⚊ 〇' }
    };
    return {
      coins: [c1, c2, c3],
      sum,
      ...typeMap[sum]
    };
  }

  global.MysticUI = {
    initChronoClock,
    runXiaoLiuRenAnimation,
    renderLiurenAstrolabe,
    castLiuYaoCoinToss,
    XLR_PALACES,
    PALM_NODES,
    GAN,
    ZHI,
    GAN_WX,
    ZHI_WX,
    WX_NAMES
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.MysticUI;
  }
})(typeof window !== 'undefined' ? window : globalThis);
