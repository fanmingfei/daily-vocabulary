const checkName = 'look';
bindEvent();
fetchList();

function bindEvent() {

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains("note")) {
            e.target.innerHTML = e.target.dataset.note;
            setTimeout(() => e.target.innerHTML = checkName, 2000);
        }
    });
}

function bindEdit(li) {

    setTimeout(()=>li.focus(), 100)
    
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
            }).then(()=>{
                e.target.before(createVocabulary(e.target.innerHTML))
                e.target.innerHTML = '';                
            })

        }
    });
}

function fetchList() {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
        const query = new AV.Query('vocabulary');
        const a = query.equalTo('date', getDate(i))
        arr.push(a.find())
    }
    Promise.all(arr).then(createList)
}

function createList(allDay) {
    const list = document.createElement('ul');
    list.classList.add('list')
    allDay.forEach(day=>{
        day.forEach(item=>{
            list.append(createVocabulary([item.get('vocabulary'), item.get('note')]));
        })
        if (day[0] && day[0].get('date') == getDate()) {
            const li = document.createElement('li');
            li.classList.add('edit')
            li.setAttribute('contenteditable',true);
            list.append(li)
            bindEdit(li);
        }
    })
    document.body.querySelector('.list-box').append(list);
}

function createVocabulary(content) {
    let key, value;
    if (content instanceof Array) {
        [key, value] = content;
    } else {
        [key, value] = content.split(' ');
    }
    const li = document.createElement('li');
    li.innerHTML = `
        <span class="vocabulary">${key}</span>
        <span class="note" data-note="${value}">${checkName}</span>
    `
    return li;
}

function getDate(d = 0) {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()-d}`;
}