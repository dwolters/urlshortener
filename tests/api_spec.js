const frisby = require('frisby');
const trim = require('trim');

let url = 'http://localhost:3000';
let targetUrl = 'http://example.com';
let createLocation = '/create';

let user = '';
let password = '';

if(process.env.USER) {
    user = trim(process.env.USER);
}

if(process.env.PASSWORD) {
    password = trim(process.env.PASSWORD);
}

frisby.globalSetup({
  timeout: 10000,
});

if(process.env.AUTH === 'true') {
    if(!user || !password) {
        console.error('USER and PASSWORD must be set if AUTH=true');
        process.exit(1);
    }

    frisby.create('Creating a short URL shall not work with wrong credentials')
        .post(url + createLocation, {url: targetUrl})
        .auth(user + '-', password + '-')
        .expectStatus(401)
        .toss();
    frisby.create('Deleting a short URL shall not work with wrong credentials')
        .delete(url + '/test')
        .auth(user + '-', password + '-')
        .expectStatus(401)
        .toss();
}

frisby.create('Creating a shortened URL')
    .post(url + createLocation, {url: targetUrl})
    .auth(user, password)
    .expectStatus(201)
    .expectHeaderToMatch('Location', '^/[a-z0-9]+$')
    .after((err, res) => {
        let location = res.headers.location;
        frisby.create('Getting the target of a shortened URL')
            .get(url + location, {followRedirect: false})
            .expectStatus(302)
            .expectHeader('Location', targetUrl)
            .after(() => {
                frisby.create('Deleting a shortened URL')
                    .delete(url + location)
                    .auth(user, password)
                    .expectStatus(200)
                    .toss();
            })
            .toss();
    })
    .toss();
