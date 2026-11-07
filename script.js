const $ = (id) => document.getElementById(id);
const read = (key, fallback=[]) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
let customers = read("pp_customers");
let quotations = read("pp_quotations");
let feedbackPhoto = null;
let itemCounter = 0;

function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove("show"),2400)}
function peso(value){return new Intl.NumberFormat("en-PH",{style:"currency",currency:"PHP"}).format(Number(value)||0)}
function showPage(name){
  document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===`page-${name}`));
  document.querySelectorAll(".nav-link[data-page]").forEach(b=>b.classList.toggle("active",b.dataset.page===name));
  $("sidebar").classList.remove("open");
  if(name==="dashboard") updateStats();
  if(name==="customers") renderCustomers();
  if(name==="saved") renderSaved();
  if(name==="quotation") updateQuotePreview();
  window.scrollTo({top:0,behavior:"smooth"});
}
document.addEventListener("click",e=>{const target=e.target.closest("[data-page]");if(target){e.preventDefault();showPage(target.dataset.page)}});
$("menuToggle").addEventListener("click",()=>$("sidebar").classList.toggle("open"));

function updateStats(){
  $("customerStat").textContent=customers.length;
  $("quotationStat").textContent=quotations.length;
  $("totalStat").textContent=peso(quotations.reduce((s,q)=>s+q.total,0));
  $("savedCount").textContent=quotations.length;
}
function renderCustomers(filter=""){
  const rows=$("customerRows");const list=customers.filter(c=>(c.name+" "+c.phone+" "+c.order).toLowerCase().includes(filter.toLowerCase()));
  rows.innerHTML=list.length?list.map(c=>`<tr><td><strong>${esc(c.name)}</strong></td><td>${esc(c.phone||"—")}</td><td>${esc(c.order||"—")}</td><td><span class="status-pill">${esc(c.status)}</span></td><td><button class="table-action" data-edit-customer="${c.id}">Edit</button><button class="table-action danger" data-delete-customer="${c.id}">Delete</button></td></tr>`).join(""):`<tr><td colspan="5" class="empty">No matching customer records.</td></tr>`;
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function openCustomer(c=null){
  $("customerForm").reset();$("customerId").value=c?.id||"";
  $("customerDialogTitle").textContent=c?"Edit customer":"Add customer";
  $("customerName").value=c?.name||"";$("customerPhone").value=c?.phone||"";$("customerOrder").value=c?.order||"";$("customerStatus").value=c?.status||"Inquiry";
  $("customerDialog").showModal();
}
$("addCustomerBtn").onclick=()=>openCustomer();
$("cancelCustomer").onclick=()=>$("customerDialog").close();
$("customerForm").addEventListener("submit",e=>{
  e.preventDefault();const id=$("customerId").value||String(Date.now());
  const item={id,name:$("customerName").value.trim(),phone:$("customerPhone").value.trim(),order:$("customerOrder").value.trim(),status:$("customerStatus").value};
  customers=customers.filter(c=>c.id!==id);customers.unshift(item);write("pp_customers",customers);$("customerDialog").close();renderCustomers($("customerSearch").value);updateStats();toast("Customer record saved.");
});
$("customerSearch").addEventListener("input",e=>renderCustomers(e.target.value));
$("customerRows").addEventListener("click",e=>{
  const edit=e.target.dataset.editCustomer,del=e.target.dataset.deleteCustomer;
  if(edit)openCustomer(customers.find(c=>c.id===edit));
  if(del&&confirm("Delete this customer record?")){customers=customers.filter(c=>c.id!==del);write("pp_customers",customers);renderCustomers($("customerSearch").value);updateStats();toast("Customer deleted.")}
});

function drawFeedback(){
  const canvas=$("feedbackCanvas"),ctx=canvas.getContext("2d"),W=1080,H=1080;
  ctx.fillStyle="#101923";ctx.fillRect(0,0,W,H);
  const grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,"#1d2b3b");grad.addColorStop(1,"#111923");ctx.fillStyle=grad;ctx.fillRect(28,28,W-56,H-56);
  ctx.strokeStyle="#f47b20";ctx.lineWidth=4;ctx.strokeRect(28,28,W-56,H-56);
  ctx.fillStyle="#ff831e";ctx.font="800 34px Manrope, sans-serif";ctx.fillText("PINOYPROTO 3D",78,112);
  ctx.fillStyle="#a9bfd5";ctx.font="500 20px 'DM Sans', sans-serif";ctx.fillText("CUSTOMER FEEDBACK",80,154);
  ctx.fillStyle="#f4f6f8";ctx.font="800 58px Manrope, sans-serif";ctx.fillText("Thank you for",78,245);ctx.fillText("trusting our work!",78,312);
  const photoX=80,photoY=365,photoW=920,photoH=390;
  ctx.fillStyle="#263647";roundRect(ctx,photoX,photoY,photoW,photoH,20);ctx.fill();
  if(feedbackPhoto){const scale=Math.max(photoW/feedbackPhoto.width,photoH/feedbackPhoto.height),sw=photoW/scale,sh=photoH/scale,sx=(feedbackPhoto.width-sw)/2,sy=(feedbackPhoto.height-sh)/2;ctx.save();roundRect(ctx,photoX,photoY,photoW,photoH,20);ctx.clip();ctx.drawImage(feedbackPhoto,sx,sy,sw,sh,photoX,photoY,photoW,photoH);ctx.restore()}
  else{ctx.fillStyle="#8fa4b8";ctx.textAlign="center";ctx.font="600 26px 'DM Sans'";ctx.fillText("YOUR PRODUCT PHOTO",540,565);ctx.font="18px 'DM Sans'";ctx.fillText("Upload an image to feature it here",540,605);ctx.textAlign="left"}
  const quote=($("feedbackText").value.trim()||"“Thank you for your support!”").replace(/[“”]/g,'"');
  ctx.fillStyle="#f5f7fa";ctx.font="italic 28px 'DM Sans'";wrapText(ctx,`“${quote}”`,80,820,900,42,4);
  const name=$("feedbackName").value.trim()||"Valued customer";const product=$("feedbackProduct").value.trim();
  ctx.fillStyle="#ff9a4b";ctx.font="700 25px 'DM Sans'";ctx.fillText(`— ${name}`,80,970);
  ctx.fillStyle="#a9bfd5";ctx.font="18px 'DM Sans'";if(product)ctx.fillText(product.slice(0,75),80,1008);
  ctx.fillStyle="#f47b20";ctx.font="700 18px 'DM Sans'";ctx.textAlign="right";ctx.fillText("MAKING IDEAS REAL.",1000,1010);ctx.textAlign="left";
}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function wrapText(ctx,text,x,y,maxWidth,lineHeight,maxLines){const words=text.split(/\s+/);let line="",lines=0;for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width>maxWidth&&line){ctx.fillText(line,x,y+lines*lineHeight);lines++;line=word;if(lines>=maxLines-1)break}else line=test}if(lines<maxLines){if(words.length&&ctx.measureText(line).width>maxWidth)line=line.slice(0,55)+"…";ctx.fillText(line,x,y+lines*lineHeight)}}
["feedbackName","feedbackText","feedbackProduct"].forEach(id=>$(id).addEventListener("input",drawFeedback));
$("feedbackImage").addEventListener("change",e=>{const file=e.target.files[0];if(!file)return;const img=new Image();img.onload=()=>{feedbackPhoto=img;drawFeedback()};img.src=URL.createObjectURL(file)});
$("renderFeedback").onclick=()=>{drawFeedback();toast("Preview updated.")};
$("downloadFeedback").onclick=()=>{drawFeedback();const a=document.createElement("a");a.download="pinoyproto-customer-feedback.png";a.href=$("feedbackCanvas").toDataURL("image/png");a.click()};

