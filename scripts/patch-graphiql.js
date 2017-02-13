var fs = require('fs');

var path = './node_modules/graphiql/dist/components/GraphiQL.js';
if (!fs.existsSync(path)) {
  console.error('Cannot find GraphiQL.js!');
  process.exit(1);
}

var result = '';
var lineReader = require('readline').createInterface({
  input: fs.createReadStream(path),
});
var skipn = 0;
lineReader.on('line', function(line) {
  if (skipn > 0) {
    skipn--;
    return;
  }
  if (line.indexOf('./ExecuteButton') !== -1) {
    return;
  }
  if (line.indexOf('_ExecuteButton') !== -1) {
    skipn = 5;
    return;
  }
  result += line + '\n';
});

lineReader.on('close', function() {
  fs.writeFileSync(path, result);
  console.log('Patched GraphiQl.js.');
});
