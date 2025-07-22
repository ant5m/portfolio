  document.addEventListener('DOMContentLoaded', () => {
    const texts = ['Anthony', 'First Gen', 'Hispanic'];
    const ul = document.querySelector('.list-of-me ul');
    // Start with a single empty <li>
    ul.innerHTML = '<li></li>';
    const li = ul.querySelector('li');
    
    let textIndex = 0, charIndex = 0;
    const typingDelay  = 200;  // ms per character
    const erasingDelay = 100;   // ms per character erase
    const pauseDelay   = 2000; // ms after full word

    function type() {
      if (charIndex < texts[textIndex].length) {
        li.textContent += texts[textIndex][charIndex++];
        setTimeout(type, typingDelay);
      } else {
        setTimeout(erase, pauseDelay);
      }
    }

    function erase() {
      if (charIndex > 0) {
        li.textContent = texts[textIndex].slice(0, --charIndex);
        setTimeout(erase, erasingDelay);
      } else {
        textIndex = (textIndex + 1) % texts.length;
        setTimeout(type, typingDelay);
      }
    }

    type();
  });


 const redTween = gsap.to(".box-1", {
      x: 130,
      y: 130,
      duration: 2,
      ease: "fast",
      scrollTrigger: {
        trigger: ".box-1",
        containerAnimation: scrollTween,
        start: "left ",
        toggleActions: "play pause pause reset"
      }
    });

