import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect, useRef} from 'react';
import {createContext, useContextSelector} from 'use-context-selector';

type PickupModeContextType = {
  isPickupMode: boolean;
  isInitialized: boolean;
  setPickupMode: (value: boolean) => void;
};

const PickupModeContext = createContext<PickupModeContextType | null>(null);

export function PickupModeProvider({children}: {children: React.ReactNode}) {
  const [state, setState] = useState<{
    isPickupMode: boolean;
    isInitialized: boolean;
  }>({
    isPickupMode: false, // Default value before initialization
    isInitialized: false,
  });

  // Use a ref to track the initial load
  const initialLoadRef = useRef(false);

  const setPickupMode = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('pickupMode', value.toString());
      setState(prev => ({
        ...prev,
        isPickupMode: value,
      }));
    } catch (error) {
      console.error('Failed to save pickupMode', error);
    }
  };

  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    const initialize = async () => {
      try {
        // First try to get the value synchronously (if possible)
        // This helps prevent the initial flash of wrong value
        const immediateValue = await AsyncStorage.getItem('pickupMode');
        const initialMode = immediateValue?.toString() === 'true';

        setState({
          isPickupMode: initialMode,
          isInitialized: true,
        });

        // Double-check the value asynchronously to catch any inconsistencies
        const doubleCheckValue = await AsyncStorage.getItem('pickupMode');
        if (doubleCheckValue?.toString() !== immediateValue?.toString()) {
          setState({
            isPickupMode: doubleCheckValue?.toString() === 'true',
            isInitialized: true,
          });
        }
      } catch (error) {
        console.error('Failed to load pickupMode', error);
        setState(prev => ({
          ...prev,
          isInitialized: true,
        }));
      }
    };

    initialize();
  }, []);

  return (
    <PickupModeContext.Provider
      value={{
        isPickupMode: state.isPickupMode,
        isInitialized: state.isInitialized,
        setPickupMode,
      }}>
      {children}
    </PickupModeContext.Provider>
  );
}

export function usePickupMode() {
  const context = useContextSelector(PickupModeContext, v => v);
  if (!context) {
    throw new Error('usePickupMode must be used within a PickupModeProvider');
  }
  return context;
}

export function useIsPickupMode() {
  const {isPickupMode, isInitialized} = usePickupMode();
  return isInitialized ? isPickupMode : undefined;
}
