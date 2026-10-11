// ★ここに GAS のウェブアプリURLを入れる
const API_URL = "https://script.google.com/macros/s/AKfycbwa2kQurZNeWX1SX2Al96Q8i5KfXFmDJiLKxuBqnd8BC36bMolx3pH5-fDLOM8yxEBz/execc";

// ★ここに LIFF ID を入れる
const LIFF_ID = "2011970419-FxNWlUsY";

let lineUserId = null;

// 揺らぎ吸収（スペース・全角半角・Unicode正規化）
function normalize(str) {
  if (!str) return "";

  // 前後スペース除去
  str = str.trim();

  // 全角英数字→半角
  str = str.replace(/[！-～]/g, function(s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });

  // 半角スペースを全部除去
  str = str.replace(/\s+/g, "");

  // Unicode正規化
  str = str.normalize("NFC");

  return str;
}

// LIFF 初期化
async function initLiff() {
  document.getElementById("status").innerText = "LINEログインを確認中…";

  await liff.init({ liffId: LIFF_ID });

  if (!liff.isLoggedIn()) {
    liff.login();
    return;
  }

  const profile = await liff.getProfile();
  lineUserId = profile.userId;

  document.getElementById("status").innerText = `ログイン中：${profile.displayName}`;

  // ここでは「初回登録かどうか」を GAS に問い合わせず、
  // シンプルに「登録フォーム＋受付ボタン」を両方出す運用もあり。
  // とりあえず今回は「常に両方表示」しておく。
  document.getElementById("registerForm").style.display = "block";
  document.getElementById("checkinArea").style.display = "block";

  document.getElementById("userInfo").innerText = `このLINEユーザーIDで受付します。`;
}

// 登録ボタン押下
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("registerBtn").onclick = async () => {
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
      const res = await fetch(
        `${API_URL}?mode=register` +
        `&lineId=${encodeURIComponent(lineUserId)}` +
        `&parentName=${encodeURIComponent(parentName)}` +
        `&studentName=${encodeURIComponent(studentName)}` +
        `&grade=${encodeURIComponent(grade)}` +
        `&className=${encodeURIComponent(className)}`
      );
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

  // 受付ボタン押下
  document.getElementById("checkinBtn").onclick = async () => {
    if (!lineUserId) {
      alert("LINEログイン情報が取得できていません。");
      return;
    }

    // イベントIDは固定でも、URLパラメータでもOK
    const eventId = "EVENT_2024";

    try {
      const res = await fetch(
        `${API_URL}?mode=checkin` +
        `&lineId=${encodeURIComponent(lineUserId)}` +
        `&eventId=${encodeURIComponent(eventId)}`
      );
      const result = await res.json();

      if (result.status === "ok") {
        document.getElementById("checkinResult").innerText =
          `受付完了しました（紐づく生徒 ${result.count} 件）。`;
      } else {
        document.getElementById("checkinResult").innerText = "受付に失敗しました。";
      }
    } catch (e) {
      console.error(e);
      document.getElementById("checkinResult").innerText = "通信エラーが発生しました。";
    }
  };

  // LIFF 初期化開始
  initLiff();
});
