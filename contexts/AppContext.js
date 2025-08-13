'use client'

import { createContext, useContext, useReducer, useCallback } from 'react'

// Initial State
const initialState = {
  cat: {
    state: 'sitting',
    position: { x: 50, y: 50 },
    direction: 'right',
    isTransitioning: false,
    lastStateChange: Date.now()
  },
  sound: {
    isMuted: false,
    isPlaying: false,
    volume: 0.3,
    hasError: false,
    isSupported: true
  },
  chat: {
    messages: [],
    isTyping: false,
    unreadCount: 0
  },
  ui: {
    isLoading: false,
    showSettings: false,
    theme: 'default',
    isMobile: false
  }
}

// Action Types
const ActionTypes = {
  // Cat Actions
  SET_CAT_STATE: 'SET_CAT_STATE',
  SET_CAT_POSITION: 'SET_CAT_POSITION',
  SET_CAT_DIRECTION: 'SET_CAT_DIRECTION',
  SET_CAT_TRANSITIONING: 'SET_CAT_TRANSITIONING',
  
  // Sound Actions
  SET_SOUND_MUTED: 'SET_SOUND_MUTED',
  SET_SOUND_PLAYING: 'SET_SOUND_PLAYING',
  SET_SOUND_VOLUME: 'SET_SOUND_VOLUME',
  SET_SOUND_ERROR: 'SET_SOUND_ERROR',
  SET_SOUND_SUPPORTED: 'SET_SOUND_SUPPORTED',
  UPDATE_SOUND_STATE: 'UPDATE_SOUND_STATE',
  
  // Chat Actions
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_TYPING: 'SET_TYPING',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  
  // UI Actions
  SET_LOADING: 'SET_LOADING',
  TOGGLE_SETTINGS: 'TOGGLE_SETTINGS',
  SET_THEME: 'SET_THEME',
  SET_MOBILE: 'SET_MOBILE'
}

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    // Cat Actions
    case ActionTypes.SET_CAT_STATE:
      return {
        ...state,
        cat: {
          ...state.cat,
          state: action.payload,
          lastStateChange: Date.now()
        }
      }
      
    case ActionTypes.SET_CAT_POSITION:
      return {
        ...state,
        cat: {
          ...state.cat,
          position: action.payload
        }
      }
      
    case ActionTypes.SET_CAT_DIRECTION:
      return {
        ...state,
        cat: {
          ...state.cat,
          direction: action.payload
        }
      }
      
    case ActionTypes.SET_CAT_TRANSITIONING:
      return {
        ...state,
        cat: {
          ...state.cat,
          isTransitioning: action.payload
        }
      }
      
    // Sound Actions
    case ActionTypes.UPDATE_SOUND_STATE:
      return {
        ...state,
        sound: {
          ...state.sound,
          ...action.payload
        }
      }
      
    case ActionTypes.SET_SOUND_MUTED:
      return {
        ...state,
        sound: {
          ...state.sound,
          isMuted: action.payload
        }
      }
      
    case ActionTypes.SET_SOUND_PLAYING:
      return {
        ...state,
        sound: {
          ...state.sound,
          isPlaying: action.payload
        }
      }
      
    case ActionTypes.SET_SOUND_VOLUME:
      return {
        ...state,
        sound: {
          ...state.sound,
          volume: action.payload
        }
      }
      
    // Chat Actions
    case ActionTypes.ADD_MESSAGE:
      return {
        ...state,
        chat: {
          ...state.chat,
          messages: [...state.chat.messages, action.payload],
          unreadCount: action.payload.sender === 'cat' 
            ? state.chat.unreadCount + 1 
            : state.chat.unreadCount
        }
      }
      
    case ActionTypes.SET_TYPING:
      return {
        ...state,
        chat: {
          ...state.chat,
          isTyping: action.payload
        }
      }
      
    case ActionTypes.CLEAR_MESSAGES:
      return {
        ...state,
        chat: {
          ...state.chat,
          messages: [],
          unreadCount: 0
        }
      }
      
    case ActionTypes.SET_UNREAD_COUNT:
      return {
        ...state,
        chat: {
          ...state.chat,
          unreadCount: action.payload
        }
      }
      
    // UI Actions
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        ui: {
          ...state.ui,
          isLoading: action.payload
        }
      }
      
    case ActionTypes.TOGGLE_SETTINGS:
      return {
        ...state,
        ui: {
          ...state.ui,
          showSettings: !state.ui.showSettings
        }
      }
      
    case ActionTypes.SET_THEME:
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload
        }
      }
      
    case ActionTypes.SET_MOBILE:
      return {
        ...state,
        ui: {
          ...state.ui,
          isMobile: action.payload
        }
      }
      
    default:
      return state
  }
}

// Context
const AppContext = createContext()

