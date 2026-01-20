// app/components/DevTools/DevToolsChecker.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/app/store/hooks';

export default function DevToolsChecker() {
  const videoState = useAppSelector((state) => state.videoPlayer);
  const [devToolsStatus, setDevToolsStatus] = useState({
    reduxDevTools: false,
    reactDevTools: false,
    environment: process.env.NODE_ENV,
  });

  useEffect(() => {
    // Проверяем доступность Redux DevTools
    const hasReduxDevTools = !!(window as any).__REDUX_DEVTOOLS_EXTENSION__;

    // Проверяем React DevTools (примерная проверка)
    const hasReactDevTools = !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;

    setDevToolsStatus({
      reduxDevTools: hasReduxDevTools,
      reactDevTools: hasReactDevTools,
      environment: process.env.NODE_ENV,
    });

    console.log('=== Development Tools Status ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Redux DevTools available:', hasReduxDevTools);
    console.log('React DevTools available:', hasReactDevTools);
    console.log('Video Player State:', {
      currentVideoUrl: videoState.currentVideoUrl?.substring(0, 50) + '...',
      isPlaying: videoState.isPlaying,
      currentTime: videoState.currentTime.toFixed(2),
      duration: videoState.duration.toFixed(2),
      volume: videoState.volume,
      isMuted: videoState.isMuted,
      isFullscreen: videoState.isFullscreen,
    });
    console.log('===============================');

    if (!hasReduxDevTools && process.env.NODE_ENV === 'development') {
      console.warn(
        '%c⚠️ Redux DevTools не найдены!',
        'color: #ff6b6b; font-weight: bold; font-size: 14px;'
      );
      console.info(
        'Установите расширение для браузера:\n' +
          'Chrome: https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd\n' +
          'Firefox: https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/'
      );
    }

    // Логируем изменения состояния видео
    const videoStateLog = {
      timestamp: new Date().toISOString(),
      action: 'STATE_UPDATE',
      state: videoState,
    };

    if (process.env.NODE_ENV === 'development') {
      localStorage.setItem('video_state_log', JSON.stringify(videoStateLog));
    }
  }, [videoState]);

  // Не отображаем ничего в production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px',
        display:
          devToolsStatus.environment === 'development' ? 'block' : 'none',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        🛠 DevTools Status
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div>
          Redux DevTools:
          <span
            style={{
              color: devToolsStatus.reduxDevTools ? '#4CAF50' : '#ff6b6b',
              marginLeft: '5px',
            }}
          >
            {devToolsStatus.reduxDevTools ? '✅' : '❌'}
          </span>
        </div>
        <div>
          React DevTools:
          <span
            style={{
              color: devToolsStatus.reactDevTools ? '#4CAF50' : '#ff6b6b',
              marginLeft: '5px',
            }}
          >
            {devToolsStatus.reactDevTools ? '✅' : '❌'}
          </span>
        </div>
        <div>
          Environment:
          <span
            style={{
              color:
                devToolsStatus.environment === 'development'
                  ? '#FFC107'
                  : '#4CAF50',
              marginLeft: '5px',
            }}
          >
            {devToolsStatus.environment}
          </span>
        </div>
      </div>
    </div>
  );
}
