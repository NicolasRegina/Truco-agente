import { useState, useEffect } from 'react';
import { profileService, PlayerProfile } from '../services/profileService';

export function usePlayerProfile(): PlayerProfile | null {
  const [profile, setProfile] = useState<PlayerProfile | null>(() => profileService.getCached());

  useEffect(() => {
    return profileService.subscribe((updated) => {
      setProfile(updated);
    });
  }, []);

  return profile;
}
