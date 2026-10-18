from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from copy import deepcopy
from lxml import etree
from PIL import Image
import hashlib,json,sys

sys.path.insert(0,r'C:\Users\harsh\.codex\plugins\cache\openai-primary-runtime\documents\26.1007.11041\skills\documents\scripts')
import docx_ooxml_patch

ref=Path(r'C:\Users\harsh\.codex\plugins\cache\openai-curated-remote\openai-templates\0.1.1\skills\artifact-template-design-report\assets\reference.docx')
rootdir=Path(__file__).resolve().parent.parent
out=rootdir/'Exceller-design-report.docx'
expected='ba1e11258ff52659318a321462a5e598c7bed33cf991329eb91150788fcd1a7b'
assert hashlib.sha256(ref.read_bytes()).hexdigest()==expected
assert (rootdir/'qa'/'artifact.md').exists()
W='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
WP='http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
A='http://schemas.openxmlformats.org/drawingml/2006/main'
PIC='http://schemas.openxmlformats.org/drawingml/2006/picture'
PKG='http://schemas.openxmlformats.org/package/2006/relationships'
ns={'w':W,'r':R,'wp':WP,'a':A,'pic':PIC}
qn=lambda n:'{'+W+'}'+n
with ZipFile(ref) as z: parts={name:z.read(name) for name in z.namelist()}
doc=etree.fromstring(parts['word/document.xml']);body=doc.find(qn('body'));paras=list(body.findall(qn('p')));tables=list(body.findall(qn('tbl')))

def put(p,text,lead=False):
    nodes=p.findall('.//'+qn('t'))
    if not nodes:
        run=etree.SubElement(p,qn('r'));nodes=[etree.SubElement(run,qn('t'))]
    for node in nodes:node.text=''
    if lead and len(nodes)>1 and '. ' in text:
        a,b=text.split('. ',1);nodes[0].text=a+'. ';nodes[1].text=b
    else:nodes[0].text=text

