const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const Shrinku = require('shrinku');
const shrinku = new Shrinku();

shrinku.useStrategy(new Shrinku.Strategies.SimpleStrategy());
// shrinku.addAdapter('memory', new Shrinku.Adapters.MemoryAdapter());
shrinku.addAdapter('rethinkdb', new (require('shrinku-adapter-rethinkdb'))({
  table: 'shrinku'
}), { default: true });

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => res.send('Shrinku Web'));

app.post('/', (req, res, next) => {
  shrinku.shrink({ url: req.body.url })
    .then((data) => res.send(data))
    .catch(next);
});

app.get('/:hash', (req, res, next) => {
  shrinku.unshrink({ hash: req.params.hash })
    .then((data) => {
      if(data.url)
        res.redirect(data.url);
      else
        return Promise.reject({ stack: '', status: 404, message: 'Not found'})
    })
    .catch((err) => {
      console.log(err);
      return next(err);
    });
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).send(err.message);
});

app.listen(3000, () => console.log('Shrinku, listen :3000'));
