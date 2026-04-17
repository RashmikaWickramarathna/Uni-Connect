import{a as e,n as t,t as n}from"./jsx-runtime-Bg_NI1en.js";import{i as r,n as i,s as a}from"./index-BIILOEz8.js";import{t as o}from"./Navbar-D3ENyy0t.js";import{t as s}from"./feedbackApi-f4K_ecRY.js";import{a as c,i as l,n as u,o as d,r as f,t as p}from"./Label-DNPYPqXF.js";var m=e(t(),1),h=n(),g=i.div`
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.12), transparent 28%),
    radial-gradient(circle at bottom left, rgba(251, 191, 36, 0.14), transparent 26%),
    linear-gradient(180deg, #f8fbff 0%, #ffffff 45%, #f8fbff 100%);

  &::before {
    content: '';
    position: fixed;
    top: 6rem;
    right: -9rem;
    width: 24rem;
    height: 24rem;
    border-radius: 50%;
    background: rgba(37, 99, 235, 0.08);
    filter: blur(12px);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: fixed;
    left: -8rem;
    bottom: 2rem;
    width: 22rem;
    height: 22rem;
    border-radius: 50%;
    background: rgba(251, 191, 36, 0.08);
    filter: blur(14px);
    pointer-events: none;
  }
`,_=i.main`
  position: relative;
  z-index: 1;
  padding: 7.5rem 2rem 3rem;
  max-width: 1200px;
  margin: 0 auto;
`,ee=i.h2`
  font-size: clamp(1.8rem, 2.8vw, 2.3rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #1f2937;
  margin-bottom: 1.5rem;
`,te=i.button`
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(147, 197, 253, 0.7);
  color: #2563eb;
  padding: 0.7rem 1.1rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;

  &:hover {
    background: #ffffff;
    transform: translateY(-1px);
    box-shadow: 0 16px 32px rgba(15, 23, 42, 0.1);
  }
`,v=i.div`
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(209, 213, 219, 0.72);
  border-radius: 1.35rem;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  padding: 1.75rem;
  margin-bottom: 1.75rem;
`,y=i.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 1rem;
`,b=i.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,x=i.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`,S=i.div`
  padding: 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  ${e=>e.$variant===`error`?`
    color: var(--destructive);
    background-color: rgba(220, 38, 38, 0.1);
  `:`
    color: #16a34a;
    background-color: #dcfce7;
  `}
`,C=i(f)`
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
  }
`,w=i.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,T=i(c)`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(209, 213, 219, 0.72);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.06);
`,E=i.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`,D=i.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`,O=i.span`
  font-size: 0.75rem;
  color: var(--muted-foreground);
  background: var(--muted);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
`,k=i.span`
  color: #eab308;
  font-size: 1.125rem;
`,A=i.span`
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  ${e=>e.$replied?`
    background: #dcfce7;
    color: #16a34a;
  `:`
    background: #fef3c7;
    color: #d97706;
  `}
`,j=i.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`,ne=i.div`
  background: #f0f9ff;
  border-left: 3px solid #2563eb;
  padding: 0.75rem 1rem;
  border-radius: 0 0.375rem 0.375rem 0;
  margin-top: 0.75rem;
`,re=i.p`
  font-size: 0.75rem;
  font-weight: 600;
  color: #2563eb;
  text-transform: uppercase;
`,ie=i.p`
  font-size: 0.875rem;
  color: var(--foreground);
`,ae=i.p`
  text-align: center;
  color: var(--muted-foreground);
  padding: 2rem;
