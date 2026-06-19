import React, { useState, useRef, useEffect } from 'react';
import { FiThumbsUp, FiHeart, FiSmile, FiMeh, FiFrown } from 'react-icons/fi';
import { FaLaugh, FaAngry } from 'react-icons/fa';

/**
 * Reaction types mapping với icons và colors
 */
const REACTION_CONFIG = {
  LIKE: { icon: FiThumbsUp, label: 'Like', color: '#1877F2', bgColor: 'bg-blue-100' },
  LOVE: { icon: FiHeart, label: 'Love', color: '#F02849', bgColor: 'bg-red-100' },
  HAHA: { icon: FaLaugh, label: 'Haha', color: '#F7B928', bgColor: 'bg-yellow-100' },
  WOW: { icon: FiSmile, label: 'Wow', color: '#F7B928', bgColor: 'bg-yellow-100' },
  SAD: { icon: FiFrown, label: 'Sad', color: '#F7B928', bgColor: 'bg-yellow-100' },
  ANGRY: { icon: FaAngry, label: 'Angry', color: '#E41E3A', bgColor: 'bg-red-100' },
};

/**
 * Component ReactionPicker giống Facebook
 * Hiển thị các icon reaction khi hover, click để chọn
 * 
 * @param {string|null} currentReaction - Reaction hiện tại của user (LIKE, LOVE, etc. hoặc null)
 * @param {number} totalReactions - Tổng số reactions
 * @param {Object} reactionBreakdown - Breakdown theo từng loại reaction {LIKE: 5, LOVE: 3, ...}
 * @param {Function} onReactionChange - Callback khi user chọn reaction (type: string | null)
 * @param {boolean} disabled - Disable picker
 */
const ReactionPicker = ({ currentReaction, totalReactions = 0, reactionBreakdown = {}, onReactionChange, disabled = false }) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);

  // Lấy top 3 reactions có nhiều người react nhất
  const getTopReactions = () => {
    const entries = Object.entries(reactionBreakdown || {});
    return entries
      .sort((a, b) => b[1] - a[1]) // Sort theo count giảm dần
      .slice(0, 3) // Lấy top 3
      .map(([type]) => type);
  };

  const topReactions = getTopReactions();

  // Đóng picker khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPicker]);

  const handleReactionClick = (type) => {
    // Nếu click vào reaction đã chọn thì bỏ reaction (gửi null)
    // Nếu click vào reaction khác thì đổi sang reaction đó
    if (currentReaction === type) {
      onReactionChange(null);
    } else {
      onReactionChange(type);
    }
    setShowPicker(false);
  };

  const getDisplayIcon = () => {
    if (currentReaction && REACTION_CONFIG[currentReaction]) {
      const Icon = REACTION_CONFIG[currentReaction].icon;
      return <Icon className="w-5 h-5" style={{ color: REACTION_CONFIG[currentReaction].color }} />;
    }
    return <FiThumbsUp className="w-5 h-5 text-gray-600" />;
  };

  const getDisplayLabel = () => {
    if (currentReaction && REACTION_CONFIG[currentReaction]) {
      return REACTION_CONFIG[currentReaction].label;
    }
    return 'Like';
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Reaction Button */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onMouseEnter={() => !disabled && setShowPicker(true)}
        onMouseLeave={() => {
          // Delay để user có thể di chuyển vào picker
          setTimeout(() => {
            if (pickerRef.current && !pickerRef.current.matches(':hover')) {
              setShowPicker(false);
            }
          }, 200);
        }}
        onClick={() => {
          // Click nhanh để toggle like
          if (!currentReaction) {
            handleReactionClick('LIKE');
          } else if (currentReaction === 'LIKE') {
            handleReactionClick('LIKE'); // Bỏ like (sẽ gửi null)
          } else {
            // Nếu đang có reaction khác, đổi về LIKE
            handleReactionClick('LIKE');
          }
        }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
          currentReaction
            ? `${REACTION_CONFIG[currentReaction]?.bgColor || 'bg-blue-100'} font-semibold`
            : 'hover:bg-gray-100 text-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {/* Top 3 Reaction Icons (giống Facebook) */}
        {topReactions.length > 0 ? (
          <div className="flex items-center -space-x-1">
            {topReactions.map((type) => {
              const Icon = REACTION_CONFIG[type]?.icon;
              if (!Icon) return null;
              return (
                <div key={type} className="w-5 h-5 rounded-full bg-white flex items-center justify-center" style={{ zIndex: topReactions.indexOf(type) }}>
                  <Icon className="w-4 h-4" style={{ color: REACTION_CONFIG[type].color }} />
                </div>
              );
            })}
          </div>
        ) : (
          getDisplayIcon()
        )}
        <span className="text-sm">{totalReactions > 0 ? totalReactions : getDisplayLabel()}</span>
      </button>

      {/* Reaction Picker Popup */}
      {showPicker && !disabled && (
        <div
          ref={pickerRef}
          onMouseEnter={() => setShowPicker(true)}
          onMouseLeave={() => setShowPicker(false)}
          className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-2xl border border-gray-200 p-2 flex items-center gap-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {Object.entries(REACTION_CONFIG).map(([type, config]) => {
            const Icon = config.icon;
            const isActive = currentReaction === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleReactionClick(type)}
                className={`p-2 rounded-full transition-all transform hover:scale-125 ${
                  isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
                title={config.label}
              >
                <Icon
                  className="w-6 h-6"
                  style={{
                    color: config.color,
                    filter: isActive ? 'none' : 'grayscale(0%)',
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReactionPicker;

