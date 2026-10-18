"""Validate trusted authored final-paper reference code, never submitted user code.

Usage: python scripts/audit-final-content.py exported-final-problems.json
The JSON is an array of the three reserved programming banks exported by tsx.
"""
import json
import random
import sys
from collections import Counter, deque


def oracle(problem_id, data):
    if problem_id == "final-1-debug":
        best = [-1, 0]
        for start in range(len(data)):
            end = start + 1
            while end < len(data) and data[end] > data[end - 1]:
                end += 1
            if end - start > best[1]:
                best = [start, end - start]
        return best
    if problem_id == "final-2-debug":
        balance = data["initial"]
        result = []
        for delta in data["changes"]:
            balance = max(0, balance + delta)
            result.append(balance)
        return result
    if problem_id == "final-3-debug":
        return max(i for i in range(len(data["costs"]) + 1)
                   if sum(data["costs"][:i]) <= data["budget"])
    if problem_id == "final-4-debug":
        text = data
        while True:
            for index in range(len(text) - 1):
                if text[index].lower() == text[index + 1].lower() and text[index] != text[index + 1]:
                    text = text[:index] + text[index + 2:]
                    break
            else:
                return text
    if problem_id == "final-5-debug":
        return sum(sum(data["readings"][i:i + data["k"]]) > data["threshold"]
                   for i in range(len(data["readings"]) - data["k"] + 1))
    if problem_id == "final-1-code":
        order = list(dict.fromkeys(item for item, change in data))
        totals = {item: sum(change for key, change in data if key == item) for item in order}
        return [[item, totals[item]] for item in order if totals[item] != 0]
    if problem_id == "final-2-code":
        spans = [[i, j - i] for i in range(len(data)) for j in range(i + 1, len(data) + 1)
                 if len(set(data[i:j])) <= 2]
        return min(spans, key=lambda span: (-span[1], span[0])) if spans else [-1, 0]
    if problem_id == "final-3-code":
        balance = 0
        lowest = 0
        for char in data:
            balance += (char == "(") - (char == ")")
            lowest = min(lowest, balance)
        return balance - 2 * lowest
    if problem_id in ("final-4-code", "final-2-ai"):
        bookings = data["bookings"] if isinstance(data, dict) else [pair + [1] for pair in data]
        times = sorted(set(t for booking in bookings for t in booking[:2]))
        totals = [(t, sum(units for start, end, units in bookings if start <= t < end)) for t in times]
        if problem_id == "final-4-code":
            return next((t for t, total in totals if total > data["capacity"]), -1)
        return max((total for t, total in totals), default=0)
    if problem_id == "final-5-code":
        result = []
        desks = set(data["desks"])
        for origin in range(data["n"]):
            pending = deque([(origin, 0)])
            seen = {origin}
            distance = -1
            while pending:
                vertex, hops = pending.popleft()
                if vertex in desks:
                    distance = hops
                    break
                for a, b in data["edges"]:
                    neighbor = b if a == vertex else a if b == vertex else None
                    if neighbor is not None and neighbor not in seen:
                        seen.add(neighbor)
                        pending.append((neighbor, hops + 1))
            result.append(distance)
        return result
    if problem_id == "final-1-ai":
        return sum(data[i:j].count(0) == data[i:j].count(1)
                   for i in range(len(data)) for j in range(i + 1, len(data) + 1))
    if problem_id == "final-3-ai":
        spans = [[i, j - i] for i in range(len(data["costs"]))
                 for j in range(i + 1, len(data["costs"]) + 1)
                 if sum(data["costs"][i:j]) <= data["budget"]]
        return min(spans, key=lambda span: (-span[1], span[0])) if spans else [-1, 0]
    if problem_id == "final-4-ai":
        scores = data["scores"]
        return sum(abs(scores[i] - scores[j]) <= data["tolerance"]
                   for i in range(len(scores)) for j in range(i + 1, len(scores)))
    if problem_id == "final-5-ai":
        if not data["required"]:
            return [0, 0]
        required = Counter(data["required"])
        spans = [[i, j - i] for i in range(len(data["log"]))
                 for j in range(i + 1, len(data["log"]) + 1)
                 if Counter(data["log"][i:j]) >= required]
        return min(spans, key=lambda span: (span[1], span[0])) if spans else [-1, 0]
    raise ValueError(problem_id)


def random_input(problem_id, rng):
    values = [rng.randint(-4, 4) for _ in range(rng.randrange(12))]
    costs = [abs(value) for value in values]
    if problem_id in ("final-1-debug", "final-2-code"):
        return values
    if problem_id == "final-2-debug":
        return {"initial": rng.randrange(5), "changes": values}
    if problem_id in ("final-3-debug", "final-3-ai"):
        return {"costs": costs, "budget": rng.randrange(12)}
    if problem_id == "final-4-debug":
        return "".join(rng.choices("abABcC", k=len(values)))
    if problem_id == "final-5-debug":
        return {"readings": values, "k": rng.randint(1, 14), "threshold": rng.randint(-6, 6)}
    if problem_id == "final-1-code":
        return [[rng.choice("aAbc"), value] for value in values]
    if problem_id == "final-3-code":
        return "".join(rng.choices("ab()", k=len(values)))
    if problem_id in ("final-4-code", "final-2-ai"):
        bookings = []
        for _ in values:
            start = rng.randrange(8)
            bookings.append([start, start + rng.randint(1, 5), rng.randint(1, 4)])
        return {"bookings": bookings, "capacity": rng.randrange(10)} if problem_id == "final-4-code" else [row[:2] for row in bookings]
    if problem_id == "final-5-code":
        n = rng.randint(1, 8)
        return {"n": n, "edges": [[rng.randrange(n), rng.randrange(n)] for _ in values],
                "desks": [rng.randrange(n) for _ in range(rng.randrange(5))]}
    if problem_id == "final-1-ai":
        return [abs(value) % 2 for value in values]
    if problem_id == "final-4-ai":
        return {"scores": values, "tolerance": rng.randrange(5)}
    if problem_id == "final-5-ai":
        return {"log": "".join(rng.choices("abc", k=len(values))),
                "required": "".join(rng.choices("abc", k=rng.randrange(5)))}
    raise ValueError(problem_id)


problems = json.load(open(sys.argv[1], encoding="utf-8-sig"))
rng = random.Random(18102026)
checks = 0
for problem in problems:
    namespace = {}
    exec(problem["solution"], namespace)
    for case in problem["tests"]:
        assert oracle(problem["id"], case["input"]) == case["expected"], (problem["id"], "incorrect authored expectation", case)
        assert namespace["solve"](case["input"]) == case["expected"], (problem["id"], case)
        checks += 1
    for _ in range(200):
        data = random_input(problem["id"], rng)
        assert namespace["solve"](data) == oracle(problem["id"], data), (problem["id"], data)
        checks += 1
    if "buggyCode" in problem:
        buggy = {}
        exec(problem["buggyCode"], buggy)
        passed = sum(buggy["solve"](case["input"]) == case["expected"] for case in problem["tests"])
        assert passed / len(problem["tests"]) < 0.7, (problem["id"], "unrepaired starter can qualify")
print(f"Validated {len(problems)} reference solutions with {checks} authored and independent brute-force checks; every buggy starter falls below the qualification threshold.")
