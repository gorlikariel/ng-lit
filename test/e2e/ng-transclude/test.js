const Nightmare = require('nightmare');
const {
  deepStrictEqual
} = require('assert');
const {
  init,
  COMMANDS :{ GET_NG_ELM, GET_NG_LIT_ELM }
} = require('../utils');

let nightmare = null;
describe('ng-transclude directive', async function() {

  this.timeout('60s');
  beforeEach(async () => {
    nightmare = new Nightmare();
    await init(nightmare, __dirname);
  });

  it('should validate angular draw the TRNACLUDED directive', async () => {
    const transcluded = await nightmare.evaluate(...GET_NG_ELM).end();
    deepStrictEqual(transcluded, "TRNACLUDED:\n");
  });

  it('should validate ng-lit draw the user name within the TRNACLUDED directive', async () => {
    const userName = await nightmare.evaluate(...GET_NG_LIT_ELM).end();
    deepStrictEqual(userName, "user name in ng-lit: John Doe");
  });

});
