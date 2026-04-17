import{a as e,n as t,t as n}from"./jsx-runtime-Bg_NI1en.js";import{i as r,n as i,s as a}from"./index-BIILOEz8.js";import{t as o}from"./Navbar-D3ENyy0t.js";import{t as s}from"./inquiryApi-BZGGIfAz.js";import{a as c,i as l,n as u,o as ee,r as d,t as f}from"./Label-DNPYPqXF.js";var p=e(t(),1),m=n(),h=i.div`
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
`,g=i.main`
  position: relative;
  z-index: 1;
  padding: 7.5rem 2rem 3rem;
  max-width: 1200px;
  margin: 0 auto;
`,_=i.h2`
  font-size: clamp(1.8rem, 2.8vw, 2.3rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #1f2937;
  margin-bottom: 1.5rem;
`,v=i.button`
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
`,y=i.div`
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(209, 213, 219, 0.72);
  border-radius: 1.35rem;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  padding: 1.75rem;
  margin-bottom: 1.75rem;
`,b=i.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 1rem;
`,x=i.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
`,C=i(d)`
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
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 2rem;
  background: #dbeafe;
  color: #2563eb;
  text-transform: uppercase;
  letter-spacing: 0.025em;
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
`,M=i.div`
  background: #f0f9ff;
  border-left: 3px solid #2563eb;
  padding: 0.75rem 1rem;
  border-radius: 0 0.375rem 0.375rem 0;
  margin-top: 0.75rem;
`,te=i.p`
  font-size: 0.75rem;
  font-weight: 600;
  color: #2563eb;
  text-transform: uppercase;
`,ne=i.p`
  font-size: 0.875rem;
  color: var(--foreground);
`,re=i.p`
  text-align: center;
  color: var(--muted-foreground);
  padding: 2rem;
`,ie=i.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
`,ae=i.div`
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
`;function N(){let{user:e}=r(),t=a(),[n,i]=(0,p.useState)([]),[c,d]=(0,p.useState)(!0),[N,P]=(0,p.useState)(!1),[F,I]=(0,p.useState)({name:e?.email?.split(`@`)[0]||``,email:e?.email||``,subject:``,message:``}),[L,R]=(0,p.useState)(``),[z,B]=(0,p.useState)(``),[V,H]=(0,p.useState)(null),[U,W]=(0,p.useState)({name:``,email:``,subject:``,message:``}),[G,K]=(0,p.useState)(``),[q,J]=(0,p.useState)(``),Y=(0,p.useCallback)(async()=>{if(!e?.userId){d(!1);return}try{i((await s.getMy(e.userId)).data.inquiries||[])}catch(e){console.error(`Failed to fetch inquiries`,e)}finally{d(!1)}},[e?.userId]);(0,p.useEffect)(()=>{Y()},[Y]);let X=e=>{let{name:t,value:n}=e.target;I({...F,[t]:n})},Z=e=>e.name?.trim()?e.email?.trim()?e.subject?.trim()?e.message?.trim()?e.message.length<10?`Message must be at least 10 characters`:null:`Message is required`:`Subject is required`:`Email is required`:`Name is required`,Q=async t=>{t.preventDefault(),R(``),B(``);let n=Z(F);if(n){R(n);return}P(!0);try{await s.create({...F,userId:e.userId}),B(`Inquiry submitted successfully!`),I({...F,subject:``,message:``}),Y()}catch(e){R(e.response?.data?.message||`Failed to submit inquiry`)}P(!1)},oe=e=>{H(e._id),W({name:e.name,email:e.email,subject:e.subject,message:e.message}),K(``),J(``)},$=e=>{let{name:t,value:n}=e.target;W({...U,[t]:n})},se=async()=>{let e=Z(U);if(e){K(e);return}P(!0);try{await s.update(V,U),J(`Inquiry updated successfully!`),H(null),Y()}catch(e){K(e.response?.data?.message||`Failed to update inquiry`)}P(!1)},ce=async e=>{if(window.confirm(`Are you sure you want to delete this inquiry?`)){P(!0);try{await s.delete(e),Y()}catch(e){console.error(`Failed to delete inquiry`,e),alert(`Failed to delete inquiry`)}P(!1)}};return(0,m.jsxs)(h,{children:[(0,m.jsx)(o,{}),(0,m.jsxs)(g,{children:[(0,m.jsx)(v,{onClick:()=>t(`/home`),children:`← Back to Dashboard`}),(0,m.jsx)(_,{children:`My Inquiries`}),(0,m.jsxs)(y,{children:[(0,m.jsx)(b,{children:`Submit New Inquiry`}),(0,m.jsxs)(x,{onSubmit:Q,children:[L&&(0,m.jsx)(S,{$variant:`error`,children:L}),z&&(0,m.jsx)(S,{$variant:`success`,children:z}),(0,m.jsxs)(`div`,{children:[(0,m.jsx)(f,{htmlFor:`name`,children:`Name`}),(0,m.jsx)(C,{id:`name`,name:`name`,placeholder:`Your name`,value:F.name,onChange:X,required:!0})]}),(0,m.jsxs)(`div`,{children:[(0,m.jsx)(f,{htmlFor:`email`,children:`Email`}),(0,m.jsx)(C,{id:`email`,name:`email`,type:`email`,placeholder:`Your email`,value:F.email,onChange:X,required:!0})]}),(0,m.jsxs)(`div`,{children:[(0,m.jsx)(f,{htmlFor:`subject`,children:`Subject`}),(0,m.jsx)(C,{id:`subject`,name:`subject`,placeholder:`Enter subject (e.g., Payment Issue, Account Help)`,value:F.subject,onChange:X,required:!0})]}),(0,m.jsxs)(`div`,{children:[(0,m.jsx)(f,{htmlFor:`message`,children:`Message`}),(0,m.jsx)(u,{id:`message`,name:`message`,placeholder:`Describe your inquiry in detail (min 10 characters)`,value:F.message,onChange:X,required:!0})]}),(0,m.jsx)(l,{type:`submit`,disabled:N,children:N?`Submitting...`:`Submit Inquiry`})]})]}),(0,m.jsxs)(y,{children:[(0,m.jsxs)(b,{children:[`My Inquiry History (`,n.length,`)`]}),c?(0,m.jsx)(ie,{children:(0,m.jsx)(ae,{})}):n.length===0?(0,m.jsx)(re,{children:`No inquiries yet. Submit your first inquiry above!`}):(0,m.jsx)(w,{children:n.map(e=>(0,m.jsx)(T,{children:(0,m.jsx)(ee,{children:V===e._id?(0,m.jsxs)(x,{onSubmit:e=>{e.preventDefault(),se()},children:[G&&(0,m.jsx)(S,{$variant:`error`,children:G}),q&&(0,m.jsx)(S,{$variant:`success`,children:q}),(0,m.jsxs)(`div`,{children:[(0,m.jsx)(f,{children:`Name`}),(0,m.jsx)(C,{name:`name`,value:U.name,onChange:$})]}),(0,m.jsxs)(`div`,{children:[(0,m.jsx)(f,{children:`Email`}),(0,m.jsx)(C,{name:`email`,value:U.email,onChange:$})]}),(0,m.jsxs)(`div`,{children:[(0,m.jsx)(f,{children:`Subject`}),(0,m.jsx)(C,{name:`subject`,value:U.subject,onChange:$})]}),(0,m.jsxs)(`div`,{children:[(0,m.jsx)(f,{children:`Message`}),(0,m.jsx)(u,{name:`message`,value:U.message,onChange:$})]}),(0,m.jsxs)(j,{children:[(0,m.jsx)(l,{type:`submit`,size:`sm`,disabled:N,children:N?`Saving...`:`Save`}),(0,m.jsx)(l,{type:`button`,size:`sm`,variant:`outline`,onClick:()=>H(null),children:`Cancel`})]})]}):(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(E,{children:(0,m.jsxs)(D,{children:[(0,m.jsx)(k,{children:e.subject}),(0,m.jsx)(O,{children:new Date(e.createdAt).toLocaleDateString()}),(0,m.jsx)(A,{$replied:!!e.adminReply,children:e.adminReply?`Replied`:`Pending`})]})}),(0,m.jsx)(`p`,{style:{color:`var(--foreground)`,marginBottom:`0.5rem`},children:e.message}),e.adminReply?(0,m.jsxs)(M,{children:[(0,m.jsx)(te,{children:`Admin Reply`}),(0,m.jsx)(ne,{children:e.adminReply})]}):(0,m.jsxs)(j,{children:[(0,m.jsx)(l,{size:`sm`,variant:`outline`,onClick:()=>oe(e),children:`Edit`}),(0,m.jsx)(l,{size:`sm`,variant:`destructive`,onClick:()=>ce(e._id),children:`Delete`})]})]})})},e._id))})]})]})]})}export{N as default};