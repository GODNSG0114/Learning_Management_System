import Course from "../models/Course.models.js";

// Get All Courses
export const getAllCourse = async (req, res) => {
    try {
        const course = await Course.find({ isPublished: true }).
            select(['-courseContent', '-enrolledStudent']).populate({ path: 'educator' })

        res.json({ success: true, course })

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Course By id

export const GetCourseById = async (req, res) => {
    const { id } = req.params
    try {
        const courseData = await Course.findById(id).populate({ path: 'educator' })

        // Remove lectureUrl if isPreviewFree is false
        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if (!lecture.isPreviewFree) {
                    lecture.lectureUrl = '';
                }
            })
        })

        res.json({ success: true, courseData })

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get AI Suggested Course Flow
export const getAiSuggestedFlow = async (req, res) => {
    try {
        const { goal } = req.body;

        if (!goal) {
            return res.status(400).json({ success: false, message: 'Learning goal is required.' });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: 'AI API Key is missing.'
            });
        }

        // Fetch all published courses
        const courses = await Course.find({ isPublished: true });

        if (courses.length === 0) {
            return res.json({
                success: true,
                flow: [],
                overallSummary: 'There are no published courses on the platform to construct a path.'
            });
        }

        // Prepare simplified course data for AI 
        const courseDataList = courses.map(course => {
            let avgRating = 0;
            if (course.courseRatings && course.courseRatings.length > 0) {
                const total = course.courseRatings.reduce((sum, r) => sum + r.rating, 0);
                avgRating = Number((total / course.courseRatings.length).toFixed(1));
            }

            return {
                _id: course._id.toString(),
                courseTitle: course.courseTitle,
                courseDescription: course.courseDescription.replace(/<[^>]*>/g, ''), // strip HTML tags
                priority: course.priority || 0,
                rating: avgRating,
                numRatings: course.courseRatings ? course.courseRatings.length : 0,
                enrolledStudentsCount: course.enrolledStudents ? course.enrolledStudents.length : 0,
                chapters: course.courseContent.map(chapter => chapter.chapterTitle)
            };
        });

        const systemPrompt = `You are an expert academic advisor and curriculum designer for a premium Learning Management System. 
Your task is to create a personalized, sequential learning path (flow) for a student who wants to achieve a specific learning goal.

We have a list of available courses on our platform. You must select the most relevant courses and sequence them in a logical learning path to help the student achieve their goal.

To prioritize and sequence courses, you MUST strictly follow this hierarchy of criteria:
1. Social Proof & Student Metrics (Primary): Prioritize courses with higher average ratings and higher numbers of enrolled students.
2. Topical Relevance (Secondary): Select courses that match the student's learning goal. Filter out completely irrelevant courses.
3. Explicit Educator Priority (Tertiary): Use the educator-assigned 'priority' score to order the roadmap (foundational first).

If a topic the student needs is NOT covered by any available course, include it in the flow with courseId: null and notAvailable: true.

You must return your response in the following JSON format:
{
  "flow": [
    {
      "step": 1,
      "courseId": "string (MongoDB _id) or null if not available",
      "courseTitle": "string",
      "notAvailable": false,
      "importance": "string (1-2 sentences on why this course/topic matters short-term for the student's goal)",
      "focusChapters": ["string (list of recommended chapters to target)"],
      "learningObjective": "string (The core concept or skill the student will master in this step)"
    }
  ],
  "overallSummary": "string (A dynamic, personalized overview of the full learning path tailored to the student's exact goal)"
}

Do not include any other text, markdown formatting, or explanation. Return ONLY the raw JSON object.`;

        const userPrompt = `Student's Learning Goal: "${goal}"

Available Courses on Platform:
${JSON.stringify(courseDataList, null, 2)}`;

        const geminiBody = JSON.stringify({
            model: "openai/gpt-oss-120b",
            messages: [
                {
                    role: "user",
                    content: systemPrompt + "\n\n" + userPrompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7
        });

        const fetchGroq = () => fetch(
            `https://api.groq.com/openai/v1/chat/completions`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: geminiBody
            }
        );

        let response = await fetchGroq();

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Groq Error [${response.status}]:`, errorText);
            if (response.status === 429) {
                return res.status(429).json({
                    success: false,
                    message: 'Something went wrong. Please try again.'
                });
            }
            throw new Error(`Groq API Error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
            throw new Error("No response returned from Groq API");
        }

        const aiResponseText = data.choices[0].message.content;

        let parsedResult;
        try {
            parsedResult = JSON.parse(aiResponseText);
        } catch (e) {
            const cleanText = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedResult = JSON.parse(cleanText);
        }

        return res.json({
            success: true,
            flow: parsedResult.flow || [],
            overallSummary: parsedResult.overallSummary || ''
        });

    } catch (error) {
        console.error("AI Course Flow Error:", error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again.'
        });
    }
};

// AI Chat - general questions + platform-aware responses
export const aiChat = async (req, res) => {
    try {
        const { messages, goal } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ success: false, message: 'Messages are required.' });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, message: 'GROQ_API_KEY is missing.' });
        }

        // Fetch published courses for context
        const courses = await Course.find({ isPublished: true }).select('courseTitle courseDescription courseContent');
        const courseList = courses.map(c => ({
            id: c._id.toString(),
            title: c.courseTitle,
            topics: c.courseContent.map(ch => ch.chapterTitle)
        }));

        const systemPrompt = `You are a helpful AI learning assistant for an online Learning Management System (LMS).
The student's learning goal is: "${goal || 'not specified'}".

You help students understand concepts, answer questions, and guide their learning journey.
You are aware of the courses available on this platform:
${JSON.stringify(courseList, null, 2)}

Guidelines:
Answer in a simple, natural, human-readable way. Avoid Markdown formatting such as 
headings with #, bullet points with *, bold text, emojis, separators, 
and TL;DR sections unless they are genuinely necessary. Write like a knowledgeable 
person explaining the topic directly to another person. Use short paragraphs and simple 
language. Do not make the response look like an article or documentation page. 
Keep the explanation conversational and easy to read.
- Answer general educational questions clearly and concisely
- When a topic is covered by a platform course, mention it naturally (e.g. "We have a course on this: [Course Title]")
- When a topic is NOT covered by any platform course, answer the question and mention: "This topic is currently not available as a course on our platform, but here's what you need to know:"
- Keep responses focused, practical, and encouraging
- Use simple formatting with short paragraphs`;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-120b',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
    const errorText = await response.text();

    console.error("===== GROQ ERROR =====");
    console.error("Status:", response.status);
    console.error("Response:", errorText);
    console.error("======================");

    if (response.status === 429) {
        return res.status(429).json({
            success: false,
            message: "Something went wrong. Please try again."
        });
    }

    throw new Error(`Groq API Error: ${response.status} - ${errorText}`);
}

        const data = await response.json();
        const reply = data.choices[0].message.content;

        return res.json({ success: true, reply });

    } catch (error) {
        console.error('AI Chat Error:', error);
        return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
};
