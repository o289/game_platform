type Props = {
  progress: number;
};

export default function LoadingScreen({ progress }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh bg-black text-white gap-4">
      <div className="text-xl">Loading assets... {progress}%</div>
      <div className="w-48 h-1 bg-gray-700 overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="animate-pulse text-sm opacity-70">please wait</div>
    </div>
  );
}
