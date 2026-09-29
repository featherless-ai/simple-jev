import{i as e,n as t,r as n,t as r}from"./index-CAduu3ti.js";var i=(e,t,n)=>Math.max(t,Math.min(n,e)),a=(e,t,n)=>e+(t-e)*n,o=(e,t=2)=>Number(e.toFixed(t)),s=(e,t)=>Math.hypot(e.x-t.x,e.z-t.z),c=e=>Math.atan2(Math.sin(e),Math.cos(e)),l=(e,t)=>Math.atan2(t.x-e.x,e.z-t.z),u=(e,t,n)=>({x:e.x+Math.sin(t)*n,z:e.z-Math.cos(t)*n});function d(e){let t=Number(e)>>>0;return()=>{t+=1831565813;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}var f=(e,t)=>t[Math.floor(e()*t.length)];function p(e,t,n=0){let r={distance:1/0,index:0,t:0,x:0,z:0,s:0};for(let a=Math.max(0,n-15);a<t.length-1;a++){let n=t[a],o=t[a+1],s=o.x-n.x,c=o.z-n.z,u=s*s+c*c,d=i(((e.x-n.x)*s+(e.z-n.z)*c)/(u||1),0,1),f=n.x+s*d,p=n.z+c*d,m=Math.hypot(e.x-f,e.z-p);m<r.distance&&(r={distance:m,index:a,t:d,x:f,z:p,s:n.s+Math.sqrt(u)*d,heading:l(n,o)})}return r}function m(e,t){if(t<=0)return e[0];if(t>=e.at(-1).s)return e.at(-1);let n=0,r=e.length-1;for(;n+1<r;){let i=n+r>>1;e[i].s<t?n=i:r=i}let i=e[n],o=e[r],s=(t-i.s)/(o.s-i.s);return{x:a(i.x,o.x,s),z:a(i.z,o.z,s),s:t,heading:l(i,o)}}function h(e,t=1){let n=[{...e[0],s:0}],r=0;for(let i=1;i<e.length;i++){let o=e[i-1],c=e[i],l=s(o,c),u=Math.max(1,Math.ceil(l/t));for(let e=1;e<=u;e++)r+=l/u,n.push({x:a(o.x,c.x,e/u),z:a(o.z,c.z,e/u),s:r})}return n}function g(e,t,n,r){for(let i of n){if(i.id===r)continue;let n=.015,a=.985;for(let r of[`x`,`z`]){let o=t[r]-e[r],s=i[r===`x`?`width`:`depth`]/2;if(Math.abs(o)<1e-6){if(e[r]<i[r]-s||e[r]>i[r]+s){n=2;break}}else{let t=(i[r]-s-e[r])/o,c=(i[r]+s-e[r])/o;t>c&&([t,c]=[c,t]),n=Math.max(n,t),a=Math.min(a,c)}}if(a>=n)return!0}return!1}var _=2.7,v=2.5;function y(e,t){let n=u(e,e.heading,e.depth/2);return(t.x-n.x)*Math.sin(t.heading)-(t.z-n.z)*Math.cos(t.heading)}function b(e,t){let n=Math.max(0,y(e,t)-.5),r=4.5,i=.45;return Math.max(.6,Math.sqrt((r*i)**2+2*r*n)-r*i)}function x(e){return .58+.37*(1-i((Math.abs(e)-3)/5,0,1))}function S(e,t){return Math.tan(e*x(t))/_}function C(e,t){return i(Math.atan(_*e)/x(t),-.85,.85)}function w(e,t,n,r){e.speed+=i(n-e.speed,-8*r,5*r);let a=e.wheelSteering??e.steering??0;e.wheelSteering=a+i(t-a,-1.8*r,1.8*r),E(e,e.wheelSteering,r),e.steering=t}function T(e,t,n,r,a){n=i(n,-1,1),r=i(r,0,1);let o=Math.abs(e.speed),s=.18+.0017*o*o+(Math.abs(n)<.01?.32:0),c=n*e.speed<-.01,l=r*11+(c?Math.abs(n)*8:0);if(r||c||!n)e.speed=Math.sign(e.speed)*Math.max(0,o-(s+l)*a);else{let t=n*(n<0?2.5:5);e.speed+=(t-Math.sign(e.speed||n)*s)*a,e.speed=i(e.speed,-3,34)}t=i(t,-1,1);let u=e.steeringProgress||0,d=t*u<0,f=d?0:t,p=(d||Math.abs(f)<Math.abs(u)?5:1.6)*a;e.steeringProgress=u+i(f-u,-p,p);let m=e.steeringProgress;e.wheelSteering=m*(.2+.8*Math.abs(m))*(1+(Math.min(1,1.008/(1+(Math.abs(e.speed)/7)**1.4))-1)*i((Math.abs(e.speed)-3)/5,0,1)),E(e,e.wheelSteering,a)}function E(e,t,n){Math.abs(e.speed)<.01&&(e.speed=0),e.steering=t,e.heading=c(e.heading+e.speed*S(t,e.speed)*n),e.x+=Math.sin(e.heading)*e.speed*n,e.z-=Math.cos(e.heading)*e.speed*n}function D(e,t=null){if(!e.route?.points?.length)return null;let n=t??p(e,e.route.points).s,r=e.route.crossings.find(e=>Math.cos(e.exit-e.approach)<-.99&&e.stopS-.5+Math.PI*3>n);if(!r)return null;let i=Math.max(0,r.stopS-.5-n);return{distance_m:i,speed_limit_mps:Math.sqrt(9+10*Math.max(0,i-1.5))}}function O(e,t,n){if(n<=0||!Number.isFinite(t?.lane_offset_m))return n;let r=Math.min(n,k(e),D(e)?.speed_limit_mps??1/0);if(t.stop_at_line){let n=t.stop_at_line,i=Math.max(0,y(e,n)-n.clearance_m),a=Math.min(Math.sqrt(2*n.deceleration_mps2*i),i*2.5);r=Math.min(r,a<.05?0:a)}return r}function ee(e,t=null){let n=e.route?.sections;if(!n?.length)return null;let r=t??p(e,e.route.points).s;return n.find(e=>e.endS>r)??n.at(-1)}function k(e,t=null){if(!e.route?.sections?.length)return 1/0;let n=t??p(e,e.route.points).s,r=ee(e,n),a=r.speedLimit;if(r.kind===`onramp`){let e=i((n-r.startS)/(r.endS-r.startS),0,1),t=Math.min(18,a);a=t+(a-t)*e}for(let t of e.route.sections)t.startS<=n||t.speedLimit>=a||(a=Math.min(a,Math.sqrt(t.speedLimit**2+8*Math.max(0,t.startS-n-3))));return a}function A(e,t){if(!Number.isFinite(t?.lane_offset_m)||!e.route?.points?.length)return t?.steering??e.steering??0;let n=p(e,e.route.points),r=D(e,n.s),i=r?Math.min(t.lookahead_m,Math.max(2.6,r.distance_m)):t.lookahead_m,a=m(e.route.points,n.s+i),o=u(a,(a.heading??n.heading)+Math.PI/2,t.lane_offset_m);return C(2*Math.sin(c(l(e,o)-e.heading))/Math.max(2,s(e,o)),e.speed)}function te(e,t,n,r=null,i=null){let a={...e},o=[{...a}],s;for(let e=0;e<60;e++)w(a,r?A(a,r):t,Math.min(O(a,r,n),i?i(a,e*3/60):1/0),3/60),o.push({x:a.x,z:a.z,heading:a.heading,speed:a.speed}),e===23&&(s={...a});return{axis:t,velocity:n,points:o,evaluation:s,endHeading:a.heading}}function j(e,t,n=0){if(!e||!t||n>1800||!Object.hasOwn(t,e.choice))return null;let r=Object.keys(t),i=e.probabilities;return!i||r.some(e=>!Number.isFinite(i[e])||i[e]<0||i[e]>1)?null:Object.fromEntries(r.map(t=>[t,{probability:i[t],selected:t===e.choice}]))}function ne(e){if(!e)return`Planning`;if(!e.velocity_mps)return`Brake`;if(e.stop_at_line)return`Approach stop line`;let t=e.steering<-.025?`Left`:e.steering>.025?`Right`:`Straight`;return`${e.velocity_mps<0?`Reverse · `:``}${t}`}function re(e){let t=Object.entries(e.vectors);if(e.recovery?.blocked||e.speed_ceiling_mps===0)return[];let n=t.filter(([,e])=>e.velocity_mps!==0&&!(e.collision_imminent??e.collision_predicted)),r=!e.recovery?.active&&[`onramp`,`merge`,`interstate`,`exit`,`offramp`].includes(e.trip?.phase),i=e.recovery?.active?n:n.filter(([,e])=>e.stays_on_road&&(!r||e.follows_route_direction)),a=e.traffic?.queue&&!e.recovery?.active?i.filter(([,e])=>e.queue_compatible):i,o=a.filter(([,e])=>e.stays_in_lane),s=a.filter(([,e])=>e.returning_to_lane);return e.recovery?.active?a:o.length?o:s.length?s:r?[]:a}function ie(e,t=re(e)){let n=[],r=e.scene?.blocking_object;r&&Number.isFinite(r.gap_m)&&r.gap_m<=2.5&&n.push(`blocking_object_within_2_5m`);let i=e.scene?.intersection;return i&&!i.already_entered&&Number.isFinite(i.stop_line_ahead_m)&&i.stop_line_ahead_m>=-.5&&i.stop_line_ahead_m<=2.5&&(i.control===`stop`&&!i.stop_completed||i.control===`signal`&&[`red`,`amber`].includes(i.signal))&&n.push(`required_stop_line_within_2_5m`),Number.isFinite(e.destination_m)&&e.destination_m<=2.5&&n.push(`destination_reached`),t.length||n.push(`no_eligible_moving_path`),{available:n.length>0,proximity_m:v,reasons:n}}function ae(e){let t=re(e),n=ie(e,t).available?Object.entries(e.vectors).filter(([,e])=>e.velocity_mps===0).slice(-1):[];return Object.fromEntries([...t,...n])}function oe(e){let t=ae(e),n=Object.fromEntries(Object.entries(t).filter(([,e])=>e.velocity_mps!==0)),r=Object.keys(t).find(e=>t[e].velocity_mps===0);return{candidates:t,moving:n,stopId:r,motion:{...Object.keys(n).length?{drive:null}:{},...r?{stop:null}:{}}}}function se(e,t){let{candidates:n,moving:r,stopId:i,motion:a}=oe(e);if(!j(t?.motion,a)||Object.keys(r).length&&!j(t?.vector,r))return null;let o=t.motion.probabilities.drive??0;return{choice:t.motion.choice===`drive`?t.vector.choice:i,probabilities:Object.fromEntries(Object.keys(n).map(e=>[e,e===i?t.motion.probabilities.stop:o*t.vector.probabilities[e]])),confidence:t.motion.probabilities[t.motion.choice],probability_basis:`Motion probability × conditional path probability; stop uses motion probability directly`}}function ce(e,t){if(!e?.vectors)return null;let n=se(e,t?.answers),r=e.vectors[n?.choice];return t?.batch_id!==e?.batch_id||!r||t.selection?.choice!==n.choice||t.selection?.confidence!==n.confidence||Object.entries(n.probabilities).some(([e,n])=>t.selection?.probabilities?.[e]!==n)||t.controls?.steering!==r.steering||t.controls?.velocity!==r.velocity_mps?null:t.controls}var M=e=>Number.isFinite(e)?Math.round(e*10)/10:null,le=e=>e?e.map(M):[null,null];function ue(e,t){e=typeof e==`string`?e.split(`,`):e;let n=Object.values(t);if(n.length<3)return{columns:e,rows:t};let r={},i=[];if(e.forEach((e,t)=>{let a=n[0][t]??null;n.every(e=>Object.is(e[t]??null,a))?r[e]=a:i.push(t)}),!Object.keys(r).length)return{columns:e,rows:t};let a=e=>i.map(t=>e[t]??null);return{shared:r,columns:i.map(t=>e[t]),rows:Array.isArray(t)?t.map(a):Object.fromEntries(Object.entries(t).map(([e,t])=>[e,a(t)]))}}function de(e){let t=e.map(e=>[M(e.route_ahead_m),...le(e.center),...le(e.road_left),...le(e.road_right)]),n=new Set([0,t.length-1]),r=t.length>2?[[0,t.length-1]]:[];for(;r.length;){let[e,i]=r.pop(),a=.1,o=-1;for(let n=e+1;n<i;n++){let r=(t[n][0]-t[e][0])/(t[i][0]-t[e][0]);for(let s=1;s<7;s++){let c=[t[e][s],t[n][s],t[i][s]],l=c.every(e=>e===null)?0:c.some(e=>e===null)?1/0:Math.abs(t[n][s]-(t[e][s]+(t[i][s]-t[e][s])*r));l>a&&(a=l,o=n)}}o!==-1&&(n.add(o),r.push([e,o],[o,i]))}return t.filter((e,t)=>n.has(t))}var fe=e=>{let t=Object.keys(e);return t.length===1?{type:`choice`,choice:t[0],probabilities:{[t[0]]:1}}:null};function pe(e){let{moving:t,motion:n}=oe(e),r=Object.fromEntries(Object.keys(t).map((e,t)=>[`v${t}`,e])),i=Object.fromEntries(Object.entries(r).map(([e,n])=>[e,t[n]])),a=e.scene?.intersection,o=e.recovery?.active,s=e.scene?.nearby||[],c=e.traffic?.rear_pressure,l=e.traffic?.queue||e.scene?.following,u=e.scene?.hazard,d=s.length||c||l||u||e.scene?.blocking_object,f=!!e.speed_constraints?.required_stop_approach||a&&!a.already_entered&&(a.control===`stop`&&!a.stop_completed||a.control===`signal`&&[`red`,`amber`].includes(a.signal)),p={driving_style:[`Aggressive right-lane driver: favor fast useful progress. Stop only for imminent collision, a required line, or arrival.`,d?`Follow queues without passing; close to 2m before stopping. Rear/oncoming/adjacent traffic alone is no reason to brake.`:``,a?`Approach the line; stop 0.5m before it. Green or completed stop: proceed when your path is clear.`:``].filter(Boolean).join(` `),units:`m,s,m/s,deg; points=[right,ahead], negative ahead=behind. Table shared values apply to every row.`+(s.length?` Traffic heading:0=same direction,180=oncoming.`:``),speed:M(e.speed_mps),limit:M(e.limit_mps),nav:{turn:e.turn.direction,in_m:M(e.turn.in_m),remaining_m:M(e.destination_m),...e.trip?{phase:e.trip.phase}:{}},road:{on_road:e.road.on_road,lane_offset:M(e.lane.offset_m),lane_half_width:M(e.lane.half_width_m),body_width_length:e.road.ego_footprint?.length?[0,1].map(t=>{let n=e.road.ego_footprint.map(e=>e[t]);return M(Math.max(...n)-Math.min(...n))}):void 0,boundaries:ue(`route_ahead,center_right,center_ahead,left_right,left_ahead,right_right,right_ahead`,de(e.road.boundary_samples||[])),body_edge_clearance_rear_center_front:(e.road.edge_clearance_samples||[]).map(e=>[M(e.left_clearance_m),M(e.right_clearance_m)])}},m=e.global;if(m?.position&&m?.destination){let e=m.position.heading_deg*Math.PI/180,t=m.destination.x-m.position.x,n=m.destination.z-m.position.z;p.nav.destination=[M(t*Math.cos(e)+n*Math.sin(e)),M(t*Math.sin(e)-n*Math.cos(e))]}if(a){let e=a.stop_memory;p.intersection={control:a.control,signal:a.signal,bumper_to_line:M(a.stop_line_ahead_m),entered:a.already_entered,stop_completed:a.stop_completed,...a.earlier_arrivals?.length?{earlier_arrivals:a.earlier_arrivals.length}:{},...e?{stops:e.stops_on_this_approach,dwell:e.current_stop_duration_s,...e.last_stop?{last_stop:{age:e.last_stop.age_s,duration:e.last_stop.duration_s,bumper_to_line:e.last_stop.stop_line_ahead_m}}:{}}:{}}}e.traffic?.stopped_for_s>0&&(p.stopped_for=M(e.traffic.stopped_for_s)),e.traffic?.deadlock_release&&(p.deadlock_release=!0),c&&(p.rear_follower={id:c.vehicle_id,gap:c.gap_m,closing_speed:c.closing_speed_mps}),l&&(p.following={id:l.lead_id??l.id,gap:l.gap_m,target_gap:l.target_gap_m??l.minimum_gap_m,...e.traffic?.queue?{queue:!0}:{}}),e.scene?.blocking_object&&(p.blocker=e.scene.blocking_object),u&&(p.current_path_hazard={id:u.id,in_s:u.in_s,point:[u.right_m,u.ahead_m],braking_helps:u.braking_reduces_risk}),s.length&&(p.traffic=ue(`id,type,right,ahead,speed,heading,relative_forward_speed`,s.map(e=>[e.id,e.type,M(e.right_m),M(e.ahead_m),M(e.speed_mps),M(e.heading_relative_deg),M(e.relative_velocity_ahead_mps)]))),o&&(p.recovery={blocked:e.recovery.blocked,road_distance:e.road.distance_to_road_m,target:e.recovery.target});let h=[`speed`,`end_speed`,`progress`,`route_error`,`lane_error`,`heading_error`,`end_right`,`end_ahead`];f&&h.push(`line_after`,`crosses_line`,`stop_at_line`);let g=Object.values(i).some(e=>!e.stays_on_road),_=Object.values(i).some(e=>!e.stays_in_lane);g&&h.push(`on_road`,`max_offroad_fraction`),_&&h.push(`in_lane`,`returning_to_lane`),o&&h.push(`recovery_distance`,`road_distance_after`,`on_road_after`);let v=Object.fromEntries(Object.entries(i).map(([e,t])=>{let n=[t.velocity_mps,t.end_speed_mps,t.route_progress_m,t.route_error_m,t.lane_error_m,t.heading_error_deg].map(M);return n.push(...le(t.end_position?[t.end_position.right_m,t.end_position.ahead_m]:null)),f&&n.push(M(t.stop_line_after_m),t.crosses_stop_line,!!t.stop_at_line),g&&n.push(t.stays_on_road,t.max_offroad_fraction),_&&n.push(t.stays_in_lane,t.returning_to_lane),o&&n.push(M(t.recovery_distance_m),M(t.road_distance_after_m),t.on_road_after),[e,n]}));if(Object.keys(v).length){p.candidates={horizon_s:3,...g?{}:{all_on_road:!0},..._?{}:{all_in_lane:!0},...ue(h,v)};let e=Object.fromEntries(Object.entries(i).filter(([,e])=>e.collision_predicted).map(([e,t])=>[e,{object:t.collision_object_id,in_s:t.collision_in_s}]));Object.keys(e).length&&(p.candidates.conflicts=e)}let y={},b={},x=(e,t,n)=>{let r=fe(t);r?b[e]=r:Object.keys(t).length&&(y[e]={type:`choice`,instructions:n,criteria:t})};return x(`motion`,n,`Drive includes slowing or approaching a stop line; stop means zero target speed NOW. Prefer drive when useful progress is possible. Use current conflicts, legal requirements and stop memory; proximity alone is not a reason to stop.`),y.motion&&(p.stop_reasons=e.stop_availability?.reasons),x(`vector`,Object.fromEntries(Object.keys(i).map(e=>[e,null])),[`Assuming drive, choose fastest useful progress with low route/lane error. Predictions include following and curve/section speed control. Keep the whole car on asphalt: negative clearance=off-road, null edges=unknown, preview end is not road end.`,f?`Choose stop_at_line to approach then stop 0.5m before the line. Do not pick a faster crossing path.`:a?`Green or completed stop: continue through the line.`:``,p.candidates?.conflicts||u?`Conflicts are future predicted contacts; compare timing and paths. A current-path hazard may not affect another candidate.`:``,o?`Recover toward target, reducing recovery_distance and road_distance_after, then align with route; clear reverse is allowed.`:``,[`onramp`,`merge`,`interstate`].includes(e.trip?.phase)?`Accelerate on the ramp, match a merge gap, then cruise. Section boundaries are continuous road, not a stop or U-turn.`:``].filter(Boolean).join(` `)),m?.routes&&Object.keys(m.routes).length>1&&(p.navigation_choices={position:m.position,destination:m.destination,routes:m.routes,junctions:ue(`id,x,z,control`,m.junctions.map(e=>[e.id,M(e.x),M(e.z),e.control])),roads:ue(`from,to,width,one_way,limit,kind`,m.roads),...m.stopped_traffic.length?{stopped_traffic:m.stopped_traffic}:{}},x(`route`,Object.fromEntries(Object.keys(m.routes).map(e=>[e,null])),`Choose a route to destination. Keep the route when on or near it. Alternatives address a sustained departure: consider join distance, direction and blocked junctions; avoid repeated reversals. World coordinates x=east,z=south,heading 0=north.`)),{request:{model:`jev-latest`,state:p,questions:y},fixed:b,aliases:r}}function me(e,t={}){let n={...t,...e.fixed};if(n.vector){let t=n.vector;n.vector={...t,choice:e.aliases[t.choice],probabilities:Object.fromEntries(Object.entries(t.probabilities||{}).map(([t,n])=>[e.aliases[t]??t,n]))}}return n}function he(e){let t=Math.max(18,Math.abs(e.speed_mps)*3);return e.recovery.active||e.bend_deg>12||[`merge`,`ramp_turn`].includes(e.trip?.phase)||e.scene?.hazard||e.scene?.intersection&&e.scene.intersection.stop_line_ahead_m<t||e.scene?.following&&e.scene.following.gap_m<t||e.scene?.nearby?.some(e=>Math.abs(e.right_m)<8&&Math.abs(e.ahead_m)<t)?250:650}var ge=`https://simple-jev-demo-api.featherless.ai/v1`,_e=[{id:`featherless-ai/Qwen3.6-35B-A3B-classifier`,label:`Qwen3.6 35B A3B · MoE`,rate:.28},{id:`featherless-ai/gemma-4-26B-A4B-classifier`,label:`Gemma 4 26B A4B · MoE`,rate:.28},{id:`featherless-ai/Qwen3.8-27B-classifier`,label:`Qwen3.8 27B`,rate:.3},{id:`featherless-ai/RWKV-small-classifier`,label:`RWKV Small`,rate:.03},{id:`featherless-ai/RWKV-mid-classifier`,label:`RWKV Mid`,rate:.1},{id:`featherless-ai/RWKV-std-classifier`,label:`RWKV Standard`,rate:.2}],ve=_e[0].id;function ye(e){if(!_e.some(t=>t.id===e))throw Error(`Unknown driving model`);ve=e}function N(e=ve){return{input_per_million:_e.find(t=>t.id===e).rate,output_per_million:0,source:`Featherless developer-plan beta pricing; subject to change. See https://featherless.ai`}}var be=0,P=e=>Number.isFinite(e)?Math.round(e*10)/10:null;function xe(e,t=ve){let n=pe(e),r=[`speed`,`steer`,`route_error`,`offroad_fraction`,`collision`,`stop_at_line`];return n.request.model=t,n.request.state={speed_mps:P(e.speed_mps),speed_ceiling_mps:P(e.speed_ceiling_mps),on_road:e.road?.on_road,recovery:!!e.recovery?.active,stop_reasons:e.stop_availability?.reasons,intersection:e.scene?.intersection?{control:e.scene.intersection.control,distance_to_line_m:P(e.scene.intersection.stop_line_ahead_m),signal:e.scene.intersection.signal,stop_completed:e.scene.intersection.stop_completed,already_entered:e.scene.intersection.already_entered}:null,columns:r,candidates:Object.fromEntries(Object.entries(n.aliases).map(([t,n])=>{let r=e.vectors[n];return[t,[P(r.velocity_mps),P(r.steering),P(r.route_error_m),P(r.offroad_fraction),!!r.collision_predicted,!!r.stop_at_line]]}))},delete n.request.questions.route,delete n.fixed.route,n.request.questions.vector&&(n.request.questions.vector.instructions=`Choose a safe driving path. Avoid collisions and offroad paths; leave a generous gap behind traffic. Minimize route error, then prefer useful speed. When a stop is required, choose a stop_at_line approach. Recovery may use reverse.`),n}async function F(e,t){let n=ve,r=N(n),i=performance.now(),a=xe(e,n),o={answers:{},usage:{input_tokens:0,output_tokens:0}},s=Object.keys(a.request.questions).length>0;if(s){await new Promise(e=>setTimeout(e,Math.max(0,be-Date.now()))),t?.throwIfAborted(),be=Date.now()+300;let e=await fetch(`${ge}/classifier`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(a.request),signal:t,credentials:`omit`,redirect:`error`});if(o=await e.json(),!e.ok)throw e.status===429&&(be=Date.now()+Math.max(3e3,(Number(e.headers.get(`Retry-After`))||0)*1e3)),Error(o.error?.message||(typeof o.detail==`string`?o.detail:`Classifier HTTP ${e.status}`))}let c=me(a,o.answers),l=se(e,c);if(!l||!e.vectors[l.choice])throw Error(`Classifier returned an invalid driving choice.`);let u=e.vectors[l.choice];if((u.collision_imminent??u.collision_predicted)&&u.velocity_mps!==0)throw Error(`Selected path risks collision. Holding the car before retry.`);return{model:n,decision_source:s?`jev`:`only_eligible_action`,request_bytes:new TextEncoder().encode(JSON.stringify(a.request)).length,candidate_ids:a.aliases,resolved_single_choices:Object.keys(a.fixed),answers:c,selection:l,batch_id:e.batch_id,controls:{steering:u.steering,velocity:u.velocity_mps},usage:o.usage||{input_tokens:0,output_tokens:0},latency_ms:Math.round(performance.now()-i),cost_usd:(o.usage?.input_tokens??0)*r.input_per_million/1e6,pricing:r}}async function Se(e,t={}){if(e===`/api/status`)return Response.json({auth_required:!1,authenticated:!1,configured:!0,pricing:N()});try{return Response.json(await F(JSON.parse(t.body).state,t.signal))}catch(e){return Response.json({error:e.message},{status:502})}}var I={xmlns:`http://www.w3.org/2000/svg`,width:24,height:24,viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,"stroke-width":2,"stroke-linecap":`round`,"stroke-linejoin":`round`},Ce=([e,t,n])=>{let r=document.createElementNS(`http://www.w3.org/2000/svg`,e);return Object.keys(t).forEach(e=>{r.setAttribute(e,String(t[e]))}),n?.length&&n.forEach(e=>{let t=Ce(e);r.appendChild(t)}),r},we=(e,t={})=>Ce([`svg`,{...I,...t},e]),Te=e=>{for(let t in e)if(t.startsWith(`aria-`)||t===`role`||t===`title`)return!0;return!1},Ee=(...e)=>e.filter((e,t,n)=>!!e&&e.trim()!==``&&n.indexOf(e)===t).join(` `).trim(),De=e=>e.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,t,n)=>n?n.toUpperCase():t.toLowerCase()),Oe=e=>{let t=De(e);return t.charAt(0).toUpperCase()+t.slice(1)},ke=e=>Array.from(e.attributes).reduce((e,t)=>(e[t.name]=t.value,e),{}),Ae=e=>typeof e==`string`?e:!e||!e.class?``:e.class&&typeof e.class==`string`?e.class.split(` `):e.class&&Array.isArray(e.class)?e.class:``,je=(e,{nameAttr:t,icons:n,attrs:r})=>{let i=e.getAttribute(t);if(i==null)return;let a=n[Oe(i)];if(!a)return console.warn(`${e.outerHTML} icon name was not found in the provided icons object.`);let o=ke(e),s=Te(o)?{}:{"aria-hidden":`true`},c={...I,"data-lucide":i,...s,...r,...o},l=Ae(o),u=Ae(r),d=Ee(`lucide`,`lucide-${i}`,...l,...u);d&&Object.assign(c,{class:d});let f=we(a,c);return e.parentNode?.replaceChild(f,e)},Me=[[`path`,{d:`M7 7h10v10`}],[`path`,{d:`M7 17 17 7`}]],Ne=[[`path`,{d:`m5 12 7-7 7 7`}],[`path`,{d:`M12 19V5`}]],Pe=[[`path`,{d:`M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1`}],[`path`,{d:`M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1`}]],Fe=[[`circle`,{cx:`12`,cy:`12`,r:`10`}],[`path`,{d:`M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3`}],[`path`,{d:`M12 17h.01`}]],Ie=[[`rect`,{width:`14`,height:`14`,x:`8`,y:`8`,rx:`2`,ry:`2`}],[`path`,{d:`M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2`}]],Le=[[`path`,{d:`M20 20v-7a4 4 0 0 0-4-4H4`}],[`path`,{d:`M9 14 4 9l5-5`}]],Re=[[`path`,{d:`m15 14 5-5-5-5`}],[`path`,{d:`M4 20v-7a4 4 0 0 1 4-4h12`}]],ze=[[`path`,{d:`M12 15V3`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`}],[`path`,{d:`m7 10 5 5 5-5`}]],Be=[[`path`,{d:`M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528`}]],Ve=[[`path`,{d:`M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4`}],[`path`,{d:`M9 18c-4.51 2-5-2-7-2`}]],He=[[`circle`,{cx:`12`,cy:`5`,r:`1`}],[`circle`,{cx:`19`,cy:`5`,r:`1`}],[`circle`,{cx:`5`,cy:`5`,r:`1`}],[`circle`,{cx:`12`,cy:`12`,r:`1`}],[`circle`,{cx:`19`,cy:`12`,r:`1`}],[`circle`,{cx:`5`,cy:`12`,r:`1`}],[`circle`,{cx:`12`,cy:`19`,r:`1`}],[`circle`,{cx:`19`,cy:`19`,r:`1`}],[`circle`,{cx:`5`,cy:`19`,r:`1`}]],Ue=[[`path`,{d:`m16 17 5-5-5-5`}],[`path`,{d:`M21 12H9`}],[`path`,{d:`M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4`}]],We=[[`path`,{d:`M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z`}],[`path`,{d:`M15 5.764v15`}],[`path`,{d:`M9 3.236v15`}]],Ge=[[`path`,{d:`M8 3H5a2 2 0 0 0-2 2v3`}],[`path`,{d:`M21 8V5a2 2 0 0 0-2-2h-3`}],[`path`,{d:`M3 16v3a2 2 0 0 0 2 2h3`}],[`path`,{d:`M16 21h3a2 2 0 0 0 2-2v-3`}]],Ke=[[`path`,{d:`M8 3v3a2 2 0 0 1-2 2H3`}],[`path`,{d:`M21 8h-3a2 2 0 0 1-2-2V3`}],[`path`,{d:`M3 16h3a2 2 0 0 1 2 2v3`}],[`path`,{d:`M16 21v-3a2 2 0 0 1 2-2h3`}]],qe=[[`path`,{d:`M5 12h14`}]],Je=[[`rect`,{x:`14`,y:`3`,width:`5`,height:`18`,rx:`1`}],[`rect`,{x:`5`,y:`3`,width:`5`,height:`18`,rx:`1`}]],Ye=[[`path`,{d:`M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z`}]],Xe=[[`path`,{d:`M5 12h14`}],[`path`,{d:`M12 5v14`}]],Ze=[[`path`,{d:`M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8`}],[`path`,{d:`M3 3v5h5`}]],Qe=[[`path`,{d:`M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8`}],[`path`,{d:`M21 3v5h-5`}]],$e=[[`path`,{d:`M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z`}],[`path`,{d:`M20 2v4`}],[`path`,{d:`M22 4h-4`}],[`circle`,{cx:`4`,cy:`20`,r:`2`}]],et=[[`path`,{d:`m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5`}],[`rect`,{x:`2`,y:`6`,width:`14`,height:`12`,rx:`2`}]],tt=[[`path`,{d:`M18 6 6 18`}],[`path`,{d:`m6 6 12 12`}]],nt=({icons:e={},nameAttr:t=`data-lucide`,attrs:n={},root:r=document,inTemplates:i}={})=>{if(!Object.values(e).length)throw Error(`Please provide an icons object.
If you want to use all the icons you can import it like:
 \`import { createIcons, icons } from 'lucide';
lucide.createIcons({icons});\``);if(r===void 0)throw Error("`createIcons()` only works in a browser environment.");if(Array.from(r.querySelectorAll(`[${t}]`)).forEach(r=>je(r,{nameAttr:t,icons:e,attrs:n})),i&&Array.from(r.querySelectorAll(`template`)).forEach(r=>nt({icons:e,nameAttr:t,attrs:n,root:r.content,inTemplates:i})),t===`data-lucide`){let t=r.querySelectorAll(`[icon-name]`);t.length>0&&(console.warn(`[Lucide] Some icons were found with the now deprecated icon-name attribute. These will still be replaced for backwards compatibility, but will no longer be supported in v1.0 and you should switch to data-lucide`),Array.from(t).forEach(t=>je(t,{nameAttr:`icon-name`,icons:e,attrs:n})))}};function rt(e){let t=[];for(let n=0;n<e.length-1;n++){let r=e[Math.max(0,n-1)],i=e[n],a=e[n+1],o=e[Math.min(e.length-1,n+2)];for(let e=0;e<40;e++){let n=e/40,s={};for(let e of[`x`,`z`])s[e]=.5*(2*i[e]+(-r[e]+a[e])*n+(2*r[e]-5*i[e]+4*a[e]-o[e])*n*n+(-r[e]+3*i[e]-3*a[e]+o[e])*n*n*n);t.push(s)}}return t.push(e.at(-1)),h(t,2)}function it(e,t){return e.map((n,r)=>u(n,l(e[Math.max(0,r-1)],e[Math.min(e.length-1,r+1)])+Math.PI/2,t))}function at(e,t,n,r){return h(Array.from({length:81},(i,a)=>{let o=a/80,s=1-o;return{x:s**3*e.x+3*s**2*o*t.x+3*s*o**2*n.x+o**3*r.x,z:s**3*e.z+3*s**2*o*t.z+3*s*o**2*n.z+o**3*r.z}}),1.5)}function ot(e,t,n=9){let r=[],i=[],a=[],o=e=>{for(let t of e){let e=r.at(-1);e&&s(e,t)<.001||r.push({x:t.x,z:t.z,s:e?e.s+s(e,t):0})}};for(let s=0;s<t.length-1;s++){let c=t[s],d=t[s+1],f=e.edges.find(e=>e.a===c&&e.b===d||!e.oneWay&&e.b===c&&e.a===d);if(!f)throw Error(`No drivable connection from ${c} to ${d}`);let g;if(f.path)g=f.a===c?f.path:h(it([...f.centerline].reverse(),f.laneOffset),1.5);else{let t=p(e.byId[c],e.roadSamples).s,r=p(e.byId[d],e.roadSamples).s,i=Math.min(t,r),a=Math.max(t,r),o=[m(e.roadSamples,i),...e.roadSamples.filter(e=>e.s>i&&e.s<a),m(e.roadSamples,a)];r<t&&o.reverse(),g=it(o,n)}let _=e.byId[c],v=null;if(s>0&&(_.townJunction||f.kind===`local`&&i.at(-1)?.kind===`local`)){let e=l(r.at(-2),r.at(-1)),t=l(g[0],g[1]);if(_.townJunction&&a.push({nodeId:c,x:_.x,z:_.z,approach:e,exit:t}),Math.abs(Math.sin(t-e))>.1){let n=Math.sin(t-e)>0,a=n?11:14,s=m(r,r.at(-1).s-a),c=m(g,a);for(;r.at(-1).s>s.s;)r.pop();o([s]),i.at(-1).endS=r.at(-1).s;let l=Math.abs(Math.sin(e))>.5?{x:c.x,z:s.z}:{x:s.x,z:c.z};v=at(s,n?{x:(s.x+2*l.x)/3,z:(s.z+2*l.z)/3}:u(s,e,9),n?{x:(c.x+2*l.x)/3,z:(c.z+2*l.z)/3}:u(c,t,-9),c),g=g.filter(e=>e.s>a)}}let y=r.at(-1)?.s??0;v&&o(v),o(g);let b=i.at(-1);b?.kind===f.kind&&b.speedLimit===f.speedLimit?b.endS=r.at(-1).s:i.push({kind:f.kind,name:f.name,startS:y,endS:r.at(-1).s,speedLimit:f.speedLimit,laneHalfWidth:f.kind===`interstate`?2.25:3})}for(let e of a)e.stopS=p(u(u(e,e.approach,-10.5),e.approach+Math.PI/2,3),r).s;return{ids:t,points:r,sections:i,crossings:a,length:r.at(-1).s}}function st(e,t){let n=d(e),r=[],i=[],a=[],o=n()*2;for(let e=0;e<9;e++)r.push({id:`h${e}`,x:Math.sin(e*.65+o)*48,z:680-e*170,control:`none`,offset:0,neighbors:[]});let c=rt(r);for(let e=0;e<r.length-1;e++){let t=r[e],n=r[e+1];t.neighbors.push(n.id),n.neighbors.push(t.id),i.push({id:`interstate-${e}`,a:t.id,b:n.id,width:25,length:s(t,n),speedLimit:28,kind:`interstate`,name:`Interstate 08`})}let g=Object.fromEntries(r.map(e=>[e.id,e])),_=e=>p(g[e],c).s,v=(e,t)=>{let n=m(c,e);return u(n,n.heading+Math.PI/2,t)},y=Math.max(g.h0.x,g.h1.x,g.h2.x)+145,b=Math.max(g.h6.x,g.h7.x,g.h8.x)+155,x=(e,t)=>{let n={id:e,x:t.x,z:t.z,control:`none`,offset:0,neighbors:[]};return r.push(n),g[e]=n,n},S=x(`local-start`,{x:y,z:660}),C=x(`mill-market`,{x:y,z:600}),w=x(`mill-interchange`,{x:y,z:520}),T=x(`onramp`,{x:y-38,z:520}),E=x(`mill-north`,{x:y,z:450}),D=x(`mill-south`,{x:y,z:710}),O=x(`oak-south`,{x:y+80,z:710}),ee=x(`oak-market`,{x:y+80,z:600}),k=x(`oak-interchange`,{x:y+80,z:520}),A=x(`oak-north`,{x:y+80,z:450}),te=x(`market-west`,{x:y-65,z:600}),j=x(`market-east`,{x:y+116,z:600});for(let e of[C,w,ee,k])e.townJunction=!0,e.control=`stop`;let ne=_(`h2`),re=_(`h3`),ie=x(`merge-lane`,v(ne,15)),ae=_(`h6`),oe=ae+80,se=x(`exit-cedar`,v(oe,17)),ce=x(`cedar-town`,{x:b,z:-580}),M=x(`cedar-stop`,{x:b,z:-755}),le=[],ue=(e,t,n,r,a,o,s,c=0,d=0,f=!1)=>{let p=h(n,1.5),g=h(it(p,c),1.5);if(d){let e=g.at(-1).s-d,t=m(g,e);for(;g.at(-1).s>e;)g.pop();g.push(t)}e.neighbors.push(t.id),f&&t.neighbors.push(e.id),i.push({id:`${e.id}-${t.id}`,a:e.id,b:t.id,oneWay:!f,width:r,speedLimit:a,kind:o,name:s,length:g.at(-1).s,path:g,...f?{centerline:p,laneOffset:c}:{}}),le.push({id:`${e.id}-${t.id}`,points:h([u(p[0],l(p[0],p[1]),-.25),...p,u(p.at(-1),l(p.at(-2),p.at(-1)),.25)],1.5),width:r,kind:o,twoWay:c!==0})},de=(e,t,n)=>ue(e,t,[e,t],12,10,`local`,n,3,0,!0);for(let[e,t]of[[D,S],[S,C],[C,w],[w,E]])de(e,t,`Millbrook · Main Street`);for(let[e,t]of[[O,ee],[ee,k],[k,A]])de(e,t,`Millbrook · Oak Street`);de(te,C,`Millbrook · Market Street`),de(C,ee,`Millbrook · Market Street`),de(ee,j,`Millbrook · Market Street`),de(w,k,`Millbrook · Depot Street`),de(E,A,`Millbrook · North Street`),de(D,O,`Millbrook · South Street`),ue(w,T,[w,T],8,8,`ramp_turn`,`Interstate 08 North entrance`);let fe=m(c,ne).heading;ue(T,ie,at(T,u(T,-Math.PI/2,65),u(ie,fe,-85),ie),6,26,`onramp`,`Interstate 08 on-ramp`);let pe=Array.from({length:101},(e,t)=>{let n=t/100,r=n*n*(3-2*n);return v(ne+(re-ne)*n,15-6*r)});ue(ie,g.h3,pe,6,26,`merge`,`Merge onto Interstate 08`);let me=Array.from({length:61},(e,t)=>{let n=t/60,r=n*n*(3-2*n);return v(ae+(oe-ae)*n,9+8*r)});ue(g.h6,se,me,6,22,`exit`,`Cedar Town exit`);let he={x:ce.x+3,z:ce.z},ge=m(c,oe).heading;ue(se,ce,at(se,u(se,ge,80),u(he,0,-80),he),6,16,`offramp`,`Cedar Town off-ramp`),ue(ce,M,[ce,M],12,10,`town`,`Cedar Town · Station Street`,3,15);for(let e of[-620,-695])le.push({id:`cedar-cross-${e}`,kind:`town`,twoWay:!0,width:12,points:h([{x:b-55,z:e},{x:b+80,z:e}],2)});for(let[e,t,r]of[[b-22,-594,`shop`],[b+24,-594,`shop`],[b-22,-649,`cottage`],[b+24,-649,`townhouse`],[b-23,-672,`modern`],[b+25,-672,`cottage`],[b-23,-724,`shop`],[b+25,-728,`townhouse`],[y-23,676,`cottage`],[y-23,635,`shop`],[y+23,676,`cottage`],[y+23,635,`shop`],[y+57,676,`townhouse`],[y+57,635,`cottage`],[y-23,574,`shop`],[y-23,547,`shop`],[y+23,574,`townhouse`],[y+23,547,`shop`],[y+57,574,`cottage`],[y+57,547,`modern`],[y+103,657,`cottage`],[y+103,557,`cottage`],[y-23,482,`cottage`],[y+23,482,`modern`],[y+57,482,`cottage`]])a.push({id:`building-${a.length}`,type:`building`,x:e,z:t,width:12,depth:14,height:r===`townhouse`?8:5,style:r,rotation:0,color:f(n,[`#eadbc9`,`#d4d9cb`,`#c6b4a2`,`#ddd4c0`])});for(let e of[-598,-645,-673,-723])a.push({id:`lamp-${e}`,type:`streetlight`,x:b+7.8,z:e,height:6});for(let e of[688,650,572,490])for(let t of[y-8,y+88])a.push({id:`millbrook-lamp-${a.length}`,type:`streetlight`,x:t,z:e,height:6});for(let e of r.filter(e=>e.townJunction))for(let t of e.neighbors){if(!i.some(n=>n.a===t&&n.b===e.id||!n.oneWay&&n.a===e.id&&n.b===t))continue;let n=l(g[t],e),r=u(u(e,n,-9),n+Math.PI/2,6.9);a.push({id:`millbrook-stop-${e.id}-${t}`,type:`stop_sign`,...r,nodeId:e.id,approach:n,height:2.8})}a.push({id:`millbrook-welcome`,type:`town_sign`,x:y+9,z:650,text:`MILLBROOK`,height:3},{id:`interstate-advance`,type:`interstate_guide`,x:y+11,z:619,approach:0,direction:`left`,text:`Cedar Town`,detail:`LEFT AFTER MARKET ST`},{id:`interstate-entrance`,type:`interstate_guide`,x:y+11,z:538,approach:0,direction:`left`,text:`North entrance`,detail:`INTERSTATE 08`},{id:`interstate-ramp`,type:`interstate_guide`,...u(T,-Math.PI/2,15),z:T.z-8,approach:-Math.PI/2,direction:`straight`,text:`Cedar Town`,detail:`ACCELERATE TO MERGE`});for(let e=0;e<210;e++){let t={x:(n()>.5?1:-1)*(65+n()*200),z:-760+n()*1480};le.some(e=>p(t,e.points).distance<e.width/2+8)||a.some(e=>e.type===`building`&&s(t,e)<18)||a.push({id:`tree-${e}`,type:`tree`,...t,height:5+n()*9,kind:n()>.25?`pine`:`round`})}for(let e=0;e<10;e++)a.push({id:`hill-${e}`,type:`hill`,x:(e%2?1:-1)*(270+n()*70),z:-700+n()*1400,height:20+n()*35,width:70+n()*60,depth:80});for(let e of[2,5])a.push({id:`overpass-${e}`,type:`overpass`,x:g[`h${e}`].x,z:g[`h${e}`].z-45,width:230,depth:13,height:9});for(let[e,t,n]of[[3,`straight`,`CONTINUE NORTH`],[5,`right`,`EXIT 6 · KEEP RIGHT`]])a.push({id:`highway-sign-${e}`,type:`highway_sign`,x:g[`h${e}`].x,z:g[`h${e}`].z+60,width:18,height:8,text:`Cedar Town`,direction:t,detail:n});a.push({id:`cedar-welcome`,type:`town_sign`,x:b+9,z:-588,text:`CEDAR TOWN`,height:3});let _e={seed:e,type:`highway`,theme:t,nodes:r,byId:g,edges:i,objects:a,roadSamples:c,connectorRoads:le,shoulderOpenings:[[ne-5,re+8],[ae-8,oe+15]],xs:[-350,350],zs:[-800,720],bounds:{minX:-370,maxX:370,minZ:-805,maxZ:740},startNode:S.id,nextNode:C.id,destination:M.id};return _e.route=ot(_e,[S.id,C.id,w.id,T.id,ie.id,`h3`,`h4`,`h5`,`h6`,se.id,ce.id,M.id]),_e.destinationStopLine={...u(_e.route.points.at(-1),0,1.4),heading:0},_e}var ct={city:{name:`Skyline City`,subtitle:`Long avenues. A higher horizon.`,size:5,traffic:28,buildings:.97,limit:18},town:{name:`Cedar Town`,subtitle:`Room between the crossroads.`,size:5,traffic:14,buildings:.62,limit:14},highway:{name:`Interstate 08`,subtitle:`On-ramp, open road, small-town arrival.`,size:8,traffic:18,buildings:0,limit:28,laneOffset:9}};function lt(e,t=`town`){if(t===`highway`)return st(e,ct.highway);let n=d(e),r=ct[t],i=r.size,a=[0],o=[0];for(let e=1;e<i;e++)a.push(a.at(-1)+(t===`city`?125:110)+Math.floor(n()*55)),o.push(o.at(-1)+(t===`city`?125:110)+Math.floor(n()*55));let c=a.at(-1)/2,p=o.at(-1)/2;a.forEach((e,t)=>a[t]=e-c),o.forEach((e,t)=>o[t]=e-p);let m=[],h=[],g=[];for(let e=0;e<i;e++)for(let t=0;t<i;t++)m.push({id:`j${e}-${t}`,i:t,j:e,x:a[t],z:o[e],control:(t+e)%3==0?`stop`:`signal`,offset:Math.floor(n()*14),neighbors:[]});let _=(e,t)=>{e.neighbors.push(t.id),t.neighbors.push(e.id),h.push({id:`road-${h.length}`,a:e.id,b:t.id,length:s(e,t),width:12,speedLimit:r.limit,name:f(n,[`Cedar`,`Maple`,`Willow`,`Juniper`,`Oak`,`Birch`,`Laurel`])+f(n,[` Street`,` Avenue`,` Way`])})};for(let e of m)e.i<i-1&&_(e,m[e.j*i+e.i+1]),e.j<i-1&&(e.i===2||e.i===1&&e.j===1||n()>.16)&&_(e,m[(e.j+1)*i+e.i]);let v=0,y=(e,t,n,r={})=>g.push({id:`${e}-${v++}`,type:e,x:t,z:n,...r});for(let e=0;e<i-1;e++)for(let s=0;s<i-1;s++){let i=(a[s]+a[s+1])/2,c=(o[e]+o[e+1])/2,l=a[s+1]-a[s],u=o[e+1]-o[e],d=n()>r.buildings;y(`parcel`,i,c,{width:l-17,depth:u-17,park:d});for(let e of[-1,1])for(let r of[-1,1]){let a=i+e*(l/2-17),o=c+r*(u/2-17);if(d)y(`tree`,a,o,{height:5+n()*4,kind:n()>.4?`round`:`pine`});else{let e=t===`city`?f(n,[`skyscraper`,`skyscraper`,`apartment`,`shop`]):f(n,[`cottage`,`cottage`,`modern`,`townhouse`]);y(`building`,a,o,{style:e,width:(t===`city`?16:10)+n()*2,depth:(t===`city`?16:10)+n()*2,height:e===`skyscraper`?34+n()*58:e===`apartment`?18+n()*12:e===`townhouse`?8:4+n()*2,color:f(n,[`#eadbc9`,`#e6ad91`,`#d9e2ce`,`#e5c977`,`#bdd3d0`,`#ebd9ad`]),roof:f(n,[`#697577`,`#a26f58`,`#536d65`]),rotation:r<0?Math.PI:0})}}if(!d)for(let e of[`x`,`z`]){let r=e===`x`?l:u;for(let a=-r/2+39;a<r/2-28;a+=24)for(let r of[-1,1]){let o=e===`x`?i+a:i+r*(l/2-17),s=e===`z`?c+a:c+r*(u/2-17),d=t===`city`?f(n,[`skyscraper`,`skyscraper`,`apartment`]):f(n,[`cottage`,`modern`]);y(`building`,o,s,{style:d,width:(t===`city`?16:10)+n()*2,depth:(t===`city`?16:10)+n()*2,height:d===`skyscraper`?32+n()*65:d===`apartment`?18+n()*12:5+n()*3,color:f(n,[`#eadbc9`,`#d9e2ce`,`#e6ad91`,`#bdd3d0`,`#ebd9ad`]),roof:f(n,[`#697577`,`#a26f58`,`#536d65`]),rotation:e===`x`?r<0?Math.PI:0:r<0?-Math.PI/2:Math.PI/2})}}for(let e=0;e<(d?22:12);e++)y(`tree`,i+(n()-.5)*(l-22),c+(n()-.5)*(u-22),{height:4+n()*5,kind:n()>.3?`round`:`pine`});d&&y(`bench`,i,c,{rotation:0})}for(let e=0;e<65;e++){let t=e%4;y(`tree`,t<2?t===0?a[0]-17:a.at(-1)+17:a[0]+n()*(a.at(-1)-a[0]),t>=2?t===2?o[0]-17:o.at(-1)+17:o[0]+n()*(o.at(-1)-o[0]),{height:5+n()*7,kind:f(n,[`round`,`pine`])})}let b=Object.fromEntries(m.map(e=>[e.id,e]));for(let e of m)for(let t of e.neighbors){let n=b[t],r=l(n,e),i=u(u(e,r,-9),r+Math.PI/2,6.9);y(e.control===`stop`?`stop_sign`:`traffic_light`,i.x,i.z,{nodeId:e.id,approach:r,height:e.control===`stop`?2.8:4.8})}let x=m[i+1],S=m[2*i+1],C=f(n,m.filter(e=>e.i>=i-2&&e.j>=1&&e.j<i-1)),w=[`#8aa4ac`,`#829eaa`,`#749699`,`#a4bab9`];g.filter(e=>e.style===`skyscraper`).forEach((e,t)=>e.color=w[t%w.length]);let T=g.filter(e=>e.type===`building`),E={seed:e,type:t,theme:r,nodes:m,byId:b,edges:h,objects:g.filter(e=>e.type!==`tree`||!T.some(t=>Math.abs(e.x-t.x)<t.width/2+1.8&&Math.abs(e.z-t.z)<t.depth/2+1.8)),xs:a,zs:o,bounds:{minX:a[0]-28,maxX:a.at(-1)+28,minZ:o[0]-28,maxZ:o.at(-1)+28},startNode:x.id,nextNode:S.id,destination:C.id};return E.route=dt(E,[x.id,...ut(E,S.id,C.id,x.id)]),E}function ut(e,t,n,r=null){let i={[t]:0},a={},o=new Set(e.nodes.map(e=>e.id));for(;o.size;){let c;for(let e of o)(c===void 0||(i[e]??1/0)<(i[c]??1/0))&&(c=e);if(c===n)break;o.delete(c);for(let n of e.byId[c].neighbors){if(c===t&&n===r)continue;let o=i[c]+s(e.byId[c],e.byId[n]);o<(i[n]??1/0)&&(i[n]=o,a[n]=c)}}let c=[n];for(;c[0]!==t;){if(!a[c[0]])throw Error(`Unreachable destination`);c.unshift(a[c[0]])}return c}function dt(e,t,n){if(e.type===`highway`)return ot(e,t,n);let r=[],i=[],a=t.map(t=>e.byId[t]),o=(e,t)=>u(e,t+Math.PI/2,3);for(let e=0;e<a.length;e++){let t=a[e],n=l(a[Math.max(0,e-1)],a[e===0?1:e]),s=e<a.length-1?l(t,a[e+1]):n;if(e===0){r.push(u(o(t,s),s,14));continue}if(e===a.length-1){r.push(u(o(t,n),n,-15));continue}let c=u(o(t,n),n,-11),d=u(o(t,s),s,11);if(r.push(c),Math.cos(s-n)<-.99){let e=u(t,n,-11);for(let t=1;t<=24;t++){let i=t/24*Math.PI;r.push(u(u(e,n,Math.sin(i)*3),n+Math.PI/2,Math.cos(i)*3))}}else if(Math.abs(Math.sin(s-n))<.1)r.push(d);else{let e=Math.abs(Math.sin(n))>.5?{x:d.x,z:c.z}:{x:c.x,z:d.z};for(let t=1;t<=16;t++){let n=t/16,i=1-n;r.push({x:i*i*c.x+2*i*n*e.x+n*n*d.x,z:i*i*c.z+2*i*n*e.z+n*n*d.z})}}i.push({nodeId:t.id,x:t.x,z:t.z,approach:n,exit:s})}let c=h(r);for(let e of i){let t=u(o(e,e.approach),e.approach,-10.5),n=1/0;for(let r of c){let i=s(r,t);i<n&&(n=i,e.stopS=r.s)}}return{ids:t,points:c,crossings:i,length:c.at(-1).s}}function ft(e,t,n){let r=(t+e.offset)%24;return r>=20?{color:`red`,walk:!0,remaining:24-r}:Math.abs(Math.cos(n))>.5?{color:r<8?`green`:r<10?`amber`:`red`,walk:!1,remaining:r<8?8-r:r<10?10-r:24-r}:{color:r>=10&&r<18?`green`:r>=18?`amber`:`red`,walk:!1,remaining:r<10?10-r:r<18?18-r:20-r}}function pt(e,t){let n=t.x-e.x,r=t.z-e.z,i=n*Math.sin(e.heading)-r*Math.cos(e.heading),a=n*Math.cos(e.heading)+r*Math.sin(e.heading),s=c((t.heading||0)-e.heading);return{ahead_m:o(i,1),right_m:o(a,1),relative_position:i<-1?`behind`:i>1?`ahead`:`alongside`,heading_relative_deg:o(s*180/Math.PI,1),relative_velocity_ahead_mps:o((t.speed||0)*Math.cos(s)-e.speed,1)}}function mt(e,t){if(![`car`,`motorcycle`].includes(t.type))return!1;let n=pt(e,t);return n.ahead_m<-e.depth/2&&Math.abs(n.heading_relative_deg)<45&&Math.abs(n.right_m)<(e.width+t.width)/2+.5}function ht(e,t){let n=t.filter(t=>mt(e,t)).map(t=>{let n=pt(e,t),r=c((t.heading||0)-e.heading),i=(Math.abs(Math.cos(r))*t.depth+Math.abs(Math.sin(r))*t.width)/2;return{other:t,gap:Math.max(0,-n.ahead_m-e.depth/2-i),closing:Math.max(0,n.relative_velocity_ahead_mps)}}).filter(({gap:e})=>e<45).sort((e,t)=>e.gap-t.gap)[0];if(!n)return null;let{other:r,gap:i,closing:a}=n,s=a>.1?i/a:null;return{vehicle_id:r.id,gap_m:o(i,1),closing_speed_mps:o(a,1),time_to_close_gap_s:s===null?null:o(s,1),urgency:i<8||s!==null&&s<4?`high`:`moderate`,preferred_action:`increase_forward_gap`}}function gt(e){let t=Math.sin(e.heading||0),n=Math.cos(e.heading||0);return[{x:t,z:-n,radius:(e.depth||4.2)/2},{x:n,z:t,radius:(e.width||1.9)/2}]}function _t(e,t){let n=gt(e),r=gt(t),i=t.x-e.x,a=t.z-e.z,o=-1/0;for(let e of[...n,...r]){let t=[...n,...r].reduce((t,n)=>t+Math.abs(e.x*n.x+e.z*n.z)*n.radius,0);o=Math.max(o,Math.abs(i*e.x+a*e.z)-t)}return o}function vt(e,t){let n=t.filter(t=>t.id!==e.id).map(e=>({...e,heading:e.type===`building`?-(e.rotation||0):e.heading||0})).filter(t=>_t(e,t)<=v);if(!n.length)return null;let r=e.target<0?-1:1,i={...e,speed:r},a=e.maneuver||{lane_offset_m:0,lookahead_m:4.5};for(let e=0;e<=v*10;e++){let t=n.find(e=>_t(i,e)<=.01);if(t)return{id:t.id,type:t.type,gap_m:o(e/10,1)};w(i,A(i,a),r,.1)}return null}function yt(e,t){let n=Math.abs(e.speed);return(t?.type===`motorcycle`?5:4)+n}function bt(e,t){let n=null;for(let r of t){if(r.id===e.id)continue;let t=r.x-e.x,i=r.z-e.z,a=t*Math.sin(e.heading)-i*Math.cos(e.heading),o=t*Math.cos(e.heading)+i*Math.sin(e.heading),s=(r.heading||0)-e.heading;if(Math.cos(s)<.5)continue;let c=Math.abs(Math.cos(s))*(r.depth||4.2)/2+Math.abs(Math.sin(s))*(r.width||1.9)/2,l=Math.abs(Math.cos(s))*(r.width||1.9)/2+Math.abs(Math.sin(s))*(r.depth||4.2)/2,u=a-(e.depth||4.2)/2-c,d=r.type===`motorcycle`?.55:Math.min(.45,.18+Math.abs(e.speed)*.025);a>0&&Math.abs(o)<(e.width||1.9)/2+l+d&&(!n||u<n.gap)&&(n={other:r,gap:u})}return n}function xt(e){let t=.35;return Math.max(0,Math.sqrt((5*t)**2+10*Math.max(0,e))-5*t)}function St(e,t){if(!t)return 1/0;let n=Math.max(0,(t.other.speed||0)*Math.cos((t.other.heading||0)-e.heading)),r=t.gap-yt(e,t.other);return Math.min(xt(r+n*n/10),Math.max(0,n+r*1.5))}function Ct(e,t){if(e.type===`pedestrian`){if(e.crossing){let n=Math.max(0,16-(e.progress||0)),r=Math.min(n,(e.speed||0)*t);return{...e,...u(e,e.heading||0,r),speed:r>=n?0:e.speed}}if(e.walkPath?.length){let{start:n,heading:r,length:i}=e.walkPath,a=((e.progress+e.direction*e.speed*t)%(2*i)+2*i)%(2*i),o=a<i;return{...e,...u(n,r,o?a:2*i-a),heading:c(r+((o?e.direction:-e.direction)<0?Math.PI:0))}}}if(e.route?.points?.length&&Number.isFinite(e.s)){let n=Math.max(0,e.speed)*t,r=e.s+n;if(e.s>=e.route.length-1)return{...e,...u(e,e.heading,n),s:r};let i=m(e.route.points,r),a=l(m(e.route.points,Math.max(0,Math.min(r,e.route.length)-.2)),i);return{...e,...u(i,a,Math.max(0,r-e.route.length)),heading:a,s:r}}return{...e,x:e.x+Math.sin(e.heading||0)*(e.speed||0)*t,z:e.z-Math.cos(e.heading||0)*(e.speed||0)*t}}function wt(e,t){let n=new Set(t.filter(t=>mt(e,t)).map(e=>e.id)),r=new Map(t.map(e=>[e.id,e])),a=0,o=e;return(e,s)=>{let c=Math.max(0,e-a),l=[o,...[...r.values()].filter(e=>[`car`,`motorcycle`].includes(e.type))],u=t.map(t=>{if(t.type===`building`)return{object:t};let a=r.get(t.id),o;if(n.has(t.id)){let e=Math.min(Math.max(t.speed||0,s.speed),St(a,bt(a,l))),n=Math.max(0,a.speed+i(e-a.speed,-7*c,2.8*c));o=Ct({...a,speed:n},c)}else o=Ct(t,e);return{object:o,previous:a}});return r=new Map(u.map(({object:e})=>[e.id,e])),a=e,o={...s},u}}function Tt(e,t){let n=Math.max(0,e.speed,e.target||0),r=i(n/8+1,3,5),a=.1,o=t.filter(t=>t.id!==e.id&&s(e,t)<(n+Math.abs(t.speed||0))*r+12);if(!o.length)return null;let c={...e},l=wt(e,o),u=new Map(o.map(e=>[e.id,e])),d=bt(e,o.filter(e=>e.type===`car`||e.type===`motorcycle`)),f=0,p=null;for(let t=0;t<=r;t+=a){if(t>0){let r=e.maneuver?A(c,e.maneuver):e.steering||0,i=d?bt(c,[Ct(d.other,t-a)]):null,o={x:c.x,z:c.z};w(c,r,Math.min(O(c,e.maneuver,n),St(c,i)),a),f+=s(o,c)}for(let{object:n}of l(t,c)){let r=u.get(n.id),i=(r.type===`motorcycle`?.3:r.type===`pedestrian`?.35:.12)+Math.min(.8,(c.speed+Math.abs(n.speed||0))*a/2);if(_t(c,n)>i)continue;let o=mt(e,r)&&c.speed>=0&&Math.cos(c.heading-e.heading)>.85&&Math.cos(n.heading-c.heading)>.5,s={object_id:r.id,type:r.type,...pt(e,r),time_s:t,distance_along_path_m:f,braking_reduces_risk:!o,max_speed_mps:o?null:xt(f-(r.type===`pedestrian`?.65:.3)),reason:o?`Following traffic behind`:r.type===`motorcycle`?`Motorcycle clearance`:r.type===`pedestrian`?`Pedestrian clearance`:`Crossing or merging traffic`};if(o)p??=s;else return s}}return p}function Et(e){return{x:e.x,z:e.z,heading:e.type===`building`?-(e.rotation||0):e.heading||0,width:e.width,depth:e.depth,speed:e.speed||0}}function Dt(e,t,n){return{...t,x:a(e.x,t.x,n),z:a(e.z,t.z,n),heading:e.heading+c(t.heading-e.heading)*n}}function Ot(e,t,n){let r=null,a=e=>Math.hypot(e.width,e.depth)/2;for(let{object:o,previous:l}of n){let n=Et(o),u=l||n,d=a(t)+a(n);if(Math.min(e.x,t.x)-Math.max(u.x,n.x)>d||Math.min(u.x,n.x)-Math.max(e.x,t.x)>d||Math.min(e.z,t.z)-Math.max(u.z,n.z)>d||Math.min(u.z,n.z)-Math.max(e.z,t.z)>d)continue;let f=s(e,t)+s(u,n)+Math.abs(c(t.heading-e.heading))*a(t)+Math.abs(c(n.heading-u.heading))*a(n),p=Math.max(1,Math.ceil(f/.12)),m=r=>_t(Dt(e,t,r),Dt(u,n,r))<0;for(let a=0;a<=p;a++){let c=a/p;if(r&&c-1/p>r.fraction)break;if(!m(c))continue;let l=Math.max(0,(a-1)/p);for(let e=0;e<12&&c>l;e++){let e=(l+c)/2;m(e)?c=e:l=e}if(!r||c<r.fraction){let a=Dt(e,t,l),d=Dt(u,n,l),f=Math.sin(d.heading),p=Math.cos(d.heading),m=a.x-d.x,h=a.z-d.z,g=i(m*p+h*f,-d.width/2,d.width/2),_=i(m*f-h*p,-d.depth/2,d.depth/2),v={x:d.x+p*g+f*_,z:d.z+f*g-p*_},y=s(a,v)||1,b={x:(a.x-v.x)/y,z:(a.z-v.z)/y},x=Math.hypot(Math.sin(t.heading)*t.speed-Math.sin(n.heading)*n.speed,-Math.cos(t.heading)*t.speed+Math.cos(n.heading)*n.speed);r={object:o,fraction:c,player:a,target:d,point:v,normal:b,relativeSpeed:x}}break}}return r}var kt=new WeakMap,At=(e,t,n)=>(t.x-e.x)*(n.z-e.z)-(t.z-e.z)*(n.x-e.x),jt=e=>Math.abs(e.reduce((t,n,r)=>{let i=e[(r+1)%e.length];return t+n.x*i.z-i.x*n.z},0))/2;function Mt(e){return e.reduce((t,n,r)=>{let i=e[(r+1)%e.length];return t+n.x*i.z-i.x*n.z},0)<0&&e.reverse(),{points:e,minX:Math.min(...e.map(e=>e.x)),maxX:Math.max(...e.map(e=>e.x)),minZ:Math.min(...e.map(e=>e.z)),maxZ:Math.max(...e.map(e=>e.z))}}function Nt(e,t=0){return Mt([[-1,-1],[1,-1],[1,1],[-1,1]].map(([n,r])=>u(u(e,e.heading,r*(e.depth/2+t)),e.heading+Math.PI/2,n*(e.width/2+t)))).points}function Pt(e){if(kt.has(e))return kt.get(e);let t=[];if(e.type===`highway`){let n=e.roadSamples,r=(e,t)=>u(n[e],l(n[Math.max(0,e-1)],n[Math.min(n.length-1,e+1)])+Math.PI/2,t);for(let e=0;e<n.length-1;e++)for(let[n,i]of[[-12.5,-1.05],[1.05,12.5]])t.push(Mt([r(e,n),r(e,i),r(e+1,i),r(e+1,n)]))}else{for(let n of e.edges){let r=e.byId[n.a],i=e.byId[n.b],a=l(r,i);t.push(Mt([u(r,a-Math.PI/2,n.width/2),u(r,a+Math.PI/2,n.width/2),u(i,a+Math.PI/2,n.width/2),u(i,a-Math.PI/2,n.width/2)]))}for(let n of e.nodes)t.push(Mt([{x:n.x-6.05,z:n.z-6.05},{x:n.x+6.05,z:n.z-6.05},{x:n.x+6.05,z:n.z+6.05},{x:n.x-6.05,z:n.z+6.05}]))}for(let n of e.connectorRoads||[]){let e=(e,t)=>u(n.points[e],l(n.points[Math.max(0,e-1)],n.points[Math.min(n.points.length-1,e+1)])+Math.PI/2,t*n.width/2);for(let r=0;r<n.points.length-1;r++)t.push(Mt([e(r,-1),e(r,1),e(r+1,1),e(r+1,-1)]))}return kt.set(e,t),t}function Ft(e,t){return Math.hypot(Math.max(t.minX-e.x,0,e.x-t.maxX),Math.max(t.minZ-e.z,0,e.z-t.maxZ))}function It(e,t,n=100){let r=Pt(e),i=r.filter(e=>Ft(t,e)<=n);return i.length?i:[r.reduce((e,n)=>Ft(t,e)<Ft(t,n)?e:n)]}function Lt(e,t,n,r){let i=[];for(let a=0;a<e.length;a++){let o=e[a],s=e[(a+1)%e.length],c=At(t,n,o),l=At(t,n,s),u=r?c>=-1e-9:c<=1e-9,d=r?l>=-1e-9:l<=1e-9;if(u&&i.push(o),u!==d){let e=c/(c-l);i.push({x:o.x+(s.x-o.x)*e,z:o.z+(s.z-o.z)*e})}}return i}function Rt(e,t){let n=[],r=e;for(let e=0;e<t.length&&r.length;e++){let i=t[e],a=t[(e+1)%t.length],o=Lt(r,i,a,!1);o.length>=3&&jt(o)>1e-7&&n.push(o),r=Lt(r,i,a,!0)}return n}function zt(e,t){let n=1/0;for(let{points:r}of t){if(r.every((t,n)=>At(t,r[(n+1)%r.length],e)>=-1e-8))return 0;for(let t=0;t<r.length;t++){let a=r[t],o=r[(t+1)%r.length],c=o.x-a.x,l=o.z-a.z,u=i(((e.x-a.x)*c+(e.z-a.z)*l)/(c*c+l*l||1),0,1);n=Math.min(n,s(e,{x:a.x+c*u,z:a.z+l*u}))}}return n}function Bt(e,t){let n=Mt(Nt(e)),r=[n.points];for(let e of t)if(!(e.maxX<n.minX||e.minX>n.maxX||e.maxZ<n.minZ||e.minZ>n.maxZ)&&(r=r.flatMap(t=>Rt(t,e.points)),!r.length))break;let i=Math.min(1,r.reduce((e,t)=>e+jt(t),0)/(e.width*e.depth));return{on_road:i<1e-5,outside_fraction:i}}function Vt(e,t,n=1){let r=t.x-e.x,i=t.z-e.z;return{right_m:o(r*Math.cos(e.heading)+i*Math.sin(e.heading),n),ahead_m:o(r*Math.sin(e.heading)-i*Math.cos(e.heading),n)}}function Ht(e,t,n){let r={x:Math.cos(t),z:Math.sin(t)},i=[];for(let{points:t}of n){let n=-1/0,a=1/0;for(let i=0;i<t.length;i++){let o=t[i],s=t[(i+1)%t.length],c=At(o,s,e),l=(s.x-o.x)*r.z-(s.z-o.z)*r.x;if(Math.abs(l)<1e-10){if(c<-1e-8){n=1/0;break}}else l>0?n=Math.max(n,-c/l):a=Math.min(a,-c/l);if(n>a)break}Number.isFinite(n)&&Number.isFinite(a)&&n<=a&&i.push({left:n,right:a})}i.sort((e,t)=>e.left-t.left);let a=[];for(let e of i){let t=a.at(-1);t&&e.left<=t.right+1e-6?t.right=Math.max(t.right,e.right):a.push({...e})}let o=e=>Math.max(e.left,-e.right,0);return a.reduce((e,t)=>!e||o(t)<o(e)?t:e,null)}function Ut(e,t,n=40){let r=t=>{let{right_m:n,ahead_m:r}=Vt(e,t,2);return[n,r]},a=p(e,e.route.points),s=Math.max(40,n),c=[...new Set([-e.depth,0,...Array.from({length:12},(e,t)=>(t+1)*s/12)].map(t=>i(a.s+t,0,e.route.length)))].map(n=>{let i=m(e.route.points,n),s=i.heading??p(i,e.route.points).heading,c=Ht(i,s,t),l=ee(e,n)?.laneHalfWidth??3,d=e=>r(u(i,s+Math.PI/2,e));return{route_ahead_m:o(n-a.s,1),center:r(i),road_left:c?d(c.left):null,road_right:c?d(c.right):null,lane_left:d(-l),lane_right:d(l),center_on_road:!!c&&c.left<=0&&c.right>=0}}),l=[-e.depth/2,0,e.depth/2].map(n=>{let r=Ht(u(e,e.heading,n),e.heading,t);return{ahead_m:o(n,2),road_left_m:r?o(r.left,2):null,road_right_m:r?o(r.right,2):null,left_clearance_m:r?o(-e.width/2-r.left,2):null,right_clearance_m:r?o(r.right-e.width/2,2):null}}),d=Math.max(s+a.distance+e.depth,Math.min(160,Math.max(Math.abs(e.speed)*3+10,zt(e,t)+15))),f=Mt([{x:e.x-d,z:e.z-d},{x:e.x+d,z:e.z-d},{x:e.x+d,z:e.z+d},{x:e.x-d,z:e.z+d}]).points,h=t.flatMap(t=>{let n=t.points;for(let e=0;e<f.length&&n.length;e++)n=Lt(n,f[e],f[(e+1)%f.length],!0);return n.length>=3&&jt(n)>.01?[n.map(t=>{let{right_m:n,ahead_m:r}=Vt(e,t);return[n,r]})]:[]});return{...Bt(e,t),distance_to_road_m:o(zt(e,t),1),coordinates:`Points are [right, ahead] meters from the car center. Negative right is left; negative ahead is behind. Left/right edges follow the route direction.`,boundary_source:`Actual asphalt geometry; excludes grass, sidewalks and median`,polygon_clip_radius_m:o(d,1),preview_distance_m:o(Math.max(0,Math.min(s,e.route.length-a.s)),1),ego_footprint:Nt(e).map(r),edge_clearance_samples:l,boundary_samples:c,drivable_polygons:h}}function Wt(e,t,n,r){for(let i of n){let n=-(i.rotation||0),a=Math.cos(n),o=Math.sin(n),s=e=>({x:(e.x-i.x)*a+(e.z-i.z)*o,z:(e.x-i.x)*o-(e.z-i.z)*a}),c=s(e),l=s(t),u=0,d=1;for(let[e,t]of[[`x`,i.width/2+r],[`z`,i.depth/2+r]]){let n=l[e]-c[e];if(Math.abs(n)<1e-8){if(Math.abs(c[e])>t){u=2;break}}else{let r=[(-t-c[e])/n,(t-c[e])/n].sort((e,t)=>e-t);u=Math.max(u,r[0]),d=Math.min(d,r[1])}}if(u<=d)return!1}return!0}function Gt(e,t,n){let r=p(e,e.route.points),a=[8,14,20,4,0,-6,28,-12,40].map(t=>{let n=m(e.route.points,i(r.s+t,0,e.route.length));return{...n,heading:n.heading??r.heading}}).filter(n=>Bt({...e,...n},t).on_road),o=e.width/2+.25,c=a.filter(t=>Wt(e,t,n,o));if(c.length){let e=c[0];return{waypoint:e,goal:e}}if(!a.length)return null;let l=Math.min(...a.map(t=>s(e,t)))+30,d=n.filter(t=>s(e,t)<l+Math.hypot(t.width,t.depth)/2).sort((t,n)=>s(e,t)-s(e,n)).slice(0,12),f=[e,...a];for(let e of d)for(let t of[-1,1])for(let n of[-1,1])f.push(u(u(e,-(e.rotation||0),n*(e.depth/2+o+.5)),-(e.rotation||0)+Math.PI/2,t*(e.width/2+o+.5)));let h=f.map(()=>1/0),g=[],_=new Set;h[0]=0;for(let e=0;e<f.length;e++){let e=-1;for(let t=0;t<f.length;t++)!_.has(t)&&(e<0||h[t]<h[e])&&(e=t);if(e<0||!Number.isFinite(h[e]))break;if(e>0&&e<=a.length){let t=e;for(;g[t]!==0;)t=g[t];return{waypoint:f[t],goal:f[e]}}_.add(e);for(let t=1;t<f.length;t++){if(_.has(t))continue;let r=h[e]+s(f[e],f[t]);r<h[t]&&Wt(f[e],f[t],n,o)&&(h[t]=r,g[t]=e)}}return null}function Kt(e,t,n,r,a,u,d=null){let f=It(t,e,Math.max(100,Math.abs(e.speed)*4)),h=Bt(e,f),g=p(e,e.route.points),_=!h.on_road||g.distance>6||Math.abs(c(g.heading-e.heading))>1.2,v=ee(e,g.s),x=[`onramp`,`merge`].includes(v?.kind),S=n.filter(e=>e.type===`building`),w=_?Gt(e,f,S):null,T=w?.waypoint||m(e.route.points,g.s+Math.max(5,Math.abs(e.speed)*1.2)),E=e.route.crossings.find(e=>e.stopS-g.s>-19),D=E?{...m(e.route.points,E.stopS),heading:E.approach}:null,O=E&&[`stop`,`signal`].includes(t.byId[E.nodeId].control)&&E.stopS-g.s>-e.depth&&E.stopS-g.s<100,k=!_&&O&&d&&d.distance>=-.7&&(t.byId[E.nodeId].control===`stop`&&!d.stopCompleted||t.byId[E.nodeId].control===`signal`&&[`red`,`amber`].includes(d.color)),j=_?2:o(Math.min(u,k?b(e,D):1/0),2),ne=_?null:bt(e,n.filter(e=>e.type===`car`||e.type===`motorcycle`)),re=ne&&E&&[`stop`,`signal`].includes(t.byId[E.nodeId].control)&&E.stopS-g.s>-3&&E.stopS-g.s<90&&ne.gap<45&&ne.gap<E.stopS-g.s+8?{lead_id:ne.other.id,gap_m:o(ne.gap,1),lead_speed_mps:o(ne.other.speed,1),target_gap_m:o(yt(e,ne.other),1),policy:`follow_in_lane`}:null,ie=ne?(e,t)=>St(e,bt(e,[Ct(ne.other,t)])):null,ae=n.filter(t=>s(e,t)<(Math.max(Math.abs(e.speed),j)+Math.abs(t.speed||0))*3+Math.hypot(t.width||1,t.depth||1)/2+6),oe=e.route.points.slice(Math.max(0,g.index-40),g.index+180),se=x&&ae.some(e=>[`car`,`motorcycle`].includes(e.type)&&Math.cos(c(e.heading-g.heading))>0&&p(e,oe).distance<8),ce=C(2*Math.sin(c(l(e,T)-e.heading))/Math.max(4,s(e,T)),e.speed),M=_?.85:.85*Math.min(1,9/Math.max(5,Math.abs(e.speed))),le=v?.laneHalfWidth??(t.type===`highway`?2.25:3),ue=t=>{let n=p(t,oe),r=(t.x-n.x)*Math.cos(n.heading)+(t.z-n.z)*Math.sin(n.heading),i=c(t.heading-n.heading),a=Math.abs(Math.cos(i))*e.width/2+Math.abs(Math.sin(i))*e.depth/2;return{offset:r,headingError:Math.abs(i),excess:Math.max(0,Math.abs(r)+a-(ee(e,n.s)?.laneHalfWidth??le))}},de=ue(e);function fe(t,n,r=null,a=null,l=null){let u={steering:t,lane_offset_m:r,lookahead_m:a,stop_at_line:l};r!==null&&(t=A(e,u)),t=o(i(t,-.85,.85),5),n=o(n,2),u.steering=t;let d=te(e,t,n,u,ie),m=0,h=0,v=!1,b=!1,x=null,S=null,C=null,E=wt(e,ae),O=D&&y(e,D)>0,ee={...e},k=0,j=0,re=0;for(let t=0;t<d.points.length;t+=2){let n={...e,...d.points[t]};O&&y(n,D)<=0&&(b=!0);let r=Bt(n,f);!r.on_road&&C===null&&(C={in_s:o(t*3/60,2),center:Vt(e,n,2)});let i=ue(n);if(k+=Math.abs(i.offset),j=Math.max(j,i.excess),re=Math.max(re,i.headingError),m+=r.outside_fraction,h=Math.max(h,r.outside_fraction),!v&&ae.length){let e=Ot(ee,n,E(t*.05,n));v=!!e,x=e?.object.id??null,e&&(S=Math.max(0,(t-2)*.05)+e.fraction*(t?.1:0))}ee=n}let se={...e,...d.points.at(-1)},ce=p(se,oe),M=p(d.evaluation,oe),le=Math.abs(c(ce.heading-se.heading))*180/Math.PI,fe=M.distance+Math.abs(c(M.heading-d.evaluation.heading))*3,pe=S!==null&&S<=Math.max(.75,Math.abs(e.speed)/8+.3),me={steering:t,velocity_mps:n,stop_at_line:l,lane_offset_m:r,lookahead_m:a,queue_compatible:r!==null&&Math.abs(r)<=.2,following_vehicle_id:ne?.other.id??null,end_speed_mps:o(se.speed,2),stop_line_after_m:D?o(y(se,D),1):null,crosses_stop_line:b,stopping_distance_after_m:o(se.speed**2/16,1),lane_error_m:o(k/31),lane_error_after_m:o(Math.abs(ue(se).offset)),stays_in_lane:j<.12,returning_to_lane:j<=de.excess+.15&&Math.abs(ue(se).offset)<Math.abs(de.offset),route_error_m:o(fe),route_progress_m:o(ce.s-g.s,1),follows_route_direction:n>=0&&re<Math.PI/2&&ce.s>=g.s-.1,heading_error_deg:o(le,1),offroad_fraction:o(m/31,3),max_offroad_fraction:o(h,6),stays_on_road:h<1e-5,first_offroad:C,end_position:Vt(e,se,2),on_road_after:Bt(se,f).on_road,road_distance_after_m:o(zt(se,f),1),recovery_distance_m:_&&w?o(s(se,T),1):null,collision_predicted:v,collision_imminent:pe,collision_in_s:S===null?null:o(S,2),collision_object_id:x};return{data:me,projection:d,score:pe*1e4+(v&&!pe?20:0)+(_?(w?s(se,T):100)+le*.035+me.road_distance_after_m*.5:h*1e3+j*30+k/31*8+fe+ce.distance*2+Math.abs(t-(e.wheelSteering??e.steering))*.3)}}let pe=[],me=_?11:55;for(let t=0;t<me;t++){let n=_?-M+2*M*((t+r())/me):t%3==0?(r()*2-1)*M:i(ce+(r()*2-1)*Math.max(.015,M*.25),-M,M),a=j<.15?0:_?(t%2?-1:1)*j*(.6+.4*r()):k&&t<8?j*(.9+r()*.1):se&&t<5?j*(.3+r()*.25):j*((k||se)&&t<10||ne&&t<8?.25+r()*.3:x?.95+r()*.05:t%5?.94+r()*.06:.78+r()*.12),s=_||t>=44?null:o((r()*2-1)*(t<14?.1:t<30?.65:1.35),3),c=_?null:o(i(3.5+Math.max(e.speed,j)*.36+r()*.8,4,10),2),l=k&&t<8?{x:D.x,z:D.z,heading:D.heading,node_id:E.nodeId,clearance_m:.5,deceleration_mps2:o(4+r()*.8,2)}:null;pe.push(fe(n,a,s,c,l))}let he=se&&pe.some(e=>e.data.queue_compatible&&e.data.velocity_mps>j*.7&&e.data.collision_predicted);x&&!_&&!k&&!he&&j>=.15&&(pe=pe.filter(e=>e.data.velocity_mps>=j*.7));let ge;if(_)ge=pe;else{let e=pe.filter(e=>e.data.stays_on_road&&!e.data.collision_imminent&&(t.type!==`highway`||e.data.follows_route_direction)&&(e.data.stays_in_lane||e.data.returning_to_lane)),n=(e,t)=>e.score-t.score,r=re?e.filter(e=>e.data.queue_compatible):e,i=[...r.sort(n),...pe.filter(e=>!r.includes(e)).sort(n)];if(ge=[],k||he){let e=pe.slice(0,k?8:5).filter(e=>r.includes(e)&&e.data.velocity_mps>0).sort(n)[0];e&&ge.push(e);for(let[e,t]of[[.7,1/0],[.25,.7]]){if(ge.length===3)break;let n=i.find(n=>r.includes(n)&&n.data.queue_compatible&&!n.data.stop_at_line&&n.data.velocity_mps>j*e&&n.data.velocity_mps<=j*t&&!ge.includes(n));n&&ge.push(n)}}for(let e of i){if(ge.length===3)break;ge.includes(e)||ge.push(e)}let a=pe.filter(e=>!ge.includes(e)&&e.data.lane_offset_m!==null).sort((e,t)=>e.data.lane_offset_m-t.data.lane_offset_m);for(let e=0;e<4;e++)ge.push(a[Math.floor(e*(a.length-1)/3)]);let o=pe.filter(e=>e.data.lane_offset_m===null).sort((e,t)=>e.data.steering-t.data.steering);for(let e=0;e<4;e++)ge.push(o[Math.floor(e*(o.length-1)/3)])}ge.push(fe(e.steering||0,0,_?null:0,4.5));let _e={},ve={};ge.forEach((e,t)=>{let n=`${a}_${t===ge.length-1?`stop`:`v${t}`}`;_e[n]=e.data,ve[n]=e.projection});let ye=Ut(e,f,Math.max(40,Math.max(Math.abs(e.speed),j)*3+10));return{batch_id:a,origin:{x:e.x,z:e.z,heading:e.heading,depth:e.depth},vectors:_e,projections:ve,stopLine:D,speedCap:j,stopApproach:k?{stop_line_ahead_m:o(y(e,D),1),approach_cap_mps:o(j,2)}:null,blockingObject:vt(e,ae),queue:re,road:ye,lane:{drive_on:`right`,offset_m:o(de.offset),half_width_m:le,centerline:ye.boundary_samples.filter(e=>e.route_ahead_m>=0).map(({center:[e,t]})=>({right_m:e,ahead_m:t}))},recovery:{active:_,blocked:_&&!w,speed_cap_mps:_?j:null,target:w?{...Vt(e,w.waypoint),heading_relative_deg:o(c(w.goal.heading-e.heading)*180/Math.PI,1)}:null}}}function qt(e,t,n,r){let i=te(e,t,n),a=r.filter(t=>s(e,t)<Math.max(8,Math.abs(e.speed)*2)+Math.hypot(t.width||1,t.depth||1)/2);if(!a.length)return!1;for(let t=2;t<=20;t+=2)if(Ot({...e,...i.points[t-2]},{...e,...i.points[t]},a.map(e=>({object:e.type===`building`?e:Ct(e,t*.05),previous:e.type===`building`?void 0:Et(Ct(e,(t-2)*.05))}))))return!0;return!1}function Jt(e,t){let n={...t,width:t.width+.5,depth:t.depth+.5},r=[...e.traffic,e.player,...e.pedestrians,...e.world.objects.filter(e=>e.type===`building`)].filter(e=>e.id!==t.id&&s(t,e)<16+Math.hypot(e.width||0,e.depth||0)/2).map(e=>({object:e})),i={lane_offset_m:0,lookahead_m:4.5};for(let a=1;a<=30;a++){let o={...n};if(t===e.player)w(n,A(n,i),1.5,.1);else{let e=m(t.route.points,t.s+a*.15),r=m(t.route.points,t.s+a*.15+.2);Object.assign(n,e,{heading:l(e,r)})}if(Ot(o,n,r))return!1}return!0}function Yt(e){let t=[e.player,...e.traffic];for(let n of t)n.waitingSince=Math.abs(n.speed)<.2?n.waitingSince??e.time:null;if(!(e.time<e.nextCourtesy)){e.nextCourtesy=e.time+.5;for(let[n,r]of e.courtesy){let i=t.find(e=>e.id===r.id),a=e.world.byId[n];(!i||e.time-r.at>12||s(i,a)>22||!Jt(e,i))&&e.courtesy.delete(n)}for(let n of e.world.nodes){if(n.control!==`stop`||e.courtesy.has(n.id))continue;let r=t.filter(e=>s(e,n)<24);if(r.length<2||r.some(e=>Math.abs(e.speed)>.2)||e.pedestrians.some(e=>s(e,n)<13&&e.crossing&&e.walking))continue;let i=r.filter(t=>(t!==e.player||e.autopilot)&&t.waitingSince!==null&&e.time-t.waitingSince>=4&&t.stops[n.id]?.served&&e.crossingFor(t)?.nodeId===n.id).sort((e,t)=>e.stops[n.id].arrived-t.stops[n.id].arrived||e.id.localeCompare(t.id)).find(t=>Jt(e,t));i&&(e.courtesy.set(n.id,{id:i.id,at:e.time}),e.locks.set(n.id,{id:i.id,at:e.time}),i===e.player&&e.event(`Traffic is stopped — taking a clear gap at walking speed`))}}}function Xt(e,t,n,r){let i=new Map([[t,0]]),a=new Map,o=new Set(e.nodes.map(e=>e.id).filter(e=>e!==r||e===t||e===n));for(;o.size;){let r=[...o].reduce((e,t)=>(i.get(e)??1/0)<(i.get(t)??1/0)?e:t);if(!Number.isFinite(i.get(r)))return null;if(r===n){let e=[n];for(;e[0]!==t;)e.unshift(a.get(e[0]));return e}o.delete(r);for(let t of e.byId[r].neighbors){if(!o.has(t))continue;let n=i.get(r)+s(e.byId[r],e.byId[t]);n<(i.get(t)??1/0)&&(i.set(t,n),a.set(t,r))}}return null}function Zt(e,t,n,r){let[i,a]=n,o=e.objects.filter(e=>e.type===`building`),l=e.edges.map(n=>{let r=e.byId[n.a],i=e.byId[n.b];return{edge:n,distance:p(t,n.path??[{...r,s:0},{...i,s:s(r,i)}]).distance}}).sort((e,t)=>e.distance-t.distance).slice(0,6),u=[],d=new Set;for(let{edge:n}of l)for(let[l,f]of n.oneWay?[[n.a,n.b]]:[[n.a,n.b],[n.b,n.a]]){let n;try{n=l===i&&f===a?[l,f]:[l,...ut(e,f,i),a]}catch{continue}let h=[n];if(f!==a&&f!==i)for(let t of e.byId[f].neighbors.filter(e=>e!==l)){let n=Xt(e,t,i,f);n&&h.push([l,f,...n,a])}for(let n of h){if(d.has(n.join(`,`)))continue;d.add(n.join(`,`));let i=dt(e,n),a=i.crossings[0]?.stopS+17,l=Number.isFinite(a)?i.points.filter(e=>e.s<=a):i.points;if(l.length<2)continue;let f=p(t,l),h=c(f.heading-t.heading),_=f.distance*5+Math.abs(h)*9+(i.length-f.s)*.025+(g(t,f,o)?80:0),v=Math.max(0,f.s-3);i.points=[m(i.points,v),...i.points.filter(e=>e.s>v)].map(e=>({...e,s:e.s-v})),i.crossings=i.crossings.filter(e=>e.stopS>=v-19).map(e=>({...e,stopS:e.stopS-v})),i.length-=v,i.sections&&=i.sections.filter(e=>e.endS>v).map(e=>({...e,startS:Math.max(0,e.startS-v),endS:e.endS-v})),r&&s(i.points.at(-1),r)>.01&&(i.length+=s(i.points.at(-1),r),i.points.push({...r,s:i.length})),u.push({route:i,progress:f.s-v,distance:f.distance,relativeHeading:h,score:_})}}return u.sort((e,t)=>e.score-t.score)}function Qt(e,t,n,r){return Zt(e,t,n,r)[0]??null}var $t=30,en=6,tn=30,nn=.6,rn=class{constructor(e=Math.floor(Math.random()*999999),t=`town`){this.reset(e,t)}reset(e,t){this.world=lt(e,t),this.time=0,this.paused=!1,this.autopilot=!1,this.safety=!0,this.pedals={throttle:0,brake:0},this.steeringInput=0,this.brakeReason=null,this.complete=!1,this.collisions=0,this.crash=null,this.violations=0,this.distance=0,this.freeExplore=!1,this.events=[],this.locks=new Map,this.courtesy=new Map,this.nextCourtesy=0,this.r=d(e+51),this.planRandom=d(e+9173),this.planSequence=0,this.routeVersion=0,this.routeChoices={},this.nextRouteChoices=0,this.routeChoicesOrigin=null,this.routeHoldUntil=0,this.nextRouteCheck=0,this.offRouteSince=null,this.lastReroute=-1/0,this.destinationApproach=this.world.route.ids.slice(-2),this.destinationPoint={...this.world.route.points.at(-1)},this.lastPlan=null,this.lastDecisionState=null,this.contacts=new Set,this.discovered=new Map,this.perception=[],this.nextScan=0;let n=this.world.route.points[0],r=l(n,this.world.route.points[1]);this.player={id:`ego`,type:`car`,x:n.x,z:n.z,heading:r,speed:0,steering:0,steeringProgress:0,target:0,route:this.world.route,s:0,stops:{},intersectionMemory:null,width:1.9,depth:4.75},this.traffic=[];for(let e=0;e<this.world.theme.traffic;e++)this.spawnTraffic(e);this.pedestrians=[];for(let e=0;e<(t===`highway`?0:14+(t===`city`?12:0));e++){let t=f(this.r,this.world.nodes),n=e%3==0&&t.control===`signal`,r=this.world.byId[f(this.r,t.neighbors)],i=l(t,r),a=this.r()<.5?-1:1,o=u(u(t,i,14),i+Math.PI/2,7.05*a),c=s(t,r)-28,d=n?0:this.r()*c,p=n?{x:t.x-8,z:t.z-7.8}:u(o,i,d);this.pedestrians.push({id:`pedestrian-${e}`,type:`pedestrian`,nodeId:t.id,x:p.x,z:p.z,progress:d,walkPath:{start:o,heading:i,length:c},direction:this.r()>.5?1:-1,crossing:n,walking:!1,speed:0,width:.6,depth:.6,height:1.7})}}spawnTraffic(e,t=!1){let n=this.world.type===`highway`,r=n?this.world.nodes.filter(e=>/^h\d+$/.test(e.id)):this.world.nodes,i=f(this.r,r),a=f(this.r,r.filter(e=>s(e,i)>100)),o=n?(e%4<2?r:[...r].reverse()).map(e=>e.id):ut(this.world,i.id,a.id);if(o.length<3)return this.spawnTraffic(e,t);let c=dt(this.world,o,this.world.type===`highway`&&e%2==0?4.5:void 0),u=this.r()*c.length,d=m(c.points,u),p=m(c.points,u+1);if(s(d,this.player)<(t?600:15))return this.spawnTraffic(e,t);let h=this.traffic.find(t=>t.id===`vehicle-${e}`);if(this.traffic.some(e=>e!==h&&s(e,d)<10))return;let g={id:`vehicle-${e}`,type:e%5==0?`motorcycle`:`car`,x:d.x,z:d.z,heading:l(d,p),speed:0,s:u,route:c,stops:{},width:e%5==0?.8:1.9,depth:e%5==0?2.3:4.2,color:f(this.r,[`#de8e69`,`#e9be57`,`#97b6b9`,`#efefe2`,`#658f82`,`#a294bf`])};h?Object.assign(h,g):this.traffic.push(g)}continueTraffic(e){if(this.world.type===`highway`)return;let t=e.route.ids.slice(-2);for(let e=0;e<5;e++){let e=this.world.byId[t.at(-1)],n=e.neighbors.filter(e=>e!==t.at(-2));t.push(f(this.r,n.length?n:e.neighbors))}let n=dt(this.world,t),r=p(e,n.points);r.distance>.5||(e.route=n,e.s=r.s,e.stops={},e.amber=null)}event(e,t=`info`){this.events[0]?.text===e&&this.time-this.events[0].time<3||(this.events.unshift({time:o(this.time,1),text:e,type:t}),this.events=this.events.slice(0,30))}crossingFor(e){return e.route.crossings.find(t=>t.stopS-e.s>-19)}rememberIntersectionStop(e,t,n){let r=`${this.routeVersion}:${t.nodeId}:${t.stopS}:${t.approach}`;e.intersectionMemory?.key!==r&&(e.intersectionMemory={key:r,nodeId:t.nodeId,stopCount:0,stationarySince:null,currentStopRecorded:!1,lastStop:null},e.stops[t.nodeId]?.passed&&delete e.stops[t.nodeId]);let i=e.intersectionMemory,a=y(e,{...m(e.route.points,t.stopS),heading:t.approach});if(!(t.stopS-e.s>-.7&&a<=80&&s(e,m(e.route.points,e.s))<6&&Math.abs(c(e.heading-t.approach))<1.2)||Math.abs(e.speed)>=.2){i.stationarySince=null,i.currentStopRecorded=!1;return}i.stationarySince??=this.time;let o=this.time-i.stationarySince;o<nn||(i.currentStopRecorded||(i.stopCount++,i.currentStopRecorded=!0,i.lastStop={position:{x:e.x,z:e.z},progress:e.s,lineDistance:a,signal:n}),i.lastStop.confirmedAt=this.time,i.lastStop.duration=o)}intersectionStopMemory(e){let t=this.player.intersectionMemory;if(!e||t?.key!==`${this.routeVersion}:${e.nodeId}:${e.stopS}:${e.approach}`)return null;let n=t.lastStop,r=n?this.time-n.confirmedAt:null;return{approach_id:t.key,stops_on_this_approach:t.stopCount,stopped_recently:r!==null&&r<=30,currently_stopped:t.stationarySince!==null,current_stop_duration_s:t.stationarySince===null?0:o(this.time-t.stationarySince,1),last_stop:n?{age_s:o(r,1),duration_s:o(n.duration,1),stop_line_ahead_m:o(n.lineDistance,1),signal_at_stop:n.signal,forward_progress_since_m:o(this.player.s-n.progress,1)}:null}}rule(e,t=!1){let n=this.crossingFor(e);if(!n)return{mustStop:!1,distance:1/0,reason:`Clear road`,color:null};let r=this.world.byId[n.nodeId],i=n.stopS-e.s,a=r.control===`signal`?ft(r,this.time,n.approach):{color:`stop`,walk:!1},o=`${r.id}:${Math.floor((this.time+r.offset)/24)}`;t&&a.color===`amber`&&e.amber?.key!==o&&(e.amber={key:o,proceed:e.speed*e.speed/16>Math.max(0,i-e.depth/2-.2)});let s=e.amber?.key===o?e.amber.proceed:e.speed*e.speed/16>Math.max(0,i-e.depth/2-.2),c=i<-.7;t&&e===this.player&&this.rememberIntersectionStop(e,n,a.color);let l=e.stops[n.nodeId];t&&i<5.5&&i>-.7&&Math.abs(e.speed)<.2?(l||(e.stops[n.nodeId]=l={arrived:this.time,served:!1}),l.stationarySince??=this.time,this.time-l.stationarySince>=(e===this.player?nn:1.2)&&(l.served=!0)):t&&l&&(l.stationarySince=null);let u=`Clear road`,d=!1;if(c)t&&(this.locks.set(r.id,{id:e.id,at:this.time}),l&&(l.passed=!0));else{r.control===`signal`&&(a.color===`red`||a.color===`amber`&&!s)&&(d=!0,u=a.walk?`Pedestrian crossing`:`${a.color===`amber`?`Amber`:`Red`} light`),r.control===`stop`&&!l?.served&&(d=!0,u=`Stop sign`);let n=this.courtesy.get(r.id),o=n?.id===e.id,c=this.locks.get(r.id);(r.control===`stop`||e!==this.player)&&!o&&c&&c.id!==e.id&&(d=!0,u=`Yield to crossing traffic`),r.control===`stop`&&l?.served&&!o&&[this.player,...this.traffic].filter(t=>t.id!==e.id&&t.stops[r.id]&&!t.stops[r.id].passed&&this.crossingFor(t)?.nodeId===r.id&&t.stops[r.id].arrived<l.arrived).length&&(d=!0,u=`Yield to first arrival`),n&&!o&&(d=!0,u=`Letting stopped traffic clear`);let f=this.pedestrians.filter(e=>e.crossing&&e.walking&&e.nodeId===r.id);e!==this.player&&f.length&&(d=!0,u=`Yield to pedestrian`),t&&!d&&i<3&&this.locks.set(r.id,{id:e.id,at:this.time})}return{mustStop:d,distance:i,reason:u,color:a.color,nodeId:r.id,stopCompleted:!!l?.served,walk:a.walk}}leadGap(e){return bt(e,[...this.traffic,this.player])?.gap??1/0}speedEnvelope(e){let t=this.rule(e),n=bt(e,[...this.traffic,this.player]),r=n?.gap??1/0,i=Math.min(this.world.theme.limit,k(e,e.s)),a=null;if(e!==this.player&&t.mustStop&&t.distance>-.7){let n=Math.sqrt(10*Math.max(0,t.distance-e.depth/2-.2));n<i&&(i=n,a=t.reason)}if(e===this.player&&!this.freeExplore){let t=Math.max(0,e.route.length-e.s),n=Math.sqrt(10*Math.max(0,t-1.5));n<i&&(i=n,a=`Destination ahead`)}let o=St(e,n);o<i&&(i=o,a=n?.other.type===`motorcycle`?`Motorcycle ahead`:`Vehicle ahead`);let s=i,c=e===this.player?Tt(e,[...this.traffic,...this.pedestrians]):null;c?.braking_reduces_risk&&c.max_speed_mps<i&&(i=c.max_speed_mps,a=c.reason);let l=this.courtesy.get(t.nodeId)?.id===e.id;return e!==this.player&&l&&!t.mustStop&&!this.complete&&(i=Math.min(i,1.5),i>0&&(a=`Taking a clear gap`)),{max:i,planningMax:s,reason:a,rule:t,gap:r,conflict:c,lead:n,released:l}}step(e){if(this.paused||this.crash)return;let t=new Map([...this.traffic,...this.pedestrians].map(e=>[e.id,{pose:Et(e),route:e.route}])),n=this.time===0;e=Math.min(e,.05),this.time+=e,this.rerouteIfNeeded();for(let[e,t]of this.locks){let n=[this.player,...this.traffic].find(e=>e.id===t.id),r=this.world.byId[e];(!n||s(n,r)>17||this.time-t.at>7)&&this.locks.delete(e)}for(let t of this.pedestrians){let n=this.world.byId[t.nodeId],r=ft(n,this.time,0).walk;if(t.crossing)r&&!t.walking&&t.progress===0&&([this.player,...this.traffic].some(e=>s(e,n)<13)||(t.walking=!0)),t.walking?(t.progress+=e*3.8,t.progress>=16&&(t.progress=0,t.walking=!1,t.direction*=-1)):t.progress>0&&(t.progress=0),t.x=n.x+(t.direction>0?-8+t.progress:8-t.progress),t.z=n.z-7.8,t.speed=t.walking?3.8:0,t.heading=t.direction>0?Math.PI/2:-Math.PI/2;else{t.progress+=e*.9*t.direction,(t.progress>t.walkPath.length||t.progress<0)&&(t.progress=i(t.progress,0,t.walkPath.length),t.direction*=-1);let n=u(t.walkPath.start,t.walkPath.heading,t.progress);t.x=n.x,t.z=n.z,t.walking=!0,t.speed=.9,t.heading=c(t.walkPath.heading+(t.direction<0?Math.PI:0))}}Yt(this);for(let t of this.traffic){t.route.length-t.s<75&&this.continueTraffic(t);let n=this.rule(t,!0),r=this.speedEnvelope(t).max,a=l(t,m(t.route.points,t.s+9));if(t.s<t.route.length-1&&Math.abs(c(a-t.heading))>.2&&(r=Math.min(r,6.5)),t.speed+=i(r-t.speed,-7*e,2.8*e),n.mustStop&&n.distance>=0&&t.speed*e>Math.max(0,n.distance-t.depth/2-.2)&&(t.speed=Math.max(0,n.distance-t.depth/2-.2)/e),t.s+=t.speed*e,t.s>=t.route.length-1){s(t,this.player)>1300?this.spawnTraffic(Number(t.id.split(`-`)[1]),!0):(t.x+=Math.sin(t.heading)*t.speed*e,t.z-=Math.cos(t.heading)*t.speed*e);continue}let o=m(t.route.points,t.s),u=m(t.route.points,t.s+.5);t.x=o.x,t.z=o.z,t.heading=l(o,u)}this.time>=this.nextScan&&(this.scanScene(),this.nextScan=this.time+.2);let r=this.player,a={...Et(r),s:r.s},d=this.rule(r,!0);r.maneuver?.stop_at_line?.node_id===d.nodeId&&(d.color===`green`||d.stopCompleted)&&(r.maneuver={...r.maneuver,stop_at_line:null});let f=this.autopilot?O(r,r.maneuver,r.target):r.target;if(this.brakeReason=null,this.autopilot&&this.safety){if(this.lastPlan?.recovery.active)f=i(f,-2,2),qt(r,r.steering,f,[...this.world.objects.filter(e=>e.type===`building`),...this.traffic,...this.pedestrians])&&(f=0,this.brakeReason=`Recovery clearance`);else{let e=this.speedEnvelope(r);f>e.max&&(f=e.max,this.brakeReason=e.reason)}}this.complete&&(f=0),r.appliedTarget=f,this.autopilot||this.complete?w(r,r.maneuver?A(r,r.maneuver):r.steering,f,e):T(r,this.steeringInput,this.pedals.throttle,this.pedals.brake,e),r.x=i(r.x,this.world.bounds.minX,this.world.bounds.maxX),r.z=i(r.z,this.world.bounds.minZ,this.world.bounds.maxZ);let h=Ot(a,Et(r),[...this.world.objects.filter(e=>e.type===`building`).map(e=>({object:e})),...[...this.traffic,...this.pedestrians].map(e=>({object:e,previous:!n&&t.get(e.id)?.route===e.route?t.get(e.id).pose:null}))]);if(h){Object.assign(r,{x:h.player.x,z:h.player.z,heading:h.player.heading}),h.object.type!==`building`&&Object.assign(h.object,{x:h.target.x,z:h.target.z,heading:h.target.heading,speed:0,walking:!1}),this.distance+=s(a,r),r.s=p(r,r.route.points).s,this.crash={object_id:h.object.id,type:h.object.type,time_s:o(this.time,2),impact_speed_mps:o(h.relativeSpeed,2),player_speed_mps:o(Math.abs(r.speed),2),point:h.point,normal:h.normal},r.speed=r.target=r.steering=0,this.autopilot=!1,this.complete=!1,this.collisions++,this.contacts=new Set([h.object.id]),this.event(`Collision with ${h.object.type} — drive ended`,`error`);return}this.contacts.clear(),this.distance+=s(a,r);let g=p(r,r.route.points);r.s=g.s,g.distance<=$t&&this.offRouteSince!=null&&(this.offRouteSince=null,this.routeChoices={},this.routeChoicesOrigin=null);for(let e of r.route.crossings)if(a.s<e.stopS&&r.s>=e.stopS&&g.distance<4){let t=this.world.byId[e.nodeId];(t.control===`signal`?ft(t,this.time,e.approach).color===`red`:!r.stops[t.id]?.served)&&(this.violations++,this.event(t.control===`stop`?`Missed stop sign`:`Crossed on red`,`error`))}!this.complete&&!this.freeExplore&&s(r,r.route.points.at(-1))<3&&r.speed<1&&(this.complete=!0,r.target=0,this.autopilot=!1,this.event(`Destination reached. Nicely driven.`,`success`))}rerouteIfNeeded(){if(this.complete||this.freeExplore||this.crash||this.time<this.nextRouteCheck)return;this.nextRouteCheck=this.time+.75;let e=this.player;if(p(e,e.route.points).distance<=$t){this.offRouteSince=null,this.routeChoices={},this.routeChoicesOrigin=null;return}if(this.offRouteSince??=this.time,!this.routeChoiceNeeded())return;if(this.requestReroute){this.nextRouteCheck=this.time+4,this.requestReroute();return}let t=Qt(this.world,e,this.destinationApproach,this.destinationPoint);t&&t.route.ids.join(`,`)!==e.route.ids.join(`,`)&&this.installRoute(t)}installRoute(e){if(!this.routeChoiceNeeded())return!1;let t=this.player,n=this.crossingFor(t),r=n&&t.stops[n.nodeId];t.route=this.world.route=e.route,t.s=e.progress,t.stops={};let i=this.crossingFor(t);r&&i?.nodeId===n.nodeId&&Math.abs(c(i.approach-n.approach))<.1&&(t.stops[i.nodeId]=r),t.amber=null,t.maneuver=null,t.target=0;for(let[e,n]of this.locks)n.id===t.id&&this.locks.delete(e);for(let[e,n]of this.courtesy)n.id===t.id&&this.courtesy.delete(e);return this.lastPlan=this.lastDecisionState=null,this.lastReroute=this.time,this.offRouteSince=null,this.routeVersion++,this.routeChoices={},this.nextRouteChoices=this.time,this.routeHoldUntil=0,this.event(`Route recalculated from your current location`),!0}routeChoiceNeeded(){return!this.complete&&!this.freeExplore&&!this.crash&&this.offRouteSince!=null&&this.time-this.offRouteSince>=en&&this.time-this.lastReroute>=tn&&this.time>=this.routeHoldUntil&&p(this.player,this.player.route.points).distance>$t}refreshRouteChoices(){if(!this.routeChoiceNeeded()||this.time<this.routeHoldUntil){this.routeChoices={};return}let e=this.crossingFor(this.player);if(e&&Math.abs(e.stopS-this.player.s)<18&&this.player.speed>2){this.routeChoices={};return}if(this.time<this.nextRouteChoices&&this.routeChoicesOrigin&&s(this.player,this.routeChoicesOrigin)<10)return;this.nextRouteChoices=this.time+4,this.routeChoicesOrigin={x:this.player.x,z:this.player.z};let t=Zt(this.world,this.player,this.destinationApproach,this.destinationPoint),n=this.player.route.ids.join(`,`),r=t[0];if(this.routeChoices={},!r)return;let i=t.filter(e=>!n.endsWith(e.route.ids.join(`,`))&&e.distance<r.distance+5);for(let e of i){let t=e.route.ids.slice(0,3).join(`_`);if(!this.routeChoices[t]&&(this.routeChoices[t]=e,Object.keys(this.routeChoices).length===3))break}}chooseRoute(e){if(!this.routeChoiceNeeded())return!1;let t=this.routeChoices[e];if(!t||!this.routeChoicesOrigin||s(this.player,this.routeChoicesOrigin)>12)return!1;let n=this.crossingFor(this.player);if(n&&Math.abs(n.stopS-this.player.s)<18&&this.player.speed>2)return!1;let r=t.route.points.filter(e=>e.s<=t.progress+60),i=p(this.player,r.length>1?r:t.route.points).s;return this.installRoute({...t,progress:i})?(this.routeChoices={},this.nextRouteChoices=this.time+20,this.routeHoldUntil=this.time+20,!0):!1}globalNavigation(){this.refreshRouteChoices();let e=this.player,t=(e,t,n,r=0)=>({via:e.ids,remaining_m:o(t,1),join_distance_m:o(n,1),heading_change_deg:o(r*180/Math.PI,1)});return{coordinates:`World meters: x east, z south; heading 0 north, 90 east`,position:{x:o(e.x,1),z:o(e.z,1),heading_deg:o(e.heading*180/Math.PI,1)},destination:{node:this.world.destination,x:this.destinationPoint.x,z:this.destinationPoint.z},junctions:this.world.nodes.map(e=>({id:e.id,x:e.x,z:e.z,control:e.control})),roads:this.world.edges.map(e=>[e.a,e.b,e.width,!!e.oneWay,e.speedLimit,e.kind??`street`]),road_fields:[`from`,`to`,`width_m`,`one_way`,`speed_limit_mps`,`kind`],stopped_traffic:this.world.nodes.flatMap(e=>{let t=this.traffic.filter(t=>t.waitingSince!=null&&this.time-t.waitingSince>6&&s(t,e)<24);return t.length?[{junction:e.id,vehicles:t.length}]:[]}),routes:{keep:t(e.route,e.route.length-e.s,p(e,e.route.points).distance),...Object.fromEntries(Object.entries(this.routeChoices).map(([e,n])=>[e,t(n.route,n.route.length-n.progress,n.distance,n.relativeHeading)]))}}}navigation(){let e=this.player,t=p(e,e.route.points),n=m(e.route.points,e.s+Math.max(5,Math.abs(e.speed)*1.1)),r=this.crossingFor(e),i=r?c(r.exit-r.approach):0,a=r?Math.abs(i)>3?`uturn`:Math.abs(i)<.3?`straight`:i>0?`right`:`left`:`arrive`,s=ee(e,t.s),u={local:[r?.nodeId===`mill-interchange`&&a===`left`?`Turn left onto the Interstate 08 entrance`:[`left`,`right`].includes(a)?`Turn ${a} through Millbrook`:`Continue through Millbrook`,a],ramp_turn:[`Take the Interstate 08 North on-ramp`,`left`],onramp:[`Join the acceleration lane`,`merge`],merge:[`Merge onto Interstate 08`,`merge`],interstate:[`Take the Cedar Town exit`,`exit`],exit:[`Follow the Cedar Town off-ramp`,`exit`],offramp:[`Enter Cedar Town`,`straight`],town:[`Stop at the town destination`,`arrive`]};return{remaining_m:o(Math.max(0,e.route.length-e.s)),route_version:this.routeVersion,rerouted:this.time-this.lastReroute<3,route_offset_m:o(t.distance),heading_error_deg:o(c(l(e,n)-e.heading)*180/Math.PI),lookahead:{x:o(n.x),z:o(n.z)},next_turn:a,turn_distance_m:o(r?Math.max(0,r.stopS-e.s+10):e.route.length-e.s),destination:{id:this.world.destination,...e.route.points.at(-1)},...s?{phase:s.kind,instruction:u[s.kind][0],road_name:s.name,speed_limit_mps:s.speedLimit,next_turn:u[s.kind][1],turn_distance_m:o(Math.max(0,r&&[`local`,`ramp_turn`].includes(s.kind)?r.stopS-t.s+10:s.endS-t.s))}:{}}}steeringCandidates(){let e=this.decisionState();return Object.fromEntries(Object.entries(e.vectors).map(([e,t])=>[e,{...t,axis:t.steering,tracking_error:t.route_error_m}]))}scanScene(){let e=this.player,t=Math.max(80,Math.abs(e.speed)*6),n=this.world.objects.filter(e=>e.type===`building`),r=[];for(let i of[...this.traffic,...this.pedestrians,...this.world.objects]){if(![`car`,`motorcycle`,`pedestrian`,`building`,`stop_sign`,`traffic_light`].includes(i.type))continue;let a=i.x-e.x,s=i.z-e.z,c=a*Math.sin(e.heading)-s*Math.cos(e.heading),l=a*Math.cos(e.heading)+s*Math.sin(e.heading),u=Math.hypot(a,s),d=[`car`,`motorcycle`,`pedestrian`].includes(i.type);if(u>t||!d&&Math.abs(Math.atan2(l,c))>65*Math.PI/180||g(e,i,n,i.id))continue;let f=this.discovered.get(i.id);this.discovered.set(i.id,{first_seen_s:f?.first_seen_s??o(this.time,1),last_seen_s:o(this.time,1),type:i.type}),r.push({id:i.id,type:i.type,ahead_m:o(c,1),right_m:o(l,1),speed_mps:o(i.speed||0,1),...d?pt(e,i):{},...i.type===`traffic_light`?{signal:ft(this.world.byId[i.nodeId],this.time,i.approach).color}:{},...i.type===`pedestrian`?{crossing:i.crossing&&i.walking}:{}})}this.perception=r.sort((e,t)=>Math.hypot(e.ahead_m,e.right_m)-Math.hypot(t.ahead_m,t.right_m)),this.sensorRange=t}decisionContextChanged(e){let t=e.scene?.intersection,n=this.crossingFor(this.player);if((t?.node_id??null)!==(n?.nodeId??null))return!0;if(!n)return!1;let r=this.rule(this.player),i=this.intersectionStopMemory(n);return t.signal!==null&&t.signal!==r.color||t.stop_completed!==r.stopCompleted||t.already_entered!==r.distance<-.7||(t.stop_memory?.stops_on_this_approach??0)!==(i?.stops_on_this_approach??0)}decisionState(){this.scanScene();let e=this.navigation(),t=this.speedEnvelope(this.player),n=new Set(this.perception.map(e=>e.id)),r=ht(this.player,this.traffic.filter(e=>n.has(e.id))),i=this.perception.filter(e=>[`car`,`motorcycle`,`pedestrian`].includes(e.type)).sort((e,n)=>Number(n.id===t.conflict?.object_id||n.id===t.lead?.other.id||n.id===r?.vehicle_id)-Number(e.id===t.conflict?.object_id||e.id===t.lead?.other.id||e.id===r?.vehicle_id)).slice(0,10),a=this.crossingFor(this.player),s=a&&this.perception.some(e=>this.world.objects.find(t=>t.id===e.id)?.nodeId===a.nodeId),c=D(this.player),l=e.phase?1/0:Math.abs(e.heading_error_deg)>15||[`left`,`right`].includes(e.next_turn)&&e.turn_distance_m<24?e.next_turn===`right`?7:8:[`left`,`right`].includes(e.next_turn)&&e.turn_distance_m<48?12:this.world.theme.limit,u=o(Math.min(t.planningMax,c?.speed_limit_mps??1/0,l),1),d=Kt(this.player,this.world,[...this.world.objects.filter(e=>e.type===`building`),...this.traffic,...this.pedestrians],this.planRandom,`b${++this.planSequence}`,u,t.rule);this.lastPlan=d;let{drivable_polygons:f,...p}=d.road,m={batch_id:d.batch_id,route_version:this.routeVersion,global:this.globalNavigation(),driving_style:{name:`aggressive`,description:`An aggressive, decisive driver who actively wants to make forward progress. Prefer the fastest useful maneuver and take available gaps promptly. Slowing down still means driving; a full stop needs a concrete current reason.`,rules:[`A full-stop choice is offered only within 2.5 meters of a blocking object or a required stop line, at the destination, or when no eligible moving path exists. Otherwise choose a moving vector, reducing speed as needed. Uncertainty alone is not a reason to stop.`,`When stopping behind a blocking object, close to within 2 meters bumper-to-object before coming to rest when space permits. Slow earlier as needed; do not park several car lengths back. An imminent collision can require braking sooner.`,`For stop signs and red lights, stop right at the line with the front bumper about 0.5 meters before it, not farther back. A distant red light or stop sign is a reason to approach, not to stop immediately.`,`Use a stop_at_line moving vector to approach an unserved stop sign or red light. It carries speed toward the line and then stops there; do not wait until 2.5 meters away to begin slowing. Once the stop is served or the light is green, choose a continuing path when clear.`,`Remember a completed stop on this approach. Advance after an early stop, and proceed once the required stop is complete and the actual path is clear. Do not repeatedly stop for the same sign.`,`At green lights or after a completed stop, move decisively through the junction. Yield only to actual conflicting priority traffic. Do not wait for the whole intersection to become empty.`,`Accelerate along a clear on-ramp, match interstate traffic speed while merging, then accelerate to the cruising limit. A ramp-to-merge boundary is a continuous road, not a stop or a U-turn. Slow to fit behind another vehicle only when there is an actual merging conflict.`,`A close or closing follower behind should motivate faster forward progress when the road ahead allows it. Traffic behind, alongside, or in the opposite lane is not itself a reason to brake.`,`Stay in the right-hand lane, follow a normal traffic queue without passing, and use current signal and collision information. Later hypothetical conflicts are warnings to reassess, not immediate stop commands.`]},speed_mps:o(this.player.speed,1),braking:{max_deceleration_mps2:8,stopping_distance_m:o(this.player.speed**2/16,1),comfortable_stopping_distance_m:o(this.player.speed**2/7,1),decision_allowance_m:o(Math.abs(this.player.speed)*.35,1)},limit_mps:e.speed_limit_mps??this.world.theme.limit,speed_ceiling_mps:d.speedCap,speed_constraints:{traffic_and_destination_cap_mps:o(t.planningMax,1),required_stop_approach:d.stopApproach,uturn_approach:c?{curve_ahead_m:o(c.distance_m,1),approach_cap_mps:o(c.speed_limit_mps,1),curve_speed_mps:3}:null},road:d.recovery.active?d.road:p,lane:d.lane,traffic:{queue:d.queue,rear_pressure:r,stopped_for_s:o(this.player.waitingSince==null?0:this.time-this.player.waitingSince,1),deadlock_release:t.released},recovery:d.recovery,bend_deg:o(Math.abs(e.heading_error_deg),1),destination_m:o(e.remaining_m,1),turn:{direction:e.next_turn,in_m:o(e.turn_distance_m,1)},...e.phase?{trip:{phase:e.phase,instruction:e.instruction,road:e.road_name}}:{},scene:{blocking_object:d.blockingObject,observed_at_s:o(this.time,2),coordinates:`Car-relative meters: ahead_m is positive ahead and negative behind; right_m is positive to the right. heading_relative_deg=0 is the same direction, 180 is oncoming. Positive relative_velocity_ahead_mps means moving forward relative to this car.`,traffic_view_deg:360,range_m:Math.round(this.sensorRange),intersection:a?{node_id:a.nodeId,control:this.world.byId[a.nodeId].control,signal:s?t.rule.color:null,visible:!!s,stop_line_ahead_m:o(y(this.player,d.stopLine),1),stop_line_position:{x:o(d.stopLine.x,1),z:o(d.stopLine.z,1)},already_entered:t.rule.distance<-.7,stop_completed:t.rule.stopCompleted,stop_dwell_s:nn,stop_memory:this.intersectionStopMemory(a),earlier_arrivals:this.traffic.filter(e=>{let t=e.stops[a.nodeId];return t&&!t.passed&&this.crossingFor(e)?.nodeId===a.nodeId&&t.arrived<(this.player.stops[a.nodeId]?.arrived??1/0)}).map(e=>e.id)}:null,nearby:i,...t.lead&&t.gap<this.sensorRange?{following:{id:t.lead.other.id,gap_m:o(t.gap,1),minimum_gap_m:o(yt(this.player,t.lead.other),1)}}:{},...t.conflict?{hazard:{id:t.conflict.object_id,type:t.conflict.type,applies_to:`current_maneuver`,in_s:o(t.conflict.time_s,1),ahead_m:t.conflict.ahead_m,right_m:t.conflict.right_m,relative_position:t.conflict.relative_position,distance_along_path_m:o(t.conflict.distance_along_path_m,1),braking_reduces_risk:t.conflict.braking_reduces_risk}}:{}},vectors:d.vectors};if(m.stop_availability=ie(m),!m.stop_availability.available){m.vectors=Object.fromEntries(Object.entries(m.vectors).filter(([,e])=>e.velocity_mps!==0)),d.vectors=m.vectors;for(let e of Object.keys(d.projections))Object.hasOwn(m.vectors,e)||delete d.projections[e]}return d.eligible=ae(m),this.lastDecisionState=m,m}observation(e=!1){!this.lastPlan&&!this.backgroundPlanning&&this.decisionState();let t=this.player,n=this.world.objects.filter(e=>e.type===`building`),r=[...this.traffic,...this.pedestrians,...this.world.objects.filter(e=>e.type!==`parcel`)],i=[],a=[];for(let e of r){let r=e.x-t.x,c=e.z-t.z,l=s(t,e),u=r*Math.sin(t.heading)-c*Math.cos(t.heading),d=r*Math.cos(t.heading)+c*Math.sin(t.heading),f=Math.atan2(d,u)*180/Math.PI,p=[`car`,`motorcycle`,`pedestrian`].includes(e.type);if(!(l>80||!p&&Math.abs(f)>65)){if(g(t,e,n,e.id)){a.push(e.id);continue}i.push({id:e.id,type:e.type,position:{x:o(e.x),z:o(e.z)},distance_m:o(l),forward_m:o(u),right_m:o(d),bearing_deg:o(f),...p?pt(t,e):{},speed_mps:o(e.speed||0),heading_deg:e.heading===void 0?void 0:o(e.heading*180/Math.PI),dimensions:{width:e.width,depth:e.depth,height:e.height},style:e.style,signal:e.type===`traffic_light`?ft(this.world.byId[e.nodeId],this.time,e.approach).color:void 0,walking:e.walking})}}i.sort((e,t)=>e.distance_m-t.distance_m);let c=this.speedEnvelope(t),l={schema_version:`1.0`,frame:{time_s:o(this.time),seed:this.world.seed,environment:this.world.type,coordinates:`meters; +x east, +z south; heading 0 north; positive steering right`},ego:{position:{x:o(t.x),y:.4,z:o(t.z)},heading_deg:o(t.heading*180/Math.PI),speed_mps:o(t.speed),steering_axis:o(t.steering),velocity_axis_mps:o(t.target),applied_velocity_mps:o(t.appliedTarget??t.target),dimensions:{width:t.width,length:t.depth},control:this.autopilot?`jev`:`manual`,pedals:this.autopilot?null:{...this.pedals}},navigation:this.navigation(),road_rules:{drive_on:`right`,speed_limit_mps:ee(t,t.s)?.speedLimit??this.world.theme.limit,next_control:{...c.rule,distance:o(Number.isFinite(c.rule.distance)?c.rule.distance:999)},lead_vehicle_gap_m:Number.isFinite(c.gap)?o(c.gap):null,stop_dwell_s:nn,amber_rule:`Stop if there is sufficient braking distance; otherwise clear the intersection`},sensor:{horizontal_fov_deg:130,traffic_fov_deg:360,range_m:80,occlusion:`line of sight blocked by building footprints`,visible_count:i.length,occluded_count:a.length,visible_objects:i,discovered_objects:Object.fromEntries(this.discovered),live_nearby:this.perception},road:this.lastPlan?.road,recovery:this.lastPlan?.recovery,steering_candidates:this.lastPlan?.vectors||{},telemetry:{collisions:this.collisions,crash:this.crash,traffic_violations:this.violations,distance_driven_m:o(this.distance),arrived:this.complete,brake_intervention:this.brakeReason,predicted_conflict:c.conflict}};return e&&(l.world={bounds:this.world.bounds,start:this.world.route.points[0],destination:this.world.route.points.at(-1),junctions:this.world.nodes.map(e=>({...e,signal:ft(e,this.time,0)})),roads:this.world.edges,static_objects:this.world.objects,traffic_controls:this.world.objects.filter(e=>e.type===`traffic_light`||e.type===`stop_sign`).map(e=>({id:e.id,node_id:e.nodeId,approach_heading_deg:o(e.approach*180/Math.PI),state:e.type===`stop_sign`?{color:`stop`}:ft(this.world.byId[e.nodeId],this.time,e.approach)})),vehicles:this.traffic.map(({route:e,stops:t,...n})=>({...n,route_node_ids:e.ids})),pedestrians:this.pedestrians,planned_route:this.world.route,sensor_occluded_ids:a}),l}},an=class{constructor(){this.worker=new Worker(new URL(new URL(`planner.worker-DqkDwKRw.js`,import.meta.url).href,``+import.meta.url),{type:`module`}),this.pending=new Map,this.sequence=0,this.epoch=0,this.worker.onmessage=({data:e})=>{let t=this.pending.get(e.id);t&&(clearTimeout(t.timeout),this.pending.delete(e.id),e.error?t.reject(Error(e.error)):t.resolve(e.result))},this.worker.onerror=e=>{this.failure=Error(e.message||`Background planner unavailable`);for(let e of this.pending.values())clearTimeout(e.timeout),e.reject(this.failure);this.pending.clear()}}reset(){this.epoch++}run(e,t){if(this.failure)return Promise.reject(this.failure);let n=++this.sequence,r={time:t.time,player:t.player,traffic:t.traffic,pedestrians:t.pedestrians,perception:t.perception,sensorRange:t.sensorRange,locks:[...t.locks],courtesy:[...t.courtesy],freeExplore:t.freeExplore,complete:t.complete,autopilot:t.autopilot,routeVersion:t.routeVersion,destinationApproach:t.destinationApproach,destinationPoint:t.destinationPoint,offRouteSince:t.offRouteSince,lastReroute:t.lastReroute,routeHoldUntil:t.routeHoldUntil};return new Promise((i,a)=>{let o=setTimeout(()=>{this.pending.delete(n),a(Error(`Background planning timed out`))},8e3);this.pending.set(n,{resolve:i,reject:a,timeout:o});try{this.worker.postMessage({id:n,kind:e,key:`${this.epoch}:${t.world.type}:${t.world.seed}`,seed:t.world.seed,type:t.world.type,snapshot:r})}catch(e){clearTimeout(o),this.pending.delete(n),a(e)}})}dispose(){this.worker.terminate();for(let e of this.pending.values())clearTimeout(e.timeout),e.reject(Error(`Planner stopped`));this.pending.clear()}},on=`attached`,sn=1e3,cn=1001,ln=1002,un=1003,dn=1004,fn=1005,pn=1006,mn=1007,hn=1008,gn=1009,_n=1010,vn=1011,yn=1012,bn=1013,xn=1014,Sn=1015,Cn=1016,wn=1017,Tn=1018,En=1020,Dn=35902,On=35899,kn=1021,An=1022,jn=1023,Mn=1026,Nn=1027,Pn=1028,Fn=1029,In=1030,Ln=1031,Rn=1033,zn=33776,Bn=33777,Vn=33778,Hn=33779,Un=35840,Wn=35841,Gn=35842,Kn=35843,qn=36196,Jn=37492,Yn=37496,Xn=37488,Zn=37489,Qn=37490,$n=37491,er=37808,tr=37809,nr=37810,rr=37811,ir=37812,ar=37813,or=37814,sr=37815,cr=37816,lr=37817,ur=37818,dr=37819,fr=37820,pr=37821,mr=36492,hr=36494,gr=36495,_r=36283,vr=36284,yr=36285,br=36286,xr=2300,Sr=2301,Cr=2302,wr=2303,Tr=2400,Er=2401,Dr=2402,Or=2500,kr=3200,Ar=3201,jr=`srgb`,Mr=`srgb-linear`,Nr=`linear`,Pr=`srgb`,Fr=7680,Ir=35044,Lr=35048,Rr=2e3;function zr(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function Br(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Vr(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function Hr(){let e=Vr(`canvas`);return e.style.display=`block`,e}var Ur={};function Wr(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function Gr(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function L(...e){e=Gr(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function R(...e){e=Gr(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function Kr(...e){let t=e.join(` `);t in Ur||(Ur[t]=!0,L(...e))}function qr(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}var Jr={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3},Yr=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}},Xr=`00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`),Zr=1234567,Qr=Math.PI/180,$r=180/Math.PI;function ei(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Xr[e&255]+Xr[e>>8&255]+Xr[e>>16&255]+Xr[e>>24&255]+`-`+Xr[t&255]+Xr[t>>8&255]+`-`+Xr[t>>16&15|64]+Xr[t>>24&255]+`-`+Xr[n&63|128]+Xr[n>>8&255]+`-`+Xr[n>>16&255]+Xr[n>>24&255]+Xr[r&255]+Xr[r>>8&255]+Xr[r>>16&255]+Xr[r>>24&255]).toLowerCase()}function z(e,t,n){return Math.max(t,Math.min(n,e))}function ti(e,t){return(e%t+t)%t}function ni(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function ri(e,t,n){return e===t?0:(n-e)/(t-e)}function ii(e,t,n){return(1-n)*e+n*t}function ai(e,t,n,r){return ii(e,t,1-Math.exp(-n*r))}function oi(e,t=1){return t-Math.abs(ti(e,t*2)-t)}function si(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function ci(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function li(e,t){return e+Math.floor(Math.random()*(t-e+1))}function ui(e,t){return e+Math.random()*(t-e)}function di(e){return e*(.5-Math.random())}function fi(e){e!==void 0&&(Zr=e);let t=Zr+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function pi(e){return e*Qr}function mi(e){return e*$r}function hi(e){return!(e&e-1)&&e!==0}function gi(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function _i(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function vi(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:L(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function yi(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw Error(`Invalid component type.`)}}function bi(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw Error(`Invalid component type.`)}}var xi={DEG2RAD:Qr,RAD2DEG:$r,generateUUID:ei,clamp:z,euclideanModulo:ti,mapLinear:ni,inverseLerp:ri,lerp:ii,damp:ai,pingpong:oi,smoothstep:si,smootherstep:ci,randInt:li,randFloat:ui,randFloatSpread:di,seededRandom:fi,degToRad:pi,radToDeg:mi,isPowerOfTwo:hi,ceilPowerOfTwo:gi,floorPowerOfTwo:_i,setQuaternionFromProperEuler:vi,normalize:bi,denormalize:yi},B=class e{constructor(t=0,n=0){e.prototype.isVector2=!0,this.x=t,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(z(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Si=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:L(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(z(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},V=class e{constructor(t=0,n=0,r=0){e.prototype.isVector3=!0,this.x=t,this.y=n,this.z=r}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(wi.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(wi.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this.z=z(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this.z=z(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Ci.copy(this).projectOnVector(e),this.sub(Ci)}reflect(e){return this.sub(Ci.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(z(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ci=new V,wi=new Si,H=class e{constructor(t,n,r,i,a,o,s,c,l){e.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Ti.makeScale(e,t)),this}rotate(e){return this.premultiply(Ti.makeRotation(-e)),this}translate(e,t){return this.premultiply(Ti.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Ti=new H,Ei=new H().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Di=new H().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Oi(){let e={enabled:!0,workingColorSpace:Mr,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n?e:(this.spaces[t].transfer===`srgb`&&(e.r=ki(e.r),e.g=ki(e.g),e.b=ki(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=Ai(e.r),e.g=Ai(e.g),e.b=Ai(e.b)),e)},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?Nr:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[t].toXYZ).multiply(this.spaces[n].fromXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(t,n){return Kr(`ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().`),e.workingToColorSpace(t,n)},toWorkingColorSpace:function(t,n){return Kr(`ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().`),e.colorSpaceToWorking(t,n)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[Mr]:{primaries:t,whitePoint:r,transfer:Nr,toXYZ:Ei,fromXYZ:Di,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:jr},outputColorSpaceConfig:{drawingBufferColorSpace:jr}},[jr]:{primaries:t,whitePoint:r,transfer:Pr,toXYZ:Ei,fromXYZ:Di,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:jr}}}),e}var U=Oi();function ki(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function Ai(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}var ji,Mi=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{ji===void 0&&(ji=Vr(`canvas`)),ji.width=e.width,ji.height=e.height;let t=ji.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=ji}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=Vr(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=ki(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(ki(t[e]/255)*255):t[e]=ki(t[e]);return{data:t,width:e.width,height:e.height}}return L(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}},Ni=0,Pi=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Ni++}),this.uuid=ei(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t===null?e.set(0,0,0):e.set(t.width,t.height,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(Fi(r[t].image)):e.push(Fi(r[t]))}else e=Fi(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function Fi(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Mi.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(L(`Texture: Unable to serialize Texture.`),{})}var Ii=0,Li=new V,Ri=class e extends Yr{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,r=cn,i=cn,a=pn,o=hn,s=jn,c=gn,l=e.DEFAULT_ANISOTROPY,u=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ii++}),this.uuid=ei(),this.name=``,this.source=new Pi(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=i,this.magFilter=a,this.minFilter=o,this.anisotropy=l,this.format=s,this.internalFormat=null,this.type=c,this.offset=new B(0,0),this.repeat=new B(1,1),this.center=new B(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new H,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Li).x}get height(){return this.source.getSize(Li).y}get depth(){return this.source.getSize(Li).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){L(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){L(`Texture.setValues(): property '${t}' does not exist.`);continue}r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case sn:e.x-=Math.floor(e.x);break;case cn:e.x=e.x<0?0:1;break;case ln:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x-=Math.floor(e.x)}if(e.y<0||e.y>1)switch(this.wrapT){case sn:e.y-=Math.floor(e.y);break;case cn:e.y=e.y<0?0:1;break;case ln:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y-=Math.floor(e.y)}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Ri.DEFAULT_IMAGE=null,Ri.DEFAULT_MAPPING=300,Ri.DEFAULT_ANISOTROPY=1;var zi=class e{constructor(t=0,n=0,r=0,i=1){e.prototype.isVector4=!0,this.x=t,this.y=n,this.z=r,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=z(this.x,e.x,t.x),this.y=z(this.y,e.y,t.y),this.z=z(this.z,e.z,t.z),this.w=z(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=z(this.x,e,t),this.y=z(this.y,e,t),this.z=z(this.z,e,t),this.w=z(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(z(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Bi=class extends Yr{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:pn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new zi(0,0,e,t),this.scissorTest=!1,this.viewport=new zi(0,0,e,t),this.textures=[];let r=new Ri({width:e,height:t,depth:n.depth}),i=n.count;for(let e=0;e<i;e++)this.textures[e]=r.clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:pn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Pi(n)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:`dispose`})}},Vi=class extends Bi{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Hi=class extends Ri{constructor(e=null,t=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=un,this.minFilter=un,this.wrapR=cn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Ui=class extends Ri{constructor(e=null,t=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:r},this.magFilter=un,this.minFilter=un,this.wrapR=cn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},W=class e{constructor(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g){e.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,r,i,a,o,s,c,l,u,d,f,p,m,h,g)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinant()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();let t=this.elements,n=e.elements,r=1/Wi.setFromMatrixColumn(e,0).length(),i=1/Wi.setFromMatrixColumn(e,1).length(),a=1/Wi.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Ki,e,qi)}lookAt(e,t,n){let r=this.elements;return Xi.subVectors(e,t),Xi.lengthSq()===0&&(Xi.z=1),Xi.normalize(),Ji.crossVectors(n,Xi),Ji.lengthSq()===0&&(Math.abs(n.z)===1?Xi.x+=1e-4:Xi.z+=1e-4,Xi.normalize(),Ji.crossVectors(n,Xi)),Ji.normalize(),Yi.crossVectors(Xi,Ji),r[0]=Ji.x,r[4]=Yi.x,r[8]=Xi.x,r[1]=Ji.y,r[5]=Yi.y,r[9]=Xi.y,r[2]=Ji.z,r[6]=Yi.z,r[10]=Xi.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],ee=r[2],k=r[6],A=r[10],te=r[14],j=r[3],ne=r[7],re=r[11],ie=r[15];return i[0]=a*x+o*T+s*ee+c*j,i[4]=a*S+o*E+s*k+c*ne,i[8]=a*C+o*D+s*A+c*re,i[12]=a*w+o*O+s*te+c*ie,i[1]=l*x+u*T+d*ee+f*j,i[5]=l*S+u*E+d*k+f*ne,i[9]=l*C+u*D+d*A+f*re,i[13]=l*w+u*O+d*te+f*ie,i[2]=p*x+m*T+h*ee+g*j,i[6]=p*S+m*E+h*k+g*ne,i[10]=p*C+m*D+h*A+g*re,i[14]=p*w+m*O+h*te+g*ie,i[3]=_*x+v*T+y*ee+b*j,i[7]=_*S+v*E+y*k+b*ne,i[11]=_*C+v*D+y*A+b*re,i[15]=_*w+v*O+y*te+b*ie,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,ee=_*O-v*D+y*E+b*T-x*w+S*C;if(ee===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let k=1/ee;return e[0]=(o*O-s*D+c*E)*k,e[1]=(r*D-n*O-i*E)*k,e[2]=(m*S-h*x+g*b)*k,e[3]=(d*x-u*S-f*b)*k,e[4]=(s*T-a*O-c*w)*k,e[5]=(t*O-r*T+i*w)*k,e[6]=(h*y-p*S-g*v)*k,e[7]=(l*S-d*y+f*v)*k,e[8]=(a*D-o*T+c*C)*k,e[9]=(n*T-t*D-i*C)*k,e[10]=(p*x-m*y+g*_)*k,e[11]=(u*y-l*x-f*_)*k,e[12]=(o*w-a*E-s*C)*k,e[13]=(t*E-n*w+r*C)*k,e[14]=(m*v-p*b-h*_)*k,e[15]=(l*b-u*v+d*_)*k,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinant();if(i===0)return n.set(1,1,1),t.identity(),this;let a=Wi.set(r[0],r[1],r[2]).length(),o=Wi.set(r[4],r[5],r[6]).length(),s=Wi.set(r[8],r[9],r[10]).length();i<0&&(a=-a),Gi.copy(this);let c=1/a,l=1/o,u=1/s;return Gi.elements[0]*=c,Gi.elements[1]*=c,Gi.elements[2]*=c,Gi.elements[4]*=l,Gi.elements[5]*=l,Gi.elements[6]*=l,Gi.elements[8]*=u,Gi.elements[9]*=u,Gi.elements[10]*=u,t.setFromRotationMatrix(Gi),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=Rr,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=Rr,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},Wi=new V,Gi=new W,Ki=new V(0,0,0),qi=new V(1,1,1),Ji=new V,Yi=new V,Xi=new V,Zi=new W,Qi=new Si,$i=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(z(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-z(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(z(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-z(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(z(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-z(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:L(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Zi.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Zi,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Qi.setFromEuler(this),this.setFromQuaternion(Qi,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};$i.DEFAULT_ORDER=`XYZ`;var ea=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&(1<<e|0))}},ta=0,na=new V,ra=new Si,ia=new W,aa=new V,oa=new V,sa=new V,ca=new Si,la=new V(1,0,0),ua=new V(0,1,0),da=new V(0,0,1),fa={type:`added`},pa={type:`removed`},ma={type:`childadded`,child:null},ha={type:`childremoved`,child:null},ga=class e extends Yr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:ta++}),this.uuid=ei(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new V,n=new $i,r=new Si,i=new V(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new W},normalMatrix:{value:new H}}),this.matrix=new W,this.matrixWorld=new W,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ea,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ra.setFromAxisAngle(e,t),this.quaternion.multiply(ra),this}rotateOnWorldAxis(e,t){return ra.setFromAxisAngle(e,t),this.quaternion.premultiply(ra),this}rotateX(e){return this.rotateOnAxis(la,e)}rotateY(e){return this.rotateOnAxis(ua,e)}rotateZ(e){return this.rotateOnAxis(da,e)}translateOnAxis(e,t){return na.copy(e).applyQuaternion(this.quaternion),this.position.add(na.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(la,e)}translateY(e){return this.translateOnAxis(ua,e)}translateZ(e){return this.translateOnAxis(da,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ia.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?aa.copy(e):aa.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),oa.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ia.lookAt(oa,aa,this.up):ia.lookAt(aa,oa,this.up),this.quaternion.setFromRotationMatrix(ia),r&&(ia.extractRotation(r.matrixWorld),ra.setFromRotationMatrix(ia),this.quaternion.premultiply(ra.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(R(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(fa),ma.child=e,this.dispatchEvent(ma),ma.child=null):R(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(pa),ha.child=e,this.dispatchEvent(ha),ha.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ia.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ia.multiply(e.parent.matrixWorld)),e.applyMatrix4(ia),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(fa),ma.child=e,this.dispatchEvent(ma),ma.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(oa,e,sa),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(oa,ca,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let e=this.children;for(let t=0,n=e.length;t<n;t++)e[t].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,this.name!==``&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),this.static!==!1&&(r.static=this.static),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),e.pivot!==null&&(this.pivot=e.pivot.clone()),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}};ga.DEFAULT_UP=new V(0,1,0),ga.DEFAULT_MATRIX_AUTO_UPDATE=!0,ga.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var _a=class extends ga{constructor(){super(),this.isGroup=!0,this.type=`Group`}},va={type:`move`},ya=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new _a,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new _a,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new V,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new V),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new _a,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new V,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new V),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.rotation,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.rotation,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(va)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new _a;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},ba={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},xa={h:0,s:0,l:0},Sa={h:0,s:0,l:0};function Ca(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var G=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=jr){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,U.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=U.workingColorSpace){return this.r=e,this.g=t,this.b=n,U.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=U.workingColorSpace){if(e=ti(e,1),t=z(t,0,1),n=z(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=Ca(i,r,e+1/3),this.g=Ca(i,r,e),this.b=Ca(i,r,e-1/3)}return U.colorSpaceToWorking(this,r),this}setStyle(e,t=jr){function n(t){t!==void 0&&parseFloat(t)<1&&L(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseInt(i[1],10))/100,Math.min(100,parseInt(i[2],10))/100,Math.min(100,parseInt(i[3],10))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:L(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);L(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=jr){let n=ba[e.toLowerCase()];return n===void 0?L(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ki(e.r),this.g=ki(e.g),this.b=ki(e.b),this}copyLinearToSRGB(e){return this.r=Ai(e.r),this.g=Ai(e.g),this.b=Ai(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=jr){return U.workingToColorSpace(wa.copy(this),e),Math.round(z(wa.r*255,0,255))*65536+Math.round(z(wa.g*255,0,255))*256+Math.round(z(wa.b*255,0,255))}getHexString(e=jr){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=U.workingColorSpace){U.workingToColorSpace(wa.copy(this),t);let n=wa.r,r=wa.g,i=wa.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=U.workingColorSpace){return U.workingToColorSpace(wa.copy(this),t),e.r=wa.r,e.g=wa.g,e.b=wa.b,e}getStyle(e=jr){U.workingToColorSpace(wa.copy(this),e);let t=wa.r,n=wa.g,r=wa.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(xa),this.setHSL(xa.h+e,xa.s+t,xa.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(xa),e.getHSL(Sa);let n=ii(xa.h,Sa.h,t),r=ii(xa.s,Sa.s,t),i=ii(xa.l,Sa.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},wa=new G;G.NAMES=ba;var Ta=class e{constructor(e,t=1,n=1e3){this.isFog=!0,this.name=``,this.color=new G(e),this.near=t,this.far=n}clone(){return new e(this.color,this.near,this.far)}toJSON(){return{type:`Fog`,name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Ea=class extends ga{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new $i,this.environmentIntensity=1,this.environmentRotation=new $i,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}},Da=new V,Oa=new V,ka=new V,Aa=new V,ja=new V,Ma=new V,Na=new V,Pa=new V,Fa=new V,Ia=new V,La=new zi,Ra=new zi,za=new zi,Ba=class e{constructor(e=new V,t=new V,n=new V){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Da.subVectors(e,t),r.cross(Da);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){Da.subVectors(r,t),Oa.subVectors(n,t),ka.subVectors(e,t);let a=Da.dot(Da),o=Da.dot(Oa),s=Da.dot(ka),c=Oa.dot(Oa),l=Oa.dot(ka),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Aa)!==null&&Aa.x>=0&&Aa.y>=0&&Aa.x+Aa.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Aa)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Aa.x),s.addScaledVector(a,Aa.y),s.addScaledVector(o,Aa.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return La.setScalar(0),Ra.setScalar(0),za.setScalar(0),La.fromBufferAttribute(e,t),Ra.fromBufferAttribute(e,n),za.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(La,i.x),a.addScaledVector(Ra,i.y),a.addScaledVector(za,i.z),a}static isFrontFacing(e,t,n,r){return Da.subVectors(n,t),Oa.subVectors(e,t),Da.cross(Oa).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Da.subVectors(this.c,this.b),Oa.subVectors(this.a,this.b),Da.cross(Oa).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;ja.subVectors(r,n),Ma.subVectors(i,n),Pa.subVectors(e,n);let s=ja.dot(Pa),c=Ma.dot(Pa);if(s<=0&&c<=0)return t.copy(n);Fa.subVectors(e,r);let l=ja.dot(Fa),u=Ma.dot(Fa);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0)return a=s/(s-l),t.copy(n).addScaledVector(ja,a);Ia.subVectors(e,i);let f=ja.dot(Ia),p=Ma.dot(Ia);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(Ma,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Na.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Na,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(ja,a).addScaledVector(Ma,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Va=class{constructor(e=new V(1/0,1/0,1/0),t=new V(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Ua.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Ua.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Ua.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Ua):Ua.fromBufferAttribute(r,t),Ua.applyMatrix4(e.matrixWorld),this.expandByPoint(Ua);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Wa.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Wa.copy(e.boundingBox)),Wa.applyMatrix4(e.matrixWorld),this.union(Wa)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Ua),Ua.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Za),Qa.subVectors(this.max,Za),Ga.subVectors(e.a,Za),Ka.subVectors(e.b,Za),qa.subVectors(e.c,Za),Ja.subVectors(Ka,Ga),Ya.subVectors(qa,Ka),Xa.subVectors(Ga,qa);let t=[0,-Ja.z,Ja.y,0,-Ya.z,Ya.y,0,-Xa.z,Xa.y,Ja.z,0,-Ja.x,Ya.z,0,-Ya.x,Xa.z,0,-Xa.x,-Ja.y,Ja.x,0,-Ya.y,Ya.x,0,-Xa.y,Xa.x,0];return!to(t,Ga,Ka,qa,Qa)||(t=[1,0,0,0,1,0,0,0,1],!to(t,Ga,Ka,qa,Qa))?!1:($a.crossVectors(Ja,Ya),t=[$a.x,$a.y,$a.z],to(t,Ga,Ka,qa,Qa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Ua).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Ua).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ha[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ha[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ha[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ha[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ha[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ha[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ha[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ha[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ha),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Ha=[new V,new V,new V,new V,new V,new V,new V,new V],Ua=new V,Wa=new Va,Ga=new V,Ka=new V,qa=new V,Ja=new V,Ya=new V,Xa=new V,Za=new V,Qa=new V,$a=new V,eo=new V;function to(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){eo.fromArray(e,a);let o=i.x*Math.abs(eo.x)+i.y*Math.abs(eo.y)+i.z*Math.abs(eo.z),s=t.dot(eo),c=n.dot(eo),l=r.dot(eo);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}var no=ro();function ro(){let e=new ArrayBuffer(4),t=new Float32Array(e),n=new Uint32Array(e),r=new Uint32Array(512),i=new Uint32Array(512);for(let e=0;e<256;++e){let t=e-127;t<-27?(r[e]=0,r[e|256]=32768,i[e]=24,i[e|256]=24):t<-14?(r[e]=1024>>-t-14,r[e|256]=1024>>-t-14|32768,i[e]=-t-1,i[e|256]=-t-1):t<=15?(r[e]=t+15<<10,r[e|256]=t+15<<10|32768,i[e]=13,i[e|256]=13):t<128?(r[e]=31744,r[e|256]=64512,i[e]=24,i[e|256]=24):(r[e]=31744,r[e|256]=64512,i[e]=13,i[e|256]=13)}let a=new Uint32Array(2048),o=new Uint32Array(64),s=new Uint32Array(64);for(let e=1;e<1024;++e){let t=e<<13,n=0;for(;!(t&8388608);)t<<=1,n-=8388608;t&=-8388609,n+=947912704,a[e]=t|n}for(let e=1024;e<2048;++e)a[e]=939524096+(e-1024<<13);for(let e=1;e<31;++e)o[e]=e<<23;o[31]=1199570944,o[32]=2147483648;for(let e=33;e<63;++e)o[e]=2147483648+(e-32<<23);o[63]=3347054592;for(let e=1;e<64;++e)e!==32&&(s[e]=1024);return{floatView:t,uint32View:n,baseTable:r,shiftTable:i,mantissaTable:a,exponentTable:o,offsetTable:s}}function io(e){Math.abs(e)>65504&&L(`DataUtils.toHalfFloat(): Value out of range.`),e=z(e,-65504,65504),no.floatView[0]=e;let t=no.uint32View[0],n=t>>23&511;return no.baseTable[n]+((t&8388607)>>no.shiftTable[n])}function ao(e){let t=e>>10;return no.uint32View[0]=no.mantissaTable[no.offsetTable[t]+(e&1023)]+no.exponentTable[t],no.floatView[0]}var oo=class{static toHalfFloat(e){return io(e)}static fromHalfFloat(e){return ao(e)}},so=new V,co=new B,lo=0,uo=class{constructor(e,t,n=!1){if(Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:lo++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=Ir,this.updateRanges=[],this.gpuType=Sn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)co.fromBufferAttribute(this,t),co.applyMatrix3(e),this.setXY(t,co.x,co.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)so.fromBufferAttribute(this,t),so.applyMatrix3(e),this.setXYZ(t,so.x,so.y,so.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)so.fromBufferAttribute(this,t),so.applyMatrix4(e),this.setXYZ(t,so.x,so.y,so.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)so.fromBufferAttribute(this,t),so.applyNormalMatrix(e),this.setXYZ(t,so.x,so.y,so.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)so.fromBufferAttribute(this,t),so.transformDirection(e),this.setXYZ(t,so.x,so.y,so.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=yi(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=bi(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=yi(t,this.array)),t}setX(e,t){return this.normalized&&(t=bi(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=yi(t,this.array)),t}setY(e,t){return this.normalized&&(t=bi(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=yi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=bi(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=yi(t,this.array)),t}setW(e,t){return this.normalized&&(t=bi(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=bi(t,this.array),n=bi(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=bi(t,this.array),n=bi(n,this.array),r=bi(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=bi(t,this.array),n=bi(n,this.array),r=bi(r,this.array),i=bi(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==``&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}},fo=class extends uo{constructor(e,t,n){super(new Uint16Array(e),t,n)}},po=class extends uo{constructor(e,t,n){super(new Uint32Array(e),t,n)}},mo=class extends uo{constructor(e,t,n){super(new Float32Array(e),t,n)}},ho=new Va,go=new V,_o=new V,vo=class{constructor(e=new V,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?ho.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;go.subVectors(e,this.center);let t=go.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(go,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(_o.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(go.copy(e.center).add(_o)),this.expandByPoint(go.copy(e.center).sub(_o))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},yo=0,bo=new W,xo=new ga,So=new V,Co=new Va,wo=new Va,To=new V,Eo=class e extends Yr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:yo++}),this.uuid=ei(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(zr(e)?po:fo)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new H().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return bo.makeRotationFromQuaternion(e),this.applyMatrix4(bo),this}rotateX(e){return bo.makeRotationX(e),this.applyMatrix4(bo),this}rotateY(e){return bo.makeRotationY(e),this.applyMatrix4(bo),this}rotateZ(e){return bo.makeRotationZ(e),this.applyMatrix4(bo),this}translate(e,t,n){return bo.makeTranslation(e,t,n),this.applyMatrix4(bo),this}scale(e,t,n){return bo.makeScale(e,t,n),this.applyMatrix4(bo),this}lookAt(e){return xo.lookAt(e),xo.updateMatrix(),this.applyMatrix4(xo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(So).negate(),this.translate(So.x,So.y,So.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new mo(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&L(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Va);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){R(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new V(-1/0,-1/0,-1/0),new V(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Co.setFromBufferAttribute(n),this.morphTargetsRelative?(To.addVectors(this.boundingBox.min,Co.min),this.boundingBox.expandByPoint(To),To.addVectors(this.boundingBox.max,Co.max),this.boundingBox.expandByPoint(To)):(this.boundingBox.expandByPoint(Co.min),this.boundingBox.expandByPoint(Co.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&R(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new vo);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){R(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new V,1/0);return}if(e){let n=this.boundingSphere.center;if(Co.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];wo.setFromBufferAttribute(n),this.morphTargetsRelative?(To.addVectors(Co.min,wo.min),Co.expandByPoint(To),To.addVectors(Co.max,wo.max),Co.expandByPoint(To)):(Co.expandByPoint(wo.min),Co.expandByPoint(wo.max))}Co.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)To.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(To));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)To.fromBufferAttribute(a,t),o&&(So.fromBufferAttribute(e,t),To.add(So)),r=Math.max(r,n.distanceToSquared(To))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&R(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){R(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv;this.hasAttribute(`tangent`)===!1&&this.setAttribute(`tangent`,new uo(new Float32Array(4*n.count),4));let a=this.getAttribute(`tangent`),o=[],s=[];for(let e=0;e<n.count;e++)o[e]=new V,s[e]=new V;let c=new V,l=new V,u=new V,d=new B,f=new B,p=new B,m=new V,h=new V;function g(e,t,r){c.fromBufferAttribute(n,e),l.fromBufferAttribute(n,t),u.fromBufferAttribute(n,r),d.fromBufferAttribute(i,e),f.fromBufferAttribute(i,t),p.fromBufferAttribute(i,r),l.sub(c),u.sub(c),f.sub(d),p.sub(d);let a=1/(f.x*p.y-p.x*f.y);isFinite(a)&&(m.copy(l).multiplyScalar(p.y).addScaledVector(u,-f.y).multiplyScalar(a),h.copy(u).multiplyScalar(f.x).addScaledVector(l,-p.x).multiplyScalar(a),o[e].add(m),o[t].add(m),o[r].add(m),s[e].add(h),s[t].add(h),s[r].add(h))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)g(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let v=new V,y=new V,b=new V,x=new V;function S(e){b.fromBufferAttribute(r,e),x.copy(b);let t=o[e];v.copy(t),v.sub(b.multiplyScalar(b.dot(t))).normalize(),y.crossVectors(x,t);let n=y.dot(s[e])<0?-1:1;a.setXYZW(e,v.x,v.y,v.z,n)}for(let t=0,n=_.length;t<n;++t){let n=_[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)S(e.getX(t+0)),S(e.getX(t+1)),S(e.getX(t+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0)n=new uo(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new V,i=new V,a=new V,o=new V,s=new V,c=new V,l=new V,u=new V;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)To.fromBufferAttribute(e,t),To.normalize(),e.setXYZ(t,To.x,To.y,To.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new uo(a,r,i)}if(this.index===null)return L(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.type,this.name!==``&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:`dispose`})}},Do=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e===void 0?0:e.length/t,this.usage=Ir,this.updateRanges=[],this.version=0,this.uuid=ei()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let r=0,i=this.stride;r<i;r++)this.array[e+r]=t.array[n+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ei()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ei()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Oo=new V,ko=class e{constructor(e,t,n,r=!1){this.isInterleavedBufferAttribute=!0,this.name=``,this.data=e,this.itemSize=t,this.offset=n,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Oo.fromBufferAttribute(this,t),Oo.applyMatrix4(e),this.setXYZ(t,Oo.x,Oo.y,Oo.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Oo.fromBufferAttribute(this,t),Oo.applyNormalMatrix(e),this.setXYZ(t,Oo.x,Oo.y,Oo.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Oo.fromBufferAttribute(this,t),Oo.transformDirection(e),this.setXYZ(t,Oo.x,Oo.y,Oo.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=yi(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=bi(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=bi(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=bi(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=bi(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=bi(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=yi(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=yi(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=yi(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=yi(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=bi(t,this.array),n=bi(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=bi(t,this.array),n=bi(n,this.array),r=bi(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=bi(t,this.array),n=bi(n,this.array),r=bi(r,this.array),i=bi(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=r,this.data.array[e+3]=i,this}clone(t){if(t===void 0){Wr(`InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return new uo(new this.array.constructor(e),this.itemSize,this.normalized)}return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new e(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Wr(`InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.`);let e=[];for(let t=0;t<this.count;t++){let n=t*this.data.stride+this.offset;for(let t=0;t<this.itemSize;t++)e.push(this.data.array[n+t])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Ao=0,jo=class extends Yr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ao++}),this.uuid=ei(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new G(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Fr,this.stencilZFail=Fr,this.stencilZPass=Fr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){L(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){L(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,this.name!==``&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(n.blending=this.blending),this.side!==0&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==204&&(n.blendSrc=this.blendSrc),this.blendDst!==205&&(n.blendDst=this.blendDst),this.blendEquation!==100&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(n.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==`round`&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==`round`&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}},Mo=new V,No=new V,Po=new V,Fo=new V,Io=new V,Lo=new V,Ro=new V,zo=class{constructor(e=new V,t=new V(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Mo)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Mo.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Mo.copy(this.origin).addScaledVector(this.direction,t),Mo.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){No.copy(e).add(t).multiplyScalar(.5),Po.copy(t).sub(e).normalize(),Fo.copy(this.origin).sub(No);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Po),o=Fo.dot(this.direction),s=-Fo.dot(Po),c=Fo.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(No).addScaledVector(Po,d),f}intersectSphere(e,t){Mo.subVectors(e.center,this.origin);let n=Mo.dot(this.direction),r=Mo.dot(Mo)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Mo)!==null}intersectTriangle(e,t,n,r,i){Io.subVectors(t,e),Lo.subVectors(n,e),Ro.crossVectors(Io,Lo);let a=this.direction.dot(Ro),o;if(a>0){if(r)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Fo.subVectors(this.origin,e);let s=o*this.direction.dot(Lo.crossVectors(Fo,Lo));if(s<0)return null;let c=o*this.direction.dot(Io.cross(Fo));if(c<0||s+c>a)return null;let l=-o*Fo.dot(Ro);return l<0?null:this.at(l/a,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Bo=class extends jo{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new G(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $i,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Vo=new W,Ho=new zo,Uo=new vo,Wo=new V,Go=new V,Ko=new V,qo=new V,Jo=new V,Yo=new V,Xo=new V,Zo=new V,K=class extends ga{constructor(e=new Eo,t=new Bo){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){Yo.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Jo.fromBufferAttribute(s,e),a?Yo.addScaledVector(Jo,r):Yo.addScaledVector(Jo.sub(t),r))}t.add(Yo)}return t}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Uo.copy(n.boundingSphere),Uo.applyMatrix4(i),Ho.copy(e.ray).recast(e.near),!(Uo.containsPoint(Ho.origin)===!1&&(Ho.intersectSphere(Uo,Wo)===null||Ho.origin.distanceToSquared(Wo)>(e.far-e.near)**2))&&(Vo.copy(i).invert(),Ho.copy(e.ray).applyMatrix4(Vo),(n.boundingBox===null||Ho.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Ho)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=$o(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=$o(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=$o(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=$o(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function Qo(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;Zo.copy(s),Zo.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(Zo);return l<n.near||l>n.far?null:{distance:l,point:Zo.clone(),object:e}}function $o(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Go),e.getVertexPosition(c,Ko),e.getVertexPosition(l,qo);let u=Qo(e,t,n,r,Go,Ko,qo,Xo);if(u){let e=new V;Ba.getBarycoord(Xo,Go,Ko,qo,e),i&&(u.uv=Ba.getInterpolatedAttribute(i,s,c,l,e,new B)),a&&(u.uv1=Ba.getInterpolatedAttribute(a,s,c,l,e,new B)),o&&(u.normal=Ba.getInterpolatedAttribute(o,s,c,l,e,new V),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new V,materialIndex:0};Ba.getNormal(Go,Ko,qo,t.normal),u.face=t,u.barycoord=e}return u}var es=new V,ts=new zi,ns=new zi,rs=new V,is=new W,as=new V,os=new vo,ss=new W,cs=new zo,ls=class extends K{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type=`SkinnedMesh`,this.bindMode=on,this.bindMatrix=new W,this.bindMatrixInverse=new W,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Va),this.boundingBox.makeEmpty();let t=e.getAttribute(`position`);for(let e=0;e<t.count;e++)this.getVertexPosition(e,as),this.boundingBox.expandByPoint(as)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new vo),this.boundingSphere.makeEmpty();let t=e.getAttribute(`position`);for(let e=0;e<t.count;e++)this.getVertexPosition(e,as),this.boundingSphere.expandByPoint(as)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,r=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),os.copy(this.boundingSphere),os.applyMatrix4(r),e.ray.intersectsSphere(os)!==!1&&(ss.copy(r).invert(),cs.copy(e.ray).applyMatrix4(ss),(this.boundingBox===null||cs.intersectsBox(this.boundingBox)!==!1)&&this._computeIntersections(e,t,cs)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new zi,t=this.geometry.attributes.skinWeight;for(let n=0,r=t.count;n<r;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r===1/0?e.set(1,0,0,0):e.multiplyScalar(r),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===`attached`?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===`detached`?this.bindMatrixInverse.copy(this.bindMatrix).invert():L(`SkinnedMesh: Unrecognized bindMode: `+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,r=this.geometry;ts.fromBufferAttribute(r.attributes.skinIndex,e),ns.fromBufferAttribute(r.attributes.skinWeight,e),es.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let e=0;e<4;e++){let r=ns.getComponent(e);if(r!==0){let i=ts.getComponent(e);is.multiplyMatrices(n.bones[i].matrixWorld,n.boneInverses[i]),t.addScaledVector(rs.copy(es).applyMatrix4(is),r)}}return t.applyMatrix4(this.bindMatrixInverse)}},us=class extends ga{constructor(){super(),this.isBone=!0,this.type=`Bone`}},ds=class extends Ri{constructor(e=null,t=1,n=1,r,i,a,o,s,c=un,l=un,u,d){super(null,a,o,s,c,l,r,i,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},fs=new W,ps=new W,ms=class e{constructor(e=[],t=[]){this.uuid=ei(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){L(`Skeleton: Number of inverse bone matrices does not match amount of bones.`),this.boneInverses=[];for(let e=0,t=this.bones.length;e<t;e++)this.boneInverses.push(new W)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let t=new W;this.bones[e]&&t.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(t)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let t=this.bones[e];t&&t.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let t=this.bones[e];t&&(t.parent&&t.parent.isBone?(t.matrix.copy(t.parent.matrixWorld).invert(),t.matrix.multiply(t.matrixWorld)):t.matrix.copy(t.matrixWorld),t.matrix.decompose(t.position,t.quaternion,t.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,r=this.boneTexture;for(let r=0,i=e.length;r<i;r++){let i=e[r]?e[r].matrixWorld:ps;fs.multiplyMatrices(i,t[r]),fs.toArray(n,r*16)}r!==null&&(r.needsUpdate=!0)}clone(){return new e(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new ds(t,e,e,jn,Sn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let n=this.bones[t];if(n.name===e)return n}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,r=e.bones.length;n<r;n++){let r=e.bones[n],i=t[r];i===void 0&&(L(`Skeleton: No bone found with UUID:`,r),i=new us),this.bones.push(i),this.boneInverses.push(new W().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:`Skeleton`,generator:`Skeleton.toJSON`},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let r=0,i=t.length;r<i;r++){let i=t[r];e.bones.push(i.uuid);let a=n[r];e.boneInverses.push(a.toArray())}return e}},hs=class extends uo{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},gs=new W,_s=new W,vs=[],ys=new Va,bs=new W,xs=new K,Ss=new vo,Cs=class extends K{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new hs(new Float32Array(n*16),16),this.previousInstanceMatrix=null,this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,bs)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Va),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,gs),ys.copy(e.boundingBox).applyMatrix4(gs),this.boundingBox.union(ys)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new vo),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,gs),Ss.copy(e.boundingSphere).applyMatrix4(gs),this.boundingSphere.union(Ss)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.previousInstanceMatrix!==null&&(this.previousInstanceMatrix=e.previousInstanceMatrix.clone()),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(xs.geometry=this.geometry,xs.material=this.material,xs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ss.copy(this.boundingSphere),Ss.applyMatrix4(n),e.ray.intersectsSphere(Ss)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,gs),_s.multiplyMatrices(n,gs),xs.matrixWorld=_s,xs.raycast(e,vs);for(let e=0,n=vs.length;e<n;e++){let n=vs[e];n.instanceId=i,n.object=this,t.push(n)}vs.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new hs(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new ds(new Float32Array(r*this.count),r,this.count,Pn,Sn));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;i[s]=o,i.set(n,s+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:`dispose`}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},ws=new V,Ts=new V,Es=new H,Ds=class{constructor(e=new V(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=ws.subVectors(n,t).cross(Ts.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(ws),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let i=-(e.start.dot(this.normal)+this.constant)/r;return i<0||i>1?null:t.copy(e.start).addScaledVector(n,i)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Es.getNormalMatrix(e),r=this.coplanarPoint(ws).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},Os=new vo,ks=new B(.5,.5),As=new V,js=class{constructor(e=new Ds,t=new Ds,n=new Ds,r=new Ds,i=new Ds,a=new Ds){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Rr,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Os.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Os.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Os)}intersectsSprite(e){return Os.center.set(0,0,0),Os.radius=.7071067811865476+ks.distanceTo(e.center),Os.applyMatrix4(e.matrixWorld),this.intersectsSphere(Os)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(As.x=r.normal.x>0?e.max.x:e.min.x,As.y=r.normal.y>0?e.max.y:e.min.y,As.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(As)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Ms=class extends jo{constructor(e){super(),this.isLineBasicMaterial=!0,this.type=`LineBasicMaterial`,this.color=new G(16777215),this.map=null,this.linewidth=1,this.linecap=`round`,this.linejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Ns=new V,Ps=new V,Fs=new W,Is=new zo,Ls=new vo,Rs=new V,zs=new V,Bs=class extends ga{constructor(e=new Eo,t=new Ms){super(),this.isLine=!0,this.type=`Line`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let e=1,r=t.count;e<r;e++)Ns.fromBufferAttribute(t,e-1),Ps.fromBufferAttribute(t,e),n[e]=n[e-1],n[e]+=Ns.distanceTo(Ps);e.setAttribute(`lineDistance`,new mo(n,1))}else L(`Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ls.copy(n.boundingSphere),Ls.applyMatrix4(r),Ls.radius+=i,e.ray.intersectsSphere(Ls)===!1)return;Fs.copy(r).invert(),Is.copy(e.ray).applyMatrix4(Fs);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=this.isLineSegments?2:1,l=n.index,u=n.attributes.position;if(l!==null){let n=Math.max(0,a.start),r=Math.min(l.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=l.getX(i),r=l.getX(i+1),a=Vs(this,e,Is,s,n,r,i);a&&t.push(a)}if(this.isLineLoop){let i=l.getX(r-1),a=l.getX(n),o=Vs(this,e,Is,s,i,a,r-1);o&&t.push(o)}}else{let n=Math.max(0,a.start),r=Math.min(u.count,a.start+a.count);for(let i=n,a=r-1;i<a;i+=c){let n=Vs(this,e,Is,s,i,i+1,i);n&&t.push(n)}if(this.isLineLoop){let i=Vs(this,e,Is,s,r-1,n,r-1);i&&t.push(i)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Vs(e,t,n,r,i,a,o){let s=e.geometry.attributes.position;if(Ns.fromBufferAttribute(s,i),Ps.fromBufferAttribute(s,a),n.distanceSqToSegment(Ns,Ps,Rs,zs)>r)return;Rs.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(Rs);if(!(c<t.near||c>t.far))return{distance:c,point:zs.clone().applyMatrix4(e.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:e}}var Hs=new V,Us=new V,Ws=class extends Bs{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type=`LineSegments`}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let e=0,r=t.count;e<r;e+=2)Hs.fromBufferAttribute(t,e),Us.fromBufferAttribute(t,e+1),n[e]=e===0?0:n[e-1],n[e+1]=n[e]+Hs.distanceTo(Us);e.setAttribute(`lineDistance`,new mo(n,1))}else L(`LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.`);return this}},Gs=class extends Bs{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type=`LineLoop`}},Ks=class extends jo{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new G(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},qs=new W,Js=new zo,Ys=new vo,Xs=new V,Zs=class extends ga{constructor(e=new Eo,t=new Ks){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Ys.copy(n.boundingSphere),Ys.applyMatrix4(r),Ys.radius+=i,e.ray.intersectsSphere(Ys)===!1)return;qs.copy(r).invert(),Js.copy(e.ray).applyMatrix4(qs);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);Xs.fromBufferAttribute(l,n),Qs(Xs,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)Xs.fromBufferAttribute(l,a),Qs(Xs,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Qs(e,t,n,r,i,a,o){let s=Js.distanceSqToPoint(e);if(s<n){let n=new V;Js.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var $s=class extends Ri{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},ec=class extends Ri{constructor(e,t,n,r,i,a,o,s,c){super(e,t,n,r,i,a,o,s,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},tc=class extends Ri{constructor(e,t,n=xn,r,i,a,o=un,s=un,c,l=Mn,u=1){if(l!==1026&&l!==1027)throw Error(`DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:u},r,i,a,o,s,l,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Pi(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},nc=class extends tc{constructor(e,t=xn,n=301,r,i,a=un,o=un,s,c=Mn){let l={width:e,height:e,depth:1},u=[l,l,l,l,l,l];super(e,e,t,n,r,i,a,o,s,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},rc=class extends Ri{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},ic=class e extends Eo{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new mo(c,3)),this.setAttribute(`normal`,new mo(l,3)),this.setAttribute(`uv`,new mo(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new V;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},ac=class e extends Eo{constructor(e=1,t=1,n=4,r=8,i=1){super(),this.type=`CapsuleGeometry`,this.parameters={radius:e,height:t,capSegments:n,radialSegments:r,heightSegments:i},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),r=Math.max(3,Math.floor(r)),i=Math.max(1,Math.floor(i));let a=[],o=[],s=[],c=[],l=t/2,u=Math.PI/2*e,d=t,f=2*u+d,p=n*2+i,m=r+1,h=new V,g=new V;for(let _=0;_<=p;_++){let v=0,y=0,b=0,x=0;if(_<=n){let t=_/n,r=t*Math.PI/2;y=-l-e*Math.cos(r),b=e*Math.sin(r),x=-e*Math.cos(r),v=t*u}else if(_<=n+i){let r=(_-n)/i;y=-l+r*t,b=e,x=0,v=u+r*d}else{let t=(_-n-i)/n,r=t*Math.PI/2;y=l+e*Math.sin(r),b=e*Math.cos(r),x=e*Math.sin(r),v=u+d+t*u}let S=Math.max(0,Math.min(1,v/f)),C=0;_===0?C=.5/r:_===p&&(C=-.5/r);for(let e=0;e<=r;e++){let t=e/r,n=t*Math.PI*2,i=Math.sin(n),a=Math.cos(n);g.x=-b*a,g.y=y,g.z=b*i,o.push(g.x,g.y,g.z),h.set(-b*a,x,b*i),h.normalize(),s.push(h.x,h.y,h.z),c.push(t+C,S)}if(_>0){let e=(_-1)*m;for(let t=0;t<r;t++){let n=e+t,r=e+t+1,i=_*m+t,o=_*m+t+1;a.push(n,r,i),a.push(r,o,i)}}}this.setIndex(a),this.setAttribute(`position`,new mo(o,3)),this.setAttribute(`normal`,new mo(s,3)),this.setAttribute(`uv`,new mo(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.height,t.capSegments,t.radialSegments,t.heightSegments)}},oc=class e extends Eo{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new V,l=new B;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new mo(a,3)),this.setAttribute(`normal`,new mo(o,3)),this.setAttribute(`uv`,new mo(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},sc=class e extends Eo{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new mo(u,3)),this.setAttribute(`normal`,new mo(d,3)),this.setAttribute(`uv`,new mo(f,2));function _(){let a=new V,_=new V,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new B,m=new V,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},cc=class e extends sc{constructor(e=1,t=1,n=32,r=1,i=!1,a=0,o=Math.PI*2){super(0,e,t,n,r,i,a,o),this.type=`ConeGeometry`,this.parameters={radius:e,height:t,radialSegments:n,heightSegments:r,openEnded:i,thetaStart:a,thetaLength:o}}static fromJSON(t){return new e(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},lc=class e extends Eo{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new mo(i,3)),this.setAttribute(`normal`,new mo(i.slice(),3)),this.setAttribute(`uv`,new mo(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new V,r=new V,i=new V;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new V;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new V;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new V,t=new V,n=new V,r=new V,o=new B,s=new B,c=new B;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},uc=class e extends lc{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},dc=class e extends Eo{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new mo(p,3)),this.setAttribute(`normal`,new mo(m,3)),this.setAttribute(`uv`,new mo(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},fc=class e extends Eo{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new V,d=new V,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=0;f===0&&a===0?v=.5/t:f===n&&s===Math.PI&&(v=-.5/t);for(let n=0;n<=t;n++){let s=n/t;u.x=-e*Math.cos(r+s*i)*Math.sin(a+_*o),u.y=e*Math.cos(a+_*o),u.z=e*Math.sin(r+s*i)*Math.sin(a+_*o),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(s+v,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new mo(p,3)),this.setAttribute(`normal`,new mo(m,3)),this.setAttribute(`uv`,new mo(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}},pc=class e extends Eo{constructor(e=1,t=.4,n=12,r=48,i=Math.PI*2,a=0,o=Math.PI*2){super(),this.type=`TorusGeometry`,this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:r,arc:i,thetaStart:a,thetaLength:o},n=Math.floor(n),r=Math.floor(r);let s=[],c=[],l=[],u=[],d=new V,f=new V,p=new V;for(let s=0;s<=n;s++){let m=a+s/n*o;for(let a=0;a<=r;a++){let o=a/r*i;f.x=(e+t*Math.cos(m))*Math.cos(o),f.y=(e+t*Math.cos(m))*Math.sin(o),f.z=t*Math.sin(m),c.push(f.x,f.y,f.z),d.x=e*Math.cos(o),d.y=e*Math.sin(o),p.subVectors(f,d).normalize(),l.push(p.x,p.y,p.z),u.push(a/r),u.push(s/n)}}for(let e=1;e<=n;e++)for(let t=1;t<=r;t++){let n=(r+1)*e+t-1,i=(r+1)*(e-1)+t-1,a=(r+1)*(e-1)+t,o=(r+1)*e+t;s.push(n,i,o),s.push(i,a,o)}this.setIndex(s),this.setAttribute(`position`,new mo(c,3)),this.setAttribute(`normal`,new mo(l,3)),this.setAttribute(`uv`,new mo(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}};function mc(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(L(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone():Array.isArray(i)?t[n][r]=i.slice():t[n][r]=i}}return t}function hc(e){let t={};for(let n=0;n<e.length;n++){let r=mc(e[n]);for(let e in r)t[e]=r[e]}return t}function gc(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function _c(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:U.workingColorSpace}var vc={clone:mc,merge:hc},yc=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,bc=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,xc=class extends jo{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=yc,this.fragmentShader=bc,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=mc(e.uniforms),this.uniformsGroups=gc(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Sc=class extends xc{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Cc=class extends jo{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new G(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new G(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new B(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new $i,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},wc=class extends Cc{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:``,PHYSICAL:``},this.type=`MeshPhysicalMaterial`,this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new B(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return z(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new G(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new G(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new G(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:``,PHYSICAL:``},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}},Tc=class extends jo{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=kr,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Ec=class extends jo{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Dc(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function Oc(e){function t(t,n){return e[t]-e[n]}let n=e.length,r=Array(n);for(let e=0;e!==n;++e)r[e]=e;return r.sort(t),r}function kc(e,t,n){let r=e.length,i=new e.constructor(r);for(let a=0,o=0;o!==r;++a){let r=n[a]*t;for(let n=0;n!==t;++n)i[o++]=e[r+n]}return i}function Ac(e,t,n,r){let i=1,a=e[0];for(;a!==void 0&&a[r]===void 0;)a=e[i++];if(a===void 0)return;let o=a[r];if(o!==void 0){if(Array.isArray(o))do o=a[r],o!==void 0&&(t.push(a.time),n.push(...o)),a=e[i++];while(a!==void 0);else if(o.toArray!==void 0)do o=a[r],o!==void 0&&(t.push(a.time),o.toArray(n,n.length)),a=e[i++];while(a!==void 0);else do o=a[r],o!==void 0&&(t.push(a.time),n.push(o)),a=e[i++];while(a!==void 0)}}var jc=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`call to abstract method`)}intervalChanged_(){}},Mc=class extends jc{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Tr,endingEnd:Tr}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case Er:i=e,o=2*t-n;break;case Dr:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case Er:a=e,s=2*n-t;break;case Dr:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Nc=class extends jc{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},Pc=class extends jc{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},Fc=class extends jc{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.settings||this.DefaultSettings_,u=l.inTangents,d=l.outTangents;if(!u||!d){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let f=o*2,p=e-1;for(let l=0;l!==o;++l){let o=a[c+l],m=a[s+l],h=p*f+l*2,g=d[h],_=d[h+1],v=e*f+l*2,y=u[v],b=u[v+1],x=(n-t)/(r-t),S,C,w,T,E;for(let e=0;e<8;e++){S=x*x,C=S*x,w=1-x,T=w*w,E=T*w;let e=E*t+3*T*x*g+3*w*S*y+C*r-n;if(Math.abs(e)<1e-10)break;let i=3*T*(g-t)+6*w*x*(y-g)+3*S*(r-y);if(Math.abs(i)<1e-10)break;x-=e/i,x=Math.max(0,Math.min(1,x))}i[l]=E*o+3*T*x*_+3*w*S*b+C*m}return i}},Ic=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Dc(t,this.TimeBufferType),this.values=Dc(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Dc(e.times,Array),values:Dc(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Pc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Nc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Mc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Fc(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.settings=this.settings),t}setInterpolation(e){let t;switch(e){case xr:t=this.InterpolantFactoryMethodDiscrete;break;case Sr:t=this.InterpolantFactoryMethodLinear;break;case Cr:t=this.InterpolantFactoryMethodSmooth;break;case wr:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return L(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return xr;case this.InterpolantFactoryMethodLinear:return Sr;case this.InterpolantFactoryMethodSmooth:return Cr;case this.InterpolantFactoryMethodBezier:return wr}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(R(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(R(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){R(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){R(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&Br(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){R(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===Cr,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}};Ic.prototype.ValueTypeName=``,Ic.prototype.TimeBufferType=Float32Array,Ic.prototype.ValueBufferType=Float32Array,Ic.prototype.DefaultInterpolation=Sr;var Lc=class extends Ic{constructor(e,t,n){super(e,t,n)}};Lc.prototype.ValueTypeName=`bool`,Lc.prototype.ValueBufferType=Array,Lc.prototype.DefaultInterpolation=xr,Lc.prototype.InterpolantFactoryMethodLinear=void 0,Lc.prototype.InterpolantFactoryMethodSmooth=void 0;var Rc=class extends Ic{constructor(e,t,n,r){super(e,t,n,r)}};Rc.prototype.ValueTypeName=`color`;var zc=class extends Ic{constructor(e,t,n,r){super(e,t,n,r)}};zc.prototype.ValueTypeName=`number`;var Bc=class extends jc{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)Si.slerpFlat(i,0,a,c-o,a,c,s);return i}},Vc=class extends Ic{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new Bc(this.times,this.values,this.getValueSize(),e)}};Vc.prototype.ValueTypeName=`quaternion`,Vc.prototype.InterpolantFactoryMethodSmooth=void 0;var Hc=class extends Ic{constructor(e,t,n){super(e,t,n)}};Hc.prototype.ValueTypeName=`string`,Hc.prototype.ValueBufferType=Array,Hc.prototype.DefaultInterpolation=xr,Hc.prototype.InterpolantFactoryMethodLinear=void 0,Hc.prototype.InterpolantFactoryMethodSmooth=void 0;var Uc=class extends Ic{constructor(e,t,n,r){super(e,t,n,r)}};Uc.prototype.ValueTypeName=`vector`;var Wc=class{constructor(e=``,t=-1,n=[],r=Or){this.name=e,this.tracks=n,this.duration=t,this.blendMode=r,this.uuid=ei(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,r=1/(e.fps||1);for(let e=0,i=n.length;e!==i;++e)t.push(Kc(n[e]).scale(r));let i=new this(e.name,e.duration,t,e.blendMode);return i.uuid=e.uuid,i.userData=JSON.parse(e.userData||`{}`),i}static toJSON(e){let t=[],n=e.tracks,r={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let e=0,r=n.length;e!==r;++e)t.push(Ic.toJSON(n[e]));return r}static CreateFromMorphTargetSequence(e,t,n,r){let i=t.length,a=[];for(let e=0;e<i;e++){let o=[],s=[];o.push((e+i-1)%i,e,(e+1)%i),s.push(0,1,0);let c=Oc(o);o=kc(o,1,c),s=kc(s,1,c),!r&&o[0]===0&&(o.push(i),s.push(s[0])),a.push(new zc(`.morphTargetInfluences[`+t[e].name+`]`,o,s).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let t=e;n=t.geometry&&t.geometry.animations||t.animations}for(let e=0;e<n.length;e++)if(n[e].name===t)return n[e];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let r={},i=/^([\w-]*?)([\d]+)$/;for(let t=0,n=e.length;t<n;t++){let n=e[t],a=n.name.match(i);if(a&&a.length>1){let e=a[1],t=r[e];t||(r[e]=t=[]),t.push(n)}}let a=[];for(let e in r)a.push(this.CreateFromMorphTargetSequence(e,r[e],t,n));return a}static parseAnimation(e,t){if(L(`AnimationClip: parseAnimation() is deprecated and will be removed with r185`),!e)return R(`AnimationClip: No animation in JSONLoader data.`),null;let n=function(e,t,n,r,i){if(n.length!==0){let a=[],o=[];Ac(n,a,o,r),a.length!==0&&i.push(new e(t,a,o))}},r=[],i=e.name||`default`,a=e.fps||30,o=e.blendMode,s=e.length||-1,c=e.hierarchy||[];for(let e=0;e<c.length;e++){let i=c[e].keys;if(i&&i.length!==0){if(i[0].morphTargets){let e={},t=0;for(;t<i.length;t++)if(i[t].morphTargets)for(let n=0;n<i[t].morphTargets.length;n++)e[i[t].morphTargets[n]]=-1;for(let n in e){let e=[],a=[];for(let r=0;r!==i[t].morphTargets.length;++r){let r=i[t];e.push(r.time),a.push(+(r.morphTarget===n))}r.push(new zc(`.morphTargetInfluence[`+n+`]`,e,a))}s=e.length*a}else{let a=`.bones[`+t[e].name+`]`;n(Uc,a+`.position`,i,`pos`,r),n(Vc,a+`.quaternion`,i,`rot`,r),n(Uc,a+`.scale`,i,`scl`,r)}}}return r.length===0?null:new this(i,s,r,o)}resetDuration(){let e=this.tracks,t=0;for(let n=0,r=e.length;n!==r;++n){let e=this.tracks[n];t=Math.max(t,e.times[e.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e&&=this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function Gc(e){switch(e.toLowerCase()){case`scalar`:case`double`:case`float`:case`number`:case`integer`:return zc;case`vector`:case`vector2`:case`vector3`:case`vector4`:return Uc;case`color`:return Rc;case`quaternion`:return Vc;case`bool`:case`boolean`:return Lc;case`string`:return Hc}throw Error(`THREE.KeyframeTrack: Unsupported typeName: `+e)}function Kc(e){if(e.type===void 0)throw Error(`THREE.KeyframeTrack: track type undefined, can not parse`);let t=Gc(e.type);if(e.times===void 0){let t=[],n=[];Ac(e.keys,t,n,`value`),e.times=t,e.values=n}return t.parse===void 0?new t(e.name,e.times,e.values,e.interpolation):t.parse(e)}var qc={enabled:!1,files:{},add:function(e,t){this.enabled!==!1&&(Jc(e)||(this.files[e]=t))},get:function(e){if(this.enabled!==!1&&!Jc(e))return this.files[e]},remove:function(e){delete this.files[e]},clear:function(){this.files={}}};function Jc(e){try{let t=e.slice(e.indexOf(`:`)+1);return new URL(t).protocol===`blob:`}catch{return!1}}var Yc=class{constructor(e,t,n){let r=this,i=!1,a=0,o=0,s,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(e){o++,i===!1&&r.onStart!==void 0&&r.onStart(e,a,o),i=!0},this.itemEnd=function(e){a++,r.onProgress!==void 0&&r.onProgress(e,a,o),a===o&&(i=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(e){r.onError!==void 0&&r.onError(e)},this.resolveURL=function(e){return s?s(e):e},this.setURLModifier=function(e){return s=e,this},this.addHandler=function(e,t){return c.push(e,t),this},this.removeHandler=function(e){let t=c.indexOf(e);return t!==-1&&c.splice(t,2),this},this.getHandler=function(e){for(let t=0,n=c.length;t<n;t+=2){let n=c[t],r=c[t+1];if(n.global&&(n.lastIndex=0),n.test(e))return r}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||=new AbortController,this._abortController}},Xc=new Yc,Zc=class{constructor(e){this.manager=e===void 0?Xc:e,this.crossOrigin=`anonymous`,this.withCredentials=!1,this.path=``,this.resourcePath=``,this.requestHeader={},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,i){n.load(e,r,t,i)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Zc.DEFAULT_MATERIAL_NAME=`__DEFAULT`;var Qc={},$c=class extends Error{constructor(e,t){super(e),this.response=t}},el=class extends Zc{constructor(e){super(e),this.mimeType=``,this.responseType=``,this._abortController=new AbortController}load(e,t,n,r){e===void 0&&(e=``),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=qc.get(`file:${e}`);if(i!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(i),this.manager.itemEnd(e)},0),i;if(Qc[e]!==void 0){Qc[e].push({onLoad:t,onProgress:n,onError:r});return}Qc[e]=[],Qc[e].push({onLoad:t,onProgress:n,onError:r});let a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?`include`:`same-origin`,signal:typeof AbortSignal.any==`function`?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,s=this.responseType;fetch(a).then(t=>{if(t.status===200||t.status===0){if(t.status===0&&L(`FileLoader: HTTP Status 0 received.`),typeof ReadableStream>`u`||t.body===void 0||t.body.getReader===void 0)return t;let n=Qc[e],r=t.body.getReader(),i=t.headers.get(`X-File-Size`)||t.headers.get(`Content-Length`),a=i?parseInt(i):0,o=a!==0,s=0,c=new ReadableStream({start(e){t();function t(){r.read().then(({done:r,value:i})=>{if(r)e.close();else{s+=i.byteLength;let r=new ProgressEvent(`progress`,{lengthComputable:o,loaded:s,total:a});for(let e=0,t=n.length;e<t;e++){let t=n[e];t.onProgress&&t.onProgress(r)}e.enqueue(i),t()}},t=>{e.error(t)})}}});return new Response(c)}throw new $c(`fetch for "${t.url}" responded with ${t.status}: ${t.statusText}`,t)}).then(e=>{switch(s){case`arraybuffer`:return e.arrayBuffer();case`blob`:return e.blob();case`document`:return e.text().then(e=>new DOMParser().parseFromString(e,o));case`json`:return e.json();default:if(o===``)return e.text();{let t=/charset="?([^;"\s]*)"?/i.exec(o),n=t&&t[1]?t[1].toLowerCase():void 0,r=new TextDecoder(n);return e.arrayBuffer().then(e=>r.decode(e))}}}).then(t=>{qc.add(`file:${e}`,t);let n=Qc[e];delete Qc[e];for(let e=0,r=n.length;e<r;e++){let r=n[e];r.onLoad&&r.onLoad(t)}}).catch(t=>{let n=Qc[e];if(n===void 0)throw this.manager.itemError(e),t;delete Qc[e];for(let e=0,r=n.length;e<r;e++){let r=n[e];r.onError&&r.onError(t)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},tl=new WeakMap,nl=class extends Zc{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=qc.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)i.manager.itemStart(e),setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0);else{let e=tl.get(a);e===void 0&&(e=[],tl.set(a,e)),e.push({onLoad:t,onError:r})}return a}let o=Vr(`img`);function s(){l(),t&&t(this);let n=tl.get(this)||[];for(let e=0;e<n.length;e++){let t=n[e];t.onLoad&&t.onLoad(this)}tl.delete(this),i.manager.itemEnd(e)}function c(t){l(),r&&r(t),qc.remove(`image:${e}`);let n=tl.get(this)||[];for(let e=0;e<n.length;e++){let r=n[e];r.onError&&r.onError(t)}tl.delete(this),i.manager.itemError(e),i.manager.itemEnd(e)}function l(){o.removeEventListener(`load`,s,!1),o.removeEventListener(`error`,c,!1)}return o.addEventListener(`load`,s,!1),o.addEventListener(`error`,c,!1),e.slice(0,5)!==`data:`&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),qc.add(`image:${e}`,o),i.manager.itemStart(e),o.src=e,o}},rl=class extends Zc{constructor(e){super(e)}load(e,t,n,r){let i=this,a=new ds,o=new el(this.manager);return o.setResponseType(`arraybuffer`),o.setRequestHeader(this.requestHeader),o.setPath(this.path),o.setWithCredentials(i.withCredentials),o.load(e,function(e){let n;try{n=i.parse(e)}catch(e){if(r!==void 0)r(e);else{e(e);return}}n.image===void 0?n.data!==void 0&&(a.image.width=n.width,a.image.height=n.height,a.image.data=n.data):a.image=n.image,a.wrapS=n.wrapS===void 0?cn:n.wrapS,a.wrapT=n.wrapT===void 0?cn:n.wrapT,a.magFilter=n.magFilter===void 0?pn:n.magFilter,a.minFilter=n.minFilter===void 0?pn:n.minFilter,a.anisotropy=n.anisotropy===void 0?1:n.anisotropy,n.colorSpace!==void 0&&(a.colorSpace=n.colorSpace),n.flipY!==void 0&&(a.flipY=n.flipY),n.format!==void 0&&(a.format=n.format),n.type!==void 0&&(a.type=n.type),n.mipmaps!==void 0&&(a.mipmaps=n.mipmaps,a.minFilter=hn),n.mipmapCount===1&&(a.minFilter=pn),n.generateMipmaps!==void 0&&(a.generateMipmaps=n.generateMipmaps),a.needsUpdate=!0,t&&t(a,n)},n,r),a}},il=class extends Zc{constructor(e){super(e)}load(e,t,n,r){let i=new Ri,a=new nl(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(e){i.image=e,i.needsUpdate=!0,t!==void 0&&t(i)},n,r),i}},al=class extends ga{constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new G(e),this.intensity=t}dispose(){this.dispatchEvent({type:`dispose`})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},ol=class extends al{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(ga.DEFAULT_UP),this.updateMatrix(),this.groundColor=new G(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},sl=new W,cl=new V,ll=new V,ul=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new B(512,512),this.mapType=gn,this.map=null,this.mapPass=null,this.matrix=new W,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new js,this._frameExtents=new B(1,1),this._viewportCount=1,this._viewports=[new zi(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera,n=this.matrix;cl.setFromMatrixPosition(e.matrixWorld),t.position.copy(cl),ll.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(ll),t.updateMatrixWorld(),sl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(sl,t.coordinateSystem,t.reversedDepth),t.coordinateSystem===2001||t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(sl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},dl=new V,fl=new Si,pl=new V,ml=class extends ga{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new W,this.projectionMatrix=new W,this.projectionMatrixInverse=new W,this.coordinateSystem=Rr,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(dl,fl,pl),pl.x===1&&pl.y===1&&pl.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(dl,fl,pl.set(1,1,1)).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorld.decompose(dl,fl,pl),pl.x===1&&pl.y===1&&pl.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(dl,fl,pl.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},hl=new V,gl=new B,_l=new B,vl=class extends ml{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=$r*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Qr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return $r*2*Math.atan(Math.tan(Qr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){hl.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(hl.x,hl.y).multiplyScalar(-e/hl.z),hl.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(hl.x,hl.y).multiplyScalar(-e/hl.z)}getViewSize(e,t){return this.getViewBounds(e,gl,_l),t.subVectors(_l,gl)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Qr*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},yl=class extends ul{constructor(){super(new vl(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=$r*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height*this.aspect,i=e.distance||t.far;(n!==t.fov||r!==t.aspect||i!==t.far)&&(t.fov=n,t.aspect=r,t.far=i,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}},bl=class extends al{constructor(e,t,n=0,r=Math.PI/3,i=0,a=2){super(e,t),this.isSpotLight=!0,this.type=`SpotLight`,this.position.copy(ga.DEFAULT_UP),this.updateMatrix(),this.target=new ga,this.distance=n,this.angle=r,this.penumbra=i,this.decay=a,this.map=null,this.shadow=new yl}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},xl=class extends ul{constructor(){super(new vl(90,1,.5,500)),this.isPointLightShadow=!0}},Sl=class extends al{constructor(e,t,n=0,r=2){super(e,t),this.isPointLight=!0,this.type=`PointLight`,this.distance=n,this.decay=r,this.shadow=new xl}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},Cl=class extends ml{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},wl=class extends ul{constructor(){super(new Cl(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Tl=class extends al{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(ga.DEFAULT_UP),this.updateMatrix(),this.target=new ga,this.shadow=new wl}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},El=class{static extractUrlBase(e){let t=e.lastIndexOf(`/`);return t===-1?`./`:e.slice(0,t+1)}static resolveURL(e,t){return typeof e!=`string`||e===``?``:(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,`$1`)),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}},Dl=new WeakMap,Ol=class extends Zc{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>`u`&&L(`ImageBitmapLoader: createImageBitmap() not supported.`),typeof fetch>`u`&&L(`ImageBitmapLoader: fetch() not supported.`),this.options={premultiplyAlpha:`none`},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,r){e===void 0&&(e=``),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=qc.get(`image-bitmap:${e}`);if(a!==void 0){if(i.manager.itemStart(e),a.then){a.then(n=>{if(Dl.has(a)===!0)r&&r(Dl.get(a)),i.manager.itemError(e),i.manager.itemEnd(e);else return t&&t(n),i.manager.itemEnd(e),n});return}return setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0),a}let o={};o.credentials=this.crossOrigin===`anonymous`?`same-origin`:`include`,o.headers=this.requestHeader,o.signal=typeof AbortSignal.any==`function`?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let s=fetch(e,o).then(function(e){return e.blob()}).then(function(e){return createImageBitmap(e,Object.assign(i.options,{colorSpaceConversion:`none`}))}).then(function(n){return qc.add(`image-bitmap:${e}`,n),t&&t(n),i.manager.itemEnd(e),n}).catch(function(t){r&&r(t),Dl.set(s,t),qc.remove(`image-bitmap:${e}`),i.manager.itemError(e),i.manager.itemEnd(e)});qc.add(`image-bitmap:${e}`,s),i.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}},kl=-90,Al=1,jl=class extends ga{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new vl(kl,Al,e,t);r.layers=this.layers,this.add(r);let i=new vl(kl,Al,e,t);i.layers=this.layers,this.add(i);let a=new vl(kl,Al,e,t);a.layers=this.layers,this.add(a);let o=new vl(kl,Al,e,t);o.layers=this.layers,this.add(o);let s=new vl(kl,Al,e,t);s.layers=this.layers,this.add(s);let c=new vl(kl,Al,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},Ml=class extends vl{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Nl=`\\[\\]\\.:\\/`,Pl=RegExp(`[\\[\\]\\.:\\/]`,`g`),Fl=`[^\\[\\]\\.:\\/]`,Il=`[^`+Nl.replace(`\\.`,``)+`]`,Ll=`((?:WC+[\\/:])*)`.replace(`WC`,Fl),Rl=`(WCOD+)?`.replace(`WCOD`,Il),zl=`(?:\\.(WC+)(?:\\[(.+)\\])?)?`.replace(`WC`,Fl),Bl=`\\.(WC+)(?:\\[(.+)\\])?`.replace(`WC`,Fl),Vl=RegExp(`^`+Ll+Rl+zl+Bl+`$`),Hl=[`material`,`materials`,`bones`,`map`],Ul=class{constructor(e,t,n){let r=n||Wl.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Wl=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(Pl,``)}static parseTrackName(e){let t=Vl.exec(e);if(t===null)throw Error(`PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Hl.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){L(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){R(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){R(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){R(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){R(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){R(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){R(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){R(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;R(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){R(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){R(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Wl.Composite=Ul,Wl.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Wl.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Wl.prototype.GetterByBindingType=[Wl.prototype._getValue_direct,Wl.prototype._getValue_array,Wl.prototype._getValue_arrayElement,Wl.prototype._getValue_toArray],Wl.prototype.SetterByBindingTypeAndVersioning=[[Wl.prototype._setValue_direct,Wl.prototype._setValue_direct_setNeedsUpdate,Wl.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Wl.prototype._setValue_array,Wl.prototype._setValue_array_setNeedsUpdate,Wl.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Wl.prototype._setValue_arrayElement,Wl.prototype._setValue_arrayElement_setNeedsUpdate,Wl.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Wl.prototype._setValue_fromArray,Wl.prototype._setValue_fromArray_setNeedsUpdate,Wl.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];function Gl(e,t,n,r){let i=Kl(r);switch(n){case kn:return e*t;case Pn:return e*t/i.components*i.byteLength;case Fn:return e*t/i.components*i.byteLength;case In:return e*t*2/i.components*i.byteLength;case Ln:return e*t*2/i.components*i.byteLength;case An:return e*t*3/i.components*i.byteLength;case jn:return e*t*4/i.components*i.byteLength;case Rn:return e*t*4/i.components*i.byteLength;case zn:case Bn:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Vn:case Hn:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Wn:case Kn:return Math.max(e,16)*Math.max(t,8)/4;case Un:case Gn:return Math.max(e,8)*Math.max(t,8)/2;case qn:case Jn:case Xn:case Zn:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Yn:case Qn:case $n:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case er:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case tr:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case nr:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case rr:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case ir:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case ar:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case or:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case sr:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case cr:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case lr:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case ur:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case dr:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case fr:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case pr:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case mr:case hr:case gr:return Math.ceil(e/4)*Math.ceil(t/4)*16;case _r:case vr:return Math.ceil(e/4)*Math.ceil(t/4)*8;case yr:case br:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Kl(e){switch(e){case gn:case _n:return{byteLength:1,components:1};case yn:case vn:case Cn:return{byteLength:2,components:1};case wn:case Tn:return{byteLength:2,components:4};case xn:case bn:case Sn:return{byteLength:4,components:1};case Dn:case On:return{byteLength:4,components:3}}throw Error(`Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`183`}})),typeof window<`u`&&(window.__THREE__?L(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`183`);function ql(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Jl(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var q={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return v;
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},J={common:{diffuse:{value:new G(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new H}},envmap:{envMap:{value:null},envMapRotation:{value:new H},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new H}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new H}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new H},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new H},normalScale:{value:new B(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new H},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new H}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new H}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new H}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new G(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new G(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0},uvTransform:{value:new H}},sprite:{diffuse:{value:new G(16777215)},opacity:{value:1},center:{value:new B(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new H},alphaMap:{value:null},alphaMapTransform:{value:new H},alphaTest:{value:0}}},Yl={basic:{uniforms:hc([J.common,J.specularmap,J.envmap,J.aomap,J.lightmap,J.fog]),vertexShader:q.meshbasic_vert,fragmentShader:q.meshbasic_frag},lambert:{uniforms:hc([J.common,J.specularmap,J.envmap,J.aomap,J.lightmap,J.emissivemap,J.bumpmap,J.normalmap,J.displacementmap,J.fog,J.lights,{emissive:{value:new G(0)},envMapIntensity:{value:1}}]),vertexShader:q.meshlambert_vert,fragmentShader:q.meshlambert_frag},phong:{uniforms:hc([J.common,J.specularmap,J.envmap,J.aomap,J.lightmap,J.emissivemap,J.bumpmap,J.normalmap,J.displacementmap,J.fog,J.lights,{emissive:{value:new G(0)},specular:{value:new G(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:q.meshphong_vert,fragmentShader:q.meshphong_frag},standard:{uniforms:hc([J.common,J.envmap,J.aomap,J.lightmap,J.emissivemap,J.bumpmap,J.normalmap,J.displacementmap,J.roughnessmap,J.metalnessmap,J.fog,J.lights,{emissive:{value:new G(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:q.meshphysical_vert,fragmentShader:q.meshphysical_frag},toon:{uniforms:hc([J.common,J.aomap,J.lightmap,J.emissivemap,J.bumpmap,J.normalmap,J.displacementmap,J.gradientmap,J.fog,J.lights,{emissive:{value:new G(0)}}]),vertexShader:q.meshtoon_vert,fragmentShader:q.meshtoon_frag},matcap:{uniforms:hc([J.common,J.bumpmap,J.normalmap,J.displacementmap,J.fog,{matcap:{value:null}}]),vertexShader:q.meshmatcap_vert,fragmentShader:q.meshmatcap_frag},points:{uniforms:hc([J.points,J.fog]),vertexShader:q.points_vert,fragmentShader:q.points_frag},dashed:{uniforms:hc([J.common,J.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:q.linedashed_vert,fragmentShader:q.linedashed_frag},depth:{uniforms:hc([J.common,J.displacementmap]),vertexShader:q.depth_vert,fragmentShader:q.depth_frag},normal:{uniforms:hc([J.common,J.bumpmap,J.normalmap,J.displacementmap,{opacity:{value:1}}]),vertexShader:q.meshnormal_vert,fragmentShader:q.meshnormal_frag},sprite:{uniforms:hc([J.sprite,J.fog]),vertexShader:q.sprite_vert,fragmentShader:q.sprite_frag},background:{uniforms:{uvTransform:{value:new H},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:q.background_vert,fragmentShader:q.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new H}},vertexShader:q.backgroundCube_vert,fragmentShader:q.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:q.cube_vert,fragmentShader:q.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:q.equirect_vert,fragmentShader:q.equirect_frag},distance:{uniforms:hc([J.common,J.displacementmap,{referencePosition:{value:new V},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:q.distance_vert,fragmentShader:q.distance_frag},shadow:{uniforms:hc([J.lights,J.fog,{color:{value:new G(0)},opacity:{value:1}}]),vertexShader:q.shadow_vert,fragmentShader:q.shadow_frag}};Yl.physical={uniforms:hc([Yl.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new H},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new H},clearcoatNormalScale:{value:new B(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new H},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new H},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new H},sheen:{value:0},sheenColor:{value:new G(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new H},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new H},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new H},transmissionSamplerSize:{value:new B},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new H},attenuationDistance:{value:0},attenuationColor:{value:new G(0)},specularColor:{value:new G(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new H},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new H},anisotropyVector:{value:new B},anisotropyMap:{value:null},anisotropyMapTransform:{value:new H}}]),vertexShader:q.meshphysical_vert,fragmentShader:q.meshphysical_frag};var Xl={r:0,b:0,g:0},Zl=new $i,Ql=new W;function $l(e,t,n,r,i,a){let o=new G(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&(i.isCubeTexture||i.mapping===306)?(l===void 0&&(l=new K(new ic(1,1,1),new xc({name:`BackgroundCubeMaterial`,uniforms:mc(Yl.backgroundCube.uniforms),vertexShader:Yl.backgroundCube.vertexShader,fragmentShader:Yl.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),Zl.copy(n.backgroundRotation),Zl.x*=-1,Zl.y*=-1,Zl.z*=-1,i.isCubeTexture&&i.isRenderTargetTexture===!1&&(Zl.y*=-1,Zl.z*=-1),l.material.uniforms.envMap.value=i,l.material.uniforms.flipEnvMap.value=i.isCubeTexture&&i.isRenderTargetTexture===!1?-1:1,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Ql.makeRotationFromEuler(Zl)),l.material.toneMapped=U.getTransfer(i.colorSpace)!==Pr,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new K(new dc(2,2),new xc({name:`BackgroundMaterial`,uniforms:mc(Yl.background.uniforms),vertexShader:Yl.background.vertexShader,fragmentShader:Yl.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=U.getTransfer(i.colorSpace)!==Pr,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(Xl,_c(e)),n.buffers.color.setClear(Xl.r,Xl.g,Xl.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function eu(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function tu(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}function c(e,i,a,s){if(a===0)return;let c=t.get(`WEBGL_multi_draw`);if(c===null)for(let t=0;t<e.length;t++)o(e[t],i[t],s[t]);else{c.multiDrawArraysInstancedWEBGL(r,e,0,i,0,s,0,a);let t=0;for(let e=0;e<a;e++)t+=i[e]*s[e];n.update(t,r,1)}}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=c}function nu(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(L(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function ru(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Ds,s=new H,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var iu=4,au=[.125,.215,.35,.446,.526,.582],ou=20,su=256,cu=new Cl,lu=new G,uu=null,du=0,fu=0,pu=!1,mu=new V,hu=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=mu}=i;uu=this._renderer.getRenderTarget(),du=this._renderer.getActiveCubeFace(),fu=this._renderer.getActiveMipmapLevel(),pu=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Su(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=xu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(uu,du,fu),this._renderer.xr.enabled=pu,e.scissorTest=!1,vu(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),uu=this._renderer.getRenderTarget(),du=this._renderer.getActiveCubeFace(),fu=this._renderer.getActiveMipmapLevel(),pu=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:pn,minFilter:pn,generateMipmaps:!1,type:Cn,format:jn,colorSpace:Mr,depthBuffer:!1},r=_u(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=_u(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=gu(r)),this._blurMaterial=bu(r,e,t),this._ggxMaterial=yu(r,e,t)}return r}_compileMaterial(e){let t=new K(new Eo,e);this._renderer.compile(t,cu)}_sceneToCubeUV(e,t,n,r,i){let a=new vl(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(lu),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new K(new ic,new Bo({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1})));let d=this._backgroundBox,f=d.material,p=!1,m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,p=!0):(f.color.copy(lu),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;vu(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(d,a),c.render(e,a)}c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Su()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=xu());let i=r?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=i;let o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;vu(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,cu)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let t=1;t<r;t++)this._applyGGXFilter(e,t-1,t);t.autoClear=n}_applyGGXFilter(e,t,n){let r=this._renderer,i=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let s=a.uniforms,c=n/(this._lodMeshes.length-1),l=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-l*l)*(0+c*1.25),{_lodMax:d}=this,f=this._sizeLods[n],p=3*f*(n>d-iu?n-d+iu:0),m=4*(this._cubeSize-f);s.envMap.value=e.texture,s.roughness.value=u,s.mipInt.value=d-t,vu(i,p,m,3*f,2*f),r.setRenderTarget(i),r.render(o,cu),s.envMap.value=i.texture,s.roughness.value=0,s.mipInt.value=d-n,vu(e,p,m,3*f,2*f),r.setRenderTarget(e),r.render(o,cu)}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&R(`blur direction must be either latitudinal or longitudinal!`);let l=this._lodMeshes[r];l.material=c;let u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/39,p=i/f,m=isFinite(i)?1+Math.floor(3*p):ou;m>ou&&L(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ou}`);let h=[],g=0;for(let e=0;e<ou;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];vu(t,3*v*(r>_-iu?r-_+iu:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,cu)}};function gu(e){let t=[],n=[],r=[],i=e,a=e-iu+1+au.length;for(let o=0;o<a;o++){let a=2**i;t.push(a);let s=1/a;o>e-iu?s=au[o-e+iu-1]:o===0&&(s=0),n.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new Eo;h.setAttribute(`position`,new uo(f,3)),h.setAttribute(`uv`,new uo(p,2)),h.setAttribute(`faceIndex`,new uo(m,1)),r.push(new K(h,null)),i>iu&&i--}return{lodMeshes:r,sizeLods:t,sigmas:n}}function _u(e,t,n){let r=new Vi(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function vu(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function yu(e,t,n){return new xc({name:`PMREMGGXConvolution`,defines:{GGX_SAMPLES:su,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Cu(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function bu(e,t,n){let r=new Float32Array(ou),i=new V(0,1,0);return new xc({name:`SphericalGaussianBlur`,defines:{n:ou,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Cu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function xu(){return new xc({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:Cu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Su(){return new xc({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Cu(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Cu(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}var wu=class extends Vi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new $s(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new ic(5,5,5),i=new xc({name:`CubemapFromEquirect`,uniforms:mc(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new K(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=pn),new jl(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};function Tu(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new wu(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new hu(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new hu(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function Eu(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Kr(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Du(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0?t:(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++,t)}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(i===void 0)return;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else{let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}let s=new(i.count>=65535?po:fo)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function Ou(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}function d(e,i,s,c){if(s===0)return;let u=t.get(`WEBGL_multi_draw`);if(u===null)for(let t=0;t<e.length;t++)l(e[t]/o,i[t],c[t]);else{u.multiDrawElementsInstancedWEBGL(r,i,0,a,e,0,c,0,s);let t=0;for(let e=0;e<s;e++)t+=i[e]*c[e];n.update(t,r,1)}}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function ku(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:R(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Au(e,t,n){let r=new WeakMap,i=new zi;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new Hi(h,p,m,u);g.type=Sn,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new B(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function ju(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var Mu={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function Nu(e,t,n,r,i){let a=new Vi(t,n,{type:e,depthBuffer:r,stencilBuffer:i}),o=new Vi(t,n,{type:Cn,depthBuffer:!1,stencilBuffer:!1}),s=new Eo;s.setAttribute(`position`,new mo([-1,3,0,-1,-1,0,3,-1,0],3)),s.setAttribute(`uv`,new mo([0,2,0,0,2,0],2));let c=new Sc({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),l=new K(s,c),u=new Cl(-1,1,1,-1,0,1),d=null,f=null,p=!1,m,h=null,g=[],_=!1;this.setSize=function(e,t){a.setSize(e,t),o.setSize(e,t);for(let n=0;n<g.length;n++){let r=g[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){g=e,_=g.length>0&&g[0].isRenderPass===!0;let t=a.width,n=a.height;for(let e=0;e<g.length;e++){let r=g[e];r.setSize&&r.setSize(t,n)}},this.begin=function(e,t){if(p||e.toneMapping===0&&g.length===0)return!1;if(h=t,t!==null){let e=t.width,n=t.height;(a.width!==e||a.height!==n)&&this.setSize(e,n)}return _===!1&&e.setRenderTarget(a),m=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return _},this.end=function(e,t){e.toneMapping=m,p=!0;let n=a,r=o;for(let i=0;i<g.length;i++){let a=g[i];if(a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1)){let e=n;n=r,r=e}}if(d!==e.outputColorSpace||f!==e.toneMapping){d=e.outputColorSpace,f=e.toneMapping,c.defines={},U.getTransfer(d)===`srgb`&&(c.defines.SRGB_TRANSFER=``);let t=Mu[f];t&&(c.defines[t]=``),c.needsUpdate=!0}c.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(h),e.render(l,u),h=null,p=!1},this.isCompositing=function(){return p},this.dispose=function(){a.dispose(),o.dispose(),s.dispose(),c.dispose()}}var Pu=new Ri,Fu=new tc(1,1),Iu=new Hi,Lu=new Ui,Ru=new $s,zu=[],Bu=[],Vu=new Float32Array(16),Hu=new Float32Array(9),Uu=new Float32Array(4);function Wu(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=zu[i];if(a===void 0&&(a=new Float32Array(i),zu[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Gu(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Ku(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function qu(e,t){let n=Bu[t];n===void 0&&(n=new Int32Array(t),Bu[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Ju(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Yu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Gu(n,t))return;e.uniform2fv(this.addr,t),Ku(n,t)}}function Xu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Gu(n,t))return;e.uniform3fv(this.addr,t),Ku(n,t)}}function Zu(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Gu(n,t))return;e.uniform4fv(this.addr,t),Ku(n,t)}}function Qu(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Gu(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Ku(n,t)}else{if(Gu(n,r))return;Uu.set(r),e.uniformMatrix2fv(this.addr,!1,Uu),Ku(n,r)}}function $u(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Gu(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Ku(n,t)}else{if(Gu(n,r))return;Hu.set(r),e.uniformMatrix3fv(this.addr,!1,Hu),Ku(n,r)}}function ed(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Gu(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Ku(n,t)}else{if(Gu(n,r))return;Vu.set(r),e.uniformMatrix4fv(this.addr,!1,Vu),Ku(n,r)}}function td(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function nd(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Gu(n,t))return;e.uniform2iv(this.addr,t),Ku(n,t)}}function rd(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Gu(n,t))return;e.uniform3iv(this.addr,t),Ku(n,t)}}function id(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Gu(n,t))return;e.uniform4iv(this.addr,t),Ku(n,t)}}function ad(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function od(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Gu(n,t))return;e.uniform2uiv(this.addr,t),Ku(n,t)}}function sd(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Gu(n,t))return;e.uniform3uiv(this.addr,t),Ku(n,t)}}function cd(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Gu(n,t))return;e.uniform4uiv(this.addr,t),Ku(n,t)}}function ld(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(Fu.compareFunction=n.isReversedDepthBuffer()?518:515,a=Fu):a=Pu,n.setTexture2D(t||a,i)}function ud(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Lu,i)}function dd(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Ru,i)}function fd(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Iu,i)}function pd(e){switch(e){case 5126:return Ju;case 35664:return Yu;case 35665:return Xu;case 35666:return Zu;case 35674:return Qu;case 35675:return $u;case 35676:return ed;case 5124:case 35670:return td;case 35667:case 35671:return nd;case 35668:case 35672:return rd;case 35669:case 35673:return id;case 5125:return ad;case 36294:return od;case 36295:return sd;case 36296:return cd;case 35678:case 36198:case 36298:case 36306:case 35682:return ld;case 35679:case 36299:case 36307:return ud;case 35680:case 36300:case 36308:case 36293:return dd;case 36289:case 36303:case 36311:case 36292:return fd}}function md(e,t){e.uniform1fv(this.addr,t)}function hd(e,t){let n=Wu(t,this.size,2);e.uniform2fv(this.addr,n)}function gd(e,t){let n=Wu(t,this.size,3);e.uniform3fv(this.addr,n)}function _d(e,t){let n=Wu(t,this.size,4);e.uniform4fv(this.addr,n)}function vd(e,t){let n=Wu(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function yd(e,t){let n=Wu(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function bd(e,t){let n=Wu(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function xd(e,t){e.uniform1iv(this.addr,t)}function Sd(e,t){e.uniform2iv(this.addr,t)}function Cd(e,t){e.uniform3iv(this.addr,t)}function wd(e,t){e.uniform4iv(this.addr,t)}function Td(e,t){e.uniform1uiv(this.addr,t)}function Ed(e,t){e.uniform2uiv(this.addr,t)}function Dd(e,t){e.uniform3uiv(this.addr,t)}function Od(e,t){e.uniform4uiv(this.addr,t)}function kd(e,t,n){let r=this.cache,i=t.length,a=qu(n,i);Gu(r,a)||(e.uniform1iv(this.addr,a),Ku(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?Fu:Pu;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function Ad(e,t,n){let r=this.cache,i=t.length,a=qu(n,i);Gu(r,a)||(e.uniform1iv(this.addr,a),Ku(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Lu,a[e])}function jd(e,t,n){let r=this.cache,i=t.length,a=qu(n,i);Gu(r,a)||(e.uniform1iv(this.addr,a),Ku(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Ru,a[e])}function Md(e,t,n){let r=this.cache,i=t.length,a=qu(n,i);Gu(r,a)||(e.uniform1iv(this.addr,a),Ku(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Iu,a[e])}function Nd(e){switch(e){case 5126:return md;case 35664:return hd;case 35665:return gd;case 35666:return _d;case 35674:return vd;case 35675:return yd;case 35676:return bd;case 5124:case 35670:return xd;case 35667:case 35671:return Sd;case 35668:case 35672:return Cd;case 35669:case 35673:return wd;case 5125:return Td;case 36294:return Ed;case 36295:return Dd;case 36296:return Od;case 35678:case 36198:case 36298:case 36306:case 35682:return kd;case 35679:case 36299:case 36307:return Ad;case 35680:case 36300:case 36308:case 36293:return jd;case 36289:case 36303:case 36311:case 36292:return Md}}var Pd=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=pd(t.type)}},Fd=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Nd(t.type)}},Id=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},Ld=/(\w+)(\])?(\[|\.)?/g;function Rd(e,t){e.seq.push(t),e.map[t.id]=t}function zd(e,t,n){let r=e.name,i=r.length;for(Ld.lastIndex=0;;){let a=Ld.exec(r),o=Ld.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Rd(n,l===void 0?new Pd(s,e,t):new Fd(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Id(s),Rd(n,e)),n=e}}}var Bd=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);zd(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Vd(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var Hd=37297,Ud=0;function Wd(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Gd=new H;function Kd(e){U._getMatrix(Gd,U.workingColorSpace,e);let t=`mat3( ${Gd.elements.map(e=>e.toFixed(4))} )`;switch(U.getTransfer(e)){case Nr:return[t,`LinearTransferOETF`];case Pr:return[t,`sRGBTransferOETF`];default:return L(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function qd(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Wd(e.getShaderSource(t),r)}return i}function Jd(e,t){let n=Kd(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}var Yd={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function Xd(e,t){let n=Yd[t];return n===void 0?(L(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Zd=new V;function Qd(){return U.getLuminanceCoefficients(Zd),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Zd.x.toFixed(4)}, ${Zd.y.toFixed(4)}, ${Zd.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function $d(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(nf).join(`
`)}function ef(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function tf(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function nf(e){return e!==``}function rf(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function af(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var of=/^[ \t]*#include +<([\w\d./]+)>/gm;function sf(e){return e.replace(of,lf)}var cf=new Map;function lf(e,t){let n=q[t];if(n===void 0){let e=cf.get(t);if(e!==void 0)n=q[e],L(`WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return sf(n)}var uf=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function df(e){return e.replace(uf,ff)}function ff(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function pf(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var mf={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function hf(e){return mf[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var gf={301:`ENVMAP_TYPE_CUBE`,302:`ENVMAP_TYPE_CUBE`,306:`ENVMAP_TYPE_CUBE_UV`};function _f(e){return e.envMap===!1?`ENVMAP_TYPE_CUBE`:gf[e.envMapMode]||`ENVMAP_TYPE_CUBE`}var vf={302:`ENVMAP_MODE_REFRACTION`};function yf(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:vf[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var bf={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function xf(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:bf[e.combine]||`ENVMAP_BLENDING_NONE`}function Sf(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function Cf(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=hf(n),l=_f(n),u=yf(n),d=xf(n),f=Sf(n),p=$d(n),m=ef(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(nf).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(nf).join(`
`),_.length>0&&(_+=`
`)):(g=[pf(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(nf).join(`
`),_=[pf(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:q.tonemapping_pars_fragment,n.toneMapping===0?``:Xd(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,q.colorspace_pars_fragment,Jd(`linearToOutputTexel`,n.outputColorSpace),Qd(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(nf).join(`
`)),o=sf(o),o=rf(o,n),o=af(o,n),s=sf(s),s=rf(s,n),s=af(s,n),o=df(o),s=df(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Vd(i,i.VERTEX_SHADER,y),S=Vd(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=qd(i,x,`vertex`),n=qd(i,S,`fragment`);R(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):L(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new Bd(i,h),T=tf(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,Hd)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Ud++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var wf=0,Tf=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Ef(e),t.set(e,n)),n}},Ef=class{constructor(e){this.id=wf++,this.code=e,this.usedTimes=0}};function Df(e,t,n,r,i,a){let o=new ea,s=new Tf,c=new Set,l=[],u=new Map,d=r.logarithmicDepthBuffer,f=r.precision,p={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function m(e){return c.add(e),e===0?`uv`:`uv${e}`}function h(i,o,l,u,h){let g=u.fog,_=h.geometry,v=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,b=t.get(i.envMap||v,y),x=b&&b.mapping===306?b.image.height:null,S=p[i.type];i.precision!==null&&(f=r.getMaxPrecision(i.precision),f!==i.precision&&L(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,f,`instead.`));let C=_.morphAttributes.position||_.morphAttributes.normal||_.morphAttributes.color,w=C===void 0?0:C.length,T=0;_.morphAttributes.position!==void 0&&(T=1),_.morphAttributes.normal!==void 0&&(T=2),_.morphAttributes.color!==void 0&&(T=3);let E,D,O,ee;if(S){let e=Yl[S];E=e.vertexShader,D=e.fragmentShader}else E=i.vertexShader,D=i.fragmentShader,s.update(i),O=s.getVertexShaderID(i),ee=s.getFragmentShaderID(i);let k=e.getRenderTarget(),A=e.state.buffers.depth.getReversed(),te=h.isInstancedMesh===!0,j=h.isBatchedMesh===!0,ne=!!i.map,re=!!i.matcap,ie=!!b,ae=!!i.aoMap,oe=!!i.lightMap,se=!!i.bumpMap,ce=!!i.normalMap,M=!!i.displacementMap,le=!!i.emissiveMap,ue=!!i.metalnessMap,de=!!i.roughnessMap,fe=i.anisotropy>0,pe=i.clearcoat>0,me=i.dispersion>0,he=i.iridescence>0,ge=i.sheen>0,_e=i.transmission>0,ve=fe&&!!i.anisotropyMap,ye=pe&&!!i.clearcoatMap,N=pe&&!!i.clearcoatNormalMap,be=pe&&!!i.clearcoatRoughnessMap,P=he&&!!i.iridescenceMap,xe=he&&!!i.iridescenceThicknessMap,F=ge&&!!i.sheenColorMap,Se=ge&&!!i.sheenRoughnessMap,I=!!i.specularMap,Ce=!!i.specularColorMap,we=!!i.specularIntensityMap,Te=_e&&!!i.transmissionMap,Ee=_e&&!!i.thicknessMap,De=!!i.gradientMap,Oe=!!i.alphaMap,ke=i.alphaTest>0,Ae=!!i.alphaHash,je=!!i.extensions,Me=0;i.toneMapped&&(k===null||k.isXRRenderTarget===!0)&&(Me=e.toneMapping);let Ne={shaderID:S,shaderType:i.type,shaderName:i.name,vertexShader:E,fragmentShader:D,defines:i.defines,customVertexShaderID:O,customFragmentShaderID:ee,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:f,batching:j,batchingColor:j&&h._colorsTexture!==null,instancing:te,instancingColor:te&&h.instanceColor!==null,instancingMorph:te&&h.morphTexture!==null,outputColorSpace:k===null?e.outputColorSpace:k.isXRRenderTarget===!0?k.texture.colorSpace:Mr,alphaToCoverage:!!i.alphaToCoverage,map:ne,matcap:re,envMap:ie,envMapMode:ie&&b.mapping,envMapCubeUVHeight:x,aoMap:ae,lightMap:oe,bumpMap:se,normalMap:ce,displacementMap:M,emissiveMap:le,normalMapObjectSpace:ce&&i.normalMapType===1,normalMapTangentSpace:ce&&i.normalMapType===0,metalnessMap:ue,roughnessMap:de,anisotropy:fe,anisotropyMap:ve,clearcoat:pe,clearcoatMap:ye,clearcoatNormalMap:N,clearcoatRoughnessMap:be,dispersion:me,iridescence:he,iridescenceMap:P,iridescenceThicknessMap:xe,sheen:ge,sheenColorMap:F,sheenRoughnessMap:Se,specularMap:I,specularColorMap:Ce,specularIntensityMap:we,transmission:_e,transmissionMap:Te,thicknessMap:Ee,gradientMap:De,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Oe,alphaTest:ke,alphaHash:Ae,combine:i.combine,mapUv:ne&&m(i.map.channel),aoMapUv:ae&&m(i.aoMap.channel),lightMapUv:oe&&m(i.lightMap.channel),bumpMapUv:se&&m(i.bumpMap.channel),normalMapUv:ce&&m(i.normalMap.channel),displacementMapUv:M&&m(i.displacementMap.channel),emissiveMapUv:le&&m(i.emissiveMap.channel),metalnessMapUv:ue&&m(i.metalnessMap.channel),roughnessMapUv:de&&m(i.roughnessMap.channel),anisotropyMapUv:ve&&m(i.anisotropyMap.channel),clearcoatMapUv:ye&&m(i.clearcoatMap.channel),clearcoatNormalMapUv:N&&m(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:be&&m(i.clearcoatRoughnessMap.channel),iridescenceMapUv:P&&m(i.iridescenceMap.channel),iridescenceThicknessMapUv:xe&&m(i.iridescenceThicknessMap.channel),sheenColorMapUv:F&&m(i.sheenColorMap.channel),sheenRoughnessMapUv:Se&&m(i.sheenRoughnessMap.channel),specularMapUv:I&&m(i.specularMap.channel),specularColorMapUv:Ce&&m(i.specularColorMap.channel),specularIntensityMapUv:we&&m(i.specularIntensityMap.channel),transmissionMapUv:Te&&m(i.transmissionMap.channel),thicknessMapUv:Ee&&m(i.thicknessMap.channel),alphaMapUv:Oe&&m(i.alphaMap.channel),vertexTangents:!!_.attributes.tangent&&(ce||fe),vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!_.attributes.color&&_.attributes.color.itemSize===4,pointsUvs:h.isPoints===!0&&!!_.attributes.uv&&(ne||Oe),fog:!!g,useFog:i.fog===!0,fogExp2:!!g&&g.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||_.attributes.normal===void 0&&ce===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:A,skinning:h.isSkinnedMesh===!0,morphTargets:_.morphAttributes.position!==void 0,morphNormals:_.morphAttributes.normal!==void 0,morphColors:_.morphAttributes.color!==void 0,morphTargetsCount:w,morphTextureStride:T,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Me,decodeVideoTexture:ne&&i.map.isVideoTexture===!0&&U.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:le&&i.emissiveMap.isVideoTexture===!0&&U.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:je&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(je&&i.extensions.multiDraw===!0||j)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return Ne.vertexUv1s=c.has(1),Ne.vertexUv2s=c.has(2),Ne.vertexUv3s=c.has(3),c.clear(),Ne}function g(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(_(n,t),v(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function _(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function v(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),e.push(o.mask)}function y(e){let t=p[e.type],n;if(t){let e=Yl[t];n=vc.clone(e.uniforms)}else n=e.uniforms;return n}function b(t,n){let r=u.get(n);return r===void 0?(r=new Cf(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function x(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function S(e){s.remove(e)}function C(){s.dispose()}return{getParameters:h,getProgramCacheKey:g,getUniforms:y,acquireProgram:b,releaseProgram:x,releaseShaderCache:S,programs:l,dispose:C}}function Of(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function kf(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Af(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function jf(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||kf),r.length>1&&r.sort(t||Af),i.length>1&&i.sort(t||Af)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function Mf(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new jf,e.set(t,[i])):n>=r.length?(i=new jf,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Nf(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new V,color:new G};break;case`SpotLight`:n={position:new V,direction:new V,color:new G,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new V,color:new G,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new V,skyColor:new G,groundColor:new G};break;case`RectAreaLight`:n={color:new G,position:new V,halfWidth:new V,halfHeight:new V}}return e[t.id]=n,n}}}function Pf(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new B,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Ff=0;function If(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Lf(e){let t=new Nf,n=Pf(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new V);let i=new V,a=new W,o=new W;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(If);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=null;if(y.shadow&&y.shadow.map&&(C=y.shadow.map.texture.format===1030?y.shadow.map.texture:y.shadow.map.depthTexture||y.shadow.map.texture),y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=J.LTC_FLOAT_1,r.rectAreaLTC2=J.LTC_FLOAT_2):(r.rectAreaLTC1=J.LTC_HALF_1,r.rectAreaLTC2=J.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=Ff++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function Rf(e){let t=new Lf(e),n=[],r=[];function i(e){l.camera=e,n.length=0,r.length=0}function a(e){n.push(e)}function o(e){r.push(e)}function s(){t.setup(n)}function c(e){t.setupView(n,e)}let l={lightsArray:n,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:s,setupLightsView:c,pushLight:a,pushShadow:o}}function zf(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Rf(e),t.set(n,[a])):r>=i.length?(a=new Rf(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var Bf=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Vf=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Hf=[new V(1,0,0),new V(-1,0,0),new V(0,1,0),new V(0,-1,0),new V(0,0,1),new V(0,0,-1)],Uf=[new V(0,-1,0),new V(0,-1,0),new V(0,0,1),new V(0,0,-1),new V(0,-1,0),new V(0,-1,0)],Wf=new W,Gf=new V,Kf=new V;function qf(e,t,n){let r=new js,i=new B,a=new B,o=new zi,s=new Tc,c=new Ec,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new xc({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new B},radius:{value:4}},vertexShader:Bf,fragmentShader:Vf}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Eo;m.setAttribute(`position`,new uo(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new K(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;this.type===2&&(L(`WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead.`),this.type=1);let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==this.type;p&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){L(`WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let m=d.getFrameExtents();i.multiply(m),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/m.x),i.x=a.x*m.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/m.y),i.y=a.y*m.y,d.mapSize.y=a.y));let h=e.state.buffers.depth.getReversed();if(d.camera._reversedDepth=h,d.map===null||p===!0){if(d.map!==null&&(d.map.depthTexture!==null&&(d.map.depthTexture.dispose(),d.map.depthTexture=null),d.map.dispose()),this.type===3){if(l.isPointLight){L(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}d.map=new Vi(i.x,i.y,{format:In,type:Cn,minFilter:pn,magFilter:pn,generateMipmaps:!1}),d.map.texture.name=l.name+`.shadowMap`,d.map.depthTexture=new tc(i.x,i.y,Sn),d.map.depthTexture.name=l.name+`.shadowMapDepth`,d.map.depthTexture.format=Mn,d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=un,d.map.depthTexture.magFilter=un}else l.isPointLight?(d.map=new wu(i.x),d.map.depthTexture=new nc(i.x,xn)):(d.map=new Vi(i.x,i.y),d.map.depthTexture=new tc(i.x,i.y,xn)),d.map.depthTexture.name=l.name+`.shadowMap`,d.map.depthTexture.format=Mn,this.type===1?(d.map.depthTexture.compareFunction=h?518:515,d.map.depthTexture.minFilter=pn,d.map.depthTexture.magFilter=pn):(d.map.depthTexture.compareFunction=null,d.map.depthTexture.minFilter=un,d.map.depthTexture.magFilter=un);d.camera.updateProjectionMatrix()}let g=d.map.isWebGLCubeRenderTarget?6:1;for(let t=0;t<g;t++){if(d.map.isWebGLCubeRenderTarget)e.setRenderTarget(d.map,t),e.clear();else{t===0&&(e.setRenderTarget(d.map),e.clear());let n=d.getViewport(t);o.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),f.viewport(o)}if(l.isPointLight){let e=d.camera,n=d.matrix,r=l.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Gf.setFromMatrixPosition(l.matrixWorld),e.position.copy(Gf),Kf.copy(e.position),Kf.add(Hf[t]),e.up.copy(Uf[t]),e.lookAt(Kf),e.updateMatrixWorld(),n.makeTranslation(-Gf.x,-Gf.y,-Gf.z),Wf.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),d._frustum.setFromProjectionMatrix(Wf,e.coordinateSystem,e.reversedDepth)}else d.updateMatrices(l);r=d.getFrustum(),b(n,s,d.camera,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new Vi(i.x,i.y,{format:In,type:Cn})),f.uniforms.shadow_pass.value=n.map.depthTexture,f.uniforms.resolution.value=n.mapSize,f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value=n.mapSize,p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||r.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=y(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)b(c[e],i,a,o,s)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function Jf(e,t){function n(){let t=!1,n=new zi,r=null,i=new zi(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?ue(e.DEPTH_TEST):de(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=Jr[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?ue(e.STENCIL_TEST):de(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new G(0,0,0),w=0,T=!1,E=null,D=null,O=null,ee=null,k=null,A=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),te=!1,j=0,ne=e.getParameter(e.VERSION);ne.indexOf(`WebGL`)===-1?ne.indexOf(`OpenGL ES`)!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(ne)[1]),te=j>=2):(j=parseFloat(/^WebGL (\d)/.exec(ne)[1]),te=j>=1);let re=null,ie={},ae=e.getParameter(e.SCISSOR_BOX),oe=e.getParameter(e.VIEWPORT),se=new zi().fromArray(ae),ce=new zi().fromArray(oe);function M(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let le={};le[e.TEXTURE_2D]=M(e.TEXTURE_2D,e.TEXTURE_2D,1),le[e.TEXTURE_CUBE_MAP]=M(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),le[e.TEXTURE_2D_ARRAY]=M(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),le[e.TEXTURE_3D]=M(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),ue(e.DEPTH_TEST),o.setFunc(3),ye(!1),N(1),ue(e.CULL_FACE),_e(0);function ue(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function de(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function fe(t,n){return d[t]!==n&&(e.bindFramebuffer(t,n),d[t]=n,t===e.DRAW_FRAMEBUFFER&&(d[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(d[e.DRAW_FRAMEBUFFER]=n),!0)}function pe(t,n){let r=p,i=!1;if(t){r=f.get(n),r===void 0&&(r=[],f.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function me(t){return m!==t&&(e.useProgram(t),m=t,!0)}let he={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};he[103]=e.MIN,he[104]=e.MAX;let ge={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function _e(t,n,r,i,a,o,s,c,l,u){if(t===0){h===!0&&(de(e.BLEND),h=!1);return}if(h===!1&&(ue(e.BLEND),h=!0),t!==5){if(t!==g||u!==T){if((_!==100||b!==100)&&(e.blendEquation(e.FUNC_ADD),_=100,b=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:R(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:R(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:R(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:R(`WebGLState: Invalid blending: `,t)}v=null,y=null,x=null,S=null,C.set(0,0,0),w=0,g=t,T=u}return}a||=n,o||=r,s||=i,(n!==_||a!==b)&&(e.blendEquationSeparate(he[n],he[a]),_=n,b=a),(r!==v||i!==y||o!==x||s!==S)&&(e.blendFuncSeparate(ge[r],ge[i],ge[o],ge[s]),v=r,y=i,x=o,S=s),(c.equals(C)===!1||l!==w)&&(e.blendColor(c.r,c.g,c.b,l),C.copy(c),w=l),g=t,T=!1}function ve(t,n){t.side===2?de(e.CULL_FACE):ue(e.CULL_FACE);let r=t.side===1;n&&(r=!r),ye(r),t.blending===1&&t.transparent===!1?_e(0):_e(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),P(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?ue(e.SAMPLE_ALPHA_TO_COVERAGE):de(e.SAMPLE_ALPHA_TO_COVERAGE)}function ye(t){E!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),E=t)}function N(t){t===0?de(e.CULL_FACE):(ue(e.CULL_FACE),t!==D&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),D=t}function be(t){t!==O&&(te&&e.lineWidth(t),O=t)}function P(t,n,r){t?(ue(e.POLYGON_OFFSET_FILL),(ee!==n||k!==r)&&(ee=n,k=r,o.getReversed()&&(n=-n),e.polygonOffset(n,r))):de(e.POLYGON_OFFSET_FILL)}function xe(t){t?ue(e.SCISSOR_TEST):de(e.SCISSOR_TEST)}function F(t){t===void 0&&(t=e.TEXTURE0+A-1),re!==t&&(e.activeTexture(t),re=t)}function Se(t,n,r){r===void 0&&(r=re===null?e.TEXTURE0+A-1:re);let i=ie[r];i===void 0&&(i={type:void 0,texture:void 0},ie[r]=i),(i.type!==t||i.texture!==n)&&(re!==r&&(e.activeTexture(r),re=r),e.bindTexture(t,n||le[t]),i.type=t,i.texture=n)}function I(){let t=ie[re];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Ce(){try{e.compressedTexImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function we(){try{e.compressedTexImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Te(){try{e.texSubImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ee(){try{e.texSubImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function De(){try{e.compressedTexSubImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Oe(){try{e.compressedTexSubImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function ke(){try{e.texStorage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ae(){try{e.texStorage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function je(){try{e.texImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Me(){try{e.texImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ne(t){se.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),se.copy(t))}function Pe(t){ce.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ce.copy(t))}function Fe(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Ie(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Le(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),u={},re=null,ie={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new G(0,0,0),w=0,T=!1,E=null,D=null,O=null,ee=null,k=null,se.set(0,0,e.canvas.width,e.canvas.height),ce.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:ue,disable:de,bindFramebuffer:fe,drawBuffers:pe,useProgram:me,setBlending:_e,setMaterial:ve,setFlipSided:ye,setCullFace:N,setLineWidth:be,setPolygonOffset:P,setScissorTest:xe,activeTexture:F,bindTexture:Se,unbindTexture:I,compressedTexImage2D:Ce,compressedTexImage3D:we,texImage2D:je,texImage3D:Me,updateUBOMapping:Fe,uniformBlockBinding:Ie,texStorage2D:ke,texStorage3D:Ae,texSubImage2D:Te,texSubImage3D:Ee,compressedTexSubImage2D:De,compressedTexSubImage3D:Oe,scissor:Ne,viewport:Pe,reset:Le}}function Yf(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new B,u=new WeakMap,d,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function m(e,t){return p?new OffscreenCanvas(e,t):Vr(`canvas`)}function h(e,t,n){let r=1,i=Se(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);d===void 0&&(d=m(n,a));let o=t?m(n,a):d;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),L(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&L(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function g(e){return e.generateMipmaps}function _(t){e.generateMipmap(t)}function v(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function y(n,r,i,a,o=!1){if(n!==null){if(e[n]!==void 0)return e[n];L(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let s=r;if(r===e.RED&&(i===e.FLOAT&&(s=e.R32F),i===e.HALF_FLOAT&&(s=e.R16F),i===e.UNSIGNED_BYTE&&(s=e.R8)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.R8UI),i===e.UNSIGNED_SHORT&&(s=e.R16UI),i===e.UNSIGNED_INT&&(s=e.R32UI),i===e.BYTE&&(s=e.R8I),i===e.SHORT&&(s=e.R16I),i===e.INT&&(s=e.R32I)),r===e.RG&&(i===e.FLOAT&&(s=e.RG32F),i===e.HALF_FLOAT&&(s=e.RG16F),i===e.UNSIGNED_BYTE&&(s=e.RG8)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RG8UI),i===e.UNSIGNED_SHORT&&(s=e.RG16UI),i===e.UNSIGNED_INT&&(s=e.RG32UI),i===e.BYTE&&(s=e.RG8I),i===e.SHORT&&(s=e.RG16I),i===e.INT&&(s=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGB8UI),i===e.UNSIGNED_SHORT&&(s=e.RGB16UI),i===e.UNSIGNED_INT&&(s=e.RGB32UI),i===e.BYTE&&(s=e.RGB8I),i===e.SHORT&&(s=e.RGB16I),i===e.INT&&(s=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(s=e.RGBA16UI),i===e.UNSIGNED_INT&&(s=e.RGBA32UI),i===e.BYTE&&(s=e.RGBA8I),i===e.SHORT&&(s=e.RGBA16I),i===e.INT&&(s=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_INT_5_9_9_9_REV&&(s=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(s=e.R11F_G11F_B10F)),r===e.RGBA){let t=o?Nr:U.getTransfer(a);i===e.FLOAT&&(s=e.RGBA32F),i===e.HALF_FLOAT&&(s=e.RGBA16F),i===e.UNSIGNED_BYTE&&(s=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT_4_4_4_4&&(s=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(s=e.RGB5_A1)}return(s===e.R16F||s===e.R32F||s===e.RG16F||s===e.RG32F||s===e.RGBA16F||s===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),s}function b(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,L(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function x(e,t){return g(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function S(e){let t=e.target;t.removeEventListener(`dispose`,S),w(t),t.isVideoTexture&&u.delete(t)}function C(e){let t=e.target;t.removeEventListener(`dispose`,C),E(t)}function w(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=f.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&T(e),Object.keys(i).length===0&&f.delete(n)}r.remove(e)}function T(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=f.get(i);delete a[n.__cacheKey],o.memory.textures--}function E(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let D=0;function O(){D=0}function ee(){let e=D;return e>=i.maxTextures&&L(`WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+i.maxTextures),D+=1,e}function k(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function A(t,i){let a=r.get(t);if(t.isVideoTexture&&xe(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)L(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)L(`WebGLRenderer: Texture marked for update but image is incomplete`);else{le(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function te(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){le(a,t,i);return}t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null),n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function j(t,i){let a=r.get(t);if(t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version){le(a,t,i);return}n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function ne(t,i){let a=r.get(t);if(t.isCubeDepthTexture!==!0&&t.version>0&&a.__version!==t.version){ue(a,t,i);return}n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let re={[sn]:e.REPEAT,[cn]:e.CLAMP_TO_EDGE,[ln]:e.MIRRORED_REPEAT},ie={[un]:e.NEAREST,[dn]:e.NEAREST_MIPMAP_NEAREST,[fn]:e.NEAREST_MIPMAP_LINEAR,[pn]:e.LINEAR,[mn]:e.LINEAR_MIPMAP_NEAREST,[hn]:e.LINEAR_MIPMAP_LINEAR},ae={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function oe(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&L(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,re[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,re[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,re[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,ie[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,ie[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,ae[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function se(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,S));let i=n.source,a=f.get(i);a===void 0&&(a={},f.set(i,a));let s=k(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&T(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function ce(e,t,n){return Math.floor(Math.floor(e/n)/t)}function M(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=ce(n.start,r.width,4),c=ce(t.start,r.width,4);n.start<=i+1&&a===c&&ce(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=e.getParameter(e.UNPACK_ROW_LENGTH),l=e.getParameter(e.UNPACK_SKIP_PIXELS),u=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;e.pixelStorei(e.UNPACK_SKIP_PIXELS,u),e.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,c),e.pixelStorei(e.UNPACK_SKIP_PIXELS,l),e.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function le(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=se(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let d=r.get(u);if(u.version!==d.__version||l===!0){n.activeTexture(e.TEXTURE0+s);let t=U.getPrimaries(U.workingColorSpace),r=o.colorSpace===``?null:U.getPrimaries(o.colorSpace),f=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,f);let p=h(o.image,!1,i.maxTextureSize);p=F(o,p);let m=a.convert(o.format,o.colorSpace),v=a.convert(o.type),S=y(o.internalFormat,m,v,o.colorSpace,o.isVideoTexture);oe(c,o);let C,w=o.mipmaps,T=o.isVideoTexture!==!0,E=d.__version===void 0||l===!0,D=u.dataReady,O=x(o,p);if(o.isDepthTexture)S=b(o.format===Nn,o.type),E&&(T?n.texStorage2D(e.TEXTURE_2D,1,S,p.width,p.height):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,v,null));else if(o.isDataTexture){if(w.length>0){T&&E&&n.texStorage2D(e.TEXTURE_2D,O,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,v,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,v,C.data);o.generateMipmaps=!1}else T?(E&&n.texStorage2D(e.TEXTURE_2D,O,S,p.width,p.height),D&&M(o,p,m,v)):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,v,p.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){T&&E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,S,w[0].width,w[0].height,p.depth);for(let t=0,r=w.length;t<r;t++)if(C=w[t],o.format!==1023){if(m!==null){if(T){if(D){if(o.layerUpdates.size>0){let r=Gl(C.width,C.height,o.format,o.type);for(let i of o.layerUpdates){let a=C.data.subarray(i*r/C.data.BYTES_PER_ELEMENT,(i+1)*r/C.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,i,C.width,C.height,1,m,a)}o.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,C.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,C.data,0,0)}else L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else T?D&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,v,C.data):n.texImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,m,v,C.data)}else{T&&E&&n.texStorage2D(e.TEXTURE_2D,O,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],o.format===1023?T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,v,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,v,C.data):m===null?L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):T?D&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,C.data):n.compressedTexImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,C.data)}}else if(o.isDataArrayTexture){if(T){if(E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,S,p.width,p.height,p.depth),D){if(o.layerUpdates.size>0){let t=Gl(p.width,p.height,o.format,o.type);for(let r of o.layerUpdates){let i=p.data.subarray(r*t/p.data.BYTES_PER_ELEMENT,(r+1)*t/p.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,r,p.width,p.height,1,m,v,i)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,p.width,p.height,p.depth,m,v,p.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,S,p.width,p.height,p.depth,0,m,v,p.data)}else if(o.isData3DTexture)T?(E&&n.texStorage3D(e.TEXTURE_3D,O,S,p.width,p.height,p.depth),D&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,p.width,p.height,p.depth,m,v,p.data)):n.texImage3D(e.TEXTURE_3D,0,S,p.width,p.height,p.depth,0,m,v,p.data);else if(o.isFramebufferTexture){if(E){if(T)n.texStorage2D(e.TEXTURE_2D,O,S,p.width,p.height);else{let t=p.width,r=p.height;for(let i=0;i<O;i++)n.texImage2D(e.TEXTURE_2D,i,S,t,r,0,m,v,null),t>>=1,r>>=1}}}else if(w.length>0){if(T&&E){let t=Se(w[0]);n.texStorage2D(e.TEXTURE_2D,O,S,t.width,t.height)}for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,m,v,C):n.texImage2D(e.TEXTURE_2D,t,S,m,v,C);o.generateMipmaps=!1}else if(T){if(E){let t=Se(p);n.texStorage2D(e.TEXTURE_2D,O,S,t.width,t.height)}D&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,m,v,p)}else n.texImage2D(e.TEXTURE_2D,0,S,m,v,p);g(o)&&_(c),d.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function ue(t,o,s){if(o.image.length!==6)return;let c=se(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=U.getPrimaries(U.workingColorSpace),r=o.colorSpace===``?null:U.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=h(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=F(o,m[e]);let v=m[0],b=a.convert(o.format,o.colorSpace),S=a.convert(o.type),C=y(o.internalFormat,b,S,o.colorSpace),w=o.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=x(o,v);oe(e.TEXTURE_CUBE_MAP,o);let O;if(f){w&&T&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,v.width,v.height);for(let t=0;t<6;t++){O=m[t].mipmaps;for(let r=0;r<O.length;r++){let i=O[r];o.format===1023?w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,b,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,b,S,i.data):b===null?L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):w?E&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,b,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,i.data)}}}else{if(O=o.mipmaps,w&&T){O.length>0&&D++;let t=Se(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,t.width,t.height)}for(let t=0;t<6;t++)if(p){w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,b,S,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,m[t].width,m[t].height,0,b,S,m[t].data);for(let r=0;r<O.length;r++){let i=O[r].image[t].image;w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,b,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,i.width,i.height,0,b,S,i.data)}}else{w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,b,S,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,b,S,m[t]);for(let r=0;r<O.length;r++){let i=O[r];w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,b,S,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,b,S,i.image[t])}}}g(o)&&_(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function de(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=y(o.internalFormat,d,f,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),P(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,be(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function fe(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=b(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;P(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,be(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,be(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=y(o.internalFormat,c,l,o.colorSpace);P(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,be(n),u,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,be(n),u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function pe(t,i,o){let c=i.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let l=r.get(i.depthTexture);if(l.__renderTarget=i,(!l.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),c){if(l.__webglInit===void 0&&(l.__webglInit=!0,i.depthTexture.addEventListener(`dispose`,S)),l.__webglTexture===void 0){l.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,l.__webglTexture),oe(e.TEXTURE_CUBE_MAP,i.depthTexture);let t=a.convert(i.depthTexture.format),r=a.convert(i.depthTexture.type),o;i.depthTexture.format===1026?o=e.DEPTH_COMPONENT24:i.depthTexture.format===1027&&(o=e.DEPTH24_STENCIL8);for(let n=0;n<6;n++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0,o,i.width,i.height,0,t,r,null)}}else A(i.depthTexture,0);let u=l.__webglTexture,d=be(i),f=c?e.TEXTURE_CUBE_MAP_POSITIVE_X+o:e.TEXTURE_2D,p=i.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===1026)P(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else if(i.depthTexture.format===1027)P(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else throw Error(`Unknown depthTexture format`)}function me(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)for(let e=0;e<6;e++)pe(i.__webglFramebuffer[e],t,e);else{let e=t.texture.mipmaps;e&&e.length>0?pe(i.__webglFramebuffer[0],t,0):pe(i.__webglFramebuffer,t,0)}}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),fe(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),fe(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function he(t,n,i){let a=r.get(t);n!==void 0&&de(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&me(t)}function ge(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,C);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&P(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=y(r.internalFormat,i,o,r.colorSpace,t.isXRRenderTarget===!0),u=be(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),fe(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),oe(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)de(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else de(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);g(i)&&_(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),oe(c,a),de(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),g(a)&&_(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),oe(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)de(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else de(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);g(i)&&_(r),n.unbindTexture()}t.depthBuffer&&me(t)}function _e(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(g(a)){let t=v(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),_(t),n.unbindTexture()}}}let ve=[],ye=[];function N(t){if(t.samples>0){if(P(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(ve.length=0,ye.length=0,ve.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.resolveDepthBuffer===!1&&(ve.push(l),ye.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,ye)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,ve))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function be(e){return Math.min(i.maxSamples,e.samples)}function P(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function xe(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function F(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(U.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&L(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):R(`WebGLTextures: Unsupported texture color space:`,n)),t}function Se(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=ee,this.resetTextureUnits=O,this.setTexture2D=A,this.setTexture2DArray=te,this.setTexture3D=j,this.setTextureCube=ne,this.rebindTextures=he,this.setupRenderTarget=ge,this.updateRenderTargetMipmap=_e,this.updateMultisampleRenderTarget=N,this.setupDepthRenderbuffer=me,this.setupFrameBufferTexture=de,this.useMultisampledRTT=P,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function Xf(e,t){function n(n,r=``){let i,a=U.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Zf=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Qf=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,$f=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new rc(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new xc({vertexShader:Zf,fragmentShader:Qf,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new K(new dc(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ep=class extends Yr{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new $f,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new B,C=null,w=new vl;w.viewport=new zi;let T=new vl;T.viewport=new zi;let E=[w,T],D=new Ml,O=null,ee=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new ya,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new ya,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new ya,b[e]=t),t.getHandSpace()};function k(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function A(){r.removeEventListener(`select`,k),r.removeEventListener(`selectstart`,k),r.removeEventListener(`selectend`,k),r.removeEventListener(`squeeze`,k),r.removeEventListener(`squeezestart`,k),r.removeEventListener(`squeezeend`,k),r.removeEventListener(`end`,A),r.removeEventListener(`inputsourceschange`,te);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}O=null,ee=null,h.reset();for(let e in g)delete g[e];e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,ce.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&L(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&L(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,k),r.addEventListener(`selectstart`,k),r.addEventListener(`selectend`,k),r.addEventListener(`squeeze`,k),r.addEventListener(`squeezestart`,k),r.addEventListener(`squeezeend`,k),r.addEventListener(`end`,A),r.addEventListener(`inputsourceschange`,te),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?Nn:Mn,a=_.stencil?En:xn);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new Vi(d.textureWidth,d.textureHeight,{format:jn,type:gn,depthTexture:new tc(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new Vi(f.framebufferWidth,f.framebufferHeight,{format:jn,type:gn,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),ce.setContext(r),ce.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function te(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}let j=new V,ne=new V;function re(e,t,n){j.setFromMatrixPosition(t.matrixWorld),ne.setFromMatrixPosition(n.matrixWorld);let r=j.distanceTo(ne),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ie(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),D.near=T.near=w.near=t,D.far=T.far=w.far=n,(O!==D.near||ee!==D.far)&&(r.updateRenderState({depthNear:D.near,depthFar:D.far}),O=D.near,ee=D.far),D.layers.mask=e.layers.mask|6,w.layers.mask=D.layers.mask&-5,T.layers.mask=D.layers.mask&-3;let i=e.parent,a=D.cameras;ie(D,i);for(let e=0;e<a.length;e++)ie(a[e],i);a.length===2?re(D,w,T):D.projectionMatrix.copy(w.projectionMatrix),ae(e,D,i)};function ae(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=$r*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return D},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(D)},this.getCameraTexture=function(e){return g[e]};let oe=null;function se(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==D.cameras.length&&(D.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=E[n];o===void 0&&(o=new vl,o.layers.enable(n),o.viewport=new zi,E[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(D.matrix.copy(o.matrix),D.matrix.decompose(D.position,D.quaternion,D.scale)),i===!0&&D.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new rc,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}oe&&oe(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let ce=new ql;ce.setAnimationLoop(se),this.setAnimationLoop=function(e){oe=e},this.dispose=function(){}}},tp=new $i,np=new W;function rp(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,_c(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,tp.copy(o),tp.x*=-1,tp.y*=-1,tp.z*=-1,a.isCubeTexture&&a.isRenderTargetTexture===!1&&(tp.y*=-1,tp.z*=-1),e.envMapRotation.value.setFromMatrix4(np.makeRotationFromEuler(tp)),e.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function ip(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return R(`WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?L(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):L(`WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var ap=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),op=null;function sp(){return op===null&&(op=new ds(ap,16,16,In,Cn),op.name=`DFG_LUT`,op.minFilter=pn,op.magFilter=pn,op.wrapS=cn,op.wrapT=cn,op.generateMipmaps=!1,op.needsUpdate=!0),op}var cp=class{constructor(e={}){let{canvas:t=Hr(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=gn}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);p=n.getContextAttributes().alpha}else p=a;let m=f,h=new Set([Rn,Ln,Fn]),g=new Set([gn,xn,yn,En,wn,Tn]),_=new Uint32Array(4),v=new Int32Array(4),y=null,b=null,x=[],S=[],C=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let w=this,T=!1;this._outputColorSpace=jr;let E=0,D=0,O=null,ee=-1,k=null,A=new zi,te=new zi,j=null,ne=new G(0),re=0,ie=t.width,ae=t.height,oe=1,se=null,ce=null,M=new zi(0,0,ie,ae),le=new zi(0,0,ie,ae),ue=!1,de=new js,fe=!1,pe=!1,me=new W,he=new V,ge=new zi,_e={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ve=!1;function ye(){return O===null?oe:1}let N=n;function be(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r183`),t.addEventListener(`webglcontextlost`,Ue,!1),t.addEventListener(`webglcontextrestored`,We,!1),t.addEventListener(`webglcontextcreationerror`,Ge,!1),N===null){let t=`webgl2`;if(N=be(t,e),N===null)throw be(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw R(`WebGLRenderer: `+e.message),e}let P,xe,F,Se,I,Ce,we,Te,Ee,De,Oe,ke,Ae,je,Me,Ne,Pe,Fe,Ie,Le,Re,ze,Be;function Ve(){P=new Eu(N),P.init(),Re=new Xf(N,P),xe=new nu(N,P,e,Re),F=new Jf(N,P),xe.reversedDepthBuffer&&d&&F.buffers.depth.setReversed(!0),Se=new ku(N),I=new Of,Ce=new Yf(N,P,F,I,xe,Re,Se),we=new Tu(w),Te=new Jl(N),ze=new eu(N,Te),Ee=new Du(N,Te,Se,ze),De=new ju(N,Ee,Te,ze,Se),Fe=new Au(N,xe,Ce),Me=new ru(I),Oe=new Df(w,we,P,xe,ze,Me),ke=new rp(w,I),Ae=new Mf,je=new zf(P),Pe=new $l(w,we,F,De,p,s),Ne=new qf(w,De,xe),Be=new ip(N,Se,xe,F),Ie=new tu(N,P,Se),Le=new Ou(N,P,Se),Se.programs=Oe.programs,w.capabilities=xe,w.extensions=P,w.properties=I,w.renderLists=Ae,w.shadowMap=Ne,w.state=F,w.info=Se}Ve(),m!==1009&&(C=new Nu(m,t.width,t.height,r,i));let He=new ep(w,N);this.xr=He,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){let e=P.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=P.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return oe},this.setPixelRatio=function(e){e!==void 0&&(oe=e,this.setSize(ie,ae,!1))},this.getSize=function(e){return e.set(ie,ae)},this.setSize=function(e,n,r=!0){if(He.isPresenting){L(`WebGLRenderer: Can't change size while VR device is presenting.`);return}ie=e,ae=n,t.width=Math.floor(e*oe),t.height=Math.floor(n*oe),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),C!==null&&C.setSize(t.width,t.height),this.setViewport(0,0,e,n)},this.getDrawingBufferSize=function(e){return e.set(ie*oe,ae*oe).floor()},this.setDrawingBufferSize=function(e,n,r){ie=e,ae=n,oe=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(m===1009){console.error(`THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);return}if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){console.warn(`THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}C.setEffects(e||[])},this.getCurrentViewport=function(e){return e.copy(A)},this.getViewport=function(e){return e.copy(M)},this.setViewport=function(e,t,n,r){e.isVector4?M.set(e.x,e.y,e.z,e.w):M.set(e,t,n,r),F.viewport(A.copy(M).multiplyScalar(oe).round())},this.getScissor=function(e){return e.copy(le)},this.setScissor=function(e,t,n,r){e.isVector4?le.set(e.x,e.y,e.z,e.w):le.set(e,t,n,r),F.scissor(te.copy(le).multiplyScalar(oe).round())},this.getScissorTest=function(){return ue},this.setScissorTest=function(e){F.setScissorTest(ue=e)},this.setOpaqueSort=function(e){se=e},this.setTransparentSort=function(e){ce=e},this.getClearColor=function(e){return e.copy(Pe.getClearColor())},this.setClearColor=function(){Pe.setClearColor(...arguments)},this.getClearAlpha=function(){return Pe.getClearAlpha()},this.setClearAlpha=function(){Pe.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(O!==null){let t=O.texture.format;e=h.has(t)}if(e){let e=O.texture.type,t=g.has(e),n=Pe.getClearColor(),r=Pe.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(_[0]=i,_[1]=a,_[2]=o,_[3]=r,N.clearBufferuiv(N.COLOR,0,_)):(v[0]=i,v[1]=a,v[2]=o,v[3]=r,N.clearBufferiv(N.COLOR,0,v))}else r|=N.COLOR_BUFFER_BIT}t&&(r|=N.DEPTH_BUFFER_BIT),n&&(r|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&N.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener(`webglcontextlost`,Ue,!1),t.removeEventListener(`webglcontextrestored`,We,!1),t.removeEventListener(`webglcontextcreationerror`,Ge,!1),Pe.dispose(),Ae.dispose(),je.dispose(),I.dispose(),we.dispose(),De.dispose(),ze.dispose(),Be.dispose(),Oe.dispose(),He.dispose(),He.removeEventListener(`sessionstart`,Qe),He.removeEventListener(`sessionend`,$e),et.stop()};function Ue(e){e.preventDefault(),Wr(`WebGLRenderer: Context Lost.`),T=!0}function We(){Wr(`WebGLRenderer: Context Restored.`),T=!1;let e=Se.autoReset,t=Ne.enabled,n=Ne.autoUpdate,r=Ne.needsUpdate,i=Ne.type;Ve(),Se.autoReset=e,Ne.enabled=t,Ne.autoUpdate=n,Ne.needsUpdate=r,Ne.type=i}function Ge(e){R(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Ke(e){let t=e.target;t.removeEventListener(`dispose`,Ke),qe(t)}function qe(e){Je(e),I.remove(e)}function Je(e){let t=I.get(e).programs;t!==void 0&&(t.forEach(function(e){Oe.releaseProgram(e)}),e.isShaderMaterial&&Oe.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=_e);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=lt(e,t,n,r,i);F.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Ee.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;ze.setup(i,r,s,n,c);let h,g=Ie;if(c!==null&&(h=Te.get(c),g=Le,g.setIndex(h)),i.isMesh)r.wireframe===!0?(F.setLineWidth(r.wireframeLinewidth*ye()),g.setMode(N.LINES)):g.setMode(N.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),F.setLineWidth(e*ye()),i.isLineSegments?g.setMode(N.LINES):i.isLineLoop?g.setMode(N.LINE_LOOP):g.setMode(N.LINE_STRIP)}else i.isPoints?g.setMode(N.POINTS):i.isSprite&&g.setMode(N.TRIANGLES);if(i.isBatchedMesh){if(i._multiDrawInstances!==null)Kr(`WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.`),g.renderMultiDrawInstances(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount,i._multiDrawInstances);else if(P.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Te.get(c).bytesPerElement:1,o=I.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(N,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function Ye(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,ot(e,t,n),e.side=0,e.needsUpdate=!0,ot(e,t,n),e.side=2):ot(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),b=je.get(n),b.init(t),S.push(b),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(b.pushLight(e),e.castShadow&&b.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(b.pushLight(e),e.castShadow&&b.pushShadow(e))}),b.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t){if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];Ye(a,n,e),r.add(a)}else Ye(t,n,e),r.add(t)}}),b=S.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){if(r.forEach(function(e){I.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0){t(e);return}setTimeout(n,10)}P.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let Xe=null;function Ze(e){Xe&&Xe(e)}function Qe(){et.stop()}function $e(){et.start()}let et=new ql;et.setAnimationLoop(Ze),typeof self<`u`&&et.setContext(self),this.setAnimationLoop=function(e){Xe=e,He.setAnimationLoop(e),e===null?et.stop():et.start()},He.addEventListener(`sessionstart`,Qe),He.addEventListener(`sessionend`,$e),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){R(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(T===!0)return;let n=He.enabled===!0&&He.isPresenting===!0,r=C!==null&&(O===null||n)&&C.begin(w,O);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),He.enabled===!0&&He.isPresenting===!0&&(C===null||C.isCompositing()===!1)&&(He.cameraAutoUpdate===!0&&He.updateCamera(t),t=He.getCamera()),e.isScene===!0&&e.onBeforeRender(w,e,t,O),b=je.get(e,S.length),b.init(t),S.push(b),me.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),de.setFromProjectionMatrix(me,Rr,t.reversedDepth),pe=this.localClippingEnabled,fe=Me.init(this.clippingPlanes,pe),y=Ae.get(e,x.length),y.init(),x.push(y),He.enabled===!0&&He.isPresenting===!0){let e=w.xr.getDepthSensingMesh();e!==null&&tt(e,t,-1/0,w.sortObjects)}tt(e,t,0,w.sortObjects),y.finish(),w.sortObjects===!0&&y.sort(se,ce),ve=He.enabled===!1||He.isPresenting===!1||He.hasDepthSensing()===!1,ve&&Pe.addToRenderList(y,e),this.info.render.frame++,fe===!0&&Me.beginShadows();let i=b.state.shadowsArray;if(Ne.render(i,e,t),fe===!0&&Me.endShadows(),this.info.autoReset===!0&&this.info.reset(),(r&&C.hasRenderPass())===!1){let n=y.opaque,r=y.transmissive;if(b.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];rt(n,r,e,a)}ve&&Pe.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];nt(y,e,n,n.viewport)}}else r.length>0&&rt(n,r,e,t),ve&&Pe.render(e),nt(y,e,t)}O!==null&&D===0&&(Ce.updateMultisampleRenderTarget(O),Ce.updateRenderTargetMipmap(O)),r&&C.end(w),e.isScene===!0&&e.onAfterRender(w,e,t),ze.resetDefaultState(),ee=-1,k=null,S.pop(),S.length>0?(b=S[S.length-1],fe===!0&&Me.setGlobalState(w.clippingPlanes,b.state.camera)):b=null,x.pop(),y=x.length>0?x[x.length-1]:null};function tt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)b.pushLight(e),e.castShadow&&b.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||de.intersectsSprite(e)){r&&ge.setFromMatrixPosition(e.matrixWorld).applyMatrix4(me);let t=De.update(e),i=e.material;i.visible&&y.push(e,t,i,n,ge.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||de.intersectsObject(e))){let t=De.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),ge.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),ge.copy(e.boundingSphere.center)),ge.applyMatrix4(e.matrixWorld).applyMatrix4(me)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&y.push(e,t,s,n,ge.z,o)}}else i.visible&&y.push(e,t,i,n,ge.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)tt(i[e],t,n,r)}function nt(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;b.setupLightsView(n),fe===!0&&Me.setGlobalState(w.clippingPlanes,n),r&&F.viewport(A.copy(r)),i.length>0&&it(i,t,n),a.length>0&&it(a,t,n),o.length>0&&it(o,t,n),F.buffers.depth.setTest(!0),F.buffers.depth.setMask(!0),F.buffers.color.setMask(!0),F.setPolygonOffset(!1)}function rt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(b.state.transmissionRenderTarget[r.id]===void 0){let e=P.has(`EXT_color_buffer_half_float`)||P.has(`EXT_color_buffer_float`);b.state.transmissionRenderTarget[r.id]=new Vi(1,1,{generateMipmaps:!0,type:e?Cn:gn,minFilter:hn,samples:xe.samples,stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:U.workingColorSpace})}let a=b.state.transmissionRenderTarget[r.id],o=r.viewport||A;a.setSize(o.z*w.transmissionResolutionScale,o.w*w.transmissionResolutionScale);let s=w.getRenderTarget(),c=w.getActiveCubeFace(),l=w.getActiveMipmapLevel();w.setRenderTarget(a),w.getClearColor(ne),re=w.getClearAlpha(),re<1&&w.setClearColor(16777215,.5),w.clear(),ve&&Pe.render(n);let u=w.toneMapping;w.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),b.setupLightsView(r),fe===!0&&Me.setGlobalState(w.clippingPlanes,r),it(e,n,r),Ce.updateMultisampleRenderTarget(a),Ce.updateRenderTargetMipmap(a),P.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,at(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(Ce.updateMultisampleRenderTarget(a),Ce.updateRenderTargetMipmap(a))}w.setRenderTarget(s,c,l),w.setClearColor(ne,re),d!==void 0&&(r.viewport=d),w.toneMapping=u}function it(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&at(o,t,n,s,l,c)}}function at(e,t,n,r,i,a){e.onBeforeRender(w,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(w,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,w.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,w.renderBufferDirect(n,t,r,i,e,a),i.side=2):w.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(w,t,n,r,i,a)}function ot(e,t,n){t.isScene!==!0&&(t=_e);let r=I.get(e),i=b.state.lights,a=b.state.shadowsArray,o=i.state.version,s=Oe.getParameters(e,i.state,a,t,n),c=Oe.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=we.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Ke),l=new Map,r.programs=l);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return ct(e,s),d}else s.uniforms=Oe.getUniforms(e),e.onBeforeCompile(s,w),d=Oe.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Me.uniform),ct(e,s),r.needsLights=dt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.currentProgram=d,r.uniformsList=null,d}function st(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Bd.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function ct(e,t){let n=I.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function lt(e,t,n,r,i){t.isScene!==!0&&(t=_e),Ce.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=O===null?w.outputColorSpace:O.isXRRenderTarget===!0?O.texture.colorSpace:Mr,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=we.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(O===null||O.isXRRenderTarget===!0)&&(h=w.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=I.get(r),y=b.state.lights;if(fe===!0&&(pe===!0||e!==k)){let t=e===k&&r.id===ee;Me.setState(r,e,t)}let x=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?x=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?x=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Me.numPlanes||v.numIntersection!==Me.numIntersection)?x=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.toneMapping===h?v.morphTargetsCount!==_&&(x=!0):x=!0:x=!0:x=!0:(x=!0,v.__version=r.version);let S=v.currentProgram;x===!0&&(S=ot(r,t,i));let C=!1,T=!1,E=!1,D=S.getUniforms(),A=v.uniforms;if(F.useProgram(S.program)&&(C=!0,T=!0,E=!0),r.id!==ee&&(ee=r.id,T=!0),C||k!==e){F.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),D.setValue(N,`projectionMatrix`,e.projectionMatrix),D.setValue(N,`viewMatrix`,e.matrixWorldInverse);let t=D.map.cameraPosition;t!==void 0&&t.setValue(N,he.setFromMatrixPosition(e.matrixWorld)),xe.logarithmicDepthBuffer&&D.setValue(N,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&D.setValue(N,`isOrthographic`,e.isOrthographicCamera===!0),k!==e&&(k=e,T=!0,E=!0)}if(v.needsLights&&(y.state.directionalShadowMap.length>0&&D.setValue(N,`directionalShadowMap`,y.state.directionalShadowMap,Ce),y.state.spotShadowMap.length>0&&D.setValue(N,`spotShadowMap`,y.state.spotShadowMap,Ce),y.state.pointShadowMap.length>0&&D.setValue(N,`pointShadowMap`,y.state.pointShadowMap,Ce)),i.isSkinnedMesh){D.setOptional(N,i,`bindMatrix`),D.setOptional(N,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),D.setValue(N,`boneTexture`,e.boneTexture,Ce))}i.isBatchedMesh&&(D.setOptional(N,i,`batchingTexture`),D.setValue(N,`batchingTexture`,i._matricesTexture,Ce),D.setOptional(N,i,`batchingIdTexture`),D.setValue(N,`batchingIdTexture`,i._indirectTexture,Ce),D.setOptional(N,i,`batchingColorTexture`),i._colorsTexture!==null&&D.setValue(N,`batchingColorTexture`,i._colorsTexture,Ce));let te=n.morphAttributes;if((te.position!==void 0||te.normal!==void 0||te.color!==void 0)&&Fe.update(i,n,S),(T||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,D.setValue(N,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(A.envMapIntensity.value=t.environmentIntensity),A.dfgLUT!==void 0&&(A.dfgLUT.value=sp()),T&&(D.setValue(N,`toneMappingExposure`,w.toneMappingExposure),v.needsLights&&ut(A,E),a&&r.fog===!0&&ke.refreshFogUniforms(A,a),ke.refreshMaterialUniforms(A,r,oe,ae,b.state.transmissionRenderTarget[e.id]),Bd.upload(N,st(v),A,Ce)),r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Bd.upload(N,st(v),A,Ce),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&D.setValue(N,`center`,i.center),D.setValue(N,`modelViewMatrix`,i.modelViewMatrix),D.setValue(N,`normalMatrix`,i.normalMatrix),D.setValue(N,`modelMatrix`,i.matrixWorld),r.isShaderMaterial||r.isRawShaderMaterial){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Be.update(n,S),Be.bind(n,S)}}return S}function ut(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function dt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return D},this.getRenderTarget=function(){return O},this.setRenderTargetTextures=function(e,t,n){let r=I.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),I.get(e.texture).__webglTexture=t,I.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=I.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let ft=N.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){O=e,E=t,D=n;let r=null,i=!1,a=!1;if(e){let o=I.get(e);if(o.__useDefaultFramebuffer!==void 0){F.bindFramebuffer(N.FRAMEBUFFER,o.__webglFramebuffer),A.copy(e.viewport),te.copy(e.scissor),j=e.scissorTest,F.viewport(A),F.scissor(te),F.setScissorTest(j),ee=-1;return}if(o.__webglFramebuffer===void 0)Ce.setupRenderTarget(e);else if(o.__hasExternalTextures)Ce.rebindTextures(e,I.get(e.texture).__webglTexture,I.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&I.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);Ce.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=I.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&Ce.useMultisampledRTT(e)===!1?I.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,A.copy(e.viewport),te.copy(e.scissor),j=e.scissorTest}else A.copy(M).multiplyScalar(oe).floor(),te.copy(le).multiplyScalar(oe).floor(),j=ue;if(n!==0&&(r=ft),F.bindFramebuffer(N.FRAMEBUFFER,r)&&F.drawBuffers(e,r),F.viewport(A),F.scissor(te),F.setScissorTest(j),i){let r=I.get(e.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=I.get(e.textures[t]);N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=I.get(e.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,t.__webglTexture,n)}ee=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){F.bindFramebuffer(N.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(e.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+s),!xe.textureFormatReadable(c)){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!xe.textureTypeReadable(l)){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&N.readPixels(t,n,r,i,Re.convert(c),Re.convert(l),a)}finally{let e=O===null?null:I.get(O).__webglFramebuffer;F.bindFramebuffer(N.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=I.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){F.bindFramebuffer(N.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(e.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+s),!xe.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!xe.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,d),N.bufferData(N.PIXEL_PACK_BUFFER,a.byteLength,N.STREAM_READ),N.readPixels(t,n,r,i,Re.convert(l),Re.convert(u),0);let f=O===null?null:I.get(O).__webglFramebuffer;F.bindFramebuffer(N.FRAMEBUFFER,f);let p=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await qr(N,p,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,d),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,a),N.deleteBuffer(d),N.deleteSync(p),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;Ce.setTexture2D(e,0),N.copyTexSubImage2D(N.TEXTURE_2D,n,0,0,o,s,i,a),F.unbindTexture()};let pt=N.createFramebuffer(),mt=N.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Re.convert(t.format),_=Re.convert(t.type),v;t.isData3DTexture?(Ce.setTexture3D(t,0),v=N.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(Ce.setTexture2DArray(t,0),v=N.TEXTURE_2D_ARRAY):(Ce.setTexture2D(t,0),v=N.TEXTURE_2D),N.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,t.flipY),N.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),N.pixelStorei(N.UNPACK_ALIGNMENT,t.unpackAlignment);let y=N.getParameter(N.UNPACK_ROW_LENGTH),b=N.getParameter(N.UNPACK_IMAGE_HEIGHT),x=N.getParameter(N.UNPACK_SKIP_PIXELS),S=N.getParameter(N.UNPACK_SKIP_ROWS),C=N.getParameter(N.UNPACK_SKIP_IMAGES);N.pixelStorei(N.UNPACK_ROW_LENGTH,h.width),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,h.height),N.pixelStorei(N.UNPACK_SKIP_PIXELS,l),N.pixelStorei(N.UNPACK_SKIP_ROWS,u),N.pixelStorei(N.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=I.get(e),r=I.get(t),h=I.get(n.__renderTarget),g=I.get(r.__renderTarget);F.bindFramebuffer(N.READ_FRAMEBUFFER,h.__webglFramebuffer),F.bindFramebuffer(N.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,I.get(e).__webglTexture,i,d+n),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,I.get(t).__webglTexture,a,m+n)),N.blitFramebuffer(l,u,o,s,f,p,o,s,N.DEPTH_BUFFER_BIT,N.NEAREST);F.bindFramebuffer(N.READ_FRAMEBUFFER,null),F.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||I.has(e)){let n=I.get(e),r=I.get(t);F.bindFramebuffer(N.READ_FRAMEBUFFER,pt),F.bindFramebuffer(N.DRAW_FRAMEBUFFER,mt);for(let e=0;e<c;e++)w?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,n.__webglTexture,i),T?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,r.__webglTexture,a),i===0?T?N.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):N.copyTexSubImage2D(v,a,f,p,l,u,o,s):N.blitFramebuffer(l,u,o,s,f,p,o,s,N.COLOR_BUFFER_BIT,N.NEAREST);F.bindFramebuffer(N.READ_FRAMEBUFFER,null),F.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?N.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?N.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):N.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):N.texSubImage2D(N.TEXTURE_2D,a,f,p,o,s,g,_,h);N.pixelStorei(N.UNPACK_ROW_LENGTH,y),N.pixelStorei(N.UNPACK_IMAGE_HEIGHT,b),N.pixelStorei(N.UNPACK_SKIP_PIXELS,x),N.pixelStorei(N.UNPACK_SKIP_ROWS,S),N.pixelStorei(N.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&N.generateMipmap(v),F.unbindTexture()},this.initRenderTarget=function(e){I.get(e).__webglFramebuffer===void 0&&Ce.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?Ce.setTextureCube(e,0):e.isData3DTexture?Ce.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?Ce.setTexture2DArray(e,0):Ce.setTexture2D(e,0),F.unbindTexture()},this.resetState=function(){E=0,D=0,O=null,F.reset(),ze.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return Rr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=U._getDrawingBufferColorSpace(e),t.unpackColorSpace=U._getUnpackColorSpace()}};function lp(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new Eo,l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let e in d.morphAttributes){if(!i.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;o[e]===void 0&&(o[e]=[]),o[e].push(d.morphAttributes[e])}if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=up(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t===0)break;c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=up(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}return c}function up(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new uo(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}function dp(e,t){if(t===0)return console.warn(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.`),e;if(t===2||t===1){let n=e.getIndex();if(n===null){let t=[],r=e.getAttribute(`position`);if(r!==void 0){for(let e=0;e<r.count;e++)t.push(e);e.setIndex(t),n=e.getIndex()}else return console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.`),e}let r=n.count-2,i=[];if(t===2)for(let e=1;e<=r;e++)i.push(n.getX(0)),i.push(n.getX(e)),i.push(n.getX(e+1));else for(let e=0;e<r;e++)e%2==0?(i.push(n.getX(e)),i.push(n.getX(e+1)),i.push(n.getX(e+2))):(i.push(n.getX(e+2)),i.push(n.getX(e+1)),i.push(n.getX(e)));i.length/3!==r&&console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.`);let a=e.clone();return a.setIndex(i),a.clearGroups(),a}return console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:`,t),e}function fp(){let e=new Eo;e.setAttribute(`position`,new uo(new Float32Array(366),3).setUsage(Lr));let t=[],n=[];for(let e=0;e<=60;e++)t.push(e/60,e/60);e.setAttribute(`progress`,new mo(t,1));for(let e=0;e<60;e++){let t=e*2;n.push(t,t+1,t+2,t+1,t+3,t+2)}e.setIndex(n);let r=new K(e,new xc({uniforms:{tint:{value:new G(`#007aff`)},alpha:{value:.27},time:{value:0},pulse:{value:0},ego:{value:new V},body:{value:new B}},vertexShader:`attribute float progress; varying float vProgress; varying vec2 vWorld; void main() { vProgress = progress; vWorld = (modelMatrix * vec4(position, 1.0)).xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,fragmentShader:`uniform vec3 tint; uniform float alpha; uniform float time; uniform float pulse; uniform vec3 ego; uniform vec2 body; varying float vProgress; varying vec2 vWorld; void main() {
      vec2 delta = vWorld - ego.xy;
      float right = dot(delta, vec2(cos(ego.z), sin(ego.z)));
      float ahead = dot(delta, vec2(sin(ego.z), -cos(ego.z)));
      if (abs(right) < body.x && abs(ahead) < body.y) discard; float fade = (1.0 - smoothstep(0.72,1.0,vProgress)) * smoothstep(0.015,0.08,vProgress); float scan = 1.0 - pulse * (0.5 + 0.5 * sin(vProgress * 18.0 - time * 6.0)); gl_FragColor = vec4(tint, alpha * fade * scan);
      #include <colorspace_fragment>
    }`,transparent:!0,depthWrite:!1,side:2,toneMapped:!1}));return r.frustumCulled=!1,r.renderOrder=3,r}function pp(e,t,n,r){let i=e.geometry.attributes.position;for(let e=0;e<t.length;e++){let a=t[Math.max(0,e-1)],o=t[Math.min(t.length-1,e+1)],s=o.x-a.x,c=o.z-a.z,l=Math.hypot(s,c)||1;i.setXYZ(e*2,t[e].x-c/l*n,r,t[e].z+s/l*n),i.setXYZ(e*2+1,t[e].x+c/l*n,r,t[e].z-s/l*n)}i.needsUpdate=!0}function mp(e){if(e.displayPaths)return;let t=e.origin,n=Math.sin(t.heading),r=Math.cos(t.heading);e.displayPaths=Object.fromEntries(Object.entries(e.projections).map(([i,a])=>{let o=e.vectors[i].velocity_mps<0?-1:1;return[i,a.points.map(e=>{let i=e.x+Math.sin(e.heading)*(t.depth/2+.2)*o,a=e.z-Math.cos(e.heading)*(t.depth/2+.2)*o;return{right:(i-t.x)*r+(a-t.z)*n,ahead:(i-t.x)*n-(a-t.z)*r}})]}))}function hp(e,t,n,r,i,a){let o=t.velocity_mps<0?-1:1,s=a?0:1-Math.exp(-Math.min(i,.1)/.22),c=r.direction===o?r.points:null;r.direction=o,r.points=n.map((e,t)=>{let n=t===0||!c?1:s;return{right:c?c[t].right+(e.right-c[t].right)*n:e.right,ahead:c?c[t].ahead+(e.ahead-c[t].ahead)*n:e.ahead}});let l=Math.sin(e.heading),u=Math.cos(e.heading);return r.points.map(t=>({x:e.x+t.right*u+t.ahead*l,z:e.z+t.right*l-t.ahead*u}))}var gp=class{constructor(e,t){this.group=new _a,this.group.visible=!1,e.add(this.group),this.layer=t,t.hidden=!0,t.replaceChildren(),this.enabled=!0,this.showCandidates=!1,this.items=new Map,this.pool=Array.from({length:12},()=>{let e=fp(),n=fp(),r=document.createElement(`span`);return r.className=`vector-label`,r.hidden=!0,t.append(r),this.group.add(n,e),{line:e,glow:n,label:r,width:.055,opacity:.4,animation:{}}}),this.selected=fp(),this.selectedGlow=fp(),this.group.add(this.selectedGlow,this.selected),this.clear()}setCandidates(e){mp(e),this.plan=e,this.items=new Map(Object.keys(e.vectors).map((e,t)=>[e,this.pool[t]]))}setAnswer(e,t){this.setCandidates(t),this.answer=e,this.answeredPlan=t,this.received=performance.now()}clear(){this.answer=null,this.plan=null,this.answeredPlan=null,this.received=0,this.selectedAnimation={};for(let e of this.pool)e.animation={};this.group.visible=!1,this.layer.hidden=!0}render(e,t,n,r,i,a,o){let s=o?0:performance.now()-this.received,c=a?j(this.answer,this.answeredPlan?.eligible,s):null,l=c?this.answeredPlan.projections[this.answer.choice]:null,u=this.enabled&&!!l||this.showCandidates&&!!this.plan;if(this.group.visible=u,this.layer.hidden=!u,!u)return;this.selected.visible=this.selectedGlow.visible=this.enabled&&!!l;let d=l?this.answeredPlan:this.plan;for(let t of this.group.children)t.material.uniforms.ego.value.set(e.x,e.z,e.heading),t.material.uniforms.body.value.set(e.width/2+.12,e.depth/2+.15);let f=null;if(l&&this.enabled){let t=this.answeredPlan.vectors[this.answer.choice],n=hp(e,t,this.answeredPlan.displayPaths[this.answer.choice],this.selectedAnimation,i,o);f=n,pp(this.selected,n,.2,.25),pp(this.selectedGlow,n,.5,.195),this.selected.material.uniforms.alpha.value=.9,this.selectedGlow.material.uniforms.alpha.value=.15,this.selected.renderOrder=5}for(let e of this.pool)e.line.visible=e.glow.visible=!1,e.label.hidden=!0;if(!this.showCandidates||!d)return;let p=Object.entries(d.vectors).sort(([,e],[,t])=>{let n=Math.sign(e.velocity_mps),r=Math.sign(t.velocity_mps);return r-n||e.steering*n-t.steering*r});this.items=new Map(p.map(([e],t)=>[e,this.pool[t]]));let m=0;for(let[a,s]of this.items){let l=d.vectors[a],u=!!c?.[a]?.selected,p=hp(e,l,d.displayPaths[a],s.animation,i,o),h=u&&f?f:p;s.width=u?.2:.055,s.line.visible=!u||!this.enabled,pp(s.line,h,s.width,.22),s.line.material.uniforms.tint.value.set(l.collision_predicted?`#e86940`:l.velocity_mps<0?`#9a6bff`:!l.stays_on_road||!l.stays_in_lane?`#e6a34b`:l.steering<-.02?`#38bcd6`:`#48a5ff`),s.line.material.uniforms.alpha.value=l.collision_predicted?.3:.65;let g=h[Math.floor(60*(.55+m%4*.12))],_=new V(g.x,.7,g.z).project(t),v=c?.[a]?.probability;s.label.hidden=v===void 0||!l.velocity_mps||_.z>1||_.z<0||Math.abs(_.x)>1||Math.abs(_.y)>1,s.label.dataset.vector=a,s.label.classList.toggle(`selected`,u),m++,s.label.textContent=v===void 0?``:`${Math.round(v*100)}%`,s.label.setAttribute(`aria-label`,`${ne(l)}, ${Math.abs(l.velocity_mps).toFixed(1)} meters per second${u?`, selected`:``}`),s.label.style.opacity=u?`1`:`0.75`,s.label.style.transform=`translate(${(_.x*.5+.5)*n}px,${(-.5*_.y+.5)*r-m%3*17}px) translate(-50%,-50%)`}}},_p=class{constructor(e){this.scene=e,this.group=new _a,this.group.name=`impact-effects`,e.add(this.group),this.age=0,this.crash=null,this.fragments=[],this.smoke=[],this.actors=[]}crumple(e,t,n){e.updateMatrixWorld(!0),e.traverse(e=>{if(!e.isMesh)return;let r=e.worldToLocal(new V(t.x,.8,t.z)),i=e.geometry.attributes.position;for(let e=0;e<i.count;e++){let t=new V().fromBufferAttribute(i,e),a=Math.max(0,1-t.distanceTo(r)/2.2);a&&(t.x*=1-a*.22*n,t.z*=1-a*.37*n,t.y+=Math.sin(t.x*14+t.z*9)*a*.19*n,i.setXYZ(e,t.x,t.y,t.z))}i.needsUpdate=!0,e.geometry.computeVertexNormals(),e.geometry.computeBoundingSphere()})}start(e,t,n,r){this.crash=e;let a=d(Math.round(e.time_s*1e3)+79),o=i(e.impact_speed_mps/18,.3,1.5);this.crumple(t,e.point,o),n&&e.type!==`pedestrian`&&this.crumple(n,e.point,o),n&&this.actors.push({model:n,position:n.position.clone(),rotation:n.rotation.clone(),fall:e.type===`pedestrian`||e.type===`motorcycle`,distance:Math.min(e.type===`pedestrian`?1.5:.9,o)});let s=[`#43484e`,`#8ba0ae`,`#b7bdc5`,`#e1e3e4`];e.type===`building`&&s.push(r.color||`#b2a599`,`#918579`);for(let t=0;t<24+Math.floor(o*20);t++){let n=.04+a()*.16,r=new K(new ic(n*2,n,n*1.3),new Cc({color:s[t%s.length],roughness:.65,metalness:t%3?.3:0}));r.position.set(e.point.x,.55+a()*.8,e.point.z),r.castShadow=!0,this.group.add(r),this.fragments.push({mesh:r,velocity:new V((a()-.5)*6*o+e.normal.x*2,1.5+a()*4*o,(a()-.5)*6*o+e.normal.z*2),spin:new V(a()*9,a()*9,a()*9)})}if(e.type===`building`){let t=new K(new oc(1.1*o,9),new Cc({color:`#3d3833`,roughness:1,side:2}));t.position.set(e.point.x+e.normal.x*.025,.9,e.point.z+e.normal.z*.025),t.quaternion.setFromUnitVectors(new V(0,0,1),new V(e.normal.x,0,e.normal.z).normalize()),this.group.add(t);for(let e=0;e<9;e++){let n=e*Math.PI*2/9,r=new K(new ic(.025,1.2+a(),.02),new Bo({color:`#50483f`}));r.position.set(Math.cos(n)*1.1,Math.sin(n)*.7,.01),r.rotation.z=n-Math.PI/2,t.add(r)}}for(let e=0;e<12;e++){let t=new K(new uc(.5,2),new Cc({color:e%2?`#889097`:`#b4b5b5`,transparent:!0,opacity:0,depthWrite:!1,roughness:1}));this.group.add(t),this.smoke.push({mesh:t,phase:e/12,drift:a()-.5})}}update(e){if(!this.crash)return;this.age+=e;for(let t of this.fragments)t.mesh.position.y<=.12&&t.velocity.lengthSq()<.08||(t.velocity.y-=e*9.8,t.mesh.position.addScaledVector(t.velocity,e),t.mesh.rotation.x+=t.spin.x*e,t.mesh.rotation.z+=t.spin.z*e,t.mesh.position.y<.12&&(t.mesh.position.y=.12,t.velocity.y=Math.abs(t.velocity.y)*.22,t.velocity.x*=.65,t.velocity.z*=.65,t.spin.multiplyScalar(.5)));let t=1-Math.exp(-this.age*4);for(let e of this.actors)e.model.position.copy(e.position).add(new V(-this.crash.normal.x,0,-this.crash.normal.z).multiplyScalar(t*e.distance)),e.model.rotation.copy(e.rotation),e.model.rotation.z+=t*(e.fall?1.45:.045),e.model.rotation.y+=t*(e.fall?.15:.12),e.fall&&(e.model.position.y=.25*t);for(let e of this.smoke){let t=(this.age*.3+e.phase)%1;e.mesh.position.set(this.crash.point.x+t*(.6+e.drift),.7+t*4,this.crash.point.z+t*.5),e.mesh.scale.setScalar(.25+t*1.6),e.mesh.material.opacity=Math.sin(t*Math.PI)*.12*Math.min(this.age,1)}}},vp=new Yc,yp=!0,bp=new Set;vp.onStart=()=>{yp=!1},vp.onLoad=()=>{yp=!0;for(let e of bp)e();bp.clear()};function xp(){return yp?Promise.resolve():new Promise(e=>bp.add(e))}var Sp={pixelRatio:1.5,antialias:!0,shadowSize:2048,detailedFoliage:!0,leafCards:120,anisotropy:8},Cp=new Map,wp=new il(vp),Tp=new Map;function Ep(e,t){let n=`${e}-${t}`;if(!Tp.has(n)){let e=wp.load(`textures/${n}.jpg`);e.wrapS=e.wrapT=sn,e.anisotropy=Sp.anisotropy,t===`color`&&(e.colorSpace=jr),Tp.set(n,e)}return Tp.get(n)}function Dp(e,t=`#ffffff`,n=3){let r=`${e}:${t}`;if(!Cp.has(r)){let i=new Cc({color:t,map:Ep(e,`color`),normalMap:Ep(e,`normal`),roughnessMap:Ep(e,`roughness`),normalScale:new B(e===`grass`?.5:.65,e===`grass`?.5:.65),roughness:.95,metalness:0});i.userData.metersPerTile=n,Cp.set(r,i)}return Cp.get(r)}function Op(e){if(e?.isMaterial)return e;if(Cp.has(e))return Cp.get(e);let t={"#73817e":[`asphalt`,`#d2d5d9`,5],"#70817c":[`asphalt`,`#c6cbd2`,5],"#6d7e79":[`asphalt`,`#d2d5d9`,5],"#d8d6c9":[`pavement`,`#d7d4ca`,2.5],"#d2c9a7":[`pavement`,`#d1c7af`,2.5],"#b2c5a0":[`grass`,`#b4bf91`,8],"#9eb890":[`grass`,`#a5b781`,8],"#adbf9d":[`grass`,`#bec598`,8],"#94ad85":[`grass`,`#99ad83`,8],"#a8b89c":[`grass`,`#afbb8a`,8],"#86755c":[`bark`,`#b8b0a0`,1.6]}[e],n=t?Dp(...t):new Cc({color:e,roughness:.75,metalness:0});return Cp.set(e,n),n}function kp(e,t){return Cp.has(e)||Cp.set(e,new wc(t)),Cp.get(e)}function Ap(e,t){let n=t.userData.metersPerTile;if(!n)return e;let r=e.attributes.position,i=e.attributes.normal,a=new Float32Array(r.count*2);for(let e=0;e<r.count;e++){let t=Math.abs(i.getX(e)),o=Math.abs(i.getY(e)),s=Math.abs(i.getZ(e));a[e*2]=(t>o&&t>s?r.getZ(e):r.getX(e))/n,a[e*2+1]=(o>=t&&o>=s?r.getZ(e):r.getY(e))/n}return e.setAttribute(`uv`,new uo(a,2)),e}var jp=class{constructor(e,t){this.getMode=t,this.reset();let n=null;e.style.touchAction=`none`,e.style.cursor=`grab`,e.addEventListener(`pointerdown`,t=>{(t.button===0||t.button===2)&&(n={id:t.pointerId,x:t.clientX,y:t.clientY},e.setPointerCapture(t.pointerId),e.style.cursor=`grabbing`)}),e.addEventListener(`pointermove`,e=>{if(!n||e.pointerId!==n.id)return;let r=e.clientX-n.x,a=e.clientY-n.y;n.x=e.clientX,n.y=e.clientY;let o=this.current();t()===`hood`?(o.yaw=i(o.yaw+r*.004,-2.1,2.1),o.pitch=i(o.pitch-a*.003,-.65,.65)):(o.yaw+=r*.005,o.pitch=i(o.pitch+a*.004,.15,1.48))});let r=()=>{n=null,e.style.cursor=`grab`};e.addEventListener(`pointerup`,r),e.addEventListener(`pointercancel`,r),e.addEventListener(`lostpointercapture`,r),e.addEventListener(`contextmenu`,e=>e.preventDefault()),e.addEventListener(`wheel`,e=>{if(t()===`hood`)return;e.preventDefault();let n=this.current();n.distance=i(n.distance*Math.exp(e.deltaY*.001),t()===`map`?25:6,t()===`map`?220:60)},{passive:!1}),e.addEventListener(`dblclick`,()=>this.reset())}current(){return this.states[this.getMode()]}reset(){this.states={chase:{yaw:0,pitch:.48,distance:20},map:{yaw:0,pitch:1.25,distance:150},hood:{yaw:0,pitch:0,distance:0}}}};function Mp(e){let t=new Map,n=new Map,r=e.clone();return Np(e,r,function(e,r){t.set(r,e),n.set(e,r)}),r.traverse(function(e){if(!e.isSkinnedMesh)return;let r=e,i=t.get(e),a=i.skeleton.bones;r.skeleton=i.skeleton.clone(),r.bindMatrix.copy(i.bindMatrix),r.skeleton.bones=a.map(function(e){return n.get(e)}),r.bind(r.skeleton,r.bindMatrix)}),r}function Np(e,t,n){n(e,t);for(let r=0;r<e.children.length;r++)Np(e.children[r],t.children[r],n)}var Pp=class extends Zc{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(e){return new Bp(e)}),this.register(function(e){return new Vp(e)}),this.register(function(e){return new Xp(e)}),this.register(function(e){return new Zp(e)}),this.register(function(e){return new Qp(e)}),this.register(function(e){return new Up(e)}),this.register(function(e){return new Wp(e)}),this.register(function(e){return new Gp(e)}),this.register(function(e){return new Kp(e)}),this.register(function(e){return new zp(e)}),this.register(function(e){return new qp(e)}),this.register(function(e){return new Hp(e)}),this.register(function(e){return new Yp(e)}),this.register(function(e){return new Jp(e)}),this.register(function(e){return new Lp(e)}),this.register(function(e){return new $p(e,Y.EXT_MESHOPT_COMPRESSION)}),this.register(function(e){return new $p(e,Y.KHR_MESHOPT_COMPRESSION)}),this.register(function(e){return new em(e)})}load(e,t,n,r){let i=this,a;if(this.resourcePath!==``)a=this.resourcePath;else if(this.path!==``){let t=El.extractUrlBase(e);a=El.resolveURL(t,this.path)}else a=El.extractUrlBase(e);this.manager.itemStart(e);let o=function(t){r?r(t):console.error(t),i.manager.itemError(e),i.manager.itemEnd(e)},s=new el(this.manager);s.setPath(this.path),s.setResponseType(`arraybuffer`),s.setRequestHeader(this.requestHeader),s.setWithCredentials(this.withCredentials),s.load(e,function(n){try{i.parse(n,a,function(n){t(n),i.manager.itemEnd(e)},o)}catch(e){o(e)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,r){let i,a={},o={},s=new TextDecoder;if(typeof e==`string`)i=JSON.parse(e);else if(e instanceof ArrayBuffer){if(s.decode(new Uint8Array(e,0,4))===tm){try{a[Y.KHR_BINARY_GLTF]=new im(e)}catch(e){r&&r(e);return}i=JSON.parse(a[Y.KHR_BINARY_GLTF].content)}else i=JSON.parse(s.decode(e))}else i=e;if(i.asset===void 0||i.asset.version[0]<2){r&&r(Error(`THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.`));return}let c=new Am(i,{path:t||this.resourcePath||``,crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let e=0;e<this.pluginCallbacks.length;e++){let t=this.pluginCallbacks[e](c);t.name||console.error(`THREE.GLTFLoader: Invalid plugin found: missing name`),o[t.name]=t,a[t.name]=!0}if(i.extensionsUsed)for(let e=0;e<i.extensionsUsed.length;++e){let t=i.extensionsUsed[e],n=i.extensionsRequired||[];switch(t){case Y.KHR_MATERIALS_UNLIT:a[t]=new Rp;break;case Y.KHR_DRACO_MESH_COMPRESSION:a[t]=new am(i,this.dracoLoader);break;case Y.KHR_TEXTURE_TRANSFORM:a[t]=new om;break;case Y.KHR_MESH_QUANTIZATION:a[t]=new sm;break;default:n.indexOf(t)>=0&&o[t]===void 0&&console.warn(`THREE.GLTFLoader: Unknown extension "`+t+`".`)}}c.setExtensions(a),c.setPlugins(o),c.parse(n,r)}parseAsync(e,t){let n=this;return new Promise(function(r,i){n.parse(e,t,r,i)})}};function Fp(){let e={};return{get:function(t){return e[t]},add:function(t,n){e[t]=n},remove:function(t){delete e[t]},removeAll:function(){e={}}}}function Ip(e,t,n){let r=e.json.materials[t];return r.extensions&&r.extensions[n]?r.extensions[n]:null}var Y={KHR_BINARY_GLTF:`KHR_binary_glTF`,KHR_DRACO_MESH_COMPRESSION:`KHR_draco_mesh_compression`,KHR_LIGHTS_PUNCTUAL:`KHR_lights_punctual`,KHR_MATERIALS_CLEARCOAT:`KHR_materials_clearcoat`,KHR_MATERIALS_DISPERSION:`KHR_materials_dispersion`,KHR_MATERIALS_IOR:`KHR_materials_ior`,KHR_MATERIALS_SHEEN:`KHR_materials_sheen`,KHR_MATERIALS_SPECULAR:`KHR_materials_specular`,KHR_MATERIALS_TRANSMISSION:`KHR_materials_transmission`,KHR_MATERIALS_IRIDESCENCE:`KHR_materials_iridescence`,KHR_MATERIALS_ANISOTROPY:`KHR_materials_anisotropy`,KHR_MATERIALS_UNLIT:`KHR_materials_unlit`,KHR_MATERIALS_VOLUME:`KHR_materials_volume`,KHR_TEXTURE_BASISU:`KHR_texture_basisu`,KHR_TEXTURE_TRANSFORM:`KHR_texture_transform`,KHR_MESH_QUANTIZATION:`KHR_mesh_quantization`,KHR_MATERIALS_EMISSIVE_STRENGTH:`KHR_materials_emissive_strength`,EXT_MATERIALS_BUMP:`EXT_materials_bump`,EXT_TEXTURE_WEBP:`EXT_texture_webp`,EXT_TEXTURE_AVIF:`EXT_texture_avif`,EXT_MESHOPT_COMPRESSION:`EXT_meshopt_compression`,KHR_MESHOPT_COMPRESSION:`KHR_meshopt_compression`,EXT_MESH_GPU_INSTANCING:`EXT_mesh_gpu_instancing`},Lp=class{constructor(e){this.parser=e,this.name=Y.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,r=t.length;n<r;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n=`light:`+e,r=t.cache.get(n);if(r)return r;let i=t.json,a=((i.extensions&&i.extensions[this.name]||{}).lights||[])[e],o,s=new G(16777215);a.color!==void 0&&s.setRGB(a.color[0],a.color[1],a.color[2],Mr);let c=a.range===void 0?0:a.range;switch(a.type){case`directional`:o=new Tl(s),o.target.position.set(0,0,-1),o.add(o.target);break;case`point`:o=new Sl(s),o.distance=c;break;case`spot`:o=new bl(s),o.distance=c,a.spot=a.spot||{},a.spot.innerConeAngle=a.spot.innerConeAngle===void 0?0:a.spot.innerConeAngle,a.spot.outerConeAngle=a.spot.outerConeAngle===void 0?Math.PI/4:a.spot.outerConeAngle,o.angle=a.spot.outerConeAngle,o.penumbra=1-a.spot.innerConeAngle/a.spot.outerConeAngle,o.target.position.set(0,0,-1),o.add(o.target);break;default:throw Error(`THREE.GLTFLoader: Unexpected light type: `+a.type)}return o.position.set(0,0,0),Sm(o,a),a.intensity!==void 0&&(o.intensity=a.intensity),o.name=t.createUniqueName(a.name||`light_`+e),r=Promise.resolve(o),t.cache.add(n,r),r}getDependency(e,t){if(e===`light`)return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],i=(r.extensions&&r.extensions[this.name]||{}).light;return i===void 0?null:this._loadLight(i).then(function(e){return n._getNodeRef(t.cache,i,e)})}},Rp=class{constructor(){this.name=Y.KHR_MATERIALS_UNLIT}getMaterialType(){return Bo}extendParams(e,t,n){let r=[];e.color=new G(1,1,1),e.opacity=1;let i=t.pbrMetallicRoughness;if(i){if(Array.isArray(i.baseColorFactor)){let t=i.baseColorFactor;e.color.setRGB(t[0],t[1],t[2],Mr),e.opacity=t[3]}i.baseColorTexture!==void 0&&r.push(n.assignTexture(e,`map`,i.baseColorTexture,jr))}return Promise.all(r)}},zp=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=Ip(this.parser,e,this.name);return n===null||n.emissiveStrength!==void 0&&(t.emissiveIntensity=n.emissiveStrength),Promise.resolve()}},Bp=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){return Ip(this.parser,e,this.name)===null?null:wc}extendMaterialParams(e,t){let n=Ip(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];if(n.clearcoatFactor!==void 0&&(t.clearcoat=n.clearcoatFactor),n.clearcoatTexture!==void 0&&r.push(this.parser.assignTexture(t,`clearcoatMap`,n.clearcoatTexture)),n.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=n.clearcoatRoughnessFactor),n.clearcoatRoughnessTexture!==void 0&&r.push(this.parser.assignTexture(t,`clearcoatRoughnessMap`,n.clearcoatRoughnessTexture)),n.clearcoatNormalTexture!==void 0&&(r.push(this.parser.assignTexture(t,`clearcoatNormalMap`,n.clearcoatNormalTexture)),n.clearcoatNormalTexture.scale!==void 0)){let e=n.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new B(e,e)}return Promise.all(r)}},Vp=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_DISPERSION}getMaterialType(e){return Ip(this.parser,e,this.name)===null?null:wc}extendMaterialParams(e,t){let n=Ip(this.parser,e,this.name);return n===null||(t.dispersion=n.dispersion===void 0?0:n.dispersion),Promise.resolve()}},Hp=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){return Ip(this.parser,e,this.name)===null?null:wc}extendMaterialParams(e,t){let n=Ip(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];return n.iridescenceFactor!==void 0&&(t.iridescence=n.iridescenceFactor),n.iridescenceTexture!==void 0&&r.push(this.parser.assignTexture(t,`iridescenceMap`,n.iridescenceTexture)),n.iridescenceIor!==void 0&&(t.iridescenceIOR=n.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),n.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=n.iridescenceThicknessMinimum),n.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=n.iridescenceThicknessMaximum),n.iridescenceThicknessTexture!==void 0&&r.push(this.parser.assignTexture(t,`iridescenceThicknessMap`,n.iridescenceThicknessTexture)),Promise.all(r)}},Up=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_SHEEN}getMaterialType(e){return Ip(this.parser,e,this.name)===null?null:wc}extendMaterialParams(e,t){let n=Ip(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];if(t.sheenColor=new G(0,0,0),t.sheenRoughness=0,t.sheen=1,n.sheenColorFactor!==void 0){let e=n.sheenColorFactor;t.sheenColor.setRGB(e[0],e[1],e[2],Mr)}return n.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=n.sheenRoughnessFactor),n.sheenColorTexture!==void 0&&r.push(this.parser.assignTexture(t,`sheenColorMap`,n.sheenColorTexture,jr)),n.sheenRoughnessTexture!==void 0&&r.push(this.parser.assignTexture(t,`sheenRoughnessMap`,n.sheenRoughnessTexture)),Promise.all(r)}},Wp=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){return Ip(this.parser,e,this.name)===null?null:wc}extendMaterialParams(e,t){let n=Ip(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];return n.transmissionFactor!==void 0&&(t.transmission=n.transmissionFactor),n.transmissionTexture!==void 0&&r.push(this.parser.assignTexture(t,`transmissionMap`,n.transmissionTexture)),Promise.all(r)}},Gp=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_VOLUME}getMaterialType(e){return Ip(this.parser,e,this.name)===null?null:wc}extendMaterialParams(e,t){let n=Ip(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];t.thickness=n.thicknessFactor===void 0?0:n.thicknessFactor,n.thicknessTexture!==void 0&&r.push(this.parser.assignTexture(t,`thicknessMap`,n.thicknessTexture)),t.attenuationDistance=n.attenuationDistance||1/0;let i=n.attenuationColor||[1,1,1];return t.attenuationColor=new G().setRGB(i[0],i[1],i[2],Mr),Promise.all(r)}},Kp=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_IOR}getMaterialType(e){return Ip(this.parser,e,this.name)===null?null:wc}extendMaterialParams(e,t){let n=Ip(this.parser,e,this.name);return n===null||(t.ior=n.ior===void 0?1.5:n.ior),Promise.resolve()}},qp=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_SPECULAR}getMaterialType(e){return Ip(this.parser,e,this.name)===null?null:wc}extendMaterialParams(e,t){let n=Ip(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];t.specularIntensity=n.specularFactor===void 0?1:n.specularFactor,n.specularTexture!==void 0&&r.push(this.parser.assignTexture(t,`specularIntensityMap`,n.specularTexture));let i=n.specularColorFactor||[1,1,1];return t.specularColor=new G().setRGB(i[0],i[1],i[2],Mr),n.specularColorTexture!==void 0&&r.push(this.parser.assignTexture(t,`specularColorMap`,n.specularColorTexture,jr)),Promise.all(r)}},Jp=class{constructor(e){this.parser=e,this.name=Y.EXT_MATERIALS_BUMP}getMaterialType(e){return Ip(this.parser,e,this.name)===null?null:wc}extendMaterialParams(e,t){let n=Ip(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];return t.bumpScale=n.bumpFactor===void 0?1:n.bumpFactor,n.bumpTexture!==void 0&&r.push(this.parser.assignTexture(t,`bumpMap`,n.bumpTexture)),Promise.all(r)}},Yp=class{constructor(e){this.parser=e,this.name=Y.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){return Ip(this.parser,e,this.name)===null?null:wc}extendMaterialParams(e,t){let n=Ip(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];return n.anisotropyStrength!==void 0&&(t.anisotropy=n.anisotropyStrength),n.anisotropyRotation!==void 0&&(t.anisotropyRotation=n.anisotropyRotation),n.anisotropyTexture!==void 0&&r.push(this.parser.assignTexture(t,`anisotropyMap`,n.anisotropyTexture)),Promise.all(r)}},Xp=class{constructor(e){this.parser=e,this.name=Y.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,r=n.textures[e];if(!r.extensions||!r.extensions[this.name])return null;let i=r.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw Error(`THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures`);return null}return t.loadTextureImage(e,i.source,a)}},Zp=class{constructor(e){this.parser=e,this.name=Y.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,r=n.json,i=r.textures[e];if(!i.extensions||!i.extensions[t])return null;let a=i.extensions[t],o=r.images[a.source],s=n.textureLoader;if(o.uri){let e=n.options.manager.getHandler(o.uri);e!==null&&(s=e)}return n.loadTextureImage(e,a.source,s)}},Qp=class{constructor(e){this.parser=e,this.name=Y.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,r=n.json,i=r.textures[e];if(!i.extensions||!i.extensions[t])return null;let a=i.extensions[t],o=r.images[a.source],s=n.textureLoader;if(o.uri){let e=n.options.manager.getHandler(o.uri);e!==null&&(s=e)}return n.loadTextureImage(e,a.source,s)}},$p=class{constructor(e,t){this.name=t,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let e=n.extensions[this.name],r=this.parser.getDependency(`buffer`,e.buffer),i=this.parser.options.meshoptDecoder;if(!i||!i.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw Error(`THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files`);return null}return r.then(function(t){let n=e.byteOffset||0,r=e.byteLength||0,a=e.count,o=e.byteStride,s=new Uint8Array(t,n,r);return i.decodeGltfBufferAsync?i.decodeGltfBufferAsync(a,o,s,e.mode,e.filter).then(function(e){return e.buffer}):i.ready.then(function(){let t=new ArrayBuffer(a*o);return i.decodeGltfBuffer(new Uint8Array(t),a,o,s,e.mode,e.filter),t})})}return null}},em=class{constructor(e){this.name=Y.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let r=t.meshes[n.mesh];for(let e of r.primitives)if(e.mode!==dm.TRIANGLES&&e.mode!==dm.TRIANGLE_STRIP&&e.mode!==dm.TRIANGLE_FAN&&e.mode!==void 0)return null;let i=n.extensions[this.name].attributes,a=[],o={};for(let e in i)a.push(this.parser.getDependency(`accessor`,i[e]).then(t=>(o[e]=t,o[e])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(e=>{let t=e.pop(),n=t.isGroup?t.children:[t],r=e[0].count,i=[];for(let e of n){let t=new W,n=new V,a=new Si,s=new V(1,1,1),c=new Cs(e.geometry,e.material,r);for(let e=0;e<r;e++)o.TRANSLATION&&n.fromBufferAttribute(o.TRANSLATION,e),o.ROTATION&&a.fromBufferAttribute(o.ROTATION,e),o.SCALE&&s.fromBufferAttribute(o.SCALE,e),c.setMatrixAt(e,t.compose(n,a,s));for(let t in o)if(t===`_COLOR_0`){let e=o[t];c.instanceColor=new hs(e.array,e.itemSize,e.normalized)}else t!==`TRANSLATION`&&t!==`ROTATION`&&t!==`SCALE`&&e.geometry.setAttribute(t,o[t]);ga.prototype.copy.call(c,e),this.parser.assignFinalMaterial(c),i.push(c)}return t.isGroup?(t.clear(),t.add(...i),t):i[0]}))}},tm=`glTF`,nm=12,rm={JSON:1313821514,BIN:5130562},im=class{constructor(e){this.name=Y.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,nm),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==tm)throw Error(`THREE.GLTFLoader: Unsupported glTF-Binary header.`);if(this.header.version<2)throw Error(`THREE.GLTFLoader: Legacy binary file detected.`);let r=this.header.length-nm,i=new DataView(e,nm),a=0;for(;a<r;){let t=i.getUint32(a,!0);a+=4;let r=i.getUint32(a,!0);if(a+=4,r===rm.JSON){let r=new Uint8Array(e,nm+a,t);this.content=n.decode(r)}else if(r===rm.BIN){let n=nm+a;this.body=e.slice(n,n+t)}a+=t}if(this.content===null)throw Error(`THREE.GLTFLoader: JSON content not found.`)}},am=class{constructor(e,t){if(!t)throw Error(`THREE.GLTFLoader: No DRACOLoader instance provided.`);this.name=Y.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,r=this.dracoLoader,i=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},s={},c={};for(let e in a){let t=gm[e]||e.toLowerCase();o[t]=a[e]}for(let t in e.attributes){let r=gm[t]||t.toLowerCase();if(a[t]!==void 0){let i=n.accessors[e.attributes[t]];c[r]=fm[i.componentType].name,s[r]=i.normalized===!0}}return t.getDependency(`bufferView`,i).then(function(e){return new Promise(function(t,n){r.decodeDracoFile(e,function(e){for(let t in e.attributes){let n=e.attributes[t],r=s[t];r!==void 0&&(n.normalized=r)}t(e)},o,c,Mr,n)})})}},om=class{constructor(){this.name=Y.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0?e:(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0,e)}},sm=class{constructor(){this.name=Y.KHR_MESH_QUANTIZATION}},cm=class extends jc{constructor(e,t,n,r){super(e,t,n,r)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r*3+r;for(let e=0;e!==r;e++)t[e]=n[i+e];return t}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=o*2,c=o*3,l=r-t,u=(n-t)/l,d=u*u,f=d*u,p=e*c,m=p-c,h=-2*f+3*d,g=f-d,_=1-h,v=g-d+u;for(let e=0;e!==o;e++){let t=a[m+e+o],n=a[m+e+s]*l,r=a[p+e+o],c=a[p+e]*l;i[e]=_*t+v*n+h*r+g*c}return i}},lm=new Si,um=class extends cm{interpolate_(e,t,n,r){let i=super.interpolate_(e,t,n,r);return lm.fromArray(i).normalize().toArray(i),i}},dm={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},fm={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},pm={9728:un,9729:pn,9984:dn,9985:mn,9986:fn,9987:hn},mm={33071:cn,33648:ln,10497:sn},hm={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},gm={POSITION:`position`,NORMAL:`normal`,TANGENT:`tangent`,TEXCOORD_0:`uv`,TEXCOORD_1:`uv1`,TEXCOORD_2:`uv2`,TEXCOORD_3:`uv3`,COLOR_0:`color`,WEIGHTS_0:`skinWeight`,JOINTS_0:`skinIndex`},_m={scale:`scale`,translation:`position`,rotation:`quaternion`,weights:`morphTargetInfluences`},vm={CUBICSPLINE:void 0,LINEAR:Sr,STEP:xr},ym={OPAQUE:`OPAQUE`,MASK:`MASK`,BLEND:`BLEND`};function bm(e){return e.DefaultMaterial===void 0&&(e.DefaultMaterial=new Cc({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:0})),e.DefaultMaterial}function xm(e,t,n){for(let r in n.extensions)e[r]===void 0&&(t.userData.gltfExtensions=t.userData.gltfExtensions||{},t.userData.gltfExtensions[r]=n.extensions[r])}function Sm(e,t){t.extras!==void 0&&(typeof t.extras==`object`?Object.assign(e.userData,t.extras):console.warn(`THREE.GLTFLoader: Ignoring primitive type .extras, `+t.extras))}function Cm(e,t,n){let r=!1,i=!1,a=!1;for(let e=0,n=t.length;e<n;e++){let n=t[e];if(n.POSITION!==void 0&&(r=!0),n.NORMAL!==void 0&&(i=!0),n.COLOR_0!==void 0&&(a=!0),r&&i&&a)break}if(!r&&!i&&!a)return Promise.resolve(e);let o=[],s=[],c=[];for(let l=0,u=t.length;l<u;l++){let u=t[l];if(r){let t=u.POSITION===void 0?e.attributes.position:n.getDependency(`accessor`,u.POSITION);o.push(t)}if(i){let t=u.NORMAL===void 0?e.attributes.normal:n.getDependency(`accessor`,u.NORMAL);s.push(t)}if(a){let t=u.COLOR_0===void 0?e.attributes.color:n.getDependency(`accessor`,u.COLOR_0);c.push(t)}}return Promise.all([Promise.all(o),Promise.all(s),Promise.all(c)]).then(function(t){let n=t[0],o=t[1],s=t[2];return r&&(e.morphAttributes.position=n),i&&(e.morphAttributes.normal=o),a&&(e.morphAttributes.color=s),e.morphTargetsRelative=!0,e})}function wm(e,t){if(e.updateMorphTargets(),t.weights!==void 0)for(let n=0,r=t.weights.length;n<r;n++)e.morphTargetInfluences[n]=t.weights[n];if(t.extras&&Array.isArray(t.extras.targetNames)){let n=t.extras.targetNames;if(e.morphTargetInfluences.length===n.length){e.morphTargetDictionary={};for(let t=0,r=n.length;t<r;t++)e.morphTargetDictionary[n[t]]=t}else console.warn(`THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.`)}}function Tm(e){let t,n=e.extensions&&e.extensions[Y.KHR_DRACO_MESH_COMPRESSION];if(t=n?`draco:`+n.bufferView+`:`+n.indices+`:`+Em(n.attributes):e.indices+`:`+Em(e.attributes)+`:`+e.mode,e.targets!==void 0)for(let n=0,r=e.targets.length;n<r;n++)t+=`:`+Em(e.targets[n]);return t}function Em(e){let t=``,n=Object.keys(e).sort();for(let r=0,i=n.length;r<i;r++)t+=n[r]+`:`+e[n[r]]+`;`;return t}function Dm(e){switch(e){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw Error(`THREE.GLTFLoader: Unsupported normalized accessor component type.`)}}function Om(e){return e.search(/\.jpe?g($|\?)/i)>0||e.search(/^data\:image\/jpeg/)===0?`image/jpeg`:e.search(/\.webp($|\?)/i)>0||e.search(/^data\:image\/webp/)===0?`image/webp`:e.search(/\.ktx2($|\?)/i)>0||e.search(/^data\:image\/ktx2/)===0?`image/ktx2`:`image/png`}var km=new W,Am=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Fp,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,r=-1,i=!1,a=-1;if(typeof navigator<`u`&&navigator.userAgent!==void 0){let e=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(e)===!0;let t=e.match(/Version\/(\d+)/);r=n&&t?parseInt(t[1],10):-1,i=e.indexOf(`Firefox`)>-1,a=i?e.match(/Firefox\/([0-9]+)\./)[1]:-1}this.textureLoader=typeof createImageBitmap>`u`||n&&r<17||i&&a<98?new il(this.options.manager):new Ol(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new el(this.options.manager),this.fileLoader.setResponseType(`arraybuffer`),this.options.crossOrigin===`use-credentials`&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,r=this.json,i=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(e){return e._markDefs&&e._markDefs()}),Promise.all(this._invokeAll(function(e){return e.beforeRoot&&e.beforeRoot()})).then(function(){return Promise.all([n.getDependencies(`scene`),n.getDependencies(`animation`),n.getDependencies(`camera`)])}).then(function(t){let a={scene:t[0][r.scene||0],scenes:t[0],animations:t[1],cameras:t[2],asset:r.asset,parser:n,userData:{}};return xm(i,a,r),Sm(a,r),Promise.all(n._invokeAll(function(e){return e.afterRoot&&e.afterRoot(a)})).then(function(){for(let e of a.scenes)e.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let n=0,r=t.length;n<r;n++){let r=t[n].joints;for(let t=0,n=r.length;t<n;t++)e[r[t]].isBone=!0}for(let t=0,r=e.length;t<r;t++){let r=e[t];r.mesh!==void 0&&(this._addNodeRef(this.meshCache,r.mesh),r.skin!==void 0&&(n[r.mesh].isSkinnedMesh=!0)),r.camera!==void 0&&this._addNodeRef(this.cameraCache,r.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let r=n.clone(),i=(e,t)=>{let n=this.associations.get(e);n!=null&&this.associations.set(t,n);for(let[n,r]of e.children.entries())i(r,t.children[n])};return i(n,r),r.name+=`_instance_`+e.uses[t]++,r}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let r=e(t[n]);if(r)return r}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let r=0;r<t.length;r++){let i=e(t[r]);i&&n.push(i)}return n}getDependency(e,t){let n=e+`:`+t,r=this.cache.get(n);if(!r){switch(e){case`scene`:r=this.loadScene(t);break;case`node`:r=this._invokeOne(function(e){return e.loadNode&&e.loadNode(t)});break;case`mesh`:r=this._invokeOne(function(e){return e.loadMesh&&e.loadMesh(t)});break;case`accessor`:r=this.loadAccessor(t);break;case`bufferView`:r=this._invokeOne(function(e){return e.loadBufferView&&e.loadBufferView(t)});break;case`buffer`:r=this.loadBuffer(t);break;case`material`:r=this._invokeOne(function(e){return e.loadMaterial&&e.loadMaterial(t)});break;case`texture`:r=this._invokeOne(function(e){return e.loadTexture&&e.loadTexture(t)});break;case`skin`:r=this.loadSkin(t);break;case`animation`:r=this._invokeOne(function(e){return e.loadAnimation&&e.loadAnimation(t)});break;case`camera`:r=this.loadCamera(t);break;default:if(r=this._invokeOne(function(n){return n!=this&&n.getDependency&&n.getDependency(e,t)}),!r)throw Error(`Unknown type: `+e)}this.cache.add(n,r)}return r}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,r=this.json[e+(e===`mesh`?`es`:`s`)]||[];t=Promise.all(r.map(function(t,r){return n.getDependency(e,r)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!==`arraybuffer`)throw Error(`THREE.GLTFLoader: `+t.type+` buffer type is not supported.`);if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Y.KHR_BINARY_GLTF].body);let r=this.options;return new Promise(function(e,i){n.load(El.resolveURL(t.uri,r.path),e,void 0,function(){i(Error(`THREE.GLTFLoader: Failed to load buffer "`+t.uri+`".`))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency(`buffer`,t.buffer).then(function(e){let n=t.byteLength||0,r=t.byteOffset||0;return e.slice(r,r+n)})}loadAccessor(e){let t=this,n=this.json,r=this.json.accessors[e];if(r.bufferView===void 0&&r.sparse===void 0){let e=hm[r.type],t=fm[r.componentType],n=r.normalized===!0,i=new t(r.count*e);return Promise.resolve(new uo(i,e,n))}let i=[];return r.bufferView===void 0?i.push(null):i.push(this.getDependency(`bufferView`,r.bufferView)),r.sparse!==void 0&&(i.push(this.getDependency(`bufferView`,r.sparse.indices.bufferView)),i.push(this.getDependency(`bufferView`,r.sparse.values.bufferView))),Promise.all(i).then(function(e){let i=e[0],a=hm[r.type],o=fm[r.componentType],s=o.BYTES_PER_ELEMENT,c=s*a,l=r.byteOffset||0,u=r.bufferView===void 0?void 0:n.bufferViews[r.bufferView].byteStride,d=r.normalized===!0,f,p;if(u&&u!==c){let e=Math.floor(l/u),n=`InterleavedBuffer:`+r.bufferView+`:`+r.componentType+`:`+e+`:`+r.count,c=t.cache.get(n);c||(f=new o(i,e*u,r.count*u/s),c=new Do(f,u/s),t.cache.add(n,c)),p=new ko(c,a,l%u/s,d)}else f=i===null?new o(r.count*a):new o(i,l,r.count*a),p=new uo(f,a,d);if(r.sparse!==void 0){let t=hm.SCALAR,n=fm[r.sparse.indices.componentType],s=r.sparse.indices.byteOffset||0,c=r.sparse.values.byteOffset||0,l=new n(e[1],s,r.sparse.count*t),u=new o(e[2],c,r.sparse.count*a);i!==null&&(p=new uo(p.array.slice(),p.itemSize,p.normalized)),p.normalized=!1;for(let e=0,t=l.length;e<t;e++){let t=l[e];if(p.setX(t,u[e*a]),a>=2&&p.setY(t,u[e*a+1]),a>=3&&p.setZ(t,u[e*a+2]),a>=4&&p.setW(t,u[e*a+3]),a>=5)throw Error(`THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.`)}p.normalized=d}return p})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,i=t.images[r],a=this.textureLoader;if(i.uri){let e=n.manager.getHandler(i.uri);e!==null&&(a=e)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let r=this,i=this.json,a=i.textures[e],o=i.images[t],s=(o.uri||o.bufferView)+`:`+a.sampler;if(this.textureCache[s])return this.textureCache[s];let c=this.loadImageSource(t,n).then(function(t){t.flipY=!1,t.name=a.name||o.name||``,t.name===``&&typeof o.uri==`string`&&o.uri.startsWith(`data:image/`)===!1&&(t.name=o.uri);let n=(i.samplers||{})[a.sampler]||{};return t.magFilter=pm[n.magFilter]||1006,t.minFilter=pm[n.minFilter]||1008,t.wrapS=mm[n.wrapS]||1e3,t.wrapT=mm[n.wrapT]||1e3,t.generateMipmaps=!t.isCompressedTexture&&t.minFilter!==1003&&t.minFilter!==1006,r.associations.set(t,{textures:e}),t}).catch(function(){return null});return this.textureCache[s]=c,c}loadImageSource(e,t){let n=this,r=this.json,i=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(e=>e.clone());let a=r.images[e],o=self.URL||self.webkitURL,s=a.uri||``,c=!1;if(a.bufferView!==void 0)s=n.getDependency(`bufferView`,a.bufferView).then(function(e){c=!0;let t=new Blob([e],{type:a.mimeType});return s=o.createObjectURL(t),s});else if(a.uri===void 0)throw Error(`THREE.GLTFLoader: Image `+e+` is missing URI and bufferView`);let l=Promise.resolve(s).then(function(e){return new Promise(function(n,r){let a=n;t.isImageBitmapLoader===!0&&(a=function(e){let t=new Ri(e);t.needsUpdate=!0,n(t)}),t.load(El.resolveURL(e,i.path),a,void 0,r)})}).then(function(e){return c===!0&&o.revokeObjectURL(s),Sm(e,a),e.userData.mimeType=a.mimeType||Om(a.uri),e}).catch(function(e){throw console.error(`THREE.GLTFLoader: Couldn't load texture`,s),e});return this.sourceCache[e]=l,l}assignTexture(e,t,n,r){let i=this;return this.getDependency(`texture`,n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),i.extensions[Y.KHR_TEXTURE_TRANSFORM]){let e=n.extensions===void 0?void 0:n.extensions[Y.KHR_TEXTURE_TRANSFORM];if(e){let t=i.associations.get(a);a=i.extensions[Y.KHR_TEXTURE_TRANSFORM].extendTexture(a,e),i.associations.set(a,t)}}return r!==void 0&&(a.colorSpace=r),e[t]=a,a})}assignFinalMaterial(e){let t=e.geometry,n=e.material,r=t.attributes.tangent===void 0,i=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){let e=`PointsMaterial:`+n.uuid,t=this.cache.get(e);t||(t=new Ks,jo.prototype.copy.call(t,n),t.color.copy(n.color),t.map=n.map,t.sizeAttenuation=!1,this.cache.add(e,t)),n=t}else if(e.isLine){let e=`LineBasicMaterial:`+n.uuid,t=this.cache.get(e);t||(t=new Ms,jo.prototype.copy.call(t,n),t.color.copy(n.color),t.map=n.map,this.cache.add(e,t)),n=t}if(r||i||a){let e=`ClonedMaterial:`+n.uuid+`:`;r&&(e+=`derivative-tangents:`),i&&(e+=`vertex-colors:`),a&&(e+=`flat-shading:`);let t=this.cache.get(e);t||(t=n.clone(),i&&(t.vertexColors=!0),a&&(t.flatShading=!0),r&&(t.normalScale&&(t.normalScale.y*=-1),t.clearcoatNormalScale&&(t.clearcoatNormalScale.y*=-1)),this.cache.add(e,t),this.associations.set(t,this.associations.get(n))),n=t}e.material=n}getMaterialType(){return Cc}loadMaterial(e){let t=this,n=this.json,r=this.extensions,i=n.materials[e],a,o={},s=i.extensions||{},c=[];if(s[Y.KHR_MATERIALS_UNLIT]){let e=r[Y.KHR_MATERIALS_UNLIT];a=e.getMaterialType(),c.push(e.extendParams(o,i,t))}else{let n=i.pbrMetallicRoughness||{};if(o.color=new G(1,1,1),o.opacity=1,Array.isArray(n.baseColorFactor)){let e=n.baseColorFactor;o.color.setRGB(e[0],e[1],e[2],Mr),o.opacity=e[3]}n.baseColorTexture!==void 0&&c.push(t.assignTexture(o,`map`,n.baseColorTexture,jr)),o.metalness=n.metallicFactor===void 0?1:n.metallicFactor,o.roughness=n.roughnessFactor===void 0?1:n.roughnessFactor,n.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,`metalnessMap`,n.metallicRoughnessTexture)),c.push(t.assignTexture(o,`roughnessMap`,n.metallicRoughnessTexture))),a=this._invokeOne(function(t){return t.getMaterialType&&t.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(t){return t.extendMaterialParams&&t.extendMaterialParams(e,o)})))}i.doubleSided===!0&&(o.side=2);let l=i.alphaMode||ym.OPAQUE;if(l===ym.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,l===ym.MASK&&(o.alphaTest=i.alphaCutoff===void 0?.5:i.alphaCutoff)),i.normalTexture!==void 0&&a!==Bo&&(c.push(t.assignTexture(o,`normalMap`,i.normalTexture)),o.normalScale=new B(1,1),i.normalTexture.scale!==void 0)){let e=i.normalTexture.scale;o.normalScale.set(e,e)}if(i.occlusionTexture!==void 0&&a!==Bo&&(c.push(t.assignTexture(o,`aoMap`,i.occlusionTexture)),i.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=i.occlusionTexture.strength)),i.emissiveFactor!==void 0&&a!==Bo){let e=i.emissiveFactor;o.emissive=new G().setRGB(e[0],e[1],e[2],Mr)}return i.emissiveTexture!==void 0&&a!==Bo&&c.push(t.assignTexture(o,`emissiveMap`,i.emissiveTexture,jr)),Promise.all(c).then(function(){let n=new a(o);return i.name&&(n.name=i.name),Sm(n,i),t.associations.set(n,{materials:e}),i.extensions&&xm(r,n,i),n})}createUniqueName(e){let t=Wl.sanitizeNodeName(e||``);return t in this.nodeNamesUsed?t+`_`+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,r=this.primitiveCache;function i(e){return n[Y.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(e,t).then(function(n){return Mm(n,e,t)})}let a=[];for(let n=0,o=e.length;n<o;n++){let o=e[n],s=Tm(o),c=r[s];if(c)a.push(c.promise);else{let e;e=o.extensions&&o.extensions[Y.KHR_DRACO_MESH_COMPRESSION]?i(o):Mm(new Eo,o,t),r[s]={primitive:o,promise:e},a.push(e)}}return Promise.all(a)}loadMesh(e){let t=this,n=this.json,r=this.extensions,i=n.meshes[e],a=i.primitives,o=[];for(let e=0,t=a.length;e<t;e++){let t=a[e].material===void 0?bm(this.cache):this.getDependency(`material`,a[e].material);o.push(t)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(n){let o=n.slice(0,n.length-1),s=n[n.length-1],c=[];for(let n=0,l=s.length;n<l;n++){let l=s[n],u=a[n],d,f=o[n];if(u.mode===dm.TRIANGLES||u.mode===dm.TRIANGLE_STRIP||u.mode===dm.TRIANGLE_FAN||u.mode===void 0)d=i.isSkinnedMesh===!0?new ls(l,f):new K(l,f),d.isSkinnedMesh===!0&&d.normalizeSkinWeights(),u.mode===dm.TRIANGLE_STRIP?d.geometry=dp(d.geometry,1):u.mode===dm.TRIANGLE_FAN&&(d.geometry=dp(d.geometry,2));else if(u.mode===dm.LINES)d=new Ws(l,f);else if(u.mode===dm.LINE_STRIP)d=new Bs(l,f);else if(u.mode===dm.LINE_LOOP)d=new Gs(l,f);else if(u.mode===dm.POINTS)d=new Zs(l,f);else throw Error(`THREE.GLTFLoader: Primitive mode unsupported: `+u.mode);Object.keys(d.geometry.morphAttributes).length>0&&wm(d,i),d.name=t.createUniqueName(i.name||`mesh_`+e),Sm(d,i),u.extensions&&xm(r,d,u),t.assignFinalMaterial(d),c.push(d)}for(let n=0,r=c.length;n<r;n++)t.associations.set(c[n],{meshes:e,primitives:n});if(c.length===1)return i.extensions&&xm(r,c[0],i),c[0];let l=new _a;i.extensions&&xm(r,l,i),t.associations.set(l,{meshes:e});for(let e=0,t=c.length;e<t;e++)l.add(c[e]);return l})}loadCamera(e){let t,n=this.json.cameras[e],r=n[n.type];if(!r){console.warn(`THREE.GLTFLoader: Missing camera parameters.`);return}return n.type===`perspective`?t=new vl(xi.radToDeg(r.yfov),r.aspectRatio||1,r.znear||1,r.zfar||2e6):n.type===`orthographic`&&(t=new Cl(-r.xmag,r.xmag,r.ymag,-r.ymag,r.znear,r.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Sm(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let e=0,r=t.joints.length;e<r;e++)n.push(this._loadNodeShallow(t.joints[e]));return t.inverseBindMatrices===void 0?n.push(null):n.push(this.getDependency(`accessor`,t.inverseBindMatrices)),Promise.all(n).then(function(e){let n=e.pop(),r=e,i=[],a=[];for(let e=0,o=r.length;e<o;e++){let o=r[e];if(o){i.push(o);let t=new W;n!==null&&t.fromArray(n.array,e*16),a.push(t)}else console.warn(`THREE.GLTFLoader: Joint "%s" could not be found.`,t.joints[e])}return new ms(i,a)})}loadAnimation(e){let t=this.json,n=this,r=t.animations[e],i=r.name?r.name:`animation_`+e,a=[],o=[],s=[],c=[],l=[];for(let e=0,t=r.channels.length;e<t;e++){let t=r.channels[e],n=r.samplers[t.sampler],i=t.target,u=i.node,d=r.parameters===void 0?n.input:r.parameters[n.input],f=r.parameters===void 0?n.output:r.parameters[n.output];i.node!==void 0&&(a.push(this.getDependency(`node`,u)),o.push(this.getDependency(`accessor`,d)),s.push(this.getDependency(`accessor`,f)),c.push(n),l.push(i))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(s),Promise.all(c),Promise.all(l)]).then(function(e){let t=e[0],a=e[1],o=e[2],s=e[3],c=e[4],l=[];for(let e=0,r=t.length;e<r;e++){let r=t[e],i=a[e],u=o[e],d=s[e],f=c[e];if(r===void 0)continue;r.updateMatrix&&r.updateMatrix();let p=n._createAnimationTracks(r,i,u,d,f);if(p)for(let e=0;e<p.length;e++)l.push(p[e])}let u=new Wc(i,void 0,l);return Sm(u,r),u})}createNodeMesh(e){let t=this.json,n=this,r=t.nodes[e];return r.mesh===void 0?null:n.getDependency(`mesh`,r.mesh).then(function(e){let t=n._getNodeRef(n.meshCache,r.mesh,e);return r.weights!==void 0&&t.traverse(function(e){if(e.isMesh)for(let t=0,n=r.weights.length;t<n;t++)e.morphTargetInfluences[t]=r.weights[t]}),t})}loadNode(e){let t=this.json,n=this,r=t.nodes[e],i=n._loadNodeShallow(e),a=[],o=r.children||[];for(let e=0,t=o.length;e<t;e++)a.push(n.getDependency(`node`,o[e]));let s=r.skin===void 0?Promise.resolve(null):n.getDependency(`skin`,r.skin);return Promise.all([i,Promise.all(a),s]).then(function(e){let t=e[0],n=e[1],r=e[2];r!==null&&t.traverse(function(e){e.isSkinnedMesh&&e.bind(r,km)});for(let e=0,r=n.length;e<r;e++)t.add(n[e]);if(t.userData.pivot!==void 0&&n.length>0){let e=t.userData.pivot,r=n[0];t.pivot=new V().fromArray(e),t.position.x-=e[0],t.position.y-=e[1],t.position.z-=e[2],r.position.set(0,0,0),delete t.userData.pivot}return t})}_loadNodeShallow(e){let t=this.json,n=this.extensions,r=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let i=t.nodes[e],a=i.name?r.createUniqueName(i.name):``,o=[],s=r._invokeOne(function(t){return t.createNodeMesh&&t.createNodeMesh(e)});return s&&o.push(s),i.camera!==void 0&&o.push(r.getDependency(`camera`,i.camera).then(function(e){return r._getNodeRef(r.cameraCache,i.camera,e)})),r._invokeAll(function(t){return t.createNodeAttachment&&t.createNodeAttachment(e)}).forEach(function(e){o.push(e)}),this.nodeCache[e]=Promise.all(o).then(function(t){let o;if(o=i.isBone===!0?new us:t.length>1?new _a:t.length===1?t[0]:new ga,o!==t[0])for(let e=0,n=t.length;e<n;e++)o.add(t[e]);if(i.name&&(o.userData.name=i.name,o.name=a),Sm(o,i),i.extensions&&xm(n,o,i),i.matrix!==void 0){let e=new W;e.fromArray(i.matrix),o.applyMatrix4(e)}else i.translation!==void 0&&o.position.fromArray(i.translation),i.rotation!==void 0&&o.quaternion.fromArray(i.rotation),i.scale!==void 0&&o.scale.fromArray(i.scale);if(!r.associations.has(o))r.associations.set(o,{});else if(i.mesh!==void 0&&r.meshCache.refs[i.mesh]>1){let e=r.associations.get(o);r.associations.set(o,{...e})}return r.associations.get(o).nodes=e,o}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],r=this,i=new _a;n.name&&(i.name=r.createUniqueName(n.name)),Sm(i,n),n.extensions&&xm(t,i,n);let a=n.nodes||[],o=[];for(let e=0,t=a.length;e<t;e++)o.push(r.getDependency(`node`,a[e]));return Promise.all(o).then(function(e){for(let t=0,n=e.length;t<n;t++){let n=e[t];n.parent===null?i.add(n):i.add(Mp(n))}return r.associations=(e=>{let t=new Map;for(let[e,n]of r.associations)(e instanceof jo||e instanceof Ri)&&t.set(e,n);return e.traverse(e=>{let n=r.associations.get(e);n!=null&&t.set(e,n)}),t})(i),i})}_createAnimationTracks(e,t,n,r,i){let a=[],o=e.name?e.name:e.uuid,s=[];_m[i.path]===_m.weights?e.traverse(function(e){e.morphTargetInfluences&&s.push(e.name?e.name:e.uuid)}):s.push(o);let c;switch(_m[i.path]){case _m.weights:c=zc;break;case _m.rotation:c=Vc;break;case _m.translation:case _m.scale:c=Uc;break;default:switch(n.itemSize){case 1:c=zc;break;default:c=Uc}}let l=r.interpolation===void 0?Sr:vm[r.interpolation],u=this._getArrayFromAccessor(n);for(let e=0,n=s.length;e<n;e++){let n=new c(s[e]+`.`+_m[i.path],t.array,u,l);r.interpolation===`CUBICSPLINE`&&this._createCubicSplineTrackInterpolant(n),a.push(n)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let e=Dm(t.constructor),n=new Float32Array(t.length);for(let r=0,i=t.length;r<i;r++)n[r]=t[r]*e;t=n}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(e){return new(this instanceof Vc?um:cm)(this.times,this.values,this.getValueSize()/3,e)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function jm(e,t,n){let r=t.attributes,i=new Va;if(r.POSITION!==void 0){let e=n.json.accessors[r.POSITION],t=e.min,a=e.max;if(t!==void 0&&a!==void 0){if(i.set(new V(t[0],t[1],t[2]),new V(a[0],a[1],a[2])),e.normalized){let t=Dm(fm[e.componentType]);i.min.multiplyScalar(t),i.max.multiplyScalar(t)}}else{console.warn(`THREE.GLTFLoader: Missing min/max properties for accessor POSITION.`);return}}else return;let a=t.targets;if(a!==void 0){let e=new V,t=new V;for(let r=0,i=a.length;r<i;r++){let i=a[r];if(i.POSITION!==void 0){let r=n.json.accessors[i.POSITION],a=r.min,o=r.max;if(a!==void 0&&o!==void 0){if(t.setX(Math.max(Math.abs(a[0]),Math.abs(o[0]))),t.setY(Math.max(Math.abs(a[1]),Math.abs(o[1]))),t.setZ(Math.max(Math.abs(a[2]),Math.abs(o[2]))),r.normalized){let e=Dm(fm[r.componentType]);t.multiplyScalar(e)}e.max(t)}else console.warn(`THREE.GLTFLoader: Missing min/max properties for accessor POSITION.`)}}i.expandByVector(e)}e.boundingBox=i;let o=new vo;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,e.boundingSphere=o}function Mm(e,t,n){let r=t.attributes,i=[];function a(t,r){return n.getDependency(`accessor`,t).then(function(t){e.setAttribute(r,t)})}for(let t in r){let n=gm[t]||t.toLowerCase();n in e.attributes||i.push(a(r[t],n))}if(t.indices!==void 0&&!e.index){let r=n.getDependency(`accessor`,t.indices).then(function(t){e.setIndex(t)});i.push(r)}return U.workingColorSpace!==`srgb-linear`&&`COLOR_0`in r&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${U.workingColorSpace}" not supported.`),Sm(e,t),jm(e,t,n),Promise.all(i).then(function(){return t.targets===void 0?e:Cm(e,t.targets,n)})}var Nm=new Map;function Pm(e,t){return Nm.has(e)||Nm.set(e,new Pp(vp).loadAsync(`models/${e}/${t}.glb`).then(({scene:e})=>{e.updateMatrixWorld(!0);let t=new Va().setFromObject(e),n=t.getCenter(new V),r=t.getSize(new V),i=new W().makeScale(1/r.y,1/r.y,1/r.y).multiply(new W().makeTranslation(-n.x,-t.min.y,-n.z)),a=[];return e.traverse(e=>{if(!e.isMesh)return;let t=e.material;for(let e of Object.values(t))e?.isTexture&&(e.anisotropy=Math.min(4,Sp.anisotropy));t.envMapIntensity=.5,Cp.set(`scenery:${t.uuid}`,t),a.push({geometry:e.geometry.clone().applyMatrix4(i.clone().multiply(e.matrixWorld)),material:t})}),e.traverse(e=>e.geometry?.dispose()),a})),Nm.get(e)}var Fm=class{constructor(e,t,n){this.scene=e,this.world=t,this.vegetation=n,this.active=!0,this.nextUpdate=0,this.treeMeshes=[],this.treeObjects=t.objects.filter(e=>e.type===`tree`),this.ready=Promise.allSettled([Sp.detailedFoliage&&this.trees(),this.streetlights(),Sp.detailedFoliage&&this.shrubs()]).then(e=>{for(let t of e)t.status===`rejected`&&console.warn(`Scenery model unavailable`,t.reason)})}instances(e,t,n){let r=new ga,i=[];for(let a of e){let e=new Cs(a.geometry.clone(),a.material,t.length);e.name=n,t.forEach((t,n)=>{r.position.set(t.x,t.y||0,t.z),r.rotation.set(0,t.rotation||0,0),r.scale.setScalar(t.height),r.updateMatrix(),e.setMatrixAt(n,r.matrix)}),e.castShadow=e.receiveShadow=!0,e.computeBoundingSphere(),this.scene.add(e),i.push(e)}return i}async trees(){let e=await Pm(`tree_small_02`,`tree`);if(this.active){this.treeMeshes=this.instances(e,Array.from({length:36},()=>({x:0,z:0,height:0})),`detailed-tree`);for(let e of this.treeMeshes)e.count=0}}async streetlights(){if(this.world.type===`highway`)return;let e=await Pm(`street_lamp_01`,`lamp`);if(!this.active)return;let t=[];for(let e of this.world.edges){let n=this.world.byId[e.a],r=this.world.byId[e.b],i=Math.atan2(r.x-n.x,n.z-r.z);for(let r=26;r<e.length-20;r+=42){let e=Math.round(r/42)%2?-1:1;t.push({x:n.x+Math.sin(i)*r+Math.cos(i)*7.25*e,z:n.z-Math.cos(i)*r+Math.sin(i)*7.25*e,height:6.8,rotation:-i+e*Math.PI/2})}}let n=new Map;for(let e of t){let t=`${Math.floor(e.x/70)}:${Math.floor(e.z/70)}`,r=n.get(t)||[];r.push(e),n.set(t,r)}for(let t of n.values())this.instances(e,t,`streetlight`)}async shrubs(){let e=await Pm(`shrub_01`,`shrub`);if(!this.active)return;let t=d(this.world.seed+510),n=this.treeObjects.filter((e,t)=>t%3==0).map(e=>({x:e.x+1.5,z:e.z-1.2,height:.75+t()*.65,rotation:t()*Math.PI*2})),r=new Map;for(let e of n){let t=`${Math.floor(e.x/80)}:${Math.floor(e.z/80)}`,n=r.get(t)||[];n.push(e),r.set(t,n)}for(let t of r.values())this.instances(e,t,`landscape-shrub`)}update(e,t){if(!this.treeMeshes.length||t<this.nextUpdate)return;this.nextUpdate=t+.4;let n=this.treeObjects.map(t=>({object:t,distance:Math.hypot(t.x-e.x,t.z-e.z)})).filter(e=>e.distance<130).sort((e,t)=>e.distance-t.distance).slice(0,36),r=new ga;for(let e of this.treeMeshes)e.count=n.length,n.forEach(({object:t},n)=>{r.position.set(t.x,0,t.z),r.rotation.set(0,t.x*.81+t.z*.37,0),r.scale.setScalar(t.height*1.25),r.updateMatrix(),e.setMatrixAt(n,r.matrix)}),e.instanceMatrix.needsUpdate=!0,e.computeBoundingSphere();this.vegetation.hideTrees(new Set(n.map(e=>e.object.id)))}};function Im(){let e=document.createElement(`canvas`);e.width=e.height=512;let t=e.getContext(`2d`),n=d(812);t.lineCap=`round`,t.strokeStyle=`#544a2d`,t.lineWidth=4,t.beginPath(),t.moveTo(250,490),t.quadraticCurveTo(230,280,260,30),t.stroke();for(let e=0;e<10;e++)for(let r of[-1,1]){let i=58+e*39;t.save(),t.translate(250+r*(22+n()*48),i),t.rotate(r*(-.8+n()*.35));let a=23+n()*12,o=59+n()*30,s=t.createLinearGradient(-a,0,a,o);s.addColorStop(0,`#6b852b`),s.addColorStop(.5,`#466b23`),s.addColorStop(1,`#203f18`),t.fillStyle=s,t.beginPath(),t.moveTo(0,-o/2),t.bezierCurveTo(a,-o/3,a,o/4,0,o/2),t.bezierCurveTo(-a,o/4,-a,-o/3,0,-o/2),t.fill(),t.strokeStyle=`#93a249a0`,t.lineWidth=1.2,t.beginPath(),t.moveTo(0,-o/2),t.lineTo(0,o/2),t.stroke();for(let e=-2;e<=2;e++)t.beginPath(),t.moveTo(0,e*10),t.lineTo(a*.7,e*10-12),t.moveTo(0,e*10),t.lineTo(-a*.7,e*10-12),t.stroke();t.restore()}let r=new ec(e);return r.colorSpace=jr,r.anisotropy=4,r}var Lm=class{constructor(e,t){this.scene=e,this.world=t,this.random=d(t.seed+983),this.wind={value:0},this.leaves=new Map,this.treeCards=new Map,this.hiddenTrees=new Set,Cp.has(`leaves`)||Cp.set(`leaves`,new Cc({map:Im(),alphaTest:.38,side:2,roughness:.87,emissive:`#253613`,emissiveIntensity:.13})),this.leafMaterial=Cp.get(`leaves`),this.addWind(this.leafMaterial,.045),this.leafMaterial.needsUpdate=!0}addWind(e,t){e.onBeforeCompile=e=>{e.uniforms.windTime=this.wind,e.vertexShader=`uniform float windTime;\n${e.vertexShader}`.replace(`#include <begin_vertex>`,`#include <begin_vertex>
        #ifdef USE_INSTANCING
        float phase = instanceMatrix[3].x * 0.29 + instanceMatrix[3].z * 0.21;
        transformed.x += sin(windTime * 1.3 + phase + position.y * 2.0) * ${t.toFixed(3)} * (position.y + 1.0);
        transformed.z += cos(windTime * 0.8 + phase) * ${(t*.6).toFixed(3)};
        #endif`)},e.customProgramCacheKey=()=>`foliage-wind-${t}`}tree(e,t){let n=this.random,r=t.height*1.25,i=Dp(`bark`,`#b8b0a0`,1.6),a=(t,n,r)=>{let a=n.clone().sub(t),o=new sc(r*.4,r,a.length(),9);Ap(o,i);let s=new K(o,i);s.position.copy(t).add(n).multiplyScalar(.5),s.quaternion.setFromUnitVectors(new V(0,1,0),a.normalize()),s.castShadow=s.receiveShadow=!0,e.add(s)},o=new V(t.x,0,t.z);a(o,o.clone().add(new V(.15,r*.86,.12)),r*.031);for(let e=0;e<9;e++){let t=e*2.4+n(),i=r*(.28+e*.048);a(o.clone().add(new V(0,i,0)),o.clone().add(new V(Math.cos(t)*r*.23,i+r*.2,Math.sin(t)*r*.23)),r*.012)}let s=`${Math.floor(t.x/70)}:${Math.floor(t.z/70)}`,c=this.leaves.get(s)||[],l=t.kind===`pine`;for(let e=0;e<Sp.leafCards;e++){let e=n()*Math.PI*2,i=n(),a=Math.sqrt(n())*r*(l?(1-i)*.29:Math.sqrt(1-(i*2-1)**2)*.31);c.push({treeId:t.id,x:t.x+Math.cos(e)*a,y:r*(.42+i*.58),z:t.z+Math.sin(e)*a,scale:r*(l?.2:.24),rx:(n()-.5)*Math.PI,ry:n()*Math.PI,rz:n()*Math.PI,shade:l?.7+n()*.22:.82+n()*.3})}this.leaves.set(s,c)}finish(){let e=new ga,t=new G;for(let n of this.leaves.values()){let r=new Cs(new dc(1,1),this.leafMaterial,n.length);r.name=`leaf-canopy`,n.forEach((n,i)=>{e.position.set(n.x,n.y,n.z),e.rotation.set(n.rx,n.ry,n.rz),e.scale.setScalar(n.scale),e.updateMatrix(),r.setMatrixAt(i,e.matrix);let a=this.treeCards.get(n.treeId)||[];a.push({mesh:r,index:i,matrix:e.matrix.clone()}),this.treeCards.set(n.treeId,a),t.setRGB(n.shade,n.shade,n.shade*.9),r.setColorAt(i,t)}),r.castShadow=r.receiveShadow=!0,r.customDepthMaterial=new Tc({depthPacking:Ar,map:this.leafMaterial.map,alphaTest:.38,side:2}),this.addWind(r.customDepthMaterial,.045),r.computeBoundingSphere(),this.scene.add(r)}this.grass()}grass(){let e=this.random,t=[];for(let n of this.world.objects.filter(e=>e.type===`parcel`))for(let r=0;r<(n.park?600:200);r++){let r=n.x+(e()-.5)*(n.width-2),i=n.z+(e()-.5)*(n.depth-2);n.park&&(Math.abs(r-n.x)<1.3||Math.abs(i-n.z)<1.3)||this.world.objects.some(e=>e.type===`building`&&Math.abs(r-e.x)<e.width/2+1&&Math.abs(i-e.z)<e.depth/2+1)||t.push({x:r,z:i})}if(this.world.type===`highway`)for(let n of this.world.objects.filter(e=>e.type===`tree`))for(let r=0;r<24;r++)t.push({x:n.x+(e()-.5)*8,z:n.z+(e()-.5)*8});let n=[],r=[];for(let t=0;t<5;t++){let t=(e()-.5)*.45,i=(e()-.5)*.45,a=.18+e()*.28;n.push(t-.035,0,i,t+.035,0,i,t+.12,a,i+.08),r.push(0,.7,.7,0,.7,.7,0,.7,.7)}let i=new Eo;i.setAttribute(`position`,new mo(n,3)),i.setAttribute(`normal`,new mo(r,3));let a=new Cc({color:`#586537`,roughness:1,side:2});this.addWind(a,.025);let o=new Cs(i,a,t.length),s=new ga;t.forEach((t,n)=>{s.position.set(t.x,.1,t.z),s.rotation.y=e()*Math.PI,s.scale.setScalar(.6+e()*.6),s.updateMatrix(),o.setMatrixAt(n,s.matrix)}),o.name=`grass-blades`,o.receiveShadow=!0,o.computeBoundingSphere(),this.scene.add(o)}hideTrees(e){let t=new W().makeScale(0,0,0);for(let n of new Set([...this.hiddenTrees,...e]))if(this.hiddenTrees.has(n)!==e.has(n))for(let r of this.treeCards.get(n)||[])r.mesh.setMatrixAt(r.index,e.has(n)&&r.index%3!=0?t:r.matrix),r.mesh.instanceMatrix.needsUpdate=!0;this.hiddenTrees=e}update(e){this.wind.value=e}},Rm=new WeakMap,zm=class extends Zc{constructor(e){super(e),this.decoderPath=``,this.decoderConfig={},this.decoderBinary=null,this.decoderPending=null,this.workerLimit=4,this.workerPool=[],this.workerNextTaskID=1,this.workerSourceURL=``,this.defaultAttributeIDs={position:`POSITION`,normal:`NORMAL`,color:`COLOR`,uv:`TEX_COORD`},this.defaultAttributeTypes={position:`Float32Array`,normal:`Float32Array`,color:`Float32Array`,uv:`Float32Array`}}setDecoderPath(e){return this.decoderPath=e,this}setDecoderConfig(e){return this.decoderConfig=e,this}setWorkerLimit(e){return this.workerLimit=e,this}load(e,t,n,r){let i=new el(this.manager);i.setPath(this.path),i.setResponseType(`arraybuffer`),i.setRequestHeader(this.requestHeader),i.setWithCredentials(this.withCredentials),i.load(e,e=>{this.parse(e,t,r)},n,r)}parse(e,t,n=()=>{}){this.decodeDracoFile(e,t,null,null,jr,n).catch(n)}decodeDracoFile(e,t,n,r,i=Mr,a=()=>{}){let o={attributeIDs:n||this.defaultAttributeIDs,attributeTypes:r||this.defaultAttributeTypes,useUniqueIDs:!!n,vertexColorSpace:i};return this.decodeGeometry(e,o).then(t).catch(a)}decodeGeometry(e,t){let n=JSON.stringify(t);if(Rm.has(e)){let t=Rm.get(e);if(t.key===n)return t.promise;if(e.byteLength===0)throw Error(`THREE.DRACOLoader: Unable to re-decode a buffer with different settings. Buffer has already been transferred.`)}let r,i=this.workerNextTaskID++,a=e.byteLength,o=this._getWorker(i,a).then(n=>(r=n,new Promise((n,a)=>{r._callbacks[i]={resolve:n,reject:a},r.postMessage({type:`decode`,id:i,taskConfig:t,buffer:e},[e])}))).then(e=>this._createGeometry(e.geometry));return o.catch(()=>!0).then(()=>{r&&i&&this._releaseTask(r,i)}),Rm.set(e,{key:n,promise:o}),o}_createGeometry(e){let t=new Eo;e.index&&t.setIndex(new uo(e.index.array,1));for(let n=0;n<e.attributes.length;n++){let{name:r,array:i,itemSize:a,stride:o,vertexColorSpace:s}=e.attributes[n],c;c=a===o?new uo(i,a):new ko(new Do(i,o),a,0),r===`color`&&(this._assignVertexColorSpace(c,s),c.normalized=!(i instanceof Float32Array)),t.setAttribute(r,c)}return t}_assignVertexColorSpace(e,t){if(t!==`srgb`)return;let n=new G;for(let t=0,r=e.count;t<r;t++)n.fromBufferAttribute(e,t),U.colorSpaceToWorking(n,jr),e.setXYZ(t,n.r,n.g,n.b)}_loadLibrary(e,t){let n=new el(this.manager);return n.setPath(this.decoderPath),n.setResponseType(t),n.setWithCredentials(this.withCredentials),new Promise((t,r)=>{n.load(e,t,void 0,r)})}preload(){return this._initDecoder(),this}_initDecoder(){if(this.decoderPending)return this.decoderPending;let e=typeof WebAssembly!=`object`||this.decoderConfig.type===`js`,t=[];return e?t.push(this._loadLibrary(`draco_decoder.js`,`text`)):(t.push(this._loadLibrary(`draco_wasm_wrapper.js`,`text`)),t.push(this._loadLibrary(`draco_decoder.wasm`,`arraybuffer`))),this.decoderPending=Promise.all(t).then(t=>{let n=t[0];e||(this.decoderConfig.wasmBinary=t[1]);let r=Bm.toString(),i=[`/* draco decoder */`,n,``,`/* worker */`,r.substring(r.indexOf(`{`)+1,r.lastIndexOf(`}`))].join(`
`);this.workerSourceURL=URL.createObjectURL(new Blob([i]))}),this.decoderPending}_getWorker(e,t){return this._initDecoder().then(()=>{if(this.workerPool.length<this.workerLimit){let e=new Worker(this.workerSourceURL);e._callbacks={},e._taskCosts={},e._taskLoad=0,e.postMessage({type:`init`,decoderConfig:this.decoderConfig}),e.onmessage=function(t){let n=t.data;switch(n.type){case`decode`:e._callbacks[n.id].resolve(n);break;case`error`:e._callbacks[n.id].reject(n);break;default:console.error(`THREE.DRACOLoader: Unexpected message, "`+n.type+`"`)}},this.workerPool.push(e)}else this.workerPool.sort(function(e,t){return e._taskLoad>t._taskLoad?-1:1});let n=this.workerPool[this.workerPool.length-1];return n._taskCosts[e]=t,n._taskLoad+=t,n})}_releaseTask(e,t){e._taskLoad-=e._taskCosts[t],delete e._callbacks[t],delete e._taskCosts[t]}debug(){console.log(`Task load: `,this.workerPool.map(e=>e._taskLoad))}dispose(){for(let e=0;e<this.workerPool.length;++e)this.workerPool[e].terminate();return this.workerPool.length=0,this.workerSourceURL!==``&&URL.revokeObjectURL(this.workerSourceURL),this}};function Bm(){let e,t;onmessage=function(r){let i=r.data;switch(i.type){case`init`:e=i.decoderConfig,t=new Promise(function(t){e.onModuleLoaded=function(e){t({draco:e})},DracoDecoderModule(e)});break;case`decode`:let r=i.buffer,a=i.taskConfig;t.then(e=>{let t=e.draco,o=new t.Decoder;try{let e=n(t,o,new Int8Array(r),a),s=e.attributes.map(e=>e.array.buffer);e.index&&s.push(e.index.array.buffer),self.postMessage({type:`decode`,id:i.id,geometry:e},s)}catch(e){console.error(e),self.postMessage({type:`error`,id:i.id,error:e.message})}finally{t.destroy(o)}})}};function n(e,t,n,a){let o=a.attributeIDs,s=a.attributeTypes,c,l,u=t.GetEncodedGeometryType(n);if(u===e.TRIANGULAR_MESH)c=new e.Mesh,l=t.DecodeArrayToMesh(n,n.byteLength,c);else if(u===e.POINT_CLOUD)c=new e.PointCloud,l=t.DecodeArrayToPointCloud(n,n.byteLength,c);else throw Error(`THREE.DRACOLoader: Unexpected geometry type.`);if(!l.ok()||c.ptr===0)throw Error(`THREE.DRACOLoader: Decoding failed: `+l.error_msg());let d={index:null,attributes:[]};for(let n in o){let r=self[s[n]],l,u;if(a.useUniqueIDs)u=o[n],l=t.GetAttributeByUniqueId(c,u);else{if(u=t.GetAttributeId(c,e[o[n]]),u===-1)continue;l=t.GetAttribute(c,u)}let f=i(e,t,c,n,r,l);n===`color`&&(f.vertexColorSpace=a.vertexColorSpace),d.attributes.push(f)}return u===e.TRIANGULAR_MESH&&(d.index=r(e,t,c)),e.destroy(c),d}function r(e,t,n){let r=n.num_faces()*3,i=r*4,a=e._malloc(i);t.GetTrianglesUInt32Array(n,i,a);let o=new Uint32Array(e.HEAPF32.buffer,a,r).slice();return e._free(a),{array:o,itemSize:1}}function i(e,t,n,r,i,o){let s=n.num_points(),c=o.num_components(),l=a(e,i),u=c*i.BYTES_PER_ELEMENT,d=Math.ceil(u/4)*4,f=d/i.BYTES_PER_ELEMENT,p=s*u,m=s*d,h=e._malloc(p);t.GetAttributeDataArrayForAllPoints(n,o,l,p,h);let g=new i(e.HEAPF32.buffer,h,p/i.BYTES_PER_ELEMENT),_;if(u===d)_=g.slice();else{_=new i(m/i.BYTES_PER_ELEMENT);let e=0;for(let t=0,n=g.length;t<n;t++){for(let n=0;n<c;n++)_[e+n]=g[t*c+n];e+=f}}return e._free(h),{name:r,count:s,itemSize:c,array:_,stride:f}}function a(e,t){switch(t){case Float32Array:return e.DT_FLOAT32;case Int8Array:return e.DT_INT8;case Int16Array:return e.DT_INT16;case Int32Array:return e.DT_INT32;case Uint8Array:return e.DT_UINT8;case Uint16Array:return e.DT_UINT16;case Uint32Array:return e.DT_UINT32}}}var Vm,Hm=[`wheel_fl`,`wheel_fr`,`wheel_rl`,`wheel_rr`];function Um(e,t,n,r){let i=e.userData.wheelbase,a=S(n,r);for(let n of Hm){let r=e.getObjectByName(n),o=r.children[0];o.rotation.x=(o.rotation.x-t/r.userData.radius)%(Math.PI*2),r.rotation.y=r.userData.front?-Math.atan(i*a/(1-r.position.x*a)):0}}async function Wm(){Vm||=(async()=>{let e=new zm(vp).setDecoderPath(`draco/`),{scene:t}=await new Pp(vp).setDRACOLoader(e).loadAsync(`models/model-y/model-y.glb`);e.dispose();let n=kp(`model-y-paint`,{color:`#e1e4e8`,metalness:.35,roughness:.24,clearcoat:1,clearcoatRoughness:.08}),r=kp(`model-y-alloy`,{color:`#5c626a`,metalness:.9,roughness:.28}),i=kp(`model-y-glass`,{color:`#192530`,metalness:.25,roughness:.08,clearcoat:1});i.name=`Glass`;let a=kp(`model-y-light-lenses`,{color:`#eef4ff`,metalness:.05,roughness:.1,transparent:!0,opacity:.14,depthWrite:!1}),o=kp(`model-y-leather`,{color:`#24282c`,roughness:.85});t.rotation.y=-Math.PI/2,t.updateMatrixWorld(!0);let s=new Va().setFromObject(t),c=s.getSize(new V),l=s.getCenter(new V),u=4.75/c.z,d=new W().makeScale(u,u,u).multiply(new W().makeTranslation(-l.x,-s.min.y,-l.z)),f=new _a,p=new Map([[f,new Map]]),m=new Map,h=e=>new Va().setFromObject(e).applyMatrix4(d),g=[];if(t.traverse(e=>{if(!e.isMesh||(e.material.name===`glass_body`&&g.push(h(e)),e.material.name!==`tires`))return;let t=h(e),n=t.getSize(new V);if(n.y<.72)return;let r=t.getCenter(new V),i=r.z<0,a=`wheel_${i?`f`:`r`}${r.x<0?`l`:`r`}`,o=new _a;o.name=a,o.position.copy(r),o.userData.front=i,o.userData.radius=n.y/2;let s=new _a;s.name=`${a}_spin`,o.add(s),f.add(o),m.set(a,{pivot:o,rotor:s}),p.set(s,new Map),p.set(o,new Map)}),m.size!==4)throw Error(`Model Y asset is missing an axle`);let _=new Set([`tires`,`wheels`,`brakedsk`,`metal`,`alum`,`chrome`]),v=new Set([`calipers`,`calipers2`]);t.traverse(e=>{if(!e.isMesh)return;let t=e.material.name,s=h(e),c=s.getCenter(new V),l=s.getSize(new V),u=`wheel_${c.z<0?`f`:`r`}${c.x<0?`l`:`r`}`,y=m.get(u),b=Math.abs(c.z-y.pivot.position.z)<.3&&Math.abs(c.x-y.pivot.position.x)<.25&&s.max.y<.8&&l.z<.8&&(_.has(t)||v.has(t))?y:null;if(t===`interior`&&g.some(e=>e.min.distanceTo(s.min)<.025&&e.max.distanceTo(s.max)<.025))return;let x=e.material;t===`body`?x=n:t===`wheels`?x=r:t===`glass_body`?x=i:[`glass_lights`,`glass_front_lights`].includes(t)?x=a:t===`interior`&&(x=o);let S=(e.geometry.index?e.geometry.toNonIndexed():e.geometry.clone()).applyMatrix4(d.clone().multiply(e.matrixWorld));b&&S.translate(-b.pivot.position.x,-b.pivot.position.y,-b.pivot.position.z);for(let e of Object.keys(S.attributes))[`position`,`normal`,`uv`].includes(e)||S.deleteAttribute(e);S.attributes.uv||S.setAttribute(`uv`,new uo(new Float32Array(S.attributes.position.count*2),2));let C=b?v.has(t)?b.pivot:b.rotor:f,w=p.get(C),T=w.get(x)||[];T.push(S),w.set(x,T)});for(let[e,t]of p)for(let[n,r]of t){Cp.set(`asset-car:${n.uuid}`,n);let t=new K(lp(r),n);t.castShadow=n!==a,t.receiveShadow=!0,e.add(t),r.forEach(e=>e.dispose())}return t.traverse(e=>e.geometry?.dispose()),f.name=`tesla-model-y`,f.userData.eyeHeight=1.28,f.userData.eyeForward=.45,f.userData.wheelbase=Math.abs(m.get(`wheel_fl`).pivot.position.z-m.get(`wheel_rl`).pivot.position.z),f})();let e=(await Vm).clone(!0);return e.traverse(e=>{e.isMesh&&(e.geometry=e.geometry.clone())}),e}var Gm=new V;function Km(e,t,n,r,i,a){let o=2*Math.PI*i/4,s=Math.max(a-2*i,0),c=Math.PI/4;Gm.copy(t),Gm[r]=0,Gm.normalize();let l=.5*o/(o+s),u=1-Gm.angleTo(e)/c;return Math.sign(Gm[n])===1?u*l:s/(o+s)+l+l*(1-u)}var qm=class e extends ic{constructor(e=1,t=1,n=1,r=2,i=.1){let a=r*2+1;if(i=Math.min(e/2,t/2,n/2,i),super(1,1,1,a,a,a),this.type=`RoundedBoxGeometry`,this.parameters={width:e,height:t,depth:n,segments:r,radius:i},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let s=new V,c=new V,l=new V(e,t,n).divideScalar(2).subScalar(i),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,p=u.length/6,m=new V,h=.5/a;for(let r=0,a=0;r<u.length;r+=3,a+=2)switch(s.fromArray(u,r),c.copy(s),c.x-=Math.sign(c.x)*h,c.y-=Math.sign(c.y)*h,c.z-=Math.sign(c.z)*h,c.normalize(),u[r+0]=l.x*Math.sign(s.x)+c.x*i,u[r+1]=l.y*Math.sign(s.y)+c.y*i,u[r+2]=l.z*Math.sign(s.z)+c.z*i,d[r+0]=c.x,d[r+1]=c.y,d[r+2]=c.z,Math.floor(r/p)){case 0:m.set(1,0,0),f[a+0]=Km(m,c,`z`,`y`,i,n),f[a+1]=1-Km(m,c,`y`,`z`,i,t);break;case 1:m.set(-1,0,0),f[a+0]=1-Km(m,c,`z`,`y`,i,n),f[a+1]=1-Km(m,c,`y`,`z`,i,t);break;case 2:m.set(0,1,0),f[a+0]=1-Km(m,c,`x`,`z`,i,e),f[a+1]=Km(m,c,`z`,`x`,i,n);break;case 3:m.set(0,-1,0),f[a+0]=1-Km(m,c,`x`,`z`,i,e),f[a+1]=1-Km(m,c,`z`,`x`,i,n);break;case 4:m.set(0,0,1),f[a+0]=1-Km(m,c,`x`,`y`,i,e),f[a+1]=1-Km(m,c,`y`,`x`,i,t);break;case 5:m.set(0,0,-1),f[a+0]=Km(m,c,`x`,`y`,i,e),f[a+1]=1-Km(m,c,`y`,`x`,i,t)}}static fromJSON(t){return new e(t.width,t.height,t.depth,t.segments,t.radius)}};function Jm(e=`#d6d9df`,t=!1){let n=new _a,r=kp(`paint:${e}`,{color:e,metalness:.55,roughness:.25,clearcoat:1,clearcoatRoughness:.12}),i=kp(`vehicle-glass`,{color:`#202d3b`,metalness:.38,roughness:.08,clearcoat:1}),a=kp(`rubber`,{color:`#141518`,roughness:.96}),o=kp(`wheel-alloy`,{color:`#a4a9b2`,metalness:.9,roughness:.25}),s=kp(`dark-trim`,{color:`#24262a`,roughness:.4,metalness:.5}),c=kp(`headlight`,{color:`#f8fcff`,emissive:`#d9eeff`,emissiveIntensity:2,roughness:.2}),l=kp(`taillight`,{color:`#d71121`,emissive:`#a9000b`,emissiveIntensity:1.3,roughness:.2}),u=(e,t,r,i,a)=>{let o=new K(e,t);return o.position.set(r,i,a),o.castShadow=o.receiveShadow=!0,n.add(o),o},d=(e,t,n,r,i,a,o,s=.025)=>u(new qm(e,t,n,2,s),o,r,i,a),f=(e,t)=>{let n=new Eo;return n.setAttribute(`position`,new mo(e.flat(),3)),n.setAttribute(`uv`,new mo([0,0,1,0,1,1,0,1],2)),n.setIndex([0,1,2,0,2,3]),n.computeVertexNormals(),u(n,t,0,0,0)};if(t){d(.48,.4,1.15,0,.65,0,s,.1),d(.58,.4,.7,0,.94,-.22,r,.15),d(.5,.13,.68,0,1.06,.28,a),d(.78,.05,.08,0,1.16,-.6,o),d(.3,.15,.1,0,1.04,-.82,c),d(.2,.12,.1,0,.86,.85,l),d(.47,.56,.35,0,1.37,.15,Op(`#303942`),.12),u(new fc(.245,16,12),r,0,1.83,0),d(.34,.12,.12,0,1.83,-.2,i);for(let e of[-1,1]){let t=d(.16,.7,.18,e*.25,.91,.2,a,.06);t.rotation.x=.3;let n=d(.14,.55,.14,e*.28,1.36,-.12,s,.05);n.rotation.x=.85}}else{d(1.9,.64,4.16,0,.73,0,r,.2),d(1.77,.17,3.95,0,.43,0,s,.06),d(1.65,.15,1.25,0,1.03,-1.28,r,.08),d(1.62,.14,.85,0,1.04,1.51,r,.07);let e=1.04,t=1.61;f([[-.78,e,-.92],[.78,e,-.92],[.66,t,-.36],[-.66,t,-.36]],i),f([[.77,e,1.16],[-.77,e,1.16],[-.66,t,.68],[.66,t,.68]],i);for(let n of[-1,1]){let a=[[n*.78,e,-.87],[n*.78,e,1.11],[n*.66,t,.68],[n*.66,t,-.36]];n<0&&a.reverse(),f(a,i),d(.075,.55,.075,n*.72,1.32,.28,s),d(.045,.05,2.08,n*.81,1.04,.12,o);for(let e of[-.2,.88])d(.05,.035,.22,n*.95,.92,e,o);d(.24,.13,.34,n*1,1.08,-.66,r,.055),d(.15,.08,.02,n*1,1.08,-.47,o),d(.017,.46,.017,n*.95,.77,.29,s,.002),d(.59,.065,.055,n*.58,.91,-2.06,c),d(.6,.075,.055,n*.58,.91,2.06,l)}d(1.38,.095,1.16,0,1.64,.15,r,.045),d(1.28,.02,.83,0,1.696,.1,i),d(1.14,.18,.05,0,.56,-2.074,s);for(let e=-4;e<=4;e++)d(.016,.12,.06,e*.115,.56,-2.08,o,.003);d(.47,.13,.035,0,.62,2.09,Op(`#e0e2e4`)),d(.5,.04,.025,0,.98,2.094,l)}for(let e of t?[-.77,.77]:[-1.29,1.28])for(let n of t?[0]:[-1,1]){let r=n*.87,i=u(new pc(t?.28:.285,t?.085:.1,10,24),a,r,.39,e);i.rotation.y=Math.PI/2;let c=u(new sc(.23,.23,t?.13:.22,24),s,r,.39,e);c.rotation.z=Math.PI/2;for(let n=0;n<6;n++){let i=d(t?.15:.24,.035,.43,r,.39,e,o,.012);i.rotation.x=n*Math.PI/6}}n.updateMatrixWorld(!0);let p=new Map;n.traverse(e=>{if(!e.isMesh)return;let t=p.get(e.material)||[],n=e.geometry.index?e.geometry.toNonIndexed():e.geometry.clone();t.push(n.applyMatrix4(e.matrixWorld)),p.set(e.material,t),e.geometry.dispose()}),n.clear();for(let[e,t]of p){let r=new K(lp(t),e);r.castShadow=r.receiveShadow=!0,n.add(r),t.forEach(e=>e.dispose())}return n}var Ym=class extends rl{constructor(e){super(e),this.type=Cn}parse(e){let t=function(e,t){switch(e){case 1:throw Error(`THREE.HDRLoader: Read Error: `+(t||``));case 2:throw Error(`THREE.HDRLoader: Write Error: `+(t||``));case 3:throw Error(`THREE.HDRLoader: Bad File Format: `+(t||``));default:case 4:throw Error(`THREE.HDRLoader: Memory Error: `+(t||``))}},n=function(e,t,n){t||=1024;let r=e.pos,i=-1,a=0,o=``,s=String.fromCharCode.apply(null,new Uint16Array(e.subarray(r,r+128)));for(;0>(i=s.indexOf(`
`))&&a<t&&r<e.byteLength;)o+=s,a+=s.length,r+=128,s+=String.fromCharCode.apply(null,new Uint16Array(e.subarray(r,r+128)));return-1<i&&(!1!==n&&(e.pos+=a+i+1),o+s.slice(0,i))},r=function(e){let r=/^#\?(\S+)/,i=/^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,a=/^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,o=/^\s*FORMAT=(\S+)\s*$/,s=/^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,c={valid:0,string:``,comments:``,programtype:`RGBE`,format:``,gamma:1,exposure:1,width:0,height:0},l,u;for((e.pos>=e.byteLength||!(l=n(e)))&&t(1,`no header found`),(u=l.match(r))||t(3,`bad initial token`),c.valid|=1,c.programtype=u[1],c.string+=l+`
`;l=n(e),!1!==l;){if(c.string+=l+`
`,l.charAt(0)===`#`){c.comments+=l+`
`;continue}if((u=l.match(i))&&(c.gamma=parseFloat(u[1])),(u=l.match(a))&&(c.exposure=parseFloat(u[1])),(u=l.match(o))&&(c.valid|=2,c.format=u[1]),(u=l.match(s))&&(c.valid|=4,c.height=parseInt(u[1],10),c.width=parseInt(u[2],10)),c.valid&2&&c.valid&4)break}return c.valid&2||t(3,`missing format specifier`),c.valid&4||t(3,`missing image size specifier`),c},i=function(e,n,r){let i=n;if(i<8||i>32767||e[0]!==2||e[1]!==2||e[2]&128)return new Uint8Array(e);i!==(e[2]<<8|e[3])&&t(3,`wrong scanline width`);let a=new Uint8Array(4*n*r);a.length||t(4,`unable to allocate buffer space`);let o=0,s=0,c=4*i,l=new Uint8Array(4),u=new Uint8Array(c),d=r;for(;d>0&&s<e.byteLength;){s+4>e.byteLength&&t(1),l[0]=e[s++],l[1]=e[s++],l[2]=e[s++],l[3]=e[s++],(l[0]!=2||l[1]!=2||(l[2]<<8|l[3])!=i)&&t(3,`bad rgbe scanline format`);let n=0,r;for(;n<c&&s<e.byteLength;){r=e[s++];let i=r>128;if(i&&(r-=128),(r===0||n+r>c)&&t(3,`bad scanline data`),i){let t=e[s++];for(let e=0;e<r;e++)u[n++]=t}else u.set(e.subarray(s,s+r),n),n+=r,s+=r}let f=i;for(let e=0;e<f;e++){let t=0;a[o]=u[e+t],t+=i,a[o+1]=u[e+t],t+=i,a[o+2]=u[e+t],t+=i,a[o+3]=u[e+t],o+=4}d--}return a},a=function(e,t,n,r){let i=2**(e[t+3]-128)/255;n[r+0]=e[t+0]*i,n[r+1]=e[t+1]*i,n[r+2]=e[t+2]*i,n[r+3]=1},o=function(e,t,n,r){let i=2**(e[t+3]-128)/255;n[r+0]=oo.toHalfFloat(Math.min(e[t+0]*i,65504)),n[r+1]=oo.toHalfFloat(Math.min(e[t+1]*i,65504)),n[r+2]=oo.toHalfFloat(Math.min(e[t+2]*i,65504)),n[r+3]=oo.toHalfFloat(1)},s=new Uint8Array(e);s.pos=0;let c=r(s),l=c.width,u=c.height,d=i(s.subarray(s.pos),l,u),f,p,m;switch(this.type){case Sn:m=d.length/4;let e=new Float32Array(m*4);for(let t=0;t<m;t++)a(d,t*4,e,t*4);f=e,p=Sn;break;case Cn:m=d.length/4;let t=new Uint16Array(m*4);for(let e=0;e<m;e++)o(d,e*4,t,e*4);f=t,p=Cn;break;default:throw Error(`THREE.HDRLoader: Unsupported type: `+this.type)}return{width:l,height:u,data:f,header:c.string,gamma:c.gamma,exposure:c.exposure,type:p}}setDataType(e){return this.type=e,this}load(e,t,n,r){function i(e,n){switch(e.type){case Sn:case Cn:e.colorSpace=Mr,e.minFilter=pn,e.magFilter=pn,e.generateMipmaps=!1,e.flipY=!0}t&&t(e,n)}return super.load(e,i,n,r)}},Xm;function Zm(){return Xm||=new Ym(vp).loadAsync(`textures/daylight.hdr`).then(e=>(e.mapping=303,e))}function X(e,t,n,r,i,a,o,s,c=0){let l=new K(Ap(new ic(t,n,r),Op(s)),Op(s));return l.position.set(i,a,o),l.rotation.y=c,l.castShadow=!0,l.receiveShadow=!0,e.add(l),l}function Qm(e,t,n,r,i,a,o,s=5){let c=new K(new cc(t,n,s),Op(o));return c.position.set(r,i,a),c.castShadow=!0,e.add(c),c}function $m(e,t,n,r,i,a,o,s=8){let c=new K(new sc(t,t,n,s),Op(o));return c.position.set(r,i,a),c.castShadow=!0,e.add(c),c}function eh(e,t=`#f2eee4`,n=`#304c46`,r=128,i=64){let a=document.createElement(`canvas`);a.width=r,a.height=i;let o=a.getContext(`2d`);return o.fillStyle=t,o.fillRect(0,0,r,i),o.fillStyle=n,o.font=`bold ${i*.49}px sans-serif`,o.textAlign=`center`,o.textBaseline=`middle`,o.fillText(e,r/2,i/2),new ec(a)}function th({text:e,detail:t,direction:n=`straight`}){let r=document.createElement(`canvas`);r.width=768,r.height=384;let i=r.getContext(`2d`);i.fillStyle=`#126b48`,i.fillRect(0,0,768,384),i.strokeStyle=`#fffef3`,i.lineWidth=7,i.beginPath(),i.roundRect(13,13,742,358,14),i.stroke();let a=new Path2D;a.moveTo(52,78),a.quadraticCurveTo(133,53,214,78),a.lineTo(209,184),a.bezierCurveTo(203,218,159,247,133,257),a.bezierCurveTo(107,247,63,218,57,184),a.closePath(),i.fillStyle=`#17468c`,i.fill(a),i.save(),i.clip(a),i.fillStyle=`#bd2637`,i.fillRect(40,50,190,68),i.restore(),i.stroke(a),i.beginPath(),i.moveTo(54,118),i.lineTo(212,118),i.lineWidth=4,i.stroke(),i.fillStyle=`#fffef3`,i.textAlign=`center`,i.textBaseline=`middle`,i.font=`bold 20px sans-serif`,i.fillText(`INTERSTATE`,133,96),i.font=`bold 86px sans-serif`,i.fillText(`08`,133,179),i.textAlign=`left`,i.font=`bold 37px sans-serif`,i.fillText(`NORTH`,263,88),i.font=`bold 39px sans-serif`,i.fillText(e||`Cedar Town`,263,151,348),i.font=`bold 22px sans-serif`,i.fillText(t||`INTERSTATE 08`,52,319,660),i.save(),i.translate(668,168),i.rotate(n===`left`?-Math.PI/2:n===`right`?Math.PI/2:0),i.beginPath(),i.moveTo(0,-52),i.lineTo(-34,-12),i.lineTo(-13,-12),i.lineTo(-13,44),i.lineTo(13,44),i.lineTo(13,-12),i.lineTo(34,-12),i.closePath(),i.fill(),i.restore();let o=new ec(r);return o.colorSpace=jr,o}function nh(e){e.updateMatrixWorld(!0);let t=new Map;e.traverse(e=>{if(!e.isMesh)return;let n=t.get(e.material)||[];n.push(e.geometry.clone().applyMatrix4(e.matrixWorld)),t.set(e.material,n),e.geometry.dispose()}),e.clear();for(let[n,r]of t){let t=new K(lp(r),n);t.castShadow=!0,t.receiveShadow=!0,e.add(t),r.forEach(e=>e.dispose())}return e}function rh(e,t,n){let r=e.clone().sub(t),i=r.length();if(i<.01)return;r.divideScalar(i);let a=i,o=new zo,s=new Va,c=new V;for(let e of n){if(e.type!==`building`||Math.hypot(e.x-t.x,e.z-t.z)>i+Math.hypot(e.width,e.depth))continue;let n=-(e.rotation||0);o.origin.set(t.x-e.x,t.y,t.z-e.z).applyAxisAngle(ga.DEFAULT_UP,n),o.direction.copy(r).applyAxisAngle(ga.DEFAULT_UP,n),s.min.set(-e.width/2-.25,0,-e.depth/2-.25),s.max.set(e.width/2+.25,e.height+2,e.depth/2+.25),!s.containsPoint(o.origin)&&o.intersectBox(s,c)&&(a=Math.min(a,Math.max(.5,c.distanceTo(o.origin)-.45)))}e.copy(t).addScaledVector(r,a)}var ih=Jm;function ah(e){let t=new _a,n=new _a,r=[`#c27d55`,`#8d9cab`,`#dec060`,`#548975`][Number(e.id.split(`-`).at(-1))%4],i=(e,t,n,r,i,a,o)=>{let s=new K(new ac(t,n,4,8),Op(o));return s.position.set(r,i,a),s.castShadow=!0,e.add(s),s},a=i(n,.21,.28,0,1.09,0,r);a.scale.z=.62;let o=new K(new fc(.18,12,10),Op(`#be9578`));o.position.set(0,1.57,-.015),o.scale.set(.9,1.1,.95),o.castShadow=!0,n.add(o);let s=new K(new fc(.181,12,8,0,Math.PI*2,0,Math.PI*.58),Op(`#3b2c23`));s.position.set(0,1.61,0),n.add(s),i(n,.065,.08,0,1.38,0,`#be9578`);for(let e of[-.058,.058])X(n,.025,.019,.018,e,1.6,-.17,`#28201e`);let c=new K(new fc(.032,6,6),Op(`#b8886d`));c.position.set(0,1.55,-.182),n.add(c),t.add(nh(n));let l=[],u=[];for(let e of[-1,1]){let n=new _a;n.position.set(e*.12,.77,0),i(n,.08,.48,0,-.3,0,`#323c4c`),X(n,.17,.12,.28,0,-.61,-.055,`#293936`),t.add(n),l.push(n);let a=new _a;a.position.set(e*.3,1.31,0),i(a,.071,.37,0,-.24,0,r),i(a,.055,.07,0,-.51,0,`#be9578`),t.add(a),u.push(a)}return t.userData.limbs={legs:l,arms:u},t}var oh=class{constructor(e,t,n){this.vectorLayer=n,this.canvas=e,this.sim=t,this.mode=`chase`,this.cameraInput=new jp(e,()=>this.mode),this.showSensors=!1,this.renderer=new cp({canvas:e,antialias:Sp.antialias,alpha:!1,powerPreference:`high-performance`}),this.renderer.setPixelRatio(Math.min(devicePixelRatio,Sp.pixelRatio)),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.autoUpdate=!0,this.renderer.shadowMap.type=1,this.renderer.outputColorSpace=jr,this.renderer.toneMapping=4,this.renderer.toneMappingExposure=.95,this.camera=new vl(52,1,.1,1200),this.viewport={width:e.clientWidth,height:e.clientHeight},this.resizeObserver=new ResizeObserver(([e])=>{this.viewport=e.contentRect}),this.resizeObserver.observe(e),this.build()}build(){this.scenery&&(this.scenery.active=!1),this.scene&&this.scene.traverse(e=>{e.geometry&&e.geometry.dispose(),e.isInstancedMesh&&e.dispose(),e.customDepthMaterial?.dispose(),e.material&&![...Cp.values()].includes(e.material)&&(e.material.map?.dispose(),e.material.dispose()),e.shadow?.dispose()}),this.scene=new Ea;let e=this.scene,t=Zm().then(t=>{this.scene===e&&(e.environment=e.background=t,e.environmentIntensity=.6,e.backgroundIntensity=.8,e.backgroundBlurriness=.015)}).catch(e=>console.warn(`Daylight environment unavailable`,e));this.scene.background=new G(`#b7c9db`),this.scene.fog=new Ta(`#b7c6d0`,230,1050),this.scene.add(new ol(`#d5e4f8`,`#4e503a`,.4)),this.sun=new Tl(`#fff0d9`,3.4),this.sun.position.set(-60,110,40),this.sun.castShadow=!0,this.sun.shadow.mapSize.set(Sp.shadowSize,Sp.shadowSize),Object.assign(this.sun.shadow.camera,{left:-65,right:65,top:65,bottom:-65,near:1,far:240}),this.sun.shadow.bias=-5e-4,this.sun.shadow.normalBias=.025,this.sun.shadow.radius=2,this.scene.add(this.sun),this.scene.add(this.sun.target);let n=this.sim.world;this.vegetation=new Lm(this.scene,n),this.static=new _a;let r=this.static;X(r,3e3,.8,3e3,0,-.7,0,`#b2c5a0`),n.type===`highway`&&this.buildHighway(r,n);for(let e of n.type===`highway`?[]:n.edges){let t=n.byId[e.a],i=n.byId[e.b],a=t.x===i.x,o=s(t,i),c=(t.x+i.x)/2,l=(t.z+i.z)/2;X(r,a?16:o+.2,.26,a?o+.2:16,c,-.12,l,`#d8d6c9`),X(r,a?12:o+.3,.1,a?o+.3:12,c,.015,l,`#73817e`);for(let e=12;e<o-10;e+=8)X(r,a?.13:3.2,.02,a?3.2:.13,a?c:t.x+e,.081,a?t.z+e:l,`#d5d7b4`);for(let e of[-1,1])X(r,a?.1:o-18,.015,a?o-18:.1,a?c+e*5.5:c,.077,a?l:l+e*5.5,`#b6c0b0`)}for(let e of n.nodes.filter(e=>n.type!==`highway`||e.townJunction)){X(r,12.1,.1,12.1,e.x,.018,e.z,`#73817e`);for(let t of e.neighbors){let i=n.byId[t],a=Math.sign(i.x-e.x),o=Math.sign(i.z-e.z);for(let t=-4.5;t<=4.5;t+=1.5)X(r,a?1.8:.7,.021,a?.7:1.8,e.x+a*7+(o?t:0),.081,e.z+o*7+(a?t:0),`#ecebd9`);X(r,a?.22:5,.025,a?5:.22,e.x+a*10+(o?o*3:0),.083,e.z+o*10+(a?-a*3:0),`#ecebd9`)}}for(let e of n.objects){if(e.type===`hill`){let t=Qm(r,e.width/2,e.height,e.x,e.height/2-5,e.z,`#94ad85`,7);t.scale.z=1.3;continue}if(e.type===`overpass`){X(r,e.width,.8,e.depth,e.x,e.height,e.z,`#a9b8aa`),X(r,e.width,.12,e.depth-2,e.x,e.height+.5,e.z,`#6d7e79`);for(let t of[-1,1]){X(r,e.width,.8,.3,e.x,e.height+.75,e.z+t*(e.depth/2),`#c6cec0`);for(let n of[-20,20])X(r,1.6,e.height,2.5,e.x+n,e.height/2,e.z+t*4,`#bac5b5`)}continue}if(e.type===`highway_sign`){for(let t of[-14,14])$m(r,.14,8,e.x+t,4,e.z,`#8e9f95`);X(r,28,.25,.25,e.x,8,e.z,`#8e9f95`);let t=new K(new dc(9,4.5),new Bo({map:th(e),side:0}));t.position.set(e.x+6,7.2,e.z),r.add(t);continue}if(e.type===`interstate_guide`){let t=new _a;t.position.set(e.x,0,e.z),t.rotation.y=-e.approach;for(let e of[-2.1,2.1])$m(t,.09,4.5,e,2.25,0,`#8e9f95`);X(t,6.4,3.2,.13,0,4.3,0,`#8e9f95`);let n=new K(new dc(6.4,3.2),new Bo({map:th(e)}));n.position.set(0,4.3,.075),t.add(n),r.add(t);continue}if(e.type===`town_sign`){$m(r,.08,3,e.x,1.5,e.z,`#8e9f95`);let t=new K(new dc(5,1.4),new Bo({map:eh(e.text,`#3a755d`,`#eef7e3`,512,128)}));t.position.set(e.x,2.7,e.z),r.add(t);continue}if(e.type===`streetlight`){$m(r,.075,e.height,e.x,e.height/2,e.z,`#596b61`),X(r,1.3,.12,.6,e.x-.5,e.height,e.z,`#e4e5d7`);continue}if(e.type===`parcel`){X(r,e.width,.18,e.depth,e.x,-.035,e.z,e.park?`#9eb890`:`#adbf9d`),e.park&&(X(r,2,.03,e.depth,e.x,.1,e.z,`#d2c9a7`),X(r,e.width,.03,2,e.x,.11,e.z,`#d2c9a7`));continue}if(e.type===`tree`){this.vegetation.tree(r,e);continue}if(e.type===`bench`){X(r,3,.15,.8,e.x,.7,e.z,`#a78760`),X(r,3,.75,.12,e.x,1.1,e.z+.4,`#a78760`);for(let t of[-1,1])X(r,.15,.7,.8,e.x+t,.35,e.z,`#52645a`);continue}if(e.type===`building`){let t=new _a;t.position.set(e.x,0,e.z),t.rotation.y=e.rotation;let{width:n,depth:r,height:i}=e;X(t,n+.6,.35,r+.6,0,.16,0,`#e1ddca`);let a=e.style===`skyscraper`,o=a?kp(`facade:${e.color}`,{color:new G(e.color).lerp(new G(`#31465b`),.72),metalness:.48,roughness:.23,clearcoat:.55}):e.style===`cottage`||e.style===`townhouse`?Dp(`brick`,`#c5b5a5`,2.8):Dp(`pavement`,`#c9c7c2`,3.5);if(X(t,n,i,r,0,i/2+.3,0,o),a){for(let e=3.8;e<i;e+=3.8)X(t,n+.07,.08,r+.07,0,e,0,`#6b727b`);for(let e of[-1,1]){for(let a=-n/2+1.6;a<n/2;a+=1.6)X(t,.055,i,.07,a,i/2+.3,e*(r/2+.04),`#818a92`);for(let a=-r/2+1.6;a<r/2;a+=1.6)X(t,.07,i,.055,e*(n/2+.04),i/2+.3,a,`#818a92`)}X(t,n+.18,.75,r+.18,0,.6,0,Dp(`pavement`,`#898b88`,3))}if(e.style===`cottage`||e.style===`townhouse`){let a=Qm(t,n*.77,3,0,i+1.8,0,e.roof,4);a.rotation.y=Math.PI/4,a.scale.z=r/n,X(t,1.1,2.6,1.1,n*.25,i+1.5,.6,`#b78d72`)}else X(t,n+.5,.35,r+.5,0,i+.48,0,e.roof),X(t,2,.7,2,-n*.2,i+1,0,`#a9b2a3`);for(let o=0;!a&&o<Math.max(1,Math.floor(i/(e.style===`skyscraper`?4.5:3)));o++)for(let i=-1;i<=1;i++){for(let a of[-1,1])X(t,1.5,1.65,.1,i*n*.27,2.3+o*(e.style===`skyscraper`?4.5:3),a*(r/2+.04),`#f1ead8`),X(t,1.2,1.35,.12,i*n*.27,2.3+o*(e.style===`skyscraper`?4.5:3),a*(r/2+.09),kp(`architecture-glass`,{color:`#40566b`,metalness:.4,roughness:.14,clearcoat:.8})),X(t,.08,1.4,.14,i*n*.27,2.3+o*(e.style===`skyscraper`?4.5:3),a*(r/2+.12),`#d9dfca`);for(let a of[-1,1])X(t,.1,1.4,1.3,a*(n/2+.05),2.3+o*(e.style===`skyscraper`?4.5:3),i*r*.26,kp(`architecture-glass`,{color:`#40566b`,metalness:.4,roughness:.14,clearcoat:.8}))}if(X(t,1.3,2.2,.2,0,1.4,r/2+.15,`#776d57`),X(t,3,.12,2,0,.35,r/2+1,`#d7d1b8`),e.style===`skyscraper`){X(t,n*.7,3,r*.7,0,i+1.9,0,`#607d87`),$m(t,.09,9,0,i+6,0,`#bdd0cd`);for(let e of[-n*.39,0,n*.39])for(let n of[-r/2-.08,r/2+.08])X(t,.13,i,.12,e,i/2+.3,n,`#b5d0d1`)}if(e.style===`shop`){X(t,n*.9,.14,1.9,0,3,r/2+.75,`#648c80`);let e=new K(new dc(n*.7,1.2),new Bo({map:eh(`MARKET`)}));e.position.set(0,i-.6,r/2+.12),t.add(e)}this.static.add(t);continue}}r.updateMatrixWorld(!0);let i=new Map,a=[];r.traverse(e=>{if(!e.isMesh)return;if(e.material.map&&!e.material.userData.metersPerTile){let t=e.clone();e.matrixWorld.decompose(t.position,t.quaternion,t.scale),a.push(t);return}let t=new V().setFromMatrixPosition(e.matrixWorld),n=`${e.material.uuid}:${Math.floor(t.x/80)}:${Math.floor(t.z/80)}`,r=i.get(n)||{material:e.material,geoms:[]};r.geoms.push(e.geometry.clone().applyMatrix4(e.matrixWorld)),i.set(n,r)});for(let{material:e,geoms:t}of i.values()){let n=new K(lp(t),e);n.castShadow=!0,n.receiveShadow=!0,this.scene.add(n),t.forEach(e=>e.dispose())}a.forEach(e=>this.scene.add(e)),r.traverse(e=>e.geometry?.dispose()),r.clear(),this.vegetation.finish(),this.scenery=new Fm(this.scene,n,this.vegetation),this.lights=[];for(let e of n.objects.filter(e=>e.type===`traffic_light`||e.type===`stop_sign`)){let t=new _a;if(t.position.set(e.x,0,e.z),t.rotation.y=-e.approach,$m(t,.08,e.height,0,e.height/2,0,`#566861`,8),e.type===`stop_sign`){let e=new K(new sc(.65,.65,.1,8),Op(`#c4715b`));e.rotation.x=Math.PI/2,e.position.set(0,2.45,0),t.add(e);let n=new K(new dc(.95,.43),new Bo({map:eh(`STOP`,`#c4715b`,`#fff4df`),side:2}));n.position.set(0,2.45,.065),t.add(n)}else{X(t,.65,1.65,.38,0,4.2,0,`#344e47`);for(let n=0;n<3;n++){let r=new K(new fc(.17,10,8),new Cc({color:`#394d43`,emissive:`#000000`}));r.position.set(0,4.73-n*.5,.22),t.add(r),this.lights.push({mesh:r,obj:e,index:n})}}t.userData.control=!0,this.scene.add(t)}let o=this.sim.world.route.points;this.destination=new _a;let c=o.at(-1);this.destination.position.set(c.x,.2,c.z);let l=new K(new pc(2,.13,8,48),Op(`#edfda2`));l.rotation.x=Math.PI/2,this.destination.add(l),$m(this.destination,.055,5,0,2.5,0,`#e4f6b3`),X(this.destination,1.8,1.1,.06,.85,4.5,0,`#dff293`),this.scene.add(this.destination),this.player=ih(`#e2e5e9`),this.heroCar=null,this.wheelDistance=this.sim.distance,this.wheelDirection=Math.sign(this.sim.player.speed)||1,this.scene.add(this.player);let u=this.player,d=Wm().then(e=>{if(this.player!==u||this.sim.crash){e.traverse(e=>e.geometry?.dispose());return}u.traverse(e=>e.geometry?.dispose()),u.clear(),u.add(e),this.heroCar=e,u.userData.sourcedModel=!0,u.userData.eyeHeight=e.userData.eyeHeight,u.userData.eyeForward=e.userData.eyeForward}).catch(e=>console.warn(`Detailed vehicle unavailable`,e));this.vehicles=new Map,this.people=new Map;for(let e of this.sim.traffic){let t=ih(e.color,e.type===`motorcycle`);this.vehicles.set(e.id,t),this.scene.add(t)}for(let e of this.sim.pedestrians){let t=ah(e);this.people.set(e.id,t),this.scene.add(t)}let f=[0,.18,0];for(let e=0;e<=40;e++){let t=(-65+e*130/40)*Math.PI/180;f.push(Math.sin(t)*65,.18,-Math.cos(t)*65)}let p=new Eo;p.setAttribute(`position`,new mo(f,3));let m=[];for(let e=1;e<=40;e++)m.push(0,e,e+1);p.setIndex(m),this.sensorCone=new K(p,new Bo({color:`#dbfba0`,transparent:!0,opacity:.12,side:2,depthWrite:!1})),this.scene.add(this.sensorCone),this.impacts=new _p(this.scene),this.vectors=new gp(this.scene,this.vectorLayer),this.renderer.shadowMap.needsUpdate=!0,this.snap=!0,this.ready=Promise.all([t,d,this.scenery.ready])}async prepare(){await this.ready,await xp(),this.render(0,!1),await this.renderer.compileAsync(this.scene,this.camera),this.render(0)}dispose(){this.resizeObserver.disconnect(),this.scenery.active=!1,this.renderer.dispose()}buildHighway(e,t){let n=t.roadSamples,r=(e,t,r,i,a=n,o=null)=>{let s=[],c=[];for(let n=0;n<a.length;n++){let r=a[Math.max(0,n-1)],l=a[Math.min(a.length-1,n+1)],u=l.x-r.x,d=l.z-r.z,f=Math.hypot(u,d)||1;for(let r of[-1,1])s.push(a[n].x-d/f*(e+r*t/2),i,a[n].z+u/f*(e+r*t/2));if(n<a.length-1&&!o?.(a[n])){let e=n*2;c.push(e,e+1,e+2,e+1,e+3,e+2)}}let l=new Eo;l.setAttribute(`position`,new mo(s,3)),l.setIndex(c),l.computeVertexNormals();let u=new K(Ap(l,Op(r)),Op(r));u.receiveShadow=!0,this.scene.add(u)};r(0,30,`#bbc5b4`,.01),r(0,25,`#70817c`,.045),r(0,2.1,`#a8b89c`,.09);for(let e of[-11.7,11.7])r(e,.14,`#e5e9d8`,.08,n,e>0?e=>t.shoulderOpenings?.some(([t,n])=>e.s>=t&&e.s<=n):null);for(let t=0;t<n.length-1;t+=4){let r=n[t],i=n[t+1],a=Math.atan2(i.x-r.x,r.z-i.z);for(let t of[-1,1]){let n=t*7;X(e,.13,.018,3.2,r.x+Math.cos(a)*n,.085,r.z+Math.sin(a)*n,`#dce2d0`,-a)}t%12==0&&X(e,.18,.75,1,r.x,.45,r.z,`#bac5b7`,-a)}r(0,.25,`#bac5b7`,.8);for(let e of t.connectorRoads||[]){let n=e.points,i=e=>t.nodes.some(t=>t.townJunction&&s(t,e)<11);e.twoWay&&r(0,e.width+3.6,`#d8d6c9`,.012,n),r(0,e.width,`#70817c`,.05,n);for(let t of[-1,1])r(t*(e.width/2-.3),.12,`#e5e9d8`,.085,n,t=>i(t)||[`merge`,`exit`].includes(e.kind)&&Math.floor(t.s/4)%2==1);e.twoWay&&r(0,.13,`#d5d7b4`,.087,n,e=>i(e)||Math.floor(e.s/4)%2==1)}if(t.destinationStopLine){let n=t.destinationStopLine;X(e,4.8,.025,.25,n.x,.088,n.z,`#ecebd9`,-n.heading)}}render(e,t=!0){let{width:n,height:r}=this.viewport;if(!n||!r)return;(this.canvas.width!==Math.floor(n*this.renderer.getPixelRatio())||this.canvas.height!==Math.floor(r*this.renderer.getPixelRatio()))&&(this.renderer.setSize(n,r,!1),this.camera.aspect=n/r,this.camera.updateProjectionMatrix());let i=this.sim.player;this.vegetation.update(this.sim.time),this.scenery.update(i,this.sim.time);for(let e of this.scene.children)e.userData.control&&(e.visible=Math.hypot(e.position.x-i.x,e.position.z-i.z)<170);this.player.position.set(i.x,0,i.z),this.player.rotation.y=-i.heading,this.wheelDirection=Math.sign(i.speed)||this.wheelDirection,this.heroCar&&!this.sim.paused&&!this.sim.crash&&Um(this.heroCar,Math.max(0,this.sim.distance-this.wheelDistance)*this.wheelDirection,i.wheelSteering??i.steering,i.speed),this.wheelDistance=this.sim.distance;let a=this.mode===`hood`&&!this.sim.crash;this.player.traverse(e=>{e.isMesh&&e.material.name===`Glass`&&(e.visible=!a)});for(let e of this.sim.traffic){let t=this.vehicles.get(e.id);t&&(t.position.set(e.x,0,e.z),t.rotation.y=-e.heading)}for(let e of this.sim.pedestrians){let t=this.people.get(e.id);if(t){t.position.set(e.x,e.walking?Math.sin(this.sim.time*8)*.035:0,e.z),t.rotation.y=-(e.heading||0);let n=e.walking?Math.sin(this.sim.time*(e.crossing?10:5)+Number(e.id.split(`-`).at(-1)))*.42:0;t.userData.limbs.legs.forEach((e,t)=>e.rotation.x=n*(t?-1:1)),t.userData.limbs.arms.forEach((e,t)=>e.rotation.x=n*(t?1:-1))}}if(this.sim.crash&&!this.impacts.crash){let e=this.sim.crash,t=this.vehicles.get(e.object_id)||this.people.get(e.object_id);this.impacts.start(e,this.player,t,this.sim.world.objects.find(t=>t.id===e.object_id))}this.impacts.update(Math.min(e,.05));for(let e of this.lights){let t=ft(this.sim.world.byId[e.obj.nodeId],this.sim.time,e.obj.approach).color,n=[`red`,`amber`,`green`][e.index]===t;e.mesh.material.color.set(n?[`#f0836b`,`#f4cb69`,`#afdf92`][e.index]:`#34483e`),e.mesh.material.emissive.set(n?[`#98301d`,`#ad770e`,`#508e38`][e.index]:`#000000`),e.mesh.material.emissiveIntensity=n?.9:0}this.sensorCone.visible=this.showSensors,this.sensorCone.position.set(i.x,0,i.z),this.sensorCone.rotation.y=-i.heading,this.destination.children[2].position.y=4.5+Math.sin(this.sim.time*2)*.18;let o,s;if(this.sim.crash){let e=this.sim.crash.type===`building`?-1:1;o=new V(i.x-Math.sin(i.heading)*12+Math.cos(i.heading)*8*e,8,i.z+Math.cos(i.heading)*12+Math.sin(i.heading)*8*e),s=new V(i.x,.7,i.z)}else if(this.mode===`hood`){let e=this.cameraInput.current(),t=this.player.userData.eyeForward??.15;o=new V(i.x+Math.sin(i.heading)*t-Math.cos(i.heading)*.3,this.player.userData.eyeHeight||1.27,i.z-Math.cos(i.heading)*t-Math.sin(i.heading)*.3);let n=i.heading+e.yaw;s=o.clone().add(new V(Math.sin(n)*Math.cos(e.pitch),Math.sin(e.pitch),-Math.cos(n)*Math.cos(e.pitch)).multiplyScalar(25))}else{let e=this.cameraInput.current(),t=i.heading+e.yaw,n=Math.cos(e.pitch)*e.distance;o=new V(i.x-Math.sin(t)*n,Math.sin(e.pitch)*e.distance+.7,i.z+Math.cos(t)*n);let r=this.mode===`map`?0:5;s=new V(i.x+Math.sin(i.heading)*r,.7,i.z-Math.cos(i.heading)*r)}this.camera.position.lerp(o,this.snap||a?1:1-Math.exp(-e*4)),a||rh(this.camera.position,new V(i.x,1,i.z),this.sim.world.objects),this.look=this.look||s.clone(),this.look.lerp(s,this.snap||a?1:1-Math.exp(-e*6)),this.camera.lookAt(this.look),this.snap=!1,this.sun.position.set(i.x-55,85,i.z+50),this.sun.target.position.set(i.x,0,i.z),this.vectors.render(i,this.camera,n,r,e,this.sim.autopilot,this.sim.paused),t&&this.renderer.render(this.scene,this.camera)}},sh=class{constructor(e,t,n){this.panel=e,this.simulation=t,this.redraw=n,this.zoom=1,this.center=null,this.heading=null,this.position=null,this.events=new AbortController;let r=(e,t,n,r={})=>e.addEventListener(t,n,{...r,signal:this.events.signal}),a=e.querySelector(`canvas`),o=e.querySelector(`#map-drag`);this.zoomIn=e.querySelector(`#map-zoom-in`),this.zoomOut=e.querySelector(`#map-zoom-out`),r(this.zoomIn,`click`,()=>this.setZoom(this.zoom*1.25)),r(this.zoomOut,`click`,()=>this.setZoom(this.zoom/1.25)),r(e.querySelector(`#map-reset`),`click`,()=>{this.position=null;for(let t of[`position`,`left`,`top`,`bottom`])e.style.removeProperty(t);this.resetView()}),r(a,`wheel`,e=>{e.preventDefault(),this.setZoom(this.zoom*Math.exp(-i(e.deltaY,-100,100)*.005))},{passive:!1}),r(a,`dblclick`,()=>this.resetView());let s=(t,n,i,a)=>{let o=null;r(t,`pointerdown`,r=>{r.isPrimary&&r.button===0&&(r.preventDefault(),o={id:r.pointerId,x:r.clientX,y:r.clientY,...n()},t.setPointerCapture(r.pointerId),e.classList.add(a))}),r(t,`pointermove`,e=>{if(!o||o.id!==e.pointerId)return;let t=e.clientX-o.x,n=e.clientY-o.y;Math.hypot(t,n)<3&&!o.moved||(o.moved=!0,i(o,t,n))});let s=n=>{o?.id===n.pointerId&&(o=null,e.classList.remove(a),t.hasPointerCapture(n.pointerId)&&t.releasePointerCapture(n.pointerId))};for(let e of[`pointerup`,`pointercancel`,`lostpointercapture`])r(t,e,s)};s(o,()=>{let{left:t,top:n}=e.getBoundingClientRect();return{left:t,top:n}},(e,t,n)=>{this.movePanel(e.left+t,e.top+n)},`is-moving`),s(a,()=>({view:this.view(),rect:a.getBoundingClientRect()}),(e,t,n)=>{let r=t*a.width/e.rect.width/e.view.scale,i=n*a.height/e.rect.height/e.view.scale,o=Math.cos(e.view.heading),s=Math.sin(e.view.heading);this.center={x:e.view.center.x-(r*o-i*s),z:e.view.center.z-(r*s+i*o)},this.heading=e.view.heading,this.redraw()},`is-panning`),r(o,`keydown`,t=>{let n={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[t.key];if(!n)return;t.preventDefault(),t.stopPropagation();let r=e.getBoundingClientRect(),i=t.shiftKey?1:10;this.movePanel(r.left+n[0]*i,r.top+n[1]*i)}),r(window,`resize`,()=>this.constrainPosition())}view(){let e=this.simulation.player;return{center:this.center?{...this.center}:{x:e.x,z:e.z},heading:this.heading??e.heading,scale:(this.simulation.world.type===`highway`?.85:1.35)*this.zoom}}setZoom(e){this.zoom=i(e,.35,4),this.zoomIn.disabled=this.zoom>=4,this.zoomOut.disabled=this.zoom<=.35,this.redraw()}resetView(){this.center=this.heading=null,this.setZoom(1)}movePanel(e,t){let n=this.panel.getBoundingClientRect();this.position={left:i(e,8,Math.max(8,innerWidth-n.width-8)),top:i(t,8,Math.max(8,innerHeight-n.height-8))},this.panel.style.position=`fixed`,this.panel.style.left=`${this.position.left}px`,this.panel.style.top=`${this.position.top}px`,this.panel.style.bottom=`auto`}constrainPosition(){this.position&&!this.panel.hidden&&this.movePanel(this.position.left,this.position.top)}dispose(){this.events.abort()}},ch=class{constructor(){this.element=document.createElement(`div`),this.element.id=`control-tooltip`,this.element.role=`tooltip`,this.element.hidden=!0,document.body.append(this.element),this.events=new AbortController;let e=(e,t,n)=>e.addEventListener(t,n,{signal:this.events.signal});e(document,`pointerover`,e=>{if(e.pointerType===`touch`)return;let t=e.target.closest(`[data-tooltip]`);t&&!t.contains(e.relatedTarget)&&this.show(t)}),e(document,`pointerout`,e=>{this.target?.contains(e.target)&&!this.target.contains(e.relatedTarget)&&this.hide()}),e(document,`focusin`,e=>{let t=e.target.closest(`[data-tooltip]`);t&&this.show(t)}),e(document,`focusout`,()=>this.hide()),e(document,`pointerdown`,()=>this.hide()),e(document,`keydown`,e=>{e.key===`Escape`&&this.hide()}),e(window,`resize`,()=>this.hide())}set(e,t){e.dataset.tooltip=t,e.removeAttribute(`title`),this.target===e&&!this.element.hidden&&this.place()}show(e){this.hide(),this.target=e,this.timer=setTimeout(()=>{e.setAttribute(`aria-describedby`,this.element.id),this.element.hidden=!1,this.place()},180)}place(){this.element.textContent=this.target.dataset.tooltip;let e=this.target.getBoundingClientRect(),t=this.element.getBoundingClientRect(),n=Math.max(8,Math.min(innerWidth-t.width-8,e.left+(e.width-t.width)/2)),r=e.top>=t.height+16?e.top-t.height-8:e.bottom+8;this.element.style.left=`${n}px`,this.element.style.top=`${Math.max(8,Math.min(innerHeight-t.height-8,r))}px`}hide(){clearTimeout(this.timer),this.target?.removeAttribute(`aria-describedby`),this.target=null,this.element.hidden=!0}dispose(){this.hide(),this.events.abort(),this.element.remove()}},lh=class{constructor(e,t){this.root=e,this.stick=e.querySelector(`.touch-stick`),this.brakeButton=e.querySelector(`.touch-brake`),this.canDrive=t,this.media=matchMedia(`(pointer: coarse)`),this.controller=new AbortController,this.steering=this.throttle=this.brake=0,this.pointers=new Map;let n=(e,t,n)=>e.addEventListener(t,n,{signal:this.controller.signal});for(let e of[this.stick,this.brakeButton]){n(e,`pointerdown`,t=>{if(t.button===0&&this.canDrive()&&!this.pointers.has(e)){if(t.preventDefault(),this.pointers.set(e,t.pointerId),e.setPointerCapture(t.pointerId),e.classList.add(`held`),e===this.stick){let n=e.getBoundingClientRect();this.origin={x:n.left+n.width/2,y:n.top+n.height/2},this.radius=n.width*.32,this.move(t)}else this.brake=1}}),n(e,`pointermove`,t=>{e===this.stick&&this.pointers.get(e)===t.pointerId&&this.move(t)});for(let t of[`pointerup`,`pointercancel`,`lostpointercapture`])n(e,t,t=>{this.pointers.get(e)===t.pointerId&&this.release(e)});n(e,`contextmenu`,e=>e.preventDefault())}n(window,`blur`,()=>this.reset()),n(window,`resize`,()=>this.reset()),n(document,`visibilitychange`,()=>this.reset()),n(this.media,`change`,()=>this.reset())}get available(){return this.media.matches}move(e){if(!this.canDrive()){this.reset();return}let t=(e.clientX-this.origin.x)/this.radius,n=(e.clientY-this.origin.y)/this.radius,r=Math.max(1,Math.hypot(t,n));t/=r,n/=r;let a=e=>Math.sign(e)*i((Math.abs(e)-.1)/.65,0,1);this.steering=a(t),this.throttle=a(-n),this.stick.style.setProperty(`--stick-x`,`${t*this.radius}px`),this.stick.style.setProperty(`--stick-y`,`${n*this.radius}px`)}release(e){let t=this.pointers.get(e);this.pointers.delete(e),t!==void 0&&e.hasPointerCapture(t)&&e.releasePointerCapture(t),e.classList.remove(`held`),e===this.stick?(this.steering=this.throttle=0,e.style.setProperty(`--stick-x`,`0px`),e.style.setProperty(`--stick-y`,`0px`)):this.brake=0}reset(){this.release(this.stick),this.release(this.brakeButton)}sync(){let e=!this.available||!this.canDrive();e&&this.pointers.size&&this.reset(),this.root.hidden!==e&&(this.root.hidden=e)}dispose(){this.reset(),this.controller.abort()}},uh={Braces:Pe,RotateCw:Qe,Video:et,Pause:Je,Play:Ye,Map:We,Maximize:Ge,Minimize:Ke,Sparkles:$e,ArrowUp:Ne,CornerUpLeft:Le,CornerUpRight:Re,Flag:Be,ArrowUpRight:Me,X:tt,Copy:Ie,Download:ze,RotateCcw:Ze,CircleHelp:Fe,Plus:Xe,Minus:qe,Grip:He,Github:Ve,LogOut:Ue},dh=e=>`<i data-lucide="${e}"></i>`,Z=e=>document.getElementById(e),fh=new URLSearchParams(location.search),ph={suburb:`town`,country:`highway`},mh=fh.get(`world`)||`city`,hh=ph[mh]||mh,Q=new rn(Number(fh.get(`seed`))||Math.floor(Math.random()*999999),ct[hh]?hh:`city`),gh=null,_h=!0,vh=0;e(`Loading car and scenery…`);var yh=!1,bh=!0,xh=!1,Sh=0,Ch=null,wh=null,Th=null,Eh=0,Dh=0,Oh=0,kh=0,Ah=`request`,jh=!1,Mh=0,Nh=performance.now(),Ph,Fh=!1,Ih=new Set,Lh={cost:0,calls:0,constrained_steps:0,request_bytes:0,input:0,output:0,latencies:[],intervals:[]};Z(`app`).innerHTML=`
<main class="drive-area" aria-label="3D driving simulator"><canvas id="world-canvas" aria-label="Interactive three-dimensional driving world"></canvas><div id="vector-labels" aria-label="Jev motion vector probabilities"></div></main>
<header class="topbar glass">
<div class="drive-header-row"><span class="drive-title">Driving simulator</span></div>
<div class="world-picker"><label for="world-select">Change map</label><select id="world-select" aria-label="Change map"><option value="city">Skyline City</option><option value="town">Small town</option><option value="highway">Interstate 08</option></select><button id="new-world" title="Generate a new layout of this map" aria-label="New map layout">${dh(`rotate-cw`)}<span>New layout</span></button><a id="github-link" href="https://github.com/standardagents/jevpilot" target="_blank" rel="noopener noreferrer" aria-label="View original JevPilot source" title="View on GitHub">${dh(`github`)}</a></div><div class="model-picker"><label for="model-select">AI model</label><select id="model-select">${_e.map(e=>`<option value="${e.id}">${e.label}</option>`).join(``)}</select></div></header>
<div class="simple-jev-api-badge">PUBLIC DEMO · No key · 2k context / 4 RPS<br><small>Live driving · WASD to drive · J for autopilot.</small></div><div class="navigation-hud"><div class="navigation-card glass"><span id="turn-icon">${dh(`arrow-up`)}</span><div><strong id="next-maneuver">Continue straight</strong><span id="turn-distance"></span></div><span class="nav-divider"></span><span id="remaining"></span><button id="map-toggle" aria-label="Toggle route map" aria-pressed="true" title="Hide route map">${dh(`map`)}</button></div>
<div id="minimap" class="minimap glass"><div class="minimap-toolbar" role="toolbar" aria-label="Minimap controls"><button id="map-drag" aria-label="Move minimap" title="Move minimap · drag or use arrow keys">${dh(`grip`)}</button><div><button id="map-zoom-out" aria-label="Zoom out" title="Zoom out">${dh(`minus`)}</button><button id="map-zoom-in" aria-label="Zoom in" title="Zoom in">${dh(`plus`)}</button><button id="map-reset" aria-label="Reset minimap" title="Reset map position, zoom and following">${dh(`rotate-ccw`)}</button></div></div><canvas id="map-canvas" width="380" height="310" aria-label="Route map. Drag to pan, scroll to zoom, double-click to follow the car."></canvas></div></div>
<div id="paused-overlay" hidden><div class="glass"><span>${dh(`pause`)} Paused</span><button id="resume" class="primary">Resume driving</button></div></div>
<div id="arrival" class="arrival glass" hidden><span class="arrival-mark">${dh(`flag`)}</span><span class="eyebrow">DESTINATION REACHED</span><h1>You made it.</h1><p id="arrival-summary"></p><button id="next-trip" class="primary">Next drive ${dh(`arrow-up-right`)}</button><button id="keep-driving" class="subtle">Keep exploring</button></div>
<div class="bottom-hud"><div class="driver-dock glass"><div class="speed-cluster"><div title="Current speed"><strong id="speed">0</strong><span>km/h</span></div><span class="speed-limit" title="Speed limit"><small>LIMIT</small><b id="speed-limit">50</b></span></div><span class="dock-divider"></span><div class="pilot-actions"><button id="autopilot" class="pilot-button" role="switch" aria-checked="false" aria-label="Jev autopilot" title="Engage Jev · J">${dh(`sparkles`)}<span id="pilot-label">Engage Jev</span><kbd>J</kbd></button><button id="candidates-toggle" class="candidate-button" aria-label="Show steering candidates" aria-pressed="false" title="Show steering candidates"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 20V3m-3 3 3-3 3 3M12 20C12 14 7 12 3 8m0 3V8h3M12 20c0-6 5-8 9-12m-3 0h3v3"/><circle cx="12" cy="21" r="1" fill="currentColor" stroke="none"/></svg></button></div><div id="decision-status"><span id="pilot-state">Free play</span><span id="context-message">WASD to drive · Space to brake</span><span class="cost-total" title="Estimated production cost from reported input tokens. This public demo is free."><span id="cost-label">Est. production</span> <strong id="cost">$0.000000</strong></span></div><span class="dock-divider"></span><div class="dock-tools" role="group" aria-label="View and driving controls"><button id="camera" title="Change camera · C" aria-label="Change camera">${dh(`video`)}<span id="camera-name">Chase</span></button><button id="scene-json" aria-label="Inspect live JSON" title="Inspect live JSON">${dh(`braces`)}</button><button id="fullscreen" aria-label="Enter fullscreen" title="Fullscreen">${dh(`maximize`)}</button><span class="divider"></span><button id="pause" aria-label="Pause simulation" title="Pause · P">${dh(`pause`)}</button><button id="sign-out" hidden aria-label="Sign out" title="Sign out">${dh(`log-out`)}</button></div></div></div>
<dialog id="crash-dialog" aria-labelledby="crash-title" aria-describedby="crash-description"><span class="crash-symbol">${dh(`x`)}</span><span class="eyebrow">DRIVE ENDED</span><h1 id="crash-title">Game over.</h1><p id="crash-description"></p><div class="crash-stats"><div><strong id="crash-speed"></strong><span>km/h at impact</span></div><div><strong id="crash-distance"></strong><span>meters driven</span></div></div><button id="retry-drive" class="primary">${dh(`rotate-ccw`)} Restart drive</button><button id="crash-new-world" class="secondary">Try a new world ${dh(`arrow-up-right`)}</button></dialog>
<dialog id="credit-dialog" aria-labelledby="credit-title"><span class="eyebrow">THANKS FOR TAKING A DRIVE</span><h2 id="credit-title">That's your free lap.</h2><p>Your $0.25 of Jev play credit has been used. You can keep exploring with manual controls.</p><button id="credit-close" class="primary">Keep driving manually</button><a href="https://standardagents.ai/" target="_blank" rel="noopener noreferrer">Explore Standard Agents ↗</a></dialog>
<div id="toast" role="status" hidden></div>
<dialog id="json-dialog"><div class="json-header"><div>${dh(`braces`)}<strong>Under the hood</strong><span id="json-live">LIVE · 4 Hz</span></div><button id="close-json" aria-label="Close JSON inspector">${dh(`x`)}</button></div><div class="json-toolbar"><div class="json-tabs"><button data-tab="request" class="active">Jev input</button><button data-tab="sensor">Perception</button><button data-tab="world">Full world</button><button data-tab="decision">Response</button></div><div class="json-actions"><button id="freeze-json">Freeze</button><button id="copy-json" aria-label="Copy displayed JSON">${dh(`copy`)} <span id="copy-json-label" aria-live="polite">Copy</span></button><button id="download-json">${dh(`download`)} Download</button></div></div><p id="json-description">Exact Jev API payload, including instructions and offered choices. Full geometry and control details stay local.</p><pre id="json-content"></pre></dialog>
<dialog id="help-dialog"><button id="close-help" class="dialog-close" aria-label="Close help">${dh(`x`)}</button><span class="eyebrow">YOUR NEXT DRIVE</span><h2>Take the wheel.</h2><p class="touch-help">Use the thumbstick to steer. Push up to accelerate, pull down to brake and reverse. Release to coast; hold Brake to stop.</p><div class="help-keys"><span><kbd>W / ↑</kbd> Hold accelerator</span><span><kbd>S / ↓</kbd> Brake / reverse</span><span><kbd>A / D</kbd> Steer</span><span><kbd>SPACE</kbd> Brake</span><span><kbd>J</kbd> Jev autopilot</span><span><kbd>C</kbd> Camera</span><span><kbd>P</kbd> Pause</span><span><kbd>?</kbd> Keyboard help</span></div><p>Drag the scene to orbit in Chase or Bird’s eye; drag to look around in Driver view. Scroll to zoom outside; double-click to recenter. Tap A/D for small corrections; hold for a sharper turn and release to recenter. Hold W to accelerate; release to coast with drag. S brakes, then reverses once stopped. Space applies the brake. Autopilot sets target speed directly.</p><p>The bright blue line is Jev's selected three-second plan. Use Candidates to see the sampled paths: forward in blue/cyan, reverse in purple, lane departures in amber, and predicted collisions in orange. Choice probabilities are available in the JSON inspector. The safety brake can reduce speed for a missed hazard; interventions are shown beside the autopilot button.</p><p>Adapted from <a href="https://github.com/standardagents/jevpilot">JevPilot by Standard Agents</a>. Powered here by the Simple Jev classifier API. The compact observation adapter and inference pacing differ from the original.</p><p class="asset-credits">Vehicle: <a href="https://sketchfab.com/3d-models/tesla-model-y-2021-c0a86cac582d4b33aba0fb1b1912d970" target="_blank" rel="noreferrer">Tesla Model Y 2021</a> by 763468712, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Geometry adapted by Tina 3D Tesla; optimized, re-materialed, and wheel-rigged for JevPilot. Tree, shrub, streetlight, surface textures and sky: <a href="https://polyhaven.com" target="_blank" rel="noreferrer">Poly Haven</a>, CC0.</p><p>Driving keys take back control. Use the JSON button for live inputs, full world state, probabilities, and session telemetry.</p></dialog>`,Z(`app`).insertAdjacentHTML(`beforeend`,`
<div id="touch-controls" class="touch-controls" role="group" aria-label="Touch driving controls" hidden>
  <div class="touch-steering">
    <div class="touch-stick" role="group" aria-label="Driving joystick: drag up to accelerate, down to brake or reverse, left or right to steer">
      <span class="stick-up" aria-hidden="true">↑</span><span class="stick-down" aria-hidden="true">↓</span>
      <span class="stick-left" aria-hidden="true">‹</span><span class="stick-right" aria-hidden="true">›</span>
      <span class="touch-knob" aria-hidden="true"></span>
    </div>
    <span class="touch-hint">Drag to drive</span>
  </div>
  <button class="touch-brake" aria-label="Hold to brake"><span aria-hidden="true">Ⅱ</span>Brake</button>
</div>`),nt({icons:uh});var Rh=new oh(Z(`world-canvas`),Q,Z(`vector-labels`)),$=Z(`map-canvas`).getContext(`2d`),zh=new sh(Z(`minimap`),Q,fg),Bh=new ch,Vh=new lh(Z(`touch-controls`),()=>!_h&&!Q.autopilot&&!Q.paused&&!Q.crash&&!document.hidden&&!document.querySelector(`dialog[open]`)&&(Q.freeExplore||!Q.complete));new ResizeObserver(([e])=>{let t=e.borderBoxSize?.[0]?.blockSize??e.target.offsetHeight;document.documentElement.style.setProperty(`--dock-height`,`${t}px`)}).observe(document.querySelector(`.driver-dock`));for(let e of document.querySelectorAll(`.bottom-hud button, .bottom-hud [title], .minimap button, #map-toggle, #github-link`))Bh.set(e,e.title||e.getAttribute(`aria-label`));var Hh=new an;Q.backgroundPlanning=!0;var Uh=null,Wh=!1,Gh=!1;async function Kh(){if(Uh)return Uh;let e=Sh,t=Q.routeVersion,n=Hh.run(`plan`,Q).then(n=>e!==Sh||t!==Q.routeVersion||Q.crash?null:(Q.lastPlan=n.plan,Q.lastDecisionState=n.state,Q.routeChoices=n.routeChoices,Q.routeChoicesOrigin=n.routeChoicesOrigin,Q.nextRouteChoices=n.nextRouteChoices,n)).finally(()=>{Uh===n&&(Uh=null)});return Uh=n,n}function qh(){Q.autopilot||Q.crash||Kh().then(e=>{e&&!Q.autopilot&&Rh.vectors.setCandidates(e.plan)}).catch(e=>{Gh||(Gh=!0,Jh(e.message))})}Q.requestReroute=async()=>{if(Wh||!Q.routeChoiceNeeded())return;Wh=!0;let e=Sh,t=Q.routeVersion;try{let n=await Hh.run(`reroute`,Q);if(!n||e!==Sh||t!==Q.routeVersion||Q.crash||!Q.routeChoiceNeeded()||n.route.ids.join(`,`)===Q.player.route.ids.join(`,`))return;Q.installRoute({...n,progress:p(Q.player,n.route.points).s})}catch(e){Jh(e.message)}finally{Wh=!1}};function Jh(e,t=`info`){Z(`toast`).textContent=e,Z(`toast`).classList.toggle(`error`,t===`error`),Z(`toast`).hidden=!1,clearTimeout(Ph),Ph=setTimeout(()=>Z(`toast`).hidden=!0,4200)}function Yh(){let e=Q.world;Z(`world-select`).value=e.type,Z(`speed-limit`).textContent=Math.round(e.theme.limit*3.6),Z(`arrival`).hidden=!0}function Xh(){let e=Q.autopilot;Z(`autopilot`).setAttribute(`aria-checked`,String(e)),Z(`pilot-label`).textContent=e?`Jev engaged`:`Engage Jev`,Bh.set(Z(`autopilot`),`${e?`Disengage`:`Engage`} Jev · J`),Z(`autopilot`).disabled=!!Q.crash,document.body.classList.toggle(`piloting`,e),Vh.sync()}function Zh(e){if(!_h){if(Vh.reset(),e&&gh?.exhausted){Z(`credit-dialog`).showModal();return}if(e&&!yh){Jh(`Jev is not connected. Check the API key on the server.`,`error`);return}Q.crash||e&&Q.complete||(Q.autopilot=e,e&&(Q.freeExplore=!1),Sh++,Eh=0,Dh=0,kh=0,Q.player.target=0,Q.player.steering=0,Q.player.steeringProgress=0,Q.player.maneuver=null,Rh.vectors.clear(),Xh())}}async function Qh(r=Q.world.seed,i=Q.world.type){if(!_h){_h=!0,Vh.reset(),e(`Building your next drive…`),Sh++,Fh=!1,Z(`crash-dialog`).close(),document.body.classList.remove(`crashed`),Ih.clear(),await n();try{Q.reset(r,i),zh.resetView(),Hh.reset(),Gh=!1,Eh=0,Ch=null,wh=null,Th=null,Rh.build(),Rh.vectors.showCandidates=ng,Yh(),Xh(),Z(`paused-overlay`).hidden=!0,Z(`pause`).innerHTML=dh(`pause`),Z(`pause`).setAttribute(`aria-label`,`Pause simulation`),Bh.set(Z(`pause`),`Pause simulation · P`),nt({icons:uh}),await $h()}catch(e){t(e)}}}async function $h(){e(`Loading car and scenery…`),await Rh.ready,e(`Preparing the road…`),await n(),await Rh.prepare(),await document.fonts.ready,await n(),Nh=performance.now(),_h=!1,r(),Vh.sync(),pg(),fg()}function eg(){let e=[`chase`,`hood`,`map`];Rh.mode=e[(e.indexOf(Rh.mode)+1)%3],Rh.snap=!0,Z(`camera-name`).textContent={chase:`Chase`,hood:`Driver`,map:`Bird’s eye`}[Rh.mode],Bh.set(Z(`camera`),`Change camera · ${Z(`camera-name`).textContent} · C`)}function tg(){Q.crash||_h||(Vh.reset(),Ih.clear(),Q.paused=!Q.paused,Vh.sync(),Sh++,Eh=0,Dh=0,Z(`paused-overlay`).hidden=!Q.paused,Z(`pause`).innerHTML=dh(Q.paused?`play`:`pause`),Bh.set(Z(`pause`),`${Q.paused?`Resume`:`Pause`} simulation · P`),Z(`pause`).setAttribute(`aria-label`,Q.paused?`Resume simulation`:`Pause simulation`),nt({icons:uh}))}Z(`autopilot`).onclick=()=>Zh(!Q.autopilot);var ng=!1,rg=0;Z(`candidates-toggle`).onclick=()=>{ng=!ng,Rh.vectors.showCandidates=ng,Z(`candidates-toggle`).setAttribute(`aria-pressed`,String(ng));let e=`${ng?`Hide`:`Show`} steering candidates`;Z(`candidates-toggle`).setAttribute(`aria-label`,e),Bh.set(Z(`candidates-toggle`),e),ng&&!Rh.vectors.plan&&qh()},Z(`new-world`).onclick=()=>Qh(Math.floor(Math.random()*999999)),Z(`world-select`).onchange=e=>Qh(Math.floor(Math.random()*999999),e.target.value),Z(`retry-drive`).onclick=()=>{Qh(),Z(`autopilot`).focus()},Z(`crash-new-world`).onclick=()=>Qh(Math.floor(Math.random()*999999)),Z(`crash-dialog`).addEventListener(`cancel`,e=>e.preventDefault()),Z(`camera`).onclick=eg,Z(`pause`).onclick=tg,Z(`resume`).onclick=tg,Z(`next-trip`).onclick=()=>Qh(Math.floor(Math.random()*999999)),Z(`keep-driving`).onclick=()=>{Q.complete=!1,Q.freeExplore=!0,Z(`arrival`).hidden=!0},Z(`map-toggle`).onclick=()=>{Z(`minimap`).hidden=!Z(`minimap`).hidden,Z(`map-toggle`).setAttribute(`aria-pressed`,String(!Z(`minimap`).hidden)),Bh.set(Z(`map-toggle`),`${Z(`minimap`).hidden?`Show`:`Hide`} route map`),zh.constrainPosition(),fg()},Z(`fullscreen`).onclick=async()=>{try{document.fullscreenElement?await document.exitFullscreen():await document.documentElement.requestFullscreen()}catch{Jh(`Use your browser’s fullscreen shortcut.`)}},document.addEventListener(`fullscreenchange`,()=>{Z(`fullscreen`).innerHTML=dh(document.fullscreenElement?`minimize`:`maximize`),Z(`fullscreen`).setAttribute(`aria-label`,document.fullscreenElement?`Exit fullscreen`:`Enter fullscreen`),Bh.set(Z(`fullscreen`),Z(`fullscreen`).getAttribute(`aria-label`)),nt({icons:uh})}),window.addEventListener(`keydown`,e=>{Q.crash||_h||Z(`json-dialog`).open||Z(`help-dialog`).open||[`INPUT`,`SELECT`,`TEXTAREA`].includes(e.target.tagName)||e.target.closest(`button`)&&[`Space`,`Enter`].includes(e.code)||([`KeyW`,`KeyA`,`KeyS`,`KeyD`,`ArrowUp`,`ArrowDown`,`ArrowLeft`,`ArrowRight`,`Space`].includes(e.code)&&(e.preventDefault(),Ih.add(e.code),Q.autopilot&&Zh(!1)),!e.repeat&&(e.code===`KeyJ`&&Zh(!Q.autopilot),e.code===`KeyC`&&eg(),e.code===`KeyP`&&tg(),e.key===`?`&&(e.preventDefault(),Vh.reset(),Z(`help-dialog`).showModal())))}),window.addEventListener(`keyup`,e=>Ih.delete(e.code)),window.addEventListener(`blur`,()=>{Ih.clear()}),document.addEventListener(`visibilitychange`,()=>{document.hidden&&(Sh++,Ih.clear(),Q.player.target=0,Eh=0,Dh=0)}),Z(`close-help`).onclick=()=>Z(`help-dialog`).close(),Z(`scene-json`).onclick=()=>{Vh.reset(),Z(`json-dialog`).showModal(),ug()},Z(`close-json`).onclick=()=>Z(`json-dialog`).close(),document.querySelectorAll(`[data-tab]`).forEach(e=>e.onclick=()=>{Ah=e.dataset.tab,jh=!1,ig(),document.querySelectorAll(`[data-tab]`).forEach(t=>t.classList.toggle(`active`,t===e)),Z(`json-description`).textContent={request:`Exact Jev API payload, including instructions and offered choices. Full geometry and control details stay local.`,sensor:`Complete forward perception, route guidance, geometry predictions and vehicle telemetry.`,world:`All roads, buildings, vehicles, pedestrians, controls, and the current route.`,decision:`Actual Jev probabilities and token usage. Costs accumulate across every completed call.`}[Ah],ug()});function ig(){Z(`freeze-json`).textContent=jh?`Resume`:`Freeze`,Z(`json-live`).textContent=jh?`FROZEN`:`LIVE · 4 Hz`}Z(`freeze-json`).onclick=()=>{jh=!jh,ig()};function ag(e){let{request:t,fixed:n}=xe(e);return Object.keys(t.questions).length?t:{status:`No Jev call needed: only one eligible action.`,resolved_locally:n}}function og(e){e&&(gh=e,Z(`cost-label`).textContent=`Play credit`)}Z(`credit-close`).onclick=()=>Z(`credit-dialog`).close(),Z(`sign-out`).onclick=async()=>{Zh(!1),Q.paused=!0;try{if(!(await fetch(`/api/auth/logout`,{method:`POST`,headers:{"Content-Type":`application/json`},body:`{}`})).ok)throw Error();location.assign(`/login`)}catch{Jh(`Could not sign out. Please try again.`,`error`)}},Z(`model-select`).value=ve,Z(`model-select`).onchange=e=>{Zh(!1),ye(e.target.value),sg(N()),Jh(`Model changed. Engage Jev to drive with it.`)};function sg(e){let t=Lh.calls?`${Math.round(Lh.input/Lh.calls).toLocaleString()} input tokens/call · ${(Lh.request_bytes/Lh.calls/1024).toFixed(1)} KB/call. `:``;Bh.set(document.querySelector(`.cost-total`),`${gh?`Remaining from your one-time $0.25 allowance. `:``}${t}Session total uses each request’s model price. Current model: $${e.input_per_million.toFixed(2)}/M input. This public demo is free. Developer-plan beta pricing may change; see featherless.ai for current pricing.`)}function cg(){return Ah===`request`?((!Q.lastDecisionState||!Q.autopilot&&!ng&&!Q.paused)&&qh(),wh||(Q.lastDecisionState?ag(Q.lastDecisionState):{status:`Preparing driving state…`})):Ah===`decision`?{response:Ch,last_submitted_input:wh,session:{...Lh,average_input_tokens:Lh.calls?Math.round(Lh.input/Lh.calls):0,average_request_bytes:Lh.calls?Math.round(Lh.request_bytes/Lh.calls):0}}:Q.observation(Ah===`world`)}var lg;Z(`copy-json`).onclick=async()=>{let e=Z(`json-content`).textContent,t=Z(`copy-json`);clearTimeout(lg),t.disabled=!0;try{try{await navigator.clipboard.writeText(e)}catch{let t=document.createElement(`textarea`);t.value=e,t.readOnly=!0,t.style.cssText=`position:fixed;left:-9999px;top:0`,Z(`json-dialog`).append(t);try{if(t.select(),!document.execCommand(`copy`))throw Error(`Clipboard unavailable`)}finally{t.remove()}}Z(`copy-json-label`).textContent=`Copied!`}catch{jh=!0,ig();let e=document.createRange();e.selectNodeContents(Z(`json-content`));let t=window.getSelection();t.removeAllRanges(),t.addRange(e),Z(`copy-json-label`).textContent=`Press ⌘C / Ctrl+C`}finally{t.disabled=!1,t.focus({preventScroll:!0}),lg=setTimeout(()=>{Z(`copy-json-label`).textContent=`Copy`},3e3)}},Z(`download-json`).onclick=()=>{let e=jh?Z(`json-content`).textContent:JSON.stringify(cg(),null,2),t=document.createElement(`a`);t.href=URL.createObjectURL(new Blob([e],{type:`application/json`})),t.download=`jev-${Ah}-${Q.world.seed}.json`,t.click(),setTimeout(()=>URL.revokeObjectURL(t.href),1e3)};function ug(){if(jh)return;let e=JSON.stringify(cg(),null,2);Z(`json-content`).innerHTML=e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/("(?:\\.|[^"\\])*"\s*:?)|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g,e=>`<span class="${e.startsWith(`"`)?e.endsWith(`:`)?`json-key`:`json-string`:/true|false|null/.test(e)?`json-bool`:`json-number`}">${e}</span>`)}async function dg(){if(_h||xh||!Q.autopilot||Q.paused||document.hidden||Q.complete||Q.crash)return;let e=performance.now();if(e<Dh&&(kh||e<Oh||e-Eh<250||(Oh=e+100,!Th||!Q.decisionContextChanged(Th))))return;xh=!0;let t=Sh,n=performance.now();try{let e=await Kh();if(!e||t!==Sh||!Q.autopilot||Q.paused||Q.crash)return;let{state:r,plan:i}=e;Rh.vectors.setCandidates(i),wh=ag(r);let a=await Se(`/api/decide`,{method:`POST`,credentials:`same-origin`,headers:{"Content-Type":`application/json`},body:JSON.stringify({state:r,request_id:crypto.randomUUID()}),signal:AbortSignal.timeout(12e3)}),o=await a.json();if(og(o.credits),a.status===401&&bh){Zh(!1),location.assign(`/login`);return}if(a.status===402&&bh){Zh(!1),Z(`credit-dialog`).showModal();return}if(!a.ok)throw Error(o.error||`Jev request failed`);if(o.decision_source===`only_eligible_action`?Lh.constrained_steps++:Lh.calls++,Lh.request_bytes+=o.request_bytes??0,Lh.cost+=o.cost_usd,Lh.input+=o.usage.input_tokens,Lh.output+=o.usage.output_tokens,sg(o.pricing),Lh.latencies.push(o.latency_ms),Lh.latencies.length>25&&Lh.latencies.shift(),t!==Sh||r.route_version!==Q.routeVersion||!Q.autopilot||Q.paused||Q.crash)return;let s=ce(r,o);if(!s)throw Error(`Jev returned a mismatched candidate batch.`);let c=performance.now();if(c-n>1800)throw Error(`Jev decision expired before it arrived. Replanning.`);if(Q.decisionContextChanged(r)){Dh=0;return}if(o.answers.route?.choice&&o.answers.route.choice!==`keep`&&Q.chooseRoute(o.answers.route.choice)){Dh=0;return}Eh&&Lh.intervals.push(c-Eh),Lh.intervals.length>20&&Lh.intervals.shift(),Ch={...o,received_at_simulation_s:Q.time},Th=r,Eh=performance.now(),kh=0,Q.player.maneuver=r.vectors[o.selection.choice],Q.player.steering=s.steering,Q.player.target=s.velocity,Rh.vectors.setAnswer(o.selection,i),Dh=n+he(r)}catch(e){t===Sh&&(Q.player.target=0,Rh.vectors.clear(),kh++,Dh=performance.now()+Math.min(15e3,1e3*2**kh),Jh(e.message,`error`),Q.event(e.message,`error`),kh>=3&&(Zh(!1),Jh(`Jev paused after three failed requests. Toggle autopilot to reconnect.`,`error`)))}finally{xh=!1}}function fg(){let e=Q.world,t=Q.player,n=zh.view(),r=n.scale,i=e=>[(e.x-n.center.x)*r,(e.z-n.center.z)*r];if($.clearRect(0,0,380,310),$.fillStyle=`#f3f4f6`,$.fillRect(0,0,380,310),$.save(),$.translate(190,201.5),$.rotate(-n.heading),$.lineCap=`round`,$.strokeStyle=`#d0d3d8`,e.roadSamples&&($.lineWidth=25*r,$.beginPath(),e.roadSamples.forEach((e,t)=>t?$.lineTo(...i(e)):$.moveTo(...i(e))),$.stroke()),e.connectorRoads)for(let t of e.connectorRoads)$.lineWidth=t.width*r,$.beginPath(),t.points.forEach((e,t)=>t?$.lineTo(...i(e)):$.moveTo(...i(e))),$.stroke();else if(!e.roadSamples)for(let t of e.edges)$.lineWidth=t.width*r,$.beginPath(),$.moveTo(...i(e.byId[t.a])),$.lineTo(...i(e.byId[t.b])),$.stroke();$.strokeStyle=`#3e6ae1`,$.lineWidth=4,$.beginPath(),e.route.points.forEach((e,t)=>t?$.lineTo(...i(e)):$.moveTo(...i(e))),$.stroke();for(let e of Q.traffic)$.fillStyle=e.type===`motorcycle`?`#e82127`:`#81858d`,$.beginPath(),$.arc(...i(e),4,0,Math.PI*2),$.fill();let a=i(e.route.points.at(-1));$.fillStyle=`#171a20`,$.fillRect(a[0]-3,a[1]-6,8,7),$.fillRect(a[0]-3,a[1]-6,1,14),$.save(),$.translate(...i(t)),$.rotate(t.heading),$.fillStyle=`#ffffff`,$.beginPath(),$.arc(0,0,13,0,Math.PI*2),$.fill(),$.fillStyle=`#171a20`,$.beginPath(),$.moveTo(0,-10),$.lineTo(7,7),$.lineTo(0,4),$.lineTo(-7,7),$.closePath(),$.fill(),$.restore(),$.restore()}function pg(){let e=Q.player,t=Q.navigation();Z(`speed`).textContent=Math.round(Math.abs(e.speed)*3.6),Z(`speed-limit`).textContent=Math.round((t.speed_limit_mps??Q.world.theme.limit)*3.6),Z(`remaining`).textContent=t.remaining_m>=1e3?`${(t.remaining_m/1e3).toFixed(1)} km`:`${Math.round(t.remaining_m)} m`,Z(`next-maneuver`).textContent=t.instruction||(t.next_turn===`arrive`?Q.world.type===`highway`?`Follow Interstate 08`:`Destination ahead`:t.next_turn===`straight`?`Continue straight`:t.next_turn===`uturn`?`Make a U-turn`:`Turn ${t.next_turn}`),Z(`turn-distance`).textContent=t.next_turn===`arrive`?`to your destination`:`in ${Math.round(t.turn_distance_m)} m`;let n={uturn:`rotate-ccw`,left:`corner-up-left`,right:`corner-up-right`,straight:`arrow-up`,arrive:`flag`,merge:`corner-up-left`,exit:`corner-up-right`}[t.next_turn];Z(`turn-icon`).dataset.icon!==n&&(Z(`turn-icon`).innerHTML=dh(n),Z(`turn-icon`).dataset.icon=n,nt({icons:uh}));let r=Ch?.selection,i=!Eh||performance.now()-Eh>1800;Z(`pilot-state`).textContent=Q.autopilot?i?`Reading the road…`:`${ne(Rh.vectors.answeredPlan?.vectors[r.choice])} · ${Math.round(r.confidence*100)}%`:Q.crash?`Drive ended`:`Free play`,Z(`context-message`).textContent=Q.autopilot?Q.brakeReason?`Safety brake · ${Q.brakeReason}`:i?`Waiting for a fresh decision`:`${Math.round(e.target*3.6)} km/h target · ${Ch.latency_ms} ms`:Vh.available?`Drag to drive · Hold Brake to stop`:`WASD to drive · Space to brake`,Q.autopilot&&!i&&!Q.brakeReason&&e.speed<.5&&e.target<.5&&(Z(`context-message`).textContent=Ch.decision_source===`only_eligible_action`?`Only stop is available · rechecking scene`:`Jev chose to wait · evaluating traffic`),t.rerouted?Z(`context-message`).textContent=`Route recalculated · continuing to your destination`:Wh&&Q.routeChoiceNeeded()?Z(`context-message`).textContent=`Recalculating route…`:Q.lastPlan?.recovery.active&&(Z(`context-message`).textContent=Q.lastPlan.road.on_road?`Returning to the route`:`Finding a way back onto the road`),Z(`cost`).textContent=gh?`$${Math.max(0,gh.remaining_usd).toFixed(4)}`:`$${Lh.cost.toFixed(6)}`,Q.complete&&!Q.freeExplore&&(Z(`arrival`).hidden=!1,Z(`arrival-summary`).textContent=`${Math.round(Q.distance)} m driven · ${Q.collisions} contacts · ${Q.violations} violations`,Z(`autopilot`).getAttribute(`aria-checked`)===`true`&&(Sh++,Xh())),Z(`json-dialog`).open&&ug()}function mg(e){requestAnimationFrame(mg);let t=Math.min((e-Nh)/1e3,.2);if(Nh=e,!(document.hidden||_h)){if(Vh.sync(),!Q.paused&&!Q.crash){if(Q.autopilot)(!Eh||e-Eh>1800)&&(Q.player.target=0);else{let e=0,t=Ih.has(`KeyA`)||Ih.has(`ArrowLeft`),n=Ih.has(`KeyD`)||Ih.has(`ArrowRight`);(t||n)&&(e=Number(n)-Number(t));let r=0;(Ih.has(`KeyW`)||Ih.has(`ArrowUp`))&&(r=1),(Ih.has(`KeyS`)||Ih.has(`ArrowDown`))&&(r=-1),Q.pedals.throttle=r||Vh.throttle,Q.pedals.brake=Ih.has(`Space`)?1:Vh.brake,Q.steeringInput=e||Vh.steering,Q.player.target=0}let n=Math.max(1,Math.ceil(t/.025));for(let e=0;e<n;e++)Q.step(t/n)}if(Rh.routeVersion!==Q.routeVersion){Rh.routeVersion=Q.routeVersion,Sh++,Eh=0,Ch=null,wh=null,Th=null,Dh=0,Rh.vectors.clear();let e=Q.player.route.points.at(-1);Rh.destination.position.set(e.x,.2,e.z)}Q.crash&&!Fh&&(Fh=!0,Sh++,Ih.clear(),Rh.vectors.clear(),Xh(),Z(`arrival`).hidden=!0,Z(`paused-overlay`).hidden=!0,Z(`json-dialog`).close(),Z(`help-dialog`).close(),document.body.classList.add(`crashed`),Z(`crash-description`).textContent={building:`You collided with a building.`,pedestrian:`You struck a pedestrian.`,car:`You collided with another car.`,motorcycle:`You collided with a motorcycle.`}[Q.crash.type],Z(`crash-speed`).textContent=Math.round(Q.crash.impact_speed_mps*3.6),Z(`crash-distance`).textContent=Math.round(Q.distance),Z(`crash-dialog`).showModal()),ng&&!Q.autopilot&&!Q.paused&&!Q.crash&&e-rg>500&&(rg=e,qh()),Rh.render(t),!Z(`minimap`).hidden&&e-vh>=100&&(fg(),vh=e),Mh+=t,Mh>.2&&(Mh=0,pg())}}Yh(),Xh(),pg(),requestAnimationFrame(mg),$h().catch(t),setInterval(dg,25),Se(`/api/status`,{credentials:`same-origin`}).then(e=>e.json()).then(e=>{if(bh=e.auth_required!==!1,bh&&e.authenticated!==!0){location.replace(`/login`);return}og(e.credits),Z(`sign-out`).hidden=!e.authenticated,e.user&&Bh.set(Z(`sign-out`),`Sign out · ${e.user.email}`),yh=e.configured,sg(e.pricing),yh||Jh(`Jev API key is missing. Check the server configuration.`,`error`)}).catch(()=>{Jh(`Jev server unavailable.`,`error`)});export{Rh as scene,Q as sim};