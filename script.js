const API = "https://script.google.com/macros/s/AKfycbwN4XtV43TzXHElEuuBrxO1k8sj5BTEqSeo1W8Bf_OEKYNs_1xsLyUExTPHEcPWAVuv/exec"; // ganti ini

const kelasSelect = document.getElementById("kelasSelect");
const mapelSelect = document.getElementById("mapelSelect");
const tableContainer = document.getElementById("tableContainer");
const saveBtn = document.getElementById("saveBtn");

let currentData = []; // untuk menyimpan nilai sementara

// =====================
// 1. Load Metadata
// =====================
async function loadMeta() {
  const res = await fetch(API + "?action=getMetaData");
  const data = await res.json();

  // isi dropdown kelas
  data.kelas.forEach(k => {
    let opt = document.createElement("option");
    opt.value = k;
    opt.textContent = k;
    kelasSelect.appendChild(opt);
  });

  // simpan mapel (tidak perlu fetch ulang)
  sessionStorage.setItem("mapelList", JSON.stringify(data.mapel));
}

loadMeta();


// =====================
// 2. Saat memilih kelas
// =====================
kelasSelect.addEventListener("change", () => {
  mapelSelect.innerHTML = `<option value="">Pilih mapel</option>`;

  if (!kelasSelect.value) {
    mapelSelect.disabled = true;
    saveBtn.disabled = true;
    tableContainer.innerHTML = "";
    return;
  }

  let mapel = JSON.parse(sessionStorage.getItem("mapelList"));
  mapel.forEach(m => {
    let opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    mapelSelect.appendChild(opt);
  });

  mapelSelect.disabled = false;
});


// =====================
// 3. Saat memilih mapel → ambil nilai
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
// 4. Bangun tabel input
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
      let i = inp.dataset.index;
      currentData[i].nilai = inp.value;
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
  function showPopup(message, color="#4caf50") {
  const popup = document.getElementById("popup");
  popup.textContent = message;
  popup.style.background = color;
  popup.style.display = "block";

  setTimeout(() => {
    popup.style.display = "none";
  }, 2000); // tampil 2 detik
}

// Contoh pemakaian saat save:
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
  showPopup(result.message || "Berhasil"); // ganti alert
});

});
