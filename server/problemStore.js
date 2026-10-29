import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { problems as seedProblems } from "../shared/problems.js";

const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data/problems.json");

function read() {
  if (!existsSync(file)) {
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(seedProblems, null, 2));
  }
  try {
    const problems = JSON.parse(readFileSync(file, "utf8"));
    if (!Array.isArray(problems)) throw new Error("not a list");
    return problems;
  } catch (err) {
    if (err.message === "The questions file is unreadable.") throw err;
    throw new Error("The questions file is unreadable.");
  }
}

function write(problems) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(problems, null, 2));
}

export function listProblems() {
  return read();
}

export function getProblem(slug) {
  return read().find((problem) => problem.slug === slug) ?? read()[0];
}

function slugify(title) {
  const base = String(title || "question")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "question";
  const problems = read();
  let slug = base;
  let n = 2;
  while (problems.some((problem) => problem.slug === slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export function addProblem(input, author) {
  const title = String(input.title || "").trim().slice(0, 80);
  const ask = String(input.ask || "").trim().slice(0, 240);
  const story = String(input.story || "").trim().slice(0, 800);
  const starter = String(input.starter || "function solve() {\n  \n}\n");
  if (!title || !ask || !story) {
    return { ok: false, error: "A question needs a title, what it is asking, and a plain explanation." };
  }
  let testArgs = [];
  let testExpected = null;
  try {
    testArgs = JSON.parse(input.testArgs || "[]");
    testExpected = JSON.parse(input.testExpected || "null");
  } catch {
    return { ok: false, error: "Sample test must be valid JSON. Args is an array, expected is the return value." };
  }
  if (!Array.isArray(testArgs)) {
    return { ok: false, error: "Sample args must be a JSON array, like [1, 2]." };
  }
  const problem = {
    slug: slugify(title),
    title,
    difficulty: input.difficulty === "Medium" ? "Medium" : "Easy",
    tags: ["custom"],
    ask,
    given: String(input.given || "See the question.").trim().slice(0, 200),
    returns: String(input.returns || "Whatever solve returns.").trim().slice(0, 200),
    story,
    steps: [{ title: "Read it once", body: story }],
    pattern: String(input.pattern || "Your pattern.").trim().slice(0, 120),
    hint: String(input.hint || "Say the idea in one sentence before you code.").trim().slice(0, 240),
    approach: String(input.approach || starter),
    starter,
    examples: [
      {
        input: String(input.exampleInput || JSON.stringify(testArgs)),
        output: String(input.exampleOutput || JSON.stringify(testExpected)),
        why: String(input.exampleWhy || "The sample you wrote.").slice(0, 200),
      },
    ],
    tests: [{ args: testArgs, expected: testExpected, hidden: false }],
    author,
  };
  const problems = read();
  problems.push(problem);
  write(problems);
  return { ok: true, problem };
}
