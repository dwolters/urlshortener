// To avoid that the web server will block the build during CI, it is detached if started on Travis.
if(process.env.TRAVIS && process.argv.indexOf('detached') === -1) {
    const spawn = require('child_process').spawn;
    const child = spawn('node', ['server.js', 'detached'], {detached: true, stdio: 'ignore'});
    child.unref();
    console.log('Spawning detached server');
    setTimeout(() => {
		console.log('Leaving main process');
	}, 3000);
} else {
    const port = 3000;
    const app = require('./app.js');

    app.listen(port, () => console.log(`Listening on port ${port}!`));
}
