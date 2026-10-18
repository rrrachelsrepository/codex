const observer=new IntersectionObserver((entries)=>{
  entries.forEach((entry)=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target)}});
},{threshold:.08});

document.querySelectorAll('.case-title,.section-head,.intro-statement,.kol-title,.photo-title,.about-main').forEach((el)=>{
  el.style.opacity='0';el.style.transform='translateY(24px)';el.style.transition='opacity .7s ease, transform .7s ease';observer.observe(el);
});

document.head.insertAdjacentHTML('beforeend','<style>.in-view{opacity:1!important;transform:none!important}</style>');

const workIndex=document.querySelector('.work-index');
const kol=document.querySelector('#kol');
const limited=document.querySelector('#limited');
const bange=document.querySelector('#bange');
if(workIndex&&kol&&limited&&bange){
  workIndex.insertAdjacentElement('afterend',bange);
  workIndex.insertAdjacentElement('afterend',limited);
  workIndex.insertAdjacentElement('afterend',kol);
}

document.querySelectorAll('.bange-fold').forEach((fold)=>{
  fold.addEventListener('toggle',()=>{
    const label=fold.querySelector('summary b');
    label.textContent=fold.open?'CLOSE MAP ↑':'OPEN MAP ↓';
  });
});

document.querySelectorAll('[data-limited-stack]').forEach((stack)=>{
  const shots=[...stack.querySelectorAll('[data-shot]')];
  const switches=[...stack.querySelectorAll('[data-switch]')];
  const show=(index,scroll=false)=>{
    shots.forEach((shot,i)=>shot.classList.toggle('is-active',i===index));
    switches.forEach((button,i)=>button.classList.toggle('is-active',i===index));
    if(scroll&&window.matchMedia('(max-width:600px)').matches){
      stack.scrollTo({left:shots[index].offsetLeft,behavior:'smooth'});
    }
  };
  shots.forEach((shot)=>shot.addEventListener('click',()=>show(Number(shot.dataset.shot))));
  switches.forEach((button)=>button.addEventListener('click',()=>show(Number(button.dataset.switch),true)));
  let scrollFrame=0;
  stack.addEventListener('scroll',()=>{
    if(!window.matchMedia('(max-width:600px)').matches)return;
    cancelAnimationFrame(scrollFrame);
    scrollFrame=requestAnimationFrame(()=>{
      const centre=stack.scrollLeft+stack.clientWidth/2;
      let nearest=0;
      let distance=Infinity;
      shots.forEach((shot,index)=>{
        const shotCentre=shot.offsetLeft+shot.offsetWidth/2;
        const nextDistance=Math.abs(shotCentre-centre);
        if(nextDistance<distance){distance=nextDistance;nearest=index}
      });
      show(nearest);
    });
  },{passive:true});
  show(0);
});

document.querySelectorAll('.gallery-frame,.thread-photo').forEach((frame)=>{
  frame.addEventListener('click',()=>{
    const wasFocused=frame.classList.contains('is-focused');
    document.querySelectorAll('.gallery-frame.is-focused,.thread-photo.is-focused').forEach((item)=>item.classList.remove('is-focused'));
    frame.classList.toggle('is-focused',!wasFocused);
  });
});

const photoThread=document.querySelector('.photo-thread');
if(photoThread){
  const lineLayer=photoThread.querySelector('.thread-lines');
  const linePaths=[...lineLayer.querySelectorAll('path')];
  const cards=[...photoThread.querySelectorAll('.thread-photo')];
  const personFrame=photoThread.querySelector('.thread-person');
  const personImage=personFrame.querySelector('img');

  const drawThreadLines=()=>{
    const stage=photoThread.getBoundingClientRect();
    const person=personFrame.getBoundingClientRect();
    if(!stage.width||!stage.height||!person.width||!person.height)return;

    const naturalRatio=(personImage.naturalWidth&&personImage.naturalHeight)
      ? personImage.naturalWidth/personImage.naturalHeight
      : 2/3;
    const frameRatio=person.width/person.height;
    let renderedWidth=person.width;
    let renderedHeight=renderedWidth/naturalRatio;
    if(frameRatio>naturalRatio){
      renderedHeight=person.height;
      renderedWidth=renderedHeight*naturalRatio;
    }
    const imageLeft=person.left-stage.left+(person.width-renderedWidth)/2;
    const imageTop=person.top-stage.top+(person.height-renderedHeight);
    const palmX=imageLeft+renderedWidth*.176;
    const palmY=imageTop+renderedHeight*.145;

    lineLayer.setAttribute('viewBox',`0 0 ${stage.width} ${stage.height}`);
    lineLayer.setAttribute('preserveAspectRatio','none');

    cards.forEach((card,index)=>{
      const rect=card.getBoundingClientRect();
      const endX=rect.left-stage.left+rect.width/2;
      const endY=rect.top-stage.top+rect.height/2;
      const dx=endX-palmX;
      const dy=endY-palmY;
      const direction=dy<0?-1:1;
      const sweep=direction*Math.min(stage.height*.055,Math.abs(dx)*.04+Math.abs(dy)*.045);
      const lane=((index%4)-1.5)*stage.height*.004;
      const c1x=palmX+dx*.22;
      const c1y=palmY+dy*.025+sweep*.32+lane;
      const c2x=endX-dx*.28;
      const c2y=endY-dy*.22+sweep*.26-lane;
      const path=linePaths[index];
      path.setAttribute('pathLength','1');
      path.style.setProperty('--line-index',index);
      path.setAttribute('d',`M ${palmX.toFixed(1)} ${palmY.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`);
    });
  };

  personImage.addEventListener('load',drawThreadLines,{once:true});
  window.addEventListener('load',drawThreadLines,{once:true});
  window.addEventListener('resize',drawThreadLines,{passive:true});
  if('ResizeObserver'in window)new ResizeObserver(drawThreadLines).observe(photoThread);
  const threadObserver=new IntersectionObserver((entries)=>{
    if(entries.some((entry)=>entry.isIntersecting)){
      photoThread.classList.add('is-drawn');
      threadObserver.disconnect();
    }
  },{threshold:.16});
  threadObserver.observe(photoThread);
  requestAnimationFrame(drawThreadLines);
}
