window.DESIGN_CONTENT = {
  "question": {
    "id": "sql-026",
    "topic": "SQL",
    "difficulty": "medium",
    "question": "What pair is returned?",
    "options": [
      "3,2",
      "3,3",
      "2,2",
      "2,3"
    ],
    "correctAnswer": 0,
    "explanation": "COUNT(*) counts all three rows; COUNT(value) counts only the two non-NULL values.",
    "tags": [
      "count"
    ],
    "context": "Scores(value) contains 10,NULL,20. SQL: SELECT COUNT(*),COUNT(value) FROM Scores.",
    "contentVersion": 2,
    "optionExplanations": [
      "COUNT(*) counts all three rows; COUNT(value) counts only the two non-NULL values.",
      "COUNT(column) excludes the NULL input.",
      "The NULL row still counts for COUNT(*).",
      "The star count cannot be smaller than the non-NULL column count here."
    ],
    "takeAway": "COUNT: COUNT(*) counts rows while COUNT(column) excludes nulls."
  },
  "lesson": {
    "id": "rag",
    "title": "RAG",
    "summary": "Understand RAG through mechanisms, examples, and assessment traps.",
    "concepts": [
      {
        "name": "Retrieval loaders",
        "explanation": "Components reading source data into document records",
        "example": "Load a PDF with page metadata",
        "trap": "A loader automatically verifies every source claim"
      },
      {
        "name": "Chunking",
        "explanation": "Splitting documents into retrieval units",
        "example": "Split a handbook into overlapping sections",
        "trap": "One entire corpus should always be a single chunk"
      },
      {
        "name": "Recursive splitting",
        "explanation": "Splitting progressively by section, paragraph and smaller boundaries",
        "example": "Try paragraph breaks before splitting individual sentences",
        "trap": "Recursive splitting is identical to random splitting"
      },
      {
        "name": "Semantic splitting",
        "explanation": "Grouping text based on meaning changes",
        "example": "Start a new chunk when the discussion changes topic",
        "trap": "Semantic splitting always uses a fixed character count"
      },
      {
        "name": "Chunk overlap",
        "explanation": "Repeating some boundary content to preserve context",
        "example": "Repeat a preceding sentence in the next chunk",
        "trap": "Overlap has no storage or token cost"
      },
      {
        "name": "Cosine similarity",
        "explanation": "Measures alignment of two vectors independent of magnitude",
        "example": "Compare normalized query and document directions",
        "trap": "A higher cosine score proves a source is factually true"
      },
      {
        "name": "Top-K retrieval",
        "explanation": "Returning a limited number of nearest candidates",
        "example": "Fetch five relevant chunks for an answer",
        "trap": "Larger K always improves quality without cost"
      },
      {
        "name": "Retriever",
        "explanation": "Selects evidence for a query from an indexed corpus",
        "example": "Apply a policy-year filter before vector search",
        "trap": "The retriever must write the final natural-language answer"
      },
      {
        "name": "Prompt construction",
        "explanation": "Combining instructions, query and clearly delimited evidence",
        "example": "Tell the model to cite supplied passages and admit missing evidence",
        "trap": "Retrieved content should be treated as new system instructions"
      },
      {
        "name": "Reranking",
        "explanation": "Reordering initial candidates using a more precise relevance model",
        "example": "Score query-document pairs after broad vector retrieval",
        "trap": "Reranking must happen before any candidates are retrieved"
      },
      {
        "name": "Metadata filtering",
        "explanation": "Restricting search using structured document attributes",
        "example": "Only retrieve records accessible to the current department",
        "trap": "Similarity search automatically enforces access control"
      },
      {
        "name": "Hybrid search",
        "explanation": "Combining lexical and semantic retrieval",
        "example": "Use keywords for an exact product code and vectors for intent",
        "trap": "Hybrid search excludes keyword search"
      },
      {
        "name": "RAG evaluation",
        "explanation": "Assessing retrieval relevance and grounded answer quality",
        "example": "Measure retrieval recall and answer faithfulness separately",
        "trap": "Only grammar quality matters for a RAG system"
      },
      {
        "name": "Grounded generation",
        "explanation": "Supporting generated claims with supplied evidence",
        "example": "Answer with a cited policy section or abstain",
        "trap": "RAG completely eliminates hallucinations"
      },
      {
        "name": "Embedding consistency",
        "explanation": "Index and query vectors must use compatible embedding spaces",
        "example": "Re-embed documents when switching embedding models",
        "trap": "Vectors from unrelated embedding models are interchangeable"
      },
      {
        "name": "Index freshness",
        "explanation": "An index needs updates when source documents change",
        "example": "Refresh a handbook index after a policy revision",
        "trap": "RAG indexes stay current without an update process"
      },
      {
        "name": "Retrieval access control",
        "explanation": "Authorization must constrain evidence retrieval",
        "example": "Filter restricted records before constructing model context",
        "trap": "Hiding a final citation is sufficient protection"
      },
      {
        "name": "Tool calling",
        "explanation": "Models request structured actions which the application validates",
        "example": "Validate arguments before invoking a database lookup",
        "trap": "A model tool call is automatically safe to execute"
      }
    ],
    "interview": [
      "When would you use Retrieval loaders and what trade-offs would you explain?",
      "When would you use Chunking and what trade-offs would you explain?",
      "When would you use Recursive splitting and what trade-offs would you explain?",
      "When would you use Semantic splitting and what trade-offs would you explain?",
      "When would you use Chunk overlap and what trade-offs would you explain?"
    ],
    "cheatSheet": [
      "Retrieval loaders: Components reading source data into document records",
      "Chunking: Splitting documents into retrieval units",
      "Recursive splitting: Splitting progressively by section, paragraph and smaller boundaries",
      "Semantic splitting: Grouping text based on meaning changes",
      "Chunk overlap: Repeating some boundary content to preserve context",
      "Cosine similarity: Measures alignment of two vectors independent of magnitude",
      "Top-K retrieval: Returning a limited number of nearest candidates",
      "Retriever: Selects evidence for a query from an indexed corpus",
      "Prompt construction: Combining instructions, query and clearly delimited evidence",
      "Reranking: Reordering initial candidates using a more precise relevance model",
      "Metadata filtering: Restricting search using structured document attributes",
      "Hybrid search: Combining lexical and semantic retrieval",
      "RAG evaluation: Assessing retrieval relevance and grounded answer quality",
      "Grounded generation: Supporting generated claims with supplied evidence",
      "Embedding consistency: Index and query vectors must use compatible embedding spaces",
      "Index freshness: An index needs updates when source documents change",
      "Retrieval access control: Authorization must constrain evidence retrieval",
      "Tool calling: Models request structured actions which the application validates"
    ]
  },
  "problems": [
    {
      "id": "code-001",
      "title": "Pair with a target",
      "topic": "Arrays",
      "difficulty": "easy",
      "statement": "Given an object with nums and target, return indices of the first pair found scanning left to right whose sum is target. Return [] if absent. Never reuse an index.",
      "inputFormat": "A single JSON value is passed to solve(data). Use the named object fields described above.",
      "outputFormat": "Return the JSON-compatible result described in the statement. Do not print the answer.",
      "constraints": "Inputs follow the stated shape. Arrays and strings contain at most 10,000 items unless stated otherwise. Integer magnitudes are at most 10^6. Empty inputs are included only where a result is defined below.",
      "tests": [
        {
          "input": {
            "nums": [
              3,
              8,
              4,
              7
            ],
            "target": 11
          },
          "expected": [
            0,
            1
          ],
          "hidden": false
        },
        {
          "input": {
            "nums": [
              3,
              3
            ],
            "target": 6
          },
          "expected": [
            0,
            1
          ],
          "hidden": true
        },
        {
          "input": {
            "nums": [
              1
            ],
            "target": 2
          },
          "expected": [],
          "hidden": true
        }
      ],
      "hints": [
        "Keep a map from previously seen value to its first index. Check the complement before inserting.",
        "Write down the invariant that remains true after each iteration. Trace both the smallest input and a repeated-value input."
      ],
      "approach": "Keep a map from previously seen value to its first index. Check the complement before inserting. Implement the invariant in solve(data) and return the requested value. Check the sample and boundary cases before submission.",
      "complexity": "O(n) time; O(n) auxiliary space",
      "solution": "def solve(data):\n    seen = {}\n    for i, x in enumerate(data[\"nums\"]):\n        y = data[\"target\"] - x\n        if y in seen: return [seen[y], i]\n        if x not in seen: seen[x] = i\n    return []",
      "tags": [
        "arrays"
      ]
    },
    {
      "id": "code-002",
      "title": "Missing register entry",
      "topic": "Arrays",
      "difficulty": "easy",
      "statement": "An array contains distinct integers from 0 to n with exactly one absent. Return the missing integer.",
      "inputFormat": "A single JSON value is passed to solve(data). Use the array, string, or number described above.",
      "outputFormat": "Return the JSON-compatible result described in the statement. Do not print the answer.",
      "constraints": "Inputs follow the stated shape. Arrays and strings contain at most 10,000 items unless stated otherwise. Integer magnitudes are at most 10^6. Empty inputs are included only where a result is defined below.",
      "tests": [
        {
          "input": [
            0,
            3,
            1
          ],
          "expected": 2,
          "hidden": false
        },
        {
          "input": [],
          "expected": 0,
          "hidden": true
        },
        {
          "input": [
            1
          ],
          "expected": 0,
          "hidden": true
        }
      ],
      "hints": [
        "Compare the expected arithmetic sum to the actual sum.",
        "Write down the invariant that remains true after each iteration. Trace both the smallest input and a repeated-value input."
      ],
      "approach": "Compare the expected arithmetic sum to the actual sum. Implement the invariant in solve(data) and return the requested value. Check the sample and boundary cases before submission.",
      "complexity": "O(n) time; O(1) space",
      "solution": "def solve(data):\n    n = len(data)\n    return n*(n+1)//2 - sum(data)",
      "tags": [
        "arrays"
      ]
    },
    {
      "id": "code-003",
      "title": "Repeated attendance ID",
      "topic": "Arrays",
      "difficulty": "easy",
      "statement": "Return true if any integer appears more than once in the array, otherwise false.",
      "inputFormat": "A single JSON value is passed to solve(data). Use the array, string, or number described above.",
      "outputFormat": "Return the JSON-compatible result described in the statement. Do not print the answer.",
      "constraints": "Inputs follow the stated shape. Arrays and strings contain at most 10,000 items unless stated otherwise. Integer magnitudes are at most 10^6. Empty inputs are included only where a result is defined below.",
      "tests": [
        {
          "input": [
            2,
            4,
            2
          ],
          "expected": true,
          "hidden": false
        },
        {
          "input": [
            1,
            2,
            3
          ],
          "expected": false,
          "hidden": true
        },
        {
          "input": [],
          "expected": false,
          "hidden": true
        }
      ],
      "hints": [
        "Compare the number of unique IDs with the number of entries.",
        "Write down the invariant that remains true after each iteration. Trace both the smallest input and a repeated-value input."
      ],
      "approach": "Compare the number of unique IDs with the number of entries. Implement the invariant in solve(data) and return the requested value. Check the sample and boundary cases before submission.",
      "complexity": "O(n) time; O(n) auxiliary space",
      "solution": "def solve(data):\n    return len(set(data)) != len(data)",
      "tags": [
        "arrays"
      ]
    },
    {
      "id": "code-004",
      "title": "Move blank entries",
      "topic": "Arrays",
      "difficulty": "easy",
      "statement": "Move all zero values to the end of the array, preserving the order of nonzero values. Return the resulting array.",
      "inputFormat": "A single JSON value is passed to solve(data). Use the array, string, or number described above.",
      "outputFormat": "Return the JSON-compatible result described in the statement. Do not print the answer.",
      "constraints": "Inputs follow the stated shape. Arrays and strings contain at most 10,000 items unless stated otherwise. Integer magnitudes are at most 10^6. Empty inputs are included only where a result is defined below.",
      "tests": [
        {
          "input": [
            0,
            2,
            0,
            1
          ],
          "expected": [
            2,
            1,
            0,
            0
          ],
          "hidden": false
        },
        {
          "input": [
            0,
            0
          ],
          "expected": [
            0,
            0
          ],
          "hidden": true
        },
        {
          "input": [
            3
          ],
          "expected": [
            3
          ],
          "hidden": true
        }
      ],
      "hints": [
        "Collect nonzero entries in order, then append the required zeros.",
        "Write down the invariant that remains true after each iteration. Trace both the smallest input and a repeated-value input."
      ],
      "approach": "Collect nonzero entries in order, then append the required zeros. Implement the invariant in solve(data) and return the requested value. Check the sample and boundary cases before submission.",
      "complexity": "O(n) time; O(n) auxiliary space",
      "solution": "def solve(data):\n    nonzero = [x for x in data if x != 0]\n    return nonzero + [0]*(len(data)-len(nonzero))",
      "tags": [
        "arrays"
      ]
    },
    {
      "id": "code-005",
      "title": "Best contiguous revenue",
      "topic": "Arrays",
      "difficulty": "medium",
      "statement": "For a nonempty integer array return the largest sum of a nonempty contiguous subarray.",
      "inputFormat": "A single JSON value is passed to solve(data). Use the array, string, or number described above.",
      "outputFormat": "Return the JSON-compatible result described in the statement. Do not print the answer.",
      "constraints": "Inputs follow the stated shape. Arrays and strings contain at most 10,000 items unless stated otherwise. Integer magnitudes are at most 10^6. Empty inputs are included only where a result is defined below.",
      "tests": [
        {
          "input": [
            -2,
            3,
            -1,
            4,
            -5
          ],
          "expected": 6,
          "hidden": false
        },
        {
          "input": [
            -5,
            -2
          ],
          "expected": -2,
          "hidden": true
        },
        {
          "input": [
            7
          ],
          "expected": 7,
          "hidden": true
        }
      ],
      "hints": [
        "At each position choose whether to extend the previous subarray or start a new one.",
        "Write down the invariant that remains true after each iteration. Trace both the smallest input and a repeated-value input."
      ],
      "approach": "At each position choose whether to extend the previous subarray or start a new one. Implement the invariant in solve(data) and return the requested value. Check the sample and boundary cases before submission.",
      "complexity": "O(n) time; O(1) space",
      "solution": "def solve(data):\n    best = current = data[0]\n    for x in data[1:]:\n        current = max(x, current+x)\n        best = max(best, current)\n    return best",
      "tags": [
        "arrays"
      ]
    },
    {
      "id": "code-006",
      "title": "Majority vote",
      "topic": "Arrays",
      "difficulty": "easy",
      "statement": "Given a nonempty array with a guaranteed value occurring more than half the time, return that value.",
      "inputFormat": "A single JSON value is passed to solve(data). Use the array, string, or number described above.",
      "outputFormat": "Return the JSON-compatible result described in the statement. Do not print the answer.",
      "constraints": "Inputs follow the stated shape. Arrays and strings contain at most 10,000 items unless stated otherwise. Integer magnitudes are at most 10^6. Empty inputs are included only where a result is defined below.",
      "tests": [
        {
          "input": [
            3,
            2,
            3
          ],
          "expected": 3,
          "hidden": false
        },
        {
          "input": [
            1,
            1,
            2,
            1
          ],
          "expected": 1,
          "hidden": true
        },
        {
          "input": [
            8
          ],
          "expected": 8,
          "hidden": true
        },
        {
          "input": [
            1,
            2,
            1,
            2,
            1,
            1,
            2
          ],
          "expected": 1,
          "hidden": true
        }
      ],
      "hints": [
        "Cancel pairs of different values using a candidate and a counter.",
        "Write down the invariant that remains true after each iteration. Trace both the smallest input and a repeated-value input."
      ],
      "approach": "Cancel pairs of different values using a candidate and a counter. Implement the invariant in solve(data) and return the requested value. Check the sample and boundary cases before submission.",
      "complexity": "O(n) time; O(1) space",
      "solution": "def solve(data):\n    vote = count = 0\n    for x in data:\n        if count == 0: vote = x\n        count += 1 if x == vote else -1\n    return vote",
      "tags": [
        "arrays"
      ]
    },
    {
      "id": "code-007",
      "title": "Merge score lists",
      "topic": "Arrays",
      "difficulty": "easy",
      "statement": "Given an object with sorted arrays a and b, return one sorted array containing every value from both.",
      "inputFormat": "A single JSON value is passed to solve(data). Use the named object fields described above.",
      "outputFormat": "Return the JSON-compatible result described in the statement. Do not print the answer.",
      "constraints": "Inputs follow the stated shape. Arrays and strings contain at most 10,000 items unless stated otherwise. Integer magnitudes are at most 10^6. Empty inputs are included only where a result is defined below.",
      "tests": [
        {
          "input": {
            "a": [
              1,
              4
            ],
            "b": [
              2,
              3
            ]
          },
          "expected": [
            1,
            2,
            3,
            4
          ],
          "hidden": false
        },
        {
          "input": {
            "a": [],
            "b": [
              1
            ]
          },
          "expected": [
            1
          ],
          "hidden": true
        },
        {
          "input": {
            "a": [
              2,
              2
            ],
            "b": [
              2
            ]
          },
          "expected": [
            2,
            2,
            2
          ],
          "hidden": true
        }
      ],
      "hints": [
        "Advance the pointer at the smaller current value. Append remaining values afterward.",
        "Write down the invariant that remains true after each iteration. Trace both the smallest input and a repeated-value input."
      ],
      "approach": "Advance the pointer at the smaller current value. Append remaining values afterward. Implement the invariant in solve(data) and return the requested value. Check the sample and boundary cases before submission.",
      "complexity": "O(n) time; O(n) auxiliary space",
      "solution": "def solve(data):\n    a,b = data[\"a\"],data[\"b\"]\n    i=j=0\n    out=[]\n    while i<len(a) and j<len(b):\n        if a[i]<=b[j]: out.append(a[i]); i+=1\n        else: out.append(b[j]); j+=1\n    return out+a[i:]+b[j:]",
      "tags": [
        "arrays"
      ]
    },
    {
      "id": "code-008",
      "title": "One profitable trade",
      "topic": "Arrays",
      "difficulty": "easy",
      "statement": "A nonempty array gives daily prices. Return the greatest profit from one purchase followed by one later sale, or 0 if no profitable trade exists.",
      "inputFormat": "A single JSON value is passed to solve(data). Use the array, string, or number described above.",
      "outputFormat": "Return the JSON-compatible result described in the statement. Do not print the answer.",
      "constraints": "Inputs follow the stated shape. Arrays and strings contain at most 10,000 items unless stated otherwise. Integer magnitudes are at most 10^6. Empty inputs are included only where a result is defined below.",
      "tests": [
        {
          "input": [
            8,
            3,
            6,
            2,
            9
          ],
          "expected": 7,
          "hidden": false
        },
        {
          "input": [
            5,
            4,
            3
          ],
          "expected": 0,
          "hidden": true
        },
        {
          "input": [
            4
          ],
          "expected": 0,
          "hidden": true
        }
      ],
      "hints": [
        "Maintain the minimum price seen before evaluating each possible sale.",
        "Write down the invariant that remains true after each iteration. Trace both the smallest input and a repeated-value input."
      ],
      "approach": "Maintain the minimum price seen before evaluating each possible sale. Implement the invariant in solve(data) and return the requested value. Check the sample and boundary cases before submission.",
      "complexity": "O(n) time; O(1) space",
      "solution": "def solve(data):\n    low=data[0]\n    best=0\n    for price in data:\n        best=max(best,price-low)\n        low=min(low,price)\n    return best",
      "tags": [
        "arrays"
      ]
    }
  ],
  "debug": {
    "id": "debug-001",
    "title": "Repair: Pair with a target",
    "topic": "Arrays",
    "difficulty": "easy",
    "statement": "Given an object with nums and target, return indices of the first pair found scanning left to right whose sum is target. Return [] if absent. Never reuse an index.",
    "inputFormat": "A single JSON value is passed to solve(data). Use the named object fields described above.",
    "outputFormat": "Return the JSON-compatible result described in the statement. Do not print the answer.",
    "constraints": "Inputs follow the stated shape. Arrays and strings contain at most 10,000 items unless stated otherwise. Integer magnitudes are at most 10^6. Empty inputs are included only where a result is defined below.",
    "tests": [
      {
        "input": {
          "nums": [
            3,
            8,
            4,
            7
          ],
          "target": 11
        },
        "expected": [
          0,
          1
        ],
        "hidden": false
      },
      {
        "input": {
          "nums": [
            3,
            3
          ],
          "target": 6
        },
        "expected": [
          0,
          1
        ],
        "hidden": true
      },
      {
        "input": {
          "nums": [
            1
          ],
          "target": 2
        },
        "expected": [],
        "hidden": true
      }
    ],
    "hints": [
      "Trace the sample carefully; do not assume the current implementation preserves the invariant.",
      "Keep a map from previously seen value to its first index. Check the complement before inserting."
    ],
    "approach": "Keep a map from previously seen value to its first index. Check the complement before inserting. Implement the invariant in solve(data) and return the requested value. Check the sample and boundary cases before submission.",
    "complexity": "O(n) time; O(n) auxiliary space",
    "solution": "def solve(data):\n    seen = {}\n    for i, x in enumerate(data[\"nums\"]):\n        y = data[\"target\"] - x\n        if y in seen: return [seen[y], i]\n        if x not in seen: seen[x] = i\n    return []",
    "buggyCode": "def solve(data):\n    seen = {}\n    for i, x in enumerate(data[\"nums\"]):\n        y = data[\"target\"] + x\n        if y in seen: return [seen[y], i]\n        if x not in seen: seen[x] = i\n    return []",
    "tags": [
      "debugging",
      "arrays"
    ]
  },
  "interviews": [
    {
      "id": "interview-2-0",
      "topic": "Projects",
      "question": "Draw the request flow of your strongest project.",
      "guide": "Trace UI, API, validation, storage and the response; identify boundaries."
    },
    {
      "id": "interview-2-1",
      "topic": "Projects",
      "question": "Why did you choose your project’s database?",
      "guide": "Compare data shape, query patterns, constraints and operational needs."
    },
    {
      "id": "interview-2-2",
      "topic": "Projects",
      "question": "What was the hardest bug and how did you isolate it?",
      "guide": "Explain reproduction, evidence, root cause, fix and regression verification."
    },
    {
      "id": "interview-2-3",
      "topic": "Projects",
      "question": "How does your project handle invalid input?",
      "guide": "Discuss validation on both client and server and clear error responses."
    },
    {
      "id": "interview-2-4",
      "topic": "Projects",
      "question": "How did you test the most important user flow?",
      "guide": "Describe a meaningful integration test and the failure it would catch."
    },
    {
      "id": "interview-2-5",
      "topic": "Projects",
      "question": "What happens if a dependency is unavailable?",
      "guide": "Discuss timeouts, retries where appropriate and graceful failure."
    }
  ]
};
