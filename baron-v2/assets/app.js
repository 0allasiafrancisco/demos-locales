(() => {
  const checks = [...document.querySelectorAll('.service-row input')];
  const summary = document.querySelector('#summary');
  const mobileCount = document.querySelector('#mobile-count');
  const daysEl = document.querySelector('#days');
  const slotsEl = document.querySelector('#slots');
  const note = document.querySelector('#form-note');
  const storeKey = 'baron-demo-booking-v1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch (_) {}
  checks.forEach(input => { input.checked = (saved.services || []).includes(input.value); });
  let chosenDay = saved.day || '';
  let chosenSlot = saved.slot || '';

  const money = n => '$ ' + Number(n).toLocaleString('es-AR');
  function updateSummary() {
    const selected = checks.filter(i => i.checked);
    const total = selected.reduce((sum, i) => sum + Number(i.dataset.price), 0);
    summary.textContent = selected.length ? `${selected.map(i => i.value).join(' + ')} · ${money(total)}` : 'Elegí uno o más servicios arriba.';
    mobileCount.textContent = selected.length ? `${selected.length} servicio${selected.length === 1 ? '' : 's'} · ${money(total)}` : 'Elegí un servicio';
    save();
  }
  function save() {
    localStorage.setItem(storeKey, JSON.stringify({services: checks.filter(i => i.checked).map(i => i.value), day: chosenDay, slot: chosenSlot, name: document.querySelector('#client-name').value}));
  }
  checks.forEach(i => i.addEventListener('change', updateSummary));
  document.querySelector('#client-name').value = saved.name || '';
  document.querySelector('#client-name').addEventListener('input', save);
  updateSummary();

  const dayNames = ['dom','lun','mar','mié','jue','vie','sáb'];
  const monthNames = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const dateAt = offset => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+offset); return d; };
  for (let i=0;i<7;i++) {
    const date = dateAt(i);
    const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const button = document.createElement('button'); button.type='button'; button.className='day-choice'; button.dataset.day=key;
    button.innerHTML = `<span class="dow">${i===0?'hoy':dayNames[date.getDay()]}</span><span class="date">${date.getDate()} ${monthNames[date.getMonth()]}</span>`;
    button.addEventListener('click', () => { chosenDay=key; chosenSlot=''; render(); save(); });
    daysEl.append(button);
  }
  function render() {
    const date = chosenDay ? new Date(`${chosenDay}T12:00:00`) : null;
    document.querySelectorAll('.day-choice').forEach(b=>b.classList.toggle('selected',b.dataset.day===chosenDay));
    slotsEl.replaceChildren();
    if (!chosenDay) { slotsEl.innerHTML='<span class="legend">Elegí un día para ver los horarios.</span>'; return; }
    for(let minutes=600;minutes<=1200;minutes+=30){
      const hour=String(Math.floor(minutes/60)).padStart(2,'0'), min=String(minutes%60).padStart(2,'0'), value=`${hour}:${min}`;
      const seed=Number(chosenDay.replaceAll('-',''))+minutes;
      const taken=(seed*17+Math.floor(seed/13)*7)%11<2;
      const button=document.createElement('button'); button.type='button'; button.textContent=value; button.className='slot'+(taken?' taken':'')+(chosenSlot===value?' selected':'');
      if(taken){button.disabled=true;button.setAttribute('aria-label',`${value}, ocupado`)}else button.addEventListener('click',()=>{chosenSlot=value;render();save()});
      slotsEl.append(button);
    }
    if(date && date.toDateString()===new Date().toDateString()){
      const now=new Date(); [...slotsEl.children].forEach(button=>{if(button.textContent && button.textContent!=='Elegí un día para ver los horarios.'){const [h,m]=button.textContent.split(':').map(Number);if(h*60+m<=now.getHours()*60+now.getMinutes()){button.disabled=true;button.classList.add('taken')}}});
    }
  }
  if (!chosenDay || !document.querySelector(`[data-day="${chosenDay}"]`)) chosenDay=document.querySelector('.day-choice').dataset.day;
  render();
  document.querySelector('#book').addEventListener('click',()=>{
    const services=checks.filter(i=>i.checked).map(i=>i.value);
    const name=document.querySelector('#client-name').value.trim();
    if(!services.length||!chosenDay||!chosenSlot||!name){note.textContent='Completá servicios, día, horario y nombre.';note.style.color='var(--accent)';return;}
    const [y,m,d]=chosenDay.split('-');
    const msg=`Hola, soy ${name}. Quiero pedir un turno en Baron para ${services.join(', ')} el ${d}/${m}/${y} a las ${chosenSlot}.`;
    window.open(`https://wa.me/5491152294475?text=${encodeURIComponent(msg)}`,'_blank','noopener');
    note.textContent='Se abrió WhatsApp para enviar tu pedido.';note.style.color='var(--muted)';save();
  });
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('motion-ready');
    document.querySelectorAll('.section,.gallery figure,.hero-copy,.hero-image,.service-row').forEach(el=>el.classList.add('reveal'));
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.08});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
    let ticking=false;
    const heroImage=document.querySelector('.hero-image img');
    addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{const rect=heroImage.getBoundingClientRect();const offset=Math.max(-18,Math.min(18,(innerHeight/2-rect.top-rect.height/2)*.035));heroImage.style.setProperty('--parallax-y',`${offset}px`);ticking=false})},{passive:true});
  }
})();
