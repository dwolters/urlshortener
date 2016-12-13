const express = require('express');
const uuid = require('node-uuid');
const bodyParser = require('body-parser');
const fs = require('fs-promise');
const path = require('path');
const basicAuth = require('basic-auth-connect');
const trim = require('trim');

let app = express();

// Path where the mapping files are stored
let mappingPath = './data/';
// Reserved keywords that shall not be used as ids for shortened URLs
let reserved = ['create'];
// Mapping of ids to target URLs
let mapping = {};

// The body of a request shall be parsed if it is JSON or form-data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let auth = (req, res, next) => next();

if (process.env.AUTH && trim(process.env.AUTH) === 'true') {
    let user = trim(process.env.USER);
    let password = trim(process.env.PASSWORD);
    if (!user) {
        console.error('If AUTH is true, USER must be set.');
        process.exit(1);
    }
    if (!password) {
        console.error('If AUTH is true, PASSWORD must be set.');
        process.exit(1);
    }
    console.log('Service is protected by username and password');
    auth = basicAuth(user, password);
} else {
    console.log('Service is NOT protected by username and password');
}

/**
 * Checks if the passed id is valid. An id is valid if it only consists of characters, numbers, hyphens, and
 * underscores. Furthermore, it must begin with a character or a number and it cannot be a reserved word.
 *
 * @param {String} id to be validated
 * @return {Boolean} true if the id is valid otherwise false
 */
function validId(id) {
    return reserved.indexOf(id) === -1 && id.match(/^[a-z0-9][a-z0-9\-_]+$/);
}

// Route to redirect to the target URL
app.get('/:id', (req, res) => {
    let id = req.params.id;
    if (!validId(id)) {
        res.status(400).send('Invalid ID format');
        console.error('Request for invalid id:', id);
    } else if (mapping[id]) {
        res.redirect(302, mapping[id]);
        console.error('Providing redirect for id:', id);
    } else {
        res.status(404).send('Not Found');
        console.warn('Request for unknown id:', id);
    }
});

// Route to create a shortened URL for a given target URL
// (id of the shortened URL is generated)
app.post('/create', auth, (req, res) => {
    let id = uuid.v4().substr(0, 8);
    let url = req.body.url;
    console.log('Shortening request for:', url);
    fs.writeFile(path.join(mappingPath, id), url)
        .then(() => {
            console.log('Created short URL with id:', id);
            mapping[id] = url;
            res.status(201)
                .set('Location', '/' + id)
                .end('Created');
        }, (err) => {
            res.status(500).end('Internal Server Error');
            console.error('Error during creation:', err);
        });
});

// Route to delete a shortened URL
app.delete('/:id', auth, (req, res) => {
    let id = req.params.id;

    if (!validId(id)) {
        res.status(400).end('Invalid ID format');
        console.error('Request for invalid id:', id);
    } else {
		var file = path.join(mappingPath, id);
        fs.unlink(file)
            .then(() => {
                delete mapping[id];
                res.end('OK');
                console.log('Delete short URL with id:', id);
            }, (err) => {
				if(err.code === 'ENOENT') {
                    res.end('OK');
					console.log('Ignoring request: Short URL has already been deleted');
				} else {
                    res.status(500).end('Internal Server Error');
				    console.error('Error during deletion:', err);
				}
            });
    }
});

app.get('/', (req, res) => {
    fs.readFile('./public/index.html')
        .then((file) => res.end(file))
        .catch((err) => {
            res.status(500).end(err.message);
        });
});

app.all('*', (req, res) => {
    res.status(404).end('Not Found');
    console.warn('Request for unknown route or unsupported method:', req.url);
});

let files = fs.readdirSync(mappingPath);
files.forEach((id) => {
    let file = path.join(mappingPath, id);
    if (validId(id) && fs.statSync(file).isFile()) {
        mapping[id] = fs.readFileSync(file);
    }
});

module.exports = app;
