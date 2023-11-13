# Custom-GPT

This repository contains a custom implementation of llama-2. The program is designed to create a bot that can ingest custom knowledge from a normal text file and engage in conversations.

It utilizes the [Ollama](https://ollama.ai) API to access the llama-2 or Mistral Model.

## Installation

Before running this program, ensure you meet the following prerequisites:

1. Node version `v18` or higher is installed.
2. Install `ollama` and pull the model `mistral`. Refer to the [Ollama GitHub](https://github.com/jmorganca/ollama) for comprehensive installation guides.
3. Once your Ollama model is prepared, install the required Node packages:

   ```bash
   npm install
   ```
To start the bot, run:

```bash
npm start
```
### Feel free to use this code as a foundation for creating your own bot.

# How it Works
The program utilizes the Ollama server for the Large Language Model (LLM) and Langchain to access LLM models, 
allowing you to feed them your custom document. You can experiment with the chunk size in `index.js` to find the optimal configuration for your use case.