// Provider Component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Cat Actions
  const setCatState = useCallback((newState) => {
    dispatch({ type: ActionTypes.SET_CAT_STATE, payload: newState })
  }, [])

  const setCatPosition = useCallback((position) => {
    dispatch({ type: ActionTypes.SET_CAT_POSITION, payload: position })
  }, [])

  const setCatDirection = useCallback((direction) => {
    dispatch({ type: ActionTypes.SET_CAT_DIRECTION, payload: direction })
  }, [])

  const setCatTransitioning = useCallback((isTransitioning) => {
    dispatch({ type: ActionTypes.SET_CAT_TRANSITIONING, payload: isTransitioning })
  }, [])

  // Sound Actions
  const updateSoundState = useCallback((soundState) => {
    dispatch({ type: ActionTypes.UPDATE_SOUND_STATE, payload: soundState })
  }, [])

  const setSoundMuted = useCallback((isMuted) => {
    dispatch({ type: ActionTypes.SET_SOUND_MUTED, payload: isMuted })
  }, [])

  const setSoundPlaying = useCallback((isPlaying) => {
    dispatch({ type: ActionTypes.SET_SOUND_PLAYING, payload: isPlaying })
  }, [])

  const setSoundVolume = useCallback((volume) => {
    dispatch({ type: ActionTypes.SET_SOUND_VOLUME, payload: volume })
  }, [])

  // Chat Actions
  const addMessage = useCallback((message) => {
    dispatch({ type: ActionTypes.ADD_MESSAGE, payload: message })
  }, [])

  const setTyping = useCallback((isTyping) => {
    dispatch({ type: ActionTypes.SET_TYPING, payload: isTyping })
  }, [])

  const clearMessages = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_MESSAGES })
  }, [])

  const setUnreadCount = useCallback((count) => {
    dispatch({ type: ActionTypes.SET_UNREAD_COUNT, payload: count })
  }, [])

  // UI Actions
  const setLoading = useCallback((isLoading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: isLoading })
  }, [])

  const toggleSettings = useCallback(() => {
    dispatch({ type: ActionTypes.TOGGLE_SETTINGS })
  }, [])

  const setTheme = useCallback((theme) => {
    dispatch({ type: ActionTypes.SET_THEME, payload: theme })
  }, [])

  const setMobile = useCallback((isMobile) => {
    dispatch({ type: ActionTypes.SET_MOBILE, payload: isMobile })
  }, [])

  // Computed Values
  const computedValues = {
    // Cat computed values
    catStateDisplayName: {
      sitting: 'Oturuyor',
      walking: 'Yürüyor',
      sleeping: 'Uyuyor',
      loving: 'Seni seviyor'
    }[state.cat.state] || 'Bilinmiyor',
    
    catStateEmoji: {
      sitting: '🪑',
      walking: '🚶',
      sleeping: '😴',
      loving: '💕'
    }[state.cat.state] || '🐱',
    
    // Sound computed values
    soundStatusText: state.sound.hasError 
      ? 'Ses hatası' 
      : !state.sound.isSupported 
        ? 'Ses desteklenmiyor'
        : state.sound.isMuted 
          ? 'Ses kapalı' 
          : state.sound.isPlaying 
            ? 'Ses açık' 
            : 'Ses hazır',
    
    // Chat computed values
    totalMessages: state.chat.messages.length,
    userMessages: state.chat.messages.filter(msg => msg.sender === 'user').length,
    catMessages: state.chat.messages.filter(msg => msg.sender === 'cat').length,
    
    // UI computed values
    isMobileLayout: state.ui.isMobile || (typeof window !== 'undefined' && window.innerWidth < 768)
  }

  const value = {
    // State
    state,
    
    // Cat Actions
    setCatState,
    setCatPosition,
    setCatDirection,
    setCatTransitioning,
    
    // Sound Actions
    updateSoundState,
    setSoundMuted,
    setSoundPlaying,
    setSoundVolume,
    
    // Chat Actions
    addMessage,
    setTyping,
    clearMessages,
    setUnreadCount,
    
    // UI Actions
    setLoading,
    toggleSettings,
    setTheme,
    setMobile,
    
    // Computed Values
    ...computedValues
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Custom Hook
export const useApp = () => {
  const context = useContext(AppContext)
  
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  
  return context
}

// Selector Hooks (for performance)
export const useCatState = () => {
  const { state, setCatState, setCatPosition, setCatDirection, setCatTransitioning, catStateDisplayName, catStateEmoji } = useApp()
  
  return {
    cat: state.cat,
    setCatState,
    setCatPosition,
    setCatDirection,
    setCatTransitioning,
    displayName: catStateDisplayName,
    emoji: catStateEmoji
  }
}

export const useSoundState = () => {
  const { state, updateSoundState, setSoundMuted, setSoundPlaying, setSoundVolume, soundStatusText } = useApp()
  
  return {
    sound: state.sound,
    updateSoundState,
    setSoundMuted,
    setSoundPlaying,
    setSoundVolume,
    statusText: soundStatusText
  }
}

export const useChatState = () => {
  const { state, addMessage, setTyping, clearMessages, setUnreadCount, totalMessages, userMessages, catMessages } = useApp()
  
  return {
    chat: state.chat,
    addMessage,
    setTyping,
    clearMessages,
    setUnreadCount,
    stats: {
      total: totalMessages,
      user: userMessages,
      cat: catMessages
    }
  }
}

export const useUIState = () => {
  const { state, setLoading, toggleSettings, setTheme, setMobile, isMobileLayout } = useApp()
  
  return {
    ui: state.ui,
    setLoading,
    toggleSettings,
    setTheme,
    setMobile,
    isMobileLayout
  }
}