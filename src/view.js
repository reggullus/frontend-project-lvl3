import onChange from 'on-change';

const axios = require('axios').default;

const renderErrors = (elements, value) => {
  elements.input.classList.remove('is-invalid');
  if (value === null) return;
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.replace('text-success', 'text-danger');
  elements.feedback.textContent = value;
};

const handleProcessSubmit = (elements, i18n, value) => {
  elements.button.disabled = true;

  axios.get(value)
    .then((response) => {
      const parser = new DOMParser();
      console.log(response)
      console.log(parser.parseFromString(response.data, 'text/html'));
    })
    .catch((error) => {
      console.log(error);
    });

  elements.feedback.classList.replace('text-danger', 'text-success');
  elements.feedback.textContent = i18n.t('success');
  elements.form.reset();
  elements.input.focus();
  elements.button.disabled = false;
};

const watcher = (elements, i18n) => (state) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.feeds':
      handleProcessSubmit(elements, i18n, value);
      break;

    case 'form.errors':
      renderErrors(elements, value);
      break;

    default:
      break;
  }
});

export {
  watcher,
};
