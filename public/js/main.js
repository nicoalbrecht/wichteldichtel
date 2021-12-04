const app = Vue.createApp({
    data() {
        return {
            categories: ["Frauen","Männer","Partnerin","Partner","Beste Freundin","Bester Freund","Mutter","Vater","Oma","Opa","Teenager","Mädchen","Junge","Kinder","Schwester","Bruder","Schwiegermutter","Eltern","Chef","Mitarbeiter","Kunden"],
            users: [
                {id: 0, name: '', mail: '', showRelations: true, relations: [
                    {to: 1, type: ''},
                    {to: 2, type: ''},
                ], specialRelation: ''},
                {id: 1, name: '', mail: '', showRelations: false, relations: [
                    {to: 0, type: ''},
                    {to: 2, type: ''},
                ], specialRelation: ''},
                {id: 2, name: '', mail: '', showRelations: false, relations: [
                    {to: 0, type: ''},
                    {to: 1, type: ''}
                    
                ], specialRelation: ''}
            ],
            enablePresents: true,
            enableComplexRelations: false,
            defaultRelation: '',
            formValid: false
        }
    },
    methods: {
        getUserById(id) {
            let index = this.users.findIndex(u => u.id === id);
            if(index !== -1) {
                return this.users[index];
            }
        },
        addUser() {
            let newId = this.users.length;
            let newRelations = [];
            for(let i = 0; i < this.users.length; i++) {
                newRelations.push({from: newId, to: this.users[i].id, type: ''});
                this.users[i].relations.push({from: this.users[i].id, to: newId, type: ''});
            }
            this.users.push({id: newId, name: '', mail: '', relations: newRelations, specialRelation: ''});
        },
        removeUser(id) {
            let index = this.users.findIndex(u => u.id === id);
            if(index !== -1) {
                for(let i = 0; i < this.users.length; i++) {
                    let _i = this.users[i].relations.findIndex(r => r.to === id);
                    this.users[i].relations.splice(_i, 1);
                }
                this.users.splice(index, 1);
                for(let i = 0; i < this.users.length; i++) {
                    for(let j = 0; j < this.users.length; j++) {
                        if(i !== j) {
                            let _i = this.users[j].relations.findIndex(r => r.to === this.users[i].id);
                            if(_i !== -1) {
                                this.users[j].relations[_i].to = i;
                            }
                        }
                    }
                    this.users[i].id = i;
                }
            }
        },
        submitData() {
            let _users = []
            if(this.enableComplexRelations) {
                for(let i = 0; i < this.users.length; i++) {
                    let {id, name, mail} = this.users[i];
                    let _relations = [];
                    for(let r = 0; r < this.users[i].relations.length; r++) _relations.push({to: this.users[i].relations[r].to, type: this.users[i].relations[r].type});
                    _users.push({id, name, mail, relations: _relations});
                }
            } else {
                let _us = [];
                for(let i = 0; i < this.users.length; i++) {
                    let {id, name, mail, specialRelation} = this.users[i];
                    _us.push({id, name, mail, relationToOthers: specialRelation ? specialRelation : this.defaultRelation});
                    _users.push({id, name, mail, relations: []});
                }
                for(let i = 0; i < _us.length; i++) {
                    let {id, relationToOthers} = _us[i];
                    for(let j = 0; j < _users.length; j++) {
                        if(id !== _users[j].id) {
                            _users[j].relations.push({to: id, type: relationToOthers});
                        }
                    }
                }
            }

            for(let i = 0; i < _users.length; i++) {
                for(let r = 0; r < _users[i].relations.length; r++) {
                    if(_users[i].relations[r].type === '') {
                        _users[i].relations[r].type = this.defaultRelation;
                    }
                }
            }
            fetch('/wichtel', {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({users, enablePresents: this.enablePresents})
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
        },
        toggleRelations(id) {
            let index = this.users.findIndex(u => u.id === id);
            if(index !== -1) {
                this.users[index].showRelations = !this.users[index].showRelations;
            }
        },
        showSettings() {
            Swal.fire({
                template: '#settings-modal',
                width: '50%',
                willOpen: (e) => {
                    e.querySelector('#enable-presents').checked = this.enablePresents;
                    e.querySelector('#enable-detailed-relations').checked = this.enableComplexRelations;
                },
                preConfirm: () => {
                    return {
                        enablePresents: document.querySelector('#enable-presents').checked,
                        complexRelations: document.querySelector('#enable-detailed-relations').checked
                    }
                  }
            }).then((result) => {
                if(result.isConfirmed) {
                    this.enablePresents = result.value.enablePresents;
                    this.enableComplexRelations = result.value.complexRelations;
                }
            });
        }
    },
    computed: {
        validateName() {
            return id => {
                let index = this.users.findIndex(u => u.id === id);
                if(index !== -1) {
                    return this.users[index].name.length > 1;
                }
                return false;
            }
        },
        validateMail() {
            return id => {
                let index = this.users.findIndex(u => u.id === id);
                if(index !== -1) {
                    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(this.users[index].mail);
                }
                return false;
            }
        },
        validateForm() {
            let valid = true;
            for(let i = 0; i < this.users.length; i++) {
                valid = valid && (this.users[i].name.length > 1);
                valid = valid && (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(this.users[i].mail));
            }
            return valid;
        }
    }
});

app.mount('#content');
