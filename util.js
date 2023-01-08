// returns TimeStamp for file naming
function getTimeStamp() {
    let date = new Date();
    let formatted_date = date.getFullYear() + "." + (date.getMonth() + 1) + "." + date.getDate() + "-" + date.getHours() + "." + date.getMinutes() + "." + date.getSeconds();
    return formatted_date;
  }