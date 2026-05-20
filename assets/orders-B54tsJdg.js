import{q as r}from"./index-Yply1dYB.js";const d=t=>r.get("/orders",{params:t}).then(e=>e.data),o=(t,e)=>r.patch(`/orders/${t}/status`,e).then(a=>a.data);export{d as g,o as u};
