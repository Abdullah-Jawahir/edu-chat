/// <reference types="vite/client" />

// src/lib/huggingfaceClient.ts
import { InferenceClient } from "@huggingface/inference";
import { config } from "dotenv";
// Load environment variables from .env file
config();

const token = process.env.HUGGING_FACE_API_TOKEN;

if (!token) {
	throw new Error("❌ Missing Hugging Face API token in .env file.");
}

export const hfClient = new InferenceClient(token);
