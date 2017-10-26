const colors = require('colors');
const moment = require('moment');

class mLog {
  err(log) {
    let date = moment().format('MMMM Do, YYYY h:mm A');
    console.log(colors.red(`[${date}] ERR :: ${log}`));
  };

  info(log){
    let date = moment().format('MMMM Do, YYYY h:mm A');
    console.log(colors.green(`[${date}] INFO :: ${log}`));
  };
}

module.exports = new mLog();
