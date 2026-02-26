import{s as m}from"./supabaseClient-5h-f_Tei.js";import{i as p}from"./auth-C10oIzEU.js";import"./roles-BcTnPyVM.js";document.addEventListener("DOMContentLoaded",async()=>{await p();const i=document.getElementById("categoriesLoading"),o=document.getElementById("categoriesGrid"),r=document.getElementById("categoriesEmpty"),d=["bg-light","bg-secondary-subtle","bg-primary-subtle","bg-success-subtle","bg-info-subtle","bg-warning-subtle","bg-danger-subtle"];function l(s){const e=(s||"").toLowerCase();return e.includes("code")||e.includes("program")||e.includes("dev")?"bi-code-slash":e.includes("image")||e.includes("photo")||e.includes("design")?"bi-image":e.includes("write")||e.includes("content")||e.includes("story")?"bi-pencil-square":e.includes("analysis")||e.includes("research")?"bi-graph-up":"bi-folder2-open"}function u(s,e){const a=document.createElement("div");a.className="col";const c=encodeURIComponent(s.name),n=l(s.name),t=d[e%d.length];return a.innerHTML=`
      <a href="../explore/explore.html?category=${c}" class="text-decoration-none">
        <div class="card category-card h-100 shadow-sm border-0 ${t} text-dark">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <span class="fs-3 text-dark"><i class="bi ${n}"></i></span>
              <span class="badge text-bg-secondary">${s.count} prompts</span>
            </div>
            <h2 class="h5 mb-0 text-dark">${s.name}</h2>
          </div>
        </div>
      </a>
    `,a}async function g(){try{i.style.display="block",o.style.display="none",r.style.display="none";const{data:s,error:e}=await m.rpc("get_public_prompts_with_authors",{p_category_id:null});if(e)throw e;const a={};(s||[]).forEach(n=>{const t=(n.category_name||"Uncategorized").trim()||"Uncategorized";a[t]=(a[t]||0)+1});const c=Object.entries(a).map(([n,t])=>({name:n,count:t})).sort((n,t)=>t.count!==n.count?t.count-n.count:n.name.localeCompare(t.name));if(i.style.display="none",c.length===0){r.style.display="block";return}o.innerHTML="",c.forEach((n,t)=>{o.appendChild(u(n,t))}),o.style.display="flex"}catch(s){console.error("Error loading categories:",s.message),i.style.display="none",r.style.display="block",r.innerHTML=`
        <div class="card-body py-5 text-center text-muted">
          <p class="mb-0 text-danger">Failed to load categories.</p>
        </div>
      `}}await g()});
