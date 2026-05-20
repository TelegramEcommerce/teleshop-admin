import{s as e}from"./index-220Sjdkj.js";const n=s=>e.get("/users",{params:s}).then(t=>t.data),o=(s,t)=>e.patch(`/users/${s}`,t).then(a=>a.data);export{n as g,o as u};
