import type { CodingProblem, DebuggingProblem, TestCase } from "@/types";

function problem(
  id: string,
  title: string,
  statement: string,
  inputFormat: string,
  outputFormat: string,
  constraints: string,
  examples: [unknown, unknown][],
  solution: string,
  approach: string,
  complexity: string,
  buggyCode?: string,
): CodingProblem {
  return {
    id,
    title,
    statement,
    inputFormat,
    outputFormat,
    constraints,
    topic: "Final assessment",
    difficulty: "medium",
    tags: ["reserved-final"],
    tests: examples.map(([input, expected], i): TestCase => ({
      input,
      expected,
      hidden: i >= 2,
    })),
    hints: [
      "Translate each requirement into an invariant before editing or coding.",
      "Check empty, boundary, tie and repeated-value inputs against that invariant.",
    ],
    approach,
    complexity,
    solution,
    ...(buggyCode ? { buggyCode } : {}),
  };
}

export const finalDebugging = [
  problem(
    "final-1-debug",
    "Repair the rising-signal streak",
    "A sensor records integer readings. Return [start, length] for the longest contiguous strictly increasing run. Indices are zero-based. Equal readings break a run. If runs tie, choose the earliest start. For an empty list return [-1, 0]. Repair the supplied implementation without changing solve(data).",
    "A decoded JSON list of integers.",
    "A two-integer list [start, length].",
    "0 <= n <= 100000; readings are signed integers.",
    [
      [
        [3, 5, 5, 6, 9],
        [2, 3],
      ],
      [
        [8, 7, 6],
        [0, 1],
      ],
      [[], [-1, 0]],
      [[4], [0, 1]],
      [
        [1, 1, 1],
        [0, 1],
      ],
      [
        [1, 2, 0, 1],
        [0, 2],
      ],
      [
        [-4, -3, -2, -1],
        [0, 4],
      ],
      [
        [5, 4, 6, 7, 2, 3],
        [1, 3],
      ],
    ],
    `def solve(data):
    if len(data) == 0:
        return [-1, 0]
    best_start = 0
    best_length = 1
    current_start = 0
    current_length = 1
    for index in range(1, len(data)):
        if data[index] > data[index - 1]:
            current_length = current_length + 1
        else:
            current_start = index
            current_length = 1
        if current_length > best_length:
            best_start = current_start
            best_length = current_length
    return [best_start, best_length]`,
    "Track the current run and update the best only on a strictly greater length. Equal adjacent readings start a new run.",
    "O(n) time and O(1) auxiliary space.",
    `def solve(data):
    if len(data) == 0:
        return [-1, 0]
    best_start = 0
    best_length = 1
    current_start = 0
    current_length = 1
    for index in range(1, len(data)):
        if data[index] >= data[index - 1]:
            current_length = current_length + 1
        else:
            current_start = index
            current_length = 1
        if current_length >= best_length:
            best_start = current_start
            best_length = current_length
    return [best_start, best_length]`,
  ),
  problem(
    "final-2-debug",
    "Repair the protected stock ledger",
    "A warehouse starts with initial units and applies signed changes in order. After EACH change, stock below zero is clamped to zero; excess demand is discarded, not carried as debt. Return the stock after every change. An empty changes list returns an empty list. The starter applies a different rule: repair it.",
    "A decoded JSON object with initial (nonnegative integer) and changes (integer list).",
    "List of nonnegative stock balances, one per change.",
    "0 <= initial <= 1000000; 0 <= number of changes <= 100000.",
    [
      [{ initial: 2, changes: [-5, 4] }, [0, 4]],
      [{ initial: 5, changes: [2, -3, -4] }, [7, 4, 0]],
      [{ initial: 0, changes: [] }, []],
      [{ initial: 0, changes: [-1, -1, 3] }, [0, 0, 3]],
      [{ initial: 4, changes: [-4, 0, 2] }, [0, 0, 2]],
      [{ initial: 3, changes: [1, 1, 1] }, [4, 5, 6]],
      [{ initial: 1, changes: [-2, 1, -2, 5] }, [0, 1, 0, 5]],
      [{ initial: 10, changes: [-3, -3] }, [7, 4]],
    ],
    `def solve(data):
    stock = data["initial"]
    balances = []
    for change in data["changes"]:
        stock = stock + change
        if stock < 0:
            stock = 0
        balances.append(stock)
    return balances`,
    "Clamp the running state itself before the next transaction; clamping only the displayed balance preserves unwanted debt.",
    "O(n) time and O(n) output space; O(1) auxiliary space.",
    `def solve(data):
    stock = data["initial"]
    balances = []
    for change in data["changes"]:
        stock = stock + change
        displayed_stock = stock
        if displayed_stock < 0:
            displayed_stock = 0
        balances.append(displayed_stock)
    return balances`,
  ),
  problem(
    "final-3-debug",
    "Repair the affordable prefix search",
    "Orders must be purchased in their given order. You may buy only a prefix, including an empty prefix. Costs are nonnegative and zero-cost orders count as purchased. Return the largest number of initial orders whose total is at most budget. Repair the prefix-sum binary search.",
    "A decoded JSON object with costs (nonnegative integer list) and budget (nonnegative integer).",
    "An integer count from 0 through len(costs).",
    "0 <= n <= 100000; costs and budget <= 1000000000.",
    [
      [{ costs: [2, 3, 0, 4], budget: 5 }, 3],
      [{ costs: [8, 1], budget: 3 }, 0],
      [{ costs: [], budget: 0 }, 0],
      [{ costs: [0, 0, 0], budget: 0 }, 3],
      [{ costs: [1, 2, 3], budget: 6 }, 3],
      [{ costs: [1, 2, 3], budget: 5 }, 2],
      [{ costs: [0, 4, 0], budget: 0 }, 1],
      [{ costs: [5], budget: 5 }, 1],
    ],
    `def solve(data):
    prefix = [0]
    for cost in data["costs"]:
        prefix.append(prefix[-1] + cost)
    left = 0
    right = len(prefix) - 1
    best_count = 0
    while left <= right:
        middle = (left + right) // 2
        if prefix[middle] <= data["budget"]:
            best_count = middle
            left = middle + 1
        else:
            right = middle - 1
    return best_count`,
    "The prefix sums are nondecreasing, so find the rightmost prefix sum not exceeding the budget, including repeated sums caused by zero costs.",
    "O(n) preprocessing, O(log n) search and O(n) space.",
    `def solve(data):
    prefix = [0]
    for cost in data["costs"]:
        prefix.append(prefix[-1] + cost)
    left = 0
    right = len(prefix) - 1
    best_count = 0
    while left <= right:
        middle = (left + right) // 2
        if prefix[middle] < data["budget"]:
            best_count = middle
            left = middle + 1
        else:
            right = middle - 1
    return best_count`,
  ),
  problem(
    "final-4-debug",
    "Repair case-pair cancellation",
    "An ASCII letter stream cancels adjacent letters only when they are the same letter in opposite cases, such as aA or Bb. After a cancellation, newly adjacent pairs can cancel. Equal-case letters must remain. Return the final string, preserving the case and order of remaining characters.",
    "A decoded JSON string containing only A-Z and a-z, possibly empty.",
    "The remaining string after all cancellations.",
    "0 <= string length <= 100000.",
    [
      ["abBAc", "c"],
      ["aaBB", "aaBB"],
      ["", ""],
      ["aA", ""],
      ["aabb", "aabb"],
      ["aabBA", "a"],
      ["abc", "abc"],
      ["ZZ", "ZZ"],
    ],
    `def solve(data):
    remaining = []
    for letter in data:
        if len(remaining) > 0:
            previous = remaining[-1]
            same_letter = previous.lower() == letter.lower()
            opposite_case = previous != letter
            if same_letter and opposite_case:
                remaining.pop()
            else:
                remaining.append(letter)
        else:
            remaining.append(letter)
    return "".join(remaining)`,
    "Maintain the reduced prefix on a stack. A cancellation requires both equal lowercase forms and different original characters.",
    "O(n) time and O(n) space.",
    `def solve(data):
    remaining = []
    for letter in data:
        if len(remaining) > 0:
            previous = remaining[-1]
            same_letter = previous.lower() == letter.lower()
            if same_letter:
                remaining.pop()
            else:
                remaining.append(letter)
        else:
            remaining.append(letter)
    return "".join(remaining)`,
  ),
  problem(
    "final-5-debug",
    "Repair the rolling alert counter",
    "A monitoring system examines every contiguous window of exactly k readings. Return how many windows have sum strictly greater than threshold. Values can be negative. If k exceeds the list length, return 0. Repair the starter so it handles the first window, equality and all later windows correctly.",
    "A decoded JSON object with readings (integer list), k (positive integer), threshold (integer).",
    "Integer count of qualifying windows.",
    "0 <= n <= 100000; 1 <= k <= 100000; signed readings and threshold.",
    [
      [{ readings: [3, -1, 4, 0], k: 2, threshold: 2 }, 2],
      [{ readings: [1, 1, 1], k: 2, threshold: 2 }, 0],
      [{ readings: [], k: 1, threshold: 0 }, 0],
      [{ readings: [5], k: 1, threshold: 4 }, 1],
      [{ readings: [-2, -3, -1], k: 2, threshold: -5 }, 1],
      [{ readings: [2, 3], k: 3, threshold: 0 }, 0],
      [{ readings: [0, 0, 0], k: 1, threshold: -1 }, 3],
      [{ readings: [10, -20, 10, 10], k: 2, threshold: 0 }, 1],
    ],
    `def solve(data):
    readings = data["readings"]
    window_size = data["k"]
    threshold = data["threshold"]
    if window_size > len(readings):
        return 0
    window_sum = 0
    for index in range(window_size):
        window_sum = window_sum + readings[index]
    alert_count = 0
    if window_sum > threshold:
        alert_count = alert_count + 1
    for index in range(window_size, len(readings)):
        window_sum = window_sum - readings[index - window_size]
        window_sum = window_sum + readings[index]
        if window_sum > threshold:
            alert_count = alert_count + 1
    return alert_count`,
    "Count the initial window, then subtract the departing element and add the arriving element for each slide. Use a strict comparison.",
    "O(n) time and O(1) auxiliary space.",
    `def solve(data):
    readings = data["readings"]
    window_size = data["k"]
    threshold = data["threshold"]
    if window_size > len(readings):
        return 0
    window_sum = 0
    for index in range(window_size):
        window_sum = window_sum + readings[index]
    alert_count = 0
    for index in range(window_size, len(readings)):
        window_sum = window_sum - readings[index - window_size]
        window_sum = window_sum + readings[index]
        if window_sum >= threshold:
            alert_count = alert_count + 1
    return alert_count`,
  ),
] as DebuggingProblem[];

