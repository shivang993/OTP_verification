export const validatePhoneNumber = (phone) => {
  return /^\+?[1-9]\d{9,14}$/.test(phone.trim());
};
