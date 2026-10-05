const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const oldLoader = `    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-muted" size={32} />
      </div>
    );`;

const newLoader = `    return (
      <div className="w-full flex-1 flex flex-col md:grid md:grid-cols-2 md:gap-8 lg:gap-16 pt-8 pb-12 animate-pulse">
        {/* Left Side Skeleton */}
        <div className="w-full flex flex-col justify-center gap-8 order-1 md:order-1 pt-12 md:pt-0">
          <div className="h-4 w-32 bg-border-subtle/40 rounded-full mb-4"></div>
          
          <div className="space-y-4 mb-8">
            <div className="h-16 md:h-20 w-[90%] md:w-4/5 bg-border-subtle/30 rounded-2xl"></div>
            <div className="h-16 md:h-20 w-[80%] md:w-3/4 bg-border-subtle/30 rounded-2xl"></div>
            <div className="h-16 md:h-20 w-[60%] md:w-1/2 bg-border-subtle/30 rounded-2xl"></div>
          </div>
          
          <div className="space-y-3 mb-16">
            <div className="h-4 w-[85%] md:w-3/4 bg-border-subtle/20 rounded-md"></div>
            <div className="h-4 w-[75%] md:w-2/3 bg-border-subtle/20 rounded-md"></div>
          </div>

          {/* Search Box Skeleton */}
          <div className="h-16 w-full max-w-[420px] bg-border-subtle/40 rounded-xl"></div>
        </div>

        {/* Right Side Skeleton (Card Cluster) */}
        <div className="w-full h-[400px] md:h-[640px] relative order-2 md:order-2 flex items-center justify-center my-12 md:my-0">
          <div className="w-[85%] sm:w-[90%] max-w-[340px] sm:max-w-[380px] aspect-[4/5] sm:aspect-[3/4] bg-border-subtle/20 rounded-[32px] sm:rounded-[40px] border border-border-subtle/10 shadow-sm relative z-40"></div>
          
          {/* Faint background cards skeletons */}
          <div className="absolute top-1/2 left-1/2 w-[140px] md:w-[180px] h-[160px] md:h-[200px] -mt-[80px] md:-mt-[100px] -ml-[70px] md:-ml-[90px] bg-border-subtle/10 rounded-2xl -translate-x-[90px] -translate-y-[70px] -rotate-6 z-10"></div>
          <div className="absolute top-1/2 left-1/2 w-[140px] md:w-[180px] h-[160px] md:h-[200px] -mt-[80px] md:-mt-[100px] -ml-[70px] md:-ml-[90px] bg-border-subtle/10 rounded-2xl translate-x-[70px] translate-y-[80px] rotate-[6deg] z-20"></div>
        </div>
      </div>
    );`;

content = content.replace(oldLoader, newLoader);
fs.writeFileSync('src/App.tsx', content);
console.log('App loader replaced');
