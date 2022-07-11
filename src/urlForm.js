import { watcher, validate } from './validator.js';
/* global document */
/* eslint no-undef: "error" */

const FormData = require('form-data');

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    button: document.querySelector('.h-100'),
    feedback: document.querySelector('.feedback'),
  };

  const state = {
    form: {
      feeds: [],
      errors: null,
    },
  };

  const watchedState = watcher(elements)(state);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const url = form.get('url');
    validate(url, watchedState.form.feeds)
      .then((data) => {
        watchedState.form.feeds.push(data);
        watchedState.form.errors = null;
      })
      .catch(() => {
        watchedState.form.errors = 'Ссылка должна быть валидным URL';
      });
  });
};
