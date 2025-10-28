import { useEffect, useState } from 'react';
import { CRISIS_BOT_USERNAME } from '@/lib/crisisDetection';

const LAST_ACTIVITY_KEY = 'lastActivityTime';
const INACTIVITY_THRESHOLD_DAYS = 3;

export const useActivityTracker = (username: string | null) => {
  const [shouldShowCheckIn, setShouldShowCheckIn] = useState(false);

  useEffect(() => {
    if (!username) return;

    const now = Date.now();
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);

    if (lastActivity) {
      const daysSinceLastActivity = (now - parseInt(lastActivity)) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastActivity >= INACTIVITY_THRESHOLD_DAYS) {
        setShouldShowCheckIn(true);
      }
    }

    // Update last activity time
    localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
  }, [username]);

  const resetCheckIn = () => setShouldShowCheckIn(false);

  return {
    shouldShowCheckIn,
    resetCheckIn,
  };
};

export const CHECK_IN_MESSAGE = "Hey, I haven't seen you around in a while. Just wanted to check in - are you doing okay? I'm here if you need someone to talk to. 💙";