export const finalCoding = [
  problem(
    "final-1-code",
    "Consolidate the signed inventory feed",
    "Inventory events are [item, signed_change] pairs. Add all changes for each item. Return [item, total] pairs in the order items FIRST appeared, omitting items whose final total is zero. An item that becomes zero and later nonzero keeps its original first-appearance position. Item names are case-sensitive.",
    "A decoded JSON list of [string, integer] pairs.",
    "List of [item, total] pairs in stable first-appearance order, excluding zero totals.",
    "0 <= events <= 100000; item length 1..40; changes are signed integers.",
    [
      [
        [
          ["pen", 3],
          ["book", 2],
          ["pen", -3],
          ["clip", 1],
          ["pen", 4],
        ],
        [
          ["pen", 4],
          ["book", 2],
          ["clip", 1],
        ],
      ],
      [
        [
          ["x", 2],
          ["y", -1],
          ["x", -2],
        ],
        [["y", -1]],
      ],
      [[], []],
      [
        [
          ["A", 1],
          ["a", 2],
        ],
        [
          ["A", 1],
          ["a", 2],
        ],
      ],
      [
        [
          ["p", 0],
          ["q", 3],
          ["p", 2],
        ],
        [
          ["p", 2],
          ["q", 3],
        ],
      ],
      [
        [
          ["p", 5],
          ["p", -5],
        ],
        [],
      ],
      [[["r", -4]], [["r", -4]]],
      [
        [
          ["z", 1],
          ["b", 2],
          ["z", 1],
          ["a", 3],
        ],
        [
          ["z", 2],
          ["b", 2],
          ["a", 3],
        ],
      ],
    ],
    `def solve(data):
    totals = {}
    order = []
    for item, change in data:
        if item not in totals:
            totals[item] = 0
            order.append(item)
        totals[item] = totals[item] + change
    result = []
    for item in order:
        if totals[item] != 0:
            result.append([item, totals[item]])
    return result`,
    "Accumulate totals without deleting zero entries, preserve first appearance separately, and filter zero totals only at the end.",
    "O(n) expected time and O(u) space for u distinct items.",
  ),
  problem(
    "final-2-code",
    "The two-category study stretch",
    "Each integer identifies the category of a study session. Find the longest contiguous stretch containing at most TWO distinct categories. Return [start, length], choosing the earliest start on a tie. Empty input returns [-1, 0]. Categories may be negative and repeated.",
    "A decoded JSON list of category integers.",
    "Two integers [zero-based start, length].",
    "0 <= n <= 100000; category values are signed integers.",
    [
      [
        [1, 2, 1, 3, 3, 2, 2],
        [3, 4],
      ],
      [
        [7, 7, 7],
        [0, 3],
      ],
      [[], [-1, 0]],
      [[1], [0, 1]],
      [
        [1, 2, 3, 4],
        [0, 2],
      ],
      [
        [-1, 0, -1, 0, 2],
        [0, 4],
      ],
      [
        [1, 2, 2, 3, 2, 2, 1],
        [1, 5],
      ],
      [
        [1, 2],
        [0, 2],
      ],
    ],
    `def solve(data):
    counts = {}
    left = 0
    best_start = -1
    best_length = 0
    for right in range(len(data)):
        category = data[right]
        counts[category] = counts.get(category, 0) + 1
        while len(counts) > 2:
            outgoing = data[left]
            counts[outgoing] = counts[outgoing] - 1
            if counts[outgoing] == 0:
                del counts[outgoing]
            left = left + 1
        length = right - left + 1
        if length > best_length:
            best_start = left
            best_length = length
    return [best_start, best_length]`,
    "Expand a sliding window, shrink until at most two category counts remain, and update the best only for greater length.",
    "O(n) expected time and O(1) auxiliary space because the active map contains at most three categories.",
  ),
  problem(
    "final-3-code",
    "Balance the audit annotations",
    "An audit text contains parentheses and lowercase letters. Letters do not affect balance. Insert the minimum number of parentheses anywhere so that the parentheses are balanced. You may not delete or reorder existing characters. Return only the minimum insertion count; an empty or letter-only string requires zero.",
    "A decoded JSON string of lowercase letters and parentheses.",
    "Nonnegative integer minimum insertions.",
    "0 <= length <= 100000.",
    [
      ["a)b(c))", 2],
      ["((audit", 2],
      ["", 0],
      ["abc", 0],
      ["()", 0],
      ["))((", 4],
      ["(a(b)c)", 0],
      [")a(", 2],
    ],
    `def solve(data):
    open_count = 0
    insertions = 0
    for character in data:
        if character == "(":
            open_count = open_count + 1
        elif character == ")":
            if open_count > 0:
                open_count = open_count - 1
            else:
                insertions = insertions + 1
    return insertions + open_count`,
    "Count unmatched opening parentheses; each unmatched closing parenthesis needs an opening insertion. Add remaining opens at the end.",
    "O(n) time and O(1) space.",
  ),
  problem(
    "final-4-code",
    "Earliest capacity breach",
    "Each booking is [start, end, units] and occupies units for the half-open interval start <= t < end. Return the earliest booking boundary time when total occupied units EXCEEDS capacity, or -1 if it never does. Departures and arrivals at the same time are applied together. Input order is arbitrary.",
    "A decoded JSON object with capacity and bookings (list of three-integer lists).",
    "Earliest integer timestamp exceeding capacity, or -1.",
    "0 <= bookings <= 100000; 0 <= start < end <= 1000000000; units > 0; capacity >= 0.",
    [
      [
        {
          capacity: 3,
          bookings: [
            [1, 5, 2],
            [3, 7, 2],
          ],
        },
        3,
      ],
      [
        {
          capacity: 2,
          bookings: [
            [1, 3, 2],
            [3, 5, 2],
          ],
        },
        -1,
      ],
      [{ capacity: 0, bookings: [] }, -1],
      [{ capacity: 0, bookings: [[0, 1, 1]] }, 0],
      [
        {
          capacity: 5,
          bookings: [
            [2, 5, 2],
            [2, 3, 4],
          ],
        },
        2,
      ],
      [
        {
          capacity: 4,
          bookings: [
            [1, 4, 2],
            [2, 3, 2],
          ],
        },
        -1,
      ],
      [
        {
          capacity: 3,
          bookings: [
            [9, 10, 4],
            [1, 2, 4],
          ],
        },
        1,
      ],
      [
        {
          capacity: 2,
          bookings: [
            [0, 2, 2],
            [2, 3, 1],
            [2, 4, 2],
          ],
        },
        2,
      ],
    ],
    `def solve(data):
    changes = {}
    for start, end, units in data["bookings"]:
        changes[start] = changes.get(start, 0) + units
        changes[end] = changes.get(end, 0) - units
    occupied = 0
    for timestamp in sorted(changes):
        occupied = occupied + changes[timestamp]
        if occupied > data["capacity"]:
            return timestamp
    return -1`,
    "Aggregate start and end deltas by timestamp, sort boundaries, and scan the occupied total. Grouping equal timestamps respects half-open intervals.",
    "O(n log n) time and O(n) space.",
  ),
  problem(
    "final-5-code",
    "Nearest support desk",
    "An undirected unweighted graph has vertices 0 through n-1. Several vertices are support desks. Return the minimum number of edges from EVERY vertex to any desk. Desk vertices have distance 0; vertices unreachable from all desks have -1. Edges may repeat and desks may repeat. With no desks, all distances are -1.",
    "A decoded JSON object with n, edges ([[u,v], ...]) and desks (vertex list).",
    "A list of n integer distances in vertex order.",
    "1 <= n <= 5000; 0 <= edges <= 20000; all vertex IDs valid.",
    [
      [
        {
          n: 6,
          edges: [
            [0, 1],
            [1, 2],
            [2, 3],
            [4, 5],
          ],
          desks: [0, 3],
        },
        [0, 1, 1, 0, -1, -1],
      ],
      [
        {
          n: 3,
          edges: [
            [0, 1],
            [1, 2],
          ],
          desks: [1],
        },
        [1, 0, 1],
      ],
      [{ n: 1, edges: [], desks: [] }, [-1]],
      [{ n: 1, edges: [], desks: [0, 0] }, [0]],
      [{ n: 4, edges: [], desks: [2] }, [-1, -1, 0, -1]],
      [
        {
          n: 3,
          edges: [
            [0, 1],
            [0, 1],
            [1, 2],
          ],
          desks: [2],
        },
        [2, 1, 0],
      ],
      [
        {
          n: 4,
          edges: [
            [0, 1],
            [1, 2],
            [2, 3],
          ],
          desks: [0, 3],
        },
        [0, 1, 1, 0],
      ],
      [
        {
          n: 2,
          edges: [
            [0, 0],
            [0, 1],
          ],
          desks: [],
        },
        [-1, -1],
      ],
    ],
    `def solve(data):
    from collections import deque
    graph = [[] for index in range(data["n"])]
    for first, second in data["edges"]:
        graph[first].append(second)
        graph[second].append(first)
    distances = [-1] * data["n"]
    pending = deque()
    for desk in data["desks"]:
        if distances[desk] == -1:
            distances[desk] = 0
            pending.append(desk)
    while pending:
        vertex = pending.popleft()
        for neighbor in graph[vertex]:
            if distances[neighbor] == -1:
                distances[neighbor] = distances[vertex] + 1
                pending.append(neighbor)
    return distances`,
    "Run one multi-source breadth-first search, initially enqueuing every distinct desk at distance zero.",
    "O(V+E) time and O(V+E) space.",
  ),
];

