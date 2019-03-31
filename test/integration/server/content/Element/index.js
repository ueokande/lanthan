window.onkeydown = (e) => {
  'use strict';

  let li = document.createElement('li');
  li.textContent = e.key;
  let ol = document.querySelector('ol');
  ol.appendChild(li);
};
