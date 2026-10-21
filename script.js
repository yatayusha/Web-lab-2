'use strict';

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'style.css';
document.head.append(link);

function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
}

const header = createElement('header', 'header');
const pageTitle = createElement('h1', 'header__title', 'Мой ToDo-лист');
header.append(pageTitle);

const main = createElement('main', 'main');

const addSection = createElement('section', 'add-section');
const form = createElement('form', 'task-form');

const titleInput = createElement('input', 'input task-form-title');
titleInput.type = 'text';
titleInput.placeholder = 'Что нужно сделать?';
titleInput.required = true;
titleInput.maxLength = 100;
titleInput.setAttribute('aria-label', 'Название задачи');

const dateInput = createElement('input', 'input task-form__date');
dateInput.type = 'date';
dateInput.required = true;
dateInput.setAttribute('aria-label', 'Дата добавления задачи');

const addButton = createElement('button', 'button button--primary', 'Добавить');
addButton.type = 'submit';

form.append(titleInput, dateInput, addButton);
addSection.append(form);

const controls = createElement('section', 'controls');

const searchInput = createElement('input', 'input controls__search');
searchInput.type = 'search';
searchInput.placeholder = 'Поиск по названию';
searchInput.setAttribute('aria-label', 'Поиск по названию');

const filterSelect = createElement('select', 'input controls__filter');
filterSelect.setAttribute('aria-label', 'Фильтр по статусу');
const filterOptions = [
  ['all', 'Все задачи'],
  ['active', 'Невыполненные'],
  ['done', 'Выполненные'],
];
filterOptions.forEach(([value, text]) => {
  const option = createElement('option', '', text);
  option.value = value;
  filterSelect.append(option);
});

const sortButton = createElement('button', 'button', 'Сортировать по дате ↑');
sortButton.type = 'button';

controls.append(searchInput, filterSelect, sortButton);

const tasksSection = createElement('section', 'tasks-section');
const list = createElement('ul', 'task-list');
const emptyMessage = createElement('p', 'empty-message');
const dragHint = createElement('p', 'drag-hint');
tasksSection.append(list, emptyMessage, dragHint);

main.append(addSection, controls, tasksSection);

const footer = createElement('footer', 'footer');
const counter = createElement('p', 'footer__counter');
footer.append(counter);

document.body.append(header, main, footer);