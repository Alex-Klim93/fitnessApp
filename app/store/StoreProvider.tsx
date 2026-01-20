// app/store/StoreProvider.tsx
'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { initializeStore, AppStore } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore } from 'redux-persist';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);
  const persistorRef = useRef<any>(null);

  if (typeof window !== 'undefined') {
    // На клиенте инициализируем хранилище только один раз
    if (!storeRef.current) {
      storeRef.current = initializeStore();
      // Если используете redux-persist, раскомментируйте:
      // persistorRef.current = persistStore(storeRef.current);
    }
  } else {
    // На сервере всегда создаем новое хранилище
    storeRef.current = initializeStore();
  }

  if (!storeRef.current) {
    throw new Error('Store not initialized');
  }

  return (
    <Provider store={storeRef.current}>
      {/* Если используете redux-persist, раскомментируйте: */}
      {/* <PersistGate loading={null} persistor={persistorRef.current!}> */}
      {children}
      {/* </PersistGate> */}
    </Provider>
  );
}
