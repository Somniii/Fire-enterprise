
export const getAvatarGuardado = () => {
  if (typeof window !== 'undefined') {
    return parseInt(localStorage.getItem('avatarId') || '1');
  }
  return 1;
};

export const setAvatarGuardado = () => {
  if (typeof window !== 'undefined') {
    return parseInt(localStorage.getItem('avatarId') || '0');
  }
};