`,oe=i.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
`,se=i.div`
  width: 2rem;
  height: 2rem;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`,M={width:`100%`,height:`2.75rem`,padding:`0 0.85rem`,borderRadius:`0.75rem`,border:`1px solid #cbd5e1`,backgroundColor:`#f8fbff`,color:`#1f2937`,fontSize:`0.875rem`};function N(){let{user:e}=r(),t=a(),[n,i]=(0,m.useState)([]),[c,f]=(0,m.useState)(!0),[N,P]=(0,m.useState)(!1),[F,I]=(0,m.useState)({name:e?.email?.split(`@`)[0]||``,email:e?.email||``,rating:5,comments:``}),[L,R]=(0,m.useState)(``),[z,B]=(0,m.useState)(``),[V,H]=(0,m.useState)(null),[U,W]=(0,m.useState)({name:``,email:``,rating:5,comments:``}),[G,K]=(0,m.useState)(``),[q,J]=(0,m.useState)(``),Y=(0,m.useCallback)(async()=>{if(!e?.userId){f(!1);return}try{i((await s.getMy(e.userId)).data.feedbacks||[])}catch(e){console.error(`Failed to fetch feedbacks`,e)}finally{f(!1)}},[e?.userId]);(0,m.useEffect)(()=>{Y()},[Y]);let X=e=>{let{name:t,value:n}=e.target;I({...F,[t]:t===`rating`?parseInt(n):n})},Z=e=>e.name?.trim()?e.email?.trim()?e.comments?.trim()?e.comments.length<10?`Comments must be at least 10 characters`:null:`Comments are required`:`Email is required`:`Name is required`,ce=async t=>{t.preventDefault(),R(``),B(``);let n=Z(F);if(n){R(n);return}P(!0);try{await s.create({...F,userId:e.userId}),B(`Feedback submitted successfully!`),I({...F,comments:``,rating:5}),Y()}catch(e){R(e.response?.data?.message||`Failed to submit feedback`)}P(!1)},le=e=>{H(e._id),W({name:e.name,email:e.email,rating:e.rating,comments:e.comments}),K(``),J(``)},Q=e=>{let{name:t,value:n}=e.target;W({...U,[t]:t===`rating`?parseInt(n):n})},$=async()=>{let e=Z(U);if(e){K(e);return}P(!0);try{await s.update(V,U),J(`Feedback updated successfully!`),H(null),Y()}catch(e){K(e.response?.data?.message||`Failed to update feedback`)}P(!1)},ue=async e=>{if(window.confirm(`Are you sure you want to delete this feedback?`)){P(!0);try{await s.delete(e),Y()}catch(e){console.error(`Failed to delete feedback`,e),alert(`Failed to delete feedback`)}P(!1)}},de=e=>`★`.repeat(e)+`☆`.repeat(5-e);return(0,h.jsxs)(g,{children:[(0,h.jsx)(o,{}),(0,h.jsxs)(_,{children:[(0,h.jsx)(te,{onClick:()=>t(`/home`),children:`← Back to Dashboard`}),(0,h.jsx)(ee,{children:`My Feedbacks`}),(0,h.jsxs)(v,{children:[(0,h.jsx)(y,{children:`Submit New Feedback`}),(0,h.jsxs)(b,{onSubmit:ce,children:[L&&(0,h.jsx)(S,{$variant:`error`,children:L}),z&&(0,h.jsx)(S,{$variant:`success`,children:z}),(0,h.jsxs)(x,{children:[(0,h.jsxs)(`div`,{children:[(0,h.jsx)(p,{htmlFor:`name`,children:`Name`}),(0,h.jsx)(C,{id:`name`,name:`name`,placeholder:`Your name`,value:F.name,onChange:X,required:!0})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(p,{htmlFor:`email`,children:`Email`}),(0,h.jsx)(C,{id:`email`,name:`email`,type:`email`,placeholder:`Your email`,value:F.email,onChange:X,required:!0})]})]}),(0,h.jsxs)(x,{children:[(0,h.jsxs)(`div`,{children:[(0,h.jsx)(p,{htmlFor:`rating`,children:`Rating`}),(0,h.jsxs)(`select`,{name:`rating`,value:F.rating,onChange:X,style:M,children:[(0,h.jsx)(`option`,{value:5,children:`5 Stars - Excellent`}),(0,h.jsx)(`option`,{value:4,children:`4 Stars - Very Good`}),(0,h.jsx)(`option`,{value:3,children:`3 Stars - Good`}),(0,h.jsx)(`option`,{value:2,children:`2 Stars - Fair`}),(0,h.jsx)(`option`,{value:1,children:`1 Star - Poor`})]})]}),(0,h.jsx)(`div`,{})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(p,{htmlFor:`comments`,children:`Comments`}),(0,h.jsx)(u,{id:`comments`,name:`comments`,placeholder:`Share your feedback (min 10 characters)`,value:F.comments,onChange:X,required:!0})]}),(0,h.jsx)(l,{type:`submit`,disabled:N,children:N?`Submitting...`:`Submit Feedback`})]})]}),(0,h.jsxs)(v,{children:[(0,h.jsxs)(y,{children:[`My Feedback History (`,n.length,`)`]}),c?(0,h.jsx)(oe,{children:(0,h.jsx)(se,{})}):n.length===0?(0,h.jsx)(ae,{children:`No feedbacks yet. Submit your first feedback above!`}):(0,h.jsx)(w,{children:n.map(e=>(0,h.jsx)(T,{children:(0,h.jsx)(d,{children:V===e._id?(0,h.jsxs)(b,{onSubmit:e=>{e.preventDefault(),$()},children:[G&&(0,h.jsx)(S,{$variant:`error`,children:G}),q&&(0,h.jsx)(S,{$variant:`success`,children:q}),(0,h.jsxs)(x,{children:[(0,h.jsxs)(`div`,{children:[(0,h.jsx)(p,{children:`Name`}),(0,h.jsx)(C,{name:`name`,value:U.name,onChange:Q})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(p,{children:`Email`}),(0,h.jsx)(C,{name:`email`,value:U.email,onChange:Q})]})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(p,{children:`Rating`}),(0,h.jsxs)(`select`,{name:`rating`,value:U.rating,onChange:Q,style:M,children:[(0,h.jsx)(`option`,{value:5,children:`5 Stars`}),(0,h.jsx)(`option`,{value:4,children:`4 Stars`}),(0,h.jsx)(`option`,{value:3,children:`3 Stars`}),(0,h.jsx)(`option`,{value:2,children:`2 Stars`}),(0,h.jsx)(`option`,{value:1,children:`1 Star`})]})]}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(p,{children:`Comments`}),(0,h.jsx)(u,{name:`comments`,value:U.comments,onChange:Q})]}),(0,h.jsxs)(j,{children:[(0,h.jsx)(l,{type:`submit`,size:`sm`,disabled:N,children:N?`Saving...`:`Save`}),(0,h.jsx)(l,{type:`button`,size:`sm`,variant:`outline`,onClick:()=>H(null),children:`Cancel`})]})]}):(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(E,{children:(0,h.jsxs)(D,{children:[(0,h.jsx)(k,{children:de(e.rating)}),(0,h.jsx)(O,{children:new Date(e.createdAt).toLocaleDateString()}),(0,h.jsx)(A,{$replied:!!e.adminReply,children:e.adminReply?`Replied`:`Pending`})]})}),(0,h.jsx)(`p`,{style:{color:`var(--foreground)`,marginBottom:`0.5rem`},children:e.comments}),e.adminReply?(0,h.jsxs)(ne,{children:[(0,h.jsx)(re,{children:`Admin Reply`}),(0,h.jsx)(ie,{children:e.adminReply})]}):(0,h.jsxs)(j,{children:[(0,h.jsx)(l,{size:`sm`,variant:`outline`,onClick:()=>le(e),children:`Edit`}),(0,h.jsx)(l,{size:`sm`,variant:`destructive`,onClick:()=>ue(e._id),children:`Delete`})]})]})})},e._id))})]})]})]})}export{N as default};