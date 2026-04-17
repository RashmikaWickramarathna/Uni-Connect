import{a as e,n as t,t as n}from"./jsx-runtime-Bg_NI1en.js";import{i as r,n as i,s as a}from"./index-BIILOEz8.js";import{t as o}from"./Navbar-D3ENyy0t.js";import{a as s,i as c,o as l,r as u,t as d}from"./Label-DNPYPqXF.js";import{t as f}from"./authApi-MbRH8FVK.js";var p=e(t(),1),m=n(),h=i.div`
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
  max-width: 800px;
  margin: 0 auto;
`,_=i.button`
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
`,v=i.h2`
  font-size: clamp(1.8rem, 2.8vw, 2.3rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #1f2937;
  margin-bottom: 1.5rem;
`,y=i(s)`
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(209, 213, 219, 0.72);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  border-radius: 1.35rem;
  margin-bottom: 1.5rem;
`,b=i.div`
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb 0%, #1e3a5f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 auto 1rem;
`,x=i.div`
  text-align: center;
  margin-bottom: 1.5rem;
`,S=i.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--foreground);
`,C=i.p`
  font-size: 0.875rem;
  color: var(--muted-foreground);
`,w=i.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--foreground);
  margin-bottom: 1rem;
`,T=i.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,E=i.div`
  padding: 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  ${e=>e.$variant===`error`?`
    color: var(--destructive);
    background-color: rgba(220, 38, 38, 0.1);
  `:e.$variant===`success`?`
    color: #16a34a;
    background-color: #dcfce7;
  `:`
    color: #d97706;
    background-color: #fef3c7;
  `}
`,D=i.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`,O=i(c)`
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  &:hover {
    background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  }
`,k=i(u)`
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
  }
`,A=i.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`,j=i.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
`,M=i.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
`,N=i.p`
  color: var(--muted-foreground);
  margin-bottom: 1.5rem;
`,P=i.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`,F=i.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`,I=i.div`
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
`;function L(){let{user:e,login:t,logout:n}=r(),i=a(),[s,u]=(0,p.useState)(!0),[L,R]=(0,p.useState)(!1),[z,B]=(0,p.useState)(!1),[V,H]=(0,p.useState)({name:``,mobile:``}),[U,W]=(0,p.useState)(``),[G,K]=(0,p.useState)(``),[q,J]=(0,p.useState)(!1),Y=(0,p.useCallback)(async()=>{if(!e?.userId){u(!1);return}try{let t=await f.getUser(e.userId);t.data.user&&H({name:t.data.user.name||e.email?.split(`@`)[0]||``,mobile:t.data.user.mobile||``})}catch(t){H({name:e.email?.split(`@`)[0]||``,mobile:``}),console.error(`Failed to fetch user data`,t)}finally{u(!1)}},[e?.userId,e?.email]);(0,p.useEffect)(()=>{Y()},[Y]);let X=e=>{let{name:t,value:n}=e.target;H({...V,[t]:n})};return s?(0,m.jsx)(h,{children:(0,m.jsx)(F,{children:(0,m.jsx)(I,{})})}):(0,m.jsxs)(h,{children:[(0,m.jsx)(o,{}),(0,m.jsxs)(g,{children:[(0,m.jsx)(_,{onClick:()=>i(`/home`),children:`← Back to Dashboard`}),(0,m.jsx)(v,{children:`My Profile`}),(0,m.jsx)(y,{children:(0,m.jsxs)(l,{style:{padding:`2rem`},children:[(0,m.jsx)(b,{children:(V.name||e?.email?.split(`@`)[0]||`U`).charAt(0).toUpperCase()}),(0,m.jsxs)(x,{children:[(0,m.jsx)(S,{children:V.name||e?.email?.split(`@`)[0]||`User`}),(0,m.jsx)(C,{children:e?.email})]}),z?(0,m.jsxs)(T,{onSubmit:async n=>{if(n.preventDefault(),W(``),K(``),R(!0),!V.name?.trim()){W(`Name is required`),R(!1);return}try{if((await f.updateUser(e.userId,{name:V.name,mobile:V.mobile})).data.user){let n={...e,name:V.name,mobile:V.mobile};localStorage.setItem(`user`,JSON.stringify(n)),t(n)}K(`Profile updated successfully!`),B(!1)}catch(e){W(e.response?.data?.message||`Failed to update profile`)}R(!1)},children:[U&&(0,m.jsx)(E,{$variant:`error`,children:U}),G&&(0,m.jsx)(E,{$variant:`success`,children:G}),(0,m.jsxs)(`div`,{children:[(0,m.jsx)(d,{htmlFor:`name`,children:`Name`}),(0,m.jsx)(k,{id:`name`,name:`name`,placeholder:`Your name`,value:V.name,onChange:X})]}),(0,m.jsxs)(`div`,{children:[(0,m.jsx)(d,{htmlFor:`email`,children:`Email`}),(0,m.jsx)(k,{id:`email`,value:e?.email||``,disabled:!0,style:{opacity:.6}})]}),(0,m.jsxs)(`div`,{children:[(0,m.jsx)(d,{htmlFor:`mobile`,children:`Mobile Number`}),(0,m.jsx)(k,{id:`mobile`,name:`mobile`,placeholder:`Enter mobile number`,value:V.mobile,onChange:X})]}),(0,m.jsxs)(D,{children:[(0,m.jsx)(c,{type:`submit`,disabled:L,children:L?`Saving...`:`Save Changes`}),(0,m.jsx)(c,{type:`button`,variant:`outline`,onClick:()=>{B(!1),W(``),K(``)},children:`Cancel`})]})]}):(0,m.jsx)(m.Fragment,{children:(0,m.jsx)(c,{onClick:()=>B(!0),fullWidth:!0,children:`Edit Profile`})})]})}),(0,m.jsx)(y,{children:(0,m.jsxs)(l,{style:{padding:`1.5rem`},children:[(0,m.jsx)(w,{children:`Account Actions`}),(0,m.jsx)(D,{children:(0,m.jsx)(O,{variant:`destructive`,onClick:()=>J(!0),children:`Delete Account`})})]})})]}),q&&(0,m.jsx)(A,{onClick:()=>J(!1),children:(0,m.jsxs)(j,{onClick:e=>e.stopPropagation(),children:[(0,m.jsx)(M,{style:{color:`#dc2626`},children:`Delete Account`}),(0,m.jsx)(N,{children:`Are you sure you want to delete your account? This action cannot be undone and all your data will be lost.`}),(0,m.jsxs)(P,{children:[(0,m.jsx)(c,{variant:`outline`,onClick:()=>J(!1),children:`Cancel`}),(0,m.jsx)(O,{onClick:async()=>{R(!0);try{await f.deleteUser(e.userId),n(),localStorage.removeItem(`user`),i(`/login`)}catch(e){console.error(`Failed to delete account`,e),alert(`Failed to delete account`),R(!1)}},disabled:L,children:L?`Deleting...`:`Delete Account`})]})]})})]})}export{L as default};