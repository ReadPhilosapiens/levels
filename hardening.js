(function(){
'use strict';
if(typeof data==='undefined'||typeof ZT==='undefined'||typeof renderAll!=='function'||typeof save!=='function')return;
var K_B='levels.lastBackup',K_P='levels.prerestore',K_I='levels.iosHintSeen',DAY=864e5,MAXB=5*1024*1024;
function g(k){try{return localStorage.getItem(k)}catch(e){return null}}
function put(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}}
function del(k){try{localStorage.removeItem(k)}catch(e){}}
var standalone=false;try{standalone=!!(navigator.standalone||matchMedia('(display-mode: standalone)').matches)}catch(e){}
if(standalone&&navigator.storage&&navigator.storage.persist){try{navigator.storage.persist().catch(function(){})}catch(e){}}
var st=document.createElement('style');
st.textContent=':focus-visible{outline:2px solid currentColor;outline-offset:2px}.hx{margin:8px 0;padding:12px 14px;border-radius:14px;background:var(--panel);border:1px solid var(--line);color:var(--ink);font-size:14px;line-height:1.4}.hx button{min-height:44px;padding:0 14px;margin:8px 8px 0 0;border-radius:12px;border:1px solid var(--line);background:transparent;color:inherit;font:inherit}';
document.head.appendChild(st);
var tt=document.getElementById('toast');if(tt){tt.setAttribute('role','status');tt.setAttribute('aria-live','polite')}
['logSheet','ckSheet','skinSheet'].forEach(function(id){var el=document.getElementById(id);if(el){el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');if(!el.getAttribute('aria-label'))el.setAttribute('aria-label','Levels dialog')}});

function txt(v,max){if(typeof v!=='string')return null;v=v.replace(/[<>\u0000-\u001f]/g,' ').trim().slice(0,max);return v||null}
function num(v){return typeof v==='number'&&isFinite(v)&&Math.abs(v)<1e9?v:null}
function list(a){if(!Array.isArray(a))return null;var o=[];for(var i=0;i<a.length&&i<20;i++){if(typeof a[i]==='string'&&/^[A-Za-z0-9_]{1,24}$/.test(a[i]))o.push(a[i])}return o.length?o:null}
function clean(x,i){
 if(!x||typeof x!=='object'||Array.isArray(x))return null;
 if(typeof x.z!=='string'||!Object.prototype.hasOwnProperty.call(ZT,x.z))return null;
 var ts=num(x.ts);if(!ts||ts<=0||ts>Date.now()+366*DAY)return null;
 var r=null;if(x.r!==null&&x.r!==undefined){r=num(x.r);if(r===null||r<-20||r>50)return null}
 var o={id:(typeof x.id==='string'&&/^[A-Za-z0-9_-]{1,40}$/.test(x.id))?x.id:'i'+Date.now().toString(36)+i,ts:ts,z:x.z,r:r};
 if(x.w===true||x.w===false||x.w===null)o.w=x.w;
 if(x.sample)o.sample=1;
 if(typeof x.zid==='string'&&/^[A-Za-z0-9_-]{1,20}$/.test(x.zid))o.zid=x.zid;
 if(typeof x.tf==='string'&&/^[A-Za-z0-9]{1,4}$/.test(x.tf))o.tf=x.tf;
 if(x.dir==='buy'||x.dir==='sell')o.dir=x.dir;
 ['level','why','feelNote','lesson'].forEach(function(k){var v=txt(x[k],k==='level'?80:500);if(v)o[k]=v});
 ['entry','sl','tp','exit','risk','riskAmt','pl'].forEach(function(k){var v=num(x[k]);if(v!==null)o[k]=v});
 var c=list(x.conf);if(c)o.conf=c;
 var f=list(x.feel);if(f)o.feel=f;
 return o}

function ago(ts){var d=Math.floor((Date.now()-ts)/DAY);return d<=0?'today':d===1?'1 day ago':d+' days ago'}
function box(id){var d=document.createElement('div');d.id=id;d.className='hx';return d}
function btn(label,fn){var b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;return b}

function backup(){
 try{
  var blob=new Blob([JSON.stringify({app:'levels',v:2,saved:new Date().toISOString(),e:data.e,skin:LS.get('lv_skin','glass')},null,1)],{type:'application/json'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='levels-backup-'+today()+'.json';document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1500);
  put(K_B,String(Date.now()));toast('Backup saved.');hx();
 }catch(e){toast('Could not make a backup.')}
}
function undo(){
 var arr=null;try{arr=JSON.parse(g(K_P))}catch(e){}
 if(!Array.isArray(arr)){del(K_P);toast('Nothing to undo.');hx();return}
 if(!confirm('Undo the last restore? Entries you logged after it will go too.'))return;
 data.e=arr;save();del(K_P);renderAll();toast('Restore undone.');
}
function restore(ev){
 var inp=ev.target,f=inp.files&&inp.files[0];if(!f)return;
 var bad=function(){toast("That file isn't a Levels backup. Nothing was changed.")};
 if(f.size>MAXB){bad();inp.value='';return}
 f.text().then(function(t){
  var j;try{j=JSON.parse(t)}catch(e){bad();return}
  if(!j||j.app!=='levels'||(j.v!==undefined&&!(j.v>=1&&j.v<=2))||!Array.isArray(j.e)||j.e.length>5000){bad();return}
  var ok=[],dropped=0;
  j.e.forEach(function(x,i){var c=clean(x,i);if(c)ok.push(c);else dropped++});
  if(!ok.length){toast('Nothing usable in that backup. Nothing was changed.');return}
  var allSample=data.e.length>0&&data.e.every(function(e){return e.sample});
  var base=allSample?[]:data.e,have={};
  base.forEach(function(e){have[e.id]=1});
  var add=ok.filter(function(e){return !have[e.id]});
  if(!add.length){toast('Nothing new in this backup. Nothing was changed.');return}
  var lo=Math.min.apply(null,add.map(function(e){return e.ts})),hi=Math.max.apply(null,add.map(function(e){return e.ts}));
  var fm=function(ts){return new Date(ts).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})};
  var msg='Add '+add.length+' entries from this backup ('+fm(lo)+' to '+fm(hi)+')? '+(allSample?'Your sample entries will be replaced. ':'Your '+data.e.length+' current entries stay. ')+(dropped?dropped+' unreadable ones are skipped. ':'')+'You can undo this.';
  if(!confirm(msg))return;
  if(!put(K_P,JSON.stringify(data.e))&&!confirm("Couldn't keep an undo copy. Restore anyway?"))return;
  data.e=base.concat(add);save();renderAll();toast('Added '+add.length+' entries.');
 }).catch(bad).then(function(){inp.value=''});
}
function hx(){
 var main=document.querySelector('main'),real=0;
 for(var i=0;i<data.e.length;i++){if(!data.e[i].sample)real++}
 var lb=+g(K_B)||0,old=!lb||Date.now()-lb>=7*DAY;
 var n=document.getElementById('hxNudge');
 if(real>=3&&old){
  if(!n&&main){n=box('hxNudge');n.appendChild(document.createElement('div'));n.appendChild(btn('Back up now',backup));main.insertBefore(n,main.firstChild)}
  if(n)n.firstChild.textContent=lb?'Your last backup was '+ago(lb)+'. Save one so a phone reset cannot erase your journal.':'You have not backed up yet. Save a backup so a phone reset cannot erase your journal.';
 }else if(n){n.remove()}
 var anchor=document.getElementById('backup'),info=document.getElementById('hxInfo');
 if(anchor&&anchor.parentElement){
  if(!info){info=box('hxInfo');anchor.parentElement.insertAdjacentElement('afterend',info)}
  info.textContent=lb?'Last backup: '+ago(lb)+'.':'No backup saved yet.';
  if(g(K_P)){info.appendChild(document.createElement('br'));info.appendChild(btn('Undo last restore',undo))}
 }
}
var _ra=window.renderAll;
window.renderAll=function(){var r=_ra.apply(this,arguments);try{hx()}catch(e){}return r};
var bk=document.getElementById('backup');if(bk)bk.onclick=backup;
var rs=document.getElementById('restore');if(rs)rs.onchange=restore;
var ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if(ios&&!standalone&&!g(K_I)){
 var m=document.querySelector('main');
 if(m){var h=box('hxIos');h.textContent='On iPhone: tap Share, then Add to Home Screen. Entries logged in this Safari tab will not carry over to the Home Screen app.';h.appendChild(btn('Got it',function(){put(K_I,'1');h.remove()}));m.insertBefore(h,m.firstChild)}
}
hx();
})();
