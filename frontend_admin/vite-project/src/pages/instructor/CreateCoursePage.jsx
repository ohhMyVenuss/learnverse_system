import React, { useState, useEffect } from 'react';
import { FiUploadCloud, FiTrash2, FiPlus, FiVideo, FiLayers, FiPause, FiPlay, FiCheckCircle, FiBookOpen, FiHelpCircle, FiCpu } from 'react-icons/fi';
import Button from '../../components/Button';
import uploadService from '../../services/uploadService'; 
import chunkedUploadService from '../../services/chunkedUploadService';
import videoCompressionService from '../../services/videoCompressionService';
import { uploadQueue } from '../../services/uploadQueue';
import { useNavigate } from 'react-router-dom'; 
import courseService from '../../services/courseService'; 
import { quizApi } from '../../api/quizApi'; 

function CreateCoursePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState({}); // Track progress for each upload
  const [uploadingMap, setUploadingMap] = useState({}); // Track which lectures are currently uploading
  const navigate = useNavigate();
  
  // Helper: Check if any upload is in progress
  const isAnyUploading = () => {
    return Object.values(uploadingMap).some(isUploading => isUploading === true);
  };

  const [courseData, setCourseData] = useState({
    title: '',
    category: '',
    price: '',
    level: 'Beginner',
    thumbnail: '', 
    overview: '',
    includes: '',
  });

  const [curriculum, setCurriculum] = useState([
    { id: 1, title: 'Introduction', lectures: [] }
  ]);

  const [quizzes, setQuizzes] = useState([]);
  const [aiGeneratingMap, setAiGeneratingMap] = useState({});

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await quizApi.getMyQuizzes();
        setQuizzes(data);
      } catch (err) {
        console.error("Lỗi khi tải ngân hàng đề trắc nghiệm:", err);
      }
    };
    fetchQuizzes();
  }, []);

  const handleAIQuizUpload = async (file, sectionId, lectureId) => {
    if (!file) return;
    const progressKey = `${sectionId}-${lectureId}`;
    setAiGeneratingMap(prev => ({ ...prev, [progressKey]: true }));

    try {
      const targetSection = curriculum.find(s => s.id === sectionId);
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
        setCurriculum(prev => prev.map(section => {
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
        // Thêm quiz mới vào danh sách quizzes để đồng bộ ngân hàng
        setQuizzes(prev => [generatedQuiz, ...prev]);
        alert('Tự động tạo bộ trắc nghiệm AI thành công!');
      } else {
        alert('Tạo trắc nghiệm thất bại. Vui lòng thử lại!');
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

  const handleChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const progressKey = 'thumbnail';
    setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }));
    setUploadingMap(prev => ({ ...prev, [progressKey]: true }));
    
    const result = await uploadService.uploadFile(file, {
      onUploadProgress: (progress) => {
        setUploadProgress(prev => ({ ...prev, [progressKey]: progress }));
      },
      maxRetries: 3,
    });
    
    setUploadingMap(prev => {
      const newMap = { ...prev };
      delete newMap[progressKey];
      return newMap;
    });
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[progressKey];
      return newProgress;
    });

    if (result.success) {
      setCourseData(prev => ({ ...prev, thumbnail: result.url }));
    } else {
      alert("Upload ảnh thất bại!");
    }
  };

  const addSection = () => {
    setCurriculum([...curriculum, { id: Date.now(), title: '', lectures: [] }]);
  };

  const addLecture = (sectionId) => {
    const updatedCurriculum = curriculum.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          lectures: [...section.lectures, { id: Date.now(), title: '', videoUrl: '', flashcards: [], quizId: null, quizTitle: '' }]
        };
      }
      return section;
    });
    setCurriculum(updatedCurriculum);
  };

  const handleVideoUpload = async (file, sectionId, lectureId) => {
    if (!file) return;
    
    const progressKey = `${sectionId}-${lectureId}`;
    
    // Đánh dấu lecture này đang upload
    setUploadingMap(prev => ({ ...prev, [progressKey]: true }));
    setUploadProgress(prev => ({ ...prev, [progressKey]: 0, [`${progressKey}_stage`]: 'compressing' }));

    try {
      // 1. Compress video nếu cần (file > 100MB)
      let fileToUpload = file;
      if (file.size > 100 * 1024 * 1024) {
        setUploadProgress(prev => ({ ...prev, [`${progressKey}_stage`]: 'Compressing video...' }));
        try {
          fileToUpload = await videoCompressionService.compressVideo(file, {
            maxWidth: 1280,
            maxHeight: 720,
            onProgress: (compressionProgress) => {
              setUploadProgress(prev => ({
                ...prev,
                [progressKey]: compressionProgress * 0.3, // Compression = 30% của tổng progress
                [`${progressKey}_stage`]: `Compressing... ${Math.round(compressionProgress)}%`,
              }));
            },
          });
          console.log(`Video compressed: ${file.size} → ${fileToUpload.size} bytes`);
        } catch (compressionError) {
          console.warn('Compression failed, using original file:', compressionError);
          // Fallback: sử dụng file gốc nếu compression fail
        }
      }

      // 2. Upload qua backend với chunked upload (cho file lớn) hoặc direct upload (cho file nhỏ)
      setUploadProgress(prev => ({ ...prev, [`${progressKey}_stage`]: 'Uploading...' }));
      
      const useChunkedUpload = fileToUpload.size > 50 * 1024 * 1024; // > 50MB
      
      const result = await uploadQueue.add(
        progressKey,
        async (onProgress) => {
          if (useChunkedUpload) {
            // Sử dụng chunked upload qua backend
            return await chunkedUploadService.uploadFile(fileToUpload, {
              onProgress: (chunkedProgress) => {
                // Compression đã chiếm 30%, upload chiếm 70%
                const totalProgress = 30 + (chunkedProgress * 0.7);
                onProgress(totalProgress);
              },
              onChunkComplete: (chunkNumber, totalChunks) => {
                console.log(`Chunk ${chunkNumber}/${totalChunks} uploaded`);
              },
            });
          } else {
            // Sử dụng direct upload (file nhỏ)
            return await uploadService.uploadFile(fileToUpload, {
              onUploadProgress: (directProgress) => {
                const totalProgress = 30 + (directProgress * 0.7);
                onProgress(totalProgress);
              },
              maxRetries: 3,
            });
          }
        },
        {
          onProgress: (progress, attempt, maxAttempts) => {
            // Update progress với thông tin retry nếu có
            setUploadProgress(prev => ({
              ...prev,
              [progressKey]: progress,
              [`${progressKey}_retry`]: attempt > 1 ? `Retrying... (${attempt}/${maxAttempts})` : null,
              [`${progressKey}_stage`]: attempt > 1 ? `Retrying... (${attempt}/${maxAttempts})` : 'Uploading...',
            }));
          },
          onComplete: (result) => {
            if (result.success) {
              setCurriculum(prev => prev.map(section => {
                if (section.id === sectionId) {
                  const updatedLectures = section.lectures.map(lecture => {
                    if (lecture.id === lectureId) return { ...lecture, videoUrl: result.url };
                    return lecture;
                  });
                  return { ...section, lectures: updatedLectures };
                }
                return section;
              }));
            }
          },
          onError: (error) => {
            console.error(`Upload failed for ${progressKey}:`, error);
            alert(`Upload video "${file.name}" thất bại! ${error.message || ''}`);
          },
          maxRetries: 3,
          priority: 0, // Có thể set priority cao hơn cho video quan trọng
        }
      );

      if (!result.success) {
        alert(`Upload video "${file.name}" Max size is 50mb!`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload video "${file.name}" thất bại!`);
    } finally {
      // Cleanup: Xóa khỏi uploading map và progress
      setUploadingMap(prev => {
        const newMap = { ...prev };
        delete newMap[progressKey];
        return newMap;
      });
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[progressKey];
        delete newProgress[`${progressKey}_retry`];
        delete newProgress[`${progressKey}_stage`];
        return newProgress;
      });
    }
  };

  // Pause/Resume upload
  const handlePauseUpload = (sectionId, lectureId) => {
    const progressKey = `${sectionId}-${lectureId}`;
    uploadQueue.pause(progressKey);
    setUploadProgress(prev => ({
      ...prev,
      [`${progressKey}_stage`]: 'Paused',
    }));
  };

  const handleResumeUpload = (sectionId, lectureId) => {
    const progressKey = `${sectionId}-${lectureId}`;
    uploadQueue.resume(progressKey);
    setUploadProgress(prev => ({
      ...prev,
      [`${progressKey}_stage`]: 'Resuming...',
    }));
  };

  // --- SUBMIT LÊN BACKEND ---
  const handleSubmitCourse = async () => {
    const finalData = {
      ...courseData,
      curriculum,
    };

    const res = await courseService.createCourse(finalData);

    if (res.success) {
      console.log('DỮ LIỆU CUỐI CÙNG:', finalData);
      alert('Khóa học đã được tạo và gửi chờ duyệt!');
      navigate('/instructor/courses'); // Chuyển trang
    } else {
      alert('Tạo khóa học thất bại. Vui lòng thử lại!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 font-sans">
      
      {/* Header & Steps Indicator */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-gray-500 mt-1">Share your knowledge with the world</p>
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
            <input name="title" value={courseData.title} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#EA454C] outline-none" placeholder="e.g. Complete React Guide" />
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
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Overview
            </label>
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

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
            {courseData.thumbnail ? (
              <div className="relative w-full h-64 rounded-xl overflow-hidden group">
                <img src={courseData.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setCourseData({...courseData, thumbnail: ''})}
                  className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md text-red-500 hover:bg-red-50"
                >
                  <FiTrash2 />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                {uploadingMap.thumbnail && uploadProgress.thumbnail !== undefined ? (
                  <div className="w-full px-4">
                    <div className="text-sm text-gray-600 mb-2 text-center">
                      Uploading... {uploadProgress.thumbnail}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-[#EA454C] h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.thumbnail}%` }}
                      />
                    </div>
                  </div>
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
                  disabled={uploadingMap.thumbnail} 
                />
              </label>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setCurrentStep(2)} disabled={!courseData.title}>Next: Curriculum &gt;</Button>
          </div>
        </div>
      )}

      {/* === BƯỚC 2: XÂY DỰNG ĐỀ CƯƠNG (CURRICULUM) === */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fade-in-up">
          
          {curriculum.map((section, sIndex) => (
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
                      const newCurr = [...curriculum];
                      newCurr[sIndex].title = e.target.value;
                      setCurriculum(newCurr);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3 pl-4">
                {section.lectures.map((lecture, lIndex) => (
                  <div key={lecture.id} className="space-y-2">
                    {/* Row: title + upload button */}
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg group">
                      <span className="text-xs text-gray-400 font-bold">{lIndex + 1}</span>
                      <input 
                        placeholder="Lecture title..." 
                        className="flex-1 bg-transparent text-sm outline-none"
                        value={lecture.title}
                        onChange={(e) => {
                          const newCurr = [...curriculum];
                          newCurr[sIndex].lectures[lIndex].title = e.target.value;
                          setCurriculum(newCurr);
                        }}
                      />
                      
                      <div className="flex items-center gap-2">
                        <label className={`cursor-pointer text-gray-400 hover:text-[#EA454C] transition-colors relative ${uploadingMap[`${section.id}-${lecture.id}`] ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          {uploadingMap[`${section.id}-${lecture.id}`] && uploadProgress[`${section.id}-${lecture.id}`] !== undefined ? (
                            <div className="flex flex-col items-end gap-1 min-w-[80px]">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs text-gray-600">{Math.round(uploadProgress[`${section.id}-${lecture.id}`])}%</span>
                              </div>
                              {uploadProgress[`${section.id}-${lecture.id}_retry`] && (
                                <span className="text-xs text-orange-500">{uploadProgress[`${section.id}-${lecture.id}_retry`]}</span>
                              )}
                              {uploadProgress[`${section.id}-${lecture.id}_stage`] && (
                                <span className="text-xs text-blue-500">{uploadProgress[`${section.id}-${lecture.id}_stage`]}</span>
                              )}
                            </div>
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
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleVideoUpload(file, section.id, lecture.id);
                              }
                              // Reset input để có thể chọn lại file nếu cần
                              e.target.value = '';
                            }}
                            disabled={uploadingMap[`${section.id}-${lecture.id}`] || !!lecture.videoUrl}
                          />
                        </label>
                        
                        {/* Pause/Resume buttons */}
                        {uploadingMap[`${section.id}-${lecture.id}`] && (
                          <div className="flex items-center gap-1">
                            {uploadQueue.getTaskState(`${section.id}-${lecture.id}`) === 'paused' ? (
                              <button
                                onClick={() => handleResumeUpload(section.id, lecture.id)}
                                className="p-1 text-blue-500 hover:text-blue-700"
                                title="Resume upload"
                              >
                                <FiPlay className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePauseUpload(section.id, lecture.id)}
                                className="p-1 text-orange-500 hover:text-orange-700"
                                title="Pause upload"
                              >
                                <FiPause className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress bar khi đang upload */}
                    {uploadingMap[`${section.id}-${lecture.id}`] && uploadProgress[`${section.id}-${lecture.id}`] !== undefined && !lecture.videoUrl && (
                      <div className="pl-8 mt-2">
                        <div className="w-full max-w-xl bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#EA454C] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[`${section.id}-${lecture.id}`]}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Uploading video... {uploadProgress[`${section.id}-${lecture.id}`]}%
                        </p>
                      </div>
                    )}

                    {/* Preview video sau khi upload */}
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
                                  const newCurr = [...curriculum];
                                  newCurr[sIndex].lectures[lIndex].flashcards[cIndex].frontText = e.target.value;
                                  setCurriculum(newCurr);
                                }}
                              />
                              <input
                                placeholder="Mặt sau (Câu trả lời / Định nghĩa)..."
                                className="flex-1 text-xs border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:border-red-400"
                                value={card.backText || ''}
                                onChange={(e) => {
                                  const newCurr = [...curriculum];
                                  newCurr[sIndex].lectures[lIndex].flashcards[cIndex].backText = e.target.value;
                                  setCurriculum(newCurr);
                                }}
                              />
                              <button
                                type="button"
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                onClick={() => {
                                  const newCurr = [...curriculum];
                                  newCurr[sIndex].lectures[lIndex].flashcards.splice(cIndex, 1);
                                  setCurriculum(newCurr);
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
                            const newCurr = [...curriculum];
                            if (!newCurr[sIndex].lectures[lIndex].flashcards) {
                              newCurr[sIndex].lectures[lIndex].flashcards = [];
                            }
                            newCurr[sIndex].lectures[lIndex].flashcards.push({ frontText: '', backText: '' });
                            setCurriculum(newCurr);
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
                              const newCurr = [...curriculum];
                              newCurr[sIndex].lectures[lIndex].quizSelectorMode = 'none';
                              newCurr[sIndex].lectures[lIndex].quizId = null;
                              newCurr[sIndex].lectures[lIndex].quizTitle = '';
                              setCurriculum(newCurr);
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
                              const newCurr = [...curriculum];
                              newCurr[sIndex].lectures[lIndex].quizSelectorMode = 'bank';
                              setCurriculum(newCurr);
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
                              const newCurr = [...curriculum];
                              newCurr[sIndex].lectures[lIndex].quizSelectorMode = 'ai';
                              setCurriculum(newCurr);
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
                                const newCurr = [...curriculum];
                                newCurr[sIndex].lectures[lIndex].quizId = qId;
                                newCurr[sIndex].lectures[lIndex].quizTitle = selectedQuiz ? selectedQuiz.title : '';
                                setCurriculum(newCurr);
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
            <button onClick={() => setCurrentStep(1)} className="text-gray-500 hover:text-gray-900 font-medium">
              &lt; Back to Basic Info
            </button>
            <Button onClick={handleSubmitCourse} disabled={isAnyUploading()}>
              Submit for Review
            </Button>
          </div>

        </div>
      )}

    </div>
  );
}

export default CreateCoursePage;