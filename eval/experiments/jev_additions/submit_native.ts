// Additional four native-prompt jobs, isolated and idempotent per checkpoint.
import {resolveAuth} from '/workspace/gpu-cloud/featherless-gpu-cloud-run-with-ref/packages/cli/src/config.ts';
import {CloudClient} from '/workspace/gpu-cloud/featherless-gpu-cloud-run-with-ref/packages/cli/src/clients/cloud.ts';
import fs from 'node:fs/promises';
const root='/root/open-jev-experiments/jev-additions-native-v1';
const plan=JSON.parse(await fs.readFile(root+'/plan.json','utf8'));
const slug=process.argv[2];if(!plan.models[slug])throw Error('Unknown native-prompt model');
const auth=await resolveAuth();const client=new CloudClient(auth.apiBase,auth.apiKey);
await fs.mkdir(root+'/jobs',{recursive:true});const record=root+'/jobs/'+slug+'.json';
try {const saved=JSON.parse(await fs.readFile(record,'utf8'));const job=await client.getJob(saved.id);console.log(JSON.stringify({slug,id:job.id,state:job.state}));process.exit(0);}catch(e){if(e.code!=='ENOENT')throw e;}
const response=await fetch(auth.apiBase+'/run-jobs/pricing',{headers:{Authorization:'Bearer '+auth.apiKey}});
if(!response.ok)throw Error('Pricing HTTP '+response.status);
const prices=await response.json();const offer=prices.find(p=>['gpu','run-job.gpu'].includes(p.resourceType)&&p.resources?.gpuModel==='MI325X'&&p.gpuCount===1);
if(!offer)throw Error('No single MI325X offer');
const volumes=await client.listVolumes();
const mounts=[['my-workspace','/workspace'],['root-mount','/root']].map(([name,mountPath])=>{const v=volumes.find(v=>v.name===name);if(!v)throw Error('Missing volume '+name);return {networkVolumeId:v.id,mountPath};});
const name='jev-additions-native-'+plan.source_revision.slice(0,7)+'-'+slug+'-v1';
const body={name,computeSku:offer.sku,containerImage:plan.images[slug],networkVolumeMounts:mounts,ephemeralDiskGiB:20,workingDirectory:root,command:['bash','/workspace/open-jev/simple-jev-evals/eval/experiments/jev_additions/run_native_gpu.sh',slug],timeoutSeconds:25200,retainLogs:true};
await fs.writeFile(root+'/jobs/'+slug+'.submission.json',JSON.stringify({idempotencyKey:name,body},null,2));
const job=await client.createJob(body,name);
await fs.writeFile(record,JSON.stringify(job,null,2));console.log(JSON.stringify({slug,id:job.id,state:job.state}));
