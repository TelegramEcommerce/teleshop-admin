import{q as e}from"./index-Yply1dYB.js";const n=t=>e.get("/users",{params:t}).then(s=>s.data),o=(t,s)=>e.patch(`/users/${t}`,s).then(a=>a.data);export{n as g,o as u};
