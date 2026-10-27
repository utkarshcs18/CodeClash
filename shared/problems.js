export const problems = [
  {
    slug: "pair-sum",
    title: "Pair That Hits the Target",
    difficulty: "Easy",
    tags: ["array", "hash map"],
    ask: "Find two different positions whose numbers add up to the target.",
    given: "A list of numbers, and a target number.",
    returns: "The two indexes, smaller one first.",
    story:
      "The question is not asking you to invent new numbers. It is asking where a pair sits. Checking every pair works, and it is slow. As you walk from left to right, remember each number you have already seen. For the number in your hand, ask one question: have I already seen the missing piece?",
    steps: [
      {
        title: "Start with 2",
        body: "The list is [2, 7, 11, 15] and the target is 9. The first number is 2, so the missing piece is 7. You have not seen 7 yet. Remember that 2 sits at index 0.",
      },
      {
        title: "Next number is 7",
        body: "7 needs 2 to make 9. You remembered 2 at index 0. That pair is the answer: indexes 0 and 1.",
      },
      {
        title: "Why this is enough",
        body: "You never look backward through the whole list. The memory of earlier numbers answers the question in one step.",
      },
    ],
    pattern: "Hash map: value to index.",
    hint: "Keep a map of numbers you have passed. Before you save the current number, check whether target minus that number is already in the map.",
    approach: `function solve(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}`,
    starter: `function solve(nums, target) {
  // Return the two indexes that add up to target.
}
`,
    examples: [
      { input: "nums = [2, 7, 11, 15], target = 9", output: "[0, 1]", why: "2 + 7 = 9" },
      { input: "nums = [3, 2, 4], target = 6", output: "[1, 2]", why: "2 + 4 = 6" },
    ],
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1], hidden: false },
      { args: [[3, 2, 4], 6], expected: [1, 2], hidden: false },
      { args: [[3, 3], 6], expected: [0, 1], hidden: true },
    ],
  },
  {
    slug: "balanced-gates",
    title: "Balanced Gates",
    difficulty: "Easy",
    tags: ["string", "stack"],
    ask: "Decide whether every gate that opens is closed in the right order.",
    given: "A string of brackets: ( ) [ ] { }",
    returns: "true when the string is balanced, otherwise false.",
    story:
      "Read the string from left to right. An opening bracket is a gate you walk through. The last gate you opened has to be the next one that closes. A pile works for that: put openings on top, and a closing bracket must match whatever is currently on top.",
    steps: [
      {
        title: "Open, then close",
        body: "For (), you place ( on the pile, then ) matches it and you take it off. The pile is empty, so this string is balanced.",
      },
      {
        title: "Wrong closer",
        body: "For (], you place ( on the pile. ] does not match (. The string is not balanced.",
      },
      {
        title: "Nested gates",
        body: "For {[]}, the pile grows as { then [, then ] closes [, then } closes {. Empty pile at the end means yes.",
      },
    ],
    pattern: "Stack: last opened, first closed.",
    hint: "Push opening brackets. When you see a closer, it must equal the matching opener you just popped.",
    approach: `function solve(text) {
  const match = { ")": "(", "]": "[", "}": "{" };
  const pile = [];
  for (const mark of text) {
    if (mark === "(" || mark === "[" || mark === "{") pile.push(mark);
    else if (pile.pop() !== match[mark]) return false;
  }
  return pile.length === 0;
}`,
    starter: `function solve(text) {
  // Return true when the brackets are balanced.
}
`,
    examples: [
      { input: 'text = "()[]{}"', output: "true", why: "Each opener has the right closer." },
      { input: 'text = "(]"', output: "false", why: "A round gate is closed by a square one." },
    ],
    tests: [
      { args: ["()[]{}"], expected: true, hidden: false },
      { args: ["(]"], expected: false, hidden: false },
      { args: ["([)]"], expected: false, hidden: true },
      { args: ["{[]}"], expected: true, hidden: true },
    ],
  },
  {
    slug: "stair-steps",
    title: "Stair Steps",
    difficulty: "Easy",
    tags: ["dynamic programming"],
    ask: "Count the ways to climb a staircase when each move is 1 step or 2 steps.",
    given: "The number of steps, n.",
    returns: "How many different ways reach the top.",
    story:
      "To stand on step n, the last move came from step n-1 (a single step) or step n-2 (a double step). So the ways to reach n are the ways to reach n-1 plus the ways to reach n-2. That is the whole problem. You do not need to list every path.",
    steps: [
      {
        title: "Two steps",
        body: "You can climb 1 then 1, or one double step. That is 2 ways.",
      },
      {
        title: "Three steps",
        body: "1+1+1, 1+2, and 2+1. That is 3 ways. 2+1 and 1+2 are different orders, so both count.",
      },
      {
        title: "The pattern",
        body: "Each new step adds the two numbers before it: 1, 2, 3, 5, 8. Step 5 has 8 ways.",
      },
    ],
    pattern: "Build the answer from the two smaller stairs.",
    hint: "Keep only the last two totals as you walk from step 3 up to n.",
    approach: `function solve(n) {
  if (n <= 2) return n;
  let oneStepBack = 1;
  let twoStepsBack = 2;
  for (let step = 3; step <= n; step++) {
    const here = oneStepBack + twoStepsBack;
    oneStepBack = twoStepsBack;
    twoStepsBack = here;
  }
  return twoStepsBack;
}`,
    starter: `function solve(n) {
  // Return how many ways you can climb n steps.
}
`,
    examples: [
      { input: "n = 2", output: "2", why: "1+1, or one jump of 2." },
      { input: "n = 3", output: "3", why: "1+1+1, 1+2, and 2+1." },
    ],
    tests: [
      { args: [2], expected: 2, hidden: false },
      { args: [3], expected: 3, hidden: false },
      { args: [5], expected: 8, hidden: true },
    ],
  },
  {
    slug: "unique-stretch",
    title: "Longest Unique Stretch",
    difficulty: "Medium",
    tags: ["string", "sliding window"],
    ask: "Find the longest stretch of the text that never repeats a character.",
    given: "A string.",
    returns: "The length of that stretch, not the stretch itself.",
    story:
      "Imagine a window on the string. The right edge moves forward one character at a time. If that character is already inside the window, slide the left edge forward until the repeat is gone. The window is always a stretch with unique characters. Remember the biggest width you saw.",
    steps: [
      {
        title: "abcabcbb",
        body: "The window grows across a, b, c. Width 3. The next a is already inside, so the left edge moves past the first a.",
      },
      {
        title: "Keep sliding",
        body: "b, c, a is still width 3. Later repeats never beat that width. The answer is 3.",
      },
      {
        title: "All the same",
        body: "bbbbb never holds more than one unique character, so the answer is 1.",
      },
    ],
    pattern: "Sliding window.",
    hint: "Store the last index of each character. When you repeat one, jump the left edge to just after its previous index.",
    approach: `function solve(text) {
  let best = 0;
  let start = 0;
  const last = new Map();
  for (let i = 0; i < text.length; i++) {
    const previous = last.get(text[i]);
    if (previous !== undefined && previous >= start) start = previous + 1;
    last.set(text[i], i);
    best = Math.max(best, i - start + 1);
  }
  return best;
}`,
    starter: `function solve(text) {
  // Return the length of the longest stretch with no repeated character.
}
`,
    examples: [
      { input: 'text = "abcabcbb"', output: "3", why: '"abc" is the longest unique stretch.' },
      { input: 'text = "bbbbb"', output: "1", why: "Every character repeats immediately." },
    ],
    tests: [
      { args: ["abcabcbb"], expected: 3, hidden: false },
      { args: ["bbbbb"], expected: 1, hidden: false },
      { args: ["pwwkew"], expected: 3, hidden: true },
    ],
  },
  {
    slug: "same-letters",
    title: "Same Letters",
    difficulty: "Medium",
    tags: ["hash map", "sorting"],
    ask: "Group words that use exactly the same letters.",
    given: "A list of lowercase words.",
    returns: "Groups of words. Sort each group alphabetically, then sort the groups by their first word.",
    story:
      "eat, tea, and ate are the same letters in different order. If you sort the letters inside a word, those three all become aet. That sorted string is a label. Words with the same label belong in the same group.",
    steps: [
      {
        title: "Label each word",
        body: "eat, tea, and ate all sort into aet. tan and nat sort into ant. bat stays abt.",
      },
      {
        title: "Drop words into buckets",
        body: "One bucket for aet, one for ant, one for abt.",
      },
      {
        title: "Make the answer stable",
        body: "Sort inside each bucket, then sort the buckets by the first word. The reader can compare answers without caring who found a group first.",
      },
    ],
    pattern: "Hash map, keyed by the word's letters in order.",
    hint: "Sort the characters of each word and use that string as the map key.",
    approach: `function solve(words) {
  const groups = new Map();
  for (const word of words) {
    const key = [...word].sort().join("");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return [...groups.values()]
    .map((group) => group.slice().sort())
    .sort((a, b) => a[0].localeCompare(b[0]));
}`,
    starter: `function solve(words) {
  // Group words that are made of the same letters.
}
`,
    examples: [
      {
        input: 'words = ["eat", "tea", "tan", "ate", "nat", "bat"]',
        output: '[["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]',
        why: "eat, tea, and ate share their letters. So do tan and nat. bat is alone.",
      },
    ],
    tests: [
      {
        args: [["eat", "tea", "tan", "ate", "nat", "bat"]],
        expected: [["ate", "eat", "tea"], ["bat"], ["nat", "tan"]],
        hidden: false,
      },
      { args: [[""]], expected: [[""]], hidden: true },
      { args: [["ab", "ba", "abc"]], expected: [["ab", "ba"], ["abc"]], hidden: true },
    ],
  },
];
