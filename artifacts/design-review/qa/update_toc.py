from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from copy import deepcopy
from lxml import etree
import json

root = Path(__file__).resolve().parent.parent
path = root / 'Exceller-design-report.docx'
with ZipFile(path) as z:
    parts = {n: z.read(n) for n in z.namelist()}
W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
q = lambda name: '{' + W + '}' + name
ns = {'w': W}
doc = etree.fromstring(parts['word/document.xml'])
body = doc.find(q('body'))
control = next(s for s in body.findall(q('sdt')) if s.find('.//' + q('instrText')) is not None)
content = control.find(q('sdtContent'))
original = list(content.findall(q('p')))
begin_runs = [deepcopy(r) for r in original[0].findall(q('r')) if r.find(q('fldChar')) is not None or r.find(q('instrText')) is not None]
end_run = deepcopy(next(c.getparent() for c in control.findall('.//' + q('fldChar')) if c.get(q('fldCharType')) == 'end'))
entries = [line.split('\t') for line in json.loads((root/'qa'/'word-fields.json').read_text(encoding='utf-8-sig'))['toc'].strip().split('\r')]
h1 = {'Executive summary', 'Key findings', 'Recommendations', 'Conclusion', 'Appendix'}
for child in list(content):
    content.remove(child)
for i, (label, number) in enumerate(entries):
    heading = next(p for p in body.findall(q('p')) if ''.join(p.xpath('.//w:t/text()', namespaces=ns)) == label)
    bookmark = 'DesignHeading' + str(i)
    start = etree.Element(q('bookmarkStart')); start.set(q('id'), str(300+i)); start.set(q('name'), bookmark)
    end = etree.Element(q('bookmarkEnd')); end.set(q('id'), str(300+i))
    heading.insert(1, start); heading.append(end)
    p = deepcopy(original[0 if label in h1 else 1])
    for child in list(p):
        if child.tag not in [q('pPr'), q('hyperlink')]: p.remove(child)
    link = p.find(q('hyperlink')); link.set(q('anchor'), bookmark)
    for instruction in link.findall('.//' + q('instrText')):
        if 'PAGEREF' in (instruction.text or ''):
            instruction.text = ' PAGEREF ' + bookmark + ' \\h '
    texts = link.findall('.//' + q('t')); texts[0].text = label; texts[-1].text = number
    if i == 0:
        for offset, run in enumerate(begin_runs): p.insert(1+offset, run)
    if i == len(entries)-1: p.append(end_run)
    content.append(p)
parts['word/document.xml'] = etree.tostring(doc, xml_declaration=True, encoding='UTF-8', standalone=True)
with ZipFile(path, 'w', ZIP_DEFLATED) as z:
    for name, data in parts.items(): z.writestr(name, data)
print('Updated fifteen cached TOC entries and heading links from native pagination.')
