if (typeof window !== 'undefined') {
    //here `window` is available, so `window.document` (or simply `document`) is available too
    console.log('window exists');
} else {
    console.log('window not defined');
}

fetch('http://localhost:1811/api/v1')
    // fetch('https://sleepy-eyrie-51343.herokuapp.com/api/v1')
    .then((res) => {
        return res.json();
    })
    .then((json) => {
        const appDiv = document.getElementById('app');
        const div = document.createElement('div');
        const triggerEventBtn = document.createElement('button');
        triggerEventBtn.id = 'trigger-event-btn';
        triggerEventBtn.innerHTML = 'check or create new task and listen';
        triggerEventBtn.style.margin = '1rem 1rem';
        div.innerHTML = json.name;
        appDiv.appendChild(div);
        appDiv.appendChild(triggerEventBtn);

        triggerEventBtn.addEventListener('click', () => {
            fetch('http://localhost:1811/api/v1/newTask').then(res => res.json()).then(
                (json) => {
                    console.log('new task result: ', json);
                    if (json) {
                        listenSourceEvent();
                    }
                }
            )
        });
    });

function listenSourceEvent() {
    const source = new EventSource('http://localhost:1811/api/v1/checkTaskStatus'
        // + new URLSearchParams({
        //     tid: 'tid-001'
        // }
    );

    const sourceOpenListener = source.addEventListener('open', function (e) {
        localStorage.setItem('eventStatus', 'running');
        console.log('successful connection');
        const appDiv = document.getElementById('app');
        const div = document.createElement('div');

        const terminateEventBtn = document.createElement('button');
        terminateEventBtn.innerHTML = 'terminate current task and stop listening';
        terminateEventBtn.id = 'terminate-event-btn';
        if (getNewTaskBtn() && !document.getElementById('terminate-event-btn')) {
            disableNewTaskBtn(true);
            getNewTaskBtn().parentNode.insertBefore(terminateEventBtn, getNewTaskBtn().nextSibling);
        }
        terminateEventBtn.addEventListener('click', () => {
            terminateListening();
        })

        if (document.getElementById('event-table')) {
            return;
        }
        const table = document.createElement('table');
        var header = table.createTHead();
        const row0 = header.insertRow(0);

        row0.style.height = '2rem';

        const cell0 = row0.insertCell(0);
        const cell1 = row0.insertCell(1);
        const cell2 = row0.insertCell(2);
        const cell3 = row0.insertCell(3);

        cell0.style.width = '30%';
        cell1.style.width = '25%';
        cell1.style.textAlign = cell2.style.textAlign = 'center';
        cell2.style.width = '20%';

        cell0.innerHTML = "<b>eid</b>";
        cell1.innerHTML = "<b>Status</b>";
        cell2.innerHTML = "<b>%</b>";
        cell3.innerHTML = "<b>time</b>"

        table.id = 'event-table';
        table.style.minWidth = '850px';
        table.style.padding = '0.25em 0.5em';
        table.style.border = '1px solid black';

        table.appendChild(header);
        div.appendChild(table);
        appDiv.appendChild(div);
    }, false);

    const sourceMessageListener = source.addEventListener('message', function (eventFromApi) {
        const data = JSON.parse(eventFromApi.data);
        console.log(JSON.parse(data.stateMessage));
        const stateMessage = JSON.parse(data.stateMessage);
        const percentageOf = stateMessage.stage.current / stateMessage.stage.total * 100
        appendRowToTable(
            eventFromApi.lastEventId,
            stateMessage.status,
            parseFloat(percentageOf).toFixed(2),
            data.time)

        if (percentageOf >= 100) {
            terminateListening();
        }

        if (stateMessage.status === 'success') {
            terminateListening();
        }

        if (stateMessage.status === 'aborting') {
            source.close();
        }

        localStorage.setItem('eventStatus', stateMessage.status);

    }, false);

    const sourceErrorListener = source.addEventListener('error', function (e) {
        console.log('error occurred');
    }, false);

    function terminateListening() {
        fetch('http://localhost:1811/api/v1/terminateTask').then(
            res => {
                if (res.status === 200) {
                    source.removeEventListener('message', sourceOpenListener);
                    source.removeEventListener('open', sourceMessageListener);
                    source.removeEventListener('error', sourceErrorListener);
                    source.close();

                    removeTerminatedEventBtn(true);
                    disableNewTaskBtn(false);
                }
                localStorage.setItem('eventStatus', 'aborting');
                return res.json()
            }
        ).then(json => {
            appendRowToTable(json.eid, json.status, json.percentageOf, json.time);
        })
    }
}

function appendRowToTable(lastEventId, status, percentageOf, time) {
    const table = document.getElementById('event-table');
    if (table.childNodes[0].childNodes.length > 15) {
        (table.childNodes[0].childNodes[15]).remove();
    }
    const row = table.insertRow(1);
    const cell0 = row.insertCell(0);
    const cell1 = row.insertCell(1);
    const cell2 = row.insertCell(2);
    const cell3 = row.insertCell(3);

    cell1.style.textAlign = cell2.style.textAlign = 'center';

    cell0.innerHTML = `<span>${lastEventId}</span>`
    cell1.innerHTML = `<span>${status}</span>`
    cell2.innerHTML = `<span>${percentageOf}</span>`
    cell3.innerHTML = `<span>${time}</span>`
}

function getNewTaskBtn() {
    return document.getElementById('trigger-event-btn');
}

function disableNewTaskBtn(disabled) {
    if (getNewTaskBtn()) {
        getNewTaskBtn()['disabled'] = disabled;
    }
}

function removeTerminatedEventBtn(removed) {
    const terminateBtn = document.getElementById('terminate-event-btn');
    if (terminateBtn && removed) {
        terminateBtn.remove();
    }
}

if (localStorage.getItem('eventStatus') === 'running') {
    listenSourceEvent()
}
