// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Check user type
  let userData;
  if (user.role === 'student' || user.studentId) {
    userData = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: 'student',
      department: user.department,
      year: user.year,
      semester: user.semester,
      rollNo: user.studentId,
      avatar: user.photo || null
    };
  } else if (user.role === 'faculty' || user.role?.role_name === 'faculty' || user.Name) {
    userData = {
      id: user.id,
      name: user.Name || user.name,
      email: user.email,
      role: 'faculty',
      designation: user.designation || null,
      department: user.department,
      avatar: user.profile_image_url || null
    };
  } else {
    userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role?.role_name || user.role,
      department: user.department,
      year: user.year,
      semester: user.semester,
      rollNo: user.rollNo,
      avatar: user.avatar || null
    };
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: userData
    });
};

export default sendTokenResponse;
