/* Data disimpan di localStorage browser. Stok = stok awal + total masuk - total keluar. */
const KEY = 'atk_db_v1';
const SEED = {
  items: [
    {id:'ATK001',nama:'Pensil 2B',kategori:'Alat Tulis',satuan:'Pcs',awal:40,min:10},
    {id:'ATK002',nama:'Pulpen Biru',kategori:'Alat Tulis',satuan:'Pcs',awal:80,min:20},
    {id:'ATK003',nama:'Pulpen Hitam',kategori:'Alat Tulis',satuan:'Pcs',awal:60,min:20},
    {id:'ATK004',nama:'Penghapus',kategori:'Alat Tulis',satuan:'Pcs',awal:30,min:10},
    {id:'ATK005',nama:'Penggaris 30 cm',kategori:'Alat Tulis',satuan:'Pcs',awal:25,min:8},
    {id:'ATK006',nama:'Buku Tulis 38 Lembar',kategori:'Buku',satuan:'Pcs',awal:45,min:15},
    {id:'ATK007',nama:'Kertas HVS A4',kategori:'Kertas',satuan:'Rim',awal:20,min:5},
    {id:'ATK008',nama:'Map Plastik',kategori:'Arsip',satuan:'Pcs',awal:35,min:10},
    {id:'ATK009',nama:'Stapler',kategori:'Perlengkapan',satuan:'Pcs',awal:12,min:4},
    {id:'ATK010',nama:'Isi Staples',kategori:'Perlengkapan',satuan:'Box',awal:18,min:5},
    {id:'ATK011',nama:'Lakban Bening',kategori:'Perlengkapan',satuan:'Roll',awal:15,min:5},
    {id:'ATK012',nama:'Spidol Whiteboard',kategori:'Alat Tulis',satuan:'Pcs',awal:22,min:8}
  ],
  masuk: [
    {tgl:'2026-10-26',id:'ATK007',jml:10,ket:'CV Maju Jaya'},
    {tgl:'2026-10-27',id:'ATK002',jml:20,ket:'Toko Sinar Pena'},
    {tgl:'2026-10-28',id:'ATK006',jml:15,ket:'CV Maju Jaya'},
    {tgl:'2026-10-29',id:'ATK012',jml:6,ket:'Toko Sinar Pena'}
  ],
  keluar: [
    {tgl:'2026-10-27',id:'ATK001',jml:5,ket:'Bagian Administrasi'},
    {tgl:'2026-10-27',id:'ATK009',jml:9,ket:'Bagian Keuangan'},
    {tgl:'2026-10-28',id:'ATK007',jml:8,ket:'Ruang Rapat'},
    {tgl:'2026-10-29',id:'ATK011',jml:11,ket:'Bagian Gudang'},
    {tgl:'2026-10-29',id:'ATK002',jml:12,ket:'Bagian Administrasi'}
  ]
};
function load(){try{const r=localStorage.getItem(KEY);if(r)return JSON.parse(r);}catch(e){}return JSON.parse(JSON.stringify(SEED));}
let db = load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}}
const $ = (s)=>document.querySelector(s);
const esc = s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = d=>d.split('-').reverse().join('-');
const today = ()=>new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
const sum = (arr,id,f=()=>true)=>arr.filter(x=>x.id===id&&f(x)).reduce((a,x)=>a+x.jml,0);
const stok = i=>i.awal+sum(db.masuk,i.id)-sum(db.keluar,i.id);
const status = i=>{const s=stok(i);return s<=0?['Habis','bad']:s<=i.min?['Menipis','warn']:['Aman',''];};
const badge = i=>{const [t,c]=status(i);return `<span class="badge ${c}">${t}</span>`;};
const nama = id=>{const i=db.items.find(x=>x.id===id);return i?i.nama:id;};
const byDate = (a,b)=>b.tgl.localeCompare(a.tgl);
const table = (head,rows,empty)=>rows.length?`<div class="tw"><table><thead><tr>${head}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`:`<p class="empty">${empty}</p>`;
function note(el,text,err){el.className='msg'+(err?' err':'');el.textContent=text;}
function opts(sel){sel.innerHTML=db.items.map(i=>`<option value="${i.id}">${i.id} - ${esc(i.nama)} (stok ${stok(i)} ${esc(i.satuan)})</option>`).join('');}

