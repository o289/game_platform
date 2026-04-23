import { useEffect, useState } from 'react';

type ProgressCallback = (loaded: number, total: number) => void;

// 画像プリロード
const preloadImages = (paths: string[], onProgress?: ProgressCallback) => {
  let loadedCount = 0;
  const total = paths.length;

  return Promise.all(
    paths.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            loadedCount++;
            onProgress?.(1, total);
            resolve();
          };
          img.onerror = () => {
            loadedCount++;
            onProgress?.(1, total);
            resolve();
          };
        }),
    ),
  );
};

// 音声プリロード
const preloadAudios = (paths: string[], onProgress?: ProgressCallback) => {
  let loadedCount = 0;
  const total = paths.length;

  return Promise.all(
    paths.map(
      (src) =>
        new Promise<void>((resolve) => {
          const audio = new Audio();
          audio.src = src;
          audio.onloadeddata = () => {
            loadedCount++;
            onProgress?.(1, total);
            resolve();
          };
          audio.onerror = () => {
            loadedCount++;
            onProgress?.(1, total);
            resolve();
          };
        }),
    ),
  );
};

const fetchAssetPaths = async (gameName: string) => {
  const path = `/games/${gameName}/assets.json`;

  const res = await fetch(path);
  const data = await res.json();

  return {
    images: data.images || [],
    audios: data.audios || [],
  };
};

export const useAssets = (gameName: string) => {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoaded(false);
    setProgress(0);

    const load = async () => {
      const { images, audios } = await fetchAssetPaths(gameName);

      const total = images.length + audios.length;
      let loadedCount = 0;

      const updateProgress = (count: number) => {
        loadedCount += count;
        setProgress(Math.floor((loadedCount / total) * 100));
      };

      await Promise.all([
        preloadImages(images, (c) => updateProgress(c)),
        preloadAudios(audios, (c) => updateProgress(c)),
      ]);

      setProgress(100);
      setLoaded(true);
    };

    load();
  }, [gameName]);

  return { loaded, progress };
};
