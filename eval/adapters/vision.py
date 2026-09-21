"""Image classification through standard image_url chat content and Choice.

Rows contain opaque image paths and SHA-256 commitments, never public URLs.
The suite loader binds relative paths to the JSONL directory. Before any calls,
validate verifies every image; request construction rechecks bytes and sends a
base64 data URL. Gold labels, source class names, and filenames are not context.
The full allowed class list is deliberately visible as question criteria.
"""
import base64
import hashlib
from pathlib import Path
from . import choice


def bind_assets(rows, root):
    root=Path(root).resolve()
    for row in rows:
        relative=Path(row['image_path'])
        path=(root/relative).resolve()
        if relative.is_absolute() or not path.is_relative_to(root):
            raise ValueError('Image must be inside dataset directory')
        row['_image_file']=str(path)


def image_bytes(row):
    raw=Path(row['_image_file']).read_bytes()
    if hashlib.sha256(raw).hexdigest()!=row['image_sha256']:
        raise ValueError('Image checksum mismatch')
    if not raw.startswith(b'\x89PNG\r\n\x1a\n'):
        raise ValueError('Prepared image must be PNG')
    return raw


def validate(rows):
    choice.validate(rows)
    for row in rows:
        if not 2<=len(row['options'])<=50:
            raise ValueError('Vision choice requires 2–50 classes')
        image_bytes(row)


def request_for(row,model):
    encoded=base64.b64encode(image_bytes(row)).decode('ascii')
    return {'model':model,'messages':[{'role':'user','content':[
        {'type':'text','text':'Classify the image using the supplied question.'},
        {'type':'image_url','image_url':{'url':'data:image/png;base64,'+encoded}}]}],
        'questions':{'decision':{'type':'choice','instructions':row['question'],
                                  'criteria':{o['id']:o['description'] for o in row['options']}}}}


parse_response=choice.parse_response


def summarize(rows,records):
    result=choice.summarize(rows,records)
    classes={}
    for row,record in zip(rows,records):
        label=row['options'][row['label']]['description']
        cell=classes.setdefault(label,{'rows':0,'correct':0})
        cell['rows']+=1
        p=record.get('probabilities')
        cell['correct']+=int(p is not None and max(range(len(p)),key=p.__getitem__)==row['label'])
    for cell in classes.values(): cell['accuracy']=cell['correct']/cell['rows']
    result['per_class']=classes
    result['macro_class_accuracy']=sum(c['accuracy'] for c in classes.values())/len(classes)
    return result