replacements={
2:'Exceller design review',
7:'Choose the visual direction you want for the Capgemini Exceller preparation website. This review presents three concepts across fifteen screens, covering learning, MCQs, coding, debugging, AI coaching, mock assessments and your personal study library.',
8:'The preview gallery lets you compare the same screen in each direction, record a preference for every screen and export your choices. All concepts retain the approach-first AI gate, explicit question context and simulated assessment benchmarks. Your existing website is unchanged by these previews.',
10:'A Trail Campus organizes study as a guided journey with numbered steps and violet / lime surfaces.',
11:'B Fieldnotes uses an editorial contents index, serif typography and open reading columns.',
12:'C Control Room uses workspace tabs, a command rail and a separate context inspector.',
14:'Your feedback established two priorities: text must be comfortable to read, and assessment questions must include enough information to answer them without guessing missing assumptions. Each concept keeps context visible and separates feedback from an active assessment.',
15:'Review the gallery at http://127.0.0.1:3000/design-review/index.html. The Direction and Screen selectors provide forty-five desktop views. Approval selections are saved separately from preparation progress and do not trigger implementation.',
17:'Round two changes page structure, navigation and typography in response to your feedback. All concepts show the same features and assessment content, making comparison easier.',
19:'The current platform is an independent preparation simulation. No concept introduces an official hiring cutoff, exposes an API key or allows AI code generation before the required reasoning checks. Preview analytics are labelled illustrative, and other progress cards start at zero.',
21:'Trail Campus uses guided steps. Fieldnotes presents a study journal. Control Room pairs tools with a context inspector. No improvement in user retention has been measured.',
23:'Key takeaway. Approve the direction that feels easiest to read and use across practice and coding, not only the dashboard.',
26:'A single primary direction will make the site more coherent. You can still combine specific ideas, such as the Fieldnotes reading layout with Control Room editor surfaces. Any combination should retain consistent text sizes, status meanings and assessment controls.',
28:'Begin with the screens where you spend the most time. Compare MCQ practice and the problem workspace before deciding on the dashboard. Use the gallery to record your choices; approval remains your decision.',
29:'Compare the key screens. Switch through the three directions on practice, coding, AI coaching and assessment mode. Check context visibility, line lengths, contrast and control placement.',
30:'Record your preference. Click Approve this screen for your chosen direction, repeat for any other screens and export the choices. You may approve one direction for the whole site or specify a mix.',
31:'Share the decision. Send your chosen direction or exported screen preferences in chat. Implementation should begin only after that approval, followed by verification of the existing assessment flows.',
33:'The gallery provides enough detail to select a visual direction while keeping the preparation platform available as it is. The report summarizes the alternatives and the approval process.',
34:'Your final choice can be simple: A Trail Campus, B Fieldnotes or C Control Room for the whole website. If you prefer a combination, name the screens and the parts you want to keep.',
37:'Screen coverage includes Dashboard, Preparation, MCQ practice, Coding library, Problem workspace, Debugging, AI coding, Mock tests, Assessment mode, Communication, Interview preparation, Analytics, Bookmarks, Notes and Settings.',
38:'Use the comparison grid to note a preferred direction. The gallery contains the full navigable concepts, including actual seeded question context and sample problem content. Screenshots below show the first dashboard viewport; they are visual proposals, not user performance records.',
39:'Screen previews',
43:'Sources include the current Exceller Prep feature structure and seeded question bank, the user’s design and readability feedback, and the three locally authored preview directions. The selected Design Report template supplies this document’s layout.',
45:'Approval note. No direction has been approved on your behalf. Preview selections remain separate from the live app; share your final decision in chat before implementation.'
}
for index,text in replacements.items():put(paras[index],text,index in [23,29,30,31,45])
for t in tables[0].findall('.//'+qn('t')):
 if t.text and 'Short subtitle' in t.text:t.text='Three website directions for your approval'
 elif t.text and 'Prepared by' in t.text:t.text='Prepared by Codex'
 elif t.text and '[Month YYYY]' in t.text:t.text='October 2026'
rows=tables[1].findall(qn('tr'))
matrix=[['Direction','Layout','Best fit'],['A Trail Campus','Session rail and numbered steps','Guided daily study'],['B Fieldnotes','Contents index and editorial columns','Long-form reading and revision'],['C Control Room','Command rail, tabs and context inspector','Tools and technical study sessions']]
for row,values in zip(rows,matrix):
 for cell,value in zip(row.findall(qn('tc')),values):
  ps=cell.findall(qn('p'));put(ps[0],value)
  for p in ps[1:]:put(p,'')

# Extend the Appendix using the retained table and figure components.
approval=deepcopy(tables[1]);approval_rows=approval.findall(qn('tr'))
for row in approval_rows[1:]:approval.remove(row)
for cell,value in zip(approval_rows[0].findall(qn('tc')),['Screen','Direction','Your notes']):put(cell.findall(qn('p'))[0],value)
header_props=approval_rows[0].find(qn('trPr'))
if header_props is None:header_props=etree.SubElement(approval_rows[0],qn('trPr'))
etree.SubElement(header_props,qn('tblHeader'))
for title in ['Dashboard','Learning','MCQs','Coding library','Workspace','Debugging','AI coding','Mock tests','Assessment','Communication','Interview','Analytics','Bookmarks','Notes','Settings']:
 row=deepcopy(rows[1]);approval.append(row)
 for cell,value in zip(row.findall(qn('tc')),[title,'A   B   C','']):
  ps=cell.findall(qn('p'));put(ps[0],value)
  for p in ps[1:]:put(p,'')
paras[38].addnext(approval)
preview_pr=paras[39].find(qn('pPr'))
etree.SubElement(preview_pr,qn('pageBreakBefore')).set(qn('val'),'1')

