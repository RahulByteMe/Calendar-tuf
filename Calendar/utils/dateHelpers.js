export function toDateKey(d) {
  if (!d) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

export function toHolidayKey(d){

return `${d.getMonth()}-${d.getDate()}`;

}

export function isSameDay(a,b){

if(!a || !b) return false;

return(

a.getFullYear()===b.getFullYear() &&
a.getMonth()===b.getMonth() &&
a.getDate()===b.getDate()

);

}

export function isInRange(date,start,end){

if(!start || !end) return false;

const [s,e]=start<=end?[start,end]:[end,start];

return date>s && date<e;

}

export function fmtShort(date){

return date.toLocaleString("default",{
month:"short"
})+" "+date.getDate();

}

export function buildGrid(year,month){

const first=new Date(year,month,1);

const lastDay=new Date(year,month+1,0).getDate();

const prevLastDay=new Date(year,month,0).getDate();

let startOffset=first.getDay()-1;

if(startOffset<0) startOffset=6;

const days=[];

for(let i=startOffset-1;i>=0;i--){

days.push({

day:prevLastDay-i,
cur:false,
date:new Date(year,month-1,prevLastDay-i)

});

}

for(let d=1;d<=lastDay;d++){

days.push({

day:d,
cur:true,
date:new Date(year,month,d)

});

}

const rem=7-(days.length%7);

if(rem<7){

for(let d=1;d<=rem;d++){

days.push({

day:d,
cur:false,
date:new Date(year,month+1,d)

});

}

}

return days;

}