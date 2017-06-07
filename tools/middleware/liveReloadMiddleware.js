const safeWay = true;

function notifyWatcher(watcher) {
  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
  };

  watcher.res.writeHead(205, headers);
  watcher.res.end(JSON.stringify({ changed: true }));
}

function liveReloadMiddleware(compiler) {
  let watchers = [];
  let notify = false;

  compiler.plugin('done', () => {
    if (safeWay) {
      notify = true;
    } else {
      watchers.forEach(watcher => {
        notifyWatcher(watcher);
      });

      watchers = [];
    }
  });

  return (req, res, next) => {
    if (req.path === '/onchange') {
      const watcher = { req, res };

      if (safeWay) {
        if (notify) {
          notifyWatcher(watcher);
          notify = false;
        }
      } else {
        watchers.push(watcher);

        req.on('close', () => {
          for (let i = 0; i < watchers.length; i++) {
            if (watchers[i] && watchers[i].req === req) {
              watchers.splice(i, 1);
              break;
            }
          }
        });
      }
    } else {
      next();
    }
  };
}

module.exports = liveReloadMiddleware;
