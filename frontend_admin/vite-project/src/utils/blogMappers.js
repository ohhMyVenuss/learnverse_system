// Mappers để chuyển đổi dữ liệu từ API (backend) sang format UI

/**
 * User profile mapping helper
 * Lấy thông tin từ backend API (avatarUrl, role từ UserProfile và User)
 * 
 * @param {number|string} userId - ID của user
 * @param {string} userFullName - Tên đầy đủ của user
 * @param {string|null} userAvatarUrl - Avatar URL từ UserProfile (có thể null)
 * @param {string|null} userRole - Role từ User (ADMIN, INSTRUCTOR, STUDENT)
 * @returns {Object} Object chứa name, avatar, role
 */
export const mapUserToUi = (userId, userFullName, userAvatarUrl = null, userRole = null) => {
  const safeName = userFullName || 'Unknown User';
  const avatarSeed = userId ?? safeName;
  
  // Sử dụng avatarUrl từ backend nếu có, nếu không thì dùng placeholder
  const avatar = userAvatarUrl || `https://i.pravatar.cc/150?u=${avatarSeed}`;
  
  // Map role từ backend (ADMIN, TEACHER, STUDENT) sang lowercase
  // Backend có TEACHER (không phải INSTRUCTOR)
  let role = 'student'; // default
  if (userRole) {
    // userRole có thể là string hoặc object (nếu Jackson serialize enum thành object)
    let roleString = userRole;
    if (typeof userRole === 'object' && userRole !== null) {
      // Nếu là object, lấy name property
      roleString = userRole.name || userRole.toString();
    } else if (typeof userRole !== 'string') {
      // Nếu không phải string, convert sang string
      roleString = String(userRole);
    }
    
    const roleLower = roleString.toLowerCase();
    // Map TEACHER -> instructor để match với frontend
    if (roleLower === 'teacher') {
      role = 'instructor';
    } else {
      role = roleLower;
    }
  }
  
  console.log('mapUserToUi - Input:', { userId, userFullName, userAvatarUrl, userRole });
  console.log('mapUserToUi - Output role:', role);
  
  return {
    name: safeName,
    avatar: avatar,
    role: role,
  };
};

/**
 * Đệ quy chuyển CommentResponse (backend) sang cây comment cho UI
 * 
 * @param {Object} apiComment - CommentResponse từ backend
 * @returns {Object} Comment object cho UI
 */
export const mapCommentFromApi = (apiComment) => {
  // Debug: Log để kiểm tra data từ backend
  console.log('Mapping comment - Raw data:', {
    id: apiComment.id,
    userId: apiComment.userId,
    userFullName: apiComment.userFullName,
    userAvatarUrl: apiComment.userAvatarUrl,
    userRole: apiComment.userRole,
    userRoleType: typeof apiComment.userRole,
  });
  
  const user = mapUserToUi(
    apiComment.userId, 
    apiComment.userFullName, 
    apiComment.userAvatarUrl, 
    apiComment.userRole
  );
  
  console.log('Mapping comment - Mapped user:', user);
  
  return {
    id: apiComment.id,
    authorName: user.name,
    authorAvatar: user.avatar, // Thêm avatar vào comment
    role: user.role,
    content: apiComment.content,
    createdAt: apiComment.createdAt ? new Date(apiComment.createdAt).toLocaleString() : '',
    isBestAnswer: apiComment.bestAnswer || false, // Lấy từ backend (field đã đổi từ isBestAnswer thành bestAnswer)
    imageUrl: apiComment.imageUrl || null, // Lấy imageUrl từ backend
    reactionsCount: apiComment.totalReactions || 0, // Tổng số reaction
    reactionBreakdown: apiComment.reactionBreakdown || {}, // Breakdown theo từng loại reaction
    myReactionType: apiComment.myReactionType || null, // Loại reaction của user hiện tại
    replies: (apiComment.replies || []).map(mapCommentFromApi),
  };
};

/**
 * Chuyển dữ liệu từ PostResponse (backend) sang format UI
 * 
 * @param {Object} apiPost - PostResponse từ backend
 * @returns {Object} Post object cho UI
 */
export const mapPostFromApi = (apiPost) => {
  const user = mapUserToUi(
    apiPost.userId, 
    apiPost.userFullName, 
    apiPost.userAvatarUrl, 
    apiPost.userRole
  );
  return {
    id: apiPost.id,
    title: apiPost.title,
    content: apiPost.content,
    category: 'Community',
    role: user.role,
    authorName: user.name,
    authorAvatar: user.avatar,
    createdAt: apiPost.createdAt ? new Date(apiPost.createdAt).toLocaleString() : '',
    upvotes: apiPost.totalReactions ?? 0,
    reactionBreakdown: apiPost.reactionBreakdown || {}, // Breakdown theo từng loại reaction
    isReacted: apiPost.reacted ?? false,
    myReactionType: apiPost.myReactionType || null, // LIKE, LOVE, HAHA, WOW, SAD, ANGRY hoặc null
    tags: [], // backend chưa hỗ trợ tag
    bestAnswerId: apiPost.bestAnswerId || null, // Lấy từ backend
    totalComments: apiPost.totalComments ?? 0,
    comments: (apiPost.comments || []).map(mapCommentFromApi),
    imageUrl: apiPost.imageUrl || null, // Lấy imageUrl từ backend
  };
};

