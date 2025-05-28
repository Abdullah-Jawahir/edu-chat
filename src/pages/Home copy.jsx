import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Sparkles,
	SendHorizontal,
	BookOpen,
	Brain,
	Calculator,
	Globe,
} from "lucide-react";
import { hfClient } from "@/lib/huggingfaceClient";

const Home = () => {
	const [messages, setMessages] = useState([
		{
			sender: "bot",
			text: "👋 Hello! I'm your educational assistant. Ask me about any subject - Math, Science, History, Literature, or study tips!",
		},
	]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);

	const createEducationalSystemPrompt = () => {
		return `You are an expert educational assistant. Your role is to:
- Explain concepts clearly and step-by-step
- Provide helpful examples and analogies
- Encourage learning and curiosity
- Break down complex topics into digestible parts
- Offer study tips and learning strategies
- Be patient and supportive

Focus on subjects like Math, Science, History, Literature, and general study advice. 
Keep responses educational, engaging, and appropriate for students.`;
	};

	const handleSend = async () => {
		if (!input.trim()) return;

		const userInput = input;
		setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
		setInput("");
		setLoading(true);

		try {
			// Combine a few previous messages for context
			const conversationContext = messages
				.slice(-4)
				.map(
					(msg) =>
						`${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`
				)
				.join("\n");

			const prompt = `
      ${createEducationalSystemPrompt()}
      ${conversationContext}
      User: ${userInput}
      Assistant:
            `;

			const result = await hfClient.textGeneration({
				model: "deepseek-ai/DeepSeek-V3-0324", // or "google/flan-t5-base"
				inputs: prompt,
				parameters: {
					temperature: 0.7,
					max_new_tokens: 500,
				},
			});

			const botResponse = result.generated_text;

			setMessages((prev) => [
				...prev,
				{
					sender: "bot",
					text: enhanceEducationalResponse(botResponse, userInput),
				},
			]);
		} catch (error) {
			console.error("Hugging Face API Error:", error);

			setMessages((prev) => [
				...prev,
				{
					sender: "bot",
					text: getEducationalFallback(userInput, error.message),
				},
			]);
		}

		setLoading(false);
	};

	const enhanceEducationalResponse = (response, originalQuestion) => {
		const question = originalQuestion.toLowerCase();

		// Add educational emojis and formatting based on subject
		if (
			question.includes("math") ||
			question.includes("calculate") ||
			question.includes("solve") ||
			question.includes("equation") ||
			question.includes("algebra") ||
			question.includes("geometry")
		) {
			return `📐 ${response}\n\n💡 **Study Tip:** Practice similar problems to reinforce your understanding!`;
		} else if (
			question.includes("science") ||
			question.includes("physics") ||
			question.includes("chemistry") ||
			question.includes("biology") ||
			question.includes("experiment")
		) {
			return `🔬 ${response}\n\n⚗️ **Remember:** Science is about asking questions and testing hypotheses!`;
		} else if (
			question.includes("history") ||
			question.includes("historical") ||
			question.includes("war") ||
			question.includes("civilization")
		) {
			return `📚 ${response}\n\n🏛️ **Think About:** How do these historical events connect to today's world?`;
		} else if (
			question.includes("literature") ||
			question.includes("book") ||
			question.includes("poem") ||
			question.includes("author") ||
			question.includes("story")
		) {
			return `📖 ${response}\n\n✍️ **Literary Tip:** Look for themes, symbols, and character development as you read!`;
		} else if (
			question.includes("study") ||
			question.includes("exam") ||
			question.includes("test") ||
			question.includes("learn")
		) {
			return `📝 ${response}\n\n🎯 **Study Strategy:** Use active recall and spaced repetition for better retention!`;
		}

		return `🎓 ${response}`;
	};

	const getEducationalFallback = (userInput, errorMessage) => {
		const input = userInput.toLowerCase();

		// Error-specific responses
		if (
			errorMessage.includes("Invalid API token") ||
			errorMessage.includes("token")
		) {
			return "⚠️ **API Configuration Error:** Please check your Hugging Face API token. Make sure VITE_HUGGINGFACE_API_TOKEN is set correctly in your .env file.";
		}

		if (
			errorMessage.includes("Model is loading") ||
			errorMessage.includes("loading")
		) {
			return "⏳ **Model Loading:** The AI model is starting up. Please wait 30-60 seconds and try again. Some models need time to initialize.";
		}

		if (errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
			return "🚦 **Rate Limit:** You've reached the API usage limit. Please wait a moment before trying again.";
		}

		// Subject-specific fallbacks
		if (input.includes("math") || input.includes("calculate")) {
			return "📐 **Math Help Available:** I can help with algebra, geometry, calculus, statistics, and more! What specific math topic would you like to explore?";
		} else if (input.includes("science")) {
			return "🔬 **Science Assistance:** Whether it's physics, chemistry, biology, or earth science, I'm here to help! What scientific concept interests you?";
		} else if (input.includes("history")) {
			return "📚 **History Support:** From ancient civilizations to modern events, history tells amazing stories. What time period or event would you like to learn about?";
		} else if (input.includes("literature")) {
			return "📖 **Literature Help:** I can help analyze themes, characters, writing techniques, and more. What book, poem, or author are you studying?";
		} else if (input.includes("study")) {
			return "📝 **Study Guidance:** I can help with study strategies, time management, note-taking, and exam preparation. What subject are you preparing for?";
		}

		return "🤔 **Temporary Issue:** I'm having connectivity problems, but I'm still here to help! Try asking about:\n• Math problems or concepts\n• Science explanations\n• Historical events\n• Literature analysis\n• Study strategies";
	};

	const quickTopics = [
		{
			icon: Calculator,
			label: "Math Help",
			query: "Help me understand a math concept",
		},
		{
			icon: Brain,
			label: "Science",
			query: "Explain a science topic to me",
		},
		{
			icon: BookOpen,
			label: "Literature",
			query: "Help me analyze literature",
		},
		{
			icon: Globe,
			label: "History",
			query: "Tell me about a historical event",
		},
	];

	const handleQuickTopic = (query) => {
		setInput(query);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-200 p-4 flex flex-col items-center">
			<div className="text-4xl font-bold text-indigo-800 mb-6 flex items-center gap-3">
				<Sparkles className="text-yellow-500" />
				<span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
					Edu ChatBot
				</span>
			</div>

			{/* Quick Topic Buttons */}
			<div className="flex gap-2 mb-4 flex-wrap justify-center">
				{quickTopics.map((topic, index) => (
					<Button
						key={index}
						variant="outline"
						size="sm"
						onClick={() => handleQuickTopic(topic.query)}
						className="bg-white/80 hover:bg-indigo-50 border-indigo-200 transition-colors"
					>
						<topic.icon size={16} className="mr-1" />
						{topic.label}
					</Button>
				))}
			</div>

			<Card className="w-full max-w-2xl shadow-xl bg-white/90 backdrop-blur">
				<CardContent className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
					{messages.map((msg, index) => (
						<div
							key={index}
							className={`p-3 rounded-xl max-w-[85%] transition-all duration-300 ${
								msg.sender === "user"
									? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white self-end ml-auto shadow-md"
									: "bg-white border border-gray-200 shadow-sm"
							}`}
						>
							<div className="whitespace-pre-wrap">{msg.text}</div>
						</div>
					))}
					{loading && (
						<div className="bg-white border border-gray-200 rounded-xl p-3 max-w-[85%] shadow-sm">
							<div className="flex items-center gap-2">
								<div className="flex space-x-1">
									<div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
									<div
										className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
										style={{ animationDelay: "0.1s" }}
									></div>
									<div
										className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
										style={{ animationDelay: "0.2s" }}
									></div>
								</div>
								<span className="text-gray-500 text-sm">Thinking...</span>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<div className="flex w-full max-w-2xl mt-4 gap-2">
				<Input
					placeholder="Ask about any subject - Math, Science, History, Literature..."
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleSend();
						}
					}}
					className="bg-white/90 backdrop-blur border-indigo-200 focus:border-indigo-400"
				/>
				<Button
					onClick={handleSend}
					disabled={loading || !input.trim()}
					className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all"
				>
					{loading ? (
						<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
					) : (
						<SendHorizontal size={18} />
					)}
				</Button>
			</div>

			<div className="text-xs text-gray-600 mt-4 text-center max-w-2xl space-y-1">
				<p>
					💡{" "}
					<strong>Using Hugging Face InferenceClient with DeepSeek-V3</strong>
				</p>
				<p className="text-indigo-600">
					Try: "Explain photosynthesis step by step", "How do I solve quadratic
					equations?", "What caused the Renaissance?"
				</p>
			</div>
		</div>
	);
};

export default Home;
