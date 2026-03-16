// Get token from model, create cookie and send response

// helper to normalize an avatar/url string much like frontend version
const normalizeUrl = (url) => {
  if (!url) return null;
  // if contains /uploads/, drop everything before it
  const idx = url.indexOf('/uploads/');
  if (idx !== -1) return url.slice(idx);
  // if backslash style
  const normalized = url.replace(/\\/g, '/');
  const idx2 = normalized.indexOf('/uploads/');
  if (idx2 !== -1) return normalized.slice(idx2);
  // bare filename
  if (/^[^\/]+\.[^\/]+$/.test(url)) return `/uploads/${url}`;
  return url;
};

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
      avatar: normalizeUrl(user.photo) || null
    };
  } else if (user.role === 'faculty' || user.role?.role_name === 'faculty' || user.Name) {
    const isDeptAdmin = user.role_id === 7 || (user.role && user.role.role_id === 7);
    userData = {
      id: user.faculty_id || user.id,
      name: user.Name || user.name,
      email: user.email,
      role: isDeptAdmin ? 'department-admin' : 'faculty',
      designation: user.designation || null,
      department: user.department,
      avatar: normalizeUrl(user.profile_image_url) || null
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
      avatar: normalizeUrl(user.avatar) || null
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
