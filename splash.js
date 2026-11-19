(function(){
try{
if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;
if(sessionStorage.getItem('tgl.splash'))return;
sessionStorage.setItem('tgl.splash','1');
}catch(e){}
var css='#tglSplash{position:fixed;inset:0;z-index:99999;background:#0b0d12;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;opacity:1;transition:opacity .45s ease;-webkit-tap-highlight-color:transparent}'
+'#tglSplash.out{opacity:0;pointer-events:none}'
+'#tglSplash svg{width:150px;height:150px;overflow:visible}'
+'#tglSplash .band{transform-box:fill-box;transform-origin:center;transform:scaleX(0);animation:tglBand .6s cubic-bezier(.2,.8,.2,1) forwards}'
+'#tglSplash .b2{animation-delay:.12s}'
+'#tglSplash .ln{stroke-dasharray:1;stroke-dashoffset:1;animation:tglDraw .9s cubic-bezier(.4,0,.2,1) .4s forwards}'
+'#tglSplash .dot{transform-box:fill-box;transform-origin:center;transform:scale(0);animation:tglPop .45s cubic-bezier(.3,1.6,.5,1) 1.2s forwards}'
+'#tglSplash .ring{transform-box:fill-box;transform-origin:center;opacity:0;animation:tglRing .9s ease-out 1.25s forwards}'
+'#tglSplash .wm{font:600 22px -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,sans-serif;color:#e8eaed;letter-spacing:.22em;opacity:0;animation:tglWm .8s ease 1.2s forwards}'
+'#tglSplash .wm i{color:#f2c14e;font-style:normal}'
+'@keyframes tglBand{to{transform:scaleX(1)}}'
+'@keyframes tglDraw{to{stroke-dashoffset:0}}'
+'@keyframes tglPop{to{transform:scale(1)}}'
+'@keyframes tglRing{0%{opacity:.7;transform:scale(1)}100%{opacity:0;transform:scale(4)}}'
+'@keyframes tglWm{to{opacity:1;letter-spacing:.06em}}';
var st=document.createElement('style');st.textContent=css;document.documentElement.appendChild(st);
var d=document.createElement('div');d.id='tglSplash';d.setAttribute('aria-hidden','true');
d.innerHTML='<svg viewBox="0 0 180 180"><rect class="band" x="14" y="34" width="152" height="28" rx="6" fill="#f2c14e" fill-opacity=".22"/><rect class="band b2" x="14" y="118" width="152" height="28" rx="6" fill="#3fb8a5" fill-opacity=".22"/><path class="ln" pathLength="1" d="M22 132 L62 102 L90 116 L124 70 L158 48" fill="none" stroke="#f2c14e" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle class="ring" cx="158" cy="48" r="7" fill="none" stroke="#f2c14e" stroke-width="2"/><circle class="dot" cx="158" cy="48" r="8" fill="#f2c14e"/></svg><div class="wm">TOP G LEVELS<i>.</i></div>';
document.documentElement.appendChild(d);
var gone=false;
function bye(){if(gone)return;gone=true;d.classList.add('out');setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);if(st.parentNode)st.parentNode.removeChild(st)},520)}
d.addEventListener('click',bye);
setTimeout(bye,2600);
})();
