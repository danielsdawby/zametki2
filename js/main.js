document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
});

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData('text/plain', event.target.id);
}

function drop(event) {
    event.preventDefault();
    const cardId = event.dataTransfer.getData('text/plain');
    const card = document.getElementById(cardId);
    const column = event.target;

    if (column.childElementCount < getMaxCardLimit(column)) {
        column.appendChild(card);

        if (column.id === 'column1' && checkColumn1Full()) {
            lockColumn1();
        }

        updateLocalStorage();
        checkCardStatus(card);
    }
}

function getMaxCardLimit(column) {
    switch (column.id) {
        case 'column1':
            return 3;
        case 'column2':
            return 5;
        default:
            return Infinity;
    }
}

function loadSavedData() {
    const column1 = document.getElementById('column1');
    const column2 = document.getElementById('column2');
    const column3 = document.getElementById('column3');

    const cards1 = JSON.parse(localStorage.getItem('column1')) || [];
    const cards2 = JSON.parse(localStorage.getItem('column2')) || [];
    const cards3 = JSON.parse(localStorage.getItem('column3')) || [];

    cards1.forEach(card => createCard(column1, card));
    cards2.forEach(card => createCard(column2, card));
    cards3.forEach(card => createCard(column3, card));

    if (checkColumn1Full()) {
        lockColumn1();
    }
}

function createCard(column, cardData) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3>${cardData.title}</h3><ul>${cardData.items.map(item => `<li>${item}</li>`).join('')}</ul>`;
    card.setAttribute('draggable', true);
    card.setAttribute('ondragstart', 'drag(event)');
    card.onclick = () => toggleItem(card);

    column.appendChild(card);
}

function toggleItem(card) {
    const items = card.querySelectorAll('li');
    const totalItems = items.length;
    const checkedItems = Array.from(items).filter(item => item.classList.contains('checked')).length;

    if (checkedItems / totalItems > 0.5) {
        moveCard(card);
    } else {
        items[checkedItems].classList.toggle('checked');
        updateLocalStorage();
    }

    if (checkedItems === totalItems) {
        finishCard(card);
    }
}

function finishCard(card) {
    const now = new Date();
    const time = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    const timeDiv = document.createElement('div');
    timeDiv.innerHTML = `<p>Выполнено ${time}</p>`;
    card.appendChild(timeDiv);
    moveCard(card);
}

function moveCard(card) {
    const column = card.parentNode;
    const nextColumn = column.nextElementSibling;

    if (nextColumn && nextColumn.childElementCount < getMaxCardLimit(nextColumn)) {
        nextColumn.appendChild(card);
        updateLocalStorage();
        checkCardStatus(card);
    }
}

function checkCardStatus(card) {
    const column1 = document.getElementById('column1');
    const column2 = document.getElementById('column2');
    const column3 = document.getElementById('column3');

    const cards1 = Array.from(column1.children);
    const cards2 = Array.from(column2.children);

    if (column1.childElementCount > 0 && cards1.some(card => calculateCheckedPercentage(card) > 50)) {
        lockColumn1();
    }

    if (column2.childElementCount === 5 && cards2.some(card => calculateCheckedPercentage(card) === 100)) {
        unlockColumn1();
    }
}

function calculateCheckedPercentage(card) {
    const items = card.querySelectorAll('li');
    const totalItems = items.length;
    const checkedItems = Array.from(items).filter(item => item.classList.contains('checked')).length;

    return (checkedItems / totalItems) * 100;
}

function lockColumn1() {
    const column1 = document.getElementById('column1');
    column1.setAttribute('draggable', false);
    column1.setAttribute('ondragstart', '');
}

function unlockColumn1() {
    const column1 = document.getElementById('column1');
    column1.setAttribute('draggable', true);
    column1.setAttribute('ondragstart', 'drag(event)');
}

function checkColumn1Full() {
    const column1 = document.getElementById('column1');
    return column1.childElementCount === 3;
}

function updateLocalStorage() {
    const column1 = document.getElementById('column1');
    const column2 = document.getElementById('column2');
    const column3 = document.getElementById('column3');

    const cards1 = Array.from(column1.children).map(card => getCardData(card));
    const cards2 = Array.from(column2.children).map(card => getCardData(card));
    const cards3 = Array.from(column3.children).map(card => getCardData(card));

    localStorage.setItem('column1', JSON.stringify(cards1));
    localStorage.setItem('column2', JSON.stringify(cards2));
    localStorage.setItem('column3', JSON.stringify(cards3));
}

function getCardData(card) {
    const title = card.querySelector('h3').textContent;
    const items = Array.from(card.querySelectorAll('li')).map(item => item.textContent);
    return { title, items };
}

function addCard(columnId) {
    const column = document.getElementById(columnId);
    if (column.childElementCount < getMaxCardLimit(column)) {
        const newCard = {
            title: 'Новая карточка',
            items: ['Пункт 1', 'Пункт 2', 'Пункт 3']
        };
        createCard(column, newCard);
        updateLocalStorage();
    }
}

function createCard(column, cardData) {
    if (cardData.items.length < 3 || cardData.items.length > 5) {
        console.error('Количество пунктов списка должно быть от 3 до 5.');
        return;
    }

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h3>${cardData.title}</h3><ul>${cardData.items.map(item => `<li>${item}</li>`).join('')}</ul>`;
    card.setAttribute('draggable', true);
    card.setAttribute('ondragstart', 'drag(event)');
    card.onclick = () => toggleItem(card);

    column.appendChild(card);
}
