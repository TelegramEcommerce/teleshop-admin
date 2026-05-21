import{s as r}from"./index-g6QOHs2c.js";const d=t=>r.get("/orders",{params:t}).then(e=>e.data),o=(t,e)=>r.patch(`/orders/${t}/status`,e).then(s=>s.data);export{d as g,o as u};