rels=etree.fromstring(parts['word/_rels/document.xml.rels'])
content_types=etree.fromstring(parts['[Content_Types].xml'])
CT='http://schemas.openxmlformats.org/package/2006/content-types'
if not any(n.get('Extension')=='png' for n in content_types):etree.SubElement(content_types,'{'+CT+'}Default',Extension='png',ContentType='image/png')
image_p=next(p for p in paras if p.find('.//{'+WP+'}inline') is not None)
for index,(key,title,desc) in enumerate([
 ('navy','Trail Campus','A violet learning journey with a session rail and numbered practice steps. The dashboard prioritizes one useful session over a grid of progress cards.'),
 ('teal','Fieldnotes','An editorial study journal with warm paper surfaces, oversized serif typography and a contents index. Lessons and questions use open reading columns.'),
 ('studio','Control Room','A dark tool workspace with lime accents, a command rail and workspace tabs. A separate context inspector supports the selected task.')
]):
 anchor=paras[40+index]
 heading=deepcopy(paras[18]);put(heading,title)
 for node in heading.findall(qn('bookmarkStart'))+heading.findall(qn('bookmarkEnd')):heading.remove(node)
 ppr=heading.find(qn('pPr'));br=ppr.find(qn('pageBreakBefore'))
 if br is None:br=etree.SubElement(ppr,qn('pageBreakBefore'))
 br.set(qn('val'),'1' if index else '0')
 paragraph=deepcopy(paras[19]);put(paragraph,desc)
 picture=deepcopy(image_p)
 file=rootdir/'images'/f'{key}-overview.png'
 image=Image.open(file);cx=int(6.5*914400);cy=round(cx*image.height/image.width)
 rid='rIdDesign'+str(index+1)
 for blip in picture.findall('.//{'+A+'}blip'):blip.set('{'+R+'}embed',rid)
 for extent in picture.findall('.//{'+WP+'}extent')+picture.findall('.//{'+A+'}ext'):extent.set('cx',str(cx));extent.set('cy',str(cy))
 for props in picture.findall('.//{'+WP+'}docPr'):props.set('id',str(200+index));props.set('name',title+' concept');props.set('descr',title+' dashboard first viewport design preview')
 caption=deepcopy(paras[19]);put(caption,f'Direction {chr(65+index)} dashboard preview. Review all fifteen screens in the gallery before approving this direction.')
 for element in [heading,paragraph,picture,caption]:anchor.addprevious(element)
 body.remove(anchor)
 target='media/design-'+key+'.png';parts['word/'+target]=file.read_bytes()
 etree.SubElement(rels,'{'+PKG+'}Relationship',Id=rid,Type=R+'/image',Target=target)

header=etree.fromstring(parts['word/header1.xml'])
for node in header.findall('.//'+qn('t')):
 if node.text=='Report title':node.text='Exceller design review'
 elif node.text=='Date':node.text='October 2026'
settings=etree.fromstring(parts['word/settings.xml']);update=settings.find(qn('updateFields'))
if update is None:update=etree.SubElement(settings,qn('updateFields'))
update.set(qn('val'),'true')
for name,element in [('word/document.xml',doc),('word/header1.xml',header),('word/settings.xml',settings),('word/_rels/document.xml.rels',rels),('[Content_Types].xml',content_types)]:parts[name]=etree.tostring(element,xml_declaration=True,encoding='UTF-8',standalone=True)
with ZipFile(out,'w',ZIP_DEFLATED) as z:
 for name,data in parts.items():z.writestr(name,data)
inventory=json.loads((rootdir/'qa'/'reference-inventory.json').read_text())
for name,info in inventory.items():
 if not info['editable']:assert hashlib.sha256(parts[name]).hexdigest()==info['sha256'],name
assert hashlib.sha256(ref.read_bytes()).hexdigest()==expected
assert len(doc.findall('.//'+qn('sectPr')))==2
text=' '.join(doc.xpath('//w:t/text()',namespaces=ns))
assert 'Lorem ipsum' not in text and '[Author' not in text
print(out)
print('Preserve-only package parts and retained template hash verified.')
