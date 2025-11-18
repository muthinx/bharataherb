const API = "https://script.google.com/macros/s/AKfycbwN4XtV43TzXHElEuuBrxO1k8sj5BTEqSeo1W8Bf_OEKYNs_1xsLyUExTPHEcPWAVuv/exec";

const kelasSelect = document.getElementById("kelasSelect");
const mapelSelect = document.getElementById("mapelSelect");
const tableContainer = document.getElementById("tableContainer");
const saveBtn = document.getElementById("saveBtn");

let currentData = [];

// =====================
// 1. Load metadata (kelas saja)
// =====================
async function loadMeta() {
  const res = await fetch(API + "?action=getMetaData");
  const data = await res.json();

  data.kelas.forEach(k => {
    let opt = document.createElement("option");
    opt.value = k;
    opt.textContent = k;
    kelasSelect.appendChild(opt);
  });
}

loadMeta();

// =====================
// 2. Saat kelas dipilih → ambil mapel khusus kelas itu
// =====================
kelasSelect.addEventListener("change", async () => {
  mapelSelect.innerHTML = `<option value="">Memuat...</option>`;
  mapelSelect.disabled = true;
  saveBtn.disabled = true;
  tableContainer.innerHTML = "";

  if (!kelasSelect.value) {
    mapelSelect.innerHTML = `<option value="">Pilih mapel</option>`;
    return;
  }

  const res = await fetch(API + `?action=getMapel&kelas=${kelasSelect.value}`);
  const { mapel } = await res.json();  // <-- INI FIX

  mapelSelect.innerHTML = `<option value="">Pilih mapel</option>`;
  mapel.forEach(m => {
    let opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    mapelSelect.appendChild(opt);
  });

  mapelSelect.disabled = false;
});

// =====================
// 3. Saat mapel dipilih → ambil nilai
// =====================
mapelSelect.addEventListener("change", async () => {
  if (!mapelSelect.value) {
    tableContainer.innerHTML = "";
    saveBtn.disabled = true;
    return;
  }

  const res = await fetch(
    API + `?action=getNilai&kelas=${kelasSelect.value}&mapel=${mapelSelect.value}`
  );

  currentData = await res.json();
  buildTable(currentData);

  saveBtn.disabled = false;
});

// =====================
// 4. Bangun tabel nilai
// =====================
function buildTable(arr) {
  let html = `<table>
    <tr><th>Nama</th><th>Nilai</th></tr>
  `;

  arr.forEach((x, i) => {
    html += `
      <tr>
        <td>${x.nama}</td>
        <td><input type="number" value="${x.nilai}" data-index="${i}" /></td>
      </tr>
    `;
  });

  html += "</table>";
  tableContainer.innerHTML = html;

  document.querySelectorAll("input").forEach(inp => {
    inp.oninput = () => {
      currentData[inp.dataset.index].nilai = inp.value;
    };
  });
}

// =====================
// 5. Simpan nilai
// =====================
saveBtn.addEventListener("click", async () => {
  const body = {
    action: "saveNilai",
    kelas: kelasSelect.value,
    mapel: mapelSelect.value,
    nilai: currentData.map(x => x.nilai)
  };

  const res = await fetch(API, {
    method: "POST",
    body: JSON.stringify(body)
  });

  const result = await res.json();
  alert(result.message || "Berhasil disimpan!");
});
