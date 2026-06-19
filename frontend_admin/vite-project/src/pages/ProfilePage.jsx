
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { profileApi } from '../api/profileApi';
import { uploadImage } from '../utils/cloudinaryUpload';
import { mapPostFromApi } from '../utils/blogMappers';
import ContributionHeatmap from '../components/ContributionHeatmap';
import { FiMapPin, FiBook, FiAward, FiEdit2, FiSave, FiCamera, FiPhone, FiCalendar, FiX, FiMessageSquare, FiClock } from 'react-icons/fi';

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State quản lý chế độ Edit
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State quản lý active tab
  const [activeTab, setActiveTab] = useState('posts');
  
  // State lưu profile data từ backend
  const [profile, setProfile] = useState(null);
  
  // State cho posts và courses
  const [myPosts, setMyPosts] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  
  // State cho statistics và contributions
  const [userStats, setUserStats] = useState({
    postsCount: 0,
    commentsCount: 0,
    coursesApprovedCount: 0,
    totalContributions: 0,
  });
  const [contributions, setContributions] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingContributions, setLoadingContributions] = useState(false);
  
  // State cho avatar upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // State lưu dữ liệu form (original data để reset khi cancel)
  const [originalFormData, setOriginalFormData] = useState({
    bio: '',
    birthday: '',
    phone: '',
    address: '',
    socialLinks: '',
    avatarUrl: ''
  });
  
  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    bio: '',
    birthday: '',
    phone: '',
    address: '',
    socialLinks: '',
    avatarUrl: ''
  });

  // Load profile từ backend
  useEffect(() => {
    loadProfile();
  }, []);

  // Load posts và courses khi tab thay đổi
  useEffect(() => {
    if (activeTab === 'posts') {
      loadMyPosts();
    } else if (activeTab === 'courses') {
      loadEnrolledCourses();
    } else if (activeTab === 'statistics') {
      loadStatistics();
      loadContributions();
    }
  }, [activeTab]);

  // Load statistics khi component mount
  useEffect(() => {
    loadStatistics();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getMyProfile();
      setProfile(data);
      
      // Handle socialLinks - if it's already a string, use it as is; if it's an object, stringify it
      let socialLinksValue = '';
      if (data.socialLinks) {
        if (typeof data.socialLinks === 'string') {
          socialLinksValue = data.socialLinks;
        } else {
          socialLinksValue = JSON.stringify(data.socialLinks, null, 2); // Pretty print
        }
      }
      
      const initialFormData = {
        bio: data.bio || '',
        birthday: data.birthday || '',
        phone: data.phone || '',
        address: data.address || '',
        socialLinks: socialLinksValue,
        avatarUrl: data.avatarUrl || user?.avatar || ''
      };
      setFormData(initialFormData);
      setOriginalFormData(initialFormData); // Lưu original data để reset khi cancel
    } catch (error) {
      console.error('Error loading profile:', error);
      // If profile doesn't exist yet (404), that's okay - user can create it
      if (error.response?.status !== 404) {
        alert('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCancel = () => {
    // Reset form data về original
    setFormData(originalFormData);
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      try {
        setUploadingAvatar(true);
        const imageUrl = await uploadImage(file);
        setFormData({ ...formData, avatarUrl: imageUrl });
      } catch (error) {
        console.error('Error uploading avatar:', error);
        alert('Failed to upload avatar. Please try again.');
      } finally {
        setUploadingAvatar(false);
      }
    };
    input.click();
  };

  const loadMyPosts = async () => {
    try {
      setLoadingPosts(true);
      const data = await profileApi.getMyPosts();
      setMyPosts(data.map(mapPostFromApi));
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const loadEnrolledCourses = async () => {
    try {
      setLoadingCourses(true);
      const data = await profileApi.getEnrolledCourses();
      setEnrolledCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadStatistics = async () => {
    try {
      setLoadingStats(true);
      const data = await profileApi.getMyStatistics();
      setUserStats(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadContributions = async () => {
    try {
      setLoadingContributions(true);
      const data = await profileApi.getMyContributions();
      setContributions(data);
    } catch (error) {
      console.error('Error loading contributions:', error);
    } finally {
      setLoadingContributions(false);
    }
  };

  const validateForm = () => {
    // Validate phone number (optional, but if provided should be valid)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        alert('Please enter a valid phone number');
        return false;
      }
    }

    // Validate avatar URL (optional, but if provided should be valid URL)
    if (formData.avatarUrl && formData.avatarUrl.trim()) {
      try {
        new URL(formData.avatarUrl.trim());
      } catch (e) {
        alert('Please enter a valid URL for avatar');
        return false;
      }
    }
      
      // Validate JSON format if socialLinks is not empty
      if (formData.socialLinks && formData.socialLinks.trim()) {
        try {
        JSON.parse(formData.socialLinks);
        } catch (e) {
          alert('Invalid JSON format in Social Links field. Please use format: {"github": "url", "linkedin": "url"}');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      // Send socialLinks as string (backend expects string, not object)
      const profileData = {
        ...formData,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        bio: formData.bio.trim() || null,
        avatarUrl: formData.avatarUrl.trim() || null,
        socialLinks: formData.socialLinks.trim() || null
      };
      
      const updatedProfile = await profileApi.updateProfile(profileData);
      setProfile(updatedProfile);
      
      // Update original form data
      setOriginalFormData(formData);
      setIsEditing(false);
      
      // Reload profile to get latest data
      await loadProfile();
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>;
  if (!user) return <div className="p-10 text-center">Please log in to view profile</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER PROFILE --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Cover Image (Giả lập) */}
          <div className="h-32 bg-gradient-to-r from-[#2D2B4A] to-[#EA454C]"></div>
          
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 mb-6">
              
              {/* Avatar */}
              <div className="relative">
                {uploadingAvatar ? (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA454C]"></div>
                  </div>
                ) : (
                <img 
                  src={formData.avatarUrl || user?.avatar} 
                  alt="Avatar" 
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md bg-white"
                />
                )}
                {isEditing && (
                  <button 
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50" 
                    title="Upload Avatar"
                  >
                    <FiCamera />
                  </button>
                )}
              </div>

              {/* Info & Actions */}
              <div className="mt-4 md:mt-0 md:ml-6 flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{user.fullName || user.email}</h1>
                <p className="text-gray-500 text-sm">{user.email}</p>
                {formData.bio && <p className="text-gray-600 mt-2 text-sm">{formData.bio}</p>}
              </div>

              {/* Nút Edit/Save/Cancel */}
              <div className="mt-4 md:mt-0 flex gap-2">
                {isEditing ? (
                  <>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-[#EA454C] text-white rounded-lg font-medium hover:bg-[#d93e45] transition-colors disabled:opacity-50"
                  >
                    <FiSave className="mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                    <button 
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <FiX className="mr-2" /> Cancel
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    <FiEdit2 className="mr-2" /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Detail Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                {/* Phone */}
                <div className="flex items-center text-gray-600">
                   <FiPhone className="mr-3 text-[#EA454C]" />
                   {isEditing ? (
                     <input name="phone" value={formData.phone} onChange={handleChange} className="border rounded px-2 py-1 w-full text-sm" placeholder="Phone number" />
                   ) : (
                     <span>{formData.phone || "Add phone"}</span>
                   )}
                </div>

                {/* Birthday */}
                <div className="flex items-center text-gray-600">
                   <FiCalendar className="mr-3 text-[#EA454C]" />
                   {isEditing ? (
                     <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className="border rounded px-2 py-1 w-full text-sm" />
                   ) : (
                     <span>{formData.birthday || "Add birthday"}</span>
                   )}
                </div>

                {/* Address */}
                <div className="flex items-center text-gray-600 md:col-span-2">
                   <FiMapPin className="mr-3 text-[#EA454C]" />
                   {isEditing ? (
                     <input name="address" value={formData.address} onChange={handleChange} className="border rounded px-2 py-1 w-full text-sm" placeholder="Address" />
                   ) : (
                     <span>{formData.address || "Add address"}</span>
                   )}
                </div>
            </div>

            {/* Social Links Section */}
            {formData.socialLinks && !isEditing && (() => {
              try {
                const links = JSON.parse(formData.socialLinks);
                return (
                  <div className="pt-6 border-t border-gray-100 mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Social Links</h3>
                    <div className="flex gap-3">
                      {links.facebook && (
                        <a href={links.facebook} target="_blank" rel="noopener noreferrer" 
                           className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                          Facebook
                        </a>
                      )}
                      {links.github && (
                        <a href={links.github} target="_blank" rel="noopener noreferrer" 
                           className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900 transition-colors">
                          GitHub
                        </a>
                      )}
                      {links.linkedin && (
                        <a href={links.linkedin} target="_blank" rel="noopener noreferrer" 
                           className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm hover:bg-blue-800 transition-colors">
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                );
              } catch (e) {
                return null;
              }
            })()}
          </div>
        </div>

        {/* --- STATS & CONTENT SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Cột Trái: Thống kê */}
           <div className="lg:col-span-1 space-y-6">
              {/* Stats Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-900 mb-4">Your Statistics</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <span className="text-gray-500">Forum Posts</span>
                       <span className="font-bold text-gray-900">
                         {loadingStats ? '...' : userStats.postsCount || 0}
                       </span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-gray-500">Comments</span>
                       <span className="font-bold text-gray-900">
                         {loadingStats ? '...' : userStats.commentsCount || 0}
                       </span>
                    </div>
                    {userStats.coursesApprovedCount > 0 && (
                      <div className="flex justify-between items-center">
                         <span className="text-gray-500">Courses Approved</span>
                         <span className="font-bold text-gray-900">
                           {loadingStats ? '...' : userStats.coursesApprovedCount || 0}
                         </span>
                      </div>
                    )}
                 </div>
              </div>

              {/* Editing Details */}
              {isEditing && (
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Additional Details</h3>
                    <div className="space-y-3">
                       <div>
                          <label className="block text-xs text-gray-500 mb-1">Bio</label>
                          <textarea 
                            name="bio" 
                            value={formData.bio} 
                            onChange={handleChange} 
                            className="border rounded px-3 py-2 w-full text-sm" 
                            rows="3"
                            placeholder="Tell us about yourself"
                          />
                       </div>
                       <div>
                          <label className="block text-xs text-gray-500 mb-1">Avatar</label>
                          <div className="flex items-center gap-2">
                            <input 
                              name="avatarUrl" 
                              value={formData.avatarUrl} 
                              onChange={handleChange} 
                              className="border rounded px-3 py-2 flex-1 text-sm" 
                              placeholder="Avatar URL (or click camera icon to upload)" 
                            />
                            <button
                              type="button"
                              onClick={handleAvatarClick}
                              disabled={uploadingAvatar}
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm transition-colors disabled:opacity-50"
                            >
                              {uploadingAvatar ? 'Uploading...' : 'Upload'}
                            </button>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Click Upload to select image from your computer</p>
                       </div>
                       <div>
                          <label className="block text-xs text-gray-500 mb-1">Social Links (JSON)</label>
                          <textarea 
                            name="socialLinks" 
                            value={formData.socialLinks} 
                            onChange={handleChange} 
                            className="border rounded px-3 py-2 w-full text-sm font-mono" 
                            rows="4"
                            placeholder='{"github": "https://github.com/username", "linkedin": "https://linkedin.com/in/username", "facebook": "https://facebook.com/username"}' 
                          />
                          <p className="text-xs text-gray-400 mt-1">Enter valid JSON format for social media links</p>
                       </div>
                    </div>
                 </div>
              )}
           </div>

           {/* Cột Phải: Nội dung chính (Tabs giả lập) */}
           <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[300px] p-6">
                 {/* Tabs */}
                 <div className="flex border-b border-gray-100 mb-6">
                    <button 
                      onClick={() => setActiveTab('posts')}
                      className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'posts' 
                          ? 'text-[#EA454C] border-b-2 border-[#EA454C]' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      My Posts
                    </button>
                    <button 
                      onClick={() => setActiveTab('courses')}
                      className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'courses' 
                          ? 'text-[#EA454C] border-b-2 border-[#EA454C]' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Enrolled Courses
                    </button>
                    <button 
                      onClick={() => setActiveTab('statistics')}
                      className={`px-4 py-2 font-medium transition-colors ${
                        activeTab === 'statistics' 
                          ? 'text-[#EA454C] border-b-2 border-[#EA454C]' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      My Statistics
                    </button>
                 </div>

                 {/* Content based on active tab */}
                 {activeTab === 'posts' && (
                   <div>
                     {loadingPosts ? (
                       <div className="text-center py-10">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA454C] mx-auto"></div>
                         <p className="mt-4 text-gray-500">Loading posts...</p>
                       </div>
                     ) : myPosts.length === 0 ? (
                 <div className="text-center py-10 text-gray-400">
                    <p>You haven't posted anything yet.</p>
                         <button 
                           onClick={() => navigate('/blog')}
                           className="mt-4 px-4 py-2 bg-[#EA454C] text-white rounded-lg text-sm hover:bg-[#d93e45] transition-colors"
                         >
                           Create New Post
                         </button>
                       </div>
                     ) : (
                       <div className="space-y-4">
                         {myPosts.map((post) => (
                           <div 
                             key={post.id}
                             className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                             onClick={() => navigate('/blog')}
                           >
                             <div className="flex items-start justify-between">
                               <div className="flex-1">
                                 <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                                 <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.content}</p>
                                 <div className="flex items-center gap-4 text-xs text-gray-500">
                                   <span className="flex items-center gap-1">
                                     <FiClock className="w-4 h-4" />
                                     {post.createdAt}
                                   </span>
                                   <span className="flex items-center gap-1">
                                     <FiMessageSquare className="w-4 h-4" />
                                     {post.totalComments} comments
                                   </span>
                                   <span className="flex items-center gap-1">
                                     👍 {post.upvotes} reactions
                                   </span>
                                 </div>
                               </div>
                               {post.imageUrl && (
                                 <img 
                                   src={post.imageUrl} 
                                   alt="Post" 
                                   className="w-24 h-24 object-cover rounded-lg ml-4"
                                 />
                               )}
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 )}
                 {activeTab === 'courses' && (
                   <div>
                     {loadingCourses ? (
                       <div className="text-center py-10">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA454C] mx-auto"></div>
                         <p className="mt-4 text-gray-500">Loading courses...</p>
                       </div>
                     ) : enrolledCourses.length === 0 ? (
                       <div className="text-center py-10 text-gray-400">
                         <p>You haven't enrolled in any courses yet.</p>
                         <button 
                           onClick={() => navigate('/')}
                           className="mt-4 px-4 py-2 bg-[#EA454C] text-white rounded-lg text-sm hover:bg-[#d93e45] transition-colors"
                         >
                           Browse Courses
                         </button>
                       </div>
                     ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {enrolledCourses.map((course) => (
                           <div 
                             key={course.id}
                             className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                             onClick={() => navigate(`/courses/${course.id}`)}
                           >
                             <div className="flex items-start gap-4">
                               {course.imageUrl ? (
                                 <img 
                                   src={course.imageUrl} 
                                   alt={course.title}
                                   className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                 />
                               ) : (
                                 <div className="w-20 h-20 bg-gradient-to-br from-[#EA454C] to-[#2D2B4A] rounded-lg flex items-center justify-center flex-shrink-0">
                                   <FiBook className="w-8 h-8 text-white" />
                                 </div>
                               )}
                               <div className="flex-1 min-w-0">
                                 <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                                 <p className="text-sm text-gray-600 line-clamp-2 mb-2">{course.description || 'No description'}</p>
                                 <div className="flex items-center gap-2 text-xs text-gray-500">
                                   <span className="px-2 py-1 bg-gray-100 rounded">
                                     {course.status || 'APPROVED'}
                                   </span>
                                 </div>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 )}
                 {activeTab === 'statistics' && (
                   <div>
                     {loadingContributions ? (
                       <div className="text-center py-10">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA454C] mx-auto"></div>
                         <p className="mt-4 text-gray-500">Loading statistics...</p>
                       </div>
                     ) : (
                       <div>
                         <ContributionHeatmap contributions={contributions} />
                         <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                           <h4 className="font-semibold text-gray-900 mb-2">Contribution Summary</h4>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                             <div>
                               <p className="text-gray-500">Total Contributions</p>
                               <p className="text-2xl font-bold text-gray-900">{userStats.totalContributions || 0}</p>
                             </div>
                             <div>
                               <p className="text-gray-500">Posts</p>
                               <p className="text-2xl font-bold text-gray-900">{userStats.postsCount || 0}</p>
                             </div>
                             <div>
                               <p className="text-gray-500">Comments</p>
                               <p className="text-2xl font-bold text-gray-900">{userStats.commentsCount || 0}</p>
                             </div>
                             {userStats.coursesApprovedCount > 0 && (
                               <div>
                                 <p className="text-gray-500">Courses Approved</p>
                                 <p className="text-2xl font-bold text-gray-900">{userStats.coursesApprovedCount || 0}</p>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                 )}
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}

export default ProfilePage;