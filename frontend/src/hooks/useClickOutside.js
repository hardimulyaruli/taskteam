import { useEffect } from 'react'

function useClickOutside(ref, onOutsideClick) {
  useEffect(() => {
    function handlePointerDown(event) {
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }

      onOutsideClick()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [ref, onOutsideClick])
}

export default useClickOutside
