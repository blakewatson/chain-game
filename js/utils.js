export const qs = (selector, el = document) => el.querySelector(selector);

export const qsa = (selector, el = document) => Array.from(el.querySelectorAll(selector));

export const off = (selectorOrElement, event, handler) => {
  let el = selectorOrElement;

  if (typeof selectorOrElement === 'string') {
    el = qs(selectorOrElement);
  }

  el.removeEventListener(event, handler);
};

export const on = (selectorOrElement, event, handler) => {
  let el = selectorOrElement;

  if (typeof selectorOrElement === 'string') {
    el = qs(selectorOrElement);
  }

  el.addEventListener(event, handler);
};