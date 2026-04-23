import { createContext, useContext, useState, ReactNode } from 'react';
import { GemGameConfig, defaultGemGameConfig } from '../../shared/types';

type GemGameConfigContextType = {
  config: GemGameConfig;
  setConfig: (config: GemGameConfig) => void;
};

const GemGameConfigContext = createContext<
  GemGameConfigContextType | undefined
>(undefined);

export const GemGameConfigProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [config, setConfig] = useState<GemGameConfig>(defaultGemGameConfig);

  return (
    <GemGameConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </GemGameConfigContext.Provider>
  );
};

export const useGemGameConfig = () => {
  const context = useContext(GemGameConfigContext);

  if (!context) {
    throw new Error(
      'useGemGameConfig must be used within GemGameConfigProvider',
    );
  }

  return context;
};
