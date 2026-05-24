import React, { useState, useContext, useEffect, useRef } from 'react'
import { AppContext } from '../../Context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import Footer from '../../Components/Student/Footer'
import { assets } from '../../assets/assets'

const AiCourseFlow = () => {
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [roadmap, setRoadmap] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  // Chat state
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  const { allCourses, backendUrl, getToken, calculateRating, currency } = useContext(AppContext)

  const loadingMessages = [
    "Analyzing your learning goal...",
    "Evaluating course ratings & student metrics...",
    "Filtering for topical relevance...",
    "Structuring your personalized roadmap...",
    "Finalizing your learning path..."
  ]

  useEffect(() => {
    let interval
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length)
      }, 2500)
    } else {
      setLoadingStep(0)
    }
    return () => clearInterval(interval)
  }, [loading])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!goal.trim()) {
      toast.warn("Please enter what you want to learn.")
      return
    }
    setLoading(true)
    setErrorMsg('')
    setRoadmap(null)
    setChatMessages([])

    try {
      const token = await getToken()
      const { data } = await axios.post(
        `${backendUrl}/api/course/ai-flow`,
        { goal },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setRoadmap(data)
        // Seed the chat with a welcome message
        setChatMessages([{
          role: 'assistant',
          content: `I've built your learning roadmap! Feel free to ask me anything about the topics in your path, or any related concepts you'd like to understand better.`
        }])
        toast.success("Roadmap generated!")
      } else {
        setErrorMsg(data.message || "Failed to generate course flow.")
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleChatSend = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || chatLoading) return

    const userMsg = { role: 'user', content: chatInput.trim() }
    const updatedMessages = [...chatMessages, userMsg]
    setChatMessages(updatedMessages)
    setChatInput('')
    setChatLoading(true)

    try {
      const token = await getToken()
      const { data } = await axios.post(
        `${backendUrl}/api/course/ai-chat`,
        { messages: updatedMessages, goal },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not process that. Please try again.' }])
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }

  const getCourseDetails = (courseId) => allCourses.find((c) => c._id === courseId)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between pt-16">
      <div className="absolute top-0 left-0 w-full h-80 -z-1 bg-gradient-to-b from-cyan-100/60 to-transparent"></div>

      <main className="flex-grow max-w-4xl mx-auto px-4 py-8 w-full z-10">

        {/* Header */}
        <section className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
            AI Suggested <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Course Flow</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Tell us your learning goal and get a personalized, step-by-step roadmap built from our best courses.
          </p>
        </section>

        {/* Input Form */}
        <section className="bg-white/80 backdrop-blur-md border border-cyan-200/45 shadow-xl rounded-2xl p-6 sm:p-8 mb-8">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                What do you want to learn?
              </label>
              <textarea
                rows={3}
                placeholder="e.g. I want to learn Full Stack Web Development from scratch — HTML, CSS, JavaScript, React and Node.js."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 placeholder-slate-400 bg-white transition-all text-sm"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-75 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Generate My Path</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Loading */}
        {loading && (
          <section className="flex flex-col items-center justify-center py-16 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-md mb-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="w-16 h-16 border-4 border-cyan-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
              </div>
            </div>
            <p className="text-slate-800 font-medium text-lg text-center animate-pulse px-4">
              {loadingMessages[loadingStep]}
            </p>
            <p className="text-slate-400 text-xs mt-2">This may take a few seconds</p>
          </section>
        )}

        {/* Error */}
        {errorMsg && (
          <section className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-8">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">⚠️</div>
            <h2 className="text-lg font-bold text-red-800 mb-2">Something went wrong</h2>
            <p className="text-red-700 text-sm max-w-lg mx-auto mb-4">{errorMsg}</p>
            <button onClick={() => setErrorMsg('')} className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white text-xs font-semibold rounded-lg transition-all">
              Dismiss
            </button>
          </section>
        )}

        {/* Roadmap */}
        {roadmap && roadmap.flow && (
          <section className="space-y-8">

            {/* Overall Learning Strategy - dynamic */}
            {roadmap.overallSummary && (
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 shadow-md text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🎯</span>
                  <h2 className="text-lg font-bold">Your Learning Strategy</h2>
                </div>
                <p className="text-blue-50 text-sm sm:text-base leading-relaxed">
                  {roadmap.overallSummary}
                </p>
              </div>
            )}

            {/* Course Steps */}
            {roadmap.flow.filter(s => !s.notAvailable).length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
                <p className="text-slate-500 font-medium">No courses matched your goal. Try adjusting your search.</p>
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 border-l-2 border-dashed border-cyan-300 ml-4 py-2 space-y-10">
                {roadmap.flow.filter(s => !s.notAvailable).map((stepItem, index) => {
                  const course = stepItem.courseId ? getCourseDetails(stepItem.courseId) : null

                  return (
                    <div key={index} className="relative group">
                      {/* Step circle */}
                      <div className="absolute -left-12 sm:-left-[3.25rem] top-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-extrabold text-sm shadow-md group-hover:scale-110 transition-all duration-300">
                        {stepItem.step || (index + 1)}
                      </div>

                      <div className={`bg-white border rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-6 items-start ${stepItem.notAvailable ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}>

                        {/* Thumbnail or Not Available placeholder */}
                        {stepItem.notAvailable ? (
                          <div className="w-full md:w-44 flex-shrink-0 bg-amber-100 rounded-xl aspect-video flex flex-col items-center justify-center text-amber-600 text-center p-3">
                            <span className="text-2xl mb-1">📚</span>
                            <span className="text-xs font-semibold">Not on Platform</span>
                          </div>
                        ) : course ? (
                          <div className="w-full md:w-44 flex-shrink-0">
                            <img
                              src={course.courseThumbnail}
                              alt={course.courseTitle}
                              className="w-full aspect-video md:w-44 rounded-xl object-cover shadow-sm border border-slate-100"
                            />
                            <div className="mt-3 space-y-1 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-slate-700">By:</span>
                                <span>{course.educator?.name || "Instructor"}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <img key={i} src={i < Math.floor(calculateRating(course)) ? assets.rating_star : assets.star_dull_icon} alt="star" className="w-3 h-3" />
                                ))}
                                <span className="text-slate-600">({course.courseRatings?.length || 0})</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full md:w-44 bg-slate-100 rounded-xl aspect-video flex-shrink-0 flex items-center justify-center text-slate-400 text-xs font-medium">
                            No Preview
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-grow space-y-3 w-full">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600">
                                {stepItem.notAvailable ? 'Topic — Not Available on Platform' : 'Course Recommendation'}
                              </span>
                              <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight mt-0.5">
                                {stepItem.courseTitle}
                              </h3>
                            </div>
                            {stepItem.notAvailable && (
                              <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full border border-amber-200 whitespace-nowrap">
                                Not Available
                              </span>
                            )}
                          </div>

                          {/* Importance section */}
                          {stepItem.importance && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Why it matters</h4>
                              <p className="text-slate-600 text-sm leading-relaxed">{stepItem.importance}</p>
                            </div>
                          )}

                          {stepItem.learningObjective && (
                            <div className="text-sm">
                              <span className="font-bold text-slate-700">Objective:</span>{' '}
                              <span className="text-slate-600">{stepItem.learningObjective}</span>
                            </div>
                          )}

                          {!stepItem.notAvailable && stepItem.focusChapters && stepItem.focusChapters.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Focus Chapters</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {stepItem.focusChapters.map((ch, cIdx) => (
                                  <span key={cIdx} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-lg font-medium border border-blue-100/50">
                                    {ch}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {stepItem.notAvailable && (
                            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                              This topic is currently not available as a course on our platform. You can ask the AI assistant below to explain it.
                            </p>
                          )}

                          {!stepItem.notAvailable && course && (
                            <div className="pt-1 flex justify-end">
                              <a
                                href={`/course/${course._id}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all"
                              >
                                <span>Go to Course</span>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* AI Chat Section */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden mt-10">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">AI</div>
                <div>
                  <h3 className="text-white font-bold text-sm">Learning Assistant</h3>
                  <p className="text-blue-100 text-xs">Ask anything about your roadmap or related topics</p>
                </div>
              </div>

              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleChatSend} className="border-t border-slate-200 p-3 flex gap-2 bg-white">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about any topic in your roadmap..."
                  className="flex-grow px-4 py-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-700 placeholder-slate-400"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-all flex items-center gap-1.5 text-sm font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send
                </button>
              </form>
            </div>

          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default AiCourseFlow
