/* eslint-disable no-unused-vars */
self.addEventListener('message', tkb_data => {
  let days_outline = new Array();
  let one_day_time = 86400000;

  for (
    let time_iter = tkb_data.min_time;
    time_iter <= tkb_data.max_time;
    time_iter += one_day_time
  ) {
    if (
      new Date(time_iter).getDay() + 1 == 2 ||
      time_iter == tkb_data.min_time
    ) {
      days_outline.push([time_iter]);
      continue;
    }
    days_outline[days_outline.length - 1].push(time_iter);
  }
  return days_outline
})