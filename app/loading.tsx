export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-800 border-t-lime-400" />
        <span className="absolute text-[10px] font-mono font-bold uppercase tracking-widest text-lime-400 animate-pulse">
          AUDITING
        </span>
      </div>
      <p className="mt-6 text-xs text-zinc-500 font-mono tracking-wider">
        Compiling stack configurations...
      </p>
    </div>
  );
}
