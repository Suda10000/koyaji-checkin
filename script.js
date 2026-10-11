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

// 安全に innerText を設定する関数
function safeSet(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

// LIFF 初期化
async function initLiff() {

  safeSet("status", "LINEログインを確認中…");

  await liff.init({ liffId: LIFF_ID });

  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }

  const profile = await liff.getProfile();
  lineUserId = profile.userId;

  safeSet("status", `ログイン中：${profile.displayName}`);

  // -------------------------
  // ★画面判定（完全修正版）
  // eventId が「null」「空文字」「undefined」「liff.state」などの場合は初回登録扱い
  // -------------------------
  const isCheckin =
    eventId &&
    eventId.trim() !== "" &&
    eventId !== "null" &&
    eventId !== "undefined";

  if (isCheckin) {
    // 受付画面
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("checkinArea").style.display = "block";
    document.getElementById("userInfo").style.display = "block";
    safeSet("userInfo", `このLINEユーザーIDで受付します。`);

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
        safeSet("registerResult", "すべて入力してください。");
        return;
      }

      try {
        const res = await fetch(`${API_URL}?mode=register&lineId=${encodeURIComponent(lineUserId)}&parentName=${encodeURIComponent(parentName)}&studentName=${encodeURIComponent(studentName)}&grade=${encodeURIComponent(grade)}&className=${encodeURIComponent(className)}`);
        const result = await res.json();

        if (result.status === "ok") {
          safeSet("registerResult", "登録が完了しました。");
        } else {
          safeSet("registerResult", "登録に失敗しました。");
        }

      } catch (e) {
        console.error(e);
        safeSet("registerResult", "通信エラーが発生しました。");
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
        safeSet("checkinResult", "イベントIDがありません。QRコードが正しくありません。");
        return;
      }

      try {
        const res = await fetch(`${API_URL}?mode=checkin&lineId=${encodeURIComponent(lineUserId)}&eventId=${encodeURIComponent(eventId)}`);
        const result = await res.json();

        if (result.status === "ok") {
          safeSet("checkinResult", `受付完了しました（紐づく生徒 ${result.count} 件）。`);
        } else {
          safeSet("checkinResult", "受付に失敗しました。");
        }

      } catch (e) {
        console.error(e);
        safeSet("checkinResult", "通信エラーが発生しました。");
      }
    };
  }

  // LIFF 初期化開始
  initLiff();
});