export const finalAiCoding = [
  problem(
    "final-1-ai",
    "Balanced alert segments",
    "Each event is either 0 (routine) or 1 (alert). Count all nonempty contiguous segments containing equal numbers of routine and alert events. Different start/end pairs count separately. Return 0 for an empty list. Design the approach before requesting an implementation.",
    "A decoded JSON list containing only integers 0 and 1.",
    "An integer count of balanced segments.",
    "0 <= n <= 100000; an O(n) expected-time solution is required.",
    [
      [[0, 1, 0, 1], 4],
      [[1, 1, 0], 1],
      [[], 0],
      [[0], 0],
      [[1, 1, 1], 0],
      [[0, 0, 1, 1], 2],
      [[1, 0, 1, 0, 1, 0], 9],
      [[0, 1], 1],
    ],
    `def solve(data):
    frequencies = {0: 1}
    balance = 0
    total = 0
    for event in data:
        if event == 1:
            balance = balance + 1
        else:
            balance = balance - 1
        total = total + frequencies.get(balance, 0)
        frequencies[balance] = frequencies.get(balance, 0) + 1
    return total`,
    "Map 0 to -1 and 1 to +1. Equal prefix balances delimit balanced segments. Count earlier occurrences before adding the current prefix.",
    "O(n) expected time and O(n) space.",
  ),
  problem(
    "final-2-ai",
    "Peak simultaneous reservations",
    "Reservations are [start,end] half-open intervals with start < end. Return the maximum number simultaneously active. At a timestamp where one reservation ends and another begins, the ended reservation no longer counts. Duplicates are separate reservations. Input is unsorted; empty input returns 0.",
    "A decoded JSON list of [start, end] integer pairs.",
    "A nonnegative integer peak overlap count.",
    "0 <= n <= 100000; 0 <= start < end <= 1000000000; target O(n log n) or better.",
    [
      [
        [
          [1, 4],
          [2, 5],
          [4, 6],
        ],
        2,
      ],
      [
        [
          [1, 2],
          [2, 3],
        ],
        1,
      ],
      [[], 0],
      [[[0, 1]], 1],
      [
        [
          [1, 4],
          [1, 4],
          [1, 4],
        ],
        3,
      ],
      [
        [
          [5, 9],
          [0, 8],
          [2, 6],
        ],
        3,
      ],
      [
        [
          [0, 2],
          [2, 4],
          [4, 6],
        ],
        1,
      ],
      [
        [
          [0, 10],
          [1, 2],
          [3, 4],
        ],
        2,
      ],
    ],
    `def solve(data):
    changes = {}
    for start, end in data:
        changes[start] = changes.get(start, 0) + 1
        changes[end] = changes.get(end, 0) - 1
    active = 0
    peak = 0
    for timestamp in sorted(changes):
        active = active + changes[timestamp]
        peak = max(peak, active)
    return peak`,
    "Use grouped start/end deltas or sorted starts and ends with departures processed first on ties. Scan for the largest active count.",
    "O(n log n) time and O(n) space.",
  ),
  problem(
    "final-3-ai",
    "Longest affordable restock stretch",
    "A truck may take one contiguous stretch of nonnegative restock costs whose sum is at most budget. Return [start, length] for the longest such stretch, choosing the earliest start on a tie. If no nonempty stretch is affordable, return [-1, 0]. Zero costs are valid and count toward length.",
    "A decoded JSON object with costs (nonnegative integer list) and budget (nonnegative integer).",
    "A two-integer list [zero-based start, length].",
    "0 <= n <= 100000; costs and budget <= 1000000000; target O(n) time.",
    [
      [{ costs: [2, 1, 3, 1, 1], budget: 5 }, [1, 3]],
      [{ costs: [0, 0, 4, 0], budget: 0 }, [0, 2]],
      [{ costs: [], budget: 4 }, [-1, 0]],
      [{ costs: [5, 6], budget: 3 }, [-1, 0]],
      [{ costs: [2, 2, 2], budget: 4 }, [0, 2]],
      [{ costs: [0, 0], budget: 0 }, [0, 2]],
      [{ costs: [9, 1, 1, 1], budget: 3 }, [1, 3]],
      [{ costs: [1, 2], budget: 5 }, [0, 2]],
    ],
    `def solve(data):
    left = 0
    window_sum = 0
    best_start = -1
    best_length = 0
    costs = data["costs"]
    for right in range(len(costs)):
        window_sum = window_sum + costs[right]
        while left <= right and window_sum > data["budget"]:
            window_sum = window_sum - costs[left]
            left = left + 1
        length = right - left + 1
        if length > best_length:
            best_start = left
            best_length = length
    return [best_start, best_length]`,
    "Nonnegative costs permit a sliding window: advance left while over budget. Strictly improve the best length to preserve the earliest tie.",
    "O(n) time and O(1) auxiliary space.",
  ),
  problem(
    "final-4-ai",
    "Count compatible score pairs",
    "Given integer scores and a nonnegative tolerance, count index pairs i < j for which abs(scores[i] - scores[j]) <= tolerance. Equal scores at different indices count separately. Do not count a score paired with itself. Return 0 for fewer than two scores.",
    "A decoded JSON object with scores (integer list) and tolerance (nonnegative integer).",
    "An integer pair count.",
    "0 <= n <= 100000; signed scores; target O(n log n) time or better.",
    [
      [{ scores: [4, 1, 3, 3], tolerance: 1 }, 3],
      [{ scores: [2, 2, 2], tolerance: 0 }, 3],
      [{ scores: [], tolerance: 2 }, 0],
      [{ scores: [9], tolerance: 0 }, 0],
      [{ scores: [-3, -1, 0, 4], tolerance: 2 }, 2],
      [{ scores: [1, 10, 20], tolerance: 0 }, 0],
      [{ scores: [0, 1, 2, 3], tolerance: 10 }, 6],
      [{ scores: [1, 2, 3], tolerance: 1 }, 2],
    ],
    `def solve(data):
    scores = sorted(data["scores"])
    left = 0
    total = 0
    for right in range(len(scores)):
        while scores[right] - scores[left] > data["tolerance"]:
            left = left + 1
        total = total + right - left
    return total`,
    "Sort scores, then maintain the earliest compatible left index for each right index. All positions in between form valid pairs with right, including duplicate values.",
    "O(n log n) time and O(n) space for a sorted copy.",
  ),
  problem(
    "final-5-ai",
    "Shortest complete audit span",
    "A lowercase log string must contain every character required by another lowercase string, including repeated requirements. Find the shortest contiguous span covering that multiset. Return [start, length], with earliest start on a tie. If no span covers the requirements return [-1, 0]. If required is empty return [0, 0].",
    "A decoded JSON object with log and required strings.",
    "A two-integer list [zero-based start, length].",
    "0 <= each string length <= 100000; characters a-z; target O(n+m) expected time.",
    [
      [{ log: "cabbaac", required: "aab" }, [3, 3]],
      [{ log: "abc", required: "dd" }, [-1, 0]],
      [{ log: "", required: "" }, [0, 0]],
      [{ log: "abc", required: "" }, [0, 0]],
      [{ log: "aa", required: "aa" }, [0, 2]],
      [{ log: "abcab", required: "ab" }, [0, 2]],
      [{ log: "zxaaayb", required: "aab" }, [3, 4]],
      [{ log: "", required: "a" }, [-1, 0]],
    ],
    `def solve(data):
    from collections import Counter
    required = data["required"]
    if len(required) == 0:
        return [0, 0]
    need = Counter(required)
    missing = len(required)
    left = 0
    best_start = -1
    best_length = len(data["log"]) + 1
    for right, character in enumerate(data["log"]):
        if need[character] > 0:
            missing = missing - 1
        need[character] = need[character] - 1
        while missing == 0:
            length = right - left + 1
            if length < best_length:
                best_start = left
                best_length = length
            outgoing = data["log"][left]
            need[outgoing] = need[outgoing] + 1
            left = left + 1
            if need[outgoing] > 0:
                missing = missing + 1
    if best_start == -1:
        return [-1, 0]
    return [best_start, best_length]`,
    "Track character deficits including multiplicity. Expand until all required copies are covered, then shrink while valid to minimize the span.",
    "O(n+m) expected time and O(1) alphabet-bounded auxiliary space.",
  ),
];
