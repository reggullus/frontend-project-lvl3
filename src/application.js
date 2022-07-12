import i18next from 'i18next';
import * as yup from 'yup';
import { watcher } from './view.js';
import resources from './text/resources.js';
/* global document */
/* eslint no-undef: "error" */

const FormData = require('form-data');

const validate = (url, feeds) => {
  const schema = yup.string().required().url().notOneOf(feeds);
  return schema.validate(url, { abortEarly: false });
};
export default () => {
  const defaultLanguage = 'ru';
  const i18n = i18next.createInstance();

  i18n.init({
    lng: defaultLanguage,
    debug: true,
    resources,
  }).then(() => {
    yup.setLocale({
      string: {
        url: 'errors.unvalidUrl',
      },
      mixed: {
        notOneOf: 'errors.alreadyExist',
      },
    });
  });
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

  const watchedState = watcher(elements, i18n)(state);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const url = form.get('url');
    validate(url, watchedState.form.feeds)
      .then((data) => {
        watchedState.form.feeds.push(data);
        watchedState.form.errors = null;
      })
      .catch((err) => {
        watchedState.form.errors = i18n.t(err.errors);
      });
  });
};
