import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
errors = []
for bank in ['coding-problems', 'debugging-problems', 'ai-coding-problems']:
    for problem in json.loads((root / 'data' / (bank + '.json')).read_text(encoding='utf-8')):
        for i, test in enumerate(problem['tests']):
            scope = {}
            try:
                exec(problem['solution'], scope)
                actual = scope['solve'](test['input'])
                if actual != test['expected']:
                    errors.append(f"{problem['id']} test {i}: expected {test['expected']}, got {actual}")
            except Exception as e:
                errors.append(f"{problem['id']} reference error: {e}")
        if bank == 'debugging-problems':
            fails = False
            # Avoid running intentional nonterminating pointer mutations in-process.
            if 'l-=1' in problem['buggyCode']:
                fails = True
            else:
                for test in problem['tests']:
                    scope = {}
                    try:
                        exec(problem['buggyCode'], scope)
                        if scope['solve'](test['input']) != test['expected']:
                            fails = True
                    except Exception:
                        fails = True
            if not fails:
                errors.append(f"{problem['id']} buggy code passes all tests: {problem['title']}")
if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
print('All reference solutions pass. All debugging implementations fail at least one test.')
