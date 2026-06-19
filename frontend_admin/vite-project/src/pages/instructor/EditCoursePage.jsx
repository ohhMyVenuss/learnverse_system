import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiTrash2, FiUploadCloud, FiPlus, FiVideo, FiLayers, FiCheckCircle, FiBookOpen, FiHelpCircle, FiCpu } from 'react-icons/fi';
import Button from '../../components/Button';
import courseService from '../../services/courseService';
import uploadService from '../../services/uploadService';
import { courseApi } from '../../api/courseApi';
import { quizApi } from '../../api/quizApi';

function EditCoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    category: '',
    price: '',
    level: 'Beginner',
    thumbnail: '',
    overview: '',
    includes: '',
  });
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [aiGeneratingMap, setAiGeneratingMap] = useState({});

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await quizApi.getMyQuizzes();
        setQuizzes(data);
      } catch (err) {
        console.error("Lỗi khi tải ngân hàng đề:", err);
      }
    };
    fetchQuizzes();
  }, []);

  const handleAIQuizUpload = async (file, sectionId, lectureId) => {
    if (!file) return;
    const progressKey = `${sectionId}-${lectureId}`;
    setAiGeneratingMap(prev => ({ ...prev, [progressKey]: true }));

    try {
      const targetSection = lessons.find(s => s.id === sectionId);
      const targetLecture = targetSection.lectures.find(l => l.id === lectureId);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', `Trắc nghiệm bài: ${targetLecture.title || 'Bài học'}`);
      formData.append('numberOfQuestions', 5);
      formData.append('difficultyLevel', 'MEDIUM');
      formData.append('subject', courseData.category || 'General');
      formData.append('isPublic', false);

      const generatedQuiz = await quizApi.generateQuiz(formData);
      if (generatedQuiz && generatedQuiz.id) {
        setLessons(prev => prev.map(section => {
          if (section.id === sectionId) {
            const updatedLectures = section.lectures.map(l => {
              if (l.id === lectureId) {
                return {
                  ...l,
                  quizId: generatedQuiz.id,
                  quizTitle: generatedQuiz.title
                };
              }
              return l;
            });
            return { ...section, lectures: updatedLectures };
          }
          return section;
        }));
        setQuizzes(prev => [generatedQuiz, ...prev]);
        alert('Tự động tạo bộ trắc nghiệm AI thành công!');
      } else {
        alert('Tạo trắc nghiệm thất bại!');
      }
    } catch (error) {
      console.error(error);
      alert('Lỗi tạo trắc nghiệm AI: ' + (error.message || 'Lỗi server'));
    } finally {
      setAiGeneratingMap(prev => {
        const newMap = { ...prev };
        delete newMap[progressKey];
        return newMap;
      });
    }
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          courseService.getCourseDetail(id),
          courseApi.getLessonsByCourse(id),
        ]);
        
        if (courseRes.success) {
          const c = courseRes.data;
          setCourseData({
            title: c.title || '',
            category: c.category || '',
            price: c.price ?? '',
            level: c.level || 'Beginner',
            thumbnail: c.thumbnail || '',
            overview: c.overview || c.description || '',
            includes: c.includes || '',
          });
        }

        // Chuyển đổi lessons thành format curriculum (group by sections)
        if (lessonsRes && Array.isArray(lessonsRes)) {
          const curriculum = [{
            id: 1,
            title: 'Course Content',
            lectures: lessonsRes.map((lesson, index) => ({
              id: lesson.id,
              title: lesson.title || '',
              videoUrl: lesson.videoUrl || '',
              orderIndex: lesson.orderIndex || index + 1,
              flashcards: lesson.flashcards || [],
              quizId: lesson.quiz ? lesson.quiz.id : null,
              quizTitle: lesson.quiz ? lesson.quiz.title : '',
              quizSelectorMode: lesson.quiz ? 'bank' : 'none',
            })),
          }];
          setLessons(curriculum);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const result = await uploadService.uploadFile(file);
    setIsUploading(false);
    if (result.success) {
      setCourseData((prev) => ({ ...prev, thumbnail: result.url }));
    } else {
      alert('Upload ảnh thất bại!');
    }
  };

  const addSection = () => {
    setLessons([...lessons, { id: Date.now(), title: '', lectures: [] }]);
  };

  const addLecture = (sectionId) => {
    const updatedLessons = lessons.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          lectures: [...section.lectures, { id: Date.now(), title: '', videoUrl: '', isNew: true, flashcards: [], quizId: null, quizTitle: '' }]
        };
      }
      return section;
    });
    setLessons(updatedLessons);
  };

  const handleVideoUpload = async (file, sectionId, lectureId) => {
    setIsUploading(true);
    const result = await uploadService.uploadFile(file);
    setIsUploading(false);

    if (result.success) {
      const updatedLessons = lessons.map(section => {
        if (section.id === sectionId) {
          const updatedLectures = section.lectures.map(lecture => {
            if (lecture.id === lectureId) return { ...lecture, videoUrl: result.url };
            return lecture;
          });
          return { ...section, lectures: updatedLectures };
        }
        return section;
      });
      setLessons(updatedLessons);
    } else {
      alert("Upload video thất bại!");
    }
  };

  const deleteLecture = async (sectionId, lectureId, lecture) => {
    if (!lecture.isNew && lecture.id) {
      // Xóa lesson từ backend
      const res = await courseService.deleteLesson(id, lecture.id);
      if (!res.success) {
        alert('Xóa bài học thất bại!');
        return;
      }
    }
    
    // Xóa khỏi UI
    const updatedLessons = lessons.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          lectures: section.lectures.filter(l => l.id !== lectureId)
        };
      }
      return section;
    });
    setLessons(updatedLessons);
  };

  const handleSave = async () => {
    try {
      // 1. Cập nhật thông tin cơ bản
      const res = await courseService.updateCourse(id, {
        title: courseData.title,
        description: courseData.overview || courseData.title || 'No description yet',
        price: courseData.price,
        thumbnail: courseData.thumbnail,
        category: courseData.category,
        level: courseData.level,
        overview: courseData.overview,
        includes: courseData.includes,
      });

      if (!res.success) {
        alert('Cập nhật khóa học thất bại, vui lòng thử lại.');
        return;
      }

      // 2. Cập nhật lessons
      for (const section of lessons) {
        for (const lecture of section.lectures) {
          if (lecture.isNew) {
            // Thêm bài học mới
            await courseApi.addLesson(id, {
              title: lecture.title || 'Lesson',
              content: lecture.content || lecture.title || '',
              videoUrl: lecture.videoUrl || '',
              flashcards: lecture.flashcards || [],
              quizId: lecture.quizId || null,
            });
          } else if (lecture.id) {
            // Cập nhật bài học hiện có
            await courseApi.updateLesson(id, lecture.id, {
              title: lecture.title || 'Lesson',
              content: lecture.content || lecture.title || '',
              videoUrl: lecture.videoUrl || '',
              flashcards: lecture.flashcards || [],
              quizId: lecture.quizId || null,
            });
          }
        }
      }

      alert('Cập nhật khóa học thành công!');
      navigate('/instructor/courses');
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Cập nhật khóa học thất bại, vui lòng thử lại.');
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-8 font-sans">
      {/* Header & Steps Indicator */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-gray-500 mt-1">Update your course information and curriculum</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentStep === 1 ? 'bg-[#EA454C] text-white' : 'bg-gray-200 text-gray-500'}`}>1. Basic Info</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentStep === 2 ? 'bg-[#EA454C] text-white' : 'bg-gray-200 text-gray-500'}`}>2. Curriculum</span>
        </div>
      </div>

      {/* === BƯỚC 1: THÔNG TIN CƠ BẢN === */}
      {currentStep === 1 && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 animate-fade-in-up">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
            <input
              name="title"
              value={courseData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#EA454C] outline-none"
              placeholder="e.g. Complete React Guide"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={courseData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none bg-white"
              >
                <option value="">Select...</option>
                <option value="development">Development</option>
                <option value="ui-ux-design">UI/UX Design</option>
                <option value="graphic-design">Graphic Design</option>
                <option value="framework">Framework</option>
                <option value="general">General</option>
                <option value="programming">Programming</option>
                <option value="algorithm">Algorithm</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (VND)</label>
              <input
                type="number"
                name="price"
                value={courseData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none"
                placeholder="0"
                min="0"
                step="1000"
              />
            </div>
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              name="level"
              value={courseData.level}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none bg-white"
            >
              <option value="Beginner">Beginner</option>
              <option value="Medium">Medium</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Overview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course Overview</label>
            <textarea
              name="overview"
              value={courseData.overview}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#EA454C] outline-none resize-y"
              placeholder="Write a short overview of what this course is about..."
            />
          </div>

          {/* Includes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What&apos;s included in this course
            </label>
            <textarea
              name="includes"
              value={courseData.includes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#EA454C] outline-none resize-y text-sm"
              placeholder="Ví dụ: 11 hours on-demand video&#10;Full lifetime access&#10;Certificate of completion"
            />
            <p className="mt-1 text-xs text-gray-400">
              Mỗi dòng sẽ được hiển thị như một gạch đầu dòng (bullet) cho học viên.
            </p>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
            {courseData.thumbnail ? (
              <div className="relative w-full h-64 rounded-xl overflow-hidden group">
                <img src={courseData.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                <button
                  onClick={() => setCourseData((prev) => ({ ...prev, thumbnail: '' }))}
                  className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md text-red-500 hover:bg-red-50"
                >
                  <FiTrash2 />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                {isUploading ? (
                  <div className="text-gray-500 animate-pulse">Uploading to Cloudinary...</div>
                ) : (
                  <>
                    <FiUploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload image</p>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setCurrentStep(2)} disabled={isUploading}>
              Next: Curriculum &gt;
            </Button>
          </div>
        </div>
      )}

      {/* === BƯỚC 2: CURRICULUM === */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fade-in-up">
          {lessons.map((section, sIndex) => (
            <div key={section.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 w-full">
                  <FiLayers className="text-gray-400" />
                  <span className="font-bold text-gray-500 mr-2">Section {sIndex + 1}:</span>
                  <input
                    placeholder="Enter section title..."
                    className="flex-1 font-bold text-gray-900 outline-none placeholder-gray-300"
                    value={section.title}
                    onChange={(e) => {
                      const newLessons = [...lessons];
                      newLessons[sIndex].title = e.target.value;
                      setLessons(newLessons);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3 pl-4">
                {section.lectures.map((lecture, lIndex) => (
                  <div key={lecture.id} className="space-y-2">
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg group">
                      <span className="text-xs text-gray-400 font-bold">{lIndex + 1}</span>
                      <input
                        placeholder="Lecture title..."
                        className="flex-1 bg-transparent text-sm outline-none"
                        value={lecture.title}
                        onChange={(e) => {
                          const newLessons = [...lessons];
                          newLessons[sIndex].lectures[lIndex].title = e.target.value;
                          setLessons(newLessons);
                        }}
                      />
                      
                      <label className="cursor-pointer text-gray-400 hover:text-[#EA454C] transition-colors relative">
                        {isUploading ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : lecture.videoUrl ? (
                          <span className="text-green-500 text-xs font-bold flex items-center">
                            <FiVideo className="mr-1" /> Video Uploaded
                          </span>
                        ) : (
                          <FiUploadCloud title="Upload Video" />
                        )}
                        <input
                          type="file"
                          className="hidden"
                          accept="video/*"
                          onChange={(e) =>
                            handleVideoUpload(e.target.files[0], section.id, lecture.id)
                          }
                          disabled={isUploading}
                        />
                      </label>

                      <button
                        onClick={() => deleteLecture(section.id, lecture.id, lecture)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="Delete lecture"
                      >
                        <FiTrash2 />
                      </button>
                    </div>

                    {lecture.videoUrl && (
                      <div className="pl-8">
                        <video
                          src={lecture.videoUrl}
                          controls
                          className="w-full max-w-xl rounded-lg shadow-sm"
                        />
                      </div>
                    )}

                    {/* Flashcards & Quiz Integration */}
                    <div className="ml-8 mr-4 p-4 mt-3 bg-gray-50/60 rounded-xl border border-dashed border-gray-200 space-y-4 max-w-3xl">
                      {/* Section 1: Flashcards Editor */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <FiBookOpen className="text-[#EA454C]" /> Lý thuyết (Flashcards)
                          </h4>
                          <span className="text-xs text-gray-500 font-medium">{(lecture.flashcards || []).length} thẻ</span>
                        </div>
                        
                        <div className="space-y-2">
                          {(lecture.flashcards || []).map((card, cIndex) => (
                            <div key={cIndex} className="flex gap-2 items-center bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
                              <span className="text-xs text-gray-400 font-bold w-4">{cIndex + 1}</span>
                              <input
                                placeholder="Mặt trước (Câu hỏi / Thuật ngữ)..."
                                className="flex-1 text-xs border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:border-red-400"
                                value={card.frontText || ''}
                                onChange={(e) => {
                                  const newLessons = [...lessons];
                                  newLessons[sIndex].lectures[lIndex].flashcards[cIndex].frontText = e.target.value;
                                  setLessons(newLessons);
                                }}
                              />
                              <input
                                placeholder="Mặt sau (Câu trả lời / Định nghĩa)..."
                                className="flex-1 text-xs border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:border-red-400"
                                value={card.backText || ''}
                                onChange={(e) => {
                                  const newLessons = [...lessons];
                                  newLessons[sIndex].lectures[lIndex].flashcards[cIndex].backText = e.target.value;
                                  setLessons(newLessons);
                                }}
                              />
                              <button
                                type="button"
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                onClick={() => {
                                  const newLessons = [...lessons];
                                  newLessons[sIndex].lectures[lIndex].flashcards.splice(cIndex, 1);
                                  setLessons(newLessons);
                                }}
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <button
                          type="button"
                          className="mt-2 text-xs text-[#EA454C] hover:text-red-600 font-bold flex items-center gap-1 px-2 py-1 rounded bg-red-50/50 hover:bg-red-50 transition-colors"
                          onClick={() => {
                            const newLessons = [...lessons];
                            if (!newLessons[sIndex].lectures[lIndex].flashcards) {
                              newLessons[sIndex].lectures[lIndex].flashcards = [];
                            }
                            newLessons[sIndex].lectures[lIndex].flashcards.push({ frontText: '', backText: '' });
                            setLessons(newLessons);
                          }}
                        >
                          <FiPlus className="w-3 h-3" /> Thêm thẻ lý thuyết
                        </button>
                      </div>

                      {/* Section 2: Quiz Selector */}
                      <div className="border-t border-gray-200/60 pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <FiHelpCircle className="text-[#EA454C]" /> Trắc nghiệm ôn tập (Quiz)
                          </h4>
                          {lecture.quizId && (
                            <span className="text-xs text-green-600 font-bold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                              <FiCheckCircle className="w-3 h-3" /> Đã gán bộ trắc nghiệm ID: {lecture.quizId}
                            </span>
                          )}
                        </div>

                        {/* Mode selectors */}
                        <div className="flex gap-2 mb-3">
                          <button
                            type="button"
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                              !lecture.quizSelectorMode || lecture.quizSelectorMode === 'none'
                                ? 'bg-[#EA454C] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            onClick={() => {
                              const newLessons = [...lessons];
                              newLessons[sIndex].lectures[lIndex].quizSelectorMode = 'none';
                              newLessons[sIndex].lectures[lIndex].quizId = null;
                              newLessons[sIndex].lectures[lIndex].quizTitle = '';
                              setLessons(newLessons);
                            }}
                          >
                            Không có
                          </button>
                          <button
                            type="button"
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                              lecture.quizSelectorMode === 'bank'
                                ? 'bg-[#EA454C] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            onClick={() => {
                              const newLessons = [...lessons];
                              newLessons[sIndex].lectures[lIndex].quizSelectorMode = 'bank';
                              setLessons(newLessons);
                            }}
                          >
                            Ngân hàng đề
                          </button>
                          <button
                            type="button"
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                              lecture.quizSelectorMode === 'ai'
                                ? 'bg-[#EA454C] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            onClick={() => {
                              const newLessons = [...lessons];
                              newLessons[sIndex].lectures[lIndex].quizSelectorMode = 'ai';
                              setLessons(newLessons);
                            }}
                          >
                            AI tạo đề từ tài liệu
                          </button>
                        </div>

                        {/* Subform: Choose from bank */}
                        {lecture.quizSelectorMode === 'bank' && (
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-gray-500">Chọn đề từ ngân hàng của bạn:</label>
                            <select
                              className="w-full text-xs px-3 py-2 rounded-lg border border-gray-200 bg-white outline-none focus:border-red-400"
                              value={lecture.quizId || ''}
                              onChange={(e) => {
                                const qId = e.target.value ? Number(e.target.value) : null;
                                const selectedQuiz = quizzes.find(q => q.id === qId);
                                const newLessons = [...lessons];
                                newLessons[sIndex].lectures[lIndex].quizId = qId;
                                newLessons[sIndex].lectures[lIndex].quizTitle = selectedQuiz ? selectedQuiz.title : '';
                                setLessons(newLessons);
                              }}
                            >
                              <option value="">-- Chọn đề trắc nghiệm --</option>
                              {quizzes.map(q => (
                                <option key={q.id} value={q.id}>
                                  {q.title} ({q.numberOfQuestions} câu - {q.subject || 'General'})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Subform: AI Generator */}
                        {lecture.quizSelectorMode === 'ai' && (
                          <div className="space-y-2 bg-red-50/20 p-3 rounded-lg border border-red-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                                <FiCpu className="text-[#EA454C]" /> Tải lên file bài học (.txt, .pdf, .docx):
                              </span>
                              {aiGeneratingMap[`${section.id}-${lecture.id}`] && (
                                <span className="text-xs text-[#EA454C] font-bold animate-pulse">
                                  AI đang tạo đề (1-2 phút)...
                                </span>
                              )}
                            </div>
                            <input
                              type="file"
                              accept=".txt,.pdf,.docx,.doc"
                              disabled={aiGeneratingMap[`${section.id}-${lecture.id}`]}
                              className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-[#EA454C] hover:file:bg-red-100 cursor-pointer"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  handleAIQuizUpload(file, section.id, lecture.id);
                                }
                                e.target.value = '';
                              }}
                            />
                            {lecture.quizTitle && (
                              <p className="text-xs text-green-600 font-medium mt-1">
                                Đã liên kết: <strong>{lecture.quizTitle}</strong>
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => addLecture(section.id)}
                  className="flex items-center text-sm text-[#EA454C] font-medium hover:underline mt-2"
                >
                  <FiPlus className="mr-1" /> Add Lecture
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addSection}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-[#EA454C] hover:text-[#EA454C] transition-colors flex items-center justify-center"
          >
            <FiPlus className="mr-2" /> Add New Section
          </button>

          <div className="flex justify-between pt-6">
            <button
              onClick={() => setCurrentStep(1)}
              className="text-gray-500 hover:text-gray-900 font-medium"
            >
              &lt; Back to Basic Info
            </button>
            <Button onClick={handleSave} disabled={isUploading}>
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditCoursePage;
