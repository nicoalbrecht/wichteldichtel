let userCount = 3;

const fixUserOrder = () => {
    let usr = document.querySelectorAll('.input-group');
    for(let i = 0; i < usr.length; i++) {
        usr[i].querySelector('p').innerHTML = (i+1) + '.';
        usr[i].querySelector('input[name^=name]').setAttribute('name', `name-${i+1}`);
        usr[i].querySelector('input[name^=mail]').setAttribute('mail', `mail-${i+1}`);
        if(i !== 0) usr[i].querySelector('.remove-user-icon').setAttribute('data-id', `${i+1}`);
        usr[i].setAttribute('data-id', `${i+1}`);
    }
}

const handleRemoveEvent = (event) => {
    userCount--;
    let t;
    if(event.target.classList.contains('remove-user-icon')) {
        t = event.target;
    } else {
        t = event.target.closest('.remove-user-icon')
    }
    let _id = t.getAttribute('data-id');
    document.querySelector(`.input-group[data-id="${_id}"]`)?.remove();
    fixUserOrder();
}

const addRemoveEventListener = () => {
    let btns = document.querySelectorAll('.remove-user-icon');
    for(let i = 0; i < btns.length; i++) {
        btns[i].onclick = handleRemoveEvent;
    }
}

const submitData = () => {
    let usr = document.querySelectorAll('.input-group');
    let data = [];
    for(let i = 0; i < usr.length; i++) {
        let name = usr[i].querySelector('input[name^=name]').value;
        let mail = usr[i].querySelector('input[name^=mail]').value;
        if(name && mail) data.push({id: i, name, mail});
    }
    console.log(data);
    fetch('/wichtel', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => {
        return res.json();
    }).catch(err => {
        console.log(err);
    }).then(data => {
        Swal.fire(
            'Auiii',
            'Benachrichtigungen wurde versendet!',
            'success'
        );
        console.log(data);
    }).catch(err => {
        console.log(err);
    });
}

(() => {
    document.querySelector('#add-user-btn').addEventListener('click', () => {
        userCount++;
        let html = `
            <div class="input-group">
                <p>${userCount}.</p>
                <input type="text" name="name-${userCount}" id="name-${userCount}" placeholder="Name">
                <input type="text" name="mail-${userCount}" id="mail-${userCount}" placeholder="E-Mail">
                <i class="fas fa-trash remove-user-icon fa-2x" data-id="${userCount}"></i>
            </div>
        `;
        document.querySelector('#form').insertAdjacentHTML('beforeend', html);
        addRemoveEventListener();
    });

    document.querySelector('#wichtel-btn').addEventListener('click', submitData);
    addRemoveEventListener();
})();