import test from 'node:test';
import assert from 'node:assert/strict';
import {buildRequest,readingFrom,emotions,valenceRubric,energyRubric} from '../cool-demo/emotion/request.mjs';

const frame='data:image/jpeg;base64,YWJj';
const answers=()=>({
 emotion:{type:'choice',choice:'happy',confidence:0.9,probabilities:{happy:0.9,sad:0.02,angry:0.01,surprised:0.03,fearful:0.01,disgusted:0.01,neutral:0.02}},
 valence:{type:'score',score:4,confidence:0.8},
 energy:{type:'score',score:0,confidence:0.7},
 face:{type:'noul',noul:0.97},
});

test('emotion request sends one camera frame with four keyed questions',()=>{
 const r=buildRequest('featherless-ai/gemma-4-26B-A4B-classifier',frame);
 assert.equal(r.state,undefined);
 assert.equal(r.messages.length,1);
 assert.equal(r.messages[0].content.filter(x=>x.type==='image_url').length,1);
 assert.equal(r.messages[0].content[1].image_url.url,frame);
 assert.deepEqual(Object.keys(r.questions),['emotion','valence','energy','face']);
 assert.deepEqual(Object.keys(r.questions.emotion.criteria),Object.keys(emotions));
 assert.deepEqual(r.questions.valence.criteria,valenceRubric);
 assert.deepEqual(r.questions.energy.criteria,energyRubric);
 assert.equal(r.questions.face.type,'noul');
 assert.throws(()=>buildRequest('featherless-ai/RWKV-small-classifier',frame),/vision model/);
 assert.throws(()=>buildRequest('featherless-ai/gemma-4-26B-A4B-classifier','https://example.com/a.jpg'),/camera frame/);
});

test('readings map rubric scores onto display ranges',()=>{
 const r=readingFrom({answers:answers()});
 assert.equal(r.emotion,'happy');
 assert.equal(r.valence,1);
 assert.equal(r.energy,0);
 assert.equal(r.faceVisible,true);
 const mid=answers();mid.valence.score=2;mid.energy.score=1.5;mid.face.noul=0.2;
 const m=readingFrom({answers:mid});
 assert.equal(m.valence,0);
 assert.equal(m.energy,0.5);
 assert.equal(m.faceVisible,false);
});

test('invalid or incomplete answers cannot be displayed as readings',()=>{
 const broken=[
  a=>{a.emotion.choice='bored'},
  a=>{delete a.emotion.probabilities.neutral},
  a=>{a.emotion.probabilities.sad=NaN},
  a=>{a.valence.score=5},
  a=>{a.energy.score=-0.1},
  a=>{delete a.face},
  a=>{a.face.noul=1.5},
 ];
 for(const breakIt of broken){const a=answers();breakIt(a);assert.throws(()=>readingFrom({answers:a}),/invalid/);}
 assert.throws(()=>readingFrom({}),/invalid/);
});
