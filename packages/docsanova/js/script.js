// nav.html
document.querySelectorAll('nav button').forEach((button) => {
  button.addEventListener('click', () => {
    const li = button.closest('li');
    if (li) {
      li.classList.toggle('open');
    }
  });
});
// page.html
const toggleToc = document.getElementById('toggle-toc');
const tocMobile = document.getElementById('toc-mobile');
toggleToc.addEventListener('click', () => {
  tocMobile.classList.toggle('open');
});
// head.html
const backToMainMenuButton = document.getElementById('back-to-main-menu');
backToMainMenuButton.addEventListener('click', () => {
  backToMainMenuButton.closest('main').classList.add('main-menu');
});
// head.html
docsearch({
  container: '#docsearch',
  appId: 'LQ7FIB4N3D',
  indexName: 'autogrammer',
  apiKey: 'eb51b2e714c17a48ecb3fbf2cc18841b',
});
// head.html
const hamburgerButton = document.getElementById('hamburger');
const hamburgerMenu = document.getElementById('hamburger-menu');
const closeHamburgerButton = document.getElementById('close-hamburger');
const hamburgerOverlay = document.getElementById('hamburger-menu-overlay');

function close() {
  hamburgerButton.setAttribute('aria-expanded', 'false');
  hamburgerMenu.classList.remove('open');
  backToMainMenuButton.closest('main').classList.remove('main-menu');
}

hamburgerButton.addEventListener('click', () => {
  if (hamburgerButton.getAttribute('aria-expanded') === 'false') {
    hamburgerButton.setAttribute('aria-expanded', 'true');
    hamburgerMenu.classList.add('open');
  } else {
    close();
  }
});

closeHamburgerButton.addEventListener('click', close);
hamburgerOverlay.addEventListener('click', close);

// aside.html
const aside = document.querySelector('aside#toc-desktop');
if (aside) {
  const headers = document.querySelectorAll("h2, h3");
  const anchors = aside.querySelectorAll('a');

  let currentlyActive = 0;
  anchors[0].classList.add('active');
  const detectPosition = () => {
    const headerPositions = [...headers].map((header) => header.getBoundingClientRect().top);
    for (let i = 0; i < headerPositions.length; i++) {
      const pos = headerPositions[i];
      if (pos > 0) {
        if (currentlyActive !== i) {
          anchors[currentlyActive].classList.remove('active');
          console.log('i', i)
          anchors[i].classList.add('active');
          currentlyActive = i;
        }
        break;
      }
    }
  }
  addEventListener("scroll", detectPosition);
  detectPosition();
}
