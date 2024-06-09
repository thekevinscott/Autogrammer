/**
 * Load content into page without a whole page reload
 * @param {string} href URL to route to
 * @param {boolean} pushState whether to call history.pushState or not
 */
const cache = new Map();
const getDocument = (text) => (new window.DOMParser()).parseFromString(text, "text/xml");
// cache.set(document.location.pathname, getDocument(document.body.textContent));
const load = async (href) => {
  if (!cache.has(href) && true) {
    const response = await fetch(href);
    // cache.set(href, getDocument(await response.text()));
    cache.set(href, await response.text());
  }
  return cache.get(href);
};
const loadAndPopulate = async (href, pushState) => {
  const container = $('#container', document);
  if (!container) {
    throw new Error('No main container found');
  }
  try {
    const d = await load(href);
    const loadedDoc = getDocument(d);
    const nextTitle = loadedDoc.title || '';
    const nextBodyContainer = $('#container', loadedDoc);
    if (nextBodyContainer === null) {
      document.querySelector('html').innerHTML = d;
    } else {
      $('#container', document).innerHTML = (nextBodyContainer && nextBodyContainer.innerHTML) || '';
    }
    if (pushState) {
      history.pushState({}, nextTitle, href);
    }
    $('#container').focus();
    window.scrollTo(0, 0);
  } catch (err) {
    console.log('err!');
    debugger;
    document.location.href = href;
  }
};

const $ = (sel, con = document) => con.querySelector(sel);

/**
 * Search for a parent anchor tag outside a clicked event target
 *
 * @param {HTMLElement} el the clicked event target.
 * @param {number} maxNests max number of levels to go up.
 * @returns the anchor tag or null
 */
const findAnchorTag = (el, maxNests = 3) => {
  for (let i = maxNests; el && i > 0; --i, el = el.parentNode) {
    if (el.nodeName === 'A') {
      return el;
    }
  }
  return null;
}

window.addEventListener('click', function (evt) {
  let baseUrl = $('meta[name="x-base-url"]')?.getAttribute('content') || '/';
  const el = findAnchorTag(evt.target);
  const href = el?.getAttribute('href');
  if (el && href) {
    if (
      href.startsWith('#') ||
      el.getAttribute('target') === '_blank' ||
      /\.\w+$/.test(href)
    ) {
      // eleventy urls in this configuration do not have extensions like .html
      // if they have, or if target _blank is set, or they are a hash link,
      // then do nothing.
      return;
    }
    // if the URL starts with the base url, do the SPA handling
    if (href.startsWith(baseUrl)) {
      evt.preventDefault();
      loadAndPopulate(href, true);
    }
  }
});

window.addEventListener('popstate', function (e) {
  loadAndPopulate(document.location.pathname, false);
});
