export const getParticipantImage = (profileImage, profileImageType) => {
  if (!profileImage || !profileImageType) {
    return undefined;
  }

  const bytes = Object.values(profileImage);

  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return `data:${profileImageType};base64,${btoa(binary)}`;
};
