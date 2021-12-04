const express = require('express');
const bodyParser = require('body-parser');
const { randomInt } = require('crypto');
const nodemailer = require("nodemailer");
const { MongoClient } = require("mongodb");

const dbClient = new MongoClient('mongodb+srv://wichtel:RRJslsulJa2OBShL@cluster0.8ziar.mongodb.net/wichtel?retryWrites=true&w=majority');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// const mailTransport = nodemailer.createTransport({sendmail: true});
const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nicolai.albrecht96@gmail.com',
        pass: '5sO^jN#JtW!i7'
    }
});

const getMapping = (u) => {
    let picked = [];
    let _res = [];
    let maxTries = 5000;
    for (let i = u.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [u[i], u[j]] = [u[j], u[i]];
    }
    for (let i = 0; i < u.length; i++) {
        let succ = false;
        while (!succ) {
            let r = randomInt(0, u.length);
            if (r !== i && picked.indexOf(u[r]) === -1) {
                succ = true;
                picked.push(u[r]);
                let relIndex = u[i].relations.findIndex(_r => _r.to === u[r].id)
                _res.push({from: u[i], to: u[r], type: u[i].relations[relIndex].type});
            }
            maxTries--;
            if(maxTries < 1) return false;
        }
    }
    return _res;
};

const getPresentIdeas = async(collection, type) => {
    const presents = await (await collection.find({categories: type})).toArray();
    for (let i = presents.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [presents[i], presents[j]] = [presents[j], presents[i]];
    }
    console.log(presents.slice(0, 5));
    return presents.slice(0, 5);
}

app.get('/', (req, res) => {
    res.sendFile('./public/index.html');
});

app.post('/wichtel', async (req, res) => {
    let u = req.body.users;
    let enablePresents = req.body.enablePresents;
    let _res = getMapping(u);
    while(_res === false) {
        _res = getMapping(u);
    }
    await dbClient.connect();
    const database = dbClient.db('wichtel');
    const presents = database.collection('presents');
    for(let i = 0; i < _res.length; i++) {
        let ideas = await getPresentIdeas(presents, _res[i].type);
        let ideasText = '';
        if(enablePresents) {
            for(let j = 0; j < ideas.length; j++) {
                ideasText += `${ideas[j].title} (${ideas[j].price}€) \n`
            }
        }
        mailTransport.sendMail({
            from: 'nicolai.albrecht96@gmail.com',
            to: _res[i].from.mail,
            subject: 'Wichtel Auslosung',
            text: `Du darfst für ${_res[i].to.name} ein Wichtelgeschenk aussuchen! \n \n \n Geschenkideen:  \n ${ideasText}`
        }, (err, info) => {
            if(err) console.log(err);
            console.log(info);
        });
    }
    res.json(_res);
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});