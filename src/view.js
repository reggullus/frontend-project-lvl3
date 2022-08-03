import onChange from 'on-change';

const renderFeeds = (elements, i18n, value) => {
  const el = elements;
  const header = document.createElement('h2');
  header.textContent = i18n.t('feeds');

  const feedList = document.createElement('ul');
  feedList.classList.add('list-group', 'mb-5');

  value.forEach((item) => {
    const feed = document.createElement('li');
    feed.classList.add('list-group-item');

    const feedHeader = document.createElement('h3');
    feedHeader.textContent = item.title;

    const feedDescription = document.createElement('p');
    feedDescription.textContent = item.description;

    feed.append(feedHeader, feedDescription);
    feedList.prepend(feed);
  });

  el.feeds.innerHTML = '';
  el.feeds.append(header, feedList);
};

const renderModalWindow = (elements, currentPost) => {
  const el = elements;
  const titles = elements.posts.querySelectorAll('a');
  titles.forEach((title) => {
    if (title.href !== currentPost.link) {
      return;
    }
    title.classList.remove('fw-bold');
    title.classList.add('fw-normal');
    el.title.textContent = currentPost.title;
    el.body.textContent = currentPost.description;
    el.redirect.href = currentPost.link;
  });
};

const renderPosts = (elements, i18n, value, state) => {
  const el = elements;
  const header = document.createElement('h2');
  header.textContent = i18n.t('posts');

  const fragment = document.createDocumentFragment();

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group');

  value.forEach((item) => {
    const { title, link, id } = item;

    const post = document.createElement('li');
    post.classList.add('list-group-item', 'd-flex');
    post.classList.add('justify-content-between', 'align-items-start');

    const titleEl = document.createElement('a');
    titleEl.textContent = title;
    const textClass = state.alreadyReadPosts.includes(item) ? 'fw-normal' : 'fw-bold';
    titleEl.classList.add(textClass);
    titleEl.setAttribute('href', link);
    titleEl.setAttribute('target', '_blank');
    titleEl.setAttribute('rel', 'noopener noreferrer');

    const watchButton = document.createElement('button');
    watchButton.textContent = i18n.t('inspect');
    watchButton.classList.add('btn', 'btn-primary', 'btn-sm');
    watchButton.setAttribute('type', 'button');
    watchButton.dataset.id = id;
    watchButton.dataset.bsToggle = 'modal';
    watchButton.dataset.bsTarget = '#modal';

    post.append(titleEl, watchButton);
    fragment.prepend(post);
  });

  el.posts.innerHTML = '';
  postsList.append(fragment);
  elements.posts.append(header, postsList);
};

const renderErrorss = (elements, i18n, value) => {
  const el = elements;
  switch (value) {
    case null:
      break;
    case 'errors.urlError':
      el.feedback.textContent = i18n.t(value);
      break;
    case 'errors.alreadyExist':
      el.feedback.textContent = i18n.t(value);
      break;
    case 'AxiosError':
      el.feedback.textContent = i18n.t('errors.networkError');
      break;
    case 'Error':
      el.feedback.textContent = i18n.t('errors.rssError');
      break;
    default:
      el.feedback.textContent = i18n.t('errors.somethingWrong');
      break;
  }
};

const handleProcessSubmit = (elements) => {
  const el = elements;
  el.form.reset();
  el.input.focus();
  el.button.disabled = false;
};

const renderStatus = (elements, i18n, value) => {
  const el = elements;
  switch (value) {
    case null:
      break;
    case 'loading':
      el.button.disabled = true;
      el.feedback.classList.remove('text-danger');
      el.feedback.classList.remove('text-success');
      el.feedback.classList.add('text-secondary');
      el.feedback.textContent = i18n.t(value);
      break;
    case 'success':
      el.input.classList.remove('is-invalid');
      el.feedback.classList.replace('text-secondary', 'text-success');
      el.feedback.textContent = i18n.t(value);
      break;
    case 'failed':
      el.input.classList.add('is-invalid');
      el.feedback.classList.remove('text-success');
      el.feedback.classList.remove('text-secondary');
      el.feedback.classList.add('text-danger');
      el.button.disabled = false;
      break;
    default:
      break;
  }
};

export default (elements, i18n, state) => {
  const processFormHandler = onChange(state, (path, value) => {
    switch (path) {
      case 'form.process':
        renderStatus(elements, i18n, value);
        break;

      case 'links':
        handleProcessSubmit(elements);
        break;

      case 'form.errors':
        renderErrorss(elements, i18n, value);
        break;

      case 'feeds':
        renderFeeds(elements, i18n, value);
        break;

      case 'posts':
        renderPosts(elements, i18n, value, state);
        break;

      case 'currentPosts':
        renderModalWindow(elements, value);
        break;

      default:
        break;
    }
  });
  return processFormHandler;
};
