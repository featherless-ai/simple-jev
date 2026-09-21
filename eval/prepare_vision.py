"""Download pinned test images and prepare portable vision-classification suites.

Optional preparation dependencies: datasets and Pillow. No model dependencies
or calls. Output is one self-contained directory with rows.jsonl, PNG images,
and provenance. Default suites use all original classes in their held-out split.
No training examples, random class subsets, resizing, or cropping are introduced.
"""
import argparse
import hashlib
import importlib.metadata
import io
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parent


def make_row(config, source_index, source_label, raw):
    """Map source class ID explicitly; use opaque class/image identifiers."""
    name=config['source_labels'][source_label]
    selected=config['source_labels']
    sha=hashlib.sha256(raw).hexdigest()
    id=f"image-{source_index:06d}"
    return {'id':id,'group_id':id,'family':config['id'],'state':None,
            'question':config['question'],'options':[{'id':f'class_{i}','description':n.replace('_',' ')} for i,n in enumerate(selected)],
            'label':selected.index(name),'image_path':f'images/{sha}.png','image_sha256':sha,
            'source_index':source_index,'source_label':source_label}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    choices=[f.stem for f in (ROOT/'vendor/vision').glob('*.json')]
    p.add_argument('suite',choices=choices)
    a=p.parse_args()
    config_path=ROOT/'vendor/vision'/f'{a.suite}.json'
    cfg=json.loads(config_path.read_text());out=ROOT/'data'/a.suite
    if out.exists(): p.error('Output exists; preserve completed data or remove an incomplete preparation before retrying')
    from datasets import load_dataset
    from PIL import ImageOps
    ds=load_dataset(cfg['repository'],name=cfg['config'],revision=cfg['revision'],split=cfg['split'])
    if len(ds)!=cfg['source_rows']: raise ValueError('Source split size changed')
    if ds.features[cfg['label_column']].names!=cfg['source_labels']: raise ValueError('Source class mapping changed')
    (out/'images').mkdir(parents=True)
    counts={name:0 for name in cfg['source_labels']};total=0
    with (out/'rows.jsonl').open('x') as output:
        for index in range(len(ds)):
            example=ds[index]
            source_label=example[cfg['label_column']]
            name=cfg['source_labels'][source_label]
            image=ImageOps.exif_transpose(example[cfg['image_column']]).convert('RGB')
            buffer=io.BytesIO();image.save(buffer,format='PNG');raw=buffer.getvalue()
            row=make_row(cfg,index,source_label,raw)
            path=out/row['image_path']
            if not path.exists(): path.write_bytes(raw)
            output.write(json.dumps(row,ensure_ascii=False)+'\n')
            counts[name]+=1;total+=1
    if any(n==0 for n in counts.values()): raise ValueError('Empty class in selected split')
    meta={'source':cfg,'rows':total,'per_class':counts,
          'dataset_sha256':hashlib.sha256((out/'rows.jsonl').read_bytes()).hexdigest(),
          'config_sha256':hashlib.sha256(config_path.read_bytes()).hexdigest(),
          'preparer_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
          'versions':{name:importlib.metadata.version(name) for name in ['datasets','Pillow']}}
    (out/'provenance.json').write_text(json.dumps(meta,indent=2)+'\n')
    print(f'Prepared {total} images in {out}; no inference performed')


if __name__=='__main__': main()
