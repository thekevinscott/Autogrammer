const aside = document.querySelector('aside#toc');
if (aside) {
  // const article = document.querySelector('article#page-article');
  // const headers = document.querySelectorAll("h2, h3, h4");
  const headers = document.querySelectorAll("h2, h3");
  const anchors = aside.querySelectorAll('a');
  // console.log(headers, anchora)

  let currentlyActive = 0;
  anchors[0].classList.add('active');
  const detectPosition = () => {
    const headerPositions = [...headers].map((header) => header.getBoundingClientRect().top);
    // for (const anchor of anchors) { }
    // anchors[i].classList.remove('active');
    // for (let i = headerPositions.length - 1; i >= 0; i--) {
    for (let i = 0; i < headerPositions.length; i++) {
      const pos = headerPositions[i];
      const y = window.scrollY - pos;
      // then it is off the page
      if (i < 2) {
        console.log(i, headers[i], y)
      }
      if (y < 0) {
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
