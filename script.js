// ★ここに GAS のウェブアプリURLを入れる
const API_URL = "https://script.google.com/macros/s/AKfycbwa2kQurZNeWX1SX2Al96Q8i5KfXFmDJiLKxuBqnd8BC36bMolx3pH5-fDLOM8yxEBz/exec";

// ★ここに LIFF ID を入れる
const LIFF_ID = "2011970419-FxNWlUsY";

let lineUserId = null;

// URLパラメータ取得（受付画面用）
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get("event");   // 初回登録では null、受付画面では値が入る

// 揺らぎ吸収（スペース・全角半角・Unicode正規化）
function normalize(str) {
  if (!str) return "";
  str = str.trim();
  str = str.replace(/[！-～]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
  str = str.replace(/\s+/g, "");
  str = str.normalize("NFC");
  return str;
}

// LIFF 初期化
async function initLiff() {

  await liff.init({ liffId: LIFF_ID });

  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }

  const profile = await liff.getProfile();
  lineUserId = profile.userId;

  // -------------------------
  // 画面判定（ここが今回の修正ポイント）
  // -------------------------
  if (eventId !== null && eventId !== "") {
    // 受付画面
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("checkinArea").style.display = "block";
    document.getElementById("userInfo").style.display = "block";
    document.getElementById("userInfo").innerText = `このLINEユーザーIDで受付します。`;

  } else {
    // 初回登録画面
    document.getElementById("registerForm").style.display = "block";
    document.getElementById("checkinArea").style.display = "none";
    document.getElementById("userInfo").style.display = "none";
  }
}

// DOM 読み込み後
document.addEventListener("DOMContentLoaded", () => {

  // -------------------------
  // 初回登録ボタン
  // -------------------------
  const registerBtn = document.getElementById("registerBtn");
  if (registerBtn) {
    registerBtn.onclick = async () => {

      if (!lineUserId) {
        alert("LINEログイン情報が取得できていません。");
        return;
      }

      const parentName = normalize(document.getElementById("parentName").value);
      const studentName = normalize(document.getElementById("studentName").value);
      const grade = normalize(document.getElementById("grade").value);
      const className = normalize(document.getElementById("className").value);

      if (!parentName || !studentName || !grade || !className) {
        document.getElementById("registerResult").innerText = "すべて入力してください。";
        return;
      }

      try {
        const res = await fetch(`${API_URL}?mode=register&lineId=${encodeURIComponent(lineUserId)}&parentName=${encodeURIComponent(parentName)}&studentName=${encodeURIComponent(studentName)}&grade=${encodeURIComponent(grade)}&className=${encodeURIComponent(className)}`);
        const result = await res.json();

        if (result.status === "ok") {
          document.getElementById("registerResult").innerText = "登録が完了しました。";
        } else {
          document.getElementById("registerResult").innerText = "登録に失敗しました。";
        }

      } catch (e) {
        console.error(e);
        document.getElementById("registerResult").innerText = "通信エラーが発生しました。";
      }
    };
  }

  // -------------------------
  // 受付ボタン
  // -------------------------
  const checkinBtn = document.getElementById("checkinBtn");
  if (checkinBtn) {
    checkinBtn.onclick = async () => {

      if (!lineUserId) {
        alert("LINEログイン情報が取得できていません。");
        return;
      }

      if (!eventId) {
        document.getElementById("checkinResult").innerText = "イベントIDがありません。QRコードが正しくありません。";
        return;
      }

      try {
        const res = await fetch(`${API_URL}?mode=checkin&lineId=${encodeURIComponent(lineUserId)}&eventId=${encodeURIComponent(eventId)}`);
        const result = await res.json();

        if (result.status === "ok") {
          document.getElementById("checkinResult").innerText = `受付完了しました（紐づく生徒 ${result.count} 件）。`;
        } else {
          document.getElementById("checkinResult").innerText = "受付に失敗しました。";
        }

      } catch (e) {
        console.error(e);
        document.getElementById("checkinResult").innerText = "通信エラーが発生しました。";
      }
    };
  }

  // LIFF 初期化開始
  initLiff();
});
