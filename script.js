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

const footer = createElement('footer', 'footer');
const counter = createElement('p', 'footer__counter');
footer.append(counter);

document.body.append(header, main, footer);