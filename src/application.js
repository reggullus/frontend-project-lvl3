import i18next from 'i18next';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import watcher from './view.js';
import resources from './text/resources.js';
import parser from './parser.js';

const validate = (url, feeds) => {
  const schema = yup.string().required().url().notOneOf(feeds);
  return schema.validate(url, { abortEarly: false });
};

const getProxiedUrl = (url) => {
  const proxy = 'https://allorigins.hexlet.app';
  const params = { disableCache: true, url };

  const proxyUrl = new URL('/get', proxy);
  const searchParams = new URLSearchParams(params);
  proxyUrl.search = searchParams;

  return proxyUrl.toString();
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
      process: null,
      errors: null,
      axiosError: null,
    },
    links: [],
    feeds: [],
    posts: [],
  };

  const watchedState = watcher(elements, i18n, state);

  const delay = 5000;

  const updatePosts = () => {
    const { feeds, posts } = state;
    const promis = feeds.map((feed) => {
      const url = getProxiedUrl(feed.link);
      const getNewPosts = axios.get(url).then((response) => {
        const data = parser(response.data.contents);
        const currentPosts = data.posts.map((post) => ({ ...post, id: feed.id }));
        const oldPosts = posts.filter((post) => post.id === feed.id);
        const newPosts = _.differenceWith(currentPosts, oldPosts, _.isEqual);
        return newPosts;
      });
      return getNewPosts;
    });

    Promise.all(promis).then((newPosts) => {
      if (newPosts[0] && newPosts[0].length > 0) {
        newPosts[0].forEach((post) => watchedState.posts.push(post));
      }
    })
      .catch((err) => {
        watchedState.form.process = 'failed';
        watchedState.form.process = null;
        watchedState.form.errors = err.name;
        watchedState.form.errors = null;
      })
      .finally(() => {
        setTimeout(updatePosts, delay);
      });
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.form.process = 'loading';
    watchedState.form.process = null;
    const form = new FormData(e.target);
    const url = form.get('url');
    validate(url, watchedState.links)
      .then((validUrl) => {
        axios.get(getProxiedUrl(validUrl))
          .then((response) => {
            const { feed, posts } = parser(response.data.contents);
            watchedState.links.push(validUrl);
            watchedState.form.process = 'success';
            watchedState.form.process = null;
            const id = _.uniqueId();
            watchedState.feeds.push({ ...feed, id, link: validUrl });
            posts.forEach((post) => watchedState.posts.push({ ...post, id }));
          })
          .catch((err) => {
            watchedState.form.process = 'failed';
            watchedState.form.process = null;
            watchedState.form.errors = err.name;
            watchedState.form.errors = null;
          });
      })
      .catch((err) => {
        watchedState.form.process = 'failed';
        watchedState.form.process = null;
        watchedState.form.errors = err.errors.join();
        watchedState.form.errors = null;
      });
  });
  updatePosts();
};
