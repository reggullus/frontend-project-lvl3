import i18next from 'i18next';
import * as yup from 'yup';
import _ from 'lodash';
import watcher from './view.js';
import resources from './text/resources.js';
import parser from './parser.js';

const FormData = require('form-data');
const axios = require('axios').default;

const validate = (url, feeds) => {
  const schema = yup.string().required().url().notOneOf(feeds);
  return schema.validate(url, { abortEarly: false });
};
const proxy = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
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
    modalFade: document.querySelector('#modal'),
    title: document.querySelector('#modal .modal-title'),
    body: document.querySelector('#modal .modal-body'),
    redirect: document.querySelector('#modal a'),
  };

  const state = {
    form: {
      status: '',
      rss: {},
      errors: null,
      axiosError: null,
    },
    links: [],
    feeds: [],
    posts: [],
  };

  const watchedState = watcher(elements, i18n)(state);

  const updatePosts = () => {
    const { feeds } = state;
    const { posts } = state;
    if (feeds.length === 0) {
      return setTimeout(updatePosts, 5000);
    }
    feeds.forEach((feed) => {
      const oldPosts = posts.filter((post) => post.id === feed.id);
      const url = getProxiedUrl(feed.link);
      axios.get(url)
        .then((response) => {
          const data = parser(response.data.contents);
          return data.posts.map((post) => ({ ...post, id: feed.id }));
        })
        .then((currentPosts) => _.differenceWith(currentPosts, oldPosts, _.isEqual))
        .then((newPosts) => {
          if (newPosts.length !== 0) {
            newPosts.forEach((post) => [post, ...watchedState.posts]);
          }
        })
        .catch(() => {
          watchedState.form.error = i18n.t('errors.networkError');
        });
    });
    return setTimeout(updatePosts, 5000);
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.status = i18n.t('loading');
    const form = new FormData(e.target);
    const url = form.get('url');
    validate(url, watchedState.links)
      .then((validUrl) => {
        updatePosts();
        axios.get(getProxiedUrl(validUrl))
          .then((response) => {
            watchedState.form.errors = null;
            watchedState.links.push(validUrl);
            const { feed, posts } = parser(response.data.contents);
            const id = _.uniqueId();
            watchedState.feeds.push({ ...feed, id, link: validUrl });
            posts.forEach((post) => watchedState.posts.push({ ...post, id }));
          })
          .catch((err) => {
            const axiosError = err.message === 'Network Error' ? i18n.t('errors.networkError') : i18n.t('errors.rssError');
            watchedState.form.errors = axiosError;
          });
      })
      .catch((err) => {
        watchedState.form.errors = i18n.t(err.errors);
      });
  });
};
