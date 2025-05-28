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

	const handleSend = async () => {
		if (!input.trim()) return;

		const userInput = input;
		setMessages((prev) => [...prev, { sender: "user", text: userInput }]);
		setInput("");
		setLoading(true);

		try {
			const conversationContext = messages
				.slice(-4)
				.map(
					(msg) =>
						`${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`
				)
				.join("\n");

			const prompt = `
				You are an educational assistant. Help students understand concepts clearly and provide detailed explanations.
				${conversationContext}
				User: ${userInput}
				Assistant:`;

			const result = await hfClient.chatCompletion({
				provider: "novita",
				model: "deepseek-ai/DeepSeek-V3-0324",
				messages: [
					{
						role: "system",
						content:
							"You are an expert educational assistant. Your role is to explain concepts clearly, provide examples, and help students learn effectively. Be patient, supportive, and focus on making complex topics easy to understand.",
					},
					...messages.slice(-4).map((msg) => ({
						role: msg.sender === "user" ? "user" : "assistant",
						content: msg.text,
					})),
					{
						role: "user",
						content: userInput,
					},
				],
				parameters: {
					temperature: 0.7,
					max_tokens: 500,
				},
			});

			setMessages((prev) => [
				...prev,
				{ sender: "bot", text: result.choices[0].message.content },
			]);
		} catch (error) {
			console.error("Hugging Face API Error:", error);
			setMessages((prev) => [
				...prev,
				{
					sender: "bot",
					text: "I apologize, but I'm having trouble connecting to my knowledge base. Please try again in a moment.",
				},
			]);
		}

		setLoading(false);
	};

	const quickTopics = [
		{
			icon: Calculator,
			label: "Math",
			query: "Help me understand a math concept",
		},
		{
			icon: Brain,
			label: "Science",
			query: "Explain a science topic",
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
					placeholder="Ask anything..."
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
		</div>
	);
};

export default Home;