function sideInfo(){
  const el=$('#sideinfo'); if(!el)return;
  const total=db.items.reduce((a,i)=>a+stok(i),0), low=db.items.filter(i=>status(i)[1]).length;
  el.innerHTML=`<li><span>Jenis barang</span><b>${db.items.length}</b></li><li><span>Total stok</span><b>${total}</b></li><li><span>Stok menipis</span><b>${low}</b></li>`;
}
const lowRows = ()=>db.items.filter(i=>status(i)[1]).map(i=>`<tr><td>${i.id}</td><td>${esc(i.nama)}</td><td class="n">${stok(i)} ${esc(i.satuan)}</td><td class="n">${i.min}</td><td>${badge(i)}</td></tr>`);

const pages = {
  home(){
    const m=db.masuk.reduce((a,x)=>a+x.jml,0), k=db.keluar.reduce((a,x)=>a+x.jml,0), low=db.items.filter(i=>status(i)[1]).length;
    $('#stats').innerHTML=`<div class="card"><b>${db.items.length}</b>Jenis barang</div><div class="card"><b>${m}</b>Total barang masuk</div><div class="card"><b>${k}</b>Total barang keluar</div><div class="card warn"><b>${low}</b>Stok menipis</div>`;
    $('#low').innerHTML=table('<th>Kode</th><th>Nama Barang</th><th class="n">Stok</th><th class="n">Batas Min.</th><th>Status</th>',lowRows(),'Semua stok masih aman.');
  },
  barang(){
    const sel=$('#fkat'), draw=()=>{
      const k=sel.value, list=db.items.filter(i=>!k||i.kategori===k);
      $('#tb').innerHTML=table('<th>Kode</th><th>Nama Barang</th><th>Kategori</th><th>Satuan</th><th class="n">Stok</th><th class="n">Batas Min.</th><th>Status</th><th>Aksi</th>',
        list.map(i=>`<tr><td>${i.id}</td><td>${esc(i.nama)}</td><td>${esc(i.kategori)}</td><td>${esc(i.satuan)}</td><td class="n">${stok(i)}</td><td class="n">${i.min}</td><td>${badge(i)}</td><td><a class="btn sm" href="tambah-barang.html?id=${i.id}">Edit</a> <button class="btn sm del" data-del="${i.id}">Hapus</button></td></tr>`),'Belum ada barang. Klik Tambah Barang untuk mulai.');
    };
    const cats=[...new Set(db.items.map(i=>i.kategori))].sort();
    sel.innerHTML='<option value="">Semua kategori</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join('');
    sel.onchange=draw; draw();
    $('#tb').onclick=e=>{const id=e.target.dataset.del; if(id&&confirm('Hapus '+nama(id)+'?')){db.items=db.items.filter(i=>i.id!==id);db.masuk=db.masuk.filter(x=>x.id!==id);db.keluar=db.keluar.filter(x=>x.id!==id);save();sideInfo();pages.barang();}};
    $('#reset').onclick=()=>{if(confirm('Kembalikan semua data ke data contoh?')){try{localStorage.removeItem(KEY);}catch(e){}location.reload();}};
  },
  form(){
    const id=new URLSearchParams(location.search).get('id'), it=db.items.find(i=>i.id===id), f=$('#f');
    $('#dl').innerHTML=[...new Set(db.items.map(i=>i.kategori))].map(c=>`<option value="${esc(c)}">`).join('');
    if(it){$('#judul').textContent='Edit Barang';['nama','kategori','satuan','awal','min'].forEach(n=>f[n].value=it[n]);}
    f.onsubmit=e=>{
      e.preventDefault();
      const d={nama:f.nama.value.trim(),kategori:f.kategori.value.trim(),satuan:f.satuan.value,awal:+f.awal.value,min:+f.min.value};
      if(it)Object.assign(it,d);
      else{const n=Math.max(0,...db.items.map(i=>+i.id.slice(3)))+1;db.items.push({id:'ATK'+String(n).padStart(3,'0'),...d});}
      save();note($('#msg'),'Barang berhasil disimpan. Mengalihkan ke Data Barang...');
      setTimeout(()=>location.href='data-barang.html',900);
    };
  },
  kategori(){
    const cats=[...new Set(db.items.map(i=>i.kategori))].sort();
    $('#tb').innerHTML=table('<th>Kategori</th><th class="n">Jenis Barang</th><th class="n">Total Stok</th><th>Barang</th>',
      cats.map(c=>{const l=db.items.filter(i=>i.kategori===c);return `<tr><td>${esc(c)}</td><td class="n">${l.length}</td><td class="n">${l.reduce((a,i)=>a+stok(i),0)}</td><td style="white-space:normal">${l.map(i=>esc(i.nama)).join(', ')}</td></tr>`;}),'Belum ada kategori.');
  },
  mutasi(){
    const tipe=document.body.dataset.tipe, list=db[tipe], f=$('#f'), sel=$('#brg');
    f.tgl.value=today(); opts(sel);
    const draw=()=>{$('#tb').innerHTML=table(`<th>Tanggal</th><th>Kode</th><th>Nama Barang</th><th class="n">Jumlah</th><th>${tipe==='masuk'?'Supplier':'Keperluan'}</th>`,
      list.slice().sort(byDate).map(x=>`<tr><td>${fmt(x.tgl)}</td><td>${x.id}</td><td>${esc(nama(x.id))}</td><td class="n">${x.jml}</td><td>${esc(x.ket)}</td></tr>`),'Belum ada data.');};
    draw();
    f.onsubmit=e=>{
      e.preventDefault();
      const it=db.items.find(i=>i.id===sel.value), jml=+f.jml.value;
      if(!it)return note($('#msg'),'Pilih barang terlebih dahulu.',true);
      if(tipe==='keluar'&&jml>stok(it))return note($('#msg'),`Stok ${it.nama} hanya ${stok(it)} ${it.satuan}. Kurangi jumlah keluar.`,true);
      list.push({tgl:f.tgl.value,id:it.id,jml,ket:f.ket.value.trim()});
      save();sideInfo();draw();opts(sel);f.jml.value='';f.ket.value='';
      note($('#msg'),`${tipe==='masuk'?'Barang masuk':'Barang keluar'} tersimpan. Stok ${it.nama} sekarang ${stok(it)} ${it.satuan}.`);
    };
  },
  laporan(){
    const bln=$('#bln'); bln.value=today().slice(0,7);
    const draw=()=>{
      const p=bln.value, inP=x=>x.tgl.slice(0,7)===p, before=x=>x.tgl.slice(0,7)<p;
      let tm=0,tk=0;
      const rows=db.items.map(i=>{
        const aw=i.awal+sum(db.masuk,i.id,before)-sum(db.keluar,i.id,before), m=sum(db.masuk,i.id,inP), k=sum(db.keluar,i.id,inP), ak=aw+m-k; tm+=m;tk+=k;
        const [t,c]=ak<=0?['Habis','bad']:ak<=i.min?['Menipis','warn']:['Aman',''];
        return `<tr><td>${i.id}</td><td>${esc(i.nama)}</td><td class="n">${aw}</td><td class="n">${m}</td><td class="n">${k}</td><td class="n">${ak}</td><td><span class="badge ${c}">${t}</span></td></tr>`;});
      $('#sum').innerHTML=`<div class="card"><b>${db.items.length}</b>Jenis barang</div><div class="card"><b>${tm}</b>Masuk periode ini</div><div class="card"><b>${tk}</b>Keluar periode ini</div>`;
      $('#tb').innerHTML=table('<th>Kode</th><th>Nama Barang</th><th class="n">Stok Awal</th><th class="n">Masuk</th><th class="n">Keluar</th><th class="n">Stok Akhir</th><th>Status</th>',rows,'Belum ada data.');
    };
    bln.onchange=draw; draw();
    $('#cetak').onclick=()=>window.print();
  },
  cari(){
    const q=$('#q'), draw=()=>{
      const k=q.value.trim().toLowerCase(), l=db.items.filter(i=>!k||[i.id,i.nama,i.kategori].some(v=>v.toLowerCase().includes(k)));
      $('#hasil').textContent=k?`${l.length} barang ditemukan untuk "${q.value.trim()}"`:`Menampilkan semua ${l.length} barang`;
      $('#tb').innerHTML=table('<th>Kode</th><th>Nama Barang</th><th>Kategori</th><th class="n">Stok</th><th>Status</th>',
        l.map(i=>`<tr><td>${i.id}</td><td>${esc(i.nama)}</td><td>${esc(i.kategori)}</td><td class="n">${stok(i)} ${esc(i.satuan)}</td><td>${badge(i)}</td></tr>`),'Barang tidak ditemukan. Coba kata kunci lain, misalnya nama atau kategori.');
    };
    q.oninput=draw; draw();
  }
};
sideInfo();
(pages[document.body.dataset.page]||(()=>{}))();
