/* Confirmed contact channels. Empty values stay hidden until supplied. */
(() => {
  const config = {
    email: 'operator@trl-expert.ru',
    phone: '',
    max: ''
  };
  // Tilda's native contact block may provide the same values without code editing.
  const source = document.querySelector('[data-trl-contact-source]');
  if (source) {
    for (const key of Object.keys(config)) {
      const field = source.querySelector(`[data-contact="${key}"]`);
      if (field) config[key] = field.textContent.trim();
    }
  }
  const channels = [
    {id:'email',label:'Написать на почту',caption:config.email,href:config.email ? 'mailto:'+config.email : ''},
    {id:'phone',label:'Позвонить',caption:config.phone,href:config.phone ? 'tel:'+config.phone.replace(/[^\d+]/g,'') : ''},
    {id:'max',label:'Написать в MAX',caption:'Открыть переписку',href:/^https:\/\/(?:www\.)?max\.ru\//i.test(config.max) ? config.max : ''}
  ].filter(channel => channel.href);
  const dialog = document.querySelector('#contact-dialog');
  if (!dialog) return;
  const options = dialog.querySelector('.contact-dialog-options');
  for (const channel of channels) {
    const a = document.createElement('a');
    a.className = 'contact-choice';
    a.href = channel.href;
    if (channel.id === 'max') {a.target='_blank';a.rel='noopener noreferrer';}
    const text = document.createElement('span');
    const label = document.createElement('b'); label.textContent=channel.label;
    const caption = document.createElement('small');caption.textContent=channel.caption;
    text.append(label,caption);
    const arrow=document.createElement('span');arrow.className='contact-arrow';arrow.ariaHidden='true';arrow.textContent='↗';
    a.append(text,arrow);options.append(a);
  }
  const note=dialog.querySelector('.contact-dialog-note');
  note.textContent=channels.length===1?'Откроется ваше почтовое приложение. Можно написать нам напрямую.':'Выберите удобный способ связи. Заявку заполнять не нужно.';
  let opener=null;
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href="#contacts"]');
    if (!link || link.closest('nav') || !channels.length || typeof dialog.showModal!=='function') return;
    event.preventDefault();opener=link;
    if (!dialog.open) dialog.showModal();
  });
  dialog.querySelector('.contact-dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const box=dialog.getBoundingClientRect();
    if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();
  });
  dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
})();
