import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../Context/AppContext';
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import Footer from '../../Components/Student/Footer';
import Rating from '../../Components/Student/Rating';
import axios from 'axios';
import { toast } from 'react-toastify';

const Player = () => {
  const { calculateChapterTime, backendUrl, getToken } = useContext(AppContext);
  const { courseID } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [completedLectures, setCompletedLectures] = useState([]);
  const [initialRating, setInitialRating] = useState(0);

  const getCourseData = async () => {
    try {
      const token = await getToken();

      // Fetch enrolled courses (has full lecture URLs)
      const { data } = await axios.get(`${backendUrl}/api/user/enrolled-courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        const course = data.enrolledCourses.find(c => c._id === courseID);
        if (course) setCourseData(course);
      }

      // Fetch existing progress
      const progressRes = await axios.post(
        `${backendUrl}/api/user/get-course-progress`,
        { courseID },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (progressRes.data.success && progressRes.data.progressData) {
        setCompletedLectures(progressRes.data.progressData.lectureCompleted || []);
      }
    } catch (err) {
      console.error('Error fetching course data:', err);
    }
  };

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const getVideoId = (url) => {
    if (!url) return '';
    const clean = url.trim().replace(/^"|"$/g, '');
    const match = clean.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : '';
  };

  const markComplete = async () => {
    if (!playerData) return;
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/update-course-progress`,
        { courseID, lectureId: playerData.lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success('Lecture marked as completed');
        setCompletedLectures(prev =>
          prev.includes(playerData.lectureId) ? prev : [...prev, playerData.lectureId]
        );
      } else {
        toast.info(data.message);
      }
    } catch (err) {
      toast.error('Failed to mark complete');
    }
  };

  const handleRating = async (rating) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/add-rating`,
        { courseID, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success('Rating submitted!');
        setInitialRating(rating);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Failed to submit rating');
    }
  };

  useEffect(() => {
    getCourseData();
  }, [courseID]);

  const totalLectures = courseData?.courseContent?.reduce(
    (acc, ch) => acc + ch.chapterContent.length, 0
  ) || 0;
  const progressPercent = totalLectures > 0
    ? Math.round((completedLectures.length / totalLectures) * 100)
    : 0;

  return (
    <>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
        {/* Left column */}
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold">Course Structure</h2>

          {/* Progress bar */}
          {totalLectures > 0 && (
            <div className="mt-3 mb-4">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>{completedLectures.length}/{totalLectures} lectures completed</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            {courseData?.courseContent?.map((chapter, index) => (
              <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                  onClick={() => toggleSection(index)}
                >
                  <div className="flex items-center gap-2">
                    <img
                      className={`transform transition-transform ${openSections[index] ? 'rotate-180' : ''}`}
                      src={assets.down_arrow_icon}
                      alt="arrow"
                    />
                    <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
                  </div>
                  <p className="text-sm">
                    {chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}
                  </p>
                </div>

                <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'}`}>
                  <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                    {chapter.chapterContent.map((lecture, i) => (
                      <li key={i} className="flex items-start gap-2 py-1">
                        <img
                          src={completedLectures.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon}
                          alt="icon"
                          className="w-4 h-4 mt-1"
                        />
                        <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                          <p className={completedLectures.includes(lecture.lectureId) ? 'text-green-600 font-medium' : ''}>
                            {lecture.lectureTitle}
                          </p>
                          <div className="flex gap-2">
                            {lecture.lectureUrl && (
                              <p
                                className="text-blue-500 cursor-pointer hover:underline"
                                onClick={() => setPlayerData({ ...lecture, chapter: index + 1, lecture: i + 1 })}
                              >
                                Watch
                              </p>
                            )}
                            <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 py-3 mt-8">
            <h1 className="text-xl font-bold">Rate this Course</h1>
            <Rating initialRating={initialRating} onRate={handleRating} />
          </div>
        </div>

        {/* Right column */}
        <div className="md:mt-10">
          {playerData ? (
            <div>
              <iframe
                src={`https://www.youtube.com/embed/${getVideoId(playerData.lectureUrl)}`}
                className="w-full aspect-video rounded"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-700 font-medium">
                  {playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}
                </p>
                <button
                  onClick={markComplete}
                  className={`text-sm px-3 py-1 rounded font-medium transition-all ${
                    completedLectures.includes(playerData.lectureId)
                      ? 'bg-green-100 text-green-700 cursor-default'
                      : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  }`}
                  disabled={completedLectures.includes(playerData.lectureId)}
                >
                  {completedLectures.includes(playerData.lectureId) ? '✓ Completed' : 'Mark Complete'}
                </button>
              </div>
            </div>
          ) : (
            <img
              src={courseData?.courseThumbnail || ''}
              alt="Course thumbnail"
              className="w-full rounded"
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Player;
