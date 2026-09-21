"""Prepare original MME, POPE and TallyQA files; no model or network calls.

Requires Pillow. Supply separately downloaded original image directories. Original
question text and labels are retained. Re-encode images as RGB PNG without resize,
strip filenames from model context, and hash inputs and prepared pixels.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
import zipfile

ROOT=Path(__file__).resolve().parent
MME_CATEGORIES=['existence','count','position','color','posters','celebrity','scene','landmark','artwork','OCR']


def mme(root):
    """Support original flat categories and images/questions_answers layout."""
    for category in MME_CATEGORIES:
        folder=root/category
        questions=folder/'questions_answers' if (folder/'questions_answers').is_dir() else folder
        files=sorted(questions.glob('*.txt'))
        if not files: raise ValueError(f'Missing MME category: {category}')
        for path in files:
            candidates=[p for base in [folder,folder/'images'] for p in base.glob(path.stem+'.*') if p.suffix.lower() in ('.jpg','.jpeg','.png')]
            if len(candidates)!=1: raise ValueError(f'Expected one image for {path}')
            lines=[l for l in path.read_text().splitlines() if l.strip()]
            if len(lines)!=2: raise ValueError('MME image must have two questions')
            for i,line in enumerate(lines):
                question,answer=line.rsplit('\t',1)
                if answer.strip().lower() not in ('yes','no'): raise ValueError('Invalid MME answer')
                yield {'id':f'{category}-{path.stem}-{i}','benchmark':'mme','category':category,'image_id':path.stem,
                       'question':question,'answer':answer.strip().lower()},candidates[0],path


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('suite',choices=['vision-mme-perception','vision-pope-random','vision-pope-popular','vision-pope-adversarial','vision-tallyqa'])
    p.add_argument('--images',type=Path,required=True,help='MME release root, COCO val2014 directory, or TallyQA parent containing VG_100K etc.')
    p.add_argument('--annotations',type=Path,help='Original TallyQA tallyqa.zip (POPE annotations are bundled)')
    a=p.parse_args();out=ROOT/'data'/a.suite
    if out.exists(): p.error('Output already exists')
    meta=json.loads((ROOT/'vendor/visual-qa'/f'{a.suite}.json').read_text())
    files={}
    def check(path,expected=None):
        raw=path.read_bytes();sha=hashlib.sha256(raw).hexdigest()
        if expected and sha!=expected: raise ValueError('Annotation checksum mismatch')
        files[str(path)]=sha
        return raw
    def safe_image(relative):
        path=(a.images/relative).resolve()
        if not path.is_relative_to(a.images.resolve()): raise ValueError('Image path escapes root')
        return path
    if a.suite=='vision-mme-perception': records=mme(a.images)
    elif a.suite=='vision-tallyqa':
        if not a.annotations: p.error('--annotations tallyqa.zip required')
        raw=check(a.annotations,meta['annotation_sha256'])
        data=json.loads(zipfile.ZipFile(io.BytesIO(raw)).read('test.json'))
        records=(({'id':str(r['question_id']),'benchmark':'tallyqa','category':'simple' if r['issimple'] else 'complex',
                   'image_id':str(r['image_id']),'question':r['question'],'answer':r['answer']},safe_image(r['image']),a.annotations) for r in data)
    else:
        path=ROOT/'vendor/visual-qa'/meta['annotation_file']
        data=[json.loads(l) for l in check(path,meta['annotation_sha256']).splitlines() if l.strip()]
        records=(({'id':str(r['question_id']),'benchmark':'pope','category':a.suite.removeprefix('vision-pope-'),
                   'image_id':r['image'],'question':r['text'],'answer':r['label']},safe_image(r['image']),path) for r in data)
    from PIL import Image,ImageOps
    from adapters import visual_qa
    (out/'images').mkdir(parents=True)
    cache={};rows=[]
    for row,image,annotation in records:
        if str(annotation) not in files: check(annotation)
        if image not in cache:
            raw=check(image)
            with Image.open(io.BytesIO(raw)) as im:
                converted=ImageOps.exif_transpose(im).convert('RGB');b=io.BytesIO();converted.save(b,format='PNG')
            encoded=b.getvalue();sha=hashlib.sha256(encoded).hexdigest();relative=f'images/{sha}.png'
            (out/relative).write_bytes(encoded);cache[image]=(relative,sha)
        row['image_path'],row['image_sha256']=cache[image];rows.append(row)
    visual_qa.bind_assets(rows,out);visual_qa.validate(rows)
    content=''.join(json.dumps({k:v for k,v in r.items() if not k.startswith('_')},ensure_ascii=False)+'\n' for r in rows)
    (out/'rows.jsonl').write_text(content)
    import PIL
    (out/'provenance.json').write_text(json.dumps({'source':meta,'files':files,'rows':len(rows),'pillow_version':PIL.__version__,
        'preprocessing':'EXIF transpose, RGB PNG; no resize/crop','dataset_sha256':hashlib.sha256(content.encode()).hexdigest(),
        'preparer_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest()},indent=2)+'\n')
    print(f'Prepared {len(rows)} original questions; no inference performed')


if __name__=='__main__': main()
