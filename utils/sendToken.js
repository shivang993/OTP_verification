export const sendToken = (user, statusCode, message, res) => {
  const token = user.generateToken();
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.user,
      email: user.email,
      // password: user.password,
      phone: user.phone,
    },
  });
};
