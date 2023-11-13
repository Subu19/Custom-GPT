import { Ollama } from "langchain/llms/ollama";
import * as fs from "fs";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import "@tensorflow/tfjs-node";
import { TensorFlowEmbeddings } from "langchain/embeddings/tensorflow";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "langchain/schema/runnable";
import { formatDocumentsAsString } from "langchain/util/document";
import PromptSync from "prompt-sync";
import { clearInterval } from "timers";


//initialize ollama model
const ollama = new Ollama({
  baseUrl: "http://localhost:11434",
  model: "mistral",
});

//get custom data to feed
const text = fs.readFileSync("CNcontext.txt", "utf8");

//split text into 50 character chunks and overlap 20
const textsplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
});

const splitDoc = await textsplitter.createDocuments([text]);

// Then use the TensorFlow Embedding to store these chunks in the datastore
const vectorStore = await MemoryVectorStore.fromDocuments(
  splitDoc,
  new TensorFlowEmbeddings()
);

const retriever = vectorStore.asRetriever();

const conversation = [];
// Create a system & human prompt for the chat model
const SYSTEM_TEMPLATE = `You are dubu, a discord bot of Minecraft server. You will be assisting players with their queries. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
{context}`;

const REPHRASE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone Question:`;

const messages = [
  SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
  HumanMessagePromptTemplate.fromTemplate("{question}"),
];

const prompt = ChatPromptTemplate.fromMessages(messages);

const chain = RunnableSequence.from([
  {
    context: retriever.pipe(formatDocumentsAsString),
    question: new RunnablePassthrough(),
  },
  prompt,
  ollama,
]);

function manageConversation(human, bot) {
  const newConversation = {
    human: human,
    assistant: bot,
  };
  conversation.push(newConversation);
  if (conversation.length > 10) {
    conversation.splice(0, 1);
  }
}
async function joinConversation() {
  return new Promise((resolve, reject) => {
    if (conversation.length == 0) {
      resolve("You both haven't talked to each other yet!");
    }
    resolve(
      conversation
        .map((msg) => {
          return `Human: ${msg.human}\nYou: ${msg.assistant}`;
        })
        .join("\n\n")
    );
  });
}

console.log("Bot is ready and good to go. Type /bye to exit!".green);
const input = PromptSync({});

while (1) {
  const msg = input("> ");

  if (msg == "/bye") break;

  // const history = await joinConversation();
  // console.log(colors.red(history));
  let loading = loadingAnimation();
  const answer = await chain.invoke(msg);
  clearInterval(loading);
  console.log(answer.yellow);

  // manageConversation(msg, answer);
}


function loadingAnimation(
  text = "",
  chars = ["⠙", "⠘", "⠰", "⠴", "⠤", "⠦", "⠆", "⠃", "⠋", "⠉"],
  delay = 100
) {
  let x = 0;

  return setInterval(function() {
      process.stdout.write("\r" + chars[x++] + " " + text);
      x = x % chars.length;
  }, delay);
}
