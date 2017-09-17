var APP_ID = '2TJoxRA8nRK5jT1lGugMxsa3-gzGzoHsz';
var APP_KEY = '7dPjXJ329zPaOAbfssEeTzc0';

AV.init({
    appId: APP_ID,
    appKey: APP_KEY
});


var Vocabulary = AV.Object.extend('vocabulary');

const checkName = 'look';
const eventType = isMobile() ? 'touchEnd' : 'click';


bindEvent();
fetchList();

function bindEvent() {
    addEventListener(eventType, 'note', (e) => {
        e.target.innerHTML = e.target.dataset.note;
        setTimeout(() => e.target.innerHTML = checkName, 2000);
    });
    addEventListener(eventType, 'del', (e) => {
        var del = AV.Object.createWithoutData('vocabulary', e.target.dataset.objid);
        del.destroy().then(function(success) {
            e.target.parentElement.remove();
        }, function(error) {
            alert('error');
        });
    });

    addEventListener(eventType, 'resort', (e) => {
        const ul = e.target.parentElement.querySelector('ul');
        const items = [...ul.querySelectorAll('li')];
        items.sort(()=>{
            return Math.random() - 0.5 < 0 ? -1 : 1
        });
        ul.innerHTML = '';
        ul.append(...items);
    });
}

function addEventListener(eventName, className, func) {
    lisener(eventName)(className)(func);
}


function lisener(eventName) {
    const map = {};
    if (!map[eventName]) {
        document.addEventListener(eventName, function(e) {
            e.target.classList.forEach(clsName=>{
                map[eventName] && map[eventName][clsName] && map[eventName][clsName].forEach(func => func(e));
            });
        });
    }
    map[eventName] = {};
    return className=>{
        map[eventName][className] = [];
        return func => map[eventName][className].push(func);
    }

}

function bindEdit() {

    setTimeout(() => document.querySelector('.edit').focus(), 100);

    addEventListener('keydown', 'edit', function(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            sendVocabulary();
        }
    });

    addEventListener(eventType, 'submit', function() {
        e.preventDefault();
        sendVocabulary();
    });
}

function sendVocabulary () {
    const edit = document.querySelector('.edit');
    const content = edit.value;
    const [key, value] = content.split(' ');

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
        document.querySelector('.today').append(createVocabulary([...content.split(' '), ...x.get('objectId')]));
        edit.value = '';
    });
}

function fetchList() {
    const arr = [];
    for (let i = 0; i < 7; i++) {
        const query = new AV.Query('vocabulary');
        const a = query.equalTo('date', getDate(i));
        arr.push(a.find());
    }
    Promise.all(arr).then(createList);
}

function createList(allDay) {
    const listBox = document.body.querySelector('.list-box');
    allDay.forEach((day, i) => {
        const div = document.createElement('div');
        div.classList.add('list');

        const resort = document.createElement('span');
        resort.classList.add('resort');
        resort.innerHTML = 'resort ' + getDate(i);
        div.append(resort);

        const list = document.createElement('ul');
        div.append(list);
        day.forEach((item) => {
            if (i == 0) {
                list.classList.add('today');
            }
            list.append(createVocabulary([item.get('vocabulary'), item.get('note'), item.get('objectId')]));
        });
        if (i == 0) {
            const box = document.createElement('div');
            box.classList.add('edit-box');
            const edit = document.createElement('input');
            edit.classList.add('edit');
            const btn = document.createElement('button');
            btn.classList.add('submit');
            btn.innerHTML = 'submit'
            box.append(edit, btn);
            div.append(box);
            bindEdit();
        }
        listBox.append(div);
    });
}

function createVocabulary(content) {
    const [key, value, objectId] = content;
    const li = document.createElement('li');

    li.innerHTML = `
        <span class="vocabulary">${key}</span>
        <span class="del" data-objid="${objectId}">x</span>
        <span class="note" data-note="${value}">${checkName}</span>
    `;
    return li;
}

function getDate(d = 0) {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()-d}`;
}

function isMobile() {
    var sUserAgent = navigator.userAgent.toLowerCase();
    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
    var bIsMidp = sUserAgent.match(/midp/i) == "midp";
    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
    var bIsAndroid = sUserAgent.match(/android/i) == "android";
    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
    return [bIsIpad,bIsIphoneOs,bIsMidp,bIsUc7,bIsUc,bIsAndroid,bIsCE,bIsWM].indexOf(false) == -1;
}