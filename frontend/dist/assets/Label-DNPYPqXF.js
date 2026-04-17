import{n as e,t}from"./jsx-runtime-Bg_NI1en.js";import{n,t as r}from"./index-BIILOEz8.js";var i=n.div`
  border-radius: var(--radius);
  border: none;
  background-color: var(--card);
  color: var(--card-foreground);
  box-shadow: var(--shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
`;n.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  padding-bottom: 0.5rem;
`,n.h3`
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
  margin-bottom: 0.5rem;
`,n.p`
  font-size: 0.95rem;
  color: var(--muted-foreground);
`;var a=n.div`
  padding: 2rem;
  padding-top: 1rem;
`;n.div`
  display: flex;
  align-items: center;
  padding: 2rem;
  padding-top: 0;
`,e();var o=t();function s({className:e=``,children:t}){return(0,o.jsx)(i,{className:e,children:t})}function c({className:e=``,children:t}){return(0,o.jsx)(a,{className:e,children:t})}var l=r`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
  font-size: 1rem;

  &:disabled {
    pointer-events: none;
    opacity: 0.6;
  }
`,u={default:r`
    background-color: var(--primary);
    color: var(--primary-foreground);
    box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39);

    &:hover:not(:disabled) {
      background-color: #1d4ed8;
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.23);
      transform: translateY(-1px);
    }
  `,destructive:r`
    background-color: var(--destructive);
    color: var(--destructive-foreground);
    box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.39);

    &:hover:not(:disabled) {
      background-color: #dc2626;
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.23);
      transform: translateY(-1px);
    }
  `,outline:r`
    border: 2px solid var(--input);
    background-color: transparent;
    color: var(--foreground);

    &:hover:not(:disabled) {
      background-color: var(--accent);
      border-color: var(--primary);
      color: var(--primary);
    }
  `,secondary:r`
    background-color: var(--secondary);
    color: var(--secondary-foreground);

    &:hover:not(:disabled) {
      background-color: #c7d2fe;
      transform: translateY(-1px);
    }
  `,ghost:r`
    background-color: transparent;
    color: var(--foreground);

    &:hover:not(:disabled) {
      background-color: var(--accent);
      color: var(--primary);
    }
  `,link:r`
    background-color: transparent;
    color: var(--primary);
    text-decoration: none;

    &:hover:not(:disabled) {
      color: #1e40af;
      text-decoration: underline;
    }
  `},d={default:r`
    height: 3rem;
    padding: 0 1.5rem;
  `,sm:r`
    height: 2.5rem;
    padding: 0 1rem;
    font-size: 0.875rem;
  `,lg:r`
    height: 3.5rem;
    padding: 0 2.5rem;
    font-size: 1.125rem;
  `,icon:r`
    height: 3rem;
    width: 3rem;
  `},f=n.button`
  ${l}
  ${({$variant:e=`default`})=>u[e]}
  ${({$size:e=`default`})=>d[e]}
  ${({$fullWidth:e})=>e&&r`
      width: 100%;
    `}
`;function p({children:e,variant:t=`default`,size:n=`default`,className:r=``,fullWidth:i=!1,...a}){return(0,o.jsx)(f,{$variant:t,$size:n,$fullWidth:i,className:r,...a,children:e})}var m=n.input`
  display: flex;
  height: 3.25rem;
  width: 100%;
  border-radius: 0.75rem;
  border: 1.5px solid var(--border);
  background-color: var(--background);
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  color: var(--foreground);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder {
    color: var(--muted-foreground);
  }

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 4px var(--ring);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    background-color: var(--muted);
  }
`;n.input`
  &::file-selector-button {
    border: 0;
    background: transparent;
    font-size: 0.875rem;
    font-weight: 500;
  }
`;function h({className:e=``,...t}){return(0,o.jsx)(m,{className:e,...t})}var g=n.label`
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;
  color: var(--foreground);
`,_=n.textarea`
  display: flex;
  min-height: 5rem;
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid var(--input);
  background-color: var(--background);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--foreground);
  font-family: inherit;

  &::placeholder {
    color: var(--muted-foreground);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--ring);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;function v({className:e=``,children:t,...n}){return(0,o.jsx)(g,{className:e,...n,children:t})}function y({className:e=``,...t}){return(0,o.jsx)(_,{className:e,...t})}export{s as a,p as i,y as n,c as o,h as r,v as t};