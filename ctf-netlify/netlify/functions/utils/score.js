'use strict';

const COMMON = new Set(['password','123456','12345678','qwerty','abc123','monkey','letmein',
    'trustno1','dragon','baseball','iloveyou','master','sunshine','passw0rd','shadow',
    '123123','654321','superman','qazwsx','football','password1','password123','admin',
    'welcome','login','hello','111111','000000','root','admin123','qwerty123','princess']);

function score(pw) {
    if (!pw||!pw.length) return {score:0,rank:'💀 EMPTY',color:'#444',crack:'Instant',flags:[],details:{}};
    let s=0; const flags=[],det={};
    const l=pw.length;
    s+=l>=25?180:l>=20?140:l>=16?100:l>=12?70:l>=8?40:l>=6?20:l*3;
    det.length=l;
    const lo=/[a-z]/.test(pw),up=/[A-Z]/.test(pw),di=/\d/.test(pw),
          sy=/[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?`~]/.test(pw),un=/[^\x00-\x7F]/.test(pw);
    if(lo)s+=10; if(up)s+=20; if(di)s+=20; if(sy)s+=40; if(un)s+=30;
    const t=[lo,up,di,sy,un].filter(Boolean).length;
    s+=t*15; det.charTypes=t;
    if(COMMON.has(pw.toLowerCase())){s-=350;flags.push('COMMON_PASSWORD');}
    let n=pw.toLowerCase();
    for(const[k,v]of Object.entries({'0':'o','1':'i','3':'e','4':'a','5':'s','@':'a','$':'s','7':'t'}))n=n.split(k).join(v);
    if(n!==pw.toLowerCase()&&COMMON.has(n)){s-=200;flags.push('LEET_COMMON');}
    for(const{re,pts,f}of[
        {re:/password/i,pts:-180,f:'CONTAINS_PASSWORD'},
        {re:/^(admin|root)$/i,pts:-200,f:'IS_ADMIN_ROOT'},
        {re:/^[0-9]+$/,pts:-80,f:'DIGITS_ONLY'},
        {re:/^[a-zA-Z]+$/,pts:-50,f:'LETTERS_ONLY'},
        {re:/(.)\1{3,}/,pts:-100,f:'REPEATED_CHARS'},
        {re:/12345/,pts:-60,f:'SEQ_DIGITS'},
        {re:/qwerty/i,pts:-80,f:'KEYBOARD_WALK'},
        {re:/iloveyou/i,pts:-100,f:'ILOVEYOU'},
    ]){if(re.test(pw)){s+=pts;flags.push(f);}}
    let wk=0,pl=pw.toLowerCase();
    for(const row of['qwertyuiop','asdfghjkl','zxcvbnm','1234567890'])
        for(let i=0;i<pl.length-3;i++)if(row.includes(pl.slice(i,i+4)))wk+=20;
    if(wk>0){s-=wk;flags.push('KEYBOARD_PATTERN');}
    const uq=new Set(pw).size,en=pw.length*Math.log2(Math.max(uq,2));
    s+=Math.floor(en*1.5); det.entropy=Math.round(en*10)/10;
    const ws=pw.split(/[\s_\-]+/).filter(w=>w.length>1);
    if(ws.length>=4){s+=ws.length*25;flags.push('PASSPHRASE');det.words=ws.length;}
    s=Math.max(0,Math.min(1000,s));
    let rank='🪦 DEAD',color='#555';
    if(s>=850){rank='🦄 GODMODE';color='#ff00ff';}
    else if(s>=700){rank='🔥 ELITE';color='#ff4444';}
    else if(s>=550){rank='💎 DIAMOND';color='#00cfff';}
    else if(s>=400){rank='👑 PLATINUM';color='#e5e4e2';}
    else if(s>=250){rank='⭐ GOLD';color='#ffd700';}
    else if(s>=120){rank='⚪ SILVER';color='#c0c0c0';}
    else if(s>=50){rank='🕐 BRONZE';color='#cd7f32';}
    let pool=0;
    if(lo)pool+=26;if(up)pool+=26;if(di)pool+=10;if(sy)pool+=32;
    pool=Math.max(pool,2);
    const sec=Math.pow(pool,pw.length)/1e10;
    const crack=sec<1?'Instant':sec<60?Math.round(sec)+'s':sec<3600?Math.round(sec/60)+'m'
        :sec<86400?Math.round(sec/3600)+'h':sec<2592000?Math.round(sec/86400)+'d'
        :sec<3.15e7?Math.round(sec/2592000)+'mo':sec<3.15e9?Math.round(sec/3.15e7)+'yr':'1000+ yrs';
    return {score:s,rank,color,crack,flags,details:det};
}

module.exports = { score };
