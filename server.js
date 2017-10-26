const http = require('http');
const fs = require('fs');
const path = require('path');
const URLInfo = require('url');
const _ = require('lodash');
const uuidv4 = require('uuid/v4');
const mLog = require('./modules/mLog');

let port = process.argv[2] || 8080;
let hostname = '127.0.0.1';

const server = http.createServer((request, response) => {
  request.url = request.url == '/' ? 'index.html' : request.url;

  let url = request.url;
  let pathName = URLInfo.parse(request.url, true).pathname;
  let queries = URLInfo.parse(request.url, true).search;

  if (request.method == 'POST' && url.includes('/add-session')) {
    let cookie = uuidv4();
    let content;

    request.on('error', (err) => {
      if (err) {
        throw err;
      }
    })
    .on('data', (data) => {
      content = data.toString();
    })
    .on('end', () => {
      response.setHeader('Set-Cookie', `sessionID=${cookie};expires=` + new Date(new Date().getTime()+60000).toGMTString());
      fs.writeFile(path.join(__dirname, '.sessions', `${cookie}`), `${content}`, (err) => {
        if (err) {
          throw err;
        }
      });
      console.log('No more data to receive.');
      response.end();
    })

  } else {

    if (request.headers.cookie) {
      let cookie = request.headers.cookie.split('=')[1];
      console.log(cookie);
      let userData = fs.readFileSync(path.join(__dirname, '.sessions', `${cookie}`), 'UTF-8', (err) => {
        if (err) {
          throw err;
        }
      })
      console.log(userData);

      response.setHeader('x-my-user-data', userData);
    }

    fs.createReadStream(path.join(__dirname, 'public', url))
    .on('error', (err) => {

      mLog.err(`The URL ${pathName} doesn't exist ${queries == [] ? '' : '[' + queries + ']'}`);
      response.statusCode = 404;
      response.end(fs.readFileSync(path.join(__dirname, 'public', '404.html')));

    })
    .pipe(response)
    .on('end', () => {

      response.statusCode = 200;
      response.end();

    })
  }

  mLog.info(`${request.method} ${pathName} ${queries == [] ? '' : '[' + queries + ']'}`);

});

server.listen(port, hostname, (err) => {
  if (err) {
    throw err;
  }

  mLog.info(`Server running through ${hostname} on port ${port}`)

});
