import i18next from 'i18next';
import * as yup from 'yup';
import _ from 'lodash';
import watcher from './view.js';
import resources from './text/resources.js';
import parser from './parser.js';

/* global document */
/* eslint no-undef: "error" */

const FormData = require('form-data');
const axios = require('axios').default;

const validate = (url, feeds) => {
  const schema = yup.string().required().url().notOneOf(feeds);
  return schema.validate(url, { abortEarly: false });
};
const proxy = 'https://allorigins.hexlet.app/raw?url=';
const getProxiedUrl = (url) => `${proxy}${url}`;

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
        url: 'errors.urlError',
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
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    main: document.querySelector('#modal'),
    title: document.querySelector('#modal .modal-title'),
    body: document.querySelector('#modal .modal-body'),
    redirect: document.querySelector('#modal a'),
  };

  const state = {
    form: {
      feeds: [],
      rss: {},
      errors: null,
      axiosError: null,
    },
    feeds: [],
    posts: [],
  };

  const watchedState = watcher(elements, i18n)(state);

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const url = form.get('url');
    validate(url, watchedState.form.feeds)
      .then((validUrl) => {
        axios.get(getProxiedUrl(validUrl))
          .then((response) => {
            watchedState.form.errors = null;
            watchedState.form.feeds.push(validUrl);
            const { feed, posts } = parser(response.data);
            const id = _.uniqueId();
            watchedState.feeds.push({ ...feed, id, link: validUrl });
            posts.forEach((post) => watchedState.posts.unshift({ ...post, id }));
          })
          .catch(() => {
            watchedState.form.errors = i18n.t('errors.rssError');
          });
      })
      .catch((err) => {
        watchedState.form.errors = i18n.t(err.errors);
      });
  });
};