function addQuoteItem(item={description:"3D printing service",qty:1,grams:0,hours:0}){
  const id=++itemCounter,div=document.createElement("div");div.className="item-row";div.dataset.itemId=id;
  div.innerHTML=`<input class="item-desc" aria-label="Description" placeholder="Description" value="${esc(item.description)}"><input class="item-qty" aria-label="Qty" type="number" min="1" value="${item.qty}"><input class="item-grams" aria-label="Material grams" type="number" min="0" step=".1" placeholder="g" value="${item.grams}"><input class="item-hours" aria-label="Print hours" type="number" min="0" step=".1" placeholder="hrs" value="${item.hours||0}"><button class="remove-item" type="button" aria-label="Remove item">×</button>`;
  $("quoteItems").appendChild(div);div.querySelectorAll("input").forEach(i=>i.addEventListener("input",updateQuotePreview));div.querySelector(".remove-item").onclick=()=>{div.remove();updateQuotePreview()};updateQuotePreview();
}
function quoteData(){
  const items=[...$("quoteItems").querySelectorAll(".item-row")].map(row=>({description:row.querySelector(".item-desc").value,qty:Number(row.querySelector(".item-qty").value)||0,grams:Number(row.querySelector(".item-grams").value)||0,hours:Number(row.querySelector(".item-hours").value)||0}));
  const rate=Number($("materialRate").value)||0,time=Number($("timeRate").value)||0;
  const itemTotal=items.reduce((s,i)=>s+(i.grams*rate+i.hours*time)*i.qty,0),extra=Number($("extraCharges").value)||0,total=itemTotal+extra;
  return {number:$("quoteNumber").value,date:$("quoteDate").value,customer:$("quoteCustomer").value,contact:$("quoteContact").value,project:$("quoteProject").value,items,materialRate:rate,timeRate:time,extra,terms:$("quoteTerms").value,payment:$("paymentDetails").value,total,down:total*.5};
}
function updateQuotePreview(){
  const q=quoteData();$("pNumber").textContent=q.number||"—";$("pDate").textContent=q.date||"—";$("pCustomer").textContent=q.customer||"Customer name";$("pContact").textContent=q.contact||"Contact details";$("pProject").textContent=q.project||"Project title";
  $("paperItems").innerHTML=q.items.length?q.items.map(i=>`<tr><td>${esc(i.description||"Service")}</td><td>${i.qty}</td><td>${peso((i.grams*q.materialRate+i.hours*q.timeRate)*i.qty)}</td></tr>`).join(""):`<tr><td>3D printing / modeling service</td><td>1</td><td>${peso(0)}</td></tr>`;
  $("pExtra").textContent=peso(q.extra);$("pTotal").textContent=peso(q.total);$("pDown").textContent=peso(q.down);$("pTerms").textContent=q.terms||"—";$("pPayment").textContent=q.payment||"To be provided.";
}
function setDefaultQuote(){
  const now=new Date();$("quoteDate").value=new Date(now-now.getTimezoneOffset()*60000).toISOString().slice(0,10);
  $("quoteNumber").value="PP-"+String(quotations.length+1).padStart(4,"0");
  $("quoteItems").innerHTML="";addQuoteItem();
}
["quoteNumber","quoteDate","quoteCustomer","quoteContact","quoteProject","materialRate","timeRate","extraCharges","quoteTerms","paymentDetails"].forEach(id=>$(id).addEventListener("input",updateQuotePreview));
$("addItem").onclick=()=>addQuoteItem();
function printQuote(){updateQuotePreview();window.print()}
$("printQuote").onclick=printQuote;$("printQuoteTop").onclick=printQuote;
$("saveQuote").onclick=()=>{
  const q=quoteData();if(!q.customer.trim()){toast("Please enter the customer name.");$("quoteCustomer").focus();return}
  if(!q.items.length){toast("Please add at least one quotation item.");return}
  const saved={...q,id:String(Date.now()),savedAt:new Date().toISOString()};quotations.unshift(saved);write("pp_quotations",quotations);updateStats();toast("Quotation saved.");$("quoteNumber").value="PP-"+String(quotations.length+1).padStart(4,"0");updateQuotePreview();
};
function renderSaved(filter=""){
  const rows=$("savedRows"),list=quotations.filter(q=>(q.number+" "+q.customer+" "+q.project).toLowerCase().includes(filter.toLowerCase()));
  rows.innerHTML=list.length?list.map(q=>`<tr><td><strong>${esc(q.number)}</strong></td><td>${esc(q.customer)}</td><td>${esc(q.project||"—")}</td><td>${esc(q.date||"—")}</td><td>${peso(q.total)}</td><td><button class="table-action" data-load-quote="${q.id}">Load</button><button class="table-action danger" data-delete-quote="${q.id}">Delete</button></td></tr>`).join(""):`<tr><td colspan="6" class="empty">No matching quotations.</td></tr>`;
}
$("quoteSearch").addEventListener("input",e=>renderSaved(e.target.value));
$("savedRows").addEventListener("click",e=>{
  const load=e.target.dataset.loadQuote,del=e.target.dataset.deleteQuote;
  if(load){const q=quotations.find(x=>x.id===load);if(!q)return;showPage("quotation");$("quoteNumber").value=q.number;$("quoteDate").value=q.date;$("quoteCustomer").value=q.customer;$("quoteContact").value=q.contact;$("quoteProject").value=q.project;$("materialRate").value=q.materialRate;$("timeRate").value=q.timeRate;$("extraCharges").value=q.extra;$("quoteTerms").value=q.terms;$("paymentDetails").value=q.payment;$("quoteItems").innerHTML="";q.items.forEach(i=>addQuoteItem(i));updateQuotePreview();toast("Quotation loaded.");}
  if(del&&confirm("Delete this saved quotation?")){quotations=quotations.filter(q=>q.id!==del);write("pp_quotations",quotations);renderSaved($("quoteSearch").value);updateStats();toast("Quotation deleted.")}
});

setDefaultQuote();drawFeedback();updateStats();