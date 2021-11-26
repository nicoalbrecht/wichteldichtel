const express = require('express');
const bodyParser = require('body-parser');
const { randomInt } = require('crypto');
const nodemailer = require("nodemailer");
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const mailTransport = nodemailer.createTransport({sendmail: true});

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
                _res.push({from: u[i], to: u[r]});
            }
            maxTries--;
            if(maxTries < 1) return false;
        }
    }
    return _res;
};

app.get('/', (req, res) => {
    res.sendFile('./public/index.html');
});

app.post('/wichtel', (req, res) => {
    let u = req.body;
    let _res = getMapping(u);
    while(_res === false) {
        _res = getMapping(u);
    }
    for(let i = 0; i < _res.length; i++) {
        mailTransport.sendMail({
            from: 'no-reply@wichtel-dichtel.de',
            to: _res[i].from.mail,
            subject: 'Message',
            text: `Du darfst für ${_res[i].to.name} ein Wichtelgeschenk aussuchen!`
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