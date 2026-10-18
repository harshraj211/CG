"""Use the canonical DOCX rasterizer with a native Word PDF on Windows.
The runtime has no bundled Windows LibreOffice; no substitute office package is installed.
"""
from pathlib import Path
import importlib.util
import shutil
import sys
import os

skill=Path(r'C:\Users\harsh\.codex\plugins\cache\openai-primary-runtime\documents\26.1007.11041\skills\documents')
spec=importlib.util.spec_from_file_location('canonical_renderer',skill/'render_docx.py')
renderer=importlib.util.module_from_spec(spec)
spec.loader.exec_module(renderer)
docx,pdf,out=map(Path,sys.argv[1:4])
poppler=Path(r'C:\Users\harsh\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin')
if not poppler.exists(): poppler=poppler.parent.parent/'bin'
os.environ['PATH']=str(poppler)+os.pathsep+os.environ.get('PATH','')
def native_pdf_conversion(doc_path,user_profile,convert_tmp_dir,stem,verbose=False):
    target=Path(convert_tmp_dir)/(stem+'.pdf')
    shutil.copy2(pdf,target)
    return str(target),'Native Word read-only PDF export used for this Windows render.'
renderer.convert_to_pdf=native_pdf_conversion
pages=renderer.rasterize(str(docx),str(out),150,verbose=False,emit_pdf=False)
print('\n'.join(pages))
