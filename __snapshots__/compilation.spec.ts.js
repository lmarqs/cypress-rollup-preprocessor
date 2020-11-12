exports['compilation - e2e test preprocessor output correctly preprocesses the file 1'] = `
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  it('is a test', () => {
    const [a, b] = [1, 2];

    expect(a).to.equal(1);
    expect(b).to.equal(2);
    expect(Math.min(...[3, 4])).to.equal(3);
  });

})));

`

exports['compilation - e2e test preprocessor output correctly preprocesses the file using plugins 1'] = `
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  it('is a test', function () {\r
      var _a = [1, 2], a = _a[0], b = _a[1];\r
      console.log(+a.toString(), b.toString());\r
  });

})));

`

exports['compilation - e2e test preprocessor output correctly reprocesses the file after a modification (syntax error) 1'] = `
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  it('is a test', () => {
    const [a, b] = [1, 2];

    expect(a).to.equal(1);
    expect(b).to.equal(2);
    expect(Math.min(...[3, 4])).to.equal(3);
  });

})));

`

exports['compilation - e2e test preprocessor output correctly reprocesses the file after a modification (console.log("valid modification")) 1'] = `
(function (factory) {
\ttypeof define === 'function' && define.amd ? define(factory) :
\tfactory();
}((function () { 'use strict';

\tconsole.log("valid modification");

})));

`

exports['compilation - e2e test preprocessor output has less verbose "Module not found" error 1'] = `
Could not resolve './does/not-exist' from test/fixtures/_tmp/error_due_importing_nonexistent_file_spec.js
`

exports['compilation - e2e test preprocessor output has less verbose "Syntax error" 1'] = `
Unexpected token
`
