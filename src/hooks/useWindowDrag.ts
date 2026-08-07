import { useRef, useEffect } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export function useWindowDrag<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, textarea, select')) return;
      getCurrentWindow().startDragging();
    };

    const handleDoubleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('dblclick', handleDoubleClick);
    return () => {
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('dblclick', handleDoubleClick);
    };
  }, []);

  return ref;
}
