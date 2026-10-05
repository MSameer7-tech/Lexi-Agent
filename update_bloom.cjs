const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');

// We are going to strictly replace the wrapper div classes for each card.

// Card 1
content = content.replace(
  '-translate-x-[30px] -translate-y-[30px] -rotate-3 group-hover/cluster:-translate-x-[120px] sm:group-hover/cluster:-translate-x-[150px] md:group-hover/cluster:-translate-x-[180px] group-hover/cluster:-translate-y-[100px] sm:group-hover/cluster:-translate-y-[120px] group-hover/cluster:-rotate-12',
  '-translate-x-[90px] md:-translate-x-[130px] -translate-y-[70px] md:-translate-y-[90px] -rotate-6 group-hover/cluster:-translate-x-[160px] sm:group-hover/cluster:-translate-x-[200px] md:group-hover/cluster:-translate-x-[260px] group-hover/cluster:-translate-y-[130px] sm:group-hover/cluster:-translate-y-[160px] md:group-hover/cluster:-translate-y-[200px] group-hover/cluster:-rotate-[18deg]'
);

// Card 2
content = content.replace(
  '-translate-x-[20px] translate-y-[30px] rotate-2 group-hover/cluster:-translate-x-[100px] sm:group-hover/cluster:-translate-x-[130px] md:group-hover/cluster:-translate-x-[160px] group-hover/cluster:translate-y-[100px] sm:group-hover/cluster:translate-y-[130px] group-hover/cluster:-rotate-[16deg]',
  '-translate-x-[80px] md:-translate-x-[110px] translate-y-[70px] md:translate-y-[90px] -rotate-6 group-hover/cluster:-translate-x-[140px] sm:group-hover/cluster:-translate-x-[180px] md:group-hover/cluster:-translate-x-[230px] group-hover/cluster:translate-y-[140px] sm:group-hover/cluster:translate-y-[180px] md:group-hover/cluster:translate-y-[220px] group-hover/cluster:-rotate-[22deg]'
);

// Card 3
content = content.replace(
  'translate-x-[25px] -translate-y-[20px] rotate-[4deg] group-hover/cluster:translate-x-[110px] sm:group-hover/cluster:translate-x-[140px] md:group-hover/cluster:translate-x-[170px] group-hover/cluster:-translate-y-[80px] sm:group-hover/cluster:-translate-y-[100px] group-hover/cluster:rotate-[14deg]',
  'translate-x-[80px] md:translate-x-[120px] -translate-y-[60px] md:-translate-y-[80px] rotate-[8deg] group-hover/cluster:translate-x-[150px] sm:group-hover/cluster:translate-x-[190px] md:group-hover/cluster:translate-x-[250px] group-hover/cluster:-translate-y-[120px] sm:group-hover/cluster:-translate-y-[150px] md:group-hover/cluster:-translate-y-[190px] group-hover/cluster:rotate-[20deg]'
);

// Card 4
content = content.replace(
  'translate-x-[15px] translate-y-[20px] -rotate-1 group-hover/cluster:translate-x-[90px] sm:group-hover/cluster:translate-x-[120px] md:group-hover/cluster:translate-x-[150px] group-hover/cluster:translate-y-[110px] sm:group-hover/cluster:translate-y-[140px] group-hover/cluster:rotate-[18deg]',
  'translate-x-[70px] md:translate-x-[100px] translate-y-[80px] md:translate-y-[110px] rotate-[6deg] group-hover/cluster:translate-x-[130px] sm:group-hover/cluster:translate-x-[170px] md:group-hover/cluster:translate-x-[220px] group-hover/cluster:translate-y-[160px] sm:group-hover/cluster:translate-y-[200px] md:group-hover/cluster:translate-y-[250px] group-hover/cluster:rotate-[24deg]'
);

// Card 5
content = content.replace(
  '-translate-x-[10px] translate-y-[5px] rotate-[1deg] group-hover/cluster:-translate-x-[180px] md:group-hover/cluster:-translate-x-[220px] group-hover/cluster:translate-y-[10px] group-hover/cluster:-rotate-[25deg]',
  '-translate-x-[130px] md:-translate-x-[170px] translate-y-[5px] md:translate-y-[10px] -rotate-[12deg] group-hover/cluster:-translate-x-[230px] md:group-hover/cluster:-translate-x-[320px] group-hover/cluster:translate-y-[15px] group-hover/cluster:-rotate-[32deg]'
);

// Card 6
content = content.replace(
  'translate-x-[10px] -translate-y-[5px] -rotate-[2deg] group-hover/cluster:translate-x-[180px] md:group-hover/cluster:translate-x-[220px] group-hover/cluster:-translate-y-[10px] group-hover/cluster:rotate-[22deg]',
  'translate-x-[130px] md:translate-x-[170px] -translate-y-[5px] md:-translate-y-[10px] rotate-[10deg] group-hover/cluster:translate-x-[230px] md:group-hover/cluster:translate-x-[320px] group-hover/cluster:-translate-y-[15px] group-hover/cluster:rotate-[30deg]'
);

fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Updated blooming states successfully');
