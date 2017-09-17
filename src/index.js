var APP_ID = '2TJoxRA8nRK5jT1lGugMxsa3-gzGzoHsz';
var APP_KEY = '7dPjXJ329zPaOAbfssEeTzc0';

AV.init({
    appId: APP_ID,
    appKey: APP_KEY
});


var Vocabulary = AV.Object.extend('vocabulary');


const checkName = 'look';
bindEvent();
fetchList();

function bindEvent() {
    addEventListener('note', (e) => {
        e.target.innerHTML = e.target.dataset.note;
        setTimeout(() => e.target.innerHTML = checkName, 2000);
    })
    addEventListener('del', (e) => {
        var del = AV.Object.createWithoutData('vocabulary', e.target.dataset.objid);
        del.destroy().then(function(success) {
            e.target.parentElement.remove();
        }, function(error) {
            alert('error');
        });
    })

    addEventListener('resort', (e) => {
        const ul = e.target.parentElement.querySelector('ul');
        const items = [...ul.querySelectorAll('li')];
        items.sort(()=>{
            return Math.random() - 0.5 < 0 ? -1 : 1
        })
        ul.innerHTML = '';
        ul.append(...items)
    })
}

function addEventListener(className, func) {
    (function() {
        const map = {};
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains(className)) {
                func(e);
            }
        });
        return () => map[className] = func
    })()
}

function bindEdit(li) {

    setTimeout(() => li.focus(), 100)

    li.addEventListener('keydown', function(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            const [key, value] = e.target.innerHTML.split(' ');
            if (!key || !value) {
                alert('error');
                return;
            }

            var vocabularyData = new Vocabulary();
            vocabularyData.save({
                vocabulary: key,
                note: value,
                date: getDate(),
                timeStr: new Date().getTime()
            }).then((x) => {
                e.target.parentElement.querySelector('ul').append(createVocabulary([...e.target.innerHTML.split(' '), ...x.get('objectId')]))
                e.target.innerHTML = '';
            })

        }
    });
}

function fetchList() {
    const arr = [];
    for (let i = 0; i < 7; i++) {
        const query = new AV.Query('vocabulary');
        const a = query.equalTo('date', getDate(i))
        arr.push(a.find())
    }
    Promise.all(arr).then(createList)
}

function createList(allDay) {
    allDay.forEach((day, i) => {
        const div = document.createElement('div');
        div.classList.add('list')

        const resort = document.createElement('span');
        resort.classList.add('resort');
        resort.innerHTML = 'resort ' + getDate(i);
        div.append(resort)

        const list = document.createElement('ul');
        div.append(list);
        day.forEach(item => {
            list.append(createVocabulary([item.get('vocabulary'), item.get('note'), item.get('objectId')]));
        })
        if (i == 0) {
            const edit = document.createElement('input');
            edit.classList.add('edit')
            edit.setAttribute('contenteditable', true);
            div.append(edit)
            bindEdit(edit);
        }
        document.body.querySelector('.list-box').append(div);
    })
}

function createVocabulary(content) {
    const [key, value, objectId] = content;
    const li = document.createElement('li');

    li.innerHTML = `
        <span class="vocabulary">${key}</span>
        <span class="del" data-objid="${objectId}">x</span>
        <span class="note" data-note="${value}">${checkName}</span>
    `
    return li;
}

function getDate(d = 0) {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()-d}`;
}