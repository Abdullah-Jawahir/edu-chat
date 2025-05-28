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

// Comprehensive markdown renderer component
const MarkdownRenderer = ({ text }) => {
	const formatText = (text) => {
		const lines = text.split("\n");
		const elements = [];
		let inCodeBlock = false;
		let codeBlockLanguage = "";
		let codeBlockContent = [];
		let inTable = false;
		let tableRows = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const trimmedLine = line.trim();

			// Handle code blocks
			if (trimmedLine.startsWith("```")) {
				if (!inCodeBlock) {
					// Starting code block
					inCodeBlock = true;
					codeBlockLanguage = trimmedLine.replace("```", "").trim();
					codeBlockContent = [];
				} else {
					// Ending code block
					inCodeBlock = false;
					elements.push(
						<div key={i} className="my-4">
							<div className="bg-gray-900 rounded-t-lg px-3 py-2 text-sm text-gray-300 border-b border-gray-700">
								{codeBlockLanguage || "code"}
							</div>
							<pre className="bg-gray-800 text-green-400 p-4 rounded-b-lg overflow-x-auto text-sm">
								<code>{codeBlockContent.join("\n")}</code>
							</pre>
						</div>
					);
					codeBlockContent = [];
					codeBlockLanguage = "";
				}
				continue;
			}

			// If inside code block, collect lines
			if (inCodeBlock) {
				codeBlockContent.push(line);
				continue;
			}

			// Handle table detection
			if (trimmedLine.includes("|") && !inTable) {
				// Start collecting table rows
				inTable = true;
				tableRows = [line];
				continue;
			} else if (inTable && trimmedLine.includes("|")) {
				tableRows.push(line);
				continue;
			} else if (inTable && !trimmedLine.includes("|")) {
				// End of table
				inTable = false;
				elements.push(renderTable(tableRows, i));
				tableRows = [];
				// Process current line normally below
			}

			// Skip table separator lines
			if (trimmedLine.match(/^\|?[\s\-\|:]+\|?$/)) {
				continue;
			}

			// Handle headers (must come before other formatting)
			if (trimmedLine.startsWith("#### ")) {
				elements.push(
					<h4
						key={i}
						className="text-base font-semibold mt-3 mb-2 text-indigo-600"
					>
						{formatInlineMarkdown(trimmedLine.replace("#### ", ""))}
					</h4>
				);
			} else if (trimmedLine.startsWith("### ")) {
				elements.push(
					<h3
						key={i}
						className="text-lg font-semibold mt-4 mb-2 text-indigo-700"
					>
						{formatInlineMarkdown(trimmedLine.replace("### ", ""))}
					</h3>
				);
			} else if (trimmedLine.startsWith("## ")) {
				elements.push(
					<h2 key={i} className="text-xl font-bold mt-4 mb-2 text-indigo-800">
						{formatInlineMarkdown(trimmedLine.replace("## ", ""))}
					</h2>
				);
			} else if (trimmedLine.startsWith("# ")) {
				elements.push(
					<h1 key={i} className="text-2xl font-bold mt-4 mb-2 text-indigo-900">
						{formatInlineMarkdown(trimmedLine.replace("# ", ""))}
					</h1>
				);
			}
			// Handle blockquotes
			else if (trimmedLine.startsWith("> ")) {
				const content = trimmedLine.replace("> ", "");
				elements.push(
					<blockquote
						key={i}
						className="border-l-4 border-indigo-300 pl-4 my-2 italic text-gray-700 bg-indigo-50 py-2 rounded-r-lg"
					>
						{formatInlineMarkdown(content)}
					</blockquote>
				);
			}
			// Handle horizontal rules
			else if (trimmedLine.match(/^[-*_]{3,}$/)) {
				elements.push(
					<hr key={i} className="my-4 border-t-2 border-indigo-200" />
				);
			}
			// Handle bullet points (unordered lists)
			else if (trimmedLine.match(/^[\*\-\+] /)) {
				const content = trimmedLine.replace(/^[\*\-\+] /, "");
				const formattedContent = formatInlineMarkdown(content);
				elements.push(
					<div key={i} className="flex items-start mb-1 ml-4">
						<span className="text-indigo-500 mr-2 mt-1">•</span>
						<span>{formattedContent}</span>
					</div>
				);
			}
			// Handle numbered lists
			else if (trimmedLine.match(/^\d+\. /)) {
				const content = trimmedLine.replace(/^\d+\. /, "");
				const formattedContent = formatInlineMarkdown(content);
				const number = trimmedLine.match(/^(\d+)\. /)[1];
				elements.push(
					<div key={i} className="flex items-start mb-1 ml-4">
						<span className="text-indigo-500 mr-2 mt-1 font-medium">
							{number}.
						</span>
						<span>{formattedContent}</span>
					</div>
				);
			}
			// Handle task lists (checkboxes)
			else if (trimmedLine.match(/^[\*\-\+] \[[ x]\] /)) {
				const isChecked = trimmedLine.includes("[x]");
				const content = trimmedLine.replace(/^[\*\-\+] \[[ x]\] /, "");
				const formattedContent = formatInlineMarkdown(content);
				elements.push(
					<div key={i} className="flex items-start mb-1 ml-4">
						<span
							className={`mr-2 mt-1 ${
								isChecked ? "text-green-500" : "text-gray-400"
							}`}
						>
							{isChecked ? "☑" : "☐"}
						</span>
						<span className={isChecked ? "line-through text-gray-500" : ""}>
							{formattedContent}
						</span>
					</div>
				);
			}
			// Handle inline code blocks (single line)
			else if (
				trimmedLine.startsWith("```") &&
				trimmedLine.endsWith("```") &&
				trimmedLine.length > 6
			) {
				const code = trimmedLine.replace(/```/g, "");
				elements.push(
					<pre
						key={i}
						className="bg-gray-800 text-green-400 p-3 rounded-lg my-2 overflow-x-auto text-sm"
					>
						<code>{code}</code>
					</pre>
				);
			}
			// Handle empty lines
			else if (trimmedLine === "") {
				elements.push(<div key={i} className="h-2" />);
			}
			// Handle regular paragraphs
			else if (trimmedLine !== "") {
				const formattedContent = formatInlineMarkdown(line);
				elements.push(
					<p key={i} className="mb-2 leading-relaxed">
						{formattedContent}
					</p>
				);
			}
		}

		// Handle any remaining table at the end
		if (inTable && tableRows.length > 0) {
			elements.push(renderTable(tableRows, lines.length));
		}

		return elements;
	};

	// Render table from collected rows
	const renderTable = (rows, key) => {
		if (rows.length === 0) return null;

		const tableData = rows.map((row) =>
			row
				.split("|")
				.map((cell) => cell.trim())
				.filter((cell) => cell !== "")
		);

		const headers = tableData[0];
		const dataRows = tableData.slice(1);

		return (
			<div key={key} className="my-4 overflow-x-auto">
				<table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
					<thead className="bg-indigo-100">
						<tr>
							{headers.map((header, idx) => (
								<th
									key={idx}
									className="border-b border-gray-300 px-4 py-2 text-left font-semibold text-indigo-800"
								>
									{formatInlineMarkdown(header)}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{dataRows.map((row, rowIdx) => (
							<tr
								key={rowIdx}
								className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
							>
								{row.map((cell, cellIdx) => (
									<td
										key={cellIdx}
										className="border-b border-gray-200 px-4 py-2"
									>
										{formatInlineMarkdown(cell)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	};

	// Handle inline markdown (bold, italic, code, links, etc.)
	const formatInlineMarkdown = (text) => {
		if (typeof text !== "string") return text;

		const parts = [];
		let remainingText = text;
		let keyCounter = 0;

		// Function to process text with multiple inline formats
		const processInlineFormats = (inputText) => {
			const tokens = [];
			let currentIndex = 0;

			// Define all inline patterns
			const patterns = [
				{ regex: /\*\*\*(.*?)\*\*\*/g, type: "bold-italic" },
				{ regex: /\*\*(.*?)\*\*/g, type: "bold" },
				{ regex: /\*(.*?)\*/g, type: "italic" },
				{ regex: /__(.*?)__/g, type: "bold" },
				{ regex: /_(.*?)_/g, type: "italic" },
				{ regex: /`([^`]+)`/g, type: "code" },
				{ regex: /~~(.*?)~~/g, type: "strikethrough" },
				{ regex: /\[([^\]]+)\]\(([^)]+)\)/g, type: "link" },
				{ regex: /!\[([^\]]*)\]\(([^)]+)\)/g, type: "image" },
			];

			// Find all matches
			const allMatches = [];
			patterns.forEach((pattern) => {
				let match;
				while ((match = pattern.regex.exec(inputText)) !== null) {
					allMatches.push({
						...pattern,
						match: match,
						start: match.index,
						end: match.index + match[0].length,
						content: match[1],
						url: match[2], // for links and images
					});
				}
			});

			// Sort matches by position
			allMatches.sort((a, b) => a.start - b.start);

			// Process matches without overlapping
			const processedMatches = [];
			allMatches.forEach((match) => {
				const hasOverlap = processedMatches.some(
					(processed) =>
						match.start < processed.end && match.end > processed.start
				);
				if (!hasOverlap) {
					processedMatches.push(match);
				}
			});

			// Build result
			const result = [];
			let lastIndex = 0;

			processedMatches.forEach((match) => {
				// Add text before match
				if (match.start > lastIndex) {
					result.push(inputText.slice(lastIndex, match.start));
				}

				// Add formatted match
				switch (match.type) {
					case "bold-italic":
						result.push(
							<strong
								key={keyCounter++}
								className="font-bold italic text-indigo-700"
							>
								{match.content}
							</strong>
						);
						break;
					case "bold":
						result.push(
							<strong
								key={keyCounter++}
								className="font-semibold text-indigo-700"
							>
								{match.content}
							</strong>
						);
						break;
					case "italic":
						result.push(
							<em key={keyCounter++} className="italic text-indigo-600">
								{match.content}
							</em>
						);
						break;
					case "code":
						result.push(
							<code
								key={keyCounter++}
								className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-red-600"
							>
								{match.content}
							</code>
						);
						break;
					case "strikethrough":
						result.push(
							<span key={keyCounter++} className="line-through text-gray-500">
								{match.content}
							</span>
						);
						break;
					case "link":
						result.push(
							<a
								key={keyCounter++}
								href={match.url}
								className="text-blue-600 hover:text-blue-800 underline"
								target="_blank"
								rel="noopener noreferrer"
							>
								{match.content}
							</a>
						);
						break;
					case "image":
						result.push(
							<img
								key={keyCounter++}
								src={match.url}
								alt={match.content}
								className="inline-block max-w-full h-auto rounded"
							/>
						);
						break;
				}

				lastIndex = match.end;
			});

			// Add remaining text
			if (lastIndex < inputText.length) {
				result.push(inputText.slice(lastIndex));
			}

			return result.length > 1 ? result : inputText;
		};

		return processInlineFormats(text);
	};

	return <div className="space-y-1">{formatText(text)}</div>;
};

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
							{msg.sender === "bot" ? (
								<MarkdownRenderer text={msg.text} />
							) : (
								<div className="whitespace-pre-wrap">{msg.text}</div>
							)}
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
