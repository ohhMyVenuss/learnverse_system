import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiDownload, FiArrowLeft, FiChevronLeft, FiChevronRight, FiFileText, FiPlus, FiCode } from 'react-icons/fi';
import { courseApi } from '../../api/courseApi';
import { noteApi } from '../../api/noteApi';
import { useAuth } from '../../hooks/useAuth';
import courseService from '../../services/courseService';
import jsPDF from 'jspdf';
import CodeCell from '../../components/CodeCell';
import TextCell from '../../components/TextCell';

function VideoPlayerPage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [note, setNote] = useState(null);
  const [cells, setCells] = useState([{ type: 'text', content: '' }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const videoRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch course details
        const courseRes = await courseService.getCourseDetail(courseId);
        if (courseRes.success) {
          setCourse(courseRes.data);
        }

        // Fetch all lessons
        const lessonsData = await courseApi.getLessonsByCourse(courseId);
        setLessons(lessonsData || []);

        // Find current lesson index
        const lessonIndex = lessonsData?.findIndex(l => l.id === parseInt(lessonId)) || 0;
        setCurrentLessonIndex(lessonIndex >= 0 ? lessonIndex : 0);

        // Fetch current lesson
        if (lessonsData && lessonsData[lessonIndex]) {
          setLesson(lessonsData[lessonIndex]);
        }

        // Fetch or create note
        try {
          const noteData = await noteApi.getOrCreateNote(lessonId);
          setNote(noteData);
          
          // Parse note content - support both old (plain text) and new (JSON) format
          if (noteData.content) {
            try {
              const parsed = JSON.parse(noteData.content);
              if (parsed.cells && Array.isArray(parsed.cells)) {
                // New format with cells
                setCells(parsed.cells.length > 0 ? parsed.cells : [{ type: 'text', content: '' }]);
              } else {
                // Invalid JSON, treat as old format
                setCells([{ type: 'text', content: noteData.content }]);
              }
            } catch {
              // Plain text (old format) - migrate to cells
              setCells([{ type: 'text', content: noteData.content }]);
            }
          } else {
            setCells([{ type: 'text', content: '' }]);
          }
        } catch (error) {
          console.error('Error fetching note:', error);
          setCells([{ type: 'text', content: '' }]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [courseId, lessonId]);

  // Convert cells to JSON string for saving
  const cellsToContent = () => {
    return JSON.stringify({ cells });
  };

  // Auto-save note after user stops typing for 2 seconds
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    const currentContent = cellsToContent();
    const savedContent = note?.content ? (() => {
      try {
        const parsed = JSON.parse(note.content);
        return JSON.stringify(parsed);
      } catch {
        return note.content;
      }
    })() : '';

    if (currentContent !== savedContent) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSaveNote(true);
      }, 2000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [cells, note]);

  const handleSaveNote = async (isAutoSave = false) => {
    try {
      setSaving(true);
      const content = cellsToContent();
      const updatedNote = await noteApi.updateNote(lessonId, content);
      setNote(updatedNote);
      setAutoSaveStatus(isAutoSave ? 'Đã tự động lưu' : 'Đã lưu thành công');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving note:', error);
      setAutoSaveStatus('Lỗi khi lưu');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Update cell content
  const updateCell = (index, newContent) => {
    setCells(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], content: newContent };
      return updated;
    });
  };

  // Add new cell
  const addCell = (type, language = 'javascript') => {
    setCells(prev => [...prev, { 
      type, 
      content: '', 
      language: type === 'code' ? language : undefined 
    }]);
    setShowLanguageMenu(false);
  };

  // Delete cell
  const deleteCell = (index) => {
    if (cells.length > 1) {
      setCells(prev => prev.filter((_, i) => i !== index));
    } else {
      // Keep at least one cell
      setCells([{ type: 'text', content: '' }]);
    }
  };

  // Copy code to clipboard
  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setAutoSaveStatus('Đã copy code');
    setTimeout(() => setAutoSaveStatus(''), 2000);
  };

  const handleDownloadPDF = () => {
    const hasContent = cells.some(cell => cell.content && cell.content.trim());
    if (!lesson || !hasContent) {
      alert('Không có nội dung ghi chú để tải xuống');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(lesson.title, margin, yPosition);
    yPosition += 10;

    // Course info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Khóa học: ${course?.title || 'N/A'}`, margin, yPosition);
    yPosition += 7;
    doc.text(`Ngày: ${new Date().toLocaleDateString('vi-VN')}`, margin, yPosition);
    yPosition += 10;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Process cells
    cells.forEach((cell, index) => {
      if (yPosition > pageHeight - margin - 30) {
        doc.addPage();
        yPosition = margin;
      }

      if (cell.type === 'text' && cell.content) {
        // Text cell
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(cell.content, maxWidth);
        lines.forEach((line) => {
          if (yPosition > pageHeight - margin - 10) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += 7;
        });
        yPosition += 5; // Space after text cell
      } else if (cell.type === 'code' && cell.content) {
        // Code cell
        if (yPosition > pageHeight - margin - 30) {
          doc.addPage();
          yPosition = margin;
        }

        // Code header
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 100, 100);
        doc.text(`Code (${cell.language || 'javascript'}):`, margin, yPosition);
        yPosition += 7;

        // Code content (monospace)
        doc.setFontSize(9);
        doc.setFont('courier', 'normal');
        doc.setTextColor(0, 0, 0);
        const codeLines = doc.splitTextToSize(cell.content, maxWidth - 10);
        codeLines.forEach((line) => {
          if (yPosition > pageHeight - margin - 10) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin + 5, yPosition);
          yPosition += 6;
        });
        yPosition += 5; // Space after code cell
      }
    });

    // Footer
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Trang ${i} / ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    doc.save(`Ghi-chu-${lesson.title.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.pdf`);
  };

  const navigateToLesson = (newLessonId) => {
    navigate(`/learn/${courseId}/lesson/${newLessonId}`);
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      const prevLesson = lessons[currentLessonIndex - 1];
      navigateToLesson(prevLesson.id);
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      const nextLesson = lessons[currentLessonIndex + 1];
      navigateToLesson(nextLesson.id);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#F5F5F9] min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="bg-[#F5F5F9] min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Không tìm thấy bài học</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F5F9] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/go-learning`)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{lesson.title}</h1>
                <p className="text-sm text-gray-500">{course?.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Bài {currentLessonIndex + 1} / {lessons.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1.5fr] gap-6">
          {/* Left: Video Player */}
          <div className="space-y-4">
            {/* Video Player */}
            <div className="bg-black rounded-xl overflow-hidden aspect-video">
              {lesson.videoUrl ? (
                <video
                  ref={videoRef}
                  src={lesson.videoUrl}
                  controls
                  className="w-full h-full"
                  onPlay={() => {
                    // Video plays
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p>Video không khả dụng</p>
                </div>
              )}
            </div>

            {/* Lesson Navigation */}
            <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <button
                onClick={goToPreviousLesson}
                disabled={currentLessonIndex === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Bài trước</span>
              </button>

              <div className="flex-1 mx-4">
                <div className="flex items-center gap-2 justify-center">
                  {lessons.map((l, index) => (
                    <button
                      key={l.id}
                      onClick={() => navigateToLesson(l.id)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentLessonIndex
                          ? 'bg-[#EA454C] w-8'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      title={l.title}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={goToNextLesson}
                disabled={currentLessonIndex === lessons.length - 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="text-sm font-medium">Bài tiếp</span>
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Lesson Content */}
            {lesson.content && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Nội dung bài học</h3>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {lesson.content}
                </div>
              </div>
            )}
          </div>

          {/* Right: Notes Panel */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
              {/* Notes Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#EA454C] to-[#d93e45]">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <FiFileText className="w-5 h-5 text-white" />
                    <h2 className="text-lg font-semibold text-white">Ghi chú</h2>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Add Cell Buttons */}
                    <button
                      onClick={() => addCell('text')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                      <FiFileText className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Ghi chú</span>
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                        <FiCode className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Code</span>
                      </button>
                      {showLanguageMenu && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setShowLanguageMenu(false)}
                          />
                          <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 min-w-[150px]">
                            <button
                              onClick={() => addCell('code', 'javascript')}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm transition-colors"
                            >
                              JavaScript
                            </button>
                            <button
                              onClick={() => addCell('code', 'python')}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm transition-colors"
                            >
                              Python
                            </button>
                            <button
                              onClick={() => addCell('code', 'java')}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm transition-colors"
                            >
                              Java
                            </button>
                            <button
                              onClick={() => addCell('code', 'cpp')}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm transition-colors"
                            >
                              C++
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                    {autoSaveStatus && (
                      <span className="text-xs text-white/80">{autoSaveStatus}</span>
                    )}
                    <button
                      onClick={() => handleSaveNote(false)}
                      disabled={saving}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                      title="Lưu thủ công"
                    >
                      <FiSave className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                      title="Tải xuống PDF"
                    >
                      <FiDownload className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes Content - Cells */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {cells.map((cell, index) => (
                  <div key={index} className="relative">
                    {cell.type === 'text' ? (
                      <TextCell
                        cell={cell}
                        onUpdate={(content) => updateCell(index, content)}
                        onDelete={() => deleteCell(index)}
                      />
                    ) : (
                      <CodeCell
                        cell={cell}
                        onUpdate={(content) => updateCell(index, content)}
                        onDelete={() => deleteCell(index)}
                        onCopy={() => copyCode(cell.content)}
                      />
                    )}
                  </div>
                ))}
                {cells.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <p>Chưa có ghi chú nào. Hãy thêm ghi chú hoặc code từ header.</p>
                  </div>
                )}
              </div>

              {/* Notes Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {cells.length} {cells.length === 1 ? 'cell' : 'cells'} • {' '}
                    {cells.reduce((sum, cell) => sum + (cell.content?.length || 0), 0)} ký tự
                  </span>
                  <span>
                    {note?.updatedAt
                      ? `Cập nhật: ${new Date(note.updatedAt).toLocaleString('vi-VN')}`
                      : 'Chưa lưu'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayerPage;

