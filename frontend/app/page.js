"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { AnimatePresence, motion } from 'framer-motion';
import { FaTwitter, FaInstagram } from 'react-icons/fa';

const API_BASE_URL = "http://localhost:8001";

const getStatusClasses = (status) => {
    switch (status) {
        case 'published':
            return 'bg-green-100 text-green-700';
        case 'failed':
            return 'bg-red-100 text-red-700';
        case 'pending':
        default:
            return 'bg-yellow-100 text-yellow-700';
    }
};

export default function Home() {
    const [text, setText] = useState("");
    const [platforms, setPlatforms] = useState([]);
    const [scheduledTime, setScheduledTime] = useState("");
    const [image, setImage] = useState(null);
    const [posts, setPosts] = useState([]);
    const [message, setMessage] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tone, setTone] = useState('concise');
    const [geminiKey, setGeminiKey] = useState(() => {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem('geminiKey') || '';
        }
        return '';
    });
    const [selectedDate, setSelectedDate] = useState(null);
    const [showPostsModal, setShowPostsModal] = useState(false);
    const [selectedPosts, setSelectedPosts] = useState([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('geminiKey', geminiKey);
        }
    }, [geminiKey]);

    const fetchPosts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/posts/`);
            const data = await res.json();
            setPosts(data);
        } catch (error) {
            console.error("Fetch posts failed:", error);
            setMessage("Failed to fetch scheduled posts.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
        const interval = setInterval(fetchPosts, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSuggestHashtags = async () => {
        if (!text.trim()) {
            setMessage("Please enter some text to get suggestions.");
            setSuggestions([]);
            return;
        }

        if (!geminiKey) {
            setSuggestions(['#mocktag', '#sample', '#ai-fallback']);
            setMessage(`Mock suggestions shown. Add a Gemini API Key for real-time suggestions.`);
            return;
        }

        setMessage("Fetching AI suggestions...");
        try {
            const res = await fetch(`${API_BASE_URL}/analytics/ai/suggest_hashtags`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, gemini_key: geminiKey }),
            });
            if (res.ok) {
                const data = await res.json();
                setSuggestions(data.suggestions);
                setMessage(`Hashtags suggested! (Source: ${data.source}). Click to add.`);
            } else {
                setMessage("Failed to get hashtag suggestions.");
                setSuggestions([]);
            }
        } catch (error) {
            setMessage("Error connecting to AI helper service.");
            setSuggestions([]);
        }
    };

    const addSuggestedHashtag = (tag) => {
        setText(prev => prev + ` ${tag}`);
        setSuggestions(prev => prev.filter(t => t !== tag));
    };

    const handlePolishContent = async () => {
        if (!text.trim()) {
            setMessage("Enter text to polish.");
            return;
        }

        if (!geminiKey) {
            setText(`Polished by mock AI: ${text}`);
            setMessage("Mock polishing applied. Add a Gemini API Key for real-time polishing.");
            return;
        }

        setMessage(`Polishing content to a ${tone} tone...`);
        try {
            const res = await fetch(`${API_BASE_URL}/analytics/ai/polish_content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    tone,
                    gemini_key: geminiKey
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setText(data.polished_text);
                setMessage(`Content polished successfully (Source: ${data.source}).`);
            } else {
                setMessage("Failed to polish content.");
            }
        } catch (error) {
            setMessage("Error connecting to AI polishing service.");
        }
    };

    const handleAnalyzeImage = async () => {
        if (!image) {
            setMessage("Please upload an image first to analyze.");
            return;
        }

        if (!geminiKey) {
            setMessage("Mock AI analysis: This image is probably a picture of something interesting. Add a Gemini API Key for real-time analysis.");
            return;
        }

        setMessage("Analyzing image with AI Vision...");
        try {
            const res = await fetch(`${API_BASE_URL}/analytics/ai/analyze_image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image_path: image.name,
                    gemini_key: geminiKey
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setMessage(`AI Caption: "${data.caption}" (Source: ${data.source})`);
            } else {
                setMessage("Failed to analyze image.");
            }
        } catch (error) {
            setMessage("Error connecting to AI image analysis service.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image || !text || !scheduledTime || platforms.length === 0) {
            setMessage("Please fill out all fields.");
            return;
        }

        const localTime = new Date(scheduledTime);

        const formData = new FormData();
        formData.append("text_content", text);
        formData.append("platforms", platforms.join(","));
        formData.append("scheduled_time", localTime.toISOString());
        formData.append("image_file", image);

        try {
            const res = await fetch(`${API_BASE_URL}/posts/`, {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const newPost = {
                    id: Date.now(),
                    text_content: text,
                    platforms: platforms,
                    scheduled_time: scheduledTime,
                    image_path: `static/images/${image.name}`,
                    status: 'pending'
                };
                setPosts(prevPosts => [newPost, ...prevPosts]);
                setMessage("Post scheduled successfully! Status: Pending");
                
                fetchPosts(); // Still fetch for eventual consistency
                
                setText("");
                setPlatforms([]);
                setScheduledTime("");
                setImage(null);
                setSuggestions([]);
                e.target.reset();
            } else {
                const errorData = await res.json();
                setMessage(`Failed to schedule post: ${errorData.detail}`);
            }
        } catch (error) {
            setMessage("Failed to connect to the server. Check backend status.");
        }
    };

    const postsByDate = posts.reduce((acc, post) => {
        const date = format(new Date(post.scheduled_time), 'yyyy-MM-dd');
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(post);
        return acc;
    }, {});

    const footer = selectedDate ? (
        <p className="mt-4 text-center text-sm font-semibold">
            {postsByDate[format(selectedDate, 'yyyy-MM-dd')]?.length || 0} posts on {format(selectedDate, 'PPP')}.
        </p>
    ) : (
        <p className="mt-4 text-center text-sm font-semibold text-gray-500">
            Select a day to view posts.
        </p>
    );

    const handleDayClick = (day) => {
        setSelectedDate(day);
        const dateKey = format(day, 'yyyy-MM-dd');
        if (postsByDate[dateKey] && postsByDate[dateKey].length > 0) {
            setSelectedPosts(postsByDate[dateKey]);
            setShowPostsModal(true);
        } else {
            setShowPostsModal(false);
            setMessage(`No posts scheduled on ${format(day, 'PPP')}.`);
        }
    };
    
    const handlePostClick = (post) => {
        setSelectedPosts([post]); // Set selectedPosts to a single-item array
        setShowPostsModal(true);
    };

    // Sort posts by scheduled time descending for the quick view gallery
    const sortedPosts = posts.slice().sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors p-4 md:p-8 font-sans antialiased text-gray-800 dark:text-gray-200">
            <header className="py-8 text-center">
                <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                    Social Agent Scheduling 🗓️
                </h1>
                <p className="mt-2 text-base md:text-lg text-gray-600 dark:text-gray-400">
                    Automate your social media presence.
                </p>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <section className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                            Create a New Post
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-3">
                                <label htmlFor="geminiKey" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Gemini API Key (optional)
                                </label>
                                <input
                                    id="geminiKey"
                                    type="password"
                                    placeholder="Enter your GEMINI_API_KEY"
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Enables AI features like hashtag suggestions and content polishing.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <label htmlFor="postText" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Post Content
                                </label>
                                <textarea
                                    id="postText"
                                    placeholder="What's on your mind?"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows="5"
                                    className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-y"
                                />
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="button"
                                        onClick={handleSuggestHashtags}
                                        className="w-full sm:w-1/2 p-2 text-sm font-semibold bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                                    >
                                        AI Suggest Hashtags
                                    </button>
                                    <div className="w-full sm:w-1/2 flex items-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                                        <select
                                            value={tone}
                                            onChange={(e) => setTone(e.target.value)}
                                            className="w-full p-2 bg-transparent rounded-l-lg focus:outline-none"
                                        >
                                            <option value="concise">Concise</option>
                                            <option value="professional">Professional</option>
                                            <option value="humorous">Humorous</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handlePolishContent}
                                            className="flex-shrink-0 p-2 text-sm font-semibold bg-green-500 text-white rounded-r-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                                        >
                                            Polish
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {suggestions.length > 0 && (
                                <div className="p-4 bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-xl">
                                    <p className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-2">Suggested Hashtags:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.map((tag, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => addSuggestedHashtag(tag)}
                                                className="text-xs px-3 py-1 rounded-full bg-purple-200 dark:bg-purple-600 text-purple-800 dark:text-purple-100 hover:bg-purple-300 dark:hover:bg-purple-500 transition-colors"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <label htmlFor="scheduledTime" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Schedule Time
                                </label>
                                <input
                                    id="scheduledTime"
                                    type="datetime-local"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-3">
                                <label htmlFor="imageUpload" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    Upload Image
                                </label>
                                <input
                                    id="imageUpload"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setImage(e.target.files[0]);
                                        }
                                    }}
                                    className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-200 hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
                                />
                                {image && (
                                    <div className="mt-2 text-right">
                                        <button
                                            type="button"
                                            onClick={handleAnalyzeImage}
                                            className="p-2 text-xs font-semibold bg-sky-500 text-white rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
                                        >
                                            Describe Image with AI Vision
                                        </button>
                                    </div>
                                )}
                            </div>

                            <fieldset className="space-y-3">
                                <legend className="text-sm font-semibold text-gray-700 dark:text-gray-300">Platforms</legend>
                                <div className="flex gap-4">
                                    <label htmlFor="platform-twitter" className="flex items-center space-x-2">
                                        <input
                                            id="platform-twitter"
                                            type="checkbox"
                                            checked={platforms.includes("twitter")}
                                            onChange={(e) =>
                                                setPlatforms((prev) =>
                                                    e.target.checked
                                                        ? [...prev, "twitter"]
                                                        : prev.filter((p) => p !== "twitter")
                                                )
                                            }
                                            className="form-checkbox h-5 w-5 text-blue-600 rounded-md focus:ring-blue-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="text-gray-700 dark:text-gray-300">Twitter</span>
                                    </label>
                                    <label htmlFor="platform-instagram" className="flex items-center space-x-2">
                                        <input
                                            id="platform-instagram"
                                            type="checkbox"
                                            checked={platforms.includes("instagram")}
                                            onChange={(e) =>
                                                setPlatforms((prev) =>
                                                    e.target.checked
                                                        ? [...prev, "instagram"]
                                                        : prev.filter((p) => p !== "instagram")
                                                )
                                            }
                                            className="form-checkbox h-5 w-5 text-pink-600 rounded-md focus:ring-pink-500 border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                                        />
                                        <span className="text-gray-700 dark:text-gray-300">Instagram</span>
                                    </label>
                                </div>
                            </fieldset>

                            <button
                                type="submit"
                                className="w-full p-4 mt-6 text-base font-bold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Schedule Post
                            </button>
                        </form>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                            Scheduled Posts
                        </h2>
                        {message && (
                            <p className="text-center p-3 mb-4 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                                {message}
                            </p>
                        )}
                        {isLoading ? (
                            <LoadingSpinner message="Fetching posts and updating status..." />
                        ) : (
                            <div className="flex flex-col items-center w-full">
                                <DayPicker
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDayClick}
                                    modifiers={{
                                        hasPosts: Object.keys(postsByDate).map(dateStr => new Date(dateStr)),
                                    }}
                                    modifiersClassNames={{
                                        hasPosts: 'bg-blue-100 text-blue-700 font-bold rounded-full',
                                    }}
                                    footer={footer}
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>
                </section>
                
                <section className="space-y-6 md:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                            All Posts
                        </h2>
                        {isLoading ? (
                            <LoadingSpinner message="Loading posts..." />
                        ) : sortedPosts.length > 0 ? (
                            <div className="grid grid-flow-col auto-cols-[45%] md:auto-cols-[30%] lg:auto-cols-[20%] grid-rows-2 gap-4 overflow-x-auto pb-4">
                                {sortedPosts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="bg-gray-100 dark:bg-gray-700 rounded-xl shadow-md overflow-hidden flex-shrink-0 cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                        onClick={() => handlePostClick(post)}
                                    >
                                        <div className="relative w-full h-36">
                                            <img
                                                src={`${API_BASE_URL}/${post.image_path}`}
                                                alt="Post preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusClasses(post.status)}`}>
                                                    {post.status.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                                                {post.text_content || 'No content'}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center space-x-1">
                                                    {post.platforms.includes('twitter') && <FaTwitter className="text-blue-500" />}
                                                    {post.platforms.includes('instagram') && <FaInstagram className="text-pink-500" />}
                                                </span>
                                                <span>{format(new Date(post.scheduled_time), 'MMM d, h:mm a')}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400">No posts available to display.</p>
                        )}
                    </div>
                </section>
            </main>

            {/* Modal for Posts on Selected Day or Selected Post */}
            <AnimatePresence>
                {showPostsModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
                        onClick={() => setShowPostsModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPostsModal(false)}
                                aria-label="Close modal"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                                {selectedPosts.length > 1 ? `Posts for ${format(selectedDate, 'PPP')}` : 'Post Details'}
                            </h3>
                            <div className="grid gap-6">
                                {selectedPosts.length > 0 ? (
                                    selectedPosts.map((post) => (
                                        <div
                                            key={post.id}
                                            className="bg-gray-50 dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 transition-all hover:shadow-md"
                                        >
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                                                <span
                                                    className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusClasses(post.status)}`}
                                                    aria-label={`Post status: ${post.status}`}
                                                >
                                                    {post.status === 'published' ? '✅ Published' : post.status === 'failed' ? '❌ Failed' : '...Pending'}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    Scheduled:{" "}
                                                    {new Date(post.scheduled_time).toLocaleString(undefined, {
                                                        year: 'numeric',
                                                        month: 'numeric',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: 'numeric',
                                                        hour12: true,
                                                        timeZoneName: 'short'
                                                    })}
                                                </span>
                                            </div>
                                            {post.image_path && (
                                                <div className="relative mb-4 overflow-hidden rounded-xl">
                                                    <img
                                                        src={`${API_BASE_URL}/${post.image_path}`}
                                                        alt="Post content"
                                                        className="w-full h-auto max-h-64 object-cover"
                                                    />
                                                </div>
                                            )}
                                            <p className="text-gray-800 dark:text-gray-200 leading-snug mb-3 text-base">{post.text_content}</p>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                Platforms: <span className="text-blue-500">{post.platforms.join(", ")}</span>
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-gray-500 dark:text-gray-400">No posts scheduled for this day.</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